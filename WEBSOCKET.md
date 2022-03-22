# WebSocket

## Difference from HTTP protocol
- Both have requests and responses
- On HTTP the connection is closed after the response is sent from the server
- On WebSocket (WS) a persistent connection between server and client is open

## Why WebSockets?
- Ideally for realtime exchange of information. Ex: Chat, Games

## Mongo DB with Docker
- Created using command `docker run --name mongodb -p 27017:27017 -d -t mongo`

## Tables
- User
    - email: String
    - socketId: String
    - name: String
    - avatar: String

- Messages
    - to: ObjectID
    - text: String
    - roomId: String
    - createdAt: Date

- ChatRoom
    - idUsers: User[]
    - idChatRoom: String