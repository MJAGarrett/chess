import startGame from "./gameStartup.js";
import getURLEnd from "./helpers/getUrlSubstring.js";

// Loads a singleplayer game with or without AI based on variable AIDifficulty.
// AIDifficulty is a global variable on the document.

const AIDifficulty = getURLEnd(document.URL);

if(AIDifficulty !== "LAN") {
	startGame({
		online: false,
		socket: null,
		AIDifficulty: AIDifficulty,
	});
} else {
	startGame({
		online: false,
		socket: null,
		AIDifficulty: null,
	});
}