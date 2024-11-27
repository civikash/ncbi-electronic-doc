from django.contrib import admin
from .models import TypeDocument, Document, Organisation, Department, Post

admin.site.register(TypeDocument)
admin.site.register(Document)
admin.site.register(Organisation)
admin.site.register(Department)
admin.site.register(Post)