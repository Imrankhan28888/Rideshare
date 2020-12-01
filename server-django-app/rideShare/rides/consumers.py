from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async


from rides.serializers import NestedRideSerializer, RideSerializer
from rides.models import Ride

# A Channels consumer is like a Django view with extra steps
# to support the WebSocket protocol. Whereas a Django view can
# only process an incoming request,

# A Channels consumer can send and receive messages and
# react to the WebSocket connection being opened and closed.

# We are using a generic consumer class called AsyncJsonWebsocketConsumer, which handles WebSocket communication by translating to and from the JSON format.

# Any client connected to the RideConsumer through WebSockets will automatically be subscribed to the test group. When a channel layer sends a broadcast message with the type echo.message, Channels will execute the echo_message() function for everyone in the test group.


class RideConsumer(AsyncJsonWebsocketConsumer):
    #groups = ['test']

    @database_sync_to_async
    def _create_ride(self, data):
        serializer = RideSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.create(serializer.validated_data)

    @database_sync_to_async
    def _get_ride_data(self, ride):
        return NestedRideSerializer(ride).data

    @database_sync_to_async
    def _get_user_group(self, user):
        return user.groups.first().name
    # Here the helper function(_get_trip_ids) processes the Trip records according to whether the user is a rider or a driver. Regardless of what group the user belongs to, they will be added to and removed from the correct communication channels.

    @database_sync_to_async
    def _get_trip_ids(self, user):
        user_groups = user.groups.values_list('name', flat=True)
        # We are using the ORM exclude to get the record where the status of the ride is not completed yet
        if 'driver' in user_groups:
            trip_ids = user.trips_as_driver.exclude(
                status=Ride.COMPLETED
            ).only('id').values_list('id', flat=True)
        else:
            trip_ids = user.trips_as_rider.exclude(
                status=Ride.COMPLETED
            ).only('id').values_list('id', flat=True)
        return map(str, trip_ids)

    @database_sync_to_async
    def _update_trip(self, data):
        instance = Ride.objects.get(id=data.get('id'))
        serializer = RideSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return serializer.update(instance, serializer.validated_data)
    
    async def connect(self):
        # orginal one
        # print(self.channel_name)
        # await self.channel_layer.group_add(
        #     group='test',
        #     channel=self.channel_name
        # )
        # await self.accept()
        # new one with driver pool. We are updating our consumer to subscribe a user to the driver group if the user is a driver. Make the following changes to the connect() and disconnect() methods on the consumer

        # reject any connection that does not have an authenticated user.
        user = self.scope['user']
        print(user)
        if user.is_anonymous:
            await self.close()
        else:
            user_group = await self._get_user_group(user)
            if user_group == 'driver':
                await self.channel_layer.group_add(
                    group='drivers',
                    channel=self.channel_name
                )
            print(
                f"\nInside Connect METH in consumers.py, the Channel_Name is {self.channel_name}")
            for trip_id in await self._get_trip_ids(user):
                await self.channel_layer.group_add(
                    group=trip_id,
                    channel=self.channel_name
                )
            await self.accept()

    # Our create_ride() method creates a new trip and passes the details back to the client. Note that we are using a special decorated _create_ride() helper method to do the actual database update.
    async def create_ride(self, message):
        data = message.get('data')
        ride = await self._create_ride(data)
        ride_data = await self._get_ride_data(ride)
        print(
            f"\nInside Create_Ride in consumers.py, the ride_data {ride_data}")
        print(
            f"\nInside Create_Ride in consumers.py, the ride_id {ride.id}")
        print(
            f"\nInside Create_Ride in consumers.py, the Channel_Name is {self.channel_name}")

        # Send rider requests to all drivers.
        await self.channel_layer.group_send(group='drivers', message={
            'type': 'echo.message',
            'data': ride_data
        })
        # Add rider to trip group.

        await self.channel_layer.group_add(
            group=f'{ride.id}',
            channel=self.channel_name
        )
        await self.send_json({
            'type': 'echo.message',
            'data': ride_data,
        })

    async def disconnect(self, status_code):
        # await self.channel_layer.group_add(
        #     group='test',
        #     channel=self.channel_name
        # )
        # await super().disconnect(code)
        # Now, when the client establishes the WebSocket connection with the server, the server checks to see what group the authenticated user belongs to. If the user is a driver, then the function adds the user to the driver pool. When the WebSocket connection is closed, the server removes the user from the driver pool where appropriate.

        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
        else:
            user_group = await self._get_user_group(user)
            if user_group == 'driver':
                await self.channel_layer.group_discard(
                    group='drivers',
                    channel=self.channel_name
                )
            for trip_id in await self._get_trip_ids(user):
                await self.channel_layer.group_discard(
                    group=trip_id,
                    channel=self.channel_name
                )

        await super().disconnect(status_code)

    async def echo_message(self, message):
        await self.send_json(message)

    # changed
    # All incoming messages are received by the receive_json() method in the consumer. Here's where you should delegate the business logic to process different message types.
    async def receive_json(self, content, **kwargs):
        message_type = content.get('type')
        print(
            f"\nInside receive_json in consumers.py, the message type {message_type}")
        if message_type == 'create.ride':
            await self.create_ride(content)
        elif message_type == 'echo.message':
            await self.echo_message(content)
        elif message_type == 'update.ride':
            await self.update_trip(content)


# The update trip functionality is almost the mirror image of the create ride functionality. A driver sends a message to update a trip. The relevant Trip record gets updated to include the driver. The server broadcasts a message to everyone in the trip group with the updated trip information. The server adds the driver to trip group.


    async def update_trip(self, message):
        data = message.get('data')
        print(
            f"\nInside update_trip in consumers.py, the data received is MITHUN:  {data}")
        trip = await self._update_trip(data)
        trip_id = f'{trip.id}'
        trip_data = await self._get_ride_data(trip)

        # Send update to rider.
        await self.channel_layer.group_send(
            group=trip_id,
            message={
                'type': 'echo.message',
                'data': trip_data,
            }
        )

        # Add driver to the trip group.
        await self.channel_layer.group_add(
            group=trip_id,
            channel=self.channel_name
        )

        await self.send_json({
            'type': 'echo.message',
            'data': trip_data
        })
    # Moved up for clarity
    # @database_sync_to_async
    # def _update_trip(self, data):
    #     instance = Ride.objects.get(id=data.get('id'))
    #     serializer = RideSerializer(data=data)
    #     serializer.is_valid(raise_exception=True)
    #     return serializer.update(instance, serializer.validated_data)
# The receive_json() function is responsible for processing all messages that come to the server. Our message is an object with a type and a data payload.
# Passing a type is a Channels convention that serves two purposes:
# It helps differentiate incoming messages and tells the server how to process them.
# The type maps directly to a consumer function when sent from another channel layer.

    # async def receive_json(self, content, **kwargs):
    #     message_type = content.get('type')
    #     if message_type == 'echo.message':
    #         await self.send_json({
    #             'type': message_type,
    #             'data': content.get('data'),
    #         })

    # async def echo_message(self, message):  # new
    #     await self.send_json({
    #         'type': message.get('type'),
    #         'data': message.get('data'),
    #     })
