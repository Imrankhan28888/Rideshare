from django.db import models
from django.contrib.auth.models import AbstractUser
from django.shortcuts import reverse
import uuid
from django.conf import settings
# Create your models here.

# Simple User model to start with. Inheriting from the Django Abstrat user
# REf:- https://docs.djangoproject.com/en/3.1/topics/auth/customizing/
class User(AbstractUser):
    @property
    def group(self):
        groups = self.groups.all()
        return groups[0].name if groups else None


# Since a trip is simply a trip event between a starting location and a destination, i have  included a pick-up address and a drop-off address. At any given point in time, a trip can be in a specific state, so we added a status tuple datastructure to identify whether a trip is requested, started, in progress, or completed. 

class Ride(models.Model):  
    # come up with some tuple based on the internet search it seems to be best to group events in tuple 
    REQUESTED = 'REQUESTED'
    STARTED = 'STARTED'
    IN_PROGRESS = 'IN_PROGRESS'
    COMPLETED = 'COMPLETED'
    STATUSES = (
        (REQUESTED, REQUESTED),
        (STARTED, STARTED),
        (IN_PROGRESS, IN_PROGRESS),
        (COMPLETED, COMPLETED),
    )
    #Lastly, we need to have a consistent way to identify and track trips that is also difficult for #someone to guess. So, we used a UUID for our Trip model.
    # don't know if this works or their is a better approach got it from geek-to-geek site
    #REF:- https: // www.geeksforgeeks.org/uuidfield-django-models/
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pick_up_address = models.CharField(max_length=255)
    drop_off_address = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20, choices=STATUSES, default=REQUESTED)
    driver = models.ForeignKey(  # new
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        related_name='trips_as_driver'
    )
    rider = models.ForeignKey(  # new
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.DO_NOTHING,
        related_name='trips_as_rider'
    )
    # def __str__(self):
    #     return f'{self.id}'
    
    # mainly added to get the absolute url.. let see this works
    # Ref : https://docs.djangoproject.com/en/3.1/ref/urlresolvers/
    def get_absolute_url(self):
        return reverse('ride:ride_detail', kwargs={'ride_id': self.id})
