/**
 * The base AI class, has basic functionality for getting appropriate moves and
 * filtering those that would lead to a check/checkmate state.
 *
 * Actual move decisions are implemented in its subclasses.
 */
class AI {
	game = null;
	constructor() {}
	chooseMoves() {
		throw new Error("This must be implemented in an instance");
	}

	/**
	 * A wrapper function which used to encapsulate implementation between subclasses.
	 */
	takeTurn() {
		const moves = this.getMoves();
		return this.chooseMoves(moves);
	}

	/**
	 * A function which gets the moves an AI could make, filtering out moves which would result in a check.
	 *
	 * Can be given an optional alternate history gameboard against which to base its calculations.
	 *
	 * @param {Array[]} board Optional parameter - the game board against which to find possible moves. Defaults to the game board in current state.
	 * @returns {[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}]} An array of potential moves for the given board state.
	 */
	getMoves(board = this.game.board) {
		const potentialMoves = this.game.getCapableAIMoves(board);
		if (potentialMoves.length === 0) return this.game.checkForCheckMate();
		return this.filterUnsafeMoves(potentialMoves);
	}
	/**
	 * Filters out moves that would lead to a check/checkmate.
	 *
	 * @param {[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number} }]} moves An array of all moves which the AI could make.
	 * @returns {[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}]} An array of safe moves.
	 */
	filterUnsafeMoves(moves) {
		const safeMoves = moves.filter((move) => {
			const { row, column } = move;
			const originalPosition = move.originalCoordinates;
			const potentialMoveState = this.game.alternateHistory(
				{ row, column },
				originalPosition
			);
			// Checks if the "alternate history" move would result in a check against the player that took the
			// move.
			const checkWillOccur = this.game.checkOccurred(potentialMoveState);
			// If the move is safe allow it, else prevent player from taking it.
			if (checkWillOccur.length === 0) return true;
		});
		// If there are no safe moves possible, then the AI has lost.
		return safeMoves;
	}
	/**
	 * Stores a reference to the game instance the AI will play in and registers itself with said game.
	 * The game likewise stores a reference to the AI and it's team.
	 * @param {Game} game An instance of a chess game.
	 */
	observeGame(game) {
		if (!this.game) {
			this.game = game;
			// Temporarily white, can change to allow player choice of starting team.
			game.registerAI(this);
		}
	}
}

/**
 * An easy implementation of an AI.
 *
 * Makes moves quite literally at random. Only avoiding moves which would lead to a check/checkmate.
 * Unpredictable and inept.
 */
class EasyAI extends AI {
	constructor() {
		super();
	}

	/**
	 * Will call the game with the AI's choice and the game will update its state accordingly.
	 *
	 * This is the easy mode implementation, which very simply selects a move at random with no weighting or other
	 * considerations given whatsoever.
	 * @param {{[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number} }]}} potentialMoves
	 */
	chooseMoves(potentialMoves) {
		if (potentialMoves.length === 0) return this.game.AISelection([]);
		const selection = Math.round(Math.random() * (potentialMoves.length - 1));
		this.game.AISelection(potentialMoves[selection]);
	}
}

/**
 * A medium difficulty implementation of the AI.
 *
 * Weighs moves based on a score.
 * Score is defined as the sum of potential captures. Game states leading to a check/checkmate are
 * weighed much heavier.
 */
class MediumAI extends AI {
	constructor() {
		super();
	}
	/**
	 * Medium difficulty implementation of chooseMoves.
	 *
	 * Will feed moves array into a function which ranks moves based on capturing potential.
	 *
	 * @param {{[{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number} }]}} potentialMoves
	 * @returns
	 */
	chooseMoves(potentialMoves) {
		if (potentialMoves.length === 0) return this.game.AISelection([]);
		const rankedMoves = this.rankMoves(potentialMoves);

		let bestScore = -999;
		const scores = rankedMoves.values();
		for (const score of scores) {
			if (score > bestScore) {
				bestScore = score;
			}
		}
		const bestMoves = [];
		rankedMoves.forEach((val, key) => {
			if (val === bestScore) {
				bestMoves.push(key);
			}
		});

		const selection = Math.round(Math.random() * (bestMoves.length - 1));
		this.game.AISelection(bestMoves[selection]);
	}

