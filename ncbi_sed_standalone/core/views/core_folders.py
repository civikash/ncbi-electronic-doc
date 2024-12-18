from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.db.models import Count
from core.models import Folder, FolderObject, Staff, DocumentVisas, DirectorsOrganisations, InteractingOrganisations, IncomingDocuments, OutgoingDocuments, InternalDocuments, CATEGORY_DOCUMENT_CHOICES
from django.http import HttpResponse, HttpRequest, JsonResponse, Http404
from django_htmx.middleware import HtmxDetails
from .core_document import get_document_by_uuid, get_staff

class HtmxHttpRequest(HttpRequest):
    htmx: HtmxDetails

def folders_overview(request):
    folders = Folder.objects.annotate(documents_count=Count('folderobject'))

    documents_url = reverse('core:core-lk-documents')

    crumbs = [
        {"name": "Работа с документами", "url": documents_url},
        {"name": "Папки", "url": f"{request.path}"}
    ]

    context = {
        'folders': folders,
        'crumbs': crumbs
    }

    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_folders.html', context)
    return render(request, './core/pages/sed/sed_folders.html', context)



def folder_detail(request: HtmxHttpRequest, *args, **kwargs) -> HttpResponse:
    folder_id = kwargs.get('folder_id')

    folder = Folder.objects.get(id=folder_id)
    files = FolderObject.objects.filter(folder=folder).values_list('document', flat=True)
    documents = []
    for file in files:
        doc = get_document_by_uuid(file)
        documents.append(doc)

    documents_url = reverse('core:core-lk-documents')
    
    crumbs = [
        {"name": "Работа с документами", "url": documents_url},
        {"name": "Папки", "url": reverse('core:core-lk-folders')},
        {"name": f"{folder.name}", "url": f"{request.path}"},
    ]

    context = {'folder': folder,
               'files': files, 
               'documents': documents,
               'crumbs': crumbs}


    if request.htmx:
        return render(request, './core/pages/sed/partials/folders/partial_sed_folder_detail.html', context)
    return render(request, './core/pages/sed/sed_folder_detail.html', context)