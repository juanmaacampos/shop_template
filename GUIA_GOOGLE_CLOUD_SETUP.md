# 🔐 Configuración de MercadoPago con Google Cloud Secret Manager

## 📋 ¿Por qué necesitas esto?

Tu aplicación tiene **Cloud Functions** que procesan los pagos de MercadoPago. Estas functions necesitan tu **Access Token** para comunicarse con la API de MercadoPago, pero por seguridad, no podemos poner el token directamente en el código.

**Google Cloud Secret Manager** es la solución segura para almacenar credenciales.

## 🚀 Opción 1: Script Automático (Recomendado)

He creado un script que automatiza todo el proceso:

```bash
cd /home/juanmaa/Desktop/templates\ resto-shop/shop-MP/
./setup-mercadopago-secrets.sh
```

El script:
- ✅ Instala Google Cloud CLI si no lo tienes
- ✅ Te ayuda con la autenticación 
- ✅ Habilita las APIs necesarias
- ✅ Crea los secrets con tu Access Token
- ✅ Configura los permisos
- ✅ Despliega las Cloud Functions

## 🔧 Opción 2: Manual (si prefieres hacerlo paso a paso)

### Paso 1: Instalar Google Cloud CLI

```bash
# Descargar
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-461.0.0-linux-x86_64.tar.gz

# Extraer
tar -xf google-cloud-cli-461.0.0-linux-x86_64.tar.gz

# Instalar
./google-cloud-sdk/install.sh

# Reiniciar terminal o ejecutar:
export PATH="$HOME/google-cloud-sdk/bin:$PATH"
```

### Paso 2: Autenticarse

```bash
# Autenticarse con tu cuenta de Google
gcloud auth login

# Configurar el proyecto
gcloud config set project cms-menu-7b4a4
```

### Paso 3: Habilitar APIs

```bash
# Habilitar Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Habilitar Cloud Functions API  
gcloud services enable cloudfunctions.googleapis.com
```

### Paso 4: Crear los Secrets

```bash
# Secret específico para tu business (con prefijo único)
echo -n "APP_USR-3065672713828930-061723-fdfcec44a3785138c46f6c01c54eeb6e-1174760230" | \
gcloud secrets create SHOP_TEMPLATE_MP_ACCESS_TOKEN_GLxQFeNBaXO7PFyYnTFlooFgJNl2 --data-file=-

# Secret general (fallback)
echo -n "APP_USR-3065672713828930-061723-fdfcec44a3785138c46f6c01c54eeb6e-1174760230" | \
gcloud secrets create SHOP_TEMPLATE_MP_ACCESS_TOKEN_GENERAL --data-file=-
```

### Paso 5: Configurar Permisos

```bash
# Dar permisos a Cloud Functions para acceder al secret específico
gcloud secrets add-iam-policy-binding SHOP_TEMPLATE_MP_ACCESS_TOKEN_GLxQFeNBaXO7PFyYnTFlooFgJNl2 \
  --member="serviceAccount:cms-menu-7b4a4@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Dar permisos para el secret general
gcloud secrets add-iam-policy-binding SHOP_TEMPLATE_MP_ACCESS_TOKEN_GENERAL \
  --member="serviceAccount:cms-menu-7b4a4@appspot.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### Paso 6: Desplegar Cloud Functions

```bash
# Ir al directorio functions
cd functions

# Instalar dependencias
npm install

# Desplegar
firebase deploy --only functions
```

## 🔍 Verificar que Todo Funciona

### 1. Verificar Secrets en Google Cloud Console:
```
https://console.cloud.google.com/security/secret-manager?project=cms-menu-7b4a4
```

### 2. Verificar Cloud Functions:
```
https://console.cloud.google.com/functions/list?project=cms-menu-7b4a4
```

### 3. Probar un pago:
- Ve a tu aplicación
- Agrega productos al carrito
- Haz checkout con MercadoPago
- Debería redirigirte a MercadoPago

### 4. Ver logs en tiempo real:
```bash
firebase functions:log --only createMercadoPagoPreference
```

## 🆘 Solución de Problemas

### Error: "gcloud: command not found"
- Ejecuta el script automático, instala gcloud automáticamente

### Error: "Permission denied"
- Verifica que hayas ejecutado `gcloud auth login`
- Asegúrate de tener permisos en el proyecto

### Error: "Secret already exists"
- Si el secret ya existe, usa `versions add` en lugar de `create`:
```bash
echo -n "TU_ACCESS_TOKEN" | gcloud secrets versions add NOMBRE_SECRET --data-file=-
```

### Error: "Cloud Functions deployment failed"
- Verifica que tengas Firebase CLI instalado: `npm install -g firebase-tools`
- Haz login en Firebase: `firebase login`

## 🎯 ¿Qué Hace Cada Secret?

1. **SHOP_TEMPLATE_MP_ACCESS_TOKEN_GLxQFeNBaXO7PFyYnTFlooFgJNl2**
   - Secret específico para tu business ID
   - Las Cloud Functions lo buscan primero

2. **SHOP_TEMPLATE_MP_ACCESS_TOKEN_GENERAL**
   - Secret de respaldo/general
   - Se usa si no existe el específico

## ✅ Resultado Final

Una vez configurado correctamente:
- ✅ Los pagos funcionarán automáticamente
- ✅ Tu Access Token estará seguro en Secret Manager
- ✅ Las Cloud Functions podrán procesar pagos
- ✅ Recibirás notificaciones de pago en tiempo real

## 🚀 ¡Ejecuta el Script!

La forma más fácil es ejecutar el script automático:

```bash
./setup-mercadopago-secrets.sh
```

El script te guiará paso a paso y configurará todo automáticamente. 🎉
