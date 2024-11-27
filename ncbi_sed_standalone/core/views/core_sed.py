from django.shortcuts import render
from django.urls import reverse
from core.models import TypeDocument, Document, Staff
from django.http import HttpResponse
from django.template.loader import render_to_string


def get_staff(user):
    return Staff.objects.get(user=user)

def breadcrumb():
    pass

def documents_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_documents.html')
    return render(request, './core/pages/sed/sed_documents.html')

def document_detail(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/documents/partial_sed_document_detail.html')
    return render(request, './core/pages/sed/sed_document_detail.html')

def create_document(request):
    template = './core/pages/sed/partials/partial_sed_create_document.html'

    if request.htmx:
        if request.method == 'GET':
            document_types = TypeDocument.TYPE_CHOICES
            type_key = [choice[0] for choice in document_types]
            selected_type = request.GET.get('type')
            if selected_type and selected_type in type_key:
                context = {'types': TypeDocument.objects.filter(type=selected_type)}
                return render(request, './core/pages/sed/partials/documents/partial_document_types.html', context) 
            
            documents_url = reverse('core:core-lk-documents')
            crumbs = [
                {"name": "Документы", "url": documents_url},
                {"name": "Регистрация нового документа", "url": f"{request.path}"},
            ]

            context = {
                'crumbs': crumbs,
                'document_types': document_types
            }
            return render(request, template, context)
        
        if request.method == 'POST':
            type_id = request.POST.get('type')
            if type_id:
                doc_type = TypeDocument.objects.get(id=type_id)
                document = Document.objects.create(type=doc_type, author_work_card=get_staff(request.user))
                document.save()
                template = render_to_string('./core/pages/sed/partials/documents/partial_sed_document_detail.html')
                
                return HttpResponse(template, headers={
                    'HX-Push': reverse('core:core-lk-document-detail', args=[document.uuid])
            })
            else:
                return HttpResponse('Ошибка')


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