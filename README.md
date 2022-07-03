# WebSocket_chat_app
 
## Tech Stack:
 __This real-time chat app was built with:__
 - __Backend:__ Python, Django, Channels, WebSocket, ASGI, Django Rest Framework(authentication),
 - __Frontend:__ Javascript, React, HTML, CSS, Parcel(bundler),  Redux(authentication), 
 - __Database:__ sqlite3
 
  ## Features:

-:white_check_mark: Individual and group messaging,

-:white_check_mark: Save and load historical chat messages,

-:white_check_mark: Users Registration, Authentication, Login & Logout, 

## Diagrams:
__Complex Chat App System:__

![Screen Shot 2022-06-29 at 11 34 31 AM](https://user-images.githubusercontent.com/101481587/176511086-e469b4df-76a4-47a5-875c-8d7d40f4bcb1.jpg)

__System Design Diagram for this simple Chat App:__

![Untitled Diagram drawio copy](https://user-images.githubusercontent.com/101481587/177022157-f8f0c1e1-d269-4d7b-8ffb-8d8b036f0a93.png)

__Flowchart of Authentication for this simple Chat App:__ 

To connect Django to frontend, I chose using Django Rest as a standalone API + React as Standalone SPA. (require token)

![Untitled Diagram drawio copy 2](https://user-images.githubusercontent.com/101481587/177027327-a89d72da-8ffc-4649-8602-c423627eb4dd.png)


__Database & Schema for this simple Chat App:__


## Implementation:

__Step 1: Built asynchronous chat server using Django and Channels, enabled channel layer that uses Redis as its backing store to allow multiple consumer instances to talk with each other, send messages and manage users in groups.__

- __About WebSocket:__ [link1](https://sookocheff.com/post/networking/how-do-websockets-work/) [link2](https://noio-ws.readthedocs.io/en/latest/overview_of_websockets.html)
  - a transport layer built-on TCP that uses an HTTP friendly Upgrade handshake. Unlike HTTP, WebSocket is stateful and connection between client and server keeps alive until disconnect. 
  - bi-directional: server and client pushing messages at any time.
  - full-duplex communication: client and server talk to each other indepedently at the same time.
  
    ![here](https://user-images.githubusercontent.com/101481587/177012720-0807f512-0b23-47ba-bdaf-53099269f00d.jpg)

  - The websocket connection lifespan and frame structure.
  ```
  Websockets have four states: connecting, open, closing and closed. All communication between clients and servers takes place though the use of the websocket frame.

  A frame is a small, highly bit concerned header + “payload”. The payload is any and all application data, similar to the body of a http message.

  A frame looks like this:

  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
  +-+-+-+-+-------+-+-------------+-------------------------------+
  |F|R|R|R| opcode|M| Payload len |    Extended payload length    |
  |I|S|S|S|  (4)  |A|     (7)     |             (16/64)           |
  |N|V|V|V|       |S|             |   (if payload len==126/127)   |
  | |1|2|3|       |K|             |                               |
  +-+-+-+-+-------+-+-------------+ - - - - - - - - - - - - - - - +
  |     Extended payload length continued, if payload len == 127  |
  + - - - - - - - - - - - - - - - +-------------------------------+
  |                               |Masking-key, if MASK set to 1  |
  +-------------------------------+-------------------------------+
  | Masking-key (continued)       |          Payload Data         |
  +-------------------------------- - - - - - - - - - - - - - - - +
  :                     Payload Data continued ...                :
  + - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - +
  |                     Payload Data continued ...                |
  +---------------------------------------------------------------+
   ```
   
- __About WSGI & ASGI:__
  - WSGI: User ---> HTTP Request ---> WSGI(Apache/NGINX) ---> Django Views
  - ASGI: User --->  WebSocket   --->    ASGI(Daphine)   ---> Django Consumers
     
- __About Django Channels:__ [docs](https://channels.readthedocs.io/en/stable/)
  - It wraps Django's native asynchronous view support, allowing Django projects to handle not only HTTP, but also protocols that require long-running connections, such as WebSockets, MQTT, chatbots, etc.
  - 
  - A channel layer allows multiple consumer instances to talk with each other & keep track of users in a connected groups, and broadcast messges within group. 
  - The channel layer is for high-level application-to-application communication. You should send high-level events over the channel layer, and then have consumers handle those events, and do appropriate low-level networking to their attached client.
  
   ```
   await self.channel_layer.group_send(
      room.group_name,
      {
          "type": "chat.message",
          "room_id": room_id,
          "username": self.scope["user"].username,
          "message": message,
      }
   )
   ```
 
  - inMemory channel layer is for testing and local-development. Redis supports production use. ```brew services start redis```
  - functions in channel_layer like group_add(), group_send() are async by default, need to call them from sync code:
 
   ```
   from asgiref.sync import async_to_sync
   async_to_sync(channel_layer.send)("channel_name", {...})
   ```
   
   diagram from: https://vinay13.github.io/
   
   ![django-wsgi](https://user-images.githubusercontent.com/101481587/177013549-076cccca-0824-4443-937c-7cae7ed742e1.png)

- __About consumer:__
  - is the basic unit of Channels code and it is long-running, unlike view. 
  - When a request or new socket comes in, Channels will follow its routing table to find the right consumer for that incoming connection, and start up a copy of it.
  - Every consumer instance has an automatically generated unique channel name, and so can be communicated with via a channel layer.
  - There are multiple instances of ChatConsumer in the same room communicate with each other. To do that we will have each ChatConsumer add its channel to a group whose name is based on the room name. That will allow ChatConsumers to transmit messages to all other ChatConsumers in the same room.
  
  
__Step 2: improved ChatComsumer to save and load previously sent messages & created bootstrap frontend.__

__Step 3: created chat UI in React, connected & migrated WebSocket into React, configured Parcel as bundler.__

- __About Parcel:__ [link](https://parceljs.org/)

__Step 4: added Authentication service(React Redux + Django Rest Framework) including Login/Logout/Signup pages and persisted the user authentication in the React application(localStorage).__

- __About Django Rest Framework Authentication:__ [docs](https://django-rest-auth.readthedocs.io/en/latest/installation.html)
  - Django comes with a built-in authentication system model: 
  ```
  REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
  }
  ```
  - Write User Serializer: to convert complex data such as querysets and model instances to be native Python datatypes that can then be easily rendered into JSON, XML or other content types. Serializers also provide deserialization, allowing parsed data to be converted back into complex types, after first validating the incoming data.
  - Add a viewset: to handle all of the basic HTTP requests: GET, POST, PUT, DELETE without hard coding any of the logic.
  - Register the routes:
  ```
  urlpatterns = [
    ...
    path('api-auth/', include('rest_framework.urls')),
    path('rest-auth/', include('rest_auth.urls')),
    path('rest-auth/registration/', include('rest_auth.registration.urls'))
  ]
  ```
  After User endpoints, login, register viewset are ready, don't forget to run:
  ```
  python manage.py makemigrations
  python manage.py migrate
  python manage.py runserver
  ```
  before creating new users.
  
  - Generate token for each user and store in both frontend(to check login or logout status) and backend(db) as user info.
  - __To connect Django to frontend, I chose using Django Rest as a standalone API + React as Standalone SPA. (require token)__
  
- __About React Redux Authentication:__ [docs](https://saasitive.com/tutorial/react-token-based-authentication-django/)

![Screen Shot 2022-07-02 at 7 43 18 PM](https://user-images.githubusercontent.com/101481587/177022442-2f308ea2-72ed-4046-b3df-39fe942980fa.jpg)


  - Enable CORS with Django REST by ```pip install django-cors-headers``` && add 'corsheaders' to ```INSTALLED_APPS``` in setting.py because we will make requests from other port than server.
  - Create ```Login``` and ```Create Account``` components.
  - Add Signup actions and reducer.
  ```
  export const authSignup = (username, email, password1, password2) => {
      return dispatch => {
          dispatch(authStart());
          axios.post('http://127.0.0.1:8000/rest-auth/registration/', {
              username: username,
              email: email,
              password1: password1,
              password2: password2
          })
          .then(res => {
              const token = res.data.key;
              const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
              localStorage.setItem('token', token);
              localStorage.setItem('username', username);
              localStorage.setItem('expirationDate', expirationDate);
              dispatch(authSuccess(username, token));
              dispatch(checkAuthTimeout(3600));
          })
          .catch(err => {
              dispatch(authFail(err))
          })
      }
  }
  ```
  - Add Login actions and reducer.
  ```
  export const authLogin = (username, password) => {
      return dispatch => {
          dispatch(authStart());
          axios.post('http://127.0.0.1:8000/rest-auth/login/', {
              username: username,
              password: password
          })
          .then(res => {
              const token = res.data.key;
              const expirationDate = new Date(new Date().getTime() + 3600 * 1000);
              localStorage.setItem('token', token);
              localStorage.setItem('username', username);
              localStorage.setItem('expirationDate', expirationDate);
              dispatch(authSuccess(username, token));
              dispatch(checkAuthTimeout(3600));
          })
          .catch(err => {
              dispatch(authFail(err))
          })
      }
  }
  ```
  - The authentication data (token and user) are saved in the localStorage. 
