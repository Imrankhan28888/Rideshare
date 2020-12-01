from django.urls import path


# server/rideShare/routing.py
from channels.routing import ProtocolTypeRouter, URLRouter
from rideShare.middleware import TokenAuthMiddlewareStack
from rides.consumers import RideConsumer

# Whereas Channels implicitly handles the HTTP URL configuration, we need to explicitly handle WebSocket routing. (A router is the Channels counterpart to Django's URL configuration.)


# application = ProtocolTypeRouter({
#     'websocket': URLRouter([
#         path('rideShare/', RideConsumer),
#     ]),
# })

# we're wrapping our URL router in our middleware stack, so all incoming connection requests will go through our authentication method.
application = ProtocolTypeRouter({
    'websocket': TokenAuthMiddlewareStack(URLRouter([
        path('rideShare/', RideConsumer),
    ]),
    ),
})
