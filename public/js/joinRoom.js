import startGame from "./gameStartup.js";
// eslint-disable-next-line no-undef
const socket = io();

// roomId is defined on the html document itself
// eslint-disable-next-line no-undef
if(typeof roomId !== "undefined") {
	// eslint-disable-next-line no-undef
	socket.emit("joinRoom", roomId);
} else {
	// roomName is defined on the html document itself
	// eslint-disable-next-line no-undef
	socket.emit("createRoom", { name: roomName });
}

startGame({socket, AIDifficulty: null, online: true });
