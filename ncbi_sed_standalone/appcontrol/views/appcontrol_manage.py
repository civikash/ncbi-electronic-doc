from django.shortcuts import render
from core.models import DocumentType, Staff

def appcontrol_overview(request):
    if request.htmx:
        return render(request, './appcontrol/pages/control/control_overview.html')

    return render(request, './appcontrol/pages/control/control_overview.html')


def appcontrol_monitoring(request):
    if request.htmx:
        return render(request, './appcontrol/pages/control/partials/partial_control_overview.html')

    return render(request, './appcontrol/pages/control/control_overview.html')


def appcontrol_app(request):
    documents = DocumentType.objects.all()
    context = {"documents": documents}
    if request.htmx:
        return render(request, './appcontrol/pages/app/partials/partials_app.html', context)

    return render(request, './appcontrol/pages/app/app_overview.html', context)


def appcontrol_users(request):
    staff = Staff.objects.all()
    context = {"users": staff}

    if request.htmx:
        return render(request, './appcontrol/pages/users/partials/partial_users_overview.html', context)

    return render(request, './appcontrol/pages/users/users_overview.html', context)


def appcontrol_settings(request):
    if request.htmx:
        return render(request, './appcontrol/pages/settings/partials/partial_settings_overview.html')

    return render(request, './appcontrol/pages/settings/settings_overview.html')


def appcontrol_modules(request):
    if request.htmx:
        return render(request, './appcontrol/pages/modules/partials/partial_modules_overview.html')

    return render(request, './appcontrol/pages/modules/modules_overview.html')
