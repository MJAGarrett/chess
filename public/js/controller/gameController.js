/**
 * A controller which is responsible for updating the view based on user/AI input.
 */
export default class GameController {
	/**
	 * Sets up a controller and keeps a reference to all UI elements which will need updating.
	 *
	 * @param {Game} game The instance of a game of chess to bind to this controller
	 */
	constructor(game) {
		this.gameModel = game;
		game.registerController(this);
		this.gameView = document.querySelector(".game");
		this.checkmateIndicator = document.querySelector(".checkmate");
		this.checkIndicator = document.querySelector(".check");
		this.turnIndicator = document.querySelector(".turn");
		this.selection = null;
		this.selectionParentRect = null;
		window.addEventListener("mousemove", (e) => this.handleMovement(e));
	}
	updateCheckIndicator(checkState) {
		const inCheck = checkState ? "True" : "False";
		this.checkIndicator.textContent = inCheck;
	}
	updateCheckmateIndicator(checkmateState) {
		const isCheckmate = checkmateState ? "Checkmate" : "False";
		this.checkmateIndicator.textContent = isCheckmate;
	}
	updateTurnIndicator(turn) {
		const properText = turn.charAt(0).toUpperCase() + turn.slice(1);
		this.turnIndicator.textContent = properText;
	}
	updateView() {
		const board = this.gameModel.board;
		let boardToRender = [];
		board.forEach((row) => {
			row.forEach((square) => {
				let newSquare = this.createSquare(
					square.squareAttributes,
					square.gamePiece
				);
				boardToRender.push(newSquare);
			});
		});

		// Clears selection state if there is no selected piece
		// in order to prevent unnecessary computations.
		if (!this.gameModel.selectedPiece) {
			this.selection = null;
			this.selectionParentRect = null;
		}

		this.gameView.replaceChildren(...boardToRender);
		this.updateTurnIndicator(this.gameModel.whoseTurn);
		this.updateCheckIndicator(this.gameModel.inCheck);
		this.updateCheckmateIndicator(this.gameModel.checkmate);
	}

	/**
	 * An event handler which moves the selected chess along with the mouse.
	 *
	 * @param {Event} e The mousemove event.
	 */
	handleMovement(e) {
		if (this.selection) {
			e.preventDefault();
			let offsetX = e.clientX - this.selectionParentRect.left;
			let offsetY = e.clientY - this.selectionParentRect.top;
			this.selection.style.top = offsetY + "px";
			this.selection.style.left = offsetX + "px";
			this.selection.style.transform = "translateX(-50%) translateY(-50%)";
			this.selection.style.zIndex = 10;
		}
	}

	createSquare(squareAttributes, gamePiece) {
		const { row, column } = squareAttributes.coordinates;
		const newSquare = document.createElement("button");

		newSquare.classList.add(`${squareAttributes.color}`);
		newSquare.classList.add(`row${row}`, `column${column}`);

		// Adds an event listener to each chess square that routes necessary information
		// to the Game object and sets internal state important to rendering a moving chess piece.
		newSquare.addEventListener("click", (e) => {
			e.preventDefault();
			if (!this.selection) {
				this.selectionParentRect = e.target.getBoundingClientRect();
			}
			this.gameModel.handleClick({ row, column });
		});

		if (gamePiece) {
			newSquare.classList.add(`has-${gamePiece.name}-${gamePiece.team}`);

			// Add a chess piece
			const piece = document.createElement("span");
			piece.classList.add("fa-solid");
			piece.classList.add(`fa-chess-${gamePiece.name.toLowerCase()}`);
			newSquare.append(piece);

			if (
				this.gameModel.selectedPiece &&
				this.gameModel.selectedPiece.gamePiece === gamePiece
			) {
				// Add a class to select the piece
				newSquare.classList.add("selected");
				this.selection = piece;
			}
		}
		if (this.gameModel.selectedPiece) {
			const squareIsPotentialMove =
				this.gameModel.selectedPiece.validMoves.find((move) => {
					const moveRow = move.row;
					const moveColumn = move.column;
					if (row === moveRow && moveColumn === column) {
						return true;
					}
					return false;
				});
			if (squareIsPotentialMove) newSquare.classList.add("selected");
		}

		return newSquare;
	}
}
