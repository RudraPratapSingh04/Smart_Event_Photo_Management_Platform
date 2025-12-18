from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.core.mail import send_mail
from django.conf import settings
from .models import OTPVerification
# Create your views here.
@api_view(['POST'])
def send_otp(request):
    username=request.data.get('username')
    password=request.data.get('password')
    if not username or not password:
        return Response({'error': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    user=authenticate(request,username=username,password=password)
    if user is not None:
        otp=OTPVerification.objects.create(user=user)

        try:
            send_mail(
                'Your OTP Code',
                f'Your OTP code is: {otp.otp_code}',
                settings.DEFAULT_FROM_EMAIL,
                [user.email],
                fail_silently=False,
            )
            return Response( {
                'message': 'OTP sent successfully.',
                'user_id': user.id,
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': 'Failed to send OTP email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
            return Response({'error':' Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED  )
    
@api_view(['POST'])
def verify_otp(request):
     user_id=request.data.get('user_id')
     otp_code=request.data.get('otp_code')
     if not user_id:
          return Response({'error':'Some internal error occured'},status=status.HTTP_400_BAD_REQUEST)
     if not otp_code:
            return Response({'error':'OTP code is required.'}, status=status.HTTP_400_BAD_REQUEST)
     try:
          user=User.objects.get(id=user_id)
          otp=OTPVerification.objects.filter(user=user,otp_code=otp_code,is_used=False).order_by('created_at').first()
          if not otp:
            #    print('Error is occuring here')
               return Response({'error':'Invalid OTP'},status=status.HTTP_400_BAD_REQUEST)
          if otp.is_valid():
            otp.is_used=True
            otp.save()
            login(request,user)
            return Response({
                 'message':'OTP verified successfully',
                 'user':{
                      'id':user.id,
                      'username':user.username,
                      'email':user.email
                 }
            },status=status.HTTP_200_OK)
          else:
               return Response({'error':'Invalid/Incorrect OTP '},status=status.HTTP_400_BAD_REQUEST)
     except User.DoesNotExist:
        return Response({'error':'User does not exist'},status=status.HTTP_404_NOT_FOUND)
     except Exception as e:
          print(f"Error: {e}")
          return Response({'error':'Some internal error occured'},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
@api_view(['POST'])
def resend_otp(request):
     user_id=request.data.get('user_id')
     user=User.objects.get(id=user_id)
     otp=OTPVerification.objects.create(user=user)
     try:
        send_mail(
            'Your OTP Code',
             f'Your OTP code is: {otp.otp_code}',
             settings.DEFAULT_FROM_EMAIL,
             [user.email],
             fail_silently=False,
            )
        return Response(   {
                'message': 'OTP re-sent successfully.',
                'user_id': user.id,
            }, status=status.HTTP_200_OK)
     except User.DoesNotExist:
        return Response({'error':'User does not exist'},status=status.HTTP_404_NOT_FOUND)
     except Exception as e:
        return Response({'error': 'Failed to send OTP email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

               


