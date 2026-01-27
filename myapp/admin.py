from django.contrib import admin
from .models import Profile,Event,Photo,Like,Tag,Comment

class EventAdmin(admin.ModelAdmin):
    filter_horizontal = ('upload_access_users',) 
    
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if obj.event_head:
            obj.upload_access_users.add(obj.event_head.user)
        if obj.event_cc:
            obj.upload_access_users.add(obj.event_cc.user)

# Register your models here.
admin.site.register(Profile)
admin.site.register(Event, EventAdmin)
admin.site.register(Photo)
admin.site.register(Like)
admin.site.register(Tag)
admin.site.register(Comment)
