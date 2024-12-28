var isPluginEnabled = false;
var fileContent; // Переменная для хранения информации из файла, значение присваивается в cades_bes_file.html
var global_selectbox_container = new Array();
var global_selectbox_container_thumbprint = new Array();
var global_isFromCont = new Array();
var global_selectbox_counter = 0;
function getXmlHttp(){
    var xmlhttp;
    if (typeof XMLHttpRequest != 'undefined') {
        // IE7+
        xmlhttp = new XMLHttpRequest();
    } else {
        // IE < 7
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
    }
    return xmlhttp;
}
function CertStatusEmoji(isValid, hasPrivateKey) {
    var _emoji = "";
    if (isValid) {
        _emoji = "\u2705";
    } else {
        _emoji = "\u274C";
    }
    //if (hasPrivateKey) {
    //    _emoji += "\uD83D\uDD11";
    //} else {
    //    _emoji += String.fromCodePoint(0x1F6AB);
    //}
    return _emoji;
}
var async_code_included = 0;
var async_Promise;
var async_resolve;

function escapeHtml(unsafe)
{
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function include_async_code()
{
    if(async_code_included)
    {
        return async_Promise;
    }
    var fileref = document.createElement('script');
    fileref.setAttribute("type", "text/javascript");
    fileref.setAttribute("src", "async_code.js?v=271850");
    document.getElementsByTagName("head")[0].appendChild(fileref);
    async_Promise = new Promise(function(resolve, reject){
        async_resolve = resolve;
    });
    async_code_included = 1;
    return async_Promise;
}

function toggleAdvanced(on) {
    var elAdvanced = document.getElementsByClassName('elAdvanced');
    if (on) {
        document.getElementById('showAdvanced').style.display = "none";
        document.getElementById('hideAdvanced').style.display = "inline-block";
        document.getElementById('copyAdvanced').style.display = "inline-block";
    } else {
        document.getElementById('showAdvanced').style.display = "block";
        document.getElementById('hideAdvanced').style.display = "none";
        document.getElementById('copyAdvanced').style.display = "none";
    }

    for (var i = 0; i < elAdvanced.length; i++) {
        if (on) {
            if (elAdvanced[i].innerHTML)
                elAdvanced[i].style.display = "list-item";
        } else {
            elAdvanced[i].style.display = "none";
        }
    }
}

function copyInfo() {
    var descr = document.getElementsByClassName('descr');
    var copyText = descr[0].innerText

    var textArea = document.createElement("textarea");
    textArea.value = copyText;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
  
    try {
        if (document.execCommand('copy')) {
            var copiedPopup = document.getElementById('copiedPopup');
            if (!copiedPopup) {
                copiedPopup = document.createElement('div');
                copiedPopup.id = 'copiedPopup';
                copiedPopup.textContent = 'Скопировано!';
                copiedPopup.classList.add('copied_popup');
                document.body.appendChild(copiedPopup);
                copiedPopup.style.transform = 'translate(-50%, -50%) scale(1)';
                copiedPopup.style.opacity = '1';

                setTimeout(function () {
                    copiedPopup.style.transform = 'translate(-50%, -50%) scale(0)';
                    copiedPopup.style.opacity = '0';
                    setTimeout(function () {
                        document.body.removeChild(copiedPopup);
                    }, 500);
                }, 700);
            }
      } else {
        alert('Не удалось скопировать ссылку.');
      }
    } catch (err) {
      alert('Не удалось скопировать ссылку.');
    }
  
    document.body.removeChild(textArea);
}

function closePopup() {
    var mpopup = document.getElementById('mpopupBox');
    mpopup.style.display = "none";
}

function applyOnClick() {
    var apply = document.getElementById("applyBtn");
    apply.disabled = true;
    try {
        var oLicense = cadesplugin.CreateObject("cadescom.cplicense");
        var serialNumber = document.getElementById("modalInfoSerial").value;
        var user = document.getElementById("modalInfoUser").value;
        var company = document.getElementById("modalInfoCompany").value;
        oLicense.SetLicense(serialNumber, user, company);
        document.getElementById("modalSuccess").style.display = "";
        document.getElementById("modalError").style.display = "none";
        closePopup = function () { window.location.reload(); }
    }
    catch (err) {
        var modalError = document.getElementById("modalError");
        modalError.innerHTML = cadesplugin.getLastError(err);
        modalError.style.display = "";
    }
    apply.disabled = false;
}

function showLicencePopUp(product) {
    var mpopup = document.getElementById('mpopupBox');
    var close = document.getElementById("modalClose");
    var buy = document.getElementById("buyBtn");
    var cancel = document.getElementById("cancelBtn");
    var apply = document.getElementById("applyBtn");
    var productName = "";
    if (product == cadesplugin.CADESCOM_PRODUCT_CSP)
        productName = "КриптоПро CSP";
    else if (product == cadesplugin.CADESCOM_PRODUCT_OCSP)
        productName = "КриптоПро OCSP Client";
    else if (product == cadesplugin.CADESCOM_PRODUCT_TSP)
        productName = "КриптоПро TSP Client";
    else return;
    document.getElementById('modalProductNameTxt').innerHTML = productName;
    document.getElementById("modalSuccess").style.display = "none";
    document.getElementById("modalError").style.display = "none";
    mpopup.style.display = "block";
    close.onclick = function () {
        closePopup()
    };
    cancel.onclick = function () {
        closePopup()
    };
    window.onclick = function (event) {
        if (event.target == mpopup) {
            closePopup();
        }
    };
    buy.onclick = function () {
        window.open('https://cryptopro.ru/buy', '_blank');
    }
    apply.onclick = applyOnClick;
}

function addLicensePrompt(product, validTo) {
    return validTo +
        ' (<a href="javascript:void(0);" onclick="showLicencePopUp(\'' + product +
        '\');" id="mpopupLink">Ввести лицензию</a>)';
}

var bShowTspLicenseInfo = false;
var bShowOcspLicenseInfo = false;

if (location.pathname.indexOf("ades_t_sample.html") >= 0 ||
    location.pathname.indexOf("ades_xlong_sample.html") >= 0) {
    bShowTspLicenseInfo = true;
}

if (location.pathname.indexOf("ades_xlong_sample.html") >= 0) { 
    bShowOcspLicenseInfo = true;
}

function cadesPluginUUID() {
    if (!localStorage.hasOwnProperty("cadesPluginUUID")) {
        var uuid = createUUID();
        localStorage.setItem("cadesPluginUUID", uuid);
        return uuid;
    } else {
        var uuid = localStorage.getItem("cadesPluginUUID");
        return uuid;
    }
  }
  
function createUUID() {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
  
    return s.join("");
}
  
function getTelemetryData(pluginVersion, cspVersion) {
    var osName = platformCheck();
    var uuid = cadesPluginUUID();
    
    return {
        plugin: pluginVersion,
        csp: cspVersion,
        os: osName,
        uuid: uuid,
    };
}

function toggleBtn(id, state) {
    if (!id)
        return;
    var btn = document.getElementById(id);
    if (btn)
        btn.disabled = !state;
}

function toggleBtnWrapper(func, btnId) {
    toggleBtn(btnId, false);
    try {
        var res = func();
        toggleBtn(btnId, true);
    }
    catch (exc) {
        toggleBtn(btnId, true);
        throw exc;
    }
    return res;
}

function Common_RetrieveCertificate()
{
    var canAsync = !!cadesplugin.CreateObjectAsync;
    if(canAsync)
    {
        include_async_code().then(function(){
            return RetrieveCertificate_Async();
        });
    }else
    {
        return RetrieveCertificate_NPAPI();
    }
}

function Common_InstallTestCARoot()
{
    var canAsync = !!cadesplugin.CreateObjectAsync;
    if(canAsync)
    {
        include_async_code().then(function(){
            return InstallTestCARoot_Async();
        });
    }else
    {
        return InstallTestCARoot_NPAPI();
    }
}

function Common_CreateSimpleSign(id)
{
    var canAsync = !!cadesplugin.CreateObjectAsync;
    if(canAsync)
    {
        include_async_code().then(function(){
            return CreateSimpleSign_Async(id);
        });
    }else
    {
        return CreateSimpleSign_NPAPI(id);
    }
}

function Common_SignCadesBES(id, text, setDisplayData, btnId)
{
    var canAsync = !!cadesplugin.CreateObjectAsync;
    if (!btnId)
        btnId = 'SignBtn';
    if(canAsync)
    {
        include_async_code().then(function(){
            return toggleBtnWrapper(function () {
                return SignCadesBES_Async(id, text, setDisplayData);
            }, btnId);
        });
    }else
    {
        return toggleBtnWrapper(function () {
            return SignCadesBES_NPAPI(id, text, setDisplayData);
        }, btnId);
    }
}

function Common_SignCadesBES_File(id) {
    var canAsync = !!cadesplugin.CreateObjectAsync;
    var btnId = 'SignBtn';
    if (canAsync) {
        include_async_code().then(function () {
            return toggleBtnWrapper(function () {
                return SignCadesBES_Async_File(id);
            }, btnId);
        });
    } else {
        return toggleBtnWrapper(function () {
            return SignCadesBES_NPAPI_File(id);
        }, btnId);
    }
}

function Common_SignCadesEnhanced(id, sign_type)
{
    var canAsync = !!cadesplugin.CreateObjectAsync;
    var btnId = 'SignBtn';
    if(canAsync)
    {
        include_async_code().then(function(){
            return toggleBtnWrapper(function () {
                return SignCadesEnhanced_Async(id, sign_type);
            }, btnId);
        });
    }else
    {
        return toggleBtnWrapper(function () {
            return SignCadesEnhanced_NPAPI(id, sign_type);
        }, btnId);
    }
}

function Common_SignCadesXML(id, signatureType)
{
    var canAsync = !!cadesplugin.CreateObjectAsync;
    var btnId = 'SignBtn';
    if(canAsync)
    {
        include_async_code().then(function(){
            return toggleBtnWrapper(function () {
                return SignCadesXML_Async(id, signatureType);
            }, btnId);
        });
    }else
    {
        return toggleBtnWrapper(function () {
            return SignCadesXML_NPAPI(id, signatureType);
        }, btnId);
    }
}

function Common_CheckForPlugIn() {
    cadesplugin.set_log_level(cadesplugin.LOG_LEVEL_DEBUG);
    var canAsync = !!cadesplugin.CreateObjectAsync;
    if(canAsync)
    {
        include_async_code().then(function(){
            return CheckForPlugIn_Async();
        });
    }else
    {
        return CheckForPlugIn_NPAPI();
    }
}

function Common_Encrypt() {
    var canAsync = !!cadesplugin.CreateObjectAsync;
    var btnId = 'EncrBtn';
    if(canAsync)
    {
        include_async_code().then(function(){
            return toggleBtnWrapper(function () {
                return Encrypt_Async();
            }, btnId);
        });
    }else
    {
        return toggleBtnWrapper(function () {
            return Encrypt_NPAPI();
        }, btnId);
    }
}

function Common_Decrypt(id, btnId) {
    var canAsync = !!cadesplugin.CreateObjectAsync;
    if(canAsync)
    {
        include_async_code().then(function(){
            return toggleBtnWrapper(function () {
                return Decrypt_Async(id);
            }, btnId);
        });
    }else
    {
        return toggleBtnWrapper(function () {
            return Decrypt_NPAPI(id);
        }, btnId);
    }
}

function Common_InstallCertificate(certBoxId) {
    var canAsync = !!cadesplugin.CreateObjectAsync;
    if(canAsync)
    {
        include_async_code().then(function(){
            return InstallCertificate_Async(certBoxId);
        });
    }else
    {
        return InstallCertificate_NPAPI(certBoxId);
    }
}

function Common_VerifySignature(src, dest, loader) {
    var canAsync = !!cadesplugin.CreateObjectAsync;
    var btnId = 'VerifyBtn';
    if(canAsync)
    {
        include_async_code().then(function(){
            return toggleBtnWrapper(function () {
                return VerifySignature_Async(src, dest, loader);
            }, btnId);
        });
    } else {
        return toggleBtnWrapper(function () {
            return VerifySignature_NPAPI(src, dest, loader);
        }, btnId);
    }
}

function Common_ExportCert(id) {
    var canAsync = !!cadesplugin.CreateObjectAsync;
    var btnId = 'SignBtn';
    if(canAsync)
    {
        include_async_code().then(function(){
            return toggleBtnWrapper(function () {
                return ExportCert_Async(id);
            }, btnId);
        });
    }else
    {
        return toggleBtnWrapper(function () {
            return ExportCert_NPAPI(id);
        }, btnId);
    }
}

function GetCertificate_NPAPI(certListBoxId) {
    var e = document.getElementById(certListBoxId);
    var selectedCertID = e.selectedIndex;
    if (selectedCertID == -1) {
        alert("Select certificate");
        return;
    }
    return global_selectbox_container[selectedCertID];
}

function ClearCertInfo(field_prefix) {
    document.getElementById(field_prefix + "subject").innerHTML = "Владелец:";
    document.getElementById(field_prefix + "issuer").innerHTML = "Издатель:";
    document.getElementById(field_prefix + "from").innerHTML = "Выдан:";
    document.getElementById(field_prefix + "till").innerHTML = "Действителен до:";
    document.getElementById(field_prefix + "provname").innerHTML = "Криптопровайдер:";
    document.getElementById(field_prefix + "privateKeyLink").innerHTML = "Ссылка на закрытый ключ:";
    document.getElementById(field_prefix + "algorithm").innerHTML = "Алгоритм ключа:";
    document.getElementById(field_prefix + "status").innerHTML = "Статус:";
    document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище:";
    document.getElementById(field_prefix + "certlicense").innerHTML = "";
}

function FillCertInfo_NPAPI(certificate, certBoxId, isFromContainer)
{
    var BoxId;
    var field_prefix;
    if(typeof(certBoxId) == 'undefined' || certBoxId == "CertListBox")
    {
        BoxId = 'cert_info';
        field_prefix = '';
    }else if (certBoxId == "CertListBox1") {
        BoxId = 'cert_info1';
        field_prefix = 'cert_info1';
    } else if (certBoxId == "CertListBox2") {
        BoxId = 'cert_info2';
        field_prefix = 'cert_info2';
    } else {
        BoxId = certBoxId;
        field_prefix = certBoxId;
    }

    ClearCertInfo(field_prefix);

    var certObj = new CertificateObj(certificate);
    var Now = new Date();
    var ValidToDate = new Date(certificate.ValidToDate);
    var ValidFromDate = new Date(certificate.ValidFromDate);
    document.getElementById(BoxId).style.display = '';
    document.getElementById(field_prefix + "subject").innerHTML = "Владелец: <b>" + escapeHtml(certObj.GetCertName()) + "<b>";
    document.getElementById(field_prefix + "issuer").innerHTML = "Издатель: <b>" + escapeHtml(certObj.GetIssuer()) + "<b>";
    document.getElementById(field_prefix + "from").innerHTML = "Выдан: <b>" + escapeHtml(certObj.GetCertFromDate()) + " UTC<b>";
    document.getElementById(field_prefix + "till").innerHTML = "Действителен до: <b>" + escapeHtml(certObj.GetCertTillDate()) + " UTC<b>";
    var hasPrivateKey = certificate.HasPrivateKey();

    var isRootExport = location.pathname.indexOf("cades_root_export.html") >= 0

    if (hasPrivateKey) {
        document.getElementById(field_prefix + "provname").innerHTML = "Криптопровайдер: <b>" + escapeHtml(certObj.GetPrivateKeyProviderName()) + "<b>";
        try {
            var privateKeyLink = certObj.GetPrivateKeyLink();
            document.getElementById(field_prefix + "privateKeyLink").innerHTML = "Ссылка на закрытый ключ: <b>" + escapeHtml(privateKeyLink) + "<b>";
        } catch (e) {
            document.getElementById(field_prefix + "privateKeyLink").innerHTML = "Ссылка на закрытый ключ: <b> Набор ключей не существует<b>";
        }
    } else if (!isRootExport) {
        document.getElementById(field_prefix + "provname").innerHTML = "Криптопровайдер:<b>";
        document.getElementById(field_prefix + "privateKeyLink").innerHTML = "Ссылка на закрытый ключ:<b>";
    }

    document.getElementById(field_prefix + "algorithm").innerHTML = "Алгоритм ключа: <b>" + escapeHtml(certObj.GetPubKeyAlgorithm()) + "<b>";
    var certIsValid = false;
    if(Now < ValidFromDate) {
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <b class=\"error\">Срок действия не наступил</b>";
    } else if( Now > ValidToDate){
        document.getElementById(field_prefix + "status").innerHTML = "Статус: <b class=\"error\">Срок действия истек</b>";
    } else if( !hasPrivateKey ){
        if (isRootExport) {
            document.getElementById(field_prefix + "status").innerHTML = "Статус: <b>Нет привязки к закрытому ключу</b>";
        } else {
            document.getElementById(field_prefix + "status").innerHTML = "Статус: <b class=\"error\">Нет привязки к закрытому ключу</b>";
        }
    } else {
        //если попадется сертификат с неизвестным алгоритмом
        //тут будет исключение. В таком сертификате просто пропускаем такое поле
        try {
            Validator = certificate.IsValid();
            certIsValid = Validator.Result;
        } catch (e) {
            certIsValid = false;
        }
        if (certIsValid) {
            document.getElementById(field_prefix + "status").innerHTML = "Статус: <b> Действителен<b>";
        } else {
            var isValidInfo = "";
            try { 
                isValidInfo = "Статус: <b class=\"error\">Не действителен</b><br/>";
                isValidInfo += "Цепочка для сертификата:"
                var oChainCerts = Validator.ValidationCertificates;
                var oErrorStatuses = Validator.ErrorStatuses;
                var chainCount = oChainCerts.Count;
                for (j = 1; j <= chainCount; j++) {
                    var oChainCert = oChainCerts.Item(j);
                    var currCert = new CertificateObj(oChainCert);
                    var chainSN = escapeHtml(currCert.GetCertName());
                    var status = oErrorStatuses.Item(chainCount - j + 1);
                    sStatus = "";
                    if (status) {
                        sStatus = " <b class=\"error\">";
                        if (status & cadesplugin.CERT_TRUST_IS_NOT_TIME_VALID) sStatus += "Истек/не наступил срок действия сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_IS_REVOKED) sStatus += "Сертификат отозван; ";
                        if (status & cadesplugin.CERT_TRUST_IS_NOT_SIGNATURE_VALID) sStatus += "Сертификат не имеет действительной подписи; ";
                        if (status & cadesplugin.CERT_TRUST_IS_NOT_VALID_FOR_USAGE) sStatus += "Сертификат не предназначен для такого использования; ";
                        if (status & cadesplugin.CERT_TRUST_IS_UNTRUSTED_ROOT) sStatus += "Нет доверия к корневому сертификату; ";
                        if (status & cadesplugin.CERT_TRUST_REVOCATION_STATUS_UNKNOWN) sStatus += "Статус сертификата неизвестен; ";
                        if (status & cadesplugin.CERT_TRUST_IS_CYCLIC) sStatus += "Кольцевая зависимость для издателей сертификатов; ";
                        if (status & cadesplugin.CERT_TRUST_INVALID_EXTENSION) sStatus += "Одно из расширений сертификата недействительно; ";
                        if (status & cadesplugin.CERT_TRUST_INVALID_POLICY_CONSTRAINTS) sStatus += "Некорректные ограничения для сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_INVALID_BASIC_CONSTRAINTS) sStatus += "Некорректные ограничения для сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_INVALID_NAME_CONSTRAINTS) sStatus += "Некорректные ограничения для сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_HAS_NOT_SUPPORTED_NAME_CONSTRAINT) sStatus += "Некорректные ограничения для сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_HAS_NOT_DEFINED_NAME_CONSTRAINT) sStatus += "Некорректные ограничения для сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_HAS_NOT_PERMITTED_NAME_CONSTRAINT) sStatus += "Некорректные ограничения для сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_HAS_EXCLUDED_NAME_CONSTRAINT) sStatus += "Некорректные ограничения для сертификата; ";
                        if (status & cadesplugin.CERT_TRUST_IS_OFFLINE_REVOCATION) sStatus += "Статус сертификата на отзыв либо устарел, либо проверка производится оффлайн; ";
                        if (status & cadesplugin.CERT_TRUST_NO_ISSUANCE_CHAIN_POLICY) sStatus += "Конечный сертификат не имеет результирующей политики выдачи, а один из сертификатов выдающего центра сертификации имеет расширение ограничений политики, требующее этого; ";
                        if (status & cadesplugin.CERT_TRUST_IS_EXPLICIT_DISTRUST) sStatus += "Явное недоверие к сертификату ";
                        if (status & cadesplugin.CERT_TRUST_HAS_NOT_SUPPORTED_CRITICAL_EXT) sStatus += "Сертификат не поддерживает критическое расширение; ";
                        if (status & cadesplugin.CERT_TRUST_HAS_WEAK_SIGNATURE) sStatus += "При подписи сертификата использован недостаточно стойкий алгоритм; ";
                        if (sStatus) {
                            sStatus = sStatus.substring(0, sStatus.length - 2);
                        }
                        sStatus += "</b> ";
                    }
                    isValidInfo += "<br/>• <b>" + chainSN + "</b>" + sStatus;
                }
            }
            catch (e) {
                isValidInfo = "Статус: <b class=\"error\">Ошибка при проверке цепочки сертификатов. Возможно, на компьютере не установлены сертификаты УЦ, выдавшего ваш сертификат</b>";
            }
            document.getElementById(field_prefix + "status").innerHTML = isValidInfo;
        }
        try {
            var oExts = certificate.Extensions();
            var extCount = oExts.Count;
            for (i = 1; i <= extCount; i++) {
                var oExt = oExts.Item(i);
                var oOID = oExt.OID;
                var oidValue = oOID.Value;
                if (oidValue == "1.2.643.2.2.49.2") {
                    document.getElementById(field_prefix + "certlicense").innerHTML = "Лицензия CSP в сертификате: <b>Да</b>";
                    break;
                }
            }
        }
        catch (e) { }
    }
    if(isFromContainer)
    {
        if (certIsValid) {
            document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище: <span><b class=\"warning\">Нет. При такой конфигурации не все приложения и порталы могут работать</b><br/><a style=\"cursor: pointer\" onclick=\"Common_InstallCertificate('"+ escapeHtml(certBoxId) +"');\">Установить</a></span>";
        } else {
            document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище: <b>Нет</b>";
        }
    } else {
        document.getElementById(field_prefix + "location").innerHTML = "Установлен в хранилище: <b>Да</b>";
    }
    if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight) {
        var footer = document.getElementById('footer')
        if (footer) {
            var h = footer.offsetHeight;
            window.scrollBy(0, -1 * h);
        }
    }
}

