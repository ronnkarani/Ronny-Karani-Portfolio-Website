from django import template
from django.conf import settings
import os

register = template.Library()

@register.filter
def webp(image):
    """
    Returns .webp version only if the file exists.
    Otherwise returns the original image URL.
    """
    if not image:
        return ""

    # Get URL of the original image
    image_url = image.url if hasattr(image, "url") else image

    # Build full filesystem path
    image_path = os.path.join(settings.MEDIA_ROOT, image_url.replace(settings.MEDIA_URL, ""))

    # Replace extension with .webp
    base, ext = os.path.splitext(image_path)
    webp_path = base + ".webp"

    # Convert back to URL path
    base_url, ext = os.path.splitext(image_url)
    webp_url = base_url + ".webp"

    # If .webp exists, return it — else fallback to original
    if os.path.exists(webp_path):
        return webp_url
    return image_url
