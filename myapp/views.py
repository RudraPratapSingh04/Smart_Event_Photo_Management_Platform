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
from .models import OTPVerification,Event
from rest_framework.permissions import IsAuthenticated,AllowAny
from django.views.decorators.csrf import csrf_exempt
from .serializer import EventSerializer
from .models import Profile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Profile

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

    # Optional: check username uniqueness
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
@permission_classes([IsAuthenticated])
def view_profile(request):
    print("View profile API hit")

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