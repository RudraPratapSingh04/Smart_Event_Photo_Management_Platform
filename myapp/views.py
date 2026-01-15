from datetime import timedelta
import random
from django.utils import timezone
from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.conf import settings
from django.db.models import Q

from myapp.tasks import process_photo
from .models import OTPVerification,Event
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.views.decorators.csrf import csrf_exempt
from .serializer import EventSerializer,EventPhotoSerializer
from .models import Profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Profile,Photo,Event,Like,Comment,Favourite,Tag
from django.http import FileResponse

# from django.views.decorators.csrf import csrf_exempt
# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_login(request):
    username=request.data.get("username")
    password=request.data.get("password")
    if not username or not password:
        return Response(
            {"message":"Username or password missing"},
            status=status.HTTP_400_BAD_REQUEST
        )
    user=authenticate(username=username,password=password)
    if user is not None:
        login(request,user)
        print("Logging in")
        return Response({
           
            "message":"Login successful",
            "user":{
                "id":user.id,
                "username":user.username,
                "email":user.email
            }
        },
        status=status.HTTP_200_OK)
    return Response({
        "message":"Invalid credentials"
    },status=status.HTTP_401_UNAUTHORIZED)



@api_view(['POST'])
@permission_classes([AllowAny])
def send_otp(request):
    
    email= request.data.get('email')
    username=request.data.get('username')
    password=request.data.get('password')
    
    if not username or not password or not email:
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    
    
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'EmailAlreadyTaken'}, status=status.HTTP_400_BAD_REQUEST)


    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': 'UsernameAlreadyTaken'}, status=status.HTTP_400_BAD_REQUEST)
    print("SEND OTP API HIT")
    otp=int(random.randint(100000,999999))
    OTPVerification.objects.filter(email__iexact=email).delete()
    print(f"OTP GENERATED {otp}")
    # OTPVerification.objects.create(
    #     user=User.objects.create_user(username=username,email=email,password=password),
    #     otp_code=otp
    # )
    OTPVerification.objects.create(
        email=email,
        otp_code=otp,
        valid_till=timezone.now() +timedelta(minutes=5)
        
    )
    print(email)
    try:
        print(otp)
    except Exception as e:
        print("failed to send otp kuchh karo",{e})
        return Response({'error': 'Failed to send OTP email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({
        'message':'OTP sent successfully to your email.',
    },status=status.HTTP_200_OK
    )
