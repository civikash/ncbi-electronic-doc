from django.shortcuts import render

def appcontrol_overview(request):
    if request.htmx:
        return render(request, './core/pages/lk/partials/partial_core_lk.html')

    return render(request, './core/pages/lk/core_lk.html')
