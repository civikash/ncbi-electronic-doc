from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from typing import Optional, Type
from django.contrib.contenttypes.models import ContentType
from core.models import DocumentType, Folder, DocumentFile, FolderObject, Staff, DocumentVisas, DirectorsOrganisations, InteractingOrganisations, IncomingDocuments, OutgoingDocuments, InternalDocuments, CATEGORY_DOCUMENT_CHOICES
from django.http import HttpResponse, HttpRequest, JsonResponse, Http404
from django.views.decorators.http import require_POST
from django.template.loader import render_to_string
from django.db import models
from django.utils.dateparse import parse_date
from django.apps import apps
import json
from django.views.decorators.csrf import csrf_exempt
import base64
# import pycades
from django.core.exceptions import ImproperlyConfigured
import mimetypes
from django.db.models import Count, Q
import os
from pdf2image import convert_from_path
from itertools import chain
from django_htmx.middleware import HtmxDetails
from django.template.context_processors import csrf
import logging
logging.basicConfig(level=logging.DEBUG)

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


def documents_overview(request):
    documents = chain(IncomingDocuments.objects.filter(draft=False), OutgoingDocuments.objects.filter(draft=False))
    folders = Folder.objects.annotate(documents_count=Count('folderobject'))

    document_types = CATEGORY_DOCUMENT_CHOICES
    staff = Staff.objects.all()

    address = chain(Staff.objects.all(), DirectorsOrganisations.objects.all())
    document_status = IncomingDocuments.STATUS_DOCUMENT_CHOICES

    context = {
        'documents': documents,
        'folders': folders,
        'staffs': staff,
        'address': address,
        'document_types': document_types,
        'document_status': document_status
    }

    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_documents.html', context)
    return render(request, './core/pages/sed/sed_documents.html', context)


def document_filters(request):
    document_signing = request.GET.get("document_signing")
    document_type = request.GET.get("document_type")
    document_address = request.GET.get("document_address")
    document_status = request.GET.get("document_status")
    document_short_note = request.GET.get("document_short_note")

    incoming_documents = IncomingDocuments.objects.filter(draft=False)
    outgoing_documents = OutgoingDocuments.objects.filter(draft=False)

    documents = chain(incoming_documents, outgoing_documents)

    if document_signing and document_signing != "all_documents":
        documents = filter(lambda doc: doc.signatory and doc.signatory.id == int(document_signing), documents)

    if document_type and document_type != "all_documents":
        documents = filter(lambda doc: doc.category == document_type, documents)

    if document_address and document_address != "all_documents":
        documents = filter(lambda doc: (hasattr(doc, 'addressee') and doc.addressee and doc.addressee.id == int(document_address)) or
                                    (hasattr(doc, 'outgoing_document_addressee') and doc.outgoing_document_addressee and doc.outgoing_document_addressee.id == int(document_address)),
                           documents)

    if document_status and document_status != "all_documents":
        documents = filter(lambda doc: doc.status == document_status, documents)

    if document_short_note:
        documents = filter(lambda doc: document_short_note.lower() in (doc.brief or '').lower(), documents)

    documents = list(documents)

    context = {'documents': documents}

    return render(request, "./core/pages/sed/partials/components/partial_documents.html", context)


