from django.shortcuts import render
from core.models import Department, TypeDocument, Post


def appcontrol_app_documents(request):
    if request.htmx:
        documents = TypeDocument.objects.all()
        context = {"documents": documents}
        return render(request, './appcontrol/pages/app/partials/partial_app_documents.html', context)


def type_document_create(request):
    if request.method == 'GET' and request.htmx:
        template = './appcontrol/components/modal/app/modal_create_type_document.html'

        type_documents = TypeDocument.TYPE_CHOICES
        
        context = {'middle_modal': True, 'small_modal': False, 'type_documents': type_documents}

        return render(request, template, context)
    
    if request.method == 'POST':
        document_name = request.POST.get('type_document_name')
        document_short_name = request.POST.get('type_document_short_name')
        type_document_description = request.POST.get('type_document_description')
        type_document = request.POST.get('type_document')

        documents = TypeDocument.objects.all()
        context = {"documents": documents}

        try:
            TypeDocument.objects.create(name=document_name, 
                                        short_name=document_short_name,
                                        type=type_document,
                                        description=type_document_description)
            
            return render(request, './appcontrol/pages/app/partials/components/partial_types_documents.html', context)
        except Exception as e:
            return render(request, './appcontrol/pages/app/partials/components/partial_types_documents.html', context)

def appcontrol_app_departments(request):
    if request.htmx:
        departments = Department.objects.all()
        context = {"departments": departments}
        return render(request, './appcontrol/pages/app/partials/partial_app_departments.html', context)

def department_create(request):
    if request.method == 'GET' and request.htmx:
        template = './appcontrol/components/modal/app/modal_create_department.html'
        
        context = {'middle_modal': True, 'small_modal': True}

        return render(request, template, context)
    if request.method == 'POST':
        department_name = request.POST.get('department_name')

        departments = Department.objects.all()
        context = {"departments": departments}

        try:
            Department.objects.create(name=department_name)
            
            return render(request, './appcontrol/pages/app/partials/components/partial_departments.html', context)
        except Exception as e:
            return render(request, './appcontrol/pages/app/partials/components/partial_departments.html', context)
        
def appcontrol_app_posts(request):
    if request.htmx:
        posts = Post.objects.all()
        context = {"posts": posts}
        return render(request, './appcontrol/pages/app/partials/partial_app_posts.html', context)


def post_create(request):
    if request.method == 'GET' and request.htmx:
        template = './appcontrol/components/modal/app/modal_create_post.html'
        
        context = {'middle_modal': True, 'small_modal': True}

        return render(request, template, context)
    if request.method == 'POST':
        post_name = request.POST.get('post_name')

        posts = Post.objects.all()
        context = {"posts": posts}

        try:
            Post.objects.create(name=post_name)
            
            return render(request, './appcontrol/pages/app/partials/components/partial_posts.html', context)
        except Exception as e:
            return render(request, './appcontrol/pages/app/partials/components/partial_posts.html', context)
        