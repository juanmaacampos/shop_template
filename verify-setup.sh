#!/bin/bash

# 🔍 Script de Verificación - MercadoPago + Google Cloud Setup
# Verifica que toda la configuración esté correcta

echo "🔍 Verificando configuración de MercadoPago + Google Cloud..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
PROJECT_ID="cms-menu-7b4a4"
BUSINESS_ID="GLxQFeNBaXO7PFyYnTFlooFgJNl2"
SECRET_PREFIX="SHOP_TEMPLATE_MP_"
SECRET_NAME_BUSINESS="${SECRET_PREFIX}ACCESS_TOKEN_${BUSINESS_ID}"
SECRET_NAME_GENERAL="${SECRET_PREFIX}ACCESS_TOKEN_GENERAL"

errors=0
warnings=0

echo -e "${BLUE}📋 Verificando configuración para:${NC}"
echo "   • Proyecto: $PROJECT_ID"
echo "   • Business ID: $BUSINESS_ID"
echo ""

# 1. Verificar Google Cloud CLI
echo -e "${YELLOW}🔍 1. Verificando Google Cloud CLI...${NC}"
if command -v gcloud >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Google Cloud CLI está instalado${NC}"
    
    # Verificar autenticación
    CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
    if [ "$CURRENT_PROJECT" = "$PROJECT_ID" ]; then
        echo -e "${GREEN}   ✅ Proyecto configurado correctamente: $CURRENT_PROJECT${NC}"
    else
        echo -e "${RED}   ❌ Proyecto incorrecto. Actual: $CURRENT_PROJECT, Esperado: $PROJECT_ID${NC}"
        ((errors++))
    fi
else
    echo -e "${RED}   ❌ Google Cloud CLI no está instalado${NC}"
    ((errors++))
fi
echo ""

# 2. Verificar APIs habilitadas
echo -e "${YELLOW}🔍 2. Verificando APIs habilitadas...${NC}"
if gcloud services list --enabled --filter="name:secretmanager.googleapis.com" --format="value(name)" | grep -q secretmanager; then
    echo -e "${GREEN}   ✅ Secret Manager API habilitada${NC}"
else
    echo -e "${RED}   ❌ Secret Manager API no habilitada${NC}"
    ((errors++))
fi

if gcloud services list --enabled --filter="name:cloudfunctions.googleapis.com" --format="value(name)" | grep -q cloudfunctions; then
    echo -e "${GREEN}   ✅ Cloud Functions API habilitada${NC}"
else
    echo -e "${RED}   ❌ Cloud Functions API no habilitada${NC}"
    ((errors++))
fi
echo ""

# 3. Verificar Secrets
echo -e "${YELLOW}🔍 3. Verificando Secrets en Secret Manager...${NC}"

# Secret específico del business
if gcloud secrets describe $SECRET_NAME_BUSINESS >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Secret business existe: $SECRET_NAME_BUSINESS${NC}"
    
    # Verificar permisos
    if gcloud secrets get-iam-policy $SECRET_NAME_BUSINESS --flatten="bindings[].members[]" --format="table(bindings.role)" --filter="bindings.members:cms-menu-7b4a4@appspot.gserviceaccount.com" | grep -q secretmanager.secretAccessor; then
        echo -e "${GREEN}   ✅ Permisos configurados para secret business${NC}"
    else
        echo -e "${RED}   ❌ Faltan permisos para secret business${NC}"
        ((errors++))
    fi
else
    echo -e "${RED}   ❌ Secret business no existe: $SECRET_NAME_BUSINESS${NC}"
    ((errors++))
fi

# Secret general
if gcloud secrets describe $SECRET_NAME_GENERAL >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Secret general existe: $SECRET_NAME_GENERAL${NC}"
    
    # Verificar permisos
    if gcloud secrets get-iam-policy $SECRET_NAME_GENERAL --flatten="bindings[].members[]" --format="table(bindings.role)" --filter="bindings.members:cms-menu-7b4a4@appspot.gserviceaccount.com" | grep -q secretmanager.secretAccessor; then
        echo -e "${GREEN}   ✅ Permisos configurados para secret general${NC}"
    else
        echo -e "${RED}   ❌ Faltan permisos para secret general${NC}"
        ((errors++))
    fi
else
    echo -e "${YELLOW}   ⚠️ Secret general no existe: $SECRET_NAME_GENERAL${NC}"
    ((warnings++))
