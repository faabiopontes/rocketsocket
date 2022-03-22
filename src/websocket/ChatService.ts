import { container } from 'tsyringe';
import { io } from '../http';
import { CreateChatRoomService } from '../services/CreateChatRoomService';
import { CreateMessageService } from '../services/CreateMessageService';
import { CreateUserService } from '../services/CreateUserService';
import { GetAllUsersService } from '../services/GetAllUsersService';
import { GetChatRoomByUsersService } from '../services/GetChatRoomByUsersService';
import { GetMessagesByChatRoomService } from '../services/GetMessagesByChatRoomService';
import { GetUserBySocketIdService } from '../services/GetUserBySocketIdService';

io.on('connect', socket => {
    socket.emit('chat_started', {
        message: 'Your chat has been successfully started'
    });

    socket.on("start", async (data) => {
        const { email, avatar, name } = data;
        const createUserService = container.resolve(CreateUserService);

        const user = await createUserService.execute({
            email,
            avatar,
            name,
            socketId: socket.id,
        });

        console.log({ user });
        socket.broadcast.emit("new_user", user);
    });

    socket.on("get_users", async (callback) => {
        const getAllUsersService = container.resolve(GetAllUsersService);
        const users = await getAllUsersService.execute();
        
        callback(users);
    });

    socket.on("start_chat", async (data, callback) => {
        const getChatRoomByUsersService = container.resolve(GetChatRoomByUsersService);
        const createChatRoomService = container.resolve(CreateChatRoomService);
        const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
        const getMessagesByChatRoomService = container.resolve(GetMessagesByChatRoomService);

        const userLogged = await getUserBySocketIdService.execute(socket.id);
        const idUsers = [data.idUser, userLogged._id];
        let room = await getChatRoomByUsersService.execute(idUsers);

        if (!room) {
            room = await createChatRoomService.execute(idUsers);
        }

        console.log({ socketId: socket.id, userLogged, room });
        console.log("join", { idChatRoom: room.idChatRoom });

        socket.join(room.idChatRoom);

        // Get messages from room
        const messages = await getMessagesByChatRoomService.execute(room.idChatRoom);

        callback({ room, messages });
    });

    socket.on("message", async (data, callback) => {
        const getUserBySocketIdService = container.resolve(GetUserBySocketIdService);
        const createMessageService = container.resolve(CreateMessageService);

        // Get User Info
        const user = await getUserBySocketIdService.execute(socket.id);

        // Save Message
        const message = await createMessageService.execute({
            to: user._id,
            text: data.message,
            roomId: data.idChatRoom
        });

        // Send message to other users of the room
        io.to(data.idChatRoom).emit("message", {
            message,
            user
        });
    });
});