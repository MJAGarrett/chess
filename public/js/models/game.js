import PiecesSetup from "./pieces.js";

class Game {
	isOnline = false;
	selectedPiece = null;
	whoseTurn = "black";
	board = null;
	history = [];
	inCheck = false;
	checkmate = false;
	inPromotion = false;
	controller = null;
	/**
	 * @todo Add a map that contains the filtered moves and reasons for filtering them.
	 * This will allow for providing feedback in the view as to why the player cannot
	 * take a move that they may think is perfectly valid/safe.
	 *
	 *
	 * variable name = filteredMoves
	 * structure =
	 * key = move, value = rationale for filtering.
	 */

	constructor() {
		this.board = this.initialBoardSetup();
		// this.filteredMoves = new Map();
	}

	/**
	 *  Used as an event handler which routes input from the view to the appropriate state handlers.
	 *
	 * @param {{row: Number, column: Number}} index A two-tuple whose data members represent the row and column of a
	 * square on the game board. These numbers should correspond to an index on the 2D array representing the game board.
	 */
	handleClick(index) {
		// If the game is in checkmate simply prevent selection or movement.
		if (this.checkmate) return;

		// If no current selection attempt to select the piece at the index provided.
		if (!this.selectedPiece) this.selectPiece(index);
		// Finally, try to move/unselect the selected piece
		else this.movePiece(index);
	}

	/**
	 * Handles logic for selecting a piece. Updates game state and the view to represent selection.
	 *
	 * Delegates checking if a selected piece has valid moves to several helper functions.
	 *
	 * @param {{row: Number, column: Number}} index A two-tuple whose data members represent the row and column of a
	 * square on the game board. These numbers should correspond to an index on the 2D array representing the game board.
	 *
	 */
	selectPiece(index) {
		// *** This section determines whether selection is possible.
		const { row, column } = index;
		const selection = this.board[row][column].gamePiece;

		// Returns if selection is null
		if (selection === null) return;

		// Returns if a player tries to select a piece that is not theirs.
		if (!this.isRightTurn(selection)) return;

		// *** End block

		// *** This block checks if there are any valid moves for the piece.
		//     If not, then the piece will not be selected

		const moves = selection.findPossibleMoves({ row, column });
		let validMoves = this.movesValidator(moves, selection);

		// Checks to see if any of the valid moves would lead to a check.
		// If so doesn't allow player to make them.

		const safeMoves = this.filterUnsafeMoves(validMoves, index);

		if (safeMoves.length === 0) return;

		// *** End Block

		// Assigns selection piece as the new selection.
		// Returns an object that contains a reference to the game piece, an array of its valid moves
		// and its current position on the board.
		this.selectedPiece = {
			gamePiece: selection,
			validMoves: safeMoves,
			position: { row, column },
		};

		this.controller.updateView();
	}

