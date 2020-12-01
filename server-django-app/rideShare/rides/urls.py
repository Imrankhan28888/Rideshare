from django.urls import path
from .views import RideView

app_name = 'ride'

urlpatterns = [
    path('', RideView.as_view({'get': 'list'}), name='ride_list'),
    #We identified a trip_id in our URL configuration, which should be a UUID.
    path('<uuid:ride_id>/',
        RideView.as_view({'get': 'retrieve'}), name='ride_detail'),
]
