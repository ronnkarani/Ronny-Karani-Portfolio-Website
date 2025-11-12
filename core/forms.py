from django import forms
from .models import Testimonial

class TestimonialForm(forms.ModelForm):
    use_default_image = forms.BooleanField(required=False, label="Use default image")

    class Meta:
        model = Testimonial
        fields = ['name', 'role', 'message', 'image', 'use_default_image', 'rating']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Write your testimonial...'}),
            'rating': forms.NumberInput(attrs={'min': 1, 'max': 5}),
        }
