# Frida iOS IAP Toolkit 🚀

Un potente script de Frida diseñado para analizar, interceptar y manipular los flujos de compras dentro de la aplicación (In-App Purchases) en iOS. Este toolkit no solo permite simular compras exitosas para fines de prueba, sino que también ofrece un robusto sistema de monitoreo de red para inspeccionar la validación de recibos y otras comunicaciones relevantes.

---

## ✨ Características Principales

* **🔓 Bypass de IAP:** Simula automáticamente compras exitosas modificando el estado de las transacciones de StoreKit en tiempo real.
* **🛒 Intercepción de Pagos:** Detecta y registra cada vez que una aplicación intenta iniciar un nuevo pago a través de `SKPaymentQueue`.
* **🧾 Monitoreo de Transacciones:** Observa la cola de transacciones de forma activa para registrar el estado y el identificador de cada una.
* **🌐 Inspección de Red:** Intercepta y muestra los detalles de las solicitudes de red realizadas a través de `NSURLSession` y `NSURLConnection`, incluyendo:
    * URL de destino.
    * Cabeceras (Headers) HTTP completas.
    * Cuerpo (Body) de la solicitud.
* **🛡️ Diseño Seguro:** Utiliza un wrapper `SafeHook` y manejo de errores para garantizar que el script se ejecute de manera estable sin provocar cierres inesperados en la aplicación.
* **📝 Logging Detallado:** Emite mensajes claros y organizados en la consola, usando emojis para diferenciar fácilmente entre tipos de eventos (pagos, transacciones, red, etc.).

---

## 🔧 Requisitos

* Un dispositivo iOS con **Jailbreak**.
* **Frida** instalado en tu computadora y el servidor `frida-server` ejecutándose en el dispositivo.
* El **Bundle ID** de la aplicación que deseas analizar.

---

## ▶️ Modo de Uso

1.  **Obtén el Bundle ID** de la aplicación objetivo. Puedes usar herramientas como `frida-ps -Uai` para listar las aplicaciones instaladas y sus identificadores.

2.  **Ejecuta el script** con Frida, adjuntándolo a la aplicación. Puedes iniciar la aplicación desde cero o adjuntarlo a un proceso en ejecución.

    Para iniciar la aplicación con el script inyectado, usa el siguiente comando:
    ```bash
    frida -U -f com.ejemplo.bundleid -l iap_toolkit.js
    ```
    * Reemplaza `com.ejemplo.bundleid` con el Bundle ID de tu app.
    * Reemplaza `iap_toolkit.js` con el nombre de tu archivo de script.

3.  **Realiza una compra** dentro de la aplicación y observa la consola de Frida para ver la magia en acción.

---

## ⚙️ ¿Cómo Funciona?

El script se engancha (hooking) a varios métodos clave del framework `StoreKit` y de las APIs de red de iOS:

1.  **`SKPaymentTransaction`**: Se interceptan los métodos `-transactionState` y `-error` para forzar que cualquier transacción devuelva siempre un estado de `SKPaymentTransactionStatePurchased` (comprado) y un error nulo.
2.  **`SKPaymentQueue`**: Se engancha a `-addPayment:` para registrar el momento exacto en que se solicita una compra y el identificador del producto.
3.  **Monitoreo Activo**: Un `setInterval` revisa periódicamente la cola de transacciones (`SKPaymentQueue.defaultQueue().transactions()`) para detectar y registrar el estado de todas las transacciones pendientes o completadas.
4.  **`NSURLSession` / `NSURLConnection`**: Se interceptan los métodos que inician solicitudes de red para extraer y mostrar la URL, las cabeceras y el cuerpo, permitiendo analizar cómo la app valida los recibos de compra con sus servidores.

---

## 📄 Ejemplo de Salida en la Consola

Al ejecutar una compra en la app, verás un registro similar a este:

```log
🚀 StoreKit Hook Activado con Seguridad!
[🛠️] Hook Reemplazado: SKPaymentTransaction.- transactionState
[🛠️] Hook Reemplazado: SKPaymentTransaction.- error
[✅] Hook aplicado a -[SKPaymentQueue addPayment:]
[👂] Hooking persistente a -[NSURLSession dataTaskWithRequest:completionHandler:]
...

// El usuario presiona el botón de comprar
[🛒] Solicitud de Pago Detectada: monthly.subscription.premium

// El script simula la compra y la app intenta validar el recibo
[🌐] Solicitud de Red (NSURLSession): [https://api.mi-app.com/validate_receipt](https://api.mi-app.com/validate_receipt)
 -> Header: Content-Type = application/json
 -> Header: Authorization = Bearer sk_live_...
 -> Cuerpo de la Petición (NSURLSession): {"receipt-data":"ewo...J9","product_id":"monthly.subscription.premium"}

// La transacción aparece en la cola como "comprada"
[🧾] Transacción Detectada (Estado: Purchased): 1000000987654321








##⚠️ Descargo de Responsabilidad
Este script ha sido creado con fines educativos y de investigación de seguridad únicamente. Su propósito es ayudar a los desarrolladores y pentesters a entender y probar la seguridad de los flujos de IAP. No debe ser utilizado para la piratería o para obtener acceso no autorizado a contenido de pago. El mal uso de esta herramienta es responsabilidad exclusiva del usuario.


