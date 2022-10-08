import startGame from "./gameStartup.js";
import getURLEnd from "./helpers/getUrlSubstring.js";

// eslint-disable-next-line no-undef
const socket = io();

const id = getURLEnd(document.URL);
socket.emit("joinRoom", id);
startGame({socket, AIDifficulty: null, online: true });
