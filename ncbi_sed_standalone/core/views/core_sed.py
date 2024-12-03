from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from core.models import TypeDocument, Document, Staff, DocumentVisas
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.views.decorators.http import require_POST
from django.template.loader import render_to_string
import mimetypes
from django.db.models import Q
from django_htmx.middleware import HtmxDetails


class HtmxHttpRequest(HttpRequest):
    htmx: HtmxDetails


def get_staff(user):
    return Staff.objects.get(user=user)

def breadcrumb():
    pass

def documents_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_documents.html')
    return render(request, './core/pages/sed/sed_documents.html')


def search_staff(request):
    query = request.GET.get("staff", "").strip()
    search_all = request.GET.get("all", "false").lower() == "true"

    staff_queryset = Staff.objects.select_related("organisation", "department", "post").all()

    if not search_all and query:
        staff_queryset = staff_queryset.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(user__patronymic__icontains=query) |
            Q(post__name__icontains=query) |
            Q(department__name__icontains=query)
    )

    return render(request, "./core/components/partials/partial_staff_results.html", {"staff_list": staff_queryset})


@require_POST
def document_add_review(request: HtmxHttpRequest) -> HttpResponse:
    document_uuid = request.POST.get("document_uuid")
    staff_id = request.POST.get("staff_id")

    document = get_object_or_404(Document, uuid=document_uuid)
    staff = get_object_or_404(Staff, id=staff_id)

    review, created = DocumentVisas.objects.get_or_create(document=document, staff=staff)

    reviews = document.visas.select_related("staff")
    return render(request, "./core/pages/sed/partials/documents/partial_document_reviews_list.html", {"reviews": reviews})


def document_detail(request: HtmxHttpRequest, *args, **kwargs) -> HttpResponse:
    document_uuid = kwargs.get('doc_uid')
    document = get_object_or_404(Document, uuid=document_uuid)

    reviews = DocumentVisas.objects.filter(document=document)

    context = {'document': document, 'reviews': reviews}

    if request.htmx:
        if 'reviews' in request.GET:
            visas = Staff.objects.all()
            context['visas'] = visas
            return render(request, './core/pages/sed/partials/documents/partial_document_select_staff.html', {'visas': visas})
        else:
            return render(request, './core/pages/sed/partials/documents/partial_sed_document_detail.html', context)
    return render(request, './core/pages/sed/sed_document_detail.html', context)

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