	/**
	 * Handles moving/de-selecting/promoting pieces.
	 *
	 * @param {{row: Number, column: Number}} index A two-tuple whose data members represent the row and column of a
	 * square on the game board. These numbers should correspond to an index on the 2D array representing the game board.
	 * @returns
	 */
	movePiece(index) {
		// Setup
		const { row, column } = index;

		// If the selected square contains the currently selected piece then
		// deselect it.
		const piece = this.selectedPiece.gamePiece;
		if (this.board[row][column].gamePiece === piece) {
			this.selectedPiece = null;
			this.controller.updateView();
			return;
		}

		// Checks if the square selected is one of the
		// piece's valid moves.
		const moves = this.selectedPiece.validMoves;
		const move = moves.find((move) => {
			if (move.row === row && move.column === column) return true;
			return false;
		});
		if (!move) return;

		// Moves piece and updates board

		const oldRow = this.selectedPiece.position.row;
		const oldColumn = this.selectedPiece.position.column;

		this.addToHistory(this.board);
		const newBoard = this.board.map((square) => square);

		// Checks if a pawn can be promoted and promotes it if possible
		if (this.checkForPromotion(move, piece)) {
			const { Rook, Queen, Knight, Bishop } = PiecesSetup(this.board);

			/**
			 * @todo Change the selection from a text entry to a tile-selection GUI with
			 * visual representations of the game pieces.
			 */

			// Prompts user for selection
			const choice = window.prompt("Which piece would you like?");

			const safeChoice = choice.trim().toLowerCase();

			// Creates an instance of the new game piece.
			let finalChoice;
			switch (safeChoice) {
			case "rook":
				finalChoice = new Rook(piece.team);
				break;
			case "queen":
				finalChoice = new Queen(piece.team);
				break;
			case "knight":
				finalChoice = new Knight(piece.team);
				break;
			case "bishop":
				finalChoice = new Bishop(piece.team);
				break;
			default:
				finalChoice = new Queen(piece.team);
				break;
			}

			// Updates the board based on the selection.
			newBoard[move.row][move.column].gamePiece = finalChoice;
			newBoard[oldRow][oldColumn].gamePiece = null;
		} else {
			// Update board as normal if there was no promotion.
			newBoard[move.row][move.column].gamePiece = piece;
			newBoard[oldRow][oldColumn].gamePiece = null;
		}

		if (piece.name === "Pawn") {
			console.log("Piece has moved?" + piece.initialMove);
			if (piece.initialMove) piece.setMoved();
		}

		this.board = newBoard;
		this.selectedPiece = null;
		console.log(this.history);

		this.changeTurn();
		this.checkForCheck();

		if (this.isOnline === true) {
			this.sendToServer();
		}
		this.controller.updateView();
	}

	/**
	 * Simple setter to change the game state representing the current team's turn.
	 *
	 * Uses a ternary operator to toggle this.whosTurn between "black" and "white".
	 */
	changeTurn() {
		this.whoseTurn = this.whoseTurn === "black" ? "white" : "black";
	}

	/**
	 * A helper function which determines if a game piece's team matches the current player's.
	 *
	 * @param {BoardPiece} gamePiece The game piece object who's team is being evaluated.
	 * @returns True if game piece's team is a match, false if otherwise.
	 */
	isRightTurn(gamePiece) {
		return gamePiece.team === this.whoseTurn ? true : false;
	}

	/**
	 * Provides basic logic to validate a game piece's moves are legal/logical.
	 *
	 * @param {[{row: Number, column: Number, canCapture: Boolean, mustCapture?: Boolean}]} moves An array of objects whose properties represent
	 * a particular move the game piece in originalPosition could make.
	 * @param {BoardPiece} movingPiece The game piece object who's moves are being evaluated.
	 * @param {Array[]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states. Used in later functions for checking if a move would lead to a check/checkmate situation.
	 * @returns An array matching the structure of the "moves" argument with invalid/illogical moves filtered out.
	 */
	movesValidator(moves, movingPiece, board = this.board) {
		// First filter out moves which would go off the board.
		const temp = moves.filter((move) => {
			if (move.row > 7 || move.row < 0 || move.column > 7 || move.column < 0)
				return false;
			return true;
		});

		// Next filter out pawn forward moves into an opponent and
		// prevent diagonal moves unless there is an opponent in that square.
		const validMoves = temp.filter((move) => {
			const { row, column, canCapture } = move;
			const block = board[row][column];
			// eslint-disable-next-line no-prototype-builtins
			if (move.hasOwnProperty("mustCapture")) {
				// Check for property first to prevent exceptions.
				if (move.mustCapture && block.gamePiece === null) return false;
			}
			if (
				block.gamePiece !== null &&
				(canCapture === false || movingPiece.team === block.gamePiece.team)
			)
				return false;
			return true;
		});

		// Return the filtered array.
		return validMoves;
	}

	/**
	 * Takes an array of moves for a given game piece and that piece's location on the board. Filters out those moves which would lead to a check/checkmate against
	 * their its team.
	 *
	 * @param {[{row: Number, column: Number, canCapture: Boolean, mustCapture?: Boolean}]} moves An array of objects whose properties represent
	 * a particular move the game piece in originalPosition could make.
	 * @param {{row: Number, column: Number }} originalPosition Original position of the moving game piece on the board.
	 * @returns An array of moves with those that would have led to a self check filtered out.
	 */
	filterUnsafeMoves(moves, originalPosition) {
		const safeMoves = moves.filter((move) => {
			// Creates a temporary board representing the game state after the move has been
			// taken.
			const alternateHistory = this.alternateHistory(move, originalPosition);
			// Checks if the "alternate history" move would result in a check against the player that took the
			// move.
			const checkWillOccur = this.checkOccurred(alternateHistory);
			// If the move is safe allow it, else prevent player from taking it.
			if (checkWillOccur.length === 0) return true;
			return false;
		});

		return safeMoves;
	}

