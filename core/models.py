from django.db import models
from django.utils.text import slugify
from ckeditor_uploader.fields import RichTextUploadingField
from django.utils.text import Truncator
from django.utils import timezone
from django.contrib.auth.models import User
from django.urls import reverse


# Hero Section models here.
class Hero(models.Model):
    greeting = models.CharField(max_length=255, default="Hi 👋, I'm")
    name = models.CharField(max_length=255, default="Ronny Karani")
    emoji = models.CharField(max_length=10, default="👨‍💻", blank=True, null=True)
    headline = RichTextUploadingField(blank=True, null=True, max_length=255, default="A Full-Stack Software Engineer, Building Scalable &  Impact-Driven Digital Solutions")
    subtext_1 = RichTextUploadingField(blank=True, null=True)
    subtext_2 = RichTextUploadingField(blank=True, null=True)
    subtext_3 = RichTextUploadingField(blank=True, null=True)
    resume = models.FileField(upload_to="resumes/", blank=True, null=True)
    profile_image = models.ImageField(upload_to="hero/", default="ron.jpeg", blank=True, null=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hero Section ({self.name})"


# About Models
class About(models.Model):
    title = models.CharField(max_length=255, default="📂 About Me ")
    tagline = RichTextUploadingField(max_length=255, blank=True, null=True)  
    description_1 = RichTextUploadingField(blank=True, null=True)
    description_2 = RichTextUploadingField(blank=True, null=True)
    description_3 = RichTextUploadingField(blank=True, null=True)
    tech_stack = RichTextUploadingField(
    help_text="Enter tech stack details in plain text or HTML (e.g., <b>Frontend:</b> React, Tailwind)",
    blank=True,
    null=True
    )
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"About Section (Last updated: {self.updated_at.date()})"


# Social Link Models
class SocialLink(models.Model):
    PLATFORM_CHOICES = [
        ("facebook", "Facebook"),
        ("twitter", "Twitter"),
        ("linkedin", "LinkedIn"),
        ("github", "GitHub"),
        ("instagram", "Instagram"),
        ("youtube", "YouTube"),
        ("whatsapp", "Whatsapp"),
        ("telegram", "Telegram"),
    ]
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    url = models.URLField()

    def __str__(self):
        return f"{self.get_platform_display()} - {self.url}"


# Blog Category Models
class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Blog Categories"
        ordering = ['name']


# Project Category Models
class ProjectCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Project Categories"
        ordering = ['name']


# Project Models
class Project(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = RichTextUploadingField()
    category = models.ForeignKey(ProjectCategory, on_delete=models.SET_NULL,null=True, blank=True,
    related_name="projects")
    image = models.ImageField(upload_to='projects/')
    technologies = models.TextField(help_text="Comma-separated list")
    repo_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)
    created_at = models.DateField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def tech_list(self):
        return [tech.strip() for tech in self.technologies.split(',')]

    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('project_details', kwargs={'slug': self.slug})


# Blog Models
class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    excerpt = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
    BlogCategory, 
    on_delete=models.SET_NULL, 
    null=True, 
    blank=True,
    related_name="blog_posts"
)
    content = RichTextUploadingField()
    image = models.ImageField(upload_to='blogs/')
    author = models.CharField(max_length=100, default="Ronny")
    created_at = models.DateField(auto_now_add=True)
    views = models.PositiveIntegerField(default=0)
    likes = models.PositiveIntegerField(default=0)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        # auto-generate excerpt if empty
        if not self.excerpt:
            plain_text = self.content.replace("<p>", "").replace("</p>", "")  # remove HTML tags roughly
            self.excerpt = Truncator(plain_text).words(30)  # first 30 words
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return reverse('blog_detail', kwargs={'slug': self.slug})


# Skill Models
class Skill(models.Model):
    icon = models.CharField(max_length=10, help_text="Emoji or Icon")
    category = models.CharField(max_length=100, help_text="Category e.g. Frontend")
    stack = RichTextUploadingField(help_text="Tech stack or description")
    created_at = models.DateTimeField( default=timezone.now,)  
    
    def __str__(self):
        return f"{self.icon} {self.category}"
    
    class Meta:
        ordering = ['-created_at']


# Comment Models
class Comment(models.Model):
    name = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    # This will work for either a project or blog
    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name="comments")
    blog = models.ForeignKey(BlogPost, on_delete=models.CASCADE, null=True, blank=True, related_name="comments")

    def __str__(self):
        return f"Comment by {self.name}"


# Testimonial Models
class Testimonial(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=100, blank=True, null=True)  # e.g., "CEO, Company"
    message = RichTextUploadingField()
    rating = models.PositiveSmallIntegerField(default=5)  # ⭐ new field
    image = models.ImageField(upload_to="testimonials/", blank=True, null=True)  # ✅ new field
    approved = models.BooleanField(default=False)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({'Approved' if self.approved else 'Pending'})"

