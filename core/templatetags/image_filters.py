from django import template
import os

register = template.Library()

@register.filter
def webp(image):
    """
    Converts image URLs to .webp safely.
    Handles both ImageFieldFile objects and string paths.
    """
    if not image:
        return ""

    # Case 1: image is a Django ImageFieldFile
    if hasattr(image, "url"):
        image_url = image.url
    else:
        # Case 2: image is a string path like 'images/default_testimonial.png'
        image_url = image

    # Ensure the extension is replaced safely
    base, ext = os.path.splitext(image_url)
    return f"{base}.webp"