	/**
	 * A function which controls the check/checkmate flow.
	 *
	 * Checks for a check state. If the game is currently in check, then check to see
	 * if there is a checkmate.
	 */
	checkForCheck() {
		const checks = this.checkOccurred();
		if (checks.length > 0) {
			this.inCheck = true;
			this.checkForCheckMate();
		} else this.inCheck = false;
	}

	/**
	 * Checks to see if the current player's King has been checked.
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of moves which could capture the current player's King.
	 */
	checkOccurred(board = this.board) {
		// Get an array of all enemy pieces
		const piecesOfConcern = this.getOppositePieces(board);

		// For each enemy game piece in the array, create another array (at this point the data structure could be a 3D array)
		// which contains all of its moves that threaten the current player's King.
		// Flatten the map to a 1D array for simplifying data manipulation (the number of moves themselves is the only thing of importance from this calculation).
		// Return the resulting array.
		return piecesOfConcern
			.map((piece) => {
				const moves = piece.gamePiece.findPossibleMoves(piece.coordinates);
				const validMoves = this.movesValidator(moves, piece.gamePiece, board);
				let checkingMoves = [];
				if (validMoves.length > 0) {
					checkingMoves = validMoves.filter((move) => {
						const pieceInSquare = board[move.row][move.column].gamePiece;
						if (pieceInSquare) if (pieceInSquare.name === "King") return true;
						return false;
					});
				}
				return checkingMoves;
			})
			.flat();
	}

	/**
	 * Gets an array of all game pieces on the board
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all game pieces on the board and their coordinates on it.
	 */
	getAllPieces(board = this.board) {
		// Flatten the array as the contents are of interest and the structure is irrelevent for this function.
		const flatBoard = board.flat();

		// Filter out the squares that do not have a game piece.
		const allSquares = flatBoard.filter((block) => block.gamePiece !== null);

		// Return an array that contains only the necessary pieces of information.
		const allPieces = allSquares.map((square) => {
			return {
				gamePiece: square.gamePiece,
				coordinates: square.squareAttributes.coordinates,
			};
		});

		// console.log(allPieces);
		return allPieces;
	}

	/**
	 * Gets an array of all game pieces that do not belong to the current player.
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all enemy game pieces on the board and their coordinates on it.
	 */
	getOppositePieces(board = this.board) {
		// Get all game pieces and their coordinates.
		const allPieces = this.getAllPieces(board);

		const piecesOfConcern = allPieces.filter(
			(piece) => piece.gamePiece.team !== this.whoseTurn
		);
		return piecesOfConcern;
	}

	/**
	 * Gets an array of all game pieces that belong to the current player.
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all friendly game pieces on the board and their coordinates on it
	 */
	getFriendlyPieces(board = this.board) {
		// Get all pieces on the board
		const allPieces = this.getAllPieces(board);

		// Filter out pieces that do not belong to the current player
		const piecesOfConcern = allPieces.filter(
			(piece) => piece.gamePiece.team === this.whoseTurn
		);
		return piecesOfConcern;
	}

	/**
	 * Gets an array of all moves which the opposing player can make.
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all the possible moves the opposing player can make.
	 */
	getEnemyMoves(board = this.board) {
		// Get all opposing pieces.
		const enemies = this.getOppositePieces(board);

		// Return a 1D array of all moves the enemy pieces can make.
		return enemies
			.map((piece) => {
				const moves = piece.gamePiece.findPossibleMoves(piece.coordinates);
				const validMoves = this.movesValidator(moves, piece.gamePiece, board);
				return validMoves;
			})
			.flat();
	}

