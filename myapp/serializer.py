from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Event,Photo

class EventSerializer(serializers.ModelSerializer):
    event_head_username = serializers.CharField(
        source='event_head.user.username',
        read_only=True
    )
    event_cc_username = serializers.CharField(
        source='event_cc.user.username',
        read_only=True
    )

    class Meta:
        model = Event
        fields = [
            'id',
            'slug',
            'title',
            'event_date',
            'event_head_username',
            'event_cc_username',
            'member_only',
        ]
class EventPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model=Photo
        fields=['id','image','watermarked','camera_model','aperture','shutter_speed','gps_Location','total_Views','downloads','uploaded_at']
