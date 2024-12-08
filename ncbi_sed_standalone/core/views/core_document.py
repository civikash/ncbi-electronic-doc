from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from typing import Optional, Type
from core.models import DocumentType, Document, Staff, DocumentVisas, DirectorsOrganisations, InteractingOrganisations, IncomingDocuments, OutgoingDocuments, InternalDocuments, CATEGORY_DOCUMENT_CHOICES
from django.http import HttpResponse, HttpRequest, JsonResponse, Http404
from django.views.decorators.http import require_POST
from django.template.loader import render_to_string
import mimetypes
from django.db.models import Q
from django_htmx.middleware import HtmxDetails


class HtmxHttpRequest(HttpRequest):
    htmx: HtmxDetails


def get_staff(user):
    return Staff.objects.get(user=user)

def get_document_by_uuid(document_uuid: str) -> Optional[Type]:
    """
    Получает документ по UUID из списка доступных моделей
    """
    for model in [IncomingDocuments, OutgoingDocuments, InternalDocuments]:
        try:
            return model.objects.get(uuid=document_uuid)
        except model.DoesNotExist:
            continue
    raise Http404("Документ с указанным UUID не найден")


@require_POST
def document_add_review(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    staff_id = request.POST.get("staff_id")

    document = get_object_or_404(Document, uuid=document_uuid)
    staff = get_object_or_404(Staff, id=staff_id)

    review, created = DocumentVisas.objects.get_or_create(document=document, staff=staff)

    reviews = document.visas.select_related("staff")

    context = {'document': document,
               'reviews': reviews}

    return render(request, "./core/pages/sed/partials/documents/partial_document_reviews_list.html", context)

@require_POST
def document_delete_review(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    staff_id = request.POST.get("staff_id")

    document = get_object_or_404(Document, uuid=document_uuid)
    staff = get_object_or_404(Staff, id=staff_id)

    DocumentVisas.objects.get(document=document, staff=staff).delete()

    reviews = DocumentVisas.objects.filter(document=document)

    context = {'document': document,
                'reviews': reviews}

    return render(request, "./core/pages/sed/partials/documents/partial_document_reviews_list.html", context)


def document_detail(request: HtmxHttpRequest, *args, **kwargs) -> HttpResponse:
    document_uuid = kwargs.get('doc_uid')
    document = None

    document = get_document_by_uuid(document_uuid)


    documents_url = reverse('core:core-lk-documents')
    
    crumbs = [
        {"name": "Документы", "url": documents_url},
        {"name": "Мои документы", "url": documents_url},
        {"name": f"{document.type} №{document.registration_number}", "url": f"{request.path}"},
    ]

    context = {'document': document, 'crumbs': crumbs}
    if not document.category == 'INCOMING_DOCUMENT':
        reviews = DocumentVisas.objects.filter(document=document)
        context['reviews'] = reviews

    if request.htmx:
        if 'reviews' in request.GET:
            visas = Staff.objects.all()
            context['visas'] = visas
            return render(request, './core/pages/sed/partials/documents/partial_document_select_staff.html', {'visas': visas})
        elif 'signer' in request.GET:
            signers = Staff.objects.all()
            context['signer'] = signers
            return render(request, './core/pages/sed/partials/documents/detail/signer/partial_signers.html', context)
        else:
            return render(request, './core/pages/sed/partials/documents/partial_sed_document_detail.html', context)
    return render(request, './core/pages/sed/sed_document_detail.html', context)

def create_document(request):
    template = './core/pages/sed/partials/partial_sed_create_document.html'

    documents_url = reverse('core:core-lk-documents')


    if request.htmx:
        if request.method == 'GET':
            document_types = CATEGORY_DOCUMENT_CHOICES
            type_key = [choice[0] for choice in document_types]
            selected_type = request.GET.get('type')
            if selected_type and selected_type in type_key:
                context = {'types': DocumentType.objects.filter(category=selected_type)}
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
                doc_type = DocumentType.objects.get(id=type_id)
                if doc_type.category == 'INCOMING_DOCUMENT':
                    document = IncomingDocuments.objects.create(type=doc_type, author_work_card=get_staff(request.user))
                    document.save()

                    crumbs = [
                        {"name": "Документы", "url": documents_url},
                        {"name": "Мои документы", "url": documents_url},
                        {"name": f"{document.type} №{document.registration_number}", "url": f"{request.path}"},
                    ]

                    context = {'crumbs': crumbs,
                               'document': document}

                    template = render_to_string('./core/pages/sed/partials/documents/partial_sed_document_detail.html', context)

                return HttpResponse(template, headers={
                     'HX-Push': reverse('core:core-lk-document-detail', args=[document.uuid])
            })
            else:
                return HttpResponse('Ошибка')


@require_POST
def document_add_signer(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    signer_type = request.POST.get("signer_type")
    signer_id = request.POST.get("signer_id")

    document = get_document_by_uuid(document_uuid)
    
    signer = None
    if signer_type == 'organisation':
        signer = get_object_or_404(DirectorsOrganisations, id=signer_id)
    if signer_type == 'staff': 
        signer = get_object_or_404(Staff, id=signer_id)

    document.signatory = signer
    document.save()


    context = {'document': document}

    return render(request, "./core/pages/sed/partials/documents/detail/signer/partial_signer_list.html", context)


@require_POST
def document_delete_signer(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")

    document = get_document_by_uuid(document_uuid)

    document.signatory = None
    document.save()

    context = {'document': document}

    return render(request, "./core/pages/sed/partials/documents/detail/signer/partial_signers.html", context)
