/**
 * This class is a likely candidate to turn into a database model/schema.
 * 
 */


import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";

const SALT = 8;

/**
 * A class representing an 2 player chess session, used alongside socket.io to handle sending game state info between players.
 * 
 * Initially designed to prevent populating private socket.io rooms with "request-room" client-side events.
 */
class Room {
	_id;
	_name;
	_players;
	_inProgress;
	_password;
	/**
	 * Creates a new Room instance.
	 * @param {String} name Name of the room to instantiate.
	 * @param  {...String} players The IDs of the players to add.
	 */
	constructor(name) {
		this._name = name;
		this._players = [];
		this._id = uuidv4();
		this.inProgress = false;
		this._password = null;
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

	/**
	 * @returns {Boolean} The value of the inProgress flag.
	 */
	getInProgress() {
		return this._inProgress;
	}

	/**
	 * Sets the inProgress flag.
	 * @param {Boolean} value
	 */
	setInProgress(value) {
		return this._inProgress = value;
	}

	/**
	 * Hashes and stores a plain text password in memory.
	 * @param {String} password A plain text password.
	 */
	async setPassword(password) {
		try {
			const hashedPword = await bcrypt.hash(password, SALT);
			this._password = hashedPword;
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	/**
	 * Compares a password to the hashed value stored.
	 * @param {String} password Plain text password to compare.
	 * @returns A promise which resolves to a boolean.
	 */
	async comparePasswords(password) {
		try {
			return bcrypt.compare(password, this._password);
		} catch (err) {
			console.error(err);
			throw err;
		}
	}

	/**
	 * Returns true or false if the room has a password.
	 * @returns {Boolean} Whether the password has been for this room.
	 */
	hasPassword() {
		if(this._password) {
			return true;
		} return false;
	}
}

export default Room;
