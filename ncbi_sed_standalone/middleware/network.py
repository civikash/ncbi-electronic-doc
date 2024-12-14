from django.conf import settings
from django.shortcuts import redirect

class DomainRouterMiddleware:
    """
    Middleware для изменения поведения в зависимости от домена.
    """
    def __init__(self, get_response):
        self.get_response = get_response
        pass

    def __call__(self, request):
        host = request.get_host().split(':')[0]

        if host == 'cryptoapi.ncbi.ru':
            request.urlconf = 'crypto_api.urls'
        elif host.endswith('.ncbi.ru'):
            request.urlconf = 'web.urls'

        return self.get_response(request)