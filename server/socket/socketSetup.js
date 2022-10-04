import RoomManager from "../models/RoomManager.js";

const roomManager = new RoomManager();

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
	});

	console.log(`Socket has joined room ${room}`);
}

/**
 * Creates two namespaces, one dedicated to storing rooms for ongoing games and one for requesting a list of available rooms.
 * 
 * Sets up events appropriate for each namespace.
 * 
 * @param {Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>} io A socket.io server instance.
 */
export default function setupSocket(io) {
	const selection = io.of("/selection");

	selection.on("connection", (socket) => {
		console.log("Socket connected to selection namespace");

		// Handle requests for rooms list.
		socket.on("request-rooms", (callback) => {
			const rooms = roomManager.getAllRooms();

			const roomsData = rooms.map((room) => {
				return {
					name: room.name,
					playerNum: room.players.length,
					id: room.id,
				};
			});

			callback(roomsData);
		});

		socket.on("disconnect", () => {
			console.log("Socket left selection namespace");
		});
	});

	io.on("connection", (socket) => {
		console.log("Socket connected");

		// Handles sockets attempting to join a game room.
		socket.on("joinRoom", (id) => {
			const room = roomManager.findRoomById(id);
			if (room === null) {
				throw new Error("Could not find room");
			}
			// Get a list of socket.io monitored rooms.
			const rooms = io.of("/").adapter.rooms;

			if (
				rooms.get(room.name).size < 2 &&
        !roomManager.getRoomPlayers(room.name).includes(socket.id)
			) {
				roomManager.joinRoom(room.name, socket.id);
				joinRoom(socket, room.name);

				socket.on("disconnect", () => {
					roomManager.removePlayer(room.name, socket.id);
				});
			} else console.log(`Room ${room.name} is full`);
		});

		// Handles sockets attempting to create a room.
		socket.on("createRoom", (roomData) => {
			const { name } = roomData;
			const rooms = io.of("/").adapter.rooms;
			if (!rooms.has(name)) {
				try {
					roomManager.addRoom(name, socket.id);
					joinRoom(socket, name);

					socket.on("disconnect", () => {
						roomManager.removePlayer(name, socket.id);
					});
				} catch (err) {
					console.log(err);
				}
			}
		});

		socket.on("disconnect", () => {
			console.log("Socket disconnected");
		});
	});
}