	/**
	 * Ranks moves based on which piece - if any - the move can capture.
	 *
	 * A move which can capture the King is weighed extremely heavily so as to greatly incentivize AI to select moves to lead to a capture.
	 *
	 * @param {{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}[]} potentialMoves An array of all moves which the AI could make.
	 * @returns {Map<{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}, Number>} A map consisting of a move as a key
	 * and a number representing its weighted value.
	 */
	rankMoves(potentialMoves, board = this.game.board) {
		const moveRanks = new Map();
		potentialMoves.forEach((move) => {
			let score = this.rankMove(move, board);
			moveRanks.set(move, score);
		});

		return moveRanks;
	}

	/**
	 * Ranks a move based on the potential capture a move can make and the worst case scenario of the enemy's response.
	 * 
	 * Worst case scenario is defined as the highest ranking piece which can be captured on the next move after the given move.
	 * @param {{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}} move An object representing a potential move.
	 * @param {(BoardPiece | Null)[][]} board The board state against which to evaluate the move.
	 * @returns {Number} A score for the given move.
	 */
	rankMove(move, board = this.game.board) {
		let score = 0;
		const { row, column, canCapture } = move;
		const potentialCapture = board[row][column];
		if (!potentialCapture) {
			score += 0;
		} else
			switch (potentialCapture.name) {
			// First case will never eval to true for a Medium AI, but exists so that
			// a Hard AI can use it for ranking potential future moves in a chain.
			case "King":
				score += 100;
				break;
			case "Queen":
				score += 15;
				break;
			case "Knight":
			case "Bishop":
			case "Rook":
				score += 10;
				break;
			case "Pawn":
				score += 5;
				break;
			default:
				score += 2;
			}
		const alternateHistory = this.game.alternateHistory(
			{ row, column, canCapture },
			move.originalCoordinates,
			board
		);
		const potentialEnemyMoves =
			this.game.getCapablePlayerMoves(alternateHistory);

		potentialEnemyMoves.forEach((move) => {
			let worstCase = 0;
			const { row, column } = move;
			const potentialCapture = alternateHistory[row][column];
			if (!potentialCapture) return;
			switch (potentialCapture.name) {
			case "King":
				worstCase = 100;
				break;
			case "Queen":
				if (worstCase < 15) worstCase = 15;
				break;
			case "Knight":
			case "Bishop":
			case "Rook":
				if (worstCase < 10) worstCase = 10;
				break;
			case "Pawn":
				if (worstCase < 5) worstCase = 5;
				break;
			default:
				if (worstCase < 0) worstCase = 0;
			}
			score -= worstCase;
		});

		return score;
	}
}

/**
 * A hard difficulty implementation of the AI.
 *
 * Weighs moves based on a score.
 * Uses a tree data structure to evaluate and score moves.
 */
class HardAI extends AI {
	constructor() {
		super();
		this.moveTree = new MoveTree(this);
	}

	/**
	 * Calls the AI's moveTree to evaluate the best choices for a potential move.
	 * If no moves are possible, have the game check for a checkmate. Else choose a random move.
	 */
	takeTurn() {
		const moves = this.moveTree.getMoves();
		if (moves.length === 0) return this.game.checkForCheckMate();
		if (moves.length === 1) return this.game.AISelection(moves[0].moveInfo);

		const index = Math.round(Math.random() * (moves.length - 1));

		this.game.AISelection(moves[index].moveInfo);
	}
}

class MoveTree {
	/**
	 * @param {AI} AIReference A reference to the AI that will utilize this tree.
	 */
	constructor(AIReference) {
		this.AI = AIReference;
		this.potentialMoves = [];
	}
	
	/**
	 * 
	 * @returns An array of the best possible moves in an AI's situation.
	 */
	getMoves() {
		this.addMoves();
		// return this.genTest();
		return this.findBestMoves();
	}

	/**
	 * Calls the AI to get all moves it can make.
	 * Then ranks the moves and finds all possible next moves and ranks those in turn.
	 * Saves the moves to the potentialMoves property.
	 */
	addMoves() {
		let potentialMoves = [];
		const moves = this.AI.getMoves();
		moves.forEach((move) => {
			potentialMoves.push(new Move(move, this.AI.game.board, this));
		});

		potentialMoves.forEach((move) => {
			move.rankMove();
			move.getNextMoves();
			move.nextMoves.forEach((move) => {
				move.rankMove();
			});
		});
		this.potentialMoves = potentialMoves;
	}