fi
echo ""

# 4. Verificar Cloud Functions
echo -e "${YELLOW}🔍 4. Verificando Cloud Functions...${NC}"

# Verificar si las functions están desplegadas
if gcloud functions describe createMercadoPagoPreference --region=us-central1 >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Cloud Function 'createMercadoPagoPreference' desplegada${NC}"
else
    echo -e "${RED}   ❌ Cloud Function 'createMercadoPagoPreference' no encontrada${NC}"
    ((errors++))
fi

if gcloud functions describe mercadoPagoWebhookV2 --region=us-central1 >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Cloud Function 'mercadoPagoWebhookV2' desplegada${NC}"
else
    echo -e "${RED}   ❌ Cloud Function 'mercadoPagoWebhookV2' no encontrada${NC}"
    ((errors++))
fi

if gcloud functions describe createMercadoPagoPreferenceHTTP --region=us-central1 >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Cloud Function 'createMercadoPagoPreferenceHTTP' desplegada${NC}"
else
    echo -e "${YELLOW}   ⚠️ Cloud Function 'createMercadoPagoPreferenceHTTP' no encontrada${NC}"
    ((warnings++))
fi
echo ""

# 5. Verificar archivo config.js
echo -e "${YELLOW}🔍 5. Verificando configuración local...${NC}"

if [ -f "src/cms-menu/config.js" ]; then
    echo -e "${GREEN}   ✅ Archivo config.js encontrado${NC}"
    
    # Verificar que no tenga placeholders
    if grep -q "YOUR_" src/cms-menu/config.js; then
        echo -e "${RED}   ❌ config.js contiene placeholders sin configurar${NC}"
        ((errors++))
    else
        echo -e "${GREEN}   ✅ config.js parece estar configurado correctamente${NC}"
    fi
    
    # Verificar Business ID
    if grep -q "$BUSINESS_ID" src/cms-menu/config.js; then
        echo -e "${GREEN}   ✅ Business ID correcto en config.js${NC}"
    else
        echo -e "${RED}   ❌ Business ID no coincide en config.js${NC}"
        ((errors++))
    fi
else
    echo -e "${RED}   ❌ Archivo config.js no encontrado${NC}"
    ((errors++))
fi
echo ""

# 6. Verificar Firebase
echo -e "${YELLOW}🔍 6. Verificando Firebase...${NC}"

if command -v firebase >/dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Firebase CLI está instalado${NC}"
else
    echo -e "${RED}   ❌ Firebase CLI no está instalado${NC}"
    ((errors++))
fi

if [ -f "firebase.json" ]; then
    echo -e "${GREEN}   ✅ firebase.json encontrado${NC}"
else
    echo -e "${RED}   ❌ firebase.json no encontrado${NC}"
    ((errors++))
fi

if [ -f "functions/package.json" ]; then
    echo -e "${GREEN}   ✅ functions/package.json encontrado${NC}"
else
    echo -e "${RED}   ❌ functions/package.json no encontrado${NC}"
    ((errors++))
fi
echo ""

# Resumen final
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "=========================="

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 ¡TODO CONFIGURADO CORRECTAMENTE!${NC}"
    echo ""
    echo -e "${GREEN}✅ Tu sistema de pagos está listo para funcionar${NC}"
    echo ""
    echo -e "${BLUE}🚀 Próximos pasos:${NC}"
    echo "   1. Probar un pago en tu aplicación"
    echo "   2. Verificar que funciona el checkout"
    echo "   3. Revisar logs si hay problemas: firebase functions:log"
else
    echo -e "${RED}❌ SE ENCONTRARON $errors ERRORES${NC}"
    echo ""
    echo -e "${YELLOW}🔧 Para corregir los errores:${NC}"
    echo "   1. Ejecuta: ./setup-mercadopago-secrets.sh"
    echo "   2. O sigue la guía manual en: GUIA_GOOGLE_CLOUD_SETUP.md"
fi

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠️ $warnings advertencias (no críticas)${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Enlaces útiles:${NC}"
echo "   • Secret Manager: https://console.cloud.google.com/security/secret-manager?project=$PROJECT_ID"
echo "   • Cloud Functions: https://console.cloud.google.com/functions/list?project=$PROJECT_ID"
echo "   • Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
echo ""

exit $errors
