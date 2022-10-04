// io is available from the html document.
// eslint-disable-next-line no-undef
const socket = io("/selection");

const tableBody = document.querySelector("tbody");

/**
 * Populates the view's room selection screen with open rooms. Room data is requested from the server via a socket.io "request-room" event.
 * @param {{name: String, playerNum: Number, id: String}[]} data An object with relevent room data.
 */
function populate(data) {
	if (data.length === 0) {
		console.log("No rooms");
		return;
	}
	data.forEach((room) => {
		console.log(room);
	});

	data.forEach((room) => {
		if(room.playerNum === 2) return;
		const roomRow = document.createElement("tr");

		let cellsToAppend = [];

		const name = document.createElement("td");
		name.textContent = room.name;
		cellsToAppend.push(name);

		const players = document.createElement("td");
		players.textContent = `${room.playerNum} / 2`;
		cellsToAppend.push(players);

		const joinBtn = document.createElement("a");
		joinBtn.setAttribute("href", `/${room.id}`);
		joinBtn.textContent = "Join";

		const joinCell = document.createElement("td");
		joinCell.append(joinBtn);
		cellsToAppend.push(joinCell);

		roomRow.append(...cellsToAppend);
		tableBody.appendChild(roomRow);
	});
}

// Requests room data from the server.
socket.emit("request-rooms", populate);
