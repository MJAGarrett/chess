import Room from "./Room";

/**
 * Class responsible for keeping a set of available rooms in memory and manipulating them appropriately.
 * 
 * Likely to become a service with the Room class being replaced with a database to reduce impact on memory.
 */
class RoomManager {
	rooms;
	constructor() {
		this.rooms = [];
	}

	/**
	 * Checks to see if a room with the same name exists and, if not, creates a new room and stores it in memory.
	 * @param {String} name The name of the room to be created.
	 * @param {String} player A string representing the socket ID of a player. Likely to be replaced by a Player class.
	 * @returns {Room} The instance of the newly created room.
	 */
	addRoom(name) {
		if (this.findRoom(name) === null) {
			const newRoom = new Room(name);
			this.rooms.push(newRoom);
			return newRoom;
		}
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
	 * Removes a player from a room. If there are no players left in the room, then delete the room from memory.
	 * @param {String} name Name of the room to remove player from.
	 * @param {String} player A string representing the socket ID of a player. Likely to be replaced by a Player class.
	 */
	removePlayer(name, player) {
		const room = this.findRoom(name);
		if (room !== null) {
			const leftovers = room.removePlayer(player);
			if (leftovers.length === 0) {
				this.rooms.splice(this.rooms.indexOf(room), 1);
			}
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
	 * Clears the rooms stored in memory.
	 * 
	 * Placeholder implementation of delete until hooked up to a DB.
	 * @returns {[]} An empty array.
	 */
	clearRooms() {
		return this.rooms = [];
	}

	/**
	 * Returns an array of rooms currently held in memory. Will return a maximum of 10 rooms at a time. If there are fewer than 10 rooms in
	 * memory than returns all rooms.
	 * @param {Number} x The index from which to select rooms. 
	 * @returns {Room[]} An array of at most 10 rooms.
	 */
	getOpenRooms() {
		let openRooms = [];
		for (const room of this.rooms) {
			if(!room.getInProgress()) openRooms.push(room);
		}
		return openRooms;
	}

	/**
	 * Returns a portion of the rooms stored in memory. Will return a maximum of 10 rooms. If there are no more unique rooms to return, will return an empty array.
	 * @param {Number} [x=0] Index from which to select rooms, should be a multiple of 10.
	 * @returns {Room[]}
	 */
	fetchRooms() {
		if(this.rooms.length < 1) {
			return [];
		}
		else {
			return this.getOpenRooms();
		}
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
