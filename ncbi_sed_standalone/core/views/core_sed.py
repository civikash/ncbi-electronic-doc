from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from typing import Optional, Type
from core.models import DocumentType, Document, Staff, DocumentVisas, InteractingOrganisations, IncomingDocuments, OutgoingDocuments, InternalDocuments, CATEGORY_DOCUMENT_CHOICES
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


def search_staff(request):
    query = request.GET.get("q", "").strip()
    search_all = request.GET.get("all", "false").lower() == "true"
    type = request.GET.get("type")
    source = request.GET.get("source")

    staff_queryset = Staff.objects.select_related("organisation", "department", "post").all()

    if not search_all and query:
        staff_queryset = staff_queryset.filter(
            Q(user__first_name__icontains=query) |
            Q(user__last_name__icontains=query) |
            Q(user__patronymic__icontains=query) |
            Q(post__name__icontains=query) |
            Q(department__name__icontains=query)
    )
    if type == 'addressee':
        return render(request, "./core/pages/sed/partials/documents/detail/addressee/partial_addressee_result.html", {"addressees": staff_queryset, "source": source})
    if type == 'signer':
        return render(request, "./core/pages/sed/partials/documents/detail/signer/partial_signer_result.html", {"signers": staff_queryset, "source": source})
    return render(request, "./core/pages/sed/partials/documents/detail/reviews/partial_reviews_results.html", {"staff_list": staff_queryset})


def incoming_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_incoming.html')
    return render(request, './core/pages/sed/sed_incoming.html')
    
def signdocuments_overview(request):
    if request.htmx:
        return render(request, './core/pages/sed/partials/partial_sed_signing.html')
    return render(request, './core/pages/sed/sed_signing.html')

def recipients_overview(request):
    context = {
        'organisations': InteractingOrganisations.objects.all()
    }
    if request.htmx:
        return render(request, './core/pages/sed/partials/interacting_organisations/partial_organisations.html', context)
    return render(request, './core/pages/sed/sed_recipients.html', context)