	/**
	 * Returns an array which represents all of the current team's potential moves. Each element in the array is an object containing information about
	 * a single potential move that can be made.
	 *
	 * The first two data members are the row and column of the move's target position.
	 *
	 * The boolean represents whether or not the move can capture a piece (used to filter out pawns in another function).
	 *
	 * The final data member is a nested object whose own data members are the row and column of the game piece before
	 * making this potential move.
	 *
	 * @param {Array[]} board Optional parameter - the game board against which to find possible moves. Defaults to the game board in current state.
	 * @returns {[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}]}
	 * An array containing pertinent information about the potential moves.
	 */
	getFriendlyMoves(board = this.board) {
		// Get an array of all friendly pieces.
		const friends = this.getFriendlyPieces(board);

		// For each friendly game piece get an array of all moves they can make and add
		// a property representing their original row and column to each move object.
		// The original coordinates are used to determine if their move could break
		// a check in a later function.
		// Flatten the map for easier processing later.
		return friends.flatMap((piece) => {
			const moves = piece.gamePiece.findPossibleMoves(piece.coordinates);
			const validMoves = this.movesValidator(moves, piece.gamePiece, board);
			validMoves.forEach((move) => {
				move.originalCoordinates = piece.coordinates;
			});
			return validMoves;
		});
	}

	/**
	 * Calls a chain of functions to get all moves of the opposite team (opposite as in not the current player)
	 * which can capture. (EG filters out forward pawn moves blocked by a game piece).
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all enemy moves which can capture a game piece
	 */
	getDangerousEnemyMoves(board = this.board) {
		// Simply gets all enemy moves and filters out null values and those that cannot capture.
		return this.getEnemyMoves(board).filter((move) => {
			if (move === null || move.canCapture === false) return false;
			return true;
		});
	}

	/**
	 * Calls a chain of functions to get all moves from friendly pieces (friendly being those pieces which belong to the current team)
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all moves which
	 */
	getCapableFriendlyMoves(board = this.board) {
		// Gets all moves friendly pieces can make and filters out null moves.
		return this.getFriendlyMoves(board).filter((move) => {
			if (move === null) return false;
			return true;
		});
	}

	/**
	 * Checks to see if a pawn is eligible for promotion.
	 *
	 * @param {{row: Number, column: Number, canCapture: Boolean, mustCapture?: Boolean}} move An object representing a given game piece's potential move.
	 * @param {BoardPiece} piece A game piece
	 * @returns True if game piece is a pawn and has moved to the appropriate end of the game board for its team. False otherwise.
	 */
	checkForPromotion(move, piece) {
		if (piece.name === "Pawn") {
			if (piece.team === "white" && move.row === 7) return true;
			else if (piece.team === "black" && move.row === 0) return true;
		}
		return false;
	}

	/**
	 * Resets the game to a base state and updates the view
	 * @returns
	 */
	restartGame() {
		if (this.history.length === 0) return;
		this.board = this.history[0];
		this.history = [];
		this.checkmate = false;
		this.check = false;
		this.whoseTurn = "black";
		// this.filteredMoves = null;
		this.controller.updateView();
	}

	/**
	 * Checks to see if there are any possible moves the current
	 * team can make to escape a check.
	 *
	 * Alternatively, can also be used to set checkmate state if there is not a check,
	 * but all potential moves a player could make would lead to a check/checkmate.
	 *
	 * Sets checkmate state to true if there is not.
	 */
	checkForCheckMate() {
		// First get an array of all potentially check breaking moves a player can do.
		const potentialSavingMoves = this.getCapableFriendlyMoves();
		let savingMoves = [];

		// Then filter out those moves which would leave the game in a check state.
		savingMoves = potentialSavingMoves.filter((move) => {
			const index = move.originalCoordinates;
			const alternateHistory = this.alternateHistory(move, index);
			const checkWillOccur = this.checkOccurred(alternateHistory);
			if (checkWillOccur.length === 0) return true;
			return false;
		});

		// If there is even a single move, return to the regular game flow.
		if (savingMoves.length > 0) return;

		// If there are no moves which could break the check then the game is over. Checkmate.
		this.checkmate = true;
		this.controller.updateView();
		console.log("Checkmate!");
	}

