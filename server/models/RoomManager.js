import Room from "./Room";

/**
 * Class responsible for keeping a set of available rooms in memory and manipulating them appropriately.
 * 
 * Likely to become a service with the Room class being replaced by with a database to reduce impact on memory.
 */
class RoomManager {
	rooms;
	constructor() {
		this.rooms = new Set();
	}

	/**
	 * Checks to see if a room with the same name exists and, if not, creates a new room and stores it in memory.
	 * @param {String} name The name of the room to be created.
	 * @param {String} player A string representing the socket ID of a player. Likely to be replaced by a Player class.
	 */
	addRoom(name, player) {
		if (this.findRoom(name) === null) this.rooms.add(new Room(name, player));
		else throw new Error("There is already a room with this name");
	}

	/**
	 * Searches for a room by name.
	 * @param {String} name The name of the room to search for.
	 * @returns {?Room} A Room instance or null.
	 */
	findRoom(name) {
		for (const room of this.rooms) {
			if (room.name === name) return room;
		}
		return null;
	}

	/**
	 * Searches for a room by ID.
	 * @param {String} name The name of the room to search for.
	 * @returns {?Room} A Room instance or null.
	 */
	findRoomById(id) {
		for (const room of this.rooms) {
			if (room.id === id) return room;
		}
		return null;
	}

	/**
	 * Adds a player to a room.
	 * 
	 * @param {String} name Name of the room to add player to.
	 * @param {String} player A string representing the socket ID of a player. Likely to be replaced by a Player class.
	 */
	joinRoom(name, player) {
		const room = this.findRoom(name);
		if (room !== null) {
			room.addPlayer(player);
		}
	}

	/**
	 * 
	 * @returns {IterableIterator<Room>} An iterator which iterates over the rooms stored in the Set this.rooms.
	 */
	roomsIterator() {
		return this.rooms.values();
	}

	/**
	 * Removes a player from a room. If there are no players left in the room, then delete the room from memory.
	 * @param {String} name Name of the room to remove player from.
	 * @param {String} player A string representing the socket ID of a player. Likely to be replaced by a Player class.
	 */
	removePlayer(name, player) {
		const room = this.findRoom(name);
		if (room !== null) {
			const leftovers = room.removePlayer(player);
			if (leftovers.length === 0) this.rooms.delete(room);
		}
	}

	/**
	 * Returns an array of Rooms stored in memory, or an empty array if no rooms exist.
	 * @returns {(Room[] | [])} An array of all values stored in the this.rooms Set.
	 */
	getAllRooms() {
		const rooms = [];
		this.rooms.forEach((room) => {
			rooms.push(room);
		});
		return rooms;
	}

	/**
	 * Returns an array of the names of all players in the specified room.
	 * @param {String} name Name of the room to get all players from.
	 * @returns {String[]} An array of player names.
	 */
	getRoomPlayers(name) {
		const room = this.findRoom(name);
		if (room !== null) {
			return room.players;
		}
	}
}

export default RoomManager;
