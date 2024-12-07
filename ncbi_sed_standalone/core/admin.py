from django.contrib import admin
from .models import DocumentType, DocumentVisas, IncomingDocuments, InternalDocuments, Organisation, Department, Post

admin.site.register(DocumentVisas)
admin.site.register(DocumentType)
admin.site.register(IncomingDocuments)
admin.site.register(InternalDocuments)
admin.site.register(Organisation)
admin.site.register(Department)
admin.site.register(Post)