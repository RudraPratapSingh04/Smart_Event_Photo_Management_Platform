from django.urls import path,include
from . import views

urlpatterns = [
    path("api/", include("myapp.urls")),
    path('api/send-otp/', views.send_otp, name='send_otp'),
    path('api/verify-otp/', views.verify_otp, name='verify_otp'),
    path('api/verify-login/',views.verify_login,name='verify-login'),
    path('api/logout_session/',views.logout_session,name='logout_session'),
    path('api/dashboard/',views.dashboard,name='dashboard'),
    path('api/check_auth/',views.check_auth,name='check_auth'),
    path('api/view_profile/',views.view_profile,name='view_profile'),
    path('api/view_events/',views.view_events,name='view_events'),
    path('api/check_guest/',views.check_guest,name='check_guest'),
    path('api/addnew_event/',views.addnew_event,name='addnew_event'),  
    path('api/event_photos/<str:event_slug>/',views.event_photos,name='event_photos'), 
    path('api/check_photographer/',views.check_photographer,name='check_photographer'),
    path('api/upload_photos/',views.upload_photos,name='upload_photos'),
]