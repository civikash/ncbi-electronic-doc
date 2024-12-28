var canPromise = !!window.Promise;

if (canPromise) {
    cadesplugin.then(function () {
        // Прикладной код для успешного завершения промиса
        console.log("Cades plugin loaded successfully!");

        function run() {
            return new Promise(function (resolve, reject) {
                cadesplugin.async_spawn(function* (args) {
                    try {
                        var oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
                        yield oStore.Open(
                            cadesplugin.CADESCOM_CONTAINER_STORE,
                            cadesplugin.CAPICOM_MY_STORE,
                            cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
        
                        var oCertificates = yield oStore.Certificates;
                        var count = yield oCertificates.Count;
                        for (i = 1; i <= count; i++) {
                            var cert = yield oCertificates.Item(i);
                            try {
                                var pKey = yield cert.PrivateKey;
                            }
                            catch (err) {
                                alert(err)
                                continue;
                            }
                            var containerName = yield pKey.ContainerName;
                            var uniqueContainerName = yield pKey.UniqueContainerName;

                            console.log(containerName)
                        }
                    } catch (err) {
                        alert(cadesplugin.getLastError(err));
                    }
                }, resolve, reject);
            });
        }
        
        run()
    }, function(error) {
        // Сообщение об ошибке
        console.error("Cades plugin load error:", error);
    });
} else {
    window.addEventListener("message", function (event) {
        if (event.data == "cadesplugin_loaded") {
            // Прикладной код, если плагин загружен через message
            console.log("Cades plugin loaded via message event");
        } else if (event.data == "cadesplugin_load_error") {
            // Сообщение об ошибке через message
            console.error("Cades plugin load error via message event");
        }
    }, false);
    
    window.postMessage("cadesplugin_echo_request", "*");  // Отправляем запрос на echo для плагина
}