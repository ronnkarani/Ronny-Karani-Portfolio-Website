from django.shortcuts import redirect
from django.urls import reverse

class RestrictAdminMiddleware:
    """Allow only superusers to access the Django admin panel."""
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Only restrict admin area
        if request.path.startswith(reverse('admin:index')):
            # If user is not superuser, redirect
            if not request.user.is_superuser:
                return redirect('home')  # or use a 403 page if you prefer
        return self.get_response(request)
