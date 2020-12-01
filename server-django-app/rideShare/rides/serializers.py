from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Ride
from django.contrib.auth.models import Group

class UserSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    # To track users as drivers or riders. Users can be either. But as soon as we add a UI, we'll need a way for users to sign up with a role. 
    # Drivers will see a different UI and experience different functionality than riders.
    # The first thing we need to do is add support for user groups in our serializers
    group = serializers.CharField()

    def validate(self, data):
        if data['password1'] != data['password2']:
            raise serializers.ValidationError('Passwords must match.')
        return data

    def create(self, validated_data):
        group_data = validated_data.pop('group')
        group, _ = Group.objects.get_or_create(name=group_data)
        print(group)
        data = {
            key: value for key, value in validated_data.items()
            if key not in ('password1', 'password2')
        }
        data['password'] = validated_data['password1']
        user = self.Meta.model.objects.create_user(**data)
        user.groups.add(group)
        user.save()
        return user
        #return self.Meta.model.objects.create_user(**data)

    class Meta:
        model = get_user_model()
        fields = (
            'id', 'username', 'password1', 'password2',
            'first_name', 'last_name', 'group',
        )
        read_only_fields = ('id',)

# Reference from https://tools.ietf.org/html/rfc7519#section-4.3
class LogInSerializer(TokenObtainPairSerializer):  
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        user_data = UserSerializer(user).data
        for key, value in user_data.items():
            if key != 'id':
                token[key] = value
        return token


# By default, our RideSerializer processes related models as primary keys. That's the exact behavior that we want when we use a serializer to create a database record. On the other hand, when we get the serialized Ride data back from the server, we want more information about the rider and the driver than just their database IDs.

# Let's create a new NestedRideSerializer after our existing RideSerializer. The difference is that the NestedRideSerializer serializes the full User object instead of its primary key.

class RideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at',)


class NestedRideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ride
        fields = '__all__'
        depth = 1
