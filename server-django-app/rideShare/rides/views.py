from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import generics,permissions,viewsets
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Ride
from .serializers import LogInSerializer, UserSerializer, RideSerializer
from django.db.models import Q

# CreateAPIView - Helps us with the create operations
class SignUpView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


class LogInView(TokenObtainPairView):  
    serializer_class = LogInSerializer

# Here i am using the viewsets.ReadOnlyModelViewSet to expose only the read based operations to the client ( get all the ride list or a single pk based ride list)
class RideView(viewsets.ReadOnlyModelViewSet):
    #The lookup_field variable tells the view to get the trip record by its id value.
    lookup_field = 'id'
    # The lookup_url_kwarg variable tells the view what named parameter to use to extract the id value from the URL.
    lookup_url_kwarg = 'ride_id'
    permission_classes = (permissions.IsAuthenticated,)
    #queryset = Ride.objects.all()
    serializer_class = RideSerializer
    
    def get_queryset(self):  # new
        user = self.request.user
        if user.group == 'driver':
            return Ride.objects.filter(
                Q(status=Ride.REQUESTED) | Q(driver=user)
            )
        if user.group == 'rider':
            return Ride.objects.filter(rider=user)
        return Ride.objects.none()
