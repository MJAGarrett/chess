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
		this.initializeBoard();
		this.gameView = document.querySelector(".game");
		this.checkmateIndicator = document.querySelector(".checkmate");
		this.checkIndicator = document.querySelector(".check");
		this.turnIndicator = document.querySelector(".turn");
		this.selection = null;
		this.selectionParentRect = null;
		window.addEventListener("mousemove", (e) => this.handleMovement(e));
	}

	/**
	 * Updates the view if the game is in a check state.
	 * @param {Boolean} checkState A boolean representing if the game model is in a check state.
	 */
	updateCheckIndicator(checkState) {
		const inCheck = checkState ? "True" : "False";
		this.checkIndicator.textContent = inCheck;
	}

	/**
	 * Updates the view if the game is in a checkmate.
	 * @param {Boolean} checkmateState A boolean representing if the game model is in checkmate.
	 */
	updateCheckmateIndicator(checkmateState) {
		const isCheckmate = checkmateState ? "Checkmate" : "False";
		this.checkmateIndicator.textContent = isCheckmate;
	}

	/**
	 * Updates the view to reflect a change in turn.
	 * @param {String} turn The name of the team whose turn it is.
	 */
	updateTurnIndicator(turn) {
		const properText = turn.charAt(0).toUpperCase() + turn.slice(1);
		this.turnIndicator.textContent = properText;
	}

	/**
	 * Calls necessary methods for updating the view.
	 * 
	 * Paints a new board with game pieces placed to reflect their position in the game model.
	 */
	updateView() {
		const pieces = this.gameModel.board;
		let boardToRender = [];
		pieces.forEach((row, rowIndex) => {
			row.forEach((piece, colIndex) => {
				let newSquare = this.createSquare(
					this.board[rowIndex][colIndex],
					piece
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
	 * An event handler which moves the selected piece along with the mouse.
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

	/**
	 * Creates a two-dimensional array representing the properties of the game board.
	 * 
	 * Saves this board as a property of the Controller object.
	 */
	initializeBoard() {
		let board = new Array(8).fill(null).map(() => new Array(8).fill(null));

		for (let outer = 0; outer < board.length; outer++) {
			let colorStaggered = outer % 2 === 0 ? false : true;
			for (let inner = 0; inner < board[outer].length; inner++) {
				let color;
				if (!colorStaggered) color = inner % 2 === 0 ? "white" : "black";
				else color = inner % 2 === 0 ? "black" : "white";
				board[outer][inner] = {
					coordinates: { row: outer, column: inner },
					color: color,
					selected: false,
				};
			}
		}

		this.board = board;
	}

	/**
	 * Creates the DOM elements necessary to represent a board square based on the board properties of the controller, and the
	 * board state of the game model.
	 * @param {{coordinates: {row: Number, column: Number}, color: String, selected: Boolean}} squareAttributes An object representing the properties of an individual square.
	 * @param {GamePiece | null} gamePiece The game piece potentially in a square.
	 */
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
