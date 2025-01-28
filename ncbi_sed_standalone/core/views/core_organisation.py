from django.shortcuts import render

def news_overview(request):
    if request.htmx:
        return render(request, './core/pages/organisation/partials/partial_organisation_news.html')
    
    return render(request, './core/pages/organisation/organisation_news.html')

def employees_overview(request):
    if request.htmx:
        return render(request, './core/pages/organisation/partials/partial_organisation_employees.html')
    
    return render(request, './core/pages/organisation/organisation_employees.html')
    