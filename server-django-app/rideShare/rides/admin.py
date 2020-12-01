from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin

from .models import User, Ride
# Register your models here.


@admin.register(User)
class UserAdmin(DefaultUserAdmin):
    pass


@admin.register(Ride)
class RideAdmin(admin.ModelAdmin):
    fields = (
        'id', 'pick_up_address', 'drop_off_address', 'status', 'driver', 'rider', 'created_at', 'updated_at',
    )
    list_display = (
        'id', 'pick_up_address', 'drop_off_address', 'status', 'driver', 'rider', 'created_at', 'updated_at',
    )
    list_filter = (
        'status',
    )
    readonly_fields = (
        'id', 'created_at', 'updated_at',
    )
