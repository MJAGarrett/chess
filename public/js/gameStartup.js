import AIFactory from "./models/AI.js";
import gameSetup from "./models/game.js";
import GameController from "./controller/gameController.js";

// Starts the Game
const enemy = AIFactory("hard");
const theGame = gameSetup("singleplayer");
enemy.observeGame(theGame);
const controller = new GameController(theGame);

document.querySelector(".restart").addEventListener("click", () => {
	theGame.restartGame();
});

controller.updateView();
