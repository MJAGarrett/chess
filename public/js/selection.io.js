import setAttributes from "./helpers/setAttributes.js";

// io is available from the html document.
// eslint-disable-next-line no-undef
const socket = io("/selection");

const tableBody = document.querySelector("tbody");

/**
 * Populates the view's room selection screen with open rooms. Room data is requested from the server via a socket.io "request-room" event.
 * @param {{name: String, playerNum: Number, id: String, password: Boolean}[]} data An object with relevent room data.
 */
function populate(data) {
	if (data.length === 0) {
		noData();
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

		if(!room.password){
			const joinBtn = document.createElement("a");
			joinBtn.setAttribute("href", `/room/${room.id}`);
			joinBtn.textContent = "Join";

			const joinCell = document.createElement("td");
			joinCell.append(joinBtn);
			cellsToAppend.push(joinCell);
		}
		
		else {
			const joinBtn = document.createElement("button");
			joinBtn.textContent = "Join";
			joinBtn.addEventListener("click", (e) => {
				e.preventDefault();
				const modal = makePasswordModal(room);
				document.body.prepend(modal);
				modal.showModal();
			});

			const joinCell = document.createElement("td");
			joinCell.appendChild(joinBtn);
			cellsToAppend.push(joinCell);
			
			console.log("made the list");
		}

		roomRow.append(...cellsToAppend);
		tableBody.appendChild(roomRow);
	});
}

function noData() {
	const row = document.createElement("tr");
	const cell = document.createElement("td");
	cell.style.textAlign = "center";

	setAttributes(cell, [["colspan", "3"]]);
	cell.textContent = "There doesn't appear to be any games currently open :(";
	row.appendChild(cell);

	tableBody.appendChild(row);
}

// Requests room data from the server.
socket.emit("request-rooms", populate);

function passwordForm(room) {
	const formNodes = [];
	const passwordForm = document.createElement("form");
	setAttributes(passwordForm, [["action", "/room/validate"], ["method", "POST"]]);

	const hiddenInput = document.createElement("input");
	setAttributes(hiddenInput, [["hidden"], ["name", "roomId"], ["id", "roomId"], ["value", room.id]]);
	formNodes.push(hiddenInput);

	const pwordLabel = document.createElement("label");
	pwordLabel.textContent = "Password";
	setAttributes(pwordLabel, [["for", "roomPassword"]]);
	formNodes.push(pwordLabel);

	const passwordInput = document.createElement("input");
	setAttributes(passwordInput, [["required"], ["name", "password"], ["id", "password"]]);
	formNodes.push(passwordInput);

	
	const joinBtn = document.createElement("button");
	joinBtn.setAttribute("type", "submit");
	joinBtn.textContent = "Join";
	formNodes.push(joinBtn);

	passwordForm.append(...formNodes);

	return passwordForm;
}

function makePasswordModal(room) {
	const passModal = document.createElement("dialog");

	const closeBtn = document.createElement("button");
	closeBtn.textContent = "X";
	closeBtn.addEventListener("click", (e) => {
		e.preventDefault();
		passModal.close();
		passModal.remove();
	});

	passModal.appendChild(closeBtn);
	passModal.appendChild(passwordForm(room));

	return passModal;
}