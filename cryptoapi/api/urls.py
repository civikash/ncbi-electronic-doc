from django.urls import path
from .views import SigningDocument, PycadesVersion

app_name = 'api'

urlpatterns = [
    path('sign/', SigningDocument.as_view(), name='sign-document'),
    path('version/', PycadesVersion.as_view(), name='pycades-version'),
]