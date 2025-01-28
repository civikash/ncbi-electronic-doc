from django.shortcuts import render
from django.contrib.auth.hashers import make_password
from core.models import Post, Department, User, Staff

def appcontrol_users_create(request):
    if request.method == 'GET' and request.htmx:
        template = './appcontrol/components/modal/users/modal_create_user.html'

        posts = Post.objects.all()
        departments = Department.objects.all()
        roles = User.ROLE_SYSTEM

        context = {'middle_modal': True, 'roles': roles, 'small_modal': False, 'posts': posts, 'departments': departments}

        return render(request, template, context)
    if request.method == 'POST':
        last_name = request.POST.get('last_name')
        first_name = request.POST.get('first_name')
        patronymic = request.POST.get('patronymic')
        email = request.POST.get('email')
        password = request.POST.get('password')
        id_post = request.POST.get('post')
        id_department = request.POST.get('department')
        role = request.POST.get('role')

        department = Department.objects.get(id=id_department) 
        post = Post.objects.get(id=id_post)

        if email and password:
            if User.objects.filter(email=email).exists():
                return render()
            
            user = User.objects.create(
                email=email,
                password=make_password(password),
                is_staff=True,
                first_name=first_name,
                last_name=last_name,
                patronymic=patronymic,
                role=role
            )

            Staff.objects.create(
                 user=user,
                 department=department,
                 post=post
            )

            context = {
                'users': Staff.objects.all()
            }

            return render(request, './appcontrol/pages/users/partials/components/partial_users.html', context)