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