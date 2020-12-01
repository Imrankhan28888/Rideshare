from rest_framework_simplejwt.tokens import AccessToken
from channels.sessions import CookieMiddleware, SessionMiddleware
from channels.db import database_sync_to_async
from channels.auth import AuthMiddleware, AuthMiddlewareStack, UserLazyObject
from django.db import close_old_connections
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

# Authenticate our WebSocket connection than an authorization header
# The JavaScript WebSocket API does not support custom headers
# Here the middleware class plucks the JWT access token from the query string and retrieves the associated user. Once the WebSocket connection is opened, all messages can be sent and received without verifying the user again. Closing the connection and opening it again requires re-authorization.


User = get_user_model()


@database_sync_to_async
def get_user(scope):
    # close any old connection start fresh
    close_old_connections()
    # get the access token from the query_String that we receive
    query_string = parse_qs(scope['query_string'].decode())
    token = query_string.get('token')
    if not token:
        return AnonymousUser()
    try:
        access_token = AccessToken(token[0])
        user = User.objects.get(id=access_token['id'])
    except Exception as exception:
        return AnonymousUser()
    if not user.is_active:
        return AnonymousUser()
    return user


class TokenAuthMiddleware(AuthMiddleware):
    async def resolve_scope(self, scope):
        scope['user']._wrapped = await get_user(scope)


def TokenAuthMiddlewareStack(inner):
    return CookieMiddleware(SessionMiddleware(TokenAuthMiddleware(inner)))
