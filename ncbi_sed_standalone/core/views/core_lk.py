from django.shortcuts import render

def lk_overview(request):
    if request.htmx:
        return render(request, './core/pages/lk/partials/partial_core_lk.html')

    return render(request, './core/pages/lk/core_lk.html')


def lk_logout(request):
    return render(request, './core/pages/core_lk.html')