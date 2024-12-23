document.body.addEventListener('htmx:responseError', function(event) {
    var xhr = event.detail.xhr;
    var responseData;

    try {
        responseData = JSON.parse(xhr.responseText);
    } catch (e) {
        responseData = {};
    }
    if (xhr.status === 400) {
        var headerDocumentDetail = document.getElementById('header-detail-document');
        headerDocumentDetail.classList.add('shadow');
        var errorsContainer = document.getElementById('response-error');
        errorsContainer.innerHTML = `
            <span class="response_container__body document">
            <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_1689_1904)">
                <path d="M8.50033 15.5837C12.3962 15.5837 15.5837 12.3962 15.5837 8.50033C15.5837 4.60449 12.3962 1.41699 8.50033 1.41699C4.60449 1.41699 1.41699 4.60449 1.41699 8.50033C1.41699 12.3962 4.60449 15.5837 8.50033 15.5837Z" stroke="#DD2B00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.5 5.66699V9.20866" stroke="#DD2B00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8.49609 11.333H8.50247" stroke="#DD2B00" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </g>
                <defs>
                <clipPath id="clip0_1689_1904">
                <rect width="17" height="17" fill="white"/>
                </clipPath>
                </defs>
            </svg>


            ${responseData.name}
            </span>
            `;
            setTimeout(() => {
                errorsContainer.classList.add('fade-out');
                setTimeout(() => {
                    errorsContainer.innerHTML = '';
                    errorsContainer.classList.remove('fade-out');
                    headerDocumentDetail.classList.remove('shadow');
            }, 1000);
        }, 7000);
    };
});