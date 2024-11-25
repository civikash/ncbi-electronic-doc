from django.shortcuts import render


def appcontrol_app_documents(request):
    if request.htmx:
        return render(request, './appcontrol/pages/app/partials/partial_app_documents.html')


def appcontrol_app_departments(request):
    if request.htmx:
        return render(request, './appcontrol/pages/app/partials/partial_app_departments.html')


def appcontrol_app_posts(request):
    if request.htmx:
        return render(request, './appcontrol/pages/app/partials/partial_app_posts.html')
