from django.shortcuts import render
from core.models import Staff

def news_overview(request):
    if request.htmx:
        return render(request, './core/pages/organisation/partials/partial_organisation_news.html')
    
    return render(request, './core/pages/organisation/organisation_news.html')

def employees_overview(request):

    context = {
                'users': Staff.objects.all()
            }


    if request.htmx:
        return render(request, './core/pages/organisation/partials/partial_organisation_employees.html', context)
    
    return render(request, './core/pages/organisation/organisation_employees.html', context)
    