	/**
	 * 
	 * @returns {Move[]} An array of the best possible moves.
	 */
	findBestMoves() {
		let bestScore = -999;
		let bestMoves = [];

		this.potentialMoves.forEach((initialMove) => {
			initialMove.nextMoves.forEach((nextMove) => {
				if (nextMove.score > bestScore) {
					bestScore = nextMove.score;
					bestMoves = [];
					bestMoves.push(initialMove);
				} else if (nextMove.score === bestScore) {
					bestMoves.push(initialMove);
				}
			});
		});
		return bestMoves;
	}
}

class Move {
	/**
	 * 
	 * @param {{row: Number, column: Number, canCapture: Boolean, originalCoordinates: {row: Number, column: Number}}} move A potential move.
	 * @param {(BoardPiece | null)[][]} board A game board against which to compare the move.
	 * @param {MoveTree} tree The tree structure which this move resides in.
	 * @param {Move | null} parent The previous move that must be made to get to this move.
	 */
	constructor(move, board, tree, parent = null) {
		this.tree = tree;
		this.score = 0;
		this.moveInfo = move;
		this.boardBeforeMove = board;
		this.nextMoves = [];
		this.parent = parent;
	}
	/**
	 * Sets the move's score to a value.
	 * @param {Number} score A score for the move
	 * @returns The score after it has been set
	 */
	setScore(score) {
		return (this.score = score);
	}

	/**
	 * Returns the move's current score.
	 * @returns {number} The move's score
	 */
	getScore() {
		return this.score;
	}

	/**
	 * Ranks a move based on the potential capture a move can make and the worst case scenario of the enemy's response.
	 * 
	 * Worst case scenario is defined as the highest ranking piece which can be captured on the next move after the given move.
	 * @returns {number} The score after ranking
	 */
	rankMove() {
		let score = 0;
		if (this.parent) {
			score = this.parent.score;
		}
		const { row, column } = this.moveInfo;
		const potentialCapture = this.boardBeforeMove[row][column];
		if (!potentialCapture) {
			score += 0;
		} else
			switch (potentialCapture.name) {
			// First case will never eval to true for a Medium AI, but exists so that
			// a Hard AI can use it for ranking potential future moves in a chain.
			case "King":
				score += 100;
				break;
			case "Queen":
				score += 15;
				break;
			case "Knight":
			case "Bishop":
			case "Rook":
				score += 10;
				break;
			case "Pawn":
				score += 5;
				break;
			default:
				score += 2;
			}

		score += this.scoreStateAfterMove();

		return this.setScore(score);
	}

	/**
	 * Evaluates the worst case scenario after a move is called.
	 * @returns {number} The score of a move's worst potential future.
	 */
	scoreStateAfterMove() {
		const { row, column } = this.moveInfo;
		const alternateHistory = this.tree.AI.game.alternateHistory(
			{ row, column },
			this.moveInfo.originalCoordinates,
			this.boardBeforeMove
		);
		this.boardAfterMove = alternateHistory;
		const potentialEnemyMoves =
			this.tree.AI.game.getCapablePlayerMoves(alternateHistory);

		let score = 0;

		potentialEnemyMoves.forEach((move) => {
			let worstCase = 0;
			const { row, column } = move;
			const potentialCapture = alternateHistory[row][column];
			if (!potentialCapture) return;
			switch (potentialCapture.name) {
			case "King":
				worstCase = 100;
				break;
			case "Queen":
				if (worstCase < 15) worstCase = 15;
				break;
			case "Knight":
			case "Bishop":
			case "Rook":
				if (worstCase < 10) worstCase = 10;
				break;
			case "Pawn":
				if (worstCase < 5) worstCase = 5;
				break;
			default:
				if (worstCase < 0) worstCase = 0;
			}
			score -= worstCase;
		});
		return score;
	}

	/**
	 * Gets the next possible moves after this move.
	 */
	getNextMoves() {
		const movesInfo = this.tree.AI.getMoves(this.boardAfterMove);
		movesInfo.forEach((move) => {
			this.nextMoves.push(new Move(move, this.boardAfterMove, this.tree, this));
		});
	}
}

/**
 * A factory function which will return an AI at a desired difficulty level.
 * @param {"easy" | "medium" | "hard"} difficultyLevel A string representing the requested difficulty level of an AI instance.
 * @returns {AI} An instance of an AI object
 */
export default function AIFactory(difficultyLevel) {
	if (!difficultyLevel) {
		throw new Error("Must define an AI difficulty");
	}
	switch (difficultyLevel) {
	case "easy":
		return new EasyAI();
	case "medium":
		return new MediumAI();
	case "hard":
		return new HardAI();
	}
}
