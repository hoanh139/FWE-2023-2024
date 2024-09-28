# Backend

---

## Description

---

The backend is a REST API that was implemented with Node.js and Express.js.
The application can be used to create, display, edit and delete user, room, playlist and question.


## Setup

---

1. `cd /fwe-project-nhie/backend`
2. `npm install` to install all the needed dependencies
3. Port for Backend is now `localhost:3000`
4. `npm run schema:fresh` to create database tables, because they are not created automatically
5. Add Data Source in IDE: Choose PostgreSQL (Port: 5432), then login with user as `nhieDBUser`, password as `WS23`
6. `npm start dev` to run Backend

> **Notice**
>
> Terminal for `docker-compose-up` in `/fwe-project-nhie` and for `npm start dev` in `/fwe-project-nhie/backend` are separated in 2 tabs
>

## Entity

### User

A user entity consists of the following basic attributes:

```typescript
// User.ts
id: string;
email: string;
password: string;
firstName: string;
lastName: string;
roomPlayers: array <RoomPlayer>;
userPlaylists: array <UserPlaylist>;
createdPlaylists: array <Playlist>;
createdQuestions: array <Question>
```

### Room

A room entity consists of the following basic attributes:

```typescript
// Room.ts
id: string;
playlist: Playlist;
roomPlayers: array <RoomPlayer>;
votesCounter: number = 0;
questionIndex: number = 0;
```

### Playlist

A playlist entity consists of the following basic attributes:

```typescript
// Playlist.ts
id: string;
name: string;
room: array <Room>;
userPlaylists: array <UserPlaylist>;
playlistQuestions: array <PlaylistQuestion>;
creator: User
```

### Question

A question entity consists of the following basic attributes:

```typescript
// Question.ts
id: string;
content: string;
playlistQuestions: array <PlaylistQuestion>;
creator: User
```

### UserPlaylist

User exist in the form of a 'many-to-many' relationship with the playlist entities.
The association entity consists of the following attributes:

```typescript
// UserPlaylist.ts
player: User;
playlist: Playlist
```

### RoomPlayer

Room exist in the form of a 'many-to-many' relationship with the user entities.
Additional attributes are stored that describe the voted, vote, voteKick, haveCounter to count the number of i have and haveNotCounter to count the number of i have not.
The association entity consists of the following attributes:

```typescript
// RoomPlayer.ts
playerId: User;
roomId: Room;
voted: boolean = false;
vote: boolean = false;
voteKick: number = 0;
haveCounter: number = 0;
haveNotCounter: number = 0;
```

### PlaylistQuestion

Playlist exist in the form of a 'many-to-many' relationship with the question entities.
The association entity consists of the following attributes:

```typescript
// PlaylistQuestion.ts
playlist: Playlist;
question: Question
```

## API

---

The API is accessible at `localhost:3000/`.

The following endpoints are available:

> **Notice**
>
> All uncatched errors are returned with a status code `500 Internal Server Error`
>
> `Validation Error` with Response Code 400, because of missing fields
>

### Question

--- 

#### Get

- `GET /question/` - Get all questions
    - Response Code 200 OK - Return array of `Question`
    - Response Code 404 Not Found - No Questions found
- `GET /question/:id` - Get question by id, which is similar with path parameter `id`
    - Response Code 200 OK - Return object of `Question`
    - Response Code 404 Not Found - Question with ${id} not found

#### Post

- `POST /question` - Create new question
    - Request Body:
      ```json
      {
        "content": "string",
        "creator": {
            "id": "string"
        }
      }
      ```
    - Response Code 201 Created - Return object of `Question`
    - Response Code 400 Bad Request
      - Missing User 
      - Question with this content already exists 
      - Validation Error
    - Response Code 404 Not Found - User with ${creator.id} not found

#### Put

- `PUT /question/:id` - Update question by id, which is similar with path parameter `id`
    - Request Body:
      ```json
      {
        "content": "string",
        "creator": {
            "id": "string"
        }
      }
      ```
    - Response Code 200 OK - Return object of `Question`
    - Response Code 400 Bad Request 
      - Validation Error 
      - No User provided
    - Response Code 404 Not Found 
      - This is not your Question. Wrong User ID 
      - Question ${id} not found

#### Delete

- `Delete /question/:id` - Delete Category by id, which is similar with path parameter `id`
    - Response Code 200 OK - Question `id` deleted successfully
    - Response Code 400 Bad Request - No User provided
    - Response Code 403 Forbidden - You can't delete this question
    - Response Code 404 Not Found 
      - This is not your Question. Wrong User ID 
      - Question ${req.params.id} not found

