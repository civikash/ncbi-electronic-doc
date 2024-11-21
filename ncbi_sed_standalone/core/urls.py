from django.contrib import admin
from django.urls import path
from .views.core_lk import lk_overview, lk_logout, login_overview
from .views.core_sed import documents_overview, create_document, incoming_overview, signdocuments_overview, recipients_overview
from .views.core_organisation import news_overview, employees_overview

app_name = 'core'

urlpatterns = [
    path('', lk_overview, name='core-lk'),
    path('login/', login_overview, name='core-lk-login'),

    #СЭД
    path('documents/', documents_overview, name='core-lk-documents'),
    path('incoming/', incoming_overview, name='core-lk-incoming'),
    path('signing/', signdocuments_overview, name='core-lk-signing'),
    path('recipients/', recipients_overview, name='core-lk-recipients'),

    path('create/document/', create_document, name='core-lk-create-document'),

    #ОРГАНИЗАЦИЯ
    path('organisation/news/', news_overview, name='core-lk-organisation-news'),
    path('organisation/employees/', employees_overview, name='core-lk-organisation-employees'),

    path('logout/', lk_logout, name='core-lk-logout'),
]