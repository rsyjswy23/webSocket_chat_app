# WebSocket_chat_app
 
## Tech Stack:
 This real-time chat app was built with:
 - __Backend:__ Python, Django, Channels, WebSocket, ASGI, Django Rest Framework(authentication),
 - __Frontend:__ React, Redux(authentication), Javascript, HTML, CSS, Parcel(bundler),
 
  ## Features:
__This real-time chat application supports:__

-:white_check_mark: Individual and group messaging,

-:white_check_mark: Save and load historical chat messages,

-:white_check_mark: Users Registration, Authentication, Login & Logout, 

## Chat App System Design Diagram:
![Screen Shot 2022-06-29 at 11 34 31 AM](https://user-images.githubusercontent.com/101481587/176511086-e469b4df-76a4-47a5-875c-8d7d40f4bcb1.jpg)

## Implementation:

__Step 1__: built asynchronous chat server using Django and Channels, enabled channel layer that uses Redis as its backing store to allow multiple consumer instances to talk with each other, send messages and manage users in groups. 

- __About WebSocket:__ [link1](https://sookocheff.com/post/networking/how-do-websockets-work/) [link2](https://noio-ws.readthedocs.io/en/latest/overview_of_websockets.html)
  - a transport layer built-on TCP that uses an HTTP friendly Upgrade handshake. Unlike HTTP, WebSocket is stateful and connection between client and server keeps alive until disconnect. 
  - bi-directional: server and client pushing messages at any time.
  - full-duplex communication: client and server talk to each other indepedently at the same time.
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
 
  - It uses Redis as its backing store. (inMemory channel layer is for testing and local-development. Redis supports production use.)
  - functions in channel_layer like group_add(), group_send() are async by default, need to call them from sync code:
 
   ```
   from asgiref.sync import async_to_sync
   async_to_sync(channel_layer.send)("channel_name", {...})
   ```
   
   diagram from: https://vinay13.github.io/
   ![django-wsgi](https://user-images.githubusercontent.com/101481587/175833915-4460c95b-52a4-4f64-a902-88b2224a115b.png)

- __About consumers:__
  - A consumer is the basic unit of Channels code and it is long-running, unlike view. When a request or new socket comes in, Channels will follow its routing table to find the right consumer for that incoming connection, and start up a copy of it.
  - Every consumer instance has an automatically generated unique channel name, and so can be communicated with via a channel layer.
  - There are multiple instances of ChatConsumer in the same room communicate with each other. To do that we will have each ChatConsumer add its channel to a group whose name is based on the room name. That will allow ChatConsumers to transmit messages to all other ChatConsumers in the same room.
  -  It uses Redis as its backing store.  (command ot run redis: brew services start redis)
  
__Step 2__: improved ChatComsumer to save and load previously sent messages & created bootstrap frontend.

__Step 3__: created chat UI in React, connected & migrated WebSocket into React, configured Parcel as bundler.

- __About Parcel:__ [link](https://parceljs.org/)

__Step 4__: added Authentication service(Login/Logout/Signup pages)(frontend: React Redux; backend:Django Rest Framework) and persisted the user authentication in the React application(localStorage).

- __About Django Rest Framework Authentication:__ [docs](https://django-rest-auth.readthedocs.io/en/latest/installation.html))
  - generate token for users who sign up, and store in both frontend(to check login or logout status) and backend(db) as user info.
  
- __About React Redux Authentication:__ 
  - added Redux Actions, Reducers, Store for Application state
  - Auth.js includes: 
    * User Registration: axios.post('http://127.0.0.1:8000/rest-auth/registration/', { username: username, email: email, pw1: pw1, pw2: pw2 })
    * User Login: axios.post('http://127.0.0.1:8000/rest-auth/login/', { username: username, password: password })
    