	/**
	 * Adds a copy of the current board to the game's history state
	 * @param {[[BoardPiece | Null]]} board A 2D array representing the playing board to add to the game's history.
	 */
	addToHistory(board) {
		this.history.push(this.copyHistory(board));
	}

	/**
	 * Creates a deep copy of the current board so as to avoid references to the same location in memory interfering with the current game.
	 *
	 * Instantiates entirely new references to all objects on the game board with identical properties.
	 *
	 * @param {[[BoardPiece | Null]]} board A 2D array representing the playing board
	 * @returns {[[BoardPiece | Null]]} A copy of the board with new references to all the pieces in the same locations as the original.
	 */
	copyHistory(board) {
		const newBoard = this.buildBoard();
		const { Rook, Pawn, Queen, King, Knight, Bishop } = PiecesSetup(newBoard);
		for (let row = 0; row < newBoard.length; row++) {
			for (let col = 0; col < newBoard.length; col++) {
				if (board[row][col].gamePiece !== null) {
					const piece = board[row][col].gamePiece;
					switch (piece.name) {
					case "Rook":
						newBoard[row][col].gamePiece = new Rook(piece.team);
						break;
					case "Pawn":
						newBoard[row][col].gamePiece = new Pawn(piece.team);
						break;
					case "King":
						newBoard[row][col].gamePiece = new King(piece.team);
						break;
					case "Queen":
						newBoard[row][col].gamePiece = new Queen(piece.team);
						break;
					case "Bishop":
						newBoard[row][col].gamePiece = new Bishop(piece.team);
						break;
					case "Knight":
						newBoard[row][col].gamePiece = new Knight(piece.team);
						break;
					default:
						break;
					}
				}
			}
		}
		return newBoard;
	}

	/**
	 * Creates a new board seperate from the game's history and simulates an environment after a hypothetical move.
	 *
	 * @param {{row: Number, column: Number, canCapture: Boolean, mustCapture?: Boolean}} move An object representing a given game piece's hypothetical move.
	 * @param {{row: Number, column: Number}} oldPosition A tuple representing the position of a game piece prior to the hypothetical move.
	 * @returns {[[BoardPiece | Null]]} A game board after the hypothetical move has taken place.
	 */
	alternateHistory(move, oldPosition, board = this.board) {
		// Creates a copy to form a hypothetical future
		const boardCopy = this.copyHistory(board);

		// Saves old position of piece
		const oldRow = oldPosition.row;
		const oldColumn = oldPosition.column;
		const piece = boardCopy[oldRow][oldColumn].gamePiece;

		// Updates board to reflect piece's movement
		boardCopy[move.row][move.column].gamePiece = piece;
		boardCopy[oldRow][oldColumn].gamePiece = null;
		return boardCopy;
	}
	/**
	 * Creates a new board and places new pieces on it.
	 *
	 * @returns {[[BoardPiece | Null]]} A game board after the pieces have been placed on it.
	 */
	initialBoardSetup() {
		const board = this.buildBoard();
		const piecesClasses = PiecesSetup(board);
		return this.placePieces(board, piecesClasses);
	}

	/**
	 * Creates a 2D array representing a game board with properties set for each of the squares and a property set for storing a game piece
	 *
	 * @returns
	 */
	buildBoard() {
		let board = new Array(8).fill(null).map(() => new Array(8).fill(null));

		for (let outer = 0; outer < board.length; outer++) {
			let colorStaggered = outer % 2 === 0 ? false : true;
			for (let inner = 0; inner < board[outer].length; inner++) {
				let color;
				if (!colorStaggered) color = inner % 2 === 0 ? "white" : "black";
				else color = inner % 2 === 0 ? "black" : "white";
				board[outer][inner] = {
					gamePiece: null,
					squareAttributes: {
						coordinates: { row: outer, column: inner },
						color: color,
						selected: false,
					},
				};
			}
		}

		return board;
	}

