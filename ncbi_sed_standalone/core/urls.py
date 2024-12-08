from django.contrib import admin
from django.urls import path
from .views import core_interacting_organisations
from .views import core_document
from .views.core_lk import lk_overview, lk_core, lk_logout, login_overview, authenticate_user
from .views.core_sed import documents_overview, search_staff, incoming_overview, signdocuments_overview, recipients_overview
from .views.core_organisation import news_overview, employees_overview
from django.contrib.auth.decorators import login_required

app_name = 'core'

urlpatterns = [
    path('', login_required(lk_core), name='core'),
    path('space/', login_required(lk_overview), name='core-lk'),
    path('login/', login_overview, name='core-lk-login'),
    path('login/auth/', authenticate_user, name='core-lk-login-auth'),

    #СЭД
    path('staff-search/', login_required(search_staff), name='core-lk-staff-search'),
    path('organisation-search/', login_required(core_interacting_organisations.search_organisation), name='core-lk-organisation-search'),
    path('documents/', login_required(documents_overview), name='core-lk-documents'),
    path('documents/add-review/', login_required(core_document.document_add_review), name='core-lk-document-review'),
    path('documents/delete-review/', login_required(core_document.document_delete_review), name='core-lk-document-delete-review'),
    path('documents/add-signer/', login_required(core_document.document_add_signer), name='document-add-signer'),
    path('documents/delete-signer/', login_required(core_document.document_delete_signer), name='document-delete-signer'),
    path('documents/<str:doc_uid>/', login_required(core_document.document_detail), name='core-lk-document-detail'),
    
    path('incoming/', login_required(incoming_overview), name='core-lk-incoming'),
    path('signing/', login_required(signdocuments_overview), name='core-lk-signing'),
    path('recipients/', login_required(recipients_overview), name='core-lk-recipients'),
    path('recipients/new/', login_required(core_interacting_organisations.interacting_organisation_new), name='core-lk-recipients-new'),

    path('create/document/', login_required(core_document.create_document), name='core-lk-create-document'),

    #ОРГАНИЗАЦИЯ
    path('organisation/news/', login_required(news_overview), name='core-lk-organisation-news'),
    path('organisation/employees/', login_required(employees_overview), name='core-lk-organisation-employees'),

    path('logout/', login_required(lk_logout), name='core-lk-logout'),
]