function MakeCadesBesSign_NPAPI(dataToSign, certObject, setDisplayData, isBase64) {
    var errormes = "";

    try {
        var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    } catch (err) {
        errormes = "Failed to create CAdESCOM.CPSigner: " + cadesplugin.getLastError(err);
        alert(errormes);
        throw errormes;
    }

    if (oSigner) {
        oSigner.Certificate = certObject;
    }
    else {
        errormes = "Failed to create CAdESCOM.CPSigner";
        alert(errormes);
        throw errormes;
    }

    try {
        var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
    } catch (err) {
        alert('Failed to create CAdESCOM.CadesSignedData: ' + cadesplugin.getLastError(err));
        return;
    }

    var CADES_BES = 1;
    var Signature;

    if (dataToSign) {
        oSignedData.ContentEncoding = 1; //CADESCOM_BASE64_TO_BINARY
        // Данные на подпись ввели
        if (typeof (isBase64) == 'undefined') {
            oSignedData.Content = Base64.encode(dataToSign);
        } else {
            oSignedData.Content = dataToSign;
        }
    }

    if (typeof (setDisplayData) != 'undefined') {
        //Set display data flag flag for devices like Rutoken PinPad
        oSignedData.DisplayData = 1;
    }
    oSigner.Options = cadesplugin.CAPICOM_CERTIFICATE_INCLUDE_END_ENTITY_ONLY;
    try {
        Signature = oSignedData.SignCades(oSigner, CADES_BES);
    }
    catch (err) {
        errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
        alert(cadesplugin.getLastError(err));
        throw errormes;
    }
    return Signature;
}

