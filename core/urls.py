from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .views import signup_view, CustomLoginView
from django.contrib.auth.views import LogoutView

urlpatterns = [
    path('api/search/blog/', views.blog_search_api, name='blog_search_api'),
    path('api/search/project/', views.project_search_api, name='project_search_api'),
    path('', views.home, name='home'),
    path('signup/', signup_view, name='signup'),
    path('login/', CustomLoginView.as_view(next_page='home'), name='login'),
    path('logout/', LogoutView.as_view(next_page='home'), name='custom_logout'),
    path('blog/', views.blog, name='blog'),
    path('projects/', views.projects, name='projects'),
    path('contact/', views.contact, name='contact'),
    path("send-message/", views.send_message, name="send_message"),
    path('blog/<slug:slug>/', views.blog_detail, name='blog_detail'),
    path('projects/<slug:slug>/', views.project_detail, name='project_details'),
    path('add-testimonial/', views.add_testimonial, name='add_testimonial'),
    
]
