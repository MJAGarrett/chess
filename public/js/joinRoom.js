import startGame from "./gameStartup.js";
import setAttributes from "./helpers/setAttributes.js";

// eslint-disable-next-line no-undef
const socket = io();

// roomId is defined on the html document itself
// eslint-disable-next-line no-undef
if(typeof roomId !== "undefined") {
	// eslint-disable-next-line no-undef
	socket.emit("joinRoom", roomId);
	startGame({socket, AIDifficulty: null, online: true });
} else {
	let roomName = null;
	let password = null;
	const prompt = document.createElement("dialog");
	const nameInput = document.createElement("input");
	setAttributes(nameInput, [["name", "roomName"], ["id", "roomName"]]);

	const passwordInput = document.createElement("input");
	setAttributes(nameInput, [["name", "roomPassword"], ["id", "roomPassword"]]);

	const submit = document.createElement("button");
	submit.textContent = "Create Room";
	submit.addEventListener("click", (e) => {
		e.preventDefault();
		if(nameInput.value.length > 3) roomName = nameInput.value;
		if(passwordInput.value !== "") password = passwordInput.value;

		if(roomName) {
			socket.emit("createRoom", {name: roomName, password: password});
			startGame({socket, AIDifficulty: null, online: true });
			prompt.close();
			prompt.remove();
		}
	});

	const nameLabel = document.createElement("label");
	nameLabel.setAttribute("for", "roomName");
	nameLabel.textContent = "Room Name";

	const passwordLabel = document.createElement("label");
	nameLabel.setAttribute("for", "roomPassword");
	passwordLabel.textContent = "Password (Optional)";

	const inputDiv = document.createElement("div");
	inputDiv.classList.add("input-div");
	inputDiv.append(nameLabel, nameInput, passwordLabel, passwordInput, submit);

	prompt.append(inputDiv);

	document.body.prepend(prompt);
	prompt.showModal();
}