function MakeCadesEnhanced_NPAPI(dataToSign, tspService, certObject, sign_type) {
    var errormes = "";

    try {
        var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    } catch (err) {
        errormes = "Failed to create CAdESCOM.CPSigner: " + cadesplugin.getLastError(err);
        alert(errormes);
        throw errormes;
    }

    if (oSigner) {
        oSigner.Certificate = certObject;
    }
    else {
        errormes = "Failed to create CAdESCOM.CPSigner";
        alert(errormes);
        throw errormes;
    }

    try {
        var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
    } catch (err) {
        alert('Failed to create CAdESCOM.CadesSignedData: ' + cadesplugin.getLastError(err));
        return;
    }

    var Signature;

    if (dataToSign) {
        // Данные на подпись ввели
        oSignedData.Content = dataToSign;
    }
    oSigner.Options = 1; //CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN
    oSigner.TSAAddress = tspService;
    try {
        Signature = oSignedData.SignCades(oSigner, sign_type);
    }
    catch (err) {
        errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
        alert(errormes);
        throw errormes;
    }
    return Signature;
}

function MakeXMLSign_NPAPI(dataToSign, certObject, signatureType) {
    try {
        var oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    } catch (err) {
        errormes = "Failed to create CAdESCOM.CPSigner: " + cadesplugin.getLastError(err);
        alert(errormes);
        throw errormes;
    }

    if (oSigner) {
        oSigner.Certificate = certObject;
    }
    else {
        errormes = "Failed to create CAdESCOM.CPSigner";
        alert(errormes);
        throw errormes;
    }

    var signMethod = "";
    var digestMethod = "";

    var pubKey = certObject.PublicKey();
    var algo = pubKey.Algorithm;
    var algoOid = algo.Value;
    if (algoOid == "1.2.643.7.1.1.1.1") {   // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 256 бит
        signMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-256";
        digestMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-256";
    }
    else if (algoOid == "1.2.643.7.1.1.1.2") {   // алгоритм подписи ГОСТ Р 34.10-2012 с ключом 512 бит
        signMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102012-gostr34112012-512";
        digestMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34112012-512";
    }
    else if (algoOid == "1.2.643.2.2.19") {  // алгоритм ГОСТ Р 34.10-2001
        signMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr34102001-gostr3411";
        digestMethod = "urn:ietf:params:xml:ns:cpxmlsec:algorithms:gostr3411";
    }
    else {
        errormes = "Данная демо страница поддерживает XML подпись сертификатами с алгоритмом ГОСТ Р 34.10-2012, ГОСТ Р 34.10-2001";
        throw errormes;
    }
    
    var CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED = 0|signatureType;
    if (signatureType > cadesplugin.CADESCOM_XADES_BES) {
        var tspService = document.getElementById("TSPServiceTxtBox").value;
        oSigner.TSAAddress = tspService;
    }
    
    try {
        var oSignedXML = cadesplugin.CreateObject("CAdESCOM.SignedXML");
    } catch (err) {
        alert('Failed to create CAdESCOM.SignedXML: ' + cadesplugin.getLastError(err));
        return;
    }

    oSignedXML.Content = dataToSign;
    oSignedXML.SignatureType = CADESCOM_XML_SIGNATURE_TYPE_ENVELOPED;
    oSignedXML.SignatureMethod = signMethod;
    oSignedXML.DigestMethod = digestMethod;


    var sSignedMessage = "";
    try {
        sSignedMessage = oSignedXML.Sign(oSigner);
    }
    catch (err) {
        errormes = "Не удалось создать подпись из-за ошибки: " + cadesplugin.getLastError(err);
        alert(errormes);
        throw errormes;
    }

    return sSignedMessage;
}

function GetSignatureTitleElement()
{
    var elementSignatureTitle = null;
    var x = document.getElementsByName("SignatureTitle");

    if(x.length == 0)
    {
        elementSignatureTitle = document.getElementById("SignatureTxtBox").parentNode.previousSibling;

        if(elementSignatureTitle.nodeName == "P")
        {
            return elementSignatureTitle;
        }
    }
    else
    {
        elementSignatureTitle = x[0];
    }

    return elementSignatureTitle;
}

function SignCadesBES_NPAPI(certListBoxId, data, setDisplayData) {
    var certificate = GetCertificate_NPAPI(certListBoxId);
    var dataToSign = document.getElementById("DataToSignTxtBox").value;
    if(typeof(data) != 'undefined')
    {
        dataToSign = data;
    }
    var x = GetSignatureTitleElement();
    try
    {
        var signature = MakeCadesBesSign_NPAPI(dataToSign, certificate, setDisplayData);
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(signature);
        if(x!=null)
        {
            x.innerHTML = "Подпись сформирована успешно:";
        }
    }
    catch(err)
    {
        if(x!=null)
        {
            x.innerHTML = "Возникла ошибка:";
        }
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(err);
    }
}

function SignCadesBES_NPAPI_File(certListBoxId) {
    var certificate = GetCertificate_NPAPI(certListBoxId);
    var dataToSign = fileContent;
    var x = GetSignatureTitleElement();
    try {
        var StartTime = Date.now();
        var setDisplayData;
        var signature = MakeCadesBesSign_NPAPI(dataToSign, certificate, setDisplayData, 1);
        var EndTime = Date.now();
        document.getElementsByName('TimeTitle')[0].innerHTML = "Время выполнения: " + (EndTime - StartTime) + " мс";
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(signature);
        if (x != null) {
            x.innerHTML = "Подпись сформирована успешно:";
        }
    }
    catch (err) {
        if (x != null) {
            x.innerHTML = "Возникла ошибка:";
        }
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(cadesplugin.getLastError(err));
    }
}

