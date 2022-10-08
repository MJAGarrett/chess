import AIFactory from "./models/AI.js";
import gameSetup from "./models/game.js";
import GameController from "./controller/gameController.js";

/**
 * Starts the game according to the options specified in params.
 * @param {{online: Boolean, socket: ?any, AIDifficulty: ?String}} params An options object used to determine how to set up the chess game.
 */
export default function startGame(params) {
	const {online, socket, AIDifficulty} = params;

	let game;

	if(online === false) {
		if(AIDifficulty) {
			game = gameSetup("singleplayer");
			let enemy;
			switch (AIDifficulty) {
			case "easy":
				enemy = AIFactory("easy");
				break;
			case "medium":
				enemy = AIFactory("medium");
				break;
			case "hard":
				enemy = AIFactory("hard");
				break;
			default:
				enemy = AIFactory("medium");
				break;
			}
			enemy.observeGame(game);
		} else game = gameSetup("LAN");

		addRestartButton(game);
		
	}
	else {
		game = gameSetup("online");
		game.registerSocket(socket);
	}

	const controller = new GameController(game);
	
	controller.updateView();
}

function addRestartButton(game) {
	const restart = document.createElement("button");
	restart.classList.add("restart");
	restart.setAttribute("type", "button");
	restart.textContent = "Restart Game";
	restart.addEventListener("click", (e) => {
		e.preventDefault();
		game.restartGame();
	});

	const gameOver = document.querySelector(".game-over");
	gameOver.after(restart);
}