	placePieces(board, piecesClasses) {
		const { Rook, Pawn, Queen, King, Knight, Bishop } = piecesClasses;

		// Set up black pieces
		board[7][0].gamePiece = new Rook("black");
		board[7][7].gamePiece = new Rook("black");
		board[7][1].gamePiece = new Knight("black");
		board[7][2].gamePiece = new Bishop("black");
		board[7][5].gamePiece = new Bishop("black");
		board[7][3].gamePiece = new Queen("black");
		board[7][6].gamePiece = new Knight("black");
		board[7][4].gamePiece = new King("black");
		board[6].forEach((block) => {
			block.gamePiece = new Pawn("black");
		});

		// Set up white pieces
		board[0][0].gamePiece = new Rook("white");
		board[0][7].gamePiece = new Rook("white");
		board[0][1].gamePiece = new Knight("white");
		board[0][2].gamePiece = new Bishop("white");
		board[0][5].gamePiece = new Bishop("white");
		board[0][3].gamePiece = new Queen("white");
		board[0][6].gamePiece = new Knight("white");
		board[0][4].gamePiece = new King("white");
		board[1].forEach((block) => {
			block.gamePiece = new Pawn("white");
		});

		return board;
	}
	registerController(controller) {
		this.controller = controller;
	}
}

class SingleplayerGame extends Game {
	playerTeam = "black";
	AITeam = "white";
	enemyAI = null;
	constructor() {
		super();
		this.gameType = "singleplayer";
	}
	registerAI(AI) {
		this.enemyAI = AI;
	}

	/**
	 * Simple setter to change the game state representing the current team's turn.
	 * Alerts AI to make a move.
	 *
	 * Uses a ternary operator to toggle this.whosTurn between "black" and "white".
	 */
	changeTurn() {
		this.whoseTurn = this.whoseTurn === "black" ? "white" : "black";
		if (this.whoseTurn === this.AITeam) {
			setTimeout(this.enemyAI.takeTurn.bind(this.enemyAI), 0);
		}
	}

	/**
	 * Takes an AI's move selection and activates the necessary methods to update the game state.
	 *
	 * @param {{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}} moveInfo Information about a particular move the AI has
	 * decided to make.
	 */
	AISelection(moveInfo) {
		// If an AI could not make any moves then check for a checkmate.
		if (moveInfo.length === 0) {
			this.checkForCheckMate();
			// Need to update view as this bypasses the usual move flow.
			this.controller.updateView();
			return;
		}

		const move = {
			row: moveInfo.row,
			column: moveInfo.column,
		};
		const originalCoordinates = moveInfo.originalCoordinates;
		this.selectPiece(originalCoordinates);
		this.movePiece(move);
	}

	/**
	 *  Used as an event handler which routes input from the view to the appropriate state handlers.
	 *
	 * @param {{row: Number, column: Number}} index A two-tuple whose data members represent the row and column of a
	 * square on the game board. These numbers should correspond to an index on the 2D array representing the game board.
	 */
	handleClick(index) {
		// If the game is in checkmate or it is not the player's turn simply prevent selection or movement.
		if (this.checkmate || this.whoseTurn !== this.playerTeam) return;

		// If no current selection attempt to select the piece at the index provided.
		if (!this.selectedPiece) this.selectPiece(index);
		// Finally, try to move/unselect the selected piece
		else this.movePiece(index);
	}

	/**
	 * Gets an array of all game pieces that belong to the current player.
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all friendly game pieces on the board and their coordinates on it
	 */
	getAIPieces(board = this.board) {
		// Get all pieces on the board
		const allPieces = this.getAllPieces(board);

		// Filter out pieces that do not belong to the AI
		const piecesOfConcern = allPieces.filter(
			(piece) => piece.gamePiece.team === this.AITeam
		);
		return piecesOfConcern;
	}