function SignCadesEnhanced_NPAPI(certListBoxId, sign_type) {
    var certificate = GetCertificate_NPAPI(certListBoxId);
    var dataToSign = document.getElementById("DataToSignTxtBox").value;
    var tspService = document.getElementById("TSPServiceTxtBox").value ;
    var x = GetSignatureTitleElement();
    try
    {
        var signature = MakeCadesEnhanced_NPAPI(dataToSign, tspService, certificate, sign_type);
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(signature);
        if(x!=null)
        {
            x.innerHTML = "Подпись сформирована успешно:";
        }
    }
    catch(err)
    {
        if(x!=null)
        {
            x.innerHTML = "Возникла ошибка:";
        }
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(cadesplugin.getLastError(err));
    }
}

function SignCadesXML_NPAPI(certListBoxId, signatureType) {
    var certificate = GetCertificate_NPAPI(certListBoxId);
    var dataToSign = document.getElementById("DataToSignTxtBox").value;
    var x = GetSignatureTitleElement();
    try
    {
        var signature = MakeXMLSign_NPAPI(dataToSign, certificate, signatureType);
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(signature);

        if(x!=null)
        {
            x.innerHTML = "Подпись сформирована успешно:";
        }
    }
    catch(err)
    {
        if(x!=null)
        {
            x.innerHTML = "Возникла ошибка:";
        }
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(JSON.stringify(cadesplugin.getLastError(err)));
    }
}

function MakeVersionString(oVer)
{
    var strVer;
    if(typeof(oVer)=="string")
        return oVer;
    else
        return oVer.MajorVersion + "." + oVer.MinorVersion + "." + oVer.BuildVersion;
}

function CheckForPlugIn_NPAPI() {
    function VersionCompare_NPAPI(StringVersion, CurrentVersion)
    {
        // on error occurred suppose that current is actual
        var isActualVersion = true;
        if(typeof(CurrentVersion) === "string")
            return isActualVersion;

        var arr = StringVersion.split('.');
        var NewVersion = {
            MajorVersion: parseInt(arr[0]), 
            MinorVersion: parseInt(arr[1]), 
            BuildVersion: parseInt(arr[2])
        };
        if(NewVersion.MajorVersion > CurrentVersion.MajorVersion) {
            isActualVersion = false;
        } else if(NewVersion.MinorVersion > CurrentVersion.MinorVersion) {
            isActualVersion = false;
        } else if(NewVersion.BuildVersion > CurrentVersion.BuildVersion) {
            isActualVersion = false;
        }

        return isActualVersion;
    }

    function GetCSPVersion_NPAPI() {
        try {
           var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        } catch (err) {
            alert('Failed to create CAdESCOM.About: ' + cadesplugin.getLastError(err));
            return;
        }
        var ver = oAbout.CSPVersion("", 80);
        setStateForCSP(Colors.SUCCESS, "Криптопровайдер загружен");
        return ver.MajorVersion + "." + ver.MinorVersion + "." + ver.BuildVersion;
    }

    function GetCSPName_NPAPI() {
        var sCSPName = "";
        try {
            var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
            sCSPName = oAbout.CSPName(80);

        } catch (err) {
        }
        return sCSPName;
    }

    function ShowCSPVersion_NPAPI(CurrentPluginVersion)
    {
        if(typeof(CurrentPluginVersion) != "string")
        {
            document.getElementById('CSPVersionTxt').innerHTML = escapeHtml("Версия криптопровайдера: " + GetCSPVersion_NPAPI());
        }
        var sCSPName = GetCSPName_NPAPI();
        if(sCSPName!="")
        {
            document.getElementById('CSPNameTxt').innerHTML = escapeHtml("Криптопровайдер: " + sCSPName);
        }
    }

    // IE печально известен проблемами с InnerHTML
    function UpdateInnerHTML(id, value) {
        var newdiv = document.createElement("div");
        newdiv.innerHTML = value;
        var container = document.getElementById(id);
        container.appendChild(newdiv);
    }

    function ShowLicenseInfo() {
        try {
            var oLicense = cadesplugin.CreateObject("CAdESCOM.CPLicense");
            var cspValidTo = escapeHtml(oLicense.ValidTo());
            var tspValidTo = escapeHtml(oLicense.ValidTo(cadesplugin.CADESCOM_PRODUCT_TSP));
            var ocspValidTo = escapeHtml(oLicense.ValidTo(cadesplugin.CADESCOM_PRODUCT_OCSP));
            try {
                if (!(oLicense.IsValid(cadesplugin.CADESCOM_PRODUCT_CSP))) {
                    cspValidTo = addLicensePrompt(cadesplugin.CADESCOM_PRODUCT_CSP, cspValidTo);
                }
                if (!(oLicense.IsValid(cadesplugin.CADESCOM_PRODUCT_TSP))) {
                    tspValidTo = addLicensePrompt(cadesplugin.CADESCOM_PRODUCT_TSP, tspValidTo);
                }
                if (!(oLicense.IsValid(cadesplugin.CADESCOM_PRODUCT_OCSP))) {
                    ocspValidTo = addLicensePrompt(cadesplugin.CADESCOM_PRODUCT_OCSP, ocspValidTo);
                }
            }
            catch (err) { }
            cspValidTo += "<br/>\tДата первой установки: " +
                (oLicense.FirstInstallDate(cadesplugin.CADESCOM_PRODUCT_CSP));
            cspValidTo += "<br/>\tТип лицензии: " +
                (oLicense.Type(cadesplugin.CADESCOM_PRODUCT_CSP));
            tspValidTo += "<br/>\tДата первой установки: " +
                (oLicense.FirstInstallDate(cadesplugin.CADESCOM_PRODUCT_TSP));
            tspValidTo += "<br/>\tТип лицензии: " +
                (oLicense.Type(cadesplugin.CADESCOM_PRODUCT_TSP));
            ocspValidTo += "<br/>\tДата первой установки: " +
                (oLicense.FirstInstallDate(cadesplugin.CADESCOM_PRODUCT_OCSP));
            ocspValidTo += "<br/>\tТип лицензии: " +
                (oLicense.Type(cadesplugin.CADESCOM_PRODUCT_OCSP));
            UpdateInnerHTML('CspLicense', "Лицензия CSP: " + cspValidTo);
            if (bShowTspLicenseInfo) {
                UpdateInnerHTML('OcspLicense', "Лицензия OCSP: " + ocspValidTo);
            }
            if (bShowOcspLicenseInfo) {
                UpdateInnerHTML('TspLicense', "Лицензия TSP: " + tspValidTo);
            }
        }
        catch (err) { }
    }

    function CheckUpdateServer(CurrentPluginVersion, CurrentCSPVersion) {
        var StringPluginVersion = MakeVersionString(CurrentPluginVersion);
        var telemetryData = getTelemetryData(StringPluginVersion, CurrentCSPVersion);
        var paramsArray = [];
        var params = "?";
        for (var property in telemetryData) {
            paramsArray.push(property + "=" + telemetryData[property].toLowerCase());
        }
        params += paramsArray.join('&');
        try {
            var xmlhttp = getXmlHttp();
            xmlhttp.onreadystatechange = function() {
                if (xmlhttp.readyState == 4) {
                    if(xmlhttp.status == 200) {
                        var jsonResponse = JSON.parse(xmlhttp.responseText);
                        var versions = jsonResponse.versions;
                        for (var i = 0; i < versions.length; i++) {
                            var PluginBaseVersion = versions[i].version;
                            if (isPluginWorked) { // плагин работает, объекты создаются
                                if (!VersionCompare_NPAPI(PluginBaseVersion, CurrentPluginVersion)) {
                                    setStateForPlugin(Colors.UPDATE, "Плагин загружен, но есть более свежая версия");
                                }
                            }
                        }
                    }
                }
            }
            xmlhttp.open("GET", "https://api.cryptopro.ru/v1/cades/getState" + params, true);
            xmlhttp.send(null);
        }
        catch (exception) {
            // check version failed, nothing to do
        }
    }

    var isPluginLoaded = false;
    var isPluginWorked = false;
    var isActualVersion = false;
    setStateForExtension(Colors.SUCCESS, "Расширение не требуется");
    setStateForPlugin(Colors.INFO, "Плагин загружается");
    setStateForCSP(Colors.INFO, "КриптоПро CSP не загружен");
    try {
        var oAbout = cadesplugin.CreateObject("CAdESCOM.About");
        isPluginLoaded = true;
        isPluginEnabled = true;
        isPluginWorked = true;

        // Это значение будет проверяться сервером при загрузке демо-страницы
        var CurrentPluginVersion = oAbout.PluginVersion;
        if( typeof(CurrentPluginVersion) === "undefined") {
            CurrentPluginVersion = oAbout.Version;
        }
        setStateForPlugin(Colors.SUCCESS, "Плагин загружен");
        document.getElementById('PlugInVersionTxt').innerHTML = escapeHtml("Версия плагина: " + MakeVersionString(CurrentPluginVersion));
        ShowCSPVersion_NPAPI(CurrentPluginVersion);
        ShowLicenseInfo();
        CheckUpdateServer(CurrentPluginVersion, GetCSPVersion_NPAPI());
    }
    catch (err) {
        // Объект создать не удалось, проверим, установлен ли
        // вообще плагин. Такая возможность есть не во всех браузерах
        var mimetype = navigator.mimeTypes["application/x-cades"];
        if (mimetype) {
            isPluginLoaded = true;
            var plugin = mimetype.enabledPlugin;
            if (plugin) {
                isPluginEnabled = true;
            }
        }
    }
    if (!isPluginWorked) { // плагин не работает, объекты не создаются
        if (isPluginLoaded) { // плагин загружен
            if (!isPluginEnabled) { // плагин загружен, но отключен
                setStateForPlugin(Colors.ERROR, "Плагин загружен, но отключен в настройках браузера");
            }
            else { // плагин загружен и включен, но объекты не создаются
                setStateForPlugin(Colors.ERROR, "Плагин загружен, но не удается создать объекты. Проверьте настройки браузера");
            }
        }
        else { // плагин не загружен
            setStateForPlugin(Colors.ERROR, "Плагин не загружен");
        }
        return;
    }
    setStateForObjects(Colors.INFO, "Идет перечисление объектов плагина");
    if(location.pathname.indexOf("symalgo_sample.html")>=0){
        setTimeout(function() {
            FillCertList_NPAPI('CertListBox1', 'CertListBox2');
        }, 1);
    } else if (location.pathname.indexOf("cades_root_export.html")>=0) { 
        setTimeout(function() {
            FillCertList_NPAPI('CertListBox', undefined, true);
        }, 1);
    } else if (location.pathname.indexOf("verify.html") >= 0) {
        return;
    } else {
        setTimeout(function() {
            FillCertList_NPAPI('CertListBox');
        }, 1);
    }
}