### Playlist

--- 

#### Get

- `GET /playlist/` - Get all playlists
    - Response Code 200 OK - Return array of `Playlist`
    - Response Code 404 Not Found - No Playlist found
- `GET /playlist/:id` - Get playlist by id, which is similar with path parameter `id`
    - Response Code 200 OK - Return object of `Playlist`
    - Response Code 404 Not Found - Playlist with `id` not found

#### Post

- `POST /playlist` - Create new playlist
    - Request Body:
      ```json
      {
        "name": "string",
        "playlistQuestions": [{
            "questions":{
              "id": "string"
            }
        }],
       "creator": {
           "id": "string"
        }
      }
      ```
    - Response Code 201 Created - Return object of `Playlist`
    - Response Code 400 Bad Request
      - Missing Questions
      - Missing User
      - Validation Error
    - Response Code 404 Not Found 
      - Question with `question.id` not found
      - User with ${creator.id} not found

#### Put

- `PUT /playlist/:id` - Update playlist by id, which is similar with path parameter `id`
    - Request Body:
      ```json
      {
        "name": "string",
        "playlistQuestions": [{
            "questions":{
              "id": "string"
            }
        }],
       "creator": {
           "id": "string"
        }
      }
      ```

    - Response Code 200 OK - Return object of `Playlist`
    - Response Code 400 Bad Request
      - Validation Error
      - No User provided
    - Response Code 404 Not Found 
      - Playlist not found
      - This is not your Playlist. Wrong User ID

#### Delete

- `Delete /playlist/:id` - Delete playlist by id, which is similar with path parameter `id`

    - Request Body:
    ```json
    {
      "creator": {
        "id": "string"
      }
    }
    ```
  
  - Response Code 200 OK - Playlist `id` deleted successfully
  - Response Code 400 Bad Request - No User provided
  - Response Code 403 Forbidden - You can't delete this playlist
  - Response Code 404 Not Found - This is not your Playlist. Wrong User ID
- `Delete /playlist/:name/questions` - Delete questions of playlist by id of playlist, which is similar with path parameter `id`
    - Request Body:
         ```json
        {
          "questions": ["string"],
          "creator": {
            "id": "string"
          }
        }
        ``` 
    - Response Code 200 OK - Question from Playlist `id` deleted successfully
    - Response Code 400 Bad Request 
      - Invalid or missing list of questions in the request body
      - No User provided
    - Response Code 403 Forbidden - You can't delete this playlist
    - Response Code 404 Not Found
      - This is not your Playlist. Wrong User ID
      - Question with id `questionId` not found

### Room

--- 

#### Get

- `GET /room/player/:id` - Get room by id, which is similar with path parameter `id`
    - Response Code 200 OK - Return object of `Room`
    - Response Code 404 Not Found - Room not found

#### Delete

- `Delete /room/:id` - Delete room by id, which is similar with path parameter `id`
    - Response Code 200 OK - Room `id` deleted successfully
    - Response Code 403 Forbidden - You can't delete this room
- `Delete /room/:name/player` - Delete players of room by id of room, which is similar with path parameter `id`
    - Request Body:
         ```json
        {
          "playerIds": ["string"]
        }
        ``` 
    - Response Code 200 OK - Players from Room `id` deleted successfully
    - Response Code 400 Bad Request - Invalid or missing player ids in the request body
    - Response Code 403 Forbidden - You can't delete this room
    - Response Code 404 Not Found - Player with id `id` not found

### User

--- 

#### Get

- `GET /auth/` - Get all users
    - Response Code 200 OK - Return array of `User`
    - Response Code 404 Not Found - User does not exist
- `GET /auth/:id` - Get user by id, which is similar with path parameter `id`
    - Response Code 200 OK - Return object of `User`
    - Response Code 404 Not Found - User does not exist
- `GET /auth/userplaylist/:id` - Get all playlists of user by id of user, which is similar with path parameter `id` 
    - Response Code 200 OK - Return array of `UserPlaylist`
    - Response Code 404 Not Found - Playlist of user with id `id` is not found

#### Post

- `POST /auth/register` - Register new user
    - Request Body:
      ```json
      {
        "email": "string",
        "password": "string",
        "firstName": "string",
        "lastName": "string"
      }
      ```
    - Response Code 201 Created - Return object of `User`
    - Response Code 400 Bad Request
      - User already exists
      - Validation Error
