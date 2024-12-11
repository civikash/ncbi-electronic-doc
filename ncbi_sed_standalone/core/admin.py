from django.contrib import admin
from .models import DocumentType, Folder, FolderObject, DocumentVisas, DirectorsOrganisations, InteractingOrganisations, IncomingDocuments, InternalDocuments, Organisation, Department, Post

admin.site.register(DocumentVisas)
admin.site.register(DirectorsOrganisations)
admin.site.register(InteractingOrganisations)
admin.site.register(DocumentType)
admin.site.register(IncomingDocuments)
admin.site.register(InternalDocuments)
admin.site.register(Organisation)
admin.site.register(Department)
admin.site.register(Post)

admin.site.register(Folder)
admin.site.register(FolderObject)