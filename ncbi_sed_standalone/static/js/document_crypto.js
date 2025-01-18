document.addEventListener("DOMContentLoaded", function () {
    if (typeof cadesplugin !== "undefined") {
        cadesplugin.then(
            () => console.log("Плагин Cadesplugin успешно загружен"),
            (err) => alert("Ошибка загрузки плагина Cadesplugin: " + err)
        );
    } else {
        alert("Плагин Cadesplugin не найден");
    }
});

function selectCertificate() {
    return new Promise(function (resolve, reject) {
        cadesplugin.async_spawn(function* (args) {
            try {
                console.log("Открытие хранилища контейнеров сертификатов...");
                const oStore = yield cadesplugin.CreateObjectAsync("CAdESCOM.Store");
                yield oStore.Open(
                    cadesplugin.CADESCOM_CONTAINER_STORE,
                    cadesplugin.CAPICOM_MY_STORE,
                    cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
                );

                const oCertificates = yield oStore.Certificates;
                const count = yield oCertificates.Count;

                if (count === 0) {
                    alert("Нет доступных сертификатов в контейнере.");
                    yield oStore.Close();
                    return args[1](new Error("Нет доступных сертификатов."));
                }

                const certList = [];
                for (let i = 1; i <= count; i++) {
                    const cert = yield oCertificates.Item(i);
                    try {
                        const privateKey = yield cert.PrivateKey;
                        const containerName = yield privateKey.ContainerName;
                        const uniqueContainerName = yield privateKey.UniqueContainerName;
                        const subjectName = yield cert.SubjectName;

                        certList.push({
                            index: i,
                            subjectName,
                            containerName,
                            uniqueContainerName,
                            cert, // добавлено для передачи в SignCreate
                        });
                    } catch (err) {
                        console.warn("Сертификат не имеет привязанного приватного ключа:", err);
                        continue;
                    }
                }

                yield oStore.Close();

                if (certList.length === 0) {
                    alert("Не найдено сертификатов с привязанными приватными ключами.");
                    return args[1](new Error("Сертификаты не найдены."));
                }

                let certificateListHtml = '';
                certList.forEach((cert, index) => {
                    certificateListHtml += `
                        <li>
                            <button class="crypto_container_list__container_object" onclick="selectCert(${index})">${cert.subjectName}</button>
                        </li>
                    `;
                });

                let certsContainer = document.getElementById('container-certs-list');
                certsContainer.innerHTML = `
                    <ul class="crypto_container_list">
                        ${certificateListHtml}
                    </ul>
                `


                // Ожидаем выбора сертификата пользователем
                window.selectCert = function(index) {
                    const selectedCertificate = certList[index];
                    alert("Выбран сертификат: " + selectedCertificate.subjectName);
                    args[0](selectedCertificate.cert); // Передаем выбранный сертификат
                };

            } catch (err) {
                alert("Ошибка при перечислении сертификатов: " + err.message);
                args[1](err);
            }
        }, resolve, reject);
    });
}


function SignCreate(oCertificate, dataInBase64) {
    return new Promise(function (resolve, reject) {
        cadesplugin.async_spawn(function* (args) {
            try {
                const oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
                yield oSigner.propset_Certificate(oCertificate);
                yield oSigner.propset_CheckCertificate(true);

                const oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
                yield oSignedData.propset_ContentEncoding(cadesplugin.CADESCOM_BASE64_TO_BINARY);
                yield oSignedData.propset_Content(dataInBase64);

                const signature = yield oSignedData.SignCades(oSigner, cadesplugin.CADESCOM_CADES_BES, true);
                console.log("Подпись успешно создана");
                args[0](signature);
            } catch (err) {
                console.error("Ошибка при создании подписи:", err);
                args[1](err);
            }
        }, resolve, reject);
    });
}


function run() {
    const dataInBase64 = "U29tZSBEYXRhLg=="; // "Some Data." в Base64
    selectCertificate() 
        .then(cert => SignCreate(cert, dataInBase64))
        .then(signedMessage => {
            console.log("Подписанные данные:", signedMessage);

            // Создание тела запроса для отправки на сервер
            const requestBody = JSON.stringify({
                data: dataInBase64,
                signature: signedMessage,
            });
            console.log("Тело запроса:", requestBody);

            // Отправка данных на сервер
            // fetch('/your-server-endpoint', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: requestBody,
            // }).then(response => console.log("Ответ сервера:", response));

            alert("Подпись создана. Проверьте консоль для деталей.");
        })
        .catch(err => {
            console.error("Ошибка выполнения:", err.message || err);
        });

}