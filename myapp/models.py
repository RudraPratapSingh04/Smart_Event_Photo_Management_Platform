from django.db import models
from django.contrib.auth.models import User
import random
from datetime import datetime,timedelta
from django.utils import timezone
from django.utils.text import slugify

# Create your models here.

class Profile(models.Model):
      user=models.OneToOneField(User,on_delete=models.CASCADE)
      Admin_Right=models.BooleanField(default=False)
      oauth_User_Id=models.CharField(max_length=50,null=True,blank=True)
#       email=models.EmailField()
      profile_picture = models.ImageField(upload_to='profile_pics/',null=True,blank=True)
      bio=models.TextField(max_length=300)
      batch=models.CharField(max_length=10)
      dept_info=models.CharField(max_length=50)
      no_of_downloads=models.IntegerField(default=0)
      joined_at=models.DateTimeField(auto_now_add=True)

      def __str__(self):    
        return self.user.username
class OTPVerification(models.Model):
       # user=models.ForeignKey(User,on_delete=models.CASCADE)
       email=models.EmailField(max_length=56)
       otp_code=models.CharField(max_length=6)
       created_at=models.DateTimeField(auto_now_add=True)
       valid_till=models.DateTimeField()
       is_used=models.BooleanField(default=False)

       def is_valid(self):
        return not self.is_used and timezone.now() < self.valid_till

       def __str__(self):
        return f"OTP for {self.email}: {self.otp_code}"
    

class  Location(models.Model):
    name=models.CharField(max_length=50)
    def __str__(self):
        return self.name
class Event(models.Model):
      title=models.CharField(max_length=100)
      slug=models.SlugField(unique=True,null=True)
      event_date=models.DateTimeField(default=timezone.now)
      event_head=models.ForeignKey(Profile,on_delete=models.PROTECT,related_name='event_head_id')
      event_cc=models.ForeignKey(Profile,on_delete=models.PROTECT,related_name='event_cc_id',null=True,blank=True)
      member_only=models.BooleanField(default=False)
      def __str__(self):
        return self.title
      def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            count = 1
            while Event.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{count}"
                count += 1
            self.slug = slug
        super().save(*args, **kwargs)


class Photo(models.Model):
      uploader_id=models.ForeignKey(Profile,on_delete=models.PROTECT)
      event=models.ForeignKey(Event,on_delete=models.PROTECT)
      image=models.ImageField(upload_to='photos/originals')
      thumbnail=models.ImageField(upload_to='photos/thumbnails/',null=True,blank=True)
      status=models.CharField(
          max_length=20,
          choices=[
              ("processing","processing"),
              ("done","done"),
              ("failed","failed")
          ],
          default="processing"
      )
      watermarked=models.BooleanField(default=False)      
      camera_model=models.CharField(max_length=30,null=True,blank=True)
      aperture=models.CharField(max_length=30,null=True,blank=True)
      shutter_speed=models.CharField(max_length=30,null=True,blank=True)
      gps_Location=models.CharField(max_length=100,null=True,blank=True)
      total_Views=models.IntegerField(default=0)
      downloads=models.IntegerField(default=0)
      uploaded_at=models.DateTimeField(auto_now_add=True)

class Watermark(models.Model):
       watermark_desc=models.CharField(max_length=100)
       owner=models.ForeignKey(Profile,on_delete=models.CASCADE)
       photo=models.ForeignKey(Photo,on_delete=models.CASCADE)
       def __str__(self):
        return self.watermark_desc

class Reference_photo(models.Model):
       photo=models.ForeignKey(Photo,on_delete=models.PROTECT)
       user=models.ForeignKey(Profile,on_delete=models.CASCADE)
class Favourite (models.Model):
       user=models.ForeignKey(Profile,on_delete=models.CASCADE)
       photo=models.ForeignKey(Photo,on_delete=models.PROTECT)
 
class Like(models.Model):
       liked_by=models.ForeignKey(Profile,on_delete=models.CASCADE)
       photo=models.ForeignKey(Photo,on_delete=models.PROTECT)
       liked_at=models.DateTimeField(auto_now_add=True)
       class Meta:
        unique_together = ('liked_by', 'photo')
class Comment(models.Model):
       commented_by=models.ForeignKey(Profile,on_delete=models.CASCADE)
       description=models.TextField(max_length=500)
       photo=models.ForeignKey(Photo,on_delete=models.CASCADE)
       commented_at=models.DateTimeField(auto_now_add=True)
class Notification(models.Model):
       notification_time=models.DateTimeField(auto_now_add=True)
       ActivityOnPhoto=models.BooleanField(default=False)
       new_post=models.BooleanField(default=False)
       new_comment=models.BooleanField(default=False)
       new_like=models.BooleanField(default=False)
       new_tag=models.BooleanField(default=False)
       activity_by=models.ForeignKey(Profile,on_delete=models.CASCADE)
       photoId=models.ForeignKey(Photo,on_delete=models.CASCADE)
       newEvent=models.BooleanField(default=False)
       eventId=models.ForeignKey(Event,on_delete=models.CASCADE)

class Tag(models.Model):
       tagged_by=models.ForeignKey(Profile,on_delete=models.CASCADE,related_name='tagged_by')
       tagged_whom=models.ForeignKey(Profile,on_delete=models.CASCADE,related_name='tagged_whom')
       tagged_at=models.DateTimeField(auto_now_add=True)
       photo_id=models.ForeignKey(Photo,on_delete=models.CASCADE)
class Photo_tag(models.Model):
       tag_description=models.TextField(max_length=50)
       photo_id=models.ForeignKey(Photo,on_delete=models.PROTECT)
       confidence_Score=models.FloatField()