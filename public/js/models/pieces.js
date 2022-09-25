export default function PiecesSetup(gameBoard) {
  const board = gameBoard;
  class BoardPiece {
    name;
    team;
    constructor() {}
    findPossibleMoves(index) {
      const { row, column } = index;
      return this.moveImplementation(row, column);
    }
    moveImplementation() {
      throw new Error("moveImplementation must be implemented");
    }
  }

  class Pawn extends BoardPiece {
    constructor(team) {
      super();
      this.name = "Pawn";
      this.team = team;
      this.initialMove = true;
      if (team === "black")
        this.moveImplementation = (row, column) => {
          let moves = [];
          if(this.initialMove && row - 2 >= 0) {
            if(!board[row - 1][column].gamePiece)
              moves.push({row: row - 2, column, canCapture: false});
          };
          moves.push({ row: row - 1, column, canCapture: false });
          moves.push({
            row: row - 1,
            column: column + 1,
            canCapture: true,
            mustCapture: true,
          });
          moves.push({
            row: row - 1,
            column: column - 1,
            canCapture: true,
            mustCapture: true,
          });
          return moves;
        };
      else
        this.moveImplementation = (row, column) => {
          let moves = [];
          if(this.initialMove && row + 2 <= 7) {
            if(!board[row + 1][column].gamePiece)
              moves.push({row: row + 2, column, canCapture: false});
          };
          moves.push({ row: row + 1, column, canCapture: false });
          moves.push({
            row: row + 1,
            column: column + 1,
            canCapture: true,
            mustCapture: true,
          });
          moves.push({
            row: row + 1,
            column: column - 1,
            canCapture: true,
            mustCapture: true,
          });
          return moves;
        };
    }
    setMoved() {
      this.initialMove  = false;
    }
  }

  class Rook extends BoardPiece {
    constructor(team) {
      super();
      this.team = team;
      this.name = "Rook";
      this.moveImplementation = (row, column) => {
        return horizontalAndVerticalMovement(row, column);
      };
    }
  }
  class Knight extends BoardPiece {
    constructor(team) {
      super();
      this.team = team;
      this.name = "Knight";
      this.moveImplementation = (row, column) => {
        let moves = [];
        // Upper left Moves
        moves.push({ row: row - 2, column: column - 1, canCapture: true });
        moves.push({ row: row - 1, column: column - 2, canCapture: true });

        // Lower Left moves
        moves.push({ row: row + 2, column: column - 1, canCapture: true });
        moves.push({ row: row + 1, column: column - 2, canCapture: true });

        // Upper Right moves
        moves.push({ row: row - 2, column: column + 1, canCapture: true });
        moves.push({ row: row - 1, column: column + 2, canCapture: true });

        // Lower Right Moves
        moves.push({ row: row + 2, column: column + 1, canCapture: true });
        moves.push({ row: row + 1, column: column + 2, canCapture: true });
        return moves;
      };
    }
  }
  class King extends BoardPiece {
    constructor(team) {
      super();
      this.team = team;
      this.name = "King";
      this.moveImplementation = (row, column) => {
        let moves = [];
        for (let upDown = row - 1; upDown <= row + 1; upDown++)
          for (let leftRight = column - 1; leftRight <= column + 1; leftRight++)
            if (!(leftRight === column && upDown === row))
              moves.push({ row: upDown, column: leftRight, canCapture: true });
        return moves;
      };
    }
  }
  class Bishop extends BoardPiece {
    constructor(team) {
      super();
      this.team = team;
      this.name = "Bishop";
      this.moveImplementation = (row, column) => {
        return diagonalMovement(row, column);
      };
    }
  }
  class Queen extends BoardPiece {
    constructor(team) {
      super();
      this.team = team;
      this.name = "Queen";
      this.moveImplementation = (row, column) => {
        let moves = diagonalMovement(row, column);
        return moves.concat(horizontalAndVerticalMovement(row, column));
      };
    }
  }

  function diagonalMovement(row, column) {
    let moves = [];
    for (let up = row - 1; up >= 0; up--) {
      // Keeps horizontal and vertical distance the same for each
      // potential move.
      let distance = Math.abs(row - up);
      let newCol = column - distance;

      // Keeps moves from going out of bounds and
      // stops adding moves if there is a blocking
      // piece on the board.
      if (newCol < 0) break;
      moves.push({ row: up, column: newCol, canCapture: true });
      const potentialBlocker = board[up][newCol].gamePiece;
      if (potentialBlocker) break;
    }

    // Movement to Upper Right
    for (let up = row - 1; up >= 0; up--) {
      let distance = Math.abs(row - up);
      let newCol = column + distance;
      if (newCol > 7) break;
      moves.push({ row: up, column: newCol, canCapture: true });
      const potentialBlocker = board[up][newCol].gamePiece;
      if (potentialBlocker) break;
    }

    // Movement to Lower Left
    for (let up = row + 1; up < 8; up++) {
      let distance = Math.abs(row - up);
      let newCol = column - distance;
      if (newCol < 0) break;
      moves.push({ row: up, column: newCol, canCapture: true });
      const potentialBlocker = board[up][newCol].gamePiece;
      if (potentialBlocker) break;
    }

    // Movement to Lower Right
    for (let up = row + 1; up < 8; up++) {
      let distance = Math.abs(row - up);
      let newCol = column + distance;
      if (newCol > 7) break;
      moves.push({ row: up, column: newCol, canCapture: true });
      const potentialBlocker = board[up][newCol].gamePiece;
      if (potentialBlocker) break;
    }
    return moves;
  }

  function horizontalAndVerticalMovement(row, column) {
    let moves = [];
    // Movement "up" board (towards top of screen)
    for (let rowDecrement = row - 1; rowDecrement >= 0; rowDecrement--) {
      moves.push({
        row: rowDecrement,
        column,
        canCapture: true,
      });
      const potentialBlocker = board[rowDecrement][column].gamePiece;
      if (potentialBlocker) break;
    }
    // Movement "down" board (towards bottom of screen)
    for (let rowIncrement = row + 1; rowIncrement < 8; rowIncrement++) {
      moves.push({
        row: rowIncrement,
        column,
        canCapture: true,
      });
      const potentialBlocker = board[rowIncrement][column].gamePiece;
      if (potentialBlocker) break;
    }
    // Movement to the right
    for (let colIncrement = column + 1; colIncrement < 8; colIncrement++) {
      moves.push({
        row,
        column: colIncrement,
        canCapture: true,
      });
      const potentialBlocker = board[row][colIncrement].gamePiece;
      if (potentialBlocker) break;
    }
    // Movement to the left
    for (let colDecrement = column - 1; colDecrement >= 0; colDecrement--) {
      moves.push({
        row,
        column: colDecrement,
        canCapture: true,
      });
      const potentialBlocker = board[row][colDecrement].gamePiece;
      if (potentialBlocker) break;
    }
    return moves;
  }

  return { Queen, Rook, Knight, King, Bishop, Pawn };
}
