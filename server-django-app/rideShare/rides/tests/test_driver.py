import pytest
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer

from rideShare.routing import application

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import Group

from rides.models import Ride
# Django Channels mandates the use of both pytest and asyncio.
#####IMP##########
# execute " python -m pytest -s" to view the output on the console when you run pytest.


# Just including a TEST_CHANNEL_LAYERS constant at the top of the file after the imports. We're using that constant in the first line of our test along with the settings fixture provided by pytest-django. This line of code effectively overwrites the application's settings to use the InMemoryChannelLayer instead of the configured RedisChannelLayer. Doing this allows us to focus our tests on the behavior we are programming rather than the implementation with Redis. Rest assured that when we run our server in a non-testing environment, Redis will be used.

TEST_CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}

# The moment a driver logs into our app, they join a pool of drivers that can accept requests from riders. We'll test this by creating a driver and logging them in, sending a broadcast message to the driver group, and confirming that the driver receives the message.


@database_sync_to_async
def create_user(username, password, group='rider'):
    # user = get_user_model().objects.create_user(
    #     username=username,
    #     password=password,
    #     group='rider'
    # )
    # Create user.
    user = get_user_model().objects.create_user(
        username=username,
        password=password
    )

    # Create user group.
    user_group, _ = Group.objects.get_or_create(name=group)  # new
    user.groups.add(user_group)
    user.save()

    # Create access token.
    access = AccessToken.for_user(user)

    return user, access


@database_sync_to_async
def create_ride(
    pick_up_address='123 Main Street',
    drop_off_address='456 Piney Road',
    status='REQUESTED',
    rider=None,
    driver=None
):
    return Ride.objects.create(
        pick_up_address=pick_up_address,
        drop_off_address=drop_off_address,
        status=status,
        rider=rider,
        driver=driver
    )

