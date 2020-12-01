from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
import base64
import json
from rides.serializers import RideSerializer, UserSerializer  
from rides.models import Ride  
from django.contrib.auth.models import Group

PASSWORD = 'pAssw0rd!'

#update the create_user() function to take an additional group_name parameter:
def create_user(username='user@example.com', password=PASSWORD, group_name='rider'):  
    # return get_user_model().objects.create_user(
    #     username=username,
    #     first_name='Test',
    #     last_name='User',
    #     password=password
    # )
    group, _ = Group.objects.get_or_create(name=group_name)
    user = get_user_model().objects.create_user(
        username=username, password=password)
    user.groups.add(group)
    user.save()
    return user
    
class AuthenticationTest(APITestCase):
    def test_user_can_sign_up(self):
        response = self.client.post(reverse('sign_up'), data={
            'username': 'user@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password1': PASSWORD,
            'password2': PASSWORD,
            'group': 'rider',
        })
        user = get_user_model().objects.last()
        self.assertEqual(status.HTTP_201_CREATED, response.status_code)
        self.assertEqual(response.data['id'], user.id)
        self.assertEqual(response.data['username'], user.username)
        self.assertEqual(response.data['first_name'], user.first_name)
        self.assertEqual(response.data['last_name'], user.last_name)
        self.assertEqual(response.data['group'], user.group)
        
    def test_user_can_log_in(self):  
        user = create_user()
        response = self.client.post(reverse('log_in'), data={
            'username': user.username,
            'password': PASSWORD,
        })

        # Parse payload data from access token.
        access = response.data['access']
        header, payload, signature = access.split('.')
        #print(header)
        #print(payload)
        #print(signature)
        decoded_payload = base64.b64decode(f'{payload}==')
        #print(decoded_payload)
        payload_data = json.loads(decoded_payload)
        #print(payload_data)
        
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertIsNotNone(response.data['refresh'])
        self.assertEqual(payload_data['id'], user.id)
        self.assertEqual(payload_data['username'], user.username)
        self.assertEqual(payload_data['first_name'], user.first_name)
        self.assertEqual(payload_data['last_name'], user.last_name)


class HttpTripTest(APITestCase):
    # EARLIER ONE BEFORE ADDING GROUPS
    # def setUp(self):
    #     user = create_user()
    #     response = self.client.post(reverse('log_in'), data={
    #         'username': user.username,
    #         'password': PASSWORD,
    #     })
    #     self.access = response.data['access']
    def setUp(self):
        self.user = create_user()  # changed
        self.client.login(username=self.user.username,
                    password=PASSWORD)  # changed

    def test_user_can_list_trips(self):  # changed
        rides = [
            Ride.objects.create(
                pick_up_address='A', drop_off_address='B', rider=self.user),
            Ride.objects.create(
                pick_up_address='B', drop_off_address='C', rider=self.user),
            Ride.objects.create(
                pick_up_address='C', drop_off_address='D')
        ]
        response = self.client.get(reverse('ride:ride_list'))
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        exp_ride_ids = [str(ride.id) for ride in rides[0:2]]
        act_ride_ids = [ride.get('id') for ride in response.data]
        self.assertCountEqual(act_ride_ids, exp_ride_ids)

    def test_user_can_retrieve_trip_by_id(self):  # changed
        ride = Ride.objects.create(
            pick_up_address='A', drop_off_address='B', rider=self.user)
        response = self.client.get(ride.get_absolute_url())
        self.assertEqual(status.HTTP_200_OK, response.status_code)
        self.assertEqual(str(ride.id), response.data.get('id'))
    
    
    
    # EARLIER ONE BEFORE ADDING GROUPS
    # def test_user_can_list_rides(self):
    #     rides = [
    #         Ride.objects.create(pick_up_address='A', drop_off_address='B'),
    #         Ride.objects.create(pick_up_address='B', drop_off_address='C')
    #     ]
    #     response = self.client.get(reverse('ride:ride_list'),
    #                             HTTP_AUTHORIZATION=f'Bearer {self.access}'
    #                 )
    #     self.assertEqual(status.HTTP_200_OK, response.status_code)
    #     exp_ride_ids = [str(ride.id) for ride in rides]
    #     act_ride_ids = [ride.get('id') for ride in response.data]
    #     self.assertCountEqual(exp_ride_ids, act_ride_ids)

    # def test_user_can_retrieve_ride_by_id(self):
    #     ride = Ride.objects.create(pick_up_address='A', drop_off_address='B')
    #     response = self.client.get(ride.get_absolute_url(),
    #                         HTTP_AUTHORIZATION=f'Bearer {self.access}'
    #                         )
    #     self.assertEqual(status.HTTP_200_OK, response.status_code)
    #     print(response.data.get('id'))
    #     print(str(ride.id))
    #     self.assertEqual(str(ride.id), response.data.get('id'))