function CertificateObj(certObj)
{
    this.cert = certObj;
    this.certFromDate = new Date(this.cert.ValidFromDate);
    this.certTillDate = new Date(this.cert.ValidToDate);
}

CertificateObj.prototype.check = function(digit)
{
    return (digit<10) ? "0"+digit : digit;
}

CertificateObj.prototype.checkQuotes = function(str)
{
    var result = 0, i = 0;
    for(i;i<str.length;i++)if(str[i]==='"')
        result++;
    return !(result%2);
}

CertificateObj.prototype.extract = function(from, what)
{
    var certName = "";

    var begin = from.indexOf(what);

    if(begin>=0)
    {
        var end = from.indexOf(', ', begin);
        while(end > 0) {
            if (this.checkQuotes(from.substr(begin, end-begin)))
                break;
            end = from.indexOf(', ', end + 1);
        }
        certName = (end < 0) ? from.substr(begin) : from.substr(begin, end - begin);
    }

    return certName;
}

CertificateObj.prototype.DateTimePutTogether = function(certDate)
{
    return this.check(certDate.getUTCDate())+"."+this.check(certDate.getUTCMonth()+1)+"."+certDate.getFullYear() + " " +
                 this.check(certDate.getUTCHours()) + ":" + this.check(certDate.getUTCMinutes()) + ":" + this.check(certDate.getUTCSeconds());
}

CertificateObj.prototype.GetCertString = function()
{
    return this.extract(this.cert.SubjectName,'CN=') + "; Выдан: " + this.GetCertFromDate();
}

CertificateObj.prototype.GetCertFromDate = function()
{
    return this.DateTimePutTogether(this.certFromDate);
}

CertificateObj.prototype.GetCertTillDate = function()
{
    return this.DateTimePutTogether(this.certTillDate);
}

CertificateObj.prototype.GetPubKeyAlgorithm = function()
{
    return this.cert.PublicKey().Algorithm.FriendlyName;
}

CertificateObj.prototype.GetCertName = function()
{
    return this.extract(this.cert.SubjectName, 'CN=');
}

CertificateObj.prototype.GetIssuer = function()
{
    return this.extract(this.cert.IssuerName, 'CN=');
}

CertificateObj.prototype.GetPrivateKeyProviderName = function()
{
    return this.cert.PrivateKey.ProviderName;
}

CertificateObj.prototype.GetPrivateKeyLink = function () {
    return this.cert.PrivateKey.UniqueContainerName;
}

function GetFirstCert_NPAPI() {
    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        oStore.Open();
    }
    catch (e) {
        alert("Certificate not found");
        return;
    }

    var dateObj = new Date();
    var certCnt;

    try {
        certCnt = oStore.Certificates.Count;
        if(certCnt==0)
            throw "Certificate not found";
    }
    catch (ex) {
        oStore.Close();
        document.getElementById("boxdiv").style.display = 'flex';
        return;
    }

    if(certCnt) {
        try {
            for (var i = 1; i <= certCnt; i++) {
                var cert = oStore.Certificates.Item(i);
                if(dateObj<cert.ValidToDate && cert.HasPrivateKey() && cert.IsValid().Result){
                    return cert;
                }
            }
        }
        catch (ex) {
            alert("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
            return;
        }
    }
}

function CreateSimpleSign_NPAPI()
{
    oCert = GetFirstCert_NPAPI();
    var x = GetSignatureTitleElement();
    try
    {
        if (typeof oCert != "undefined") {
            FillCertInfo_NPAPI(oCert);
            var sSignedData = MakeCadesBesSign_NPAPI(txtDataToSign, oCert);
            document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(sSignedData);
            if(x!=null)
            {
                x.innerHTML = "Подпись сформирована успешно:";
            }
        }
    }
    catch(err)
    {
        if(x!=null)
        {
            x.innerHTML = "Возникла ошибка:";
        }
        document.getElementById("SignatureTxtBox").innerHTML = escapeHtml(cadesplugin.getLastError(err));
    }
}

function onCertificateSelected(event) {
    var selectedCertID = event.target.selectedIndex;
    var certificate = global_selectbox_container[selectedCertID];
    FillCertInfo_NPAPI(certificate, event.target.boxId, global_isFromCont[selectedCertID]);
}


