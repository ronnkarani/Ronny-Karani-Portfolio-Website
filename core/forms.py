from django import forms
from .models import Testimonial

class TestimonialForm(forms.ModelForm):
    class Meta:
        model = Testimonial
        fields = ['name', 'role', 'message',  'rating']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 4, 'placeholder': 'Write your testimonial...'}),
            'rating': forms.NumberInput(attrs={'min': 1, 'max': 5}),
        }