@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
     email= request.data.get('email')
     username=request.data.get('username')
     password = request.data.get('password')
     otp_code=request.data.get('otp')
     if not username or not email or not password:
          return Response({'error':'Some internal error occured'},status=status.HTTP_400_BAD_REQUEST)
     if not otp_code:
            return Response({'error':'OTP code is required.'}, status=status.HTTP_400_BAD_REQUEST)
     try:
        otp_obj = OTPVerification.objects.filter(email__iexact=email, otp_code=otp_code, is_used=False).first()

        if not otp_obj:
            return Response({'error': 'Invalid OTP.'}, status=400)

        if timezone.now() > otp_obj.valid_till:
            return Response({'error': 'OTP has expired.'}, status=400)

        otp_obj.is_used = True
        otp_obj.save()

       
        if User.objects.filter(username__iexact=username).exists():
            return Response({'error': 'UsernameAlreadyTaken'}, status=400)
        if User.objects.filter(email__iexact=email).exists():
            return Response({'error': 'EmailAlreadyTaken'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)

        return Response({
            'message': 'OTP verified successfully. User created.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }, status=200)

     except Exception as e:
      return Response({'error': f'Internal server error: {str(e)}'}, status=500) 

  
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    return Response({
        'message': f'Welcome to your dashboard, {request.user.username}!'
    }, status=status.HTTP_200_OK)



@api_view(['POST', 'OPTIONS'])
@permission_classes([AllowAny])
def logout_session(request):
    print("Logout request initiated")
    logout(request)
    return Response({"message": "Logged out"})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_auth(request):
    return Response({"message": "Authenticated", "user_id": request.user.id,"email":request.user.email}, status=200)

@api_view(['GET'])
def view_events(request):
    user=request.user
    is_guest=user.groups.filter(name="Guest").exists()
    events=Event.objects.all().order_by('-event_date')
    if is_guest:
        events=events.filter(member_only=False)
    serializer=EventSerializer(events,many=True)
    return Response(serializer.data,status=200)

@api_view(['POST'])
def create_event(request):
    if not request.user.has_perm('myapp.add_event'):
        return Response({"message":"Permission denied"},status=403)
    title=request.data.get("title")
    event_head_username=request.data.get("event_head")
    event_cc_username=request.data.get("event_cc")
    member_only=request.data.get("member_only",False)
    if not title or not event_head_username or not event_cc_username:
        return Response({"message":"Missing fields"},status=400)
    event_head=User.objects.get(username=event_head_username)
    try:
        
        event_cc=User.objects.get(username=event_cc_username)
    except User.DoesNotExist:
        event_cc=event_head
    
    event=Event.objects.create(
        title=title,
        event_head_id=event_head.id,
        event_cc_id=event_cc.id,
        member_only=member_only
    )

@api_view(['GET'])
def check_guest(request):
    user=request.user
    is_guest=user.groups.filter(name="Guest").exists()
    return Response({"is_guest":is_guest},status=200)
@api_view(['GET'])
def check_photographer(request):
    user=request.user
    is_photographer=user.groups.filter(name="Photographer").exists()
    return Response({"is_photographer":is_photographer},status=200)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def view_profile(request):
    user = request.user

    try:
        profile = Profile.objects.get(user=user)
    except Profile.DoesNotExist:
        return Response(
            {"error": "Profile not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    data = {
        "username": user.username,
        "email": user.email,
        "bio": profile.bio,
        "batch": profile.batch,
        "department": profile.dept_info,
        "admin_right": profile.Admin_Right,
        "no_of_downloads": profile.no_of_downloads,
        "joined_at": profile.joined_at,
        "profile_picture": profile.profile_picture.url if profile.profile_picture else None
    }

    return Response(data, status=status.HTTP_200_OK)

@api_view(['POST'])
def addnew_event(request):
    print("Api hit")
    user=request.user
    profile = request.user.profile
    title = request.data.get('title')
    event_date = request.data.get('event_date')
    member_only = request.data.get('member_only', False)
    is_guest=user.groups.filter(name="Guest").exists()
    if(is_guest):
        return Response({'error': 'Guests are not allowed to add events.'}, status=status.HTTP_403_FORBIDDEN)
    try:
        Event.objects.create(
            title=title,
            event_date=event_date,
            event_head=profile,
            member_only=member_only
        )
        return Response({'message': 'Event created successfully.'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': f'Failed to create event: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
@api_view(['GET'])
def event_photos(request,event_slug):
    event=Event.objects.get(slug=event_slug)
    photos=Photo.objects.all().order_by('-uploaded_at')
    photos=photos.filter(event_id=event.id)
    serializer=EventPhotoSerializer(photos,many=True)
    return Response(serializer.data,status=200)

        
    
@api_view(['POST'])
def upload_photos(request):
    photos = request.FILES.getlist("photos")
    event_slug=request.data.get("event_slug")
    if not photos:
        return Response({'error':"Some error occured"},status=400)
    for photo in photos:
        Photo.objects.create(
            uploader_id=request.user.profile,
            event=Event.objects.get(slug=event_slug),
            image=photo,
            status="uploaded"
        )
        
    return Response(
        {
            "message": "Uploaded",
            
        },
        status=201
    )

@api_view(['POST'])
def photo_properties(request):
    
    photo_id=request.data.get("photo_id")
    photo=Photo.objects.get(id=photo_id)
    likes_count=Like.objects.filter(photo=photo).count()
    comments_count=Comment.objects.filter(photo=photo).count()
    profile=request.user.profile
    photo.total_Views+=1
    photo.save()
    is_liked=False
    isFavourite=False
    if Favourite.objects.filter(user=profile, photo=photo).exists():
        isFavourite=True
    if Like.objects.filter(liked_by=profile, photo=photo).exists():
        is_liked=True
    print(is_liked)
    data={
        "camera_model":photo.camera_model,
        "aperture":photo.aperture,
        "shutter_speed":photo.shutter_speed,
        "gps_Location":photo.gps_Location,
        "comments_count":comments_count,
        "likes_count":likes_count,
        "total_Views":photo.total_Views,
        "downloads":photo.downloads,
        "is_Liked":is_liked,
        "isFavourite":isFavourite,
        "uploaded_at":photo.uploaded_at,
        
    }
    return Response(data,status=200)
@api_view(['POST'])
def toggle_like(request):
    photo_id=request.data.get("photo_id")
    profile=request.user.profile
    photo=Photo.objects.get(id=photo_id)
    like_obj=Like.objects.filter(liked_by=profile, photo=photo).first()
    if like_obj:
        like_obj.delete()
        return Response({"message":"Photo unliked"},status=200)
    else:
        Like.objects.create(
            liked_by=profile,
            photo=photo
        )
        return Response({"message":"Photo liked"},status=200)
    
@api_view(['POST'])
def toggle_favourite(request):
    photo_id=request.data.get("photo_id")
    profile=request.user.profile
    photo=Photo.objects.get(id=photo_id)
    add_to_fav_obj=Favourite.objects.filter(user=profile, photo=photo).first()
    if add_to_fav_obj:
        add_to_fav_obj.delete()
        return Response({"message":"Photo removed from favourites"},status=200)
    else:
        Favourite.objects.create(
            user=profile,
            photo=photo
        )
        return Response({"message":"Photo added to favourites"},status=200)
@api_view(['GET'])
def favourite_photos(request):
    profile=request.user.profile
    fav_photos=Favourite.objects.filter(user=profile)
    photos=set()
    for photo in fav_photos:
        photos.add(photo.photo)
    serializer=EventPhotoSerializer([fav.photo for fav in fav_photos],many=True)
    return Response(serializer.data,status=200)

@api_view(['POST'])
def update_profile_picture(request):
    profile = request.user.profile
    new_picture = request.FILES.get('profile_picture')

    if not new_picture:
        return Response({'error': 'No picture uploaded.'}, status=400)

    profile.profile_picture = new_picture
    profile.save()

    return Response({'message': 'Profile picture updated successfully.'}, status=200)
@api_view(['POST'])
def update_bio(request):
    
    profile=request.user.profile
    bio=request.data.get("bio")
    profile.bio=bio
    profile.save()
    return Response({'message':'Bio updates successfully'},status=200)
@api_view(['POST'])
def load_tagged_users(request):
    photo=Photo.objects.get(id=request.data.get("photo_id"))
    tagged_whom=Tag.objects.all().filter(photo=photo, tagged_whom=request.user.profile).select_related("tagged_whom").distinct("tagged_whom_id")
    tagged_users=Tag.objects.all().filter(photo=photo,tagged_by=request.user.profile).select_related("tagged_by","tagged_whom").order_by("tagged_whom_id")
    taggedBy=[]
    taggedUsers=[]
    for tag in tagged_whom:
        taggedBy.append({
            "id":tag.tagged_by.user.id,     
            "username":tag.tagged_by.user.username
        })
    for tag in tagged_users:
        taggedUsers.append({
            "id":tag.tagged_whom.user.id,
            "username":tag.tagged_whom.user.username
        })
    print(taggedUsers)
    return Response({
        "tagged_by":list(taggedBy),
        "tagged_users":list(taggedUsers)
    },status=200)

@api_view(["POST"])
def tagUser(request):
    photo = Photo.objects.get(id=request.data["photo_id"])
    user = User.objects.get(id=request.data["user_id"])

    if user.id == request.user.id:
        return Response({"message": "You cannot tag yourself."}, status=400)

    Tag.objects.get_or_create(
        photo=photo,
        tagged_whom=user.profile,
        tagged_by=request.user.profile
    )

    return Response({"success": True})
@api_view(["GET"])
def search_users(request):
    q = request.GET.get("q", "")
    users = User.objects.filter(username__icontains=q).exclude(id=request.user.id)[:10]
    return Response([
        {"id": u.id, "username": u.username}
        for u in users
    ])


@api_view(["GET"])
def search_photos(request):
    q = request.GET.get("q", "").strip()
    if not q:
        return Response([], status=200)

    photos = Photo.objects.filter(
        Q(event__title__icontains=q) | Q(uploader_id__user__username__icontains=q)
    ).select_related("event", "uploader_id")[:25]

    serializer = EventPhotoSerializer(photos, many=True)
    return Response(serializer.data, status=200)

@api_view(['GET'])
def tagged_images(request):
    profile=request.user.profile
    tagged_images=Tag.objects.filter(tagged_whom=profile)
    photos=set()
    for photo in tagged_images:
        photos.add(photo.photo)
    serializer=EventPhotoSerializer([tag.photo for tag in tagged_images],many=True)
    return Response(serializer.data,status=200)
@api_view(['POST'])
def load_comments(request):
    photo=Photo.objects.get(id=request.data.get("photo_id"))
    comments=Comment.objects.filter(photo=photo).order_by("-commented_at")[:10]
    comments_data=[]
    for comment in comments:
        comments_data.append({
            "id":comment.id,
            "commented_by":comment.commented_by.user.username,
            "content":comment.description,
            "commented_at":comment.commented_at
        })
    return Response({
        "comments":comments_data
    },status=200)

@api_view(['POST'])
def add_comment(request):
    profile=request.user.profile
    description=request.data.get("content")
    photo=Photo.objects.get(id=request.data.get("photo_id"))
    Comment.objects.create(
        commented_by=profile,
        description=description,
        photo=photo
   )    
    return Response({"message":"Comment added successfully"},status=200)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_photo(request, photo_id):
    photo = Photo.objects.get(id=photo_id)
    photo.downloads += 1
    photo.save()
    file = photo.image.open('rb')
    filename = f"photo_{photo.id}.jpg"
    return FileResponse(file, as_attachment=True, filename=filename)
