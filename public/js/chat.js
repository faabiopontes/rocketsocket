const socket = io('http://localhost:3000');
let idChatRoom = "";

function onLoad() {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get("name");
    const email = urlParams.get("email");
    const avatar = urlParams.get("avatar");
    
    document.querySelector(".user_logged").innerHTML += `
        <img
            class="avatar_user_logged"
            src="${avatar}"
        />
        <strong id="user_logged">${name}</strong>
    `

    socket.emit("start", {
        email,
        name,
        avatar,
    });

    socket.emit("get_users", users => {
        console.log("getUsers", users);

        users.map(user => {
            if(user.email !== email) {
                addUser(user);
            }
        });
    });

    socket.on("new_user", data => {
        const userAlreadyExists = document.getElementById(`user_${data._id}`);
        
        if (!userAlreadyExists) {
            addUser(data);
        }
    });

    socket.on("message", data => {
        if(data.message.roomId === idChatRoom) {
            addMessage(data);
        }
    });
}

function addUser(user) {
    const usersList = document.getElementById("users_list");
    usersList.innerHTML += `
        <li
            class="user_name_list"
            id="user_${user._id}"
            data-id-user="${user._id}"
        >
            <img
                class="nav_avatar"
                src="${user.avatar}"
            />
            ${user.name}
        </li>
    `;
}

function addMessage(data) {
    const divMessageUser = document.getElementById("message_user");
    divMessageUser.innerHTML += `
        <span class="user_name user_name_date">
            <img
            class="img_user"
            src="${data.user.avatar}"
            />
            <strong>${data.user.name}</strong>
            <span>${dayjs(data.message.createdAt).format("DD/MM/YYYY HH:mm")}</span>
        </span>
        <div class="messages">
            <span class="chat_message">${data.message.text}</span>
        </div>
    `;
}

function clearMessages() {
    document.getElementById("message_user").innerHTML = '';
}

function startChat(idUser) {
    console.log("startChat", idUser);
    socket.emit("start_chat", { idUser }, ({ room, messages }) => {
        idChatRoom = room.idChatRoom;
        console.log("messages", messages);

        clearMessages();
        messages.forEach(message => {
            addMessage({ message, user: message.to });
        })
    });
}

document.getElementById("users_list").addEventListener("click", ({ target }) => {
    let userListElement = null;

    if (!target) {
        return false;
    }

    if (target.matches("li.user_name_list")) {
        userListElement = target;
    }

    if (target.parentElement.matches("li.user_name_list")) {
        userListElement = target.parentElement
    }

    const { idUser } = userListElement.dataset;

    if (idUser) {
        startChat(idUser);
        document.getElementById("user_message").classList.remove("hidden");
    }
});

document.getElementById("user_message").addEventListener("keypress", ({ key, target }) => {
    if (key !== "Enter") {
        return;
    }

    const messageData = {
        message: target.value,
        idChatRoom
    };
    target.value = "";

    console.log("messageData", messageData);

    socket.emit("message", messageData, (data) => {
        console.log("message data", { data });
    });
});

onLoad();