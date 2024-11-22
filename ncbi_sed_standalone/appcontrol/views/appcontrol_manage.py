from django.shortcuts import render

def appcontrol_overview(request):
    if request.htmx:
        return render(request, './appcontrol/pages/control/control_overview.html')

    return render(request, './appcontrol/pages/control/control_overview.html')
