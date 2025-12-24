from django.db import models
from django.contrib.auth.models import User
import random
from datetime import datetime,timedelta

# Create your models here.


class Profile(models.Model):
      user=models.OneToOneField(User,on_delete=models.CASCADE)
      Admin_Right=models.BooleanField(default=False)
      oauth_User_Id=models.CharField(max_length=50)
#       email=models.EmailField()
      profile_picture = models.ImageField(upload_to='profile_pics/')
      bio=models.TextField(max_length=300)
      batch=models.CharField(max_length=10)
      dept_info=models.CharField(max_length=50)
      no_of_downloads=models.IntegerField(default=0)
      joined_at=models.DateTimeField(auto_now_add=True)
 
      def __str__(self):    
        return self.user.username
class OTPVerification(models.Model):
       user=models.ForeignKey(User,on_delete=models.CASCADE)
       otp_code=models.CharField(max_length=6)
       created_at=models.DateTimeField(auto_now_add=True)
       valid_till=models.DateTimeField()
       is_used=models.BooleanField(default=False)

       def save(self,*args,**kwargs):
              if not self.otp_code:
                     self.otp_code=str(random.randint(100000,999999))
              if not self.valid_till:
                     self.valid_till=datetime.now()+timedelta(minutes=10)
              super().save(*args,**kwargs)
       def is_valid(self):
        from django.utils import timezone
        return not self.is_used and timezone.now() < self.valid_till
    
       def __str__(self):
        return f"OTP for {self.user.username}: {self.otp_code}"
class  Location(models.Model):
    name=models.CharField(max_length=50)
    def __str__(self):
        return self.name
class Event(models.Model):
      title=models.CharField(max_length=100)
      created_at=models.DateTimeField(auto_now_add=True)
      event_head_id=models.ForeignKey(Profile,on_delete=models.PROTECT,related_name='event_head_id')
      event_cc_id=models.ForeignKey(Profile,on_delete=models.PROTECT,related_name='event_cc_id')
      location=models.ForeignKey(Location,on_delete=models.PROTECT)
      def __str__(self):
        return self.title


class Photo(models.Model):
      uploader_id=models.ForeignKey(Profile,on_delete=models.PROTECT)
      event_id=models.ForeignKey(Event,on_delete=models.PROTECT)
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
       photo_id=models.ForeignKey(Photo,on_delete=models.CASCADE)
       def __str__(self):
        return self.watermark_desc

class Reference_photo(models.Model):
       photo_id=models.ForeignKey(Photo,on_delete=models.PROTECT)
       user_id=models.ForeignKey(Profile,on_delete=models.CASCADE)
class Favourite (models.Model):
       user_id=models.ForeignKey(Profile,on_delete=models.CASCADE)
       photo_id=models.ForeignKey(Photo,on_delete=models.PROTECT)
 
class Like(models.Model):
       liked_by=models.ForeignKey(Profile,on_delete=models.CASCADE)
       photo_id=models.ForeignKey(Photo,on_delete=models.PROTECT)
       liked_at=models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
       commented_by=models.ForeignKey(Profile,on_delete=models.CASCADE)
       description=models.TextField(max_length=500)
       photo_id=models.ForeignKey(Photo,on_delete=models.CASCADE)
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