@require_POST
def document_add_review(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    staff_id = request.POST.get("staff_id")

    document = get_document_by_uuid(document_uuid)
    staff = get_object_or_404(Staff, id=staff_id)

    review, created = DocumentVisas.objects.get_or_create(
        document=document.uuid, 
        content_type=ContentType.objects.get_for_model(type(document)),
        staff=staff)

    reviews = DocumentVisas.objects.filter(document=document.uuid)

    context = {'document': document,
               'reviews': reviews}

    return render(request, "./core/pages/sed/partials/documents/detail/reviews/partial_document_reviews_list.html", context)

@require_POST
def document_delete_review(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    staff_id = request.POST.get("staff_id")

    document = get_document_by_uuid(document_uuid)
    staff = get_object_or_404(Staff, id=staff_id)

    DocumentVisas.objects.get(document=document.uuid, staff=staff).delete()

    reviews = DocumentVisas.objects.filter(document=document.uuid)

    context = {'document': document,
                'reviews': reviews}

    return render(request, "./core/pages/sed/partials/documents/detail/reviews/partial_document_reviews_list.html", context)


def document_detail(request: HtmxHttpRequest, *args, **kwargs) -> HttpResponse:
    document_uuid = kwargs.get('doc_uid')
    preview_file_id = request.GET.get('preview')
    document = None

    document = get_document_by_uuid(document_uuid)


    documents_url = reverse('core:core-lk-documents')
    
    crumbs = [
        {"name": "Документы", "url": documents_url},
        {"name": "Черновики", "url": documents_url},
        {"name": f"{document.type} №{document.registration_number}", "url": f"{request.path}"},
    ]
    
    document_files = DocumentFile.objects.filter(document=document.uuid)
    document_file = DocumentFile.objects.filter(document=document.uuid).first()
    if preview_file_id:
        document_file = get_object_or_404(DocumentFile, id=preview_file_id)
    document_previews = []
    total_pages = 0

    previews, pages = get_file_preview(document_file)
    document_previews.extend(previews)
    total_pages += pages

    print(document_previews)


    context = {'document': document, 
               'crumbs': crumbs, 
               'total_pages': total_pages, 
                'document_previews': document_previews,
                'document_files': document_files
            }
    
    if not document.category == 'INCOMING_DOCUMENT':
        reviews = DocumentVisas.objects.filter(document=document.uuid)
        context['reviews'] = reviews

    if request.htmx:
        if preview_file_id:
            context = {'document_previews': document_previews, 'total_pages': total_pages, }
            return render(request, './core/pages/sed/partials/documents/detail/files/partial_document_preview.html', context)
        if 'reviews' in request.GET:
            return render(request, './core/pages/sed/partials/documents/detail/reviews/partial_reviews.html', context)
        elif 'signer' in request.GET:
            return render(request, './core/pages/sed/partials/documents/detail/signer/partial_signers.html', context)
        elif 'addressee' in request.GET:
            return render(request, './core/pages/sed/partials/documents/detail/addressee/partial_addressees.html', context)
        else:
            return render(request, './core/pages/sed/partials/documents/partial_sed_document_detail.html', context)
    return render(request, './core/pages/sed/sed_document_detail.html', context)

@require_POST
def document_update_requisites(request: HtmxHttpRequest, *args, **kwargs) -> HttpResponse:
    document_uuid = kwargs.get('doc_uuid')
    field_name = request.POST.get("field")
    value = request.POST.get(field_name)

    document = get_document_by_uuid(document_uuid)
    try:
        if field_name and hasattr(document, field_name):
            field = document._meta.get_field(field_name)

            if isinstance(field, models.DateField):
                value = parse_date(value)
            elif isinstance(field, models.IntegerField):
                value = int(value)

            setattr(document, field_name, value)
            document.save()
            return JsonResponse({"success": True})

    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)})


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
                    document = IncomingDocuments.objects.create(
                        type=doc_type,
                        author_work_card=get_staff(request.user)
                    )
                elif doc_type.category == 'OUTGOING_DOCUMENT':
                    document = OutgoingDocuments.objects.create(
                        type=doc_type,
                        author_work_card=get_staff(request.user)
                    )

                drafts_folder = Folder.get_or_create_drafts_folder(owner=get_staff(request.user))

                content_type_document = ContentType.objects.get_for_model(IncomingDocuments)
                FolderObject.objects.create(
                    folder=drafts_folder,
                    content_type =content_type_document,
                    owner=get_staff(request.user),
                    document=document.uuid
                )

                crumbs = [
                    {"name": "Документы", "url": documents_url},
                    {"name": "Черновики", "url": "/my-documents/"},
                    {"name": f"{document.type} №{document.registration_number}", "url": request.path},
                ]


                context = {
                    'crumbs': crumbs,
                    'document': document
                }
                context.update(csrf(request))
                if not document.category == 'INCOMING_DOCUMENT':
                    reviews = DocumentVisas.objects.filter(document=document.uuid)
                    context['reviews'] = reviews

                response = render(request, './core/pages/sed/partials/documents/partial_sed_document_detail.html', context)
                response['HX-Push'] = reverse('core:core-lk-document-detail', args=[document.uuid])
                return response
            return HttpResponse('Ошибка', status=400)


