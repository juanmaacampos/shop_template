#!/bin/bash

# 🔐 Script para configurar Access Token de MercadoPago en Google Cloud Secret Manager
# Este script automatiza la configuración necesaria para que las Cloud Functions procesen pagos

echo "🚀 Configurando MercadoPago Access Token en Google Cloud..."
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
PROJECT_ID="cms-menu-7b4a4"
BUSINESS_ID="GLxQFeNBaXO7PFyYnTFlooFgJNl2"
ACCESS_TOKEN="APP_USR-3065672713828930-061723-fdfcec44a3785138c46f6c01c54eeb6e-1174760230"
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

# Nombres únicos de secretos para este proyecto específico
SECRET_PREFIX="SHOP_TEMPLATE_MP_"

echo -e "${BLUE}📋 Configuración:${NC}"
echo "   • Proyecto: $PROJECT_ID"
echo "   • Business ID: $BUSINESS_ID"
echo "   • Service Account: $SERVICE_ACCOUNT"
echo ""

# Función para verificar si el comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 1. Verificar si gcloud está instalado
echo -e "${YELLOW}🔍 Verificando Google Cloud CLI...${NC}"
if ! command_exists gcloud; then
    echo -e "${RED}❌ Google Cloud CLI no está instalado.${NC}"
    echo ""
    echo -e "${BLUE}📥 Instalando Google Cloud CLI...${NC}"
    
    # Descargar e instalar gcloud
    curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-461.0.0-linux-x86_64.tar.gz
    tar -xf google-cloud-cli-461.0.0-linux-x86_64.tar.gz
    ./google-cloud-sdk/install.sh --quiet
    
    # Agregar al PATH
    export PATH="$HOME/google-cloud-sdk/bin:$PATH"
    
    echo -e "${GREEN}✅ Google Cloud CLI instalado${NC}"
else
    echo -e "${GREEN}✅ Google Cloud CLI ya está instalado${NC}"
fi

echo ""

# 2. Autenticación
echo -e "${YELLOW}🔐 Configurando autenticación...${NC}"
echo "   Por favor, sigue las instrucciones en el navegador para autenticarte."
gcloud auth login

# Configurar proyecto
echo -e "${YELLOW}⚙️ Configurando proyecto...${NC}"
gcloud config set project $PROJECT_ID

# Verificar autenticación
echo -e "${YELLOW}🔍 Verificando configuración...${NC}"
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${RED}❌ Error: Proyecto no configurado correctamente${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Proyecto configurado: $CURRENT_PROJECT${NC}"
echo ""

# 3. Habilitar APIs necesarias
echo -e "${YELLOW}🔧 Habilitando APIs necesarias...${NC}"
gcloud services enable secretmanager.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
echo -e "${GREEN}✅ APIs habilitadas${NC}"
echo ""

# 4. Crear secrets específicos para cada business
SECRET_NAME_BUSINESS="${SECRET_PREFIX}ACCESS_TOKEN_${BUSINESS_ID}"
SECRET_NAME_GENERAL="${SECRET_PREFIX}ACCESS_TOKEN_GENERAL"

echo -e "${YELLOW}🔐 Creando secrets en Secret Manager...${NC}"

# Secret específico para el business
echo -e "   • Creando secret para business: $SECRET_NAME_BUSINESS"
if gcloud secrets describe $SECRET_NAME_BUSINESS >/dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️ Secret ya existe, actualizando...${NC}"
    echo -n "$ACCESS_TOKEN" | gcloud secrets versions add $SECRET_NAME_BUSINESS --data-file=-
else
    echo -n "$ACCESS_TOKEN" | gcloud secrets create $SECRET_NAME_BUSINESS --data-file=-
fi

# Secret general (fallback)
echo -e "   • Creando secret general: $SECRET_NAME_GENERAL"
if gcloud secrets describe $SECRET_NAME_GENERAL >/dev/null 2>&1; then
    echo -e "${YELLOW}   ⚠️ Secret ya existe, actualizando...${NC}"
    echo -n "$ACCESS_TOKEN" | gcloud secrets versions add $SECRET_NAME_GENERAL --data-file=-
else
    echo -n "$ACCESS_TOKEN" | gcloud secrets create $SECRET_NAME_GENERAL --data-file=-
fi

echo -e "${GREEN}✅ Secrets creados correctamente${NC}"
echo ""

# 5. Configurar permisos para Cloud Functions
echo -e "${YELLOW}🔑 Configurando permisos para Cloud Functions...${NC}"

# Permisos para el secret específico del business
echo -e "   • Configurando permisos para: $SECRET_NAME_BUSINESS"
gcloud secrets add-iam-policy-binding $SECRET_NAME_BUSINESS \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

# Permisos para el secret general
echo -e "   • Configurando permisos para: $SECRET_NAME_GENERAL"
gcloud secrets add-iam-policy-binding $SECRET_NAME_GENERAL \
    --member="serviceAccount:$SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor"

echo -e "${GREEN}✅ Permisos configurados correctamente${NC}"
echo ""

# 6. Verificar configuración
echo -e "${YELLOW}🔍 Verificando configuración...${NC}"

# Verificar que los secrets existen
if gcloud secrets describe $SECRET_NAME_BUSINESS >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Secret business: $SECRET_NAME_BUSINESS${NC}"
else
    echo -e "${RED}   ❌ Error: Secret business no encontrado${NC}"
fi

if gcloud secrets describe $SECRET_NAME_GENERAL >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Secret general: $SECRET_NAME_GENERAL${NC}"
else
    echo -e "${RED}   ❌ Error: Secret general no encontrado${NC}"
fi

echo ""

# 7. Desplegar Cloud Functions
echo -e "${YELLOW}🚀 Desplegando Cloud Functions...${NC}"
echo "   Este proceso puede tomar varios minutos..."

# Cambiar al directorio functions
cd functions

# Desplegar functions
if npm install && firebase deploy --only functions; then
    echo -e "${GREEN}✅ Cloud Functions desplegadas correctamente${NC}"
else
    echo -e "${RED}❌ Error al desplegar Cloud Functions${NC}"
    echo -e "${YELLOW}💡 Intenta ejecutar manualmente:${NC}"
    echo "   cd functions"
    echo "   npm install"
    echo "   firebase deploy --only functions"
fi

echo ""

# 8. Resumen final
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo -e "${BLUE}📋 Resumen de lo configurado:${NC}"
echo "   ✅ Google Cloud CLI instalado y configurado"
echo "   ✅ APIs habilitadas (Secret Manager, Cloud Functions)"
echo "   ✅ Secrets creados:"
echo "      • $SECRET_NAME_BUSINESS"
echo "      • $SECRET_NAME_GENERAL"
echo "   ✅ Permisos configurados para Cloud Functions"
echo "   ✅ Cloud Functions desplegadas"
echo ""
echo -e "${GREEN}🚀 Tu sistema de pagos ya está listo para funcionar!${NC}"
echo ""
echo -e "${BLUE}🔗 URLs importantes:${NC}"
echo "   • Cloud Functions: https://console.cloud.google.com/functions/list?project=$PROJECT_ID"
echo "   • Secret Manager: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo "   • Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo ""
echo -e "${YELLOW}📝 Próximos pasos:${NC}"
echo "   1. Probar un pago en tu aplicación"
echo "   2. Verificar logs en Firebase Console"
echo "   3. ¡Empezar a recibir pagos! 💰"
echo ""
