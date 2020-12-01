import pytest
from channels.testing import WebsocketCommunicator
from channels.layers import get_channel_layer

from rideShare.routing import application

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken


#Django Channels mandates the use of both pytest and asyncio.
#####IMP##########
#execute " python -m pytest -s" to view the output on the console when you run pytest.


#Just including a TEST_CHANNEL_LAYERS constant at the top of the file after the imports. We're using that constant in the first line of our test along with the settings fixture provided by pytest-django. This line of code effectively overwrites the application's settings to use the InMemoryChannelLayer instead of the configured RedisChannelLayer. Doing this allows us to focus our tests on the behavior we are programming rather than the implementation with Redis. Rest assured that when we run our server in a non-testing environment, Redis will be used.

TEST_CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    },
}


@database_sync_to_async
def create_user(username, password):
    user = get_user_model().objects.create_user(
        username=username,
        password=password
    )
    access = AccessToken.for_user(user)
    return user, access

# enabling-database-access-in-tests
#https: // pytest-django.readthedocs.io/en/latest/database.html
@pytest.mark.asyncio
@pytest.mark.django_db(transaction=True)
class TestWebSocket:
    async def test_can_connect_to_server(self, settings):
        print("1st test case")
        #override the redis channel setting with the inbuilt InMemory channel layer setting for testing 
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        #call the create_user() function to get the access token and then pass it as a query string parameter in the communicator's path.
        _, access = await create_user('test.user@example.com', 'pAssw0rd')
        print(access)
        communicator = WebsocketCommunicator(
            application=application,
            #path='/rideShare/'
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()
        print(connected)
        print(_)
        assert connected is True
        await communicator.disconnect()


#Sending and Receiving Messages Section

# In this test, after we establish a connection with the server, we send a message and wait to get one back. We expect the server to echo our message right back to us exactly the way we sent it. In fact, we need to program this behavior on the server.

    async def test_can_send_and_receive_messages(self, settings):
        print("2nd test case")
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        #call the create_user() function to get the access token and then pass it as a query string parameter in the communicator's path.
        _, access = await create_user('test.user@example.com', 'pAssw0rd')
        communicator = WebsocketCommunicator(
            application=application,
            #path='/rideShare/'
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()
        assert connected is True
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        await communicator.send_json_to(message)
        response = await communicator.receive_json_from()
        print(response)
        assert response == message
        await communicator.disconnect()


#Sending and Receiving Broadcast Messages
#how to make one application talk to another through broadcast messaging.
# Here i am using the channel layer to broadcast a message to a group. Whereas the last test a user talking to himself in an empty room, this most recent test represents a user talking to a room full of people.

# Further i created a dummy group here 'test' (await channel_layer.group_send('test', message=message)) to test the broadcast behavior

# add the group 'test' to the consumer part.

    async def test_can_send_and_receive_broadcast_messages(self, settings):
        print("3rd test case")
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        _, access = await create_user('test.user@example.com', 'pAssw0rd')
        communicator = WebsocketCommunicator(
            application=application,
            #path='/rideShare/'
            path=f'/rideShare/?token={access}'
        )
        connected, _ = await communicator.connect()
        assert connected is True
        message = {
            'type': 'echo.message',
            'data': 'This is a test message.',
        }
        channel_layer = get_channel_layer()
        await channel_layer.group_send('test', message=message)
        response = await communicator.receive_json_from()
        print(response)
        assert response == message
        await communicator.disconnect()
    
    async def test_cannot_connect_to_socket(self, settings):
        print("4th test case")
        settings.CHANNEL_LAYERS = TEST_CHANNEL_LAYERS
        _, access = await create_user('test.user@example.com', 'pAssw0rd')
        communicator = WebsocketCommunicator(
            application=application,
            path='/rideShare/'
        )
        connected, _ = await communicator.connect()
        assert connected is False
        await communicator.disconnect()

# from django.contrib.auth.models import Group


# @database_sync_to_async
# def create_user(  # changed
#     username,
#     password,
#     group='rider'
# ):
#     # Create user.
#     user = get_user_model().objects.create_user(
#         username=username,
#         password=password
#     )

#     # Create user group.
#     user_group, _ = Group.objects.get_or_create(name=group)  # new
#     user.groups.add(user_group)
#     user.save()

#     # Create access token.
#     access = AccessToken.for_user(user)

#     return user, access
