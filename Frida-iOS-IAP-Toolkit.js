if (ObjC.classes.SKPaymentQueue) {
    console.log("🚀 StoreKit Hook Activado con Seguridad!");

    const SKPaymentTransaction = ObjC.classes.SKPaymentTransaction;
    const SKPaymentQueue = ObjC.classes.SKPaymentQueue;
    const NSURLSession = ObjC.classes.NSURLSession;
    const NSURLConnection = ObjC.classes.NSURLConnection;
    const NSNotificationCenter = ObjC.classes.NSNotificationCenter.defaultCenter();
    const NSString = ObjC.classes.NSString;
    const NSURLRequest = ObjC.classes.NSURLRequest;
    const NSData = ObjC.classes.NSData;

    // ------------------------------------------------------------------------
    // 1. Hooks Seguros para Propiedades Críticas de SKPaymentTransaction
    // ------------------------------------------------------------------------

    const transactionStateHook = new NativeCallback(function(self) {
        return 1; // SKPaymentTransactionStatePurchased
    }, 'int', ['pointer']);
    SafeHook(SKPaymentTransaction, '- transactionState', transactionStateHook);
    console.log("[✅] Hook aplicado a -[SKPaymentTransaction transactionState]");

    const errorHook = new NativeCallback(function(self) {
        return NULL;
    }, 'pointer', ['pointer']);
    SafeHook(SKPaymentTransaction, '- error', errorHook);
    console.log("[✅] Hook aplicado a -[SKPaymentTransaction error]");

    // ------------------------------------------------------------------------
    // 2. Hook Seguro para el Método addPayment: de SKPaymentQueue
    // ------------------------------------------------------------------------

    Interceptor.attach(SKPaymentQueue['- addPayment:'].implementation, {
        onEnter: function(args) {
            try {
                this.payment = new ObjC.Object(args[2]);
                this.productId = this.payment.productIdentifier().toString();
                console.log(`[🛒] Solicitud de Pago Detectada: ${this.productId}`);
            } catch (e) {
                console.error(`[⚠️] Error al procesar solicitud de pago: ${e.message}`);
            }
        },
        onLeave: function(retval) {
            // No intentaremos acceder a la transacción inmediatamente aquí
        }
    });
    console.log("[✅] Hook aplicado a -[SKPaymentQueue addPayment:]");

    // ------------------------------------------------------------------------
    // 3. Monitoreo Activo de Transacciones (Con Identificador)
    // ------------------------------------------------------------------------

    function monitorTransactions() {
        try {
            const queue = SKPaymentQueue.defaultQueue();
            const transactions = queue.transactions();
            if (transactions.count() > 0) {
                for (let i = 0; i < transactions.count(); i++) {
                    const transaction = transactions.objectAtIndex_(i);
                    const transactionIdentifier = transaction.transactionIdentifier() ? new ObjC.Object(transaction.transactionIdentifier()).toString() : 'N/A';
                    const transactionState = transaction.transactionState();
                    const stateString = ['Purchasing', 'Purchased', 'Failed', 'Restored', 'Deferred'][transactionState] || 'Unknown';
                    console.log(`[🧾] Transacción Detectada (Estado: ${stateString}): ${transactionIdentifier}`);
                }
            }
        } catch (e) {
            console.error(`[🔥] Error al Monitorear Transacciones: ${e.message}`);
        }
    }

    setInterval(monitorTransactions, 2000);

    // ------------------------------------------------------------------------
    // 4. Hooking de Solicitudes de Red (Con Inspección del Cuerpo Segura y Headers)
    // ------------------------------------------------------------------------

    // a) Hooking a NSURLSession
    if (NSURLSession && NSURLSession['- dataTaskWithRequest:completionHandler:']) {
        Interceptor.attach(NSURLSession['- dataTaskWithRequest:completionHandler:'].implementation, {
            onEnter: function(args) {
                try {
                    const request = new ObjC.Object(args[2]);
                    const url = request.URL() ? request.URL().absoluteString().toString() : null;
                    if (url) {
                        console.log(`[🌐] Solicitud de Red (NSURLSession): ${url}`);

                        const headers = request.allHTTPHeaderFields();
                        if (headers) {
                            const headerKeys = headers.allKeys();
                            for (let i = 0; i < headerKeys.count(); i++) {
                                const key = headerKeys.objectAtIndex_(i).toString();
                                const value = headers.objectForKey_(key).toString();
                                console.log(`  -> Header: ${key} = ${value}`);
                            }
                        }

                        const httpBody = request.HTTPBody();
                        if (httpBody && httpBody.isKindOfClass_(NSData)) {
                            const bodyString = httpBody.toString('utf8');
                            console.log(`  -> Cuerpo de la Petición (NSURLSession): ${bodyString}`);
                        } else if (httpBody) {
                            console.log(`  -> Cuerpo de la Petición (NSURLSession): <No es NSData>`);
                        }
                    }
                } catch (e) {
                    console.error(`[⚠️] Error al inspeccionar la solicitud de NSURLSession: ${e.message}`);
                }
            }
        });
        console.log("[👂] Hooking persistente a -[NSURLSession dataTaskWithRequest:completionHandler:]");
    }

    // b) Hooking a NSURLConnection
    if (NSURLConnection && NSURLConnection['- initWithRequest:delegate:startImmediately:']) {
        Interceptor.attach(NSURLConnection['- initWithRequest:delegate:startImmediately:'].implementation, {
            onEnter: function(args) {
                try {
                    const request = new ObjC.Object(args[2]);
                    const url = request.URL() ? request.URL().absoluteString().toString() : null;
                    if (url) {
                        console.log(`[🔗] Solicitud de Red (NSURLConnection): ${url}`);
                    }
                } catch (e) {
                    console.error(`[⚠️] Error al inspeccionar solicitud de NSURLConnection: ${e.message}`);
                }
            }
        });
        console.log("[👂] Hooking persistente a -[NSURLConnection initWithRequest:delegate:startImmediately:]");
    }

    if (ObjC.classes.NSMutableURLRequest && ObjC.classes.NSMutableURLRequest['- setHTTPBody:']) {
        Interceptor.attach(ObjC.classes.NSMutableURLRequest['- setHTTPBody:'].implementation, {
            onEnter: function(args) {
                try {
                    const body = new ObjC.Object(args[2]);
                    if (body && body.isKindOfClass_(NSData)) {
                        const bodyString = body.toString('utf8');
                        console.log(`[BODY] NSMutableURLRequest setHTTPBody: ${bodyString}`);
                    } else {
                        console.log(`[BODY] NSMutableURLRequest setHTTPBody: <No es NSData>`);
                    }
                } catch (e) {
                    console.error(`[⚠️] Error al inspeccionar el cuerpo de NSMutableURLRequest: ${e.message}`);
                }
            }
        });
        console.log("[👂] Hooking persistente a -[NSMutableURLRequest setHTTPBody:]");
    }

} else {
    console.warn("❌ StoreKit No Disponible en este proceso.");
}

// ----------------------------------------------------------------------------
// Función de Hook Seguro y Reutilizable con Mejor Logging
// ----------------------------------------------------------------------------
function SafeHook(cls, method, impl) {
    if (cls && cls[method] && cls[method].implementation) {
        try {
            Interceptor.replace(cls[method].implementation, impl);
            console.log(`[🛠️] Hook Reemplazado: ${cls.$className}.${method}`);
        } catch (e) {
            console.error(`[⚠️] Error al aplicar hook a ${cls.$className}.${method}: ${e.message}`);
        }
    } else {
        console.warn(`[🚫] Método No Encontrado: ${cls ? cls.$className : 'Clase Desconocida'}.${method}`);
    }
}
