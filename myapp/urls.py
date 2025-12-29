from django.urls import path
from . import views

urlpatterns = [
    path('api/send-otp/', views.send_otp, name='send_otp'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    # path('api/resend-otp/', views.resend_otp, name='resend_otp'),
    path('api/verify-login/',views.verify_login,name='verify-login'),
    path('api/logout_session/',views.logout_session,name='logout_session'),
    path('api/dashboard/',views.dashboard,name='dashboard'),
    path('api/check_auth/',views.check_auth,name='check_auth')
]