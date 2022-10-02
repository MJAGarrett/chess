// import AIFactory from "./models/AI.js";
import gameSetup from "./models/game.js";
import GameController from "./controller/gameController.js";

// eslint-disable-next-line no-undef
const socket = io();

// Starts the Game
// const enemy = AIFactory("hard");
const theGame = gameSetup("online");

if (theGame.isOnline === true) {
	theGame.registerSocket(socket);
}

// enemy.observeGame(theGame);
const controller = new GameController(theGame);

document.querySelector(".restart").addEventListener("click", (e) => {
	e.preventDefault();
	theGame.restartGame();
});

controller.updateView();
