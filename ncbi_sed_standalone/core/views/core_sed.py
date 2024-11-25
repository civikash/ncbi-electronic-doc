from django.shortcuts import render
from django.urls import reverse

def breadcrumb():
    pass

def documents_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_documents.html')
    return render(request, './core/pages/sed/sed_documents.html')

def create_document(request):
    template = './core/pages/sed/partials/partial_sed_create_document.html'

    if request.htmx:
        if request.method == 'GET':
            documents_url = reverse('core:core-lk-documents')
            crumbs = [
                {"name": "Документы", "url": documents_url},
                {"name": "Регистрация нового документа", "url": f"{request.path}"},
            ]

            context = {
                'crumbs': crumbs
            }
            return render(request, template, context)

def incoming_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_incoming.html')
    return render(request, './core/pages/sed/sed_incoming.html')
    
def signdocuments_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_signing.html')
    return render(request, './core/pages/sed/sed_signing.html')

def recipients_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_recipients.html')
    return render(request, './core/pages/sed/sed_recipients.html')