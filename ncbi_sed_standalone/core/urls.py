from django.contrib import admin
from django.urls import path
from .views import core_interacting_organisations
from .views import core_document
from .views import core_folders
from .views.core_lk import lk_overview, lk_core, lk_logout, login_overview, authenticate_user
from .views.core_sed import search_staff, reviewdocuments_overview, incoming_overview, signdocuments_overview, recipients_overview
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
    path('documents/', login_required(core_document.documents_overview), name='core-lk-documents'),
    path('documents/folders/', login_required(core_folders.folders_overview), name='core-lk-folders'),
    path('documents/folders/<int:folder_id>/', login_required(core_folders.folder_detail), name='folders-folder'),
    path('documents/add-review/', login_required(core_document.document_add_review), name='core-lk-document-review'),
    path('documents/delete-review/', login_required(core_document.document_delete_review), name='core-lk-document-delete-review'),
    path('documents/add-signer/', login_required(core_document.document_add_signer), name='document-add-signer'),
    path('documents/delete-signer/', login_required(core_document.document_delete_signer), name='document-delete-signer'),
    path('documents/add-addressee/', login_required(core_document.document_add_addressee), name='document-add-addressee'),
    path('documents/delete-addressee/', login_required(core_document.document_delete_addressee), name='document-delete-addressee'),
    path('documents/<str:doc_uid>/', login_required(core_document.document_detail), name='core-lk-document-detail'),
    path('documents/<str:doc_uuid>/registration/', login_required(core_document.document_registration), name='document-registration'),
    path('documents/<str:doc_uid>/upload-files/', login_required(core_document.document_upload_files), name='document-upload-files'),
    path('documents/<str:doc_uuid>/update-requisites/', login_required(core_document.document_update_requisites), name='document-update-requisites'),

    path('incoming/', login_required(incoming_overview), name='core-lk-incoming'),
    path('signing/', login_required(signdocuments_overview), name='core-lk-signing'),
    path('reviews/', login_required(reviewdocuments_overview), name='core-lk-reviews'),
    path('recipients/', login_required(recipients_overview), name='core-lk-recipients'),
    path('recipients/new/', login_required(core_interacting_organisations.interacting_organisation_new), name='core-lk-recipients-new'),

    path('create/document/', login_required(core_document.create_document), name='core-lk-create-document'),

    path('document-sign/', login_required(core_document.document_sign), name='core-lk-document-sign'),

    #ОРГАНИЗАЦИЯ
    path('organisation/news/', login_required(news_overview), name='core-lk-organisation-news'),
    path('organisation/employees/', login_required(employees_overview), name='core-lk-organisation-employees'),

    path('logout/', login_required(lk_logout), name='core-lk-logout'),
]