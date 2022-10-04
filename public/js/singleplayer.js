import startGame from "./gameStartup.js";

// Loads a singleplayer game with or without AI based on variable AIDifficulty.
// AIDifficulty is a global variable on the document.

if(AIDifficulty) {
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