@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
class TestWebSocket:
    async def test_can_connect_to_server(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        _, access = await create_user(
            'test.user@example.com', 'pAssw0rd'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()
        assert connected is True
        await communicator.disconnect()

    # async def test_join_driver_pool(self, settings):
    #     settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
    #     _, access = await create_user(
    #         'test.user@example.com', 'pAssw0rd', 'rider'
    #     )
    #     communicator = WebsocketCommunicator(
    #         application=application,
    #         path=f'/rideShare/?token={access}'
    #     )
    #     connected, _ = await communicator.connect()
    #     print(connected)
    #     message = {
    #         'type': 'echo.message',
    #         'data': 'This is a test message.',
    #     }
    #     channel_layer = get_channel_layer()
    #     await channel_layer.group_send('drivers', message=message)
    #     response = await communicator.receive_json_from()
    #     assert response == message
    #     await communicator.disconnect()
# When a rider requests a ride, the server will create a new Ride record and will broadcast the request to the driver pool. But from the rider's perspective, they will only get a message back confirming the creation of a new ride. That's what this test does

    async def test_request_trip(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()
        await communicator.send_json_to({
            'type': 'create.ride',
            'data': {
                'pick_up_address': '123 Main Street',
                'drop_off_address': '456 Piney Road',
                'rider': user.id,
            },
        })
        response = await communicator.receive_json_from()
        response_data = response.get('data')
        print(f"Response data-3 {response_data}")
        assert response_data['id'] is not None
        assert response_data['pick_up_address'] == '123 Main Street'
        assert response_data['drop_off_address'] == '456 Piney Road'
        assert response_data['status'] == 'REQUESTED'
        assert response_data['rider']['username'] == user.username
        assert response_data['driver'] is None
        await communicator.disconnect()


# """
# Test:- A ride request should be broadcast to all drivers in the driver pool the moment it's sent. 

# We start off by creating a channel layer and adding it to the driver pool. Every message that's broadcast to the drivers group will be captured on the test_channel. Next, we establish a connection to the server as a rider, and we send a new request message over the wire. Finally, we wait for the broadcast message to reach the drivers group, and we confirm the identity of the rider who sent it.
# """

    async def test_driver_alerted_on_request(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS

        # Listen to the 'drivers' group test channel.
        channel_layer = get_channel_layer()
        print(f"\nTest-4 channel_layer {channel_layer}")
        await channel_layer.group_add(
            group='drivers',
            channel='test_channel'
        )

        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()

        # Request a trip.
        await communicator.send_json_to({
            'type': 'create.ride',
            'data': {
                'pick_up_address': '123 Main Street',
                'drop_off_address': '456 Piney Road',
                    'rider': user.id,
            },
        })

        # Receive JSON message from server on test channel.
        response = await channel_layer.receive('test_channel')
        response_data = response.get('data')
        print(f"\nResponse data-4 {response_data}")
        assert response_data['id'] is not None
        assert response_data['rider']['username'] == user.username
        assert response_data['driver'] is None
        await communicator.disconnect()


# TEST: Listening for an Update

# We have handled creating a ride and broadcasting it to drivers, but we haven't built a mechanism for receiving messages back from the drivers yet. Remember: When the rider sends a request, we create a Trip record and link them to it. We're missing the piece that associates the correct communication channel with that rider.

# We need to add two pieces of functionality:

# 1. Create a group for the new Ride record and add the rider to it.


    async def test_create_trip_group(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()

        # Send a ride request.
        await communicator.send_json_to({
            'type': 'create.ride',
            'data': {
                'pick_up_address': '123 Main Street',
                'drop_off_address': '456 Piney Road',
                'rider': user.id,
            },
        })
        response = await communicator.receive_json_from()
        response_data = response.get('data')
        print(f"\nResponse data-5 {response_data}")
        # Send a message to the ride group.
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send(response_data['id'], message=message)

        # Rider receives message.
        response = await communicator.receive_json_from()
        assert response == message

        await communicator.disconnect()

# 2. Add the rider to all of the ride-related groups they they belong to when the WebSocket connects and remove them from them when the WebSocket disconnects.
    async def test_join_trip_group_on_connect(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'rider'
        )
        ride = await create_ride(rider=user)
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()

        # Send a message to the trip group.
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f'{ride.id}', message=message)

        # Rider receives message.
        response = await communicator.receive_json_from()
        assert response == message

        await communicator.disconnect()


# A rider has sent a request to the server. The server has broadcasted the request to everyone in the driver pool. Now what? A driver needs to accept the request and start driving to the pick up address.

# TEST: Listening for an Update

# When a driver accepts a trip request, we need to tell the rider who requested the trip that the request has been filled.
# In the test below, we create a rider and a ride instance and then we start listening on the communication channel associated with the ride. Next, we create a driver and send a message to the server to update the ride db. Lastly, we confirm that the message gets broadcast to the rider.
    async def test_driver_can_update_trip(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS

        # Create trip request.
        rider, _ = await create_user(
            'test.rider@example.com', 'pAssw0rd', 'rider'
        )
        ride = await create_ride(rider=rider)
        ride_id = f'{ride.id}'

        # Listen for messages as rider.
        channel_layer = get_channel_layer()
        await channel_layer.group_add(
            group=ride_id,
            channel='test_channel'
        )

        # Create a driver instance and Update Ride DB.
        driver, access = await create_user(
            'test.driver@example.com', 'pAssw0rd', 'driver'
        )
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()
        message = {
            'type': 'update.ride',
            'data': {
                'id': ride_id,
                'pick_up_address': ride.pick_up_address,
                'drop_off_address': ride.drop_off_address,
                'status': Ride.IN_PROGRESS,
                'driver': driver.id,
            },
        }
        await communicator.send_json_to(message)

        # Rider receives message.
        response = await channel_layer.receive('test_channel')
        response_data = response.get('data')
        
        assert response_data['id'] == ride_id
        assert response_data['rider']['username'] == rider.username
        assert response_data['driver']['username'] == driver.username

        await communicator.disconnect()

# TEST: Joining a Trip

# To test to prove that riders were added to the appropriate communication channels when they reconnected to the server.
# Remember: We're already testing the functionality that adds drivers to the driver pool on login. This test confirms that once a driver has joined a trip (by accepting a trip request), they are added back to the trip's communication channel when they reconnect.

    async def test_driver_join_trip_group_on_connect(self, settings):
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        user, access = await create_user(
            'test.user@example.com', 'pAssw0rd', 'driver'
        )
        trip = await create_ride(driver=user)
        communicator = WebsocketCommunicator(
            application=application,
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()

        # Send a message to the trip group.
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send(f'{trip.id}', message=message)

        # Rider receives message.
        response = await communicator.receive_json_from()
        assert response == message

        await communicator.disconnect()
