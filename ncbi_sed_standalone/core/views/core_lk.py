from django.shortcuts import render, redirect
from django.http import HttpRequest
from django.views.decorators.http import require_POST
from django_htmx.middleware import HtmxDetails
from django.http import JsonResponse
from django.http import HttpResponse
from django.shortcuts import resolve_url
from django.contrib.auth import logout, authenticate, login

class HtmxHttpRequest(HttpRequest):
    htmx: HtmxDetails

def lk_core(request):
    if request.htmx:
        return render(request, './core/pages/lk/core_core.html')

    return render(request, './core/pages/lk/core_core.html')

def lk_overview(request):
    if request.htmx:
        return render(request, './core/pages/lk/partials/partial_core_lk.html')

    return render(request, './core/pages/lk/core_lk.html')

@require_POST
def authenticate_user(request: HtmxHttpRequest) -> HttpResponse:
    if request.user.is_authenticated:
        return JsonResponse({'code': "03",'name': "Ошибка аутентификации в системе"}, status=401)
    else:
        email = request.POST.get('email').lower()
        password = request.POST.get('password')

        if email and password:
            user = authenticate(email=email, password=password)

            if user is not None:
                if user.is_active:
                    login(request, user)
                    url = resolve_url('core:core-lk')
                    return JsonResponse({'user': request.user.get_full_name(),
                                         'url': url}, status=200)
                else:
                    return JsonResponse({'code': "02",'name': "Пользователь не активен"}, status=401)
            else:
                return JsonResponse({'code': "03",'name': "Ошибка аутентификации в системе"}, status=401)
            


def login_overview(request):
    if request.user.is_authenticated:
        return redirect('core:core-lk')
    else:
        return render(request, './core/pages/login/login.html')


def lk_logout(request):
    logout(request)

    return redirect('core:core-lk-login')