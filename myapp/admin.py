from django.contrib import admin
from .models import Profile,Event,Photo,Like,Tag
# Register your models here.
admin.site.register(Profile)
admin.site.register(Event)
admin.site.register(Photo)
admin.site.register(Like)
admin.site.register(Tag)
