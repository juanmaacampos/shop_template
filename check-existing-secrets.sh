#!/bin/bash

# 🔍 Script para verificar secretos existentes y evitar conflictos
# Muestra todos los secretos existentes y verifica si hay conflictos

echo "🔍 Verificando secretos existentes en Google Cloud..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuración
PROJECT_ID="cms-menu-7b4a4"
SECRET_PREFIX="SHOP_TEMPLATE_MP_"

echo -e "${BLUE}📋 Proyecto: $PROJECT_ID${NC}"
echo -e "${BLUE}📋 Prefijo de secretos para este proyecto: $SECRET_PREFIX${NC}"
echo ""

# Verificar si gcloud está configurado
if ! command -v gcloud >/dev/null 2>&1; then
    echo -e "${RED}❌ Google Cloud CLI no está instalado${NC}"
    echo "Instálalo ejecutando: ./setup-mercadopago-secrets.sh"
    exit 1
fi

# Verificar proyecto configurado
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️ Proyecto actual: $CURRENT_PROJECT${NC}"
    echo -e "${YELLOW}⚠️ Esperado: $PROJECT_ID${NC}"
    echo ""
    echo "Configurando proyecto correcto..."
    gcloud config set project $PROJECT_ID
fi

echo -e "${YELLOW}🔍 Listando todos los secretos existentes...${NC}"
echo ""

# Listar todos los secretos
ALL_SECRETS=$(gcloud secrets list --format="value(name)" 2>/dev/null)

if [ -z "$ALL_SECRETS" ]; then
    echo -e "${GREEN}✅ No hay secretos existentes en este proyecto${NC}"
    echo -e "${GREEN}✅ Puedes ejecutar el script de configuración sin problemas${NC}"
else
    echo -e "${BLUE}📋 Secretos existentes en el proyecto:${NC}"
    echo ""
    
    # Variables para rastrear conflictos
    has_conflicts=false
    our_secrets_exist=false
    
    while IFS= read -r secret; do
        if [[ $secret == *"MERCADOPAGO"* ]] || [[ $secret == *"MP_"* ]]; then
            if [[ $secret == "${SECRET_PREFIX}"* ]]; then
                echo -e "${GREEN}   ✅ $secret ${YELLOW}(nuestro proyecto)${NC}"
                our_secrets_exist=true
            else
                echo -e "${RED}   ⚠️ $secret ${YELLOW}(otro proyecto)${NC}"
                has_conflicts=true
            fi
        else
            echo -e "${BLUE}   📄 $secret${NC}"
        fi
    done <<< "$ALL_SECRETS"
    
    echo ""
    
    # Verificar secretos específicos que vamos a crear
    echo -e "${YELLOW}🔍 Verificando secretos específicos de este proyecto...${NC}"
    
    BUSINESS_ID="GLxQFeNBaXO7PFyYnTFlooFgJNl2"
    SECRET_NAME_BUSINESS="${SECRET_PREFIX}ACCESS_TOKEN_${BUSINESS_ID}"
    SECRET_NAME_GENERAL="${SECRET_PREFIX}ACCESS_TOKEN_GENERAL"
    
    if gcloud secrets describe $SECRET_NAME_BUSINESS >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ $SECRET_NAME_BUSINESS ya existe${NC}"
    else
        echo -e "${BLUE}   📝 $SECRET_NAME_BUSINESS se creará${NC}"
    fi
    
    if gcloud secrets describe $SECRET_NAME_GENERAL >/dev/null 2>&1; then
        echo -e "${GREEN}   ✅ $SECRET_NAME_GENERAL ya existe${NC}"
    else
        echo -e "${BLUE}   📝 $SECRET_NAME_GENERAL se creará${NC}"
    fi
    
    echo ""
    
    # Resumen
    if [ "$has_conflicts" = true ]; then
        echo -e "${YELLOW}⚠️ Hay secretos de MercadoPago de otros proyectos${NC}"
        echo -e "${GREEN}✅ PERO no hay conflicto porque usamos prefijos únicos${NC}"
        echo -e "${GREEN}✅ Nuestros secretos usan el prefijo: $SECRET_PREFIX${NC}"
    else
        echo -e "${GREEN}✅ No hay conflictos con otros proyectos${NC}"
    fi
    
    if [ "$our_secrets_exist" = true ]; then
        echo -e "${BLUE}📋 Algunos secretos de este proyecto ya existen${NC}"
        echo -e "${BLUE}📋 El script los actualizará automáticamente${NC}"
    fi
fi

echo ""
echo -e "${BLUE}🚀 Próximos pasos:${NC}"
echo "   1. Ejecutar: ./setup-mercadopago-secrets.sh"
echo "   2. El script usará nombres únicos para evitar conflictos"
echo "   3. Tus secretos existentes permanecerán intactos"
echo ""
echo -e "${GREEN}✅ Es seguro ejecutar el script de configuración${NC}"