function FillCertList_NPAPI(lstId, lstId2, rootStore, selectedIndex) {
    setStateForObjects(Colors.INFO, "Идет перечисление объектов плагина");
    var MyStoreExists = true;
    try {
        var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        if (!oStore) {
            alert("Create store failed");
            setStateForObjects(Colors.FAIL, "Ошибка при перечислении объектов плагина");
            return;
        }

        if (rootStore) {
            oStore.Open(
                cadesplugin.CADESCOM_CURRENT_USER_STORE,
                "Root",
                cadesplugin.CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED
            );
        } else oStore.Open();
    }
    catch (ex) {
        MyStoreExists = false;
    }

    var lst = document.getElementById(lstId);
    if(!lst)
    {
        setStateForObjects(Colors.FAIL, "Ошибка при перечислении объектов плагина");
        return;
    }
    lst.onchange = onCertificateSelected;
    lst.boxId = lstId;

    // второй список опционален
    var lst2 = document.getElementById(lstId2);
    if(lst2)
    {
        lst2.onchange = onCertificateSelected;
        lst2.boxId = lstId2;
    }


    if(MyStoreExists) {
        try {
            var certCnt = oStore.Certificates.Count;
        }
        catch (ex) {
            alert("Ошибка при получении Certificates или Count: " + cadesplugin.getLastError(ex));
            setStateForObjects(Colors.FAIL, "Ошибка при перечислении объектов плагина");
            return;
        }
        for (var i = 1; i <= certCnt; i++) {
            try {
                var cert = oStore.Certificates.Item(i);
            }
            catch (ex) {
                alert("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
                setStateForObjects(Colors.ERROR, "Ошибка при перечислении объектов плагина");
                return;
            }

            try {
                var foundIndex = global_selectbox_container_thumbprint.indexOf(cert.Thumbprint);
                if (foundIndex > -1) {
                    continue;
                }
                var oOpt = document.createElement("OPTION");
                try {
                    var certObj = new CertificateObj(cert, true);
                    oOpt.text = CertStatusEmoji(cert.ValidToDate > Date.now()) + certObj.GetCertString();
                }
                catch (ex) {
                    alert("Ошибка при получении свойства SubjectName: " + cadesplugin.getLastError(ex));
                }
                oOpt.value = global_selectbox_counter;
                lst.options.add(oOpt);
                if (lst2) {
                    var oOpt2 = document.createElement("OPTION");
                    oOpt2.text = oOpt.text;
                    oOpt2.value = oOpt.value;
                    lst2.options.add(oOpt2);
                }
                global_selectbox_container.push(cert);
                global_selectbox_container_thumbprint.push(cert.Thumbprint);
                global_isFromCont.push(false);
                global_selectbox_counter++;
            }
            catch (ex) {
                alert("Ошибка при получении свойства Thumbprint: " + cadesplugin.getLastError(ex));
            }
        }
        oStore.Close();
    }

    if (rootStore) {
        setStateForObjects(Colors.SUCCESS, "Перечисление объектов плагина завершено");
        return
    }

    //В версии плагина 2.0.13292+ есть возможность получить сертификаты из 
    //закрытых ключей и не установленных в хранилище
    try {
        oStore.Open(cadesplugin.CADESCOM_CONTAINER_STORE);
        certCnt = oStore.Certificates.Count;
        for (var i = 1; i <= certCnt; i++) {
            try {
                var cert = oStore.Certificates.Item(i);
            }
            catch (ex) {
                alert("Ошибка при перечислении сертификатов: " + cadesplugin.getLastError(ex));
                setStateForObjects(Colors.FAIL, "Ошибка при перечислении объектов плагина");
                return;
            }

            try {
                var certThumbprint = cert.Thumbprint;
                var foundIndex = global_selectbox_container_thumbprint.indexOf(certThumbprint);
                if (foundIndex > -1) {
                    continue;
                }
                var certObj = new CertificateObj(cert);
                var oOpt = document.createElement("OPTION");
                oOpt.text = CertStatusEmoji(cert.ValidToDate > Date.now()) + certObj.GetCertString();
                oOpt.value = global_selectbox_counter;
                lst.options.add(oOpt);
                if (lst2) {
                    var oOpt2 = document.createElement("OPTION");
                    oOpt2.text = oOpt.text;
                    oOpt2.value = oOpt.value;
                    lst2.options.add(oOpt2);
                }
                global_selectbox_container.push(cert);
                global_selectbox_container_thumbprint.push(cert.Thumbprint);
                global_isFromCont.push(true);
                global_selectbox_counter++;
            }
            catch (ex) {
                alert("Ошибка при получении свойства Thumbprint: " + cadesplugin.getLastError(ex));
            }
        }
        oStore.Close();
    }
    catch (ex) {
    }
    if(global_selectbox_container.length == 0) {
        document.getElementById("boxdiv").style.display = 'flex';
    }
    if (selectedIndex != -1 && selectedIndex || selectedIndex === 0) {
        document.getElementById(lstId).selectedIndex = selectedIndex;
        var certificate = global_selectbox_container[selectedIndex];
        FillCertInfo_NPAPI(certificate);
    }
    setStateForObjects(Colors.SUCCESS, "Перечисление объектов плагина завершено");
}

function CreateCertRequest_NPAPI()
{
    try {
        var PrivateKey = cadesplugin.CreateObject("X509Enrollment.CX509PrivateKey");
    }
    catch (e) {
        alert('Failed to create X509Enrollment.CX509PrivateKey: ' + cadesplugin.getLastError(e));
        return;
    }

    PrivateKey.ProviderName = "Crypto-Pro GOST R 34.10-2012 Cryptographic Service Provider";
    PrivateKey.ProviderType = 80;
    PrivateKey.KeySpec = 1; //XCN_AT_KEYEXCHANGE

    try {
        var CertificateRequestPkcs10 = cadesplugin.CreateObject("X509Enrollment.CX509CertificateRequestPkcs10");
    }
    catch (e) {
        alert('Failed to create X509Enrollment.CX509CertificateRequestPkcs10: ' + cadesplugin.getLastError(e));
        return;
    }

    CertificateRequestPkcs10.InitializeFromPrivateKey(0x1, PrivateKey, "");

    try {
        var DistinguishedName = cadesplugin.CreateObject("X509Enrollment.CX500DistinguishedName");
    }
    catch (e) {
        alert('Failed to create X509Enrollment.CX500DistinguishedName: ' + cadesplugin.getLastError(e));
        return;
    }

    var CommonName = "Test Certificate";
    DistinguishedName.Encode("CN=\""+CommonName.replace(/"/g, "\"\"")+"\"");

    CertificateRequestPkcs10.Subject = DistinguishedName;

    var KeyUsageExtension = cadesplugin.CreateObject("X509Enrollment.CX509ExtensionKeyUsage");
    var CERT_DATA_ENCIPHERMENT_KEY_USAGE = 0x10;
    var CERT_KEY_ENCIPHERMENT_KEY_USAGE = 0x20;
    var CERT_DIGITAL_SIGNATURE_KEY_USAGE = 0x80;
    var CERT_NON_REPUDIATION_KEY_USAGE = 0x40;

    KeyUsageExtension.InitializeEncode(
                CERT_KEY_ENCIPHERMENT_KEY_USAGE |
                CERT_DATA_ENCIPHERMENT_KEY_USAGE |
                CERT_DIGITAL_SIGNATURE_KEY_USAGE |
                CERT_NON_REPUDIATION_KEY_USAGE);

    CertificateRequestPkcs10.X509Extensions.Add(KeyUsageExtension);

    try {
        var Enroll = cadesplugin.CreateObject("X509Enrollment.CX509Enrollment");
    }
    catch (e) {
        alert('Failed to create X509Enrollment.CX509Enrollment: ' + cadesplugin.getLastError(e));
        return;
    }
    var cert_req;
    try {
        Enroll.InitializeFromRequest(CertificateRequestPkcs10);
        cert_req = Enroll.CreateRequest(0x1);
    } catch (e) {
        alert('Failed to generate KeyPair or reguest: ' + cadesplugin.getLastError(e));
        return;    
    }
    
    return cert_req;
}

function RetrieveCertificate_NPAPI()
{
    var cert_req = CreateCertRequest_NPAPI();
    var params = 'CertRequest=' + encodeURIComponent(cert_req) +
                 '&Mode=' + encodeURIComponent('newreq') +
                 '&TargetStoreFlags=' + encodeURIComponent('0') +
                 '&SaveCert=' + encodeURIComponent('no');

    var xmlhttp = getXmlHttp();
    xmlhttp.open("POST", "https://testgost2012.cryptopro.ru/certsrv/certfnsh.asp", true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var response;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                response = xmlhttp.responseText;
                var cert_data = "";
                var sPKCS7 = "";

                if (!isIE()) {
                    var start = response.indexOf("var sPKCS7");
                    var end = response.indexOf("sPKCS7 += \"\"") + 13;
                    cert_data = response.substring(start, end).replace(/\\n/g, "");
                }
                else
                {
                    var start = response.indexOf("sPKCS7 & \"") + 9;
                    var end = response.indexOf("& vbNewLine\r\n\r\n</Script>");
                    cert_data = response.substring(start, end).replace(/\\n/g, "");
                    cert_data = cert_data.replace(new RegExp(" & vbNewLine",'g'),";");
                    cert_data = cert_data.replace(new RegExp("&",'g'),"+");
                }
                var split_data = cert_data.split('"');
                for (i = 0; i < split_data.length; i++) {
                    if (i % 2) sPKCS7 += split_data[i];
                }

                try {
                    var Enroll = cadesplugin.CreateObject("X509Enrollment.CX509Enrollment");
                }
                catch (e) {
                    alert('Failed to create X509Enrollment.CX509Enrollment: ' + cadesplugin.getLastError(e));
                    return;
                }
                try {
                    Enroll.Initialize(cadesplugin.ContextUser);
                }
                catch (err) {
                    alert('Failed to initialize X509Enrollment: ' + cadesplugin.getLastError(err));
                    return;
                }
                try {
                    Enroll.InstallResponse(cadesplugin.CADESCOM_AllowNone, sPKCS7, cadesplugin.XCN_CRYPT_STRING_ANY, "");
                }
                catch (err) {
                    e = cadesplugin.getLastError(err);
                    if (e.indexOf("0x800B0109") !== -1) {
                        note = "Предварительно необходимо установить корневой сертификат тестового УЦ в Доверенные корневые сертификаты\n\n";
                        try {
                            Enroll.InstallResponse(cadesplugin.CADESCOM_AllowUntrustedRoot, sPKCS7, cadesplugin.XCN_CRYPT_STRING_ANY, "");
                            note = "Сертификат установлен. Однако для создания подписи с использованием данного сертификата может понадобиться " +
                                "установить корневой сертификат тестового УЦ в Доверенные корневые сертификаты\n\n";
                        }
                        catch (error) {
                            e = cadesplugin.getLastError(err);
                        }
                        e = note + e;
                    }
                    alert(e);
                }

                document.getElementById("boxdiv").style.display = 'none';
                if(location.pathname.indexOf("simple")>=0) {
                    location.reload();
                }
                else if(location.pathname.indexOf("symalgo_sample.html")>=0){
                    FillCertList_NPAPI('CertListBox1', 'CertListBox2');
                }
                else{
                    FillCertList_NPAPI('CertListBox');
                }
            }
        }
    }
    xmlhttp.send(params);
}

function InstallTestCARoot_NPAPI()
{
    var xmlhttp = getXmlHttp();
    var params = "";
    xmlhttp.open("GET", "https://testgost2012.cryptopro.ru/certsrv/certnew.cer?ReqID=CACert&Renewal=-1&Enc=b64", true);
    xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    var response;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4) {
            if(xmlhttp.status == 200) {
                response = xmlhttp.responseText;
                response = response.replace(/\0/g, '');

                try {
                    var oCert = cadesplugin.CreateObject("CAdESCOM.Certificate");
                    oCert.Import(response);

                    var oStore = cadesplugin.CreateObject("CAdESCOM.Store");
                    oStore.Open(cadesplugin.CAPICOM_CURRENT_USER_STORE, "ROOT", cadesplugin.CAPICOM_STORE_OPEN_READ_WRITE);
                    oStore.Add(oCert);
                    oStore.Close();
                    alert("Сертификат установлен.");
                }
                catch (err) {
                    note = "Не удалось установить корневой сертификат тестового УЦ в Доверенные корневые сертификаты\n\n";
                    e = note + cadesplugin.getLastError(err);
                    alert(e);
                    return;
                }

                document.getElementById("boxdiv").style.display = 'none';
                if(location.pathname.indexOf("simple")>=0) {
                    location.reload();
                }
                else if(location.pathname.indexOf("symalgo_sample.html")>=0){
                    FillCertList_NPAPI('CertListBox1', 'CertListBox2');
                }
                else {
                    selectedIndex = document.getElementById('CertListBox').selectedIndex;
                    FillCertList_NPAPI('CertListBox', null, null, selectedIndex);
                }
            }
        }
    }
    xmlhttp.send(params);
}

function Encrypt_NPAPI() {

    document.getElementById("DataEncryptedIV1").innerHTML = "";
    document.getElementById("DataEncryptedIV2").innerHTML = "";
    document.getElementById("DataEncryptedDiversData1").innerHTML = "";
    document.getElementById("DataEncryptedDiversData2").innerHTML = "";
    document.getElementById("DataEncryptedBox1").innerHTML = "";
    document.getElementById("DataEncryptedBox2").innerHTML = "";
    document.getElementById("DataEncryptedKey1").innerHTML = "";
    document.getElementById("DataEncryptedKey2").innerHTML = "";
    document.getElementById("DataDecryptedBox1").innerHTML = "";
    document.getElementById("DataDecryptedBox2").innerHTML = "";

    var certificate1 = GetCertificate_NPAPI('CertListBox1');
    if(typeof(certificate1) == 'undefined')
    {
        return;
    }
    var certificate2 = GetCertificate_NPAPI('CertListBox2');
    if(typeof(certificate2) == 'undefined')
    {
        return;
    }

    var dataToEncr1 = Base64.encode(document.getElementById("DataToEncrTxtBox1").value);
    var dataToEncr2 = Base64.encode(document.getElementById("DataToEncrTxtBox2").value);

    if(dataToEncr1 === "" || dataToEncr2 === "") {
        errormes = "Empty data to encrypt";
        alert(errormes);
        throw errormes;
    }

    try
    {
        //FillCertInfo_NPAPI(certificate1, 'cert_info1');
        //FillCertInfo_NPAPI(certificate2, 'cert_info2');
        var errormes = "";

        try {
            var oSymAlgo = cadesplugin.CreateObject("cadescom.symmetricalgorithm");
        } catch (err) {
            errormes = "Failed to create cadescom.symmetricalgorithm: " + cadesplugin.getLastError(err);
            alert(errormes);
            throw errormes;
        }

        oSymAlgo.GenerateKey();

        var oSesKey1 = oSymAlgo.DiversifyKey();
        var oSesKey1DiversData = oSesKey1.DiversData;
        document.getElementById("DataEncryptedDiversData1").value = oSesKey1DiversData;
        var oSesKey1IV = oSesKey1.IV;
        document.getElementById("DataEncryptedIV1").value = oSesKey1IV;
        var EncryptedData1 = oSesKey1.Encrypt(dataToEncr1, 1);
        document.getElementById("DataEncryptedBox1").value = EncryptedData1;

        var oSesKey2 = oSymAlgo.DiversifyKey();
        var oSesKey2DiversData = oSesKey2.DiversData;
        document.getElementById("DataEncryptedDiversData2").value = oSesKey2DiversData;
        var oSesKey2IV = oSesKey2.IV;
        document.getElementById("DataEncryptedIV2").value = oSesKey2IV;
        var EncryptedData2 = oSesKey2.Encrypt(dataToEncr2, 1);
        document.getElementById("DataEncryptedBox2").value = EncryptedData2;

        var ExportedKey1 = oSymAlgo.ExportKey(certificate1);
        document.getElementById("DataEncryptedKey1").value = ExportedKey1;

        var ExportedKey2 = oSymAlgo.ExportKey(certificate2);
        document.getElementById("DataEncryptedKey2").value = ExportedKey2;

        alert("Данные зашифрованы успешно:");
    }
    catch(err)
    {
        alert("Ошибка при шифровании данных:" + cadesplugin.getLastError(err));
    }
}

