import AIFactory from "./models/AI.js";
import gameSetup from "./models/game.js";
import GameController from "./controller/gameController.js";

// eslint-disable-next-line no-undef
const socket = io();

// Starts the Game
const enemy = AIFactory("hard");
const theGame = gameSetup("singleplayer");
enemy.observeGame(theGame);

if (theGame.isOnline === true) {
	theGame.registerSocket(socket);
}

const controller = new GameController(theGame);

document.querySelector(".restart").addEventListener("click", (e) => {
	e.preventDefault();
	theGame.restartGame();
});

controller.updateView();
