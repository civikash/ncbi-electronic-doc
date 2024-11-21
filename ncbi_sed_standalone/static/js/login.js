document.body.addEventListener('htmx:afterRequest', function(event) {
    const xhr = event.detail.xhr;
    if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            uareWelcome(response);
            setTimeout(() => 
                window.location.href = response.url, 3200
            );
    }
});

function uareWelcome(response) {
    const authContainer = document.querySelector("#auth-container");
    const welcomeContainer = document.querySelector('#welcome-container');

    if (authContainer) {
        authContainer.classList.add("remove");
        authContainer.addEventListener("animationend", () => {
            authContainer.remove();
        }, { once: true });
    }

    if (welcomeContainer) {
        welcomeContainer.classList.add("full-flex");
        setTimeout(() => 
        welcomeContainer.innerHTML = `
            <div class="auth_content__container welcome-usr">
                <div class="auth_content__container__header">
                    <h1 class="auth_content__container__header__title">Добро пожаловать,<br> <span>${response.user}</span></h1>
                </div>
            </div>
        `, 1100);
    }
}