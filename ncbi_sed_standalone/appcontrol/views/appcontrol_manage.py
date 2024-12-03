from django.shortcuts import render


def appcontrol_overview(request):
    if request.htmx:
        return render(request, './appcontrol/pages/control/control_overview.html')

    return render(request, './appcontrol/pages/control/control_overview.html')


def appcontrol_monitoring(request):
    if request.htmx:
        return render(request, './appcontrol/pages/control/partials/partial_control_overview.html')

    return render(request, './appcontrol/pages/control/control_overview.html')


def appcontrol_app(request):
    if request.htmx:
        return render(request, './appcontrol/pages/app/partials/partials_app.html')

    return render(request, './appcontrol/pages/app/app_overview.html')


def appcontrol_users(request):
    if request.htmx:
        return render(request, './appcontrol/pages/users/partials/partial_users_overview.html')

    return render(request, './appcontrol/pages/users/users_overview.html')


def appcontrol_users_create(request):
    if request.method == 'GET' and request.htmx:
        template = './appcontrol/components/modal/users/modal_create_user.html'
        
        context = {'middle_modal': True, 'small_modal': False}

        return render(request, template, context)
    if request.method == 'POST':
        pass

def appcontrol_settings(request):
    if request.htmx:
        return render(request, './appcontrol/pages/settings/partials/partial_settings_overview.html')

    return render(request, './appcontrol/pages/settings/settings_overview.html')


def appcontrol_modules(request):
    if request.htmx:
        return render(request, './appcontrol/pages/modules/partials/partial_modules_overview.html')

    return render(request, './appcontrol/pages/modules/modules_overview.html')