	/**
	 * Returns an array which represents all of the AI team's potential moves. Each element in the array is an object containing information about
	 * a single potential move that can be made.
	 *
	 * The first two data members are the row and column of the move's target position.
	 *
	 * The boolean represents whether or not the move can capture a piece (used to filter out pawns in another function).
	 *
	 * The final data member is a nested object whose own data members are the row and column of the game piece before
	 * making this potential move.
	 *
	 * @param {Array[]} board Optional parameter - the game board against which to find possible moves. Defaults to the game board in current state.
	 * @returns {[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}]}
	 * An array containing pertinent information about the potential moves.
	 */
	getAIMoves(board = this.board) {
		// Get an array of all friendly pieces.
		const friends = this.getAIPieces(board);

		// For each friendly game piece get an array of all moves they can make and add
		// a property representing their original row and column to each move object.
		// The original coordinates are used to determine if their move could break
		// a check in a later function.
		// Flatten the map for easier processing later.
		return friends.flatMap((piece) => {
			const moves = piece.gamePiece.findPossibleMoves(piece.coordinates);
			const validMoves = this.movesValidator(moves, piece.gamePiece, board);
			validMoves.forEach((move) => {
				move.originalCoordinates = piece.coordinates;
			});
			return validMoves;
		});
	}
	/**
	 * Calls a chain of functions to get all moves from AI pieces
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all moves which
	 */
	getCapableAIMoves(board = this.board) {
		// Gets all moves friendly pieces can make and filters out null moves.
		return this.getAIMoves(board).filter((move) => {
			if (move === null) return false;
			return true;
		});
	}
	/**
	 * Gets an array of all game pieces that belong to the current player.
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all friendly game pieces on the board and their coordinates on it
	 */
	getPlayerPieces(board = this.board) {
		// Get all pieces on the board
		const allPieces = this.getAllPieces(board);

		// Filter out pieces that do not belong to the AI
		const piecesOfConcern = allPieces.filter(
			(piece) => piece.gamePiece.team !== this.AITeam
		);
		return piecesOfConcern;
	}

	/**
	 * Returns an array which represents all of the AI team's potential moves. Each element in the array is an object containing information about
	 * a single potential move that can be made.
	 *
	 * The first two data members are the row and column of the move's target position.
	 *
	 * The boolean represents whether or not the move can capture a piece (used to filter out pawns in another function).
	 *
	 * The final data member is a nested object whose own data members are the row and column of the game piece before
	 * making this potential move.
	 *
	 * @param {Array[]} board Optional parameter - the game board against which to find possible moves. Defaults to the game board in current state.
	 * @returns {[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}]}
	 * An array containing pertinent information about the potential moves.
	 */
	getPlayerMoves(board = this.board) {
		// Get an array of all friendly pieces.
		const friends = this.getPlayerPieces(board);

		// For each friendly game piece get an array of all moves they can make and add
		// a property representing their original row and column to each move object.
		// The original coordinates are used to determine if their move could break
		// a check in a later function.
		// Flatten the map for easier processing later.
		return friends.flatMap((piece) => {
			const moves = piece.gamePiece.findPossibleMoves(piece.coordinates);
			const validMoves = this.movesValidator(moves, piece.gamePiece, board);
			validMoves.forEach((move) => {
				move.originalCoordinates = piece.coordinates;
			});
			return validMoves;
		});
	}

	/**
	 * Calls a chain of functions to get all moves from AI pieces
	 *
	 * @param {[[BoardPiece | Null]]} board The board environment in which the game piece's move is being evalutated. Defaults to the current board state.
	 * Can be set for evaluating moves on hypothetical board states.
	 * @returns An array of all moves which
	 */
	getCapablePlayerMoves(board = this.board) {
		// Gets all moves friendly pieces can make and filters out null moves.
		return this.getPlayerMoves(board).filter((move) => {
			if (move === null) return false;
			return true;
		});
	}
}

class OnlineGame extends Game {
	constructor() {
		super();
		this.isOnline = true;
	}
	setLocalPlayerTeam(team) {
		this.localPlayerTeam = team;
	}
	sendToServer() {
		this.socket.emit("gamemove", this.board);
	}

	updateOnSecondPlayerTurn(boardInfo) {
		const newBoard = this.copyHistory(boardInfo);
		this.addToHistory(this.board);
		this.board = newBoard;
		this.changeTurn();
		this.checkForCheck();

		this.controller.updateView();
	}

	registerSocket(socket) {
		this.socket = socket;
		this.socket.on("gamemove", (info) => {
			this.updateOnSecondPlayerTurn(info);
		});
	}
}

export default function gameSetup(gameType) {
	switch (gameType) {
	case "singleplayer":
		return new SingleplayerGame();
	case "online":
		return new OnlineGame();
	default:
		return new Game();
	}
}
