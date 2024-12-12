from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from core.models import DocumentType, Staff, DocumentVisas, DirectorsOrganisations, InteractingOrganisations, IncomingDocuments, OutgoingDocuments, InternalDocuments, CATEGORY_DOCUMENT_CHOICES
from django.http import HttpResponse, HttpRequest
from django.template.loader import render_to_string
from django.db.models import Q
from django.views.decorators.http import require_POST
from django_htmx.middleware import HtmxDetails
from .core_document import get_document_by_uuid

class HtmxHttpRequest(HttpRequest):
    htmx: HtmxDetails

def get_staff(user):
    return Staff.objects.get(user=user)

def interacting_organisation_new(request):
    template = './core/pages/sed/partials/interacting_organisations/partial_new_organisation.html'
    context = {'organisations': InteractingOrganisations.objects.all()}
    if request.htmx:
        if request.method == 'GET': 
            documents_url = reverse('core:core-lk-recipients')
            crumbs = [
                {"name": "Взаимодействующие организации", "url": documents_url},
                {"name": "Новая организация", "url": f"{request.path}"},
            ]

            context = {
                'crumbs': crumbs,
            }
            return render(request, template, context)
        
        if request.method == 'POST':
            full_name = request.POST.get('full_name')
            short_name = request.POST.get('short_name')
            inn = request.POST.get('inn')
            ogrn = request.POST.get('ogrn')
            city = request.POST.get('city')
            index = request.POST.get('index')
            region = request.POST.get('region')
            legal_address = request.POST.get('legal_address')
            last_name = request.POST.get('last_name')
            first_name = request.POST.get('first_name')
            patronymic = request.POST.get('patronymic')
            post = request.POST.get('post')

            try:
                if not InteractingOrganisations.objects.filter(Q(inn=inn) & Q(ogrn=ogrn)):
                    organisation = InteractingOrganisations.objects.create(
                        full_name=full_name, short_name=short_name, inn=inn,
                        ogrn=ogrn, city=city, region=region, index=index,
                        legal_address=legal_address
                    )
                    organisation.save()

                    DirectorsOrganisations.objects.create(
                        first_name=first_name, last_name=last_name,
                        patronymic=patronymic, post=post, organisation=organisation
                    )

                return render(request, './core/pages/sed/partials/interacting_organisations/partial_organisations.html', context)
            except Exception as e:
                print(e)
                return render(request, './core/pages/sed/partials/interacting_organisations/partial_organisations.html', context)
            

def search_organisation(request):
    query = request.GET.get("q", "").strip()
    type = request.GET.get("type")
    source = request.GET.get("source")

    organisation_queryset = DirectorsOrganisations.objects.all()

    if query:
        organisation_queryset = organisation_queryset.filter(
            Q(organisation__full_name__icontains=query) |
            Q(organisation__short_name__icontains=query) |
            Q(organisation__inn__icontains=query) |
            Q(organisation__ogrn__icontains=query) |
            Q(first_name__icontains=query) |
            Q(last_name__icontains=query)
    )
    if type == 'addressee':
        return render(request, "./core/pages/sed/partials/documents/detail/addressee/partial_addressee_result.html", {"directors": organisation_queryset, "source": source})
    if type == 'signer':
        return render(request, "./core/pages/sed/partials/documents/detail/signer/partial_signer_result.html", {"directors": organisation_queryset, "source": source})
    return render(request, "./core/components/partials/partial_organisations_results.html", {"directors": organisation_queryset})