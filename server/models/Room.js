import { v4 as uuidv4 } from "uuid";

/**
 * A class representing an 2 player chess session, used alongside socket.io to handle sending game state info between players.
 * 
 * Initially designed to prevent populating private socket.io rooms with "request-room" client-side events.
 */
class Room {
	_id;
	_name;
	_players;
	/**
	 * Creates a new Room instance.
	 * @param {String} name Name of the room to instantiate.
	 * @param  {...String} players The IDs of the players to add.
	 */
	constructor(name, ...players) {
		this._name = name;
		this._players = players;
		this._id = uuidv4();
	}

	/**
	 * Returns an array of the players in the room
	 * @returns {String[]} An array of the players in the room.
	 */
	get players() {
		return this._players;
	}
	
	/**
	 * Adds a player to the room.
	 * @param {String} player Player ID.
	 */
	addPlayer(player) {
		this._players.push(player);
	}

	/**
	 * Removes the specified player from the room.
	 * @param {String} player Player ID
	 * @returns {String[] | []} Returns an array with the remaining players in the room, or and empty array if no players are left.
	 */
	removePlayer(player) {
		const remainingPlayer = this._players.filter((playerToCheck) => {
			if (playerToCheck !== player) return true;
			return false;
		});
		this._players = remainingPlayer;
		return remainingPlayer;
	}

	/**
	 * Returns the name of the room.
	 * @returns {String} The room's name.
	 */
	get name() {
		return this._name;
	}

	/**
	 * Returns the ID of the Room.
	 * @returns {String} The room's ID.
	 */
	get id() {
		return this._id;
	}
}

export default Room;
