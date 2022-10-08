/**
 * Adds sockets to a socket.io room and a local Room object.
 * 
 * Sets up emitter events for multiplayer functionality.
 * @param {Socket} socket A socket.io instance.
 * @param {Room} room A Room object.
 */
function joinRoom(socket, room) {
	socket.join(room);

	socket.on("gamemove", (move) => {
		socket.to(room).emit("gamemove", move);
	});

	socket.on("disconnect", () => {
		console.log(`Socket left room ${room}`);
		socket.to(room).emit("playerleft");
	});

	console.log(`Socket has joined room ${room}`);
}

/**
 * Sets up the socket.io event handlers for joining a room and playing a move.
 * 
 * @param {Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} io A socket.io server instance.
 */
export default function setupSocket(io, roomManager) {
	io.on("connection", (socket) => {
		console.log("Socket connected");

		// Handles sockets attempting to join a game room.
		socket.on("joinRoom", (id) => {
			console.log(id);
			const room = roomManager.findRoomById(id);
			if (room === null) {
				throw new Error("Could not find room");
			}
			// Get a list of socket.io monitored rooms.
			const rooms = io.of("/").adapter.rooms;
			const socketRoom = rooms.get(room.name);

			// If the socket.io room does not exist, then create and join it.
			if(socketRoom === undefined) {
				roomManager.joinRoom(room.name, socket.id);
				joinRoom(socket, room.name);

				socket.on("disconnect", () => {
					roomManager.removePlayer(room.name, socket.id);
				});
			}
			else if (
				socketRoom.size < 2 &&
        !roomManager.getRoomPlayers(room.name).includes(socket.id)
			) {
				roomManager.joinRoom(room.name, socket.id);
				joinRoom(socket, room.name);

				if(room.players.length === 2) {
					io.to(room.name).emit("fullgame");
					room.setInProgress(true);
				}

				socket.on("disconnect", () => {
					roomManager.removePlayer(room.name, socket.id);
				});
			} else console.log(`Room ${room.name} is full`);
		});

		socket.on("disconnect", () => {
			console.log("Socket disconnected");
		});
	});
}