- `POST /auth/login` - Login with exist user
    - Request Body:
      ```json
      {
        "email": "string",
        "password": "string"
      }
      ```
    - Response Code 201 Created - Return access token
    - Response Code 400 Bad Request
        - User does not exist
        - Validation Error
    - Response Code 401 - Unauthorized

#### Put

- `PUT /auth/:id` - Update user by id, which is similar with path parameter `id`
    - Request Body:
      ```json
      {
        "email": "string",
        "password": "string",
        "firstName": "string",
        "lastName": "string",
        "userPlaylists":[{
          "playlist": {
            "id": "string",
            "name": "string",
            "playlistQuestions":[{
              "question":{
                "id": "string"
              }
            }]
          }
       }]
      }
      ```
    - Response Code 200 OK - Return object of `User`
    - Response Code 400 Bad Request
        - Validation Error
        - Question with `question.id` already existed in playlist
        - Missing Questions
    - Response Code 404 Not Found 
      - Question with `question.id` not found
      - User is not found

#### Delete

- `Delete /auth/:id` - Delete user by id, which is similar with path parameter `id`
    - Response Code 200 OK - User `id` deleted successfully
    - Response Code 403 Forbidden - You can't delete this user
- `Delete /auth/:id/playlists` - Delete playlists of user by id of user, which is similar with path parameter `id`
    - Request Body:
      ```json
        {
          "playListIds": ["string"]
        }
      ``` 
    - Response Code 200 OK - Playlists from User `id` deleted successfully
    - Response Code 400 Bad Request - Invalid or missing playlist ids in the request body
    - Response Code 404 Not Found
        - User with id `id` not found
        - User is not found

## SocketIO

---

The SocketIO is accessible at `localhost:3001/`. This provides methods `GET` und `POST`.

The following events are available:

### Connect Socket

- registering the connection with the client
- Server io
- io.on(`connection`, function)
  - connected: `socket.id`

> **Notice**
>
> Parameter of function is `socket`
>

### Disconnect Socket

- handling the disconnect event
- socket.on(`disconnect`, function) 
  - disconected: `reason`

> **Notice**
>
> Parameter of function is `reason`
>

### Create Room

- handling the request for a new room event
- socket.on(`create-room`, function)
  - socket.emit(`create-room-confirmation`, {
        roomId: string,
        question: string,
    });
  - socket.emit("error", { code: `error on create room` });

> **Notice**
>
> Parameter of function is `createRoomData` with attributes `userId` (string) and `playlistId` (string)
>

### Join Room

- handling the request to join an existing room event
- socket.on(`join-room`, function)
  - socket.join(room.id)
  - socket.emit(`create-room-confirmation`, {
        roomId: string,
        question: string,
    });
  - io.to(`room.id`).emit(`fetch-player`)
  - socket.emit("error", { code: `error on join room` });

> **Notice**
>
> Parameter of function is `joinRoomData` with attributes `userId` (string) and `roomId` (string)
>

### Leave Room

- socket.on(`leave-room`, function)
  - socket.leave(roomId);

> **Notice**
>
> Parameter of function is `roomID` (string);
>

### Vote

- socket.on(`vote`, function)
  - io.to(room.id).emit(`voting-finished`);
  - io.to(room.id).emit(`fetch-player`);
  - socket.emit("error", { code: `error on voting` });

> **Notice**
>
> Parameter of function is `voteData` with attributes `userId` (string), `roomId` (string) and `vote` (boolean)
>

### Next Question

- socket.on(`next-question`, function)
  - io.to(room.id).emit(`next-question`, { question: string });
  - io.to(room.id).emit(`fetch-player`, { question: string });
  - socket.emit("error", { code: `error on next question event` });

> **Notice**
>
> Parameter of function is `nextData` with attribute `roomId` (string) 
>

### Get Question

- socket.on(`get-question`, function)
  - callback({ question: string });
  - socket.emit("error", { code: `error getting the question` });

> **Notice**
>
> Parameters of function are `callback` and `nextData` with attribute `roomId` (string)
>

### Vote Kick

- socket.on(`vote-kick`, function)
  - io.to(roomId).emit(`kick-player`, { playerToKick: string });
  - io.to(roomId).emit(`fetch-player`);
  - socket.emit("error", { code: `error registering kick vote` });

> **Notice**
>
> Parameter of function is `VoteKickData` with attribute `playerId` (string), `roomId` (string) and `playersLength` (number)
>

### Destroy Game

- socket.on(`destroy-game`, function)
  - socket.emit("error", { code: `error getting the entities` })
  - socket.emit("error", { code: `error registering kick vote` });