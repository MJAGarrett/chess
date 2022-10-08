import setAttributes from "./helpers/setAttributes.js";

const tableBody = document.querySelector("tbody");
const createRoomButton = document.querySelector(".create-room");

createRoomButton.addEventListener("click", (e) => {
	e.preventDefault();
	const dialog = document.querySelector("dialog");
	if(dialog) {
		dialog.remove();
	}
	const prompt = document.createElement("dialog");
	const errorsDiv = document.createElement("div");
	errorsDiv.classList.add("errors-container");

	errorsDiv.addEventListener("click", (e) => {
		e.preventDefault();
		errorsDiv.remove();
	});

	const nameInput = document.createElement("input");
	setAttributes(nameInput, [["name", "name"], ["id", "name"]]);

	const passwordInput = document.createElement("input");
	setAttributes(passwordInput, [["name", "password"], ["id", "password"]]);

	const submit = document.createElement("button");
	submit.textContent = "Create Room";
	submit.addEventListener("click", (e) => {
		e.preventDefault();
		let errors = [];
		errorsDiv.replaceChildren();
		errorsDiv.remove();
		if(nameInput.value.length < 4) {
			console.log("Test");
			errors.push("The room name must be at least four characters long.");	
		}

		if(errors.length > 0) {
			errors.forEach((error) => {
				const errorPara = document.createElement("p");
				errorPara.textContent = error;
				errorsDiv.appendChild(errorPara);
				prompt.prepend(errorsDiv);
			});
		}
		else inputForm.submit();
	});

	const nameLabel = document.createElement("label");
	nameLabel.setAttribute("for", "name");
	nameLabel.textContent = "Room Name";

	const passwordLabel = document.createElement("label");
	nameLabel.setAttribute("for", "password");
	passwordLabel.textContent = "Password (Optional)";

	const inputForm = document.createElement("form");
	setAttributes(inputForm, [["method", "POST"], ["action", "/api/makeRoom"]]);
	inputForm.classList.add("input-form");
	inputForm.append(nameLabel, nameInput, passwordLabel, passwordInput, submit);

	prompt.append(inputForm);

	document.body.prepend(prompt);
	prompt.showModal();
});

/**
 * Populates the view's room selection screen with open rooms. Room data is requested from the server via the fetch() API.
 * @param {{name: String, playerNum: Number, password: Boolean}[]} data An object with relevent room data.
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

		if(room.password) {
			const lockSpan = document.createElement("span");
			lockSpan.classList.add("fa-solid", "fa-lock");
			name.appendChild(lockSpan);
		}
		cellsToAppend.push(name);

		const players = document.createElement("td");
		players.textContent = `${room.playerNum} / 2`;
		cellsToAppend.push(players);

		if(!room.password){
			const joinBtn = document.createElement("a");
			joinBtn.setAttribute("href", `/room/open/${room.name}`);
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
				const dialog = document.querySelector("dialog");
				if(dialog) {
					dialog.remove();
				}

				const modal = makePasswordModal(room);
				document.body.prepend(modal);
				modal.showModal();
			});

			const joinCell = document.createElement("td");
			joinCell.appendChild(joinBtn);
			cellsToAppend.push(joinCell);
		}

		roomRow.append(...cellsToAppend);
		tableBody.appendChild(roomRow);
	});
}

/**
 * Appends a placeholder cell to the table if there are no rooms to join.
 */
function noData() {
	const row = document.createElement("tr");
	const cell = document.createElement("td");
	cell.style.textAlign = "center";

	setAttributes(cell, [["colspan", "3"]]);
	cell.textContent = "There doesn't appear to be any games currently open :(";
	row.appendChild(cell);

	tableBody.appendChild(row);
}

/**
 * Creates a form allowing a user to enter a password to attempt to join a room.
 * @param {Room} room A Room object containing a password
 * @returns {HTMLFormElement} A form element that posts to an API designed to check the password against the database.
 */
function passwordForm(room) {
	const formNodes = [];
	const passwordForm = document.createElement("form");
	setAttributes(passwordForm, [["action", "/room/validate"], ["method", "POST"]]);
	passwordForm.classList.add("input-form");

	const hiddenInput = document.createElement("input");
	setAttributes(hiddenInput, [["hidden"], ["name", "name"], ["id", "name"], ["value", room.name]]);
	formNodes.push(hiddenInput);

	const pwordLabel = document.createElement("label");
	pwordLabel.textContent = "Password";
	setAttributes(pwordLabel, [["for", "password"]]);
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

/**
 * Creates a modal that allows for entering a password when attempting to join a room.
 * @param {Room} room A room object used to pass down data to a from creation function.
 * @returns {HTMLDialogElement} A dialog element used to enter a password for accessing a room.
 */
function makePasswordModal(room) {
	const passModal = document.createElement("dialog");

	const closeBtn = document.createElement("button");
	closeBtn.classList.add("close-modal");
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

/**
 * Fetches a json array of rooms from the server and populates the table.
 * @returns {void}
 */
async function fetchRoomsFromServer() {
	const data = await (await fetch("/api/getRooms")).json();
	populate(data);
}

fetchRoomsFromServer();