@require_POST
def document_add_signer(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    source = request.POST.get("source")
    signer_id = request.POST.get("signer_id")

    document = get_document_by_uuid(document_uuid)
    
    signer = None
    if source == 'external_signer':
        signer = get_object_or_404(DirectorsOrganisations, id=signer_id)
    if source == 'internal_signer': 
        signer = get_object_or_404(Staff, id=signer_id)

    document.signatory = signer
    document.save()


    context = {'document': document, 'source': source}

    return render(request, "./core/pages/sed/partials/documents/detail/signer/partial_signer_list.html", context)


@require_POST
def document_delete_signer(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")

    document = get_document_by_uuid(document_uuid)

    document.signatory = None
    document.save()

    context = {'document': document}

    return render(request, "./core/pages/sed/partials/documents/detail/signer/partial_signers.html", context)


@require_POST
def document_add_addressee(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    source = request.POST.get("source")
    addressee_id = request.POST.get("addressee_id")

    document = get_document_by_uuid(document_uuid)

    addressee = None
    if source == 'external_addressee':
        addressee = get_object_or_404(DirectorsOrganisations, id=addressee_id)
    if source == 'internal_addressee': 
        addressee = get_object_or_404(Staff, id=addressee_id)

    document.addressee = addressee
    document.save()


    context = {'document': document, 'source': source}

    return render(request, "./core/pages/sed/partials/documents/detail/addressee/partial_addressee_list.html", context)


@require_POST
def document_delete_addressee(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")

    document = get_document_by_uuid(document_uuid)

    document.addressee = None
    document.save()

    context = {'document': document}

    return render(request, "./core/pages/sed/partials/documents/detail/addressee/partial_addressees.html", context)


@require_POST
def document_upload_files(request: HtmxHttpRequest, *args, **kwargs) -> HttpResponse:
    document_uuid = kwargs.get('doc_uid')
    document_files = request.FILES.getlist('document_files')

    document = get_document_by_uuid(document_uuid)
    content_type_document = ContentType.objects.get_for_model(type(document))

    if not document_files:
        return JsonResponse({'error': 'Отсутствует файл'}, status=400)
    
    allowed_mime_types = ['application/pdf', 'application/x-pkcs7-signature']

    for uploaded_file in document_files:
        mime_type, _ = mimetypes.guess_type(uploaded_file.name)
        
        if mime_type not in allowed_mime_types:
            return JsonResponse({'error': f'Недопустимый тип файла: {uploaded_file.name}'}, status=400)
        
        original_name = uploaded_file.name
        safe_name = os.path.basename(original_name)
    
        document_file = DocumentFile(
            document=document.uuid,
            file=uploaded_file,
            content_type =content_type_document,
            owner=get_staff(request.user),
            file_name=safe_name
        )
        document_file.save()

        context = {'document_files': DocumentFile.objects.filter(document=document.uuid),'document': document}

    return render(request, "./core/pages/sed/partials/documents/detail/files/partial_document_files.html", context)

@require_POST
def document_registration(request: HtmxHttpRequest, *args, **kwargs) -> HttpResponse:
    document_uuid = kwargs.get('doc_uuid')
    document = get_document_by_uuid(document_uuid)

    missing_fields = []
    if not document.signatory:
        missing_fields.append("Подписант")
    if not document.addressee:
        missing_fields.append("Адресат")
    if not document.brief:
        missing_fields.append("Краткое содержание")

    if missing_fields:
        message = f"Ошибка регистрации документа в системе: <br> Не заполнены поля: {', '.join(missing_fields)}"
        return JsonResponse({'code': "11",'name': f"{message}"}, status=400)
    else:
        document.status = 'IN_WORKING'
        document.draft = False
        document.save() 

    documents_url = reverse('core:core-lk-documents')
    
    crumbs = [
        {"name": "Документы", "url": documents_url},
        {"name": "Мои документы", "url": documents_url},
        {"name": f"{document.type} №{document.registration_number}", "url": f"{request.path}"},
    ]

    document_files = DocumentFile.objects.filter(document=document.uuid)
    # document_preview = DocumentFile.objects.filter(document=document).first()

    context = {'document': document, 
                'crumbs': crumbs, 
                #'document_preview': document_preview,
                'document_files': document_files}
    
    context = {'document': document, 
               'crumbs': crumbs}

    return render(request, "./core/pages/sed/partials/documents/partial_sed_document_detail.html", context)


def get_file_preview(document_file):
    if not document_file:
        return [], 0

    file_path = document_file.file.path
    logging.debug(f"File path: {file_path}")
    try:
        images = convert_from_path(file_path)

        output_dir = os.path.join("media", "previews", str(document_file.document), str(document_file.id))
        # Создаем директорию с проверкой существования
        os.makedirs(output_dir, mode=0o755, exist_ok=True)

        # Проверяем, имеет ли текущий пользователь доступ к директории
        if not os.access(output_dir, os.W_OK):
            raise PermissionError(f"Нет доступа для записи в директорию: {output_dir}")

        image_urls = []
        for index, image in enumerate(images):
            page_image_path = os.path.join(output_dir, f"page_{index + 1}.jpg")
            if not os.path.exists(page_image_path):
                image.save(page_image_path, "JPEG")
            image_urls.append(f"/media/previews/{document_file.document}/{document_file.id}/page_{index + 1}.jpg")

        return image_urls, len(images)

    except Exception as e:
        logging.debug(f"Ошибка при обработке файла: {e}")
        return [], 0
    

@csrf_exempt
def document_sign(request):
    if request.method == 'GET' and request.htmx:
        template = './core/components/modals/document/sign_document.html'

        context = {'middle_modal': True, 'small_modal': False}

        return render(request, template, context)
   
    if request.method == 'POST':
            try:
                data = json.loads(request.body)
                signed_data = data['signature']
                original_data = data['data']


                decoded_file = base64.b64decode(original_data)

                response = HttpResponse(decoded_file, content_type='application/pdf')
                response['Content-Disposition'] = 'attachment; filename="signed_document.pdf"'
                return response
               
            except Exception as e:
                return JsonResponse({"status": "error", "message": str(e)}, status=500)
    return JsonResponse({"status": "error", "message": "Метод не разрешен."}, status=405)


def validate_signature(signed_data, original_data):
    # Реализация проверки подписи
    # Используйте CryptoPro API или pycades
    pass