function Decrypt_NPAPI(certListBoxId) {

    document.getElementById("DataDecryptedBox1").value = "";
    document.getElementById("DataDecryptedBox2").value = "";

    var certificate = GetCertificate_NPAPI(certListBoxId);
    if(typeof(certificate) == 'undefined')
    {
        return;
    }
    var dataToDecr1 = document.getElementById("DataEncryptedBox1").value;
    var dataToDecr2 = document.getElementById("DataEncryptedBox2").value;
    var field;
    if(certListBoxId == 'CertListBox1')
        field ="DataEncryptedKey1";
    else
        field ="DataEncryptedKey2";

    var EncryptedKey = document.getElementById(field).value;
    try
    {
        FillCertInfo_NPAPI(certificate, 'cert_info_decr');
        var errormes = "";

        try {
            var oSymAlgo = cadesplugin.CreateObject("cadescom.symmetricalgorithm");
        } catch (err) {
            errormes = "Failed to create cadescom.symmetricalgorithm: " + cadesplugin.getLastError(err);
            alert(errormes);
            throw errormes;
        }
        oSymAlgo.ImportKey(EncryptedKey, certificate);
        var oSesKey1DiversData = document.getElementById("DataEncryptedDiversData1").value;
        var oSesKey1IV = document.getElementById("DataEncryptedIV1").value;
        oSymAlgo.DiversData = oSesKey1DiversData;
        var oSesKey1 = oSymAlgo.DiversifyKey();
        oSesKey1.IV = oSesKey1IV;
        var EncryptedData1 = oSesKey1.Decrypt(dataToDecr1, 1);
        document.getElementById("DataDecryptedBox1").value = Base64.decode(EncryptedData1);
        var oSesKey2DiversData = document.getElementById("DataEncryptedDiversData2").value;
        var oSesKey2IV = document.getElementById("DataEncryptedIV2").value;
        oSymAlgo.DiversData = oSesKey2DiversData;
        var oSesKey2 = oSymAlgo.DiversifyKey();
        oSesKey2.IV = oSesKey2IV;
        var EncryptedData2 = oSesKey2.Decrypt(dataToDecr2, 1);
        document.getElementById("DataDecryptedBox2").value = Base64.decode(EncryptedData2);

        alert("Данные расшифрованы успешно:");
    }
    catch(err)
    {
        alert("Ошибка при шифровании данных:" + cadesplugin.getLastError(err));
    }
}

function InstallCertificate_NPAPI(certBoxId)
{
    if (typeof(certBoxId) === 'undefined')
        return;
    var e = document.getElementById(certBoxId);
    if (e.selectedIndex === -1) {
        alert("Select certificate");
        return;
    }
    var selectedCertID = e[e.selectedIndex].value;
    var certificate = global_selectbox_container[selectedCertID];
    if (!global_isFromCont[selectedCertID]) {
        alert("Сертификат уже установлен в хранилище");
        FillCertInfo_NPAPI(certificate, certBoxId, global_isFromCont[selectedCertID]);
        return;
    }

    var data = certificate.Export(cadesplugin.CADESCOM_ENCODE_BASE64);

    try {
        var Enroll = cadesplugin.CreateObject("X509Enrollment.CX509Enrollment");
    }
    catch (e) {
        alert('Failed to create X509Enrollment.CX509Enrollment: ' + cadesplugin.getLastError(e));
        return;
    }

    try {
        Enroll.Initialize(cadesplugin.ContextUser);
    }
    catch (err) {
        alert('Failed to initialize X509Enrollment: ' + cadesplugin.getLastError(err));
        return;
    }

    try {
        Enroll.InstallResponse(
            cadesplugin.CADESCOM_UseContainerStore |
            cadesplugin.CADESCOM_AllowNone,
            data, cadesplugin.XCN_CRYPT_STRING_BASE64_ANY, "");
    }
    catch (err) {
        e = cadesplugin.getLastError(err);
        if (e.indexOf("0x800B0109") !== -1) {
            e = "Ошибка: корневой сертификат УЦ не установлен в Доверенные корневые сертификаты\n\n" + e;
        }
        alert(e);
        return;
    }
    global_isFromCont[selectedCertID] = false;
    FillCertInfo_NPAPI(certificate, certBoxId, global_isFromCont[selectedCertID]);
    alert("Сертификат установлен в Личные сертификаты");
}

function VerifySignature_NPAPI(SignatureBoxId, SignInfoBoxId, LoaderId) {
    try {
        var srcBox = document.getElementById(SignatureBoxId);
        var destBox = document.getElementById(SignInfoBoxId);
        var loader = document.getElementById(LoaderId);

        document.getElementById('toggle_extended_text').style.display = 'none';
        if (destBox != null && destBox.style != null) {
            destBox.style.display = 'none';
        }
        var sSignedMessage = srcBox.value;
        if (sSignedMessage == "") {
            throw ("Отсутствует подпись для проверки");
        }
        if (loader != null && loader.style != null) {
            loader.style.display = '';
        }

        var oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");

        var targRadios = document.getElementsByName('signTargetType');
        var targRadiosLen = targRadios.length;
        var signType = cadesplugin.CADESCOM_CADES_X_LONG_TYPE_1;
        var bsignTypeAuto = false;
        for (i = 0; i < targRadiosLen; i++) {
            if (targRadios[i].checked) {
                if (targRadios[i].value === "CADES-AUTO") {
                    bsignTypeAuto = true;
                    break;
                }
                if (targRadios[i].value === "CADES-BES") {
                    signType = cadesplugin.CADESCOM_CADES_BES;
                    break;
                }
                if (targRadios[i].value === "CADES-T") {
                    signType = cadesplugin.CADESCOM_CADES_T;
                    break;
                }
                if (targRadios[i].value === "CADES-XLT1") {
                    signType = cadesplugin.CADESCOM_CADES_X_LONG_TYPE_1;
                    break;
                }
                if (targRadios[i].value === "PKCS7") {
                    signType = cadesplugin.CADESCOM_PKCS7_TYPE;
                    break;
                }
            }
        }

        var verifyResult = "Результат проверки неизвестен";
        var verifyResultSuccess = '<font color="green">Подпись проверена успешно</font>';
        var certThumbprints = [];
        for (; ;) {
            try {
                oSignedData.VerifyCades(sSignedMessage, signType);
            }
            catch (ex) {
                verifyResult = cadesplugin.getLastError(ex);
                if (bsignTypeAuto) {
                    // Перебираем все типы подписей, пока атрибуты в подписи не подойдут под тип
                    if (verifyResult.indexOf("0x8009100F") >= 0 ||
                        verifyResult.indexOf("0x8009200E") >= 0 ||
                        verifyResult.indexOf("0x80070490") >= 0) {
                        signType = getNextSignType(signType);
                    } else {
                        break;
                    }
                    if (!signType) {
                        break;
                    }
                    continue;
                }
                break;
            }
            verifyResult = verifyResultSuccess;
            break;
        }
        if (verifyResult != verifyResultSuccess)
            verifyResult = '<font color="red">' + verifyResult + '</font>';
        var sSignType = getSignTypeString(signType);
        var result = "";
        result += "Тип подписи: <b>" + sSignType + "</b><br/>"
        result += "Результат проверки: <b>" + verifyResult + "</b><br/><br/>"

        try {
            var oSigners = oSignedData.Signers;
            var nSigners = oSigners.Count;
            result += "Подписанты: <b>" + nSigners + "</b><br/>"

            for (var i = 1; i <= nSigners; i++) {
                var oSigner = oSigners.Item(i);
                var oCert = oSigner.Certificate;
                var certObj = new CertificateObj(oCert);
                var oSignStatus = oSigner.SignatureStatus;
                var isValidSignStatus = oSignStatus.IsValid;
                var isValidSign = "Ошибка при проверке подписи";
                if (isValidSignStatus) {
                    isValidSign = "Подпись проверена успешно";
                }
                var isValidCertStatus = oCert.IsValid();
                isValidCertStatus = isValidCertStatus.Result;
                var isValidCert = "Ошибка при проверке статуса сертификата";
                if (isValidCertStatus) {
                    isValidCert = "Сертификат действителен";
                }

                var subject = "-";
                var issuer = "-";
                var validFrom = "-";
                var validTo = "-";
                var thumbprint = "-";
                var signingTime = "-";
                try {
                    subject = escapeHtml(certObj.GetCertName());
                    issuer = escapeHtml(certObj.GetIssuer());
                    validFrom = escapeHtml(certObj.GetCertFromDate()) + " UTC";
                    validTo = escapeHtml(certObj.GetCertTillDate()) + " UTC";
                    thumbprint = oCert.Thumbprint;
                    certThumbprints.push(thumbprint);
                    signingTime = oSigner.SigningTime;
                }
                catch (ex) { }
                result += i + ". Владелец: <b>" + subject + "</b><br/>";
                result += "&emsp;Издатель: <b>" + issuer + "</b><br/>";
                result += "&emsp;Выдан: <b>" + validFrom + "</b><br/>";
                result += "&emsp;Действителен до: <b>" + validTo + "</b><br/>";
                result += "&emsp;Отпечаток: <b>" + thumbprint + "</b><br/>";
                result += "&emsp;Статус сертификата: <b>" + isValidCert + "</b><br/>";
                result += "&emsp;Дата подписи: <b>" + signingTime + "</b><br/>";
                result += "&emsp;Статус подписи: <b>" + isValidSign + "</b><br/><br/>";
            }

        }
        catch (ex) { }
        document.getElementById('verifyResult').innerHTML = result;

        var resultExt = "";
        try {
            var oCerts = oSignedData.Certificates;
            var nCerts = oCerts.Count;
            var certIndex = 0;
            for (var i = 1; i <= nCerts; i++) {
                var oCert = oCerts.Item(i);
                var certObj = new CertificateObj(oCert);
                var thumbprint = oCert.Thumbprint;
                if (certThumbprints.indexOf(thumbprint) >= 0)
                    continue;
                var isValidCertStatus = oCert.IsValid();
                isValidCertStatus = isValidCertStatus.Result;
                var isValidCert = "Ошибка при проверке статуса сертификата";
                if (isValidCertStatus) {
                    isValidCert = "Сертификат действителен";
                }

                var subject = "-";
                var issuer = "-";
                var validFrom = "-";
                var validTo = "-";
                var signingTime = "-";
                try {
                    subject = escapeHtml(certObj.GetCertName());
                    issuer = escapeHtml(certObj.GetIssuer());
                    validFrom = escapeHtml(certObj.GetCertFromDate()) + " UTC";
                    validTo = escapeHtml(certObj.GetCertTillDate()) + " UTC";
                    certThumbprints.push(thumbprint);
                }
                catch (ex) { }

                resultExt += ++certIndex + ". Владелец: <b>" + subject + "</b><br/>";
                resultExt += "&emsp;Издатель: <b>" + issuer + "</b><br/>";
                resultExt += "&emsp;Выдан: <b>" + validFrom + "</b><br/>";
                resultExt += "&emsp;Действителен до: <b>" + validTo + "</b><br/>";
                resultExt += "&emsp;Отпечаток: <b>" + thumbprint + "</b><br/>";
                resultExt += "&emsp;Статус сертификата: <b>" + isValidCert + "</b><br/><br/>";
            }
            if (resultExt != "") {
                resultExt = "Другие сертификаты из подписи: <br />" + resultExt;
                document.getElementById('toggle_extended_text').style.display = '';
                document.getElementById('extended_text').innerHTML = resultExt;
            }
        }
        catch (ex) { }

        loader.style.display = 'none';
        if (destBox != null && destBox.style != null) {
            destBox.style.display = '';
        }
        document.getElementById('verifyResult').innerHTML = result;
    }
    catch (err) {
        loader.style.display = 'none';
        alert(cadesplugin.getLastError(err))
    }
}

function ExportCert_NPAPI(certListBoxId) {
    var certificate = GetCertificate_NPAPI(certListBoxId);
    try
    {
        var data = certificate.Export(cadesplugin.CADESCOM_ENCODE_BASE64);
        var data_arr = Base64ToBase32(data).split('')
        var preparedData = []
        while (data_arr.length) preparedData.push(data_arr.splice(0, 1000).join(''))
        BindQr(preparedData)
    }
    catch(err)
    {
        alert(cadesplugin.getLastError(err))
    }
}

function isIE() {
    var retVal = (("Microsoft Internet Explorer" == navigator.appName) || // IE < 11
        navigator.userAgent.match(/Trident\/./i)); // IE 11
    return retVal;
}

function isEdge() {
    var retVal = navigator.userAgent.match(/Edge\/./i);
    return retVal;
}

function isYandex() {
    var retVal = navigator.userAgent.match(/YaBrowser\/./i);
    return retVal;
}

function ShowEdgeNotSupported() {
    setStateForPlugin(Colors.ERROR, "К сожалению, браузер Edge не поддерживается, обновитесь до Edge версии >= 79");
}

//-----------------------------------
var Base64 = {


    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",


    encode: function(input) {
            var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = Base64._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                    enc4 = 64;
            }

            output = output + this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) + this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },


    decode: function(input) {
            var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
            }

        }

        output = Base64._utf8_decode(output);

        return output;

    },

    _utf8_encode: function(string) {
            string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                    utftext += String.fromCharCode(c);
            }
            else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    _utf8_decode: function(utftext) {
        var string = "";
        var i = 0;
        var c, c2, c3;
        c = c2 = c3 = 0;

        while (i < utftext.length) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    }

}
var MakePayment = function(sum,date,to){
    return '<!PINPADFILE UTF8><N>Платежное поручение<V>500'
        + '<N>Сумма<V>' + sum
        + '<N>Дата<V>' + date
        + '<N>Получатель<V>' + to
        + '<N>Инн<V>102125125212'
        + '<N>КПП<V>1254521521'
        + '<N>Назначение платежа<V>За телематические услуги'
        + '<N>Банк получателя<V>Сбербанк'
        + '<N>БИК<V>5005825'
        + '<N>Номер счета получателя<V>1032221122214422'
        + '<N>Плательщик<V>ЗАО "Актив-софт"'
        + '<N>Банк плательщика<V>Банк ВТБ (открытое акционерное общество)'
        + '<N>БИК<V>044525187'
        + '<N>Номер счета плательщика<V>30101810700000000187';
};



function ShowPinPadelogin(){
    var loginvalue = document.getElementById('Login').value;
    var text = '<!PINPADFILE UTF8><N>Авторизация<V><N>Подтвердите авторизацию на сайте<V>'
                + 'cryptopro.ru'
                + '<N>Вход будет произведен с логином<V>' + loginvalue;
    Common_SignCadesBES('CertListBox',text, 1, 'LoginBtn');
}

function Base64ToBase32(b64) {
    var base32Table = 'abcdefghijklmnopqrstuvwxyz234567'

    var cleanedB64 = b64.replace(/[\r\n|\n]/g, '')
    var byteCharacters = atob(cleanedB64) //base64 to string
    var byteNumbers = new Array(byteCharacters.length) //array for binary data
    for (var i = 0; i < byteCharacters.length; i++) byteNumbers[i] = byteCharacters.charCodeAt(i);
    var data = new Uint8Array(byteNumbers) //convert to byte array

    var b32 = ''
    var buff = ''
    var checkChunk = function(finish) {
        if (buff.length && (finish || buff.length === 5)) {
            if (finish) buff = buff + (Array(5 - buff.length + 1).join('0'))
            b32 += base32Table[parseInt(buff, 2)]
            buff = ''
        }
    }
    for (var i = 0; i < data.length; i++) {
        var bin = data[i].toString(2)
        var num =  (Array(8 - bin.length + 1).join('0')) + bin
        for (var j = 0; j < num.length; j++) { //for each bit of data
            buff += num[j]
            checkChunk()
        }
    }
    checkChunk(true)

    var padding = ['', '======', '====', '===', '='][data.length % 5]
    return (b32 + padding)
}

function BindQr(fragments) {
    if (qr) {
        var current = 1
        var limit = fragments.length
        
        function makeDeepLink() {
            var currentId = current - 1
            var link =  'cryptopro://csp/root/add/2/<TOTAL-NR>/<SEQ-NR>/<BASE-ENCODED_CERT>/'
                .replace('<TOTAL-NR>', limit)
                .replace('<SEQ-NR>', currentId)
                .replace('<BASE-ENCODED_CERT>', fragments[currentId])
            return link
        }
        
        function updateQr() {
            qr.value = makeDeepLink()
            document.getElementById('export_progress').innerHTML = current
        }

        function next() {
            if (current < limit) {
                current++
                updateQr()
            }
        }

        function prev() {
            if (current > 1) {
                current--
                updateQr()
            }
        }
    
        document.getElementById('export_progress_limit').innerHTML = limit
        document.getElementById('next_qr').onclick = next
        document.getElementById('prev_qr').onclick = prev
        updateQr()
    } else {
        document.querySelector('[data-qr]').style.display = 'none'
        document.querySelector('[data-qr-head]').style.display = 'none'
    }

    function displayLink(link) {
        var linkDisplay = document.getElementById('extended_text')
        linkDisplay.innerText = link
    }

    function makeFullDeepLink() {
        var link =  'cryptopro://csp/root/add/2/<TOTAL-NR>/<SEQ-NR>/<BASE-ENCODED_CERT>/'
            .replace('<TOTAL-NR>', 1)
            .replace('<SEQ-NR>', 0)
            .replace('<BASE-ENCODED_CERT>', fragments.join(''))
        return link
    }

    displayLink(makeFullDeepLink())
}

function toggleExtendedText() {
    var extended_text = document.querySelector('#extended_text')
    var control = document.querySelector('#toggle_extended_text')
    var expanded = extended_text.className.indexOf('expanded') != -1
    if (expanded) {
        extended_text.className = ''
        control.innerText = 'Развернуть'
        if (location.pathname.indexOf("verify.html") >= 0)
            extended_text.style.display = 'none';
    } else {
        extended_text.className = 'expanded'
        control.innerText = 'Свернуть'
        if (location.pathname.indexOf("verify.html") >= 0)
            extended_text.style.display = '';
    }
}

function copyExtendedText() {
    var text = document.querySelector('#extended_text').innerText
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();
  
    try {
      if (document.execCommand('copy')) {
        alert('Ссылка скопирована в буфер обмена.')
      } else {
        alert('Не удалось скопировать ссылку.');
      }
    } catch (err) {
      alert('Не удалось скопировать ссылку.');
    }
  
    document.body.removeChild(textArea);
}

function getNextSignType(signType) {
    // Порядок обхода: CADES-X Long Type 1 -> CADES-T -> CADES-BES -> PKCS7
    if (signType == cadesplugin.CADESCOM_CADES_X_LONG_TYPE_1)
        return cadesplugin.CADESCOM_CADES_T;
    if (signType == cadesplugin.CADESCOM_CADES_T)
        return cadesplugin.CADESCOM_CADES_BES;
    if (signType == cadesplugin.CADESCOM_CADES_BES)
        return cadesplugin.CADESCOM_PKCS7_TYPE;
    return 0;
}

function getSignTypeString(signType) {
    if (signType == cadesplugin.CADESCOM_CADES_X_LONG_TYPE_1)
        return "CAdES-X Long Type 1";
    if (signType == cadesplugin.CADESCOM_CADES_T)
        return "CAdES-T";
    if (signType == cadesplugin.CADESCOM_CADES_BES)
        return "CAdES-BES";
    if (signType == cadesplugin.CADESCOM_PKCS7_TYPE)
        return "PKCS7";
    return "Неизвестно";
}
