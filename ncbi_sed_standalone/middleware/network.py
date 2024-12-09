from django.conf import settings
from django.shortcuts import redirect

class DomainRouterMiddleware:
    """
    Middleware для изменения поведения в зависимости от домена.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(':')[0]  # Извлекаем хост без порта

        if host == 'cryptoapi.ncbi.ru':
            # Если запрос пришел на crypto-api, редиректим на соответствующий маршрут
            request.urlconf = 'crypto_api.urls'
        elif host.endswith('.ncbi.ru'):
            # Все поддомены идут на основное приложение
            request.urlconf = 'web.urls'

        return self.get_response(request)