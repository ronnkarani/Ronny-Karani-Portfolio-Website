from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.core.paginator import Paginator
from django.core.mail import send_mail
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.views import LoginView
from django.contrib.auth.views import LogoutView
from django.contrib import messages
from .models import Project, BlogPost, Skill, Comment, SocialLink, About, Hero, Testimonial, BlogCategory, ProjectCategory

# Create your views here.
def home(request):
    hero = Hero.objects.last()
    about = About.objects.last()
    social_links = SocialLink.objects.all()
    projects = Project.objects.order_by('-created_at')[:4] 
    blog = BlogPost.objects.order_by('-created_at')[:4]  
    skills = Skill.objects.all()
    testimonials = Testimonial.objects.all()
    blog_categories = BlogCategory.objects.all()[:5]  # Show first 5
    project_categories = ProjectCategory.objects.all()[:5]

    return render(request, 'home.html', {"hero": hero, "about": about, "social_links": social_links, 'projects': projects,'blog_posts': blog, 'skills': skills, "testimonials": testimonials, "blog_categories": blog_categories,
    "project_categories": project_categories,
})


def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home')
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # log the user in immediately
            return redirect('home')
    else:
        form = UserCreationForm()
    return render(request, 'signup.html', {'form': form})


class CustomLoginView(LoginView):
    template_name = 'login.html'

    def dispatch(self, request, *args, **kwargs):
        # ✅ Add this at the very top of dispatch
        if request.user.is_authenticated:
            return redirect('home')  # redirect logged-in users to home
        return super().dispatch(request, *args, **kwargs)


class CustomLogoutView(LogoutView):
    # allow GET requests
    http_method_names = ['get', 'post']
    next_page = '/'  # redirect to home after logout


def blog(request):
    posts = BlogPost.objects.order_by('-created_at')
    
    # Add category filtering
    category_slug = request.GET.get('category')
    if category_slug:
        posts = posts.filter(category__slug=category_slug)
    
    paginator = Paginator(posts, 4)  
    page_number = request.GET.get('page')
    blog_posts = paginator.get_page(page_number)
    
    # Get all categories for the filter
    blog_categories = BlogCategory.objects.all()
    
    return render(request, "blog.html", {
        "blog_posts": blog_posts,
        "blog_categories": blog_categories,
        "selected_category": category_slug
    })

def blog_detail(request, slug):
    blog = get_object_or_404(BlogPost, slug=slug)
    # --- increment views once per session (prevents refresh spamming)
    session_key = f"viewed_blog_{blog.pk}"
    if not request.session.get(session_key):
        blog.views = (blog.views or 0) + 1
        blog.save()
        request.session[session_key] = True

    # --- handle POST: like or comment
    if request.method == "POST":
        if "like" in request.POST:
            blog.likes = (blog.likes or 0) + 1
            blog.save()
            return redirect('blog_detail', slug=slug)
        elif "comment" in request.POST:
            name = request.POST.get("name", "Anonymous").strip()
            content = request.POST.get("content", "").strip()
            if content:
                Comment.objects.create(name=name or "Anonymous", content=content, blog=blog)
            return redirect('blog_detail', slug=slug)

    comments = blog.comments.order_by('-created_at') if hasattr(blog, 'comments') else []
    return render(request, 'blog_details.html', {'blog': blog, 'comments': comments})


def projects(request):
    project_list = Project.objects.order_by('-created_at')
    
    # Add category filtering
    category_slug = request.GET.get('category')
    if category_slug:
        project_list = project_list.filter(category__slug=category_slug)
    
    paginator = Paginator(project_list, 4) 
    page_number = request.GET.get('page')
    projects = paginator.get_page(page_number)
    
    # Get all categories for the filter
    project_categories = ProjectCategory.objects.all()
    
    return render(request, "projects.html", {
        "projects": projects,
        "project_categories": project_categories,
        "selected_category": category_slug
    })


def project_detail(request, slug):
    project = get_object_or_404(Project, slug=slug)
    # --- increment views once per session
    session_key = f"viewed_project_{project.pk}"
    if not request.session.get(session_key):
        project.views = (project.views or 0) + 1
        project.save()
        request.session[session_key] = True

    # --- handle POST: like or comment
    if request.method == "POST":
        if "like" in request.POST:
            project.likes = (project.likes or 0) + 1
            project.save()
            return redirect('project_details', slug=slug)
        elif "comment" in request.POST:
            name = request.POST.get("name", "Anonymous").strip()
            content = request.POST.get("content", "").strip()
            if content:
                Comment.objects.create(name=name or "Anonymous", content=content, project=project)
            return redirect('project_details', slug=slug)

    comments = project.comments.order_by('-created_at') if hasattr(project, 'comments') else []
    return render(request, 'project_details.html', {'project': project, 'comments': comments})


def contact(request):
    social_links = SocialLink.objects.all()

    return render(request, "contact.html", {"social_links": social_links,})

def send_message(request):
    if request.method == "POST":
        name = request.POST.get("name")
        email = request.POST.get("email")
        message = request.POST.get("message")

        subject = f"Portfolio Contact Form - {name}"
        body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}"

        try:
            send_mail(
                subject,
                body,
                'karanironny25@gmail.com',    # From
                ['karanironny25@gmail.com'],  # To
                fail_silently=False,
            )
            messages.success(request, "✅ Your message has been sent successfully. I'll get back to you soon!")
        except Exception as e:
            messages.error(request, "❌ Oops! Something went wrong. Please try again later.")

        return redirect("contact")
