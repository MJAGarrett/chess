class MoveTree {
  constructor(AI) {
    this.AI = AI;
  }
  initializeRoot() {
    this.root = new MoveNode(null, this.AI.game.board);
    this.root.updateNextPossibleMoves(this.AI);
    this.updateTree();
    this.root.scoreChildren(this.AI);
  }
  updateRoot() {
    this.root = new MoveNode(null, this.AI.game.board);
    this.root.history = this.AI.history;
    this.updateTree();
    this.root.scoreChildren(this.AI);
  }
  getRoot() {
    return this.root;
  }
  getHighestScoringMoves() {
    this.root.scoreChildren(this.AI);
    let highscore = 0;
    for(const moveNode of this.root.nextPossibleMoves) {
      if (moveNode.score > highscore) {
        highscore = moveNode.score;
      }
    }
    const bestMoves = this.root.nextPossibleMoves.filter((node) => {
      if(node.score === highscore) return true;
      return false;
    })
    return bestMoves;
  }
  updateTree() {
    this.root.history = this.AI.game.board;
    this.root.updateNode(this.AI);
  }
  // *depthTraversalGenerator(node = this.root) {
  //   yield node;
  //   node.nextPossibleMoves.forEach((nextMoveNode) => {
  //     yield nextMoveNode;
  //     if(nextMoveNode.length > 0) {
  //       yield* this.depthTraversalGenerator(nextMoveNode);
  //     }
  //   });
  // }
}

class MoveNode {
  constructor(move, history) {
    this.move = move;
    this.history = history;
    this.nextPossibleMoves = [];
    this.score = 0;
  }
  updateNextPossibleMoves(AIReference) {
    this.nextPossibleMoves = [];
    const moves = AIReference.getMoves(this.history);
    moves.forEach((move) => {
      const {row, column, canCapture} = move;
      const oldPosition = move.originalCoordinates;
      const boardStateAfterMove = AIReference.game.alternateHistory({row, column, canCapture}, oldPosition, this.history);
      // Above code could be absolutely useless
      this.nextPossibleMoves.push(new MoveNode(move, boardStateAfterMove));
    });
  };
  getNextPossibleMoves() {
    return this.nextPossibleMoves;
  }
  *traverseChildren() {
    for(const moveNode of this.nextPossibleMoves) {
      yield moveNode;
      if(moveNode.nextPossibleMoves.length > 0) {
        yield* moveNode.traverseChildren();
      }
    }
  }
  scoreChildren(AIReference) {
    const children = this.traverseChildren();
    for(const child of children) {
      child.score = AIReference.rankMove(child.move, this.history);
    }
  }
  // updateChildren(AIReference, children = this.nextPossibleMoves, levels = 5) {
  //   if (levels === 0) return;
  //     let nextSetOfMoves = [];
  //     children.forEach((moveNode) => {
  //       moveNode.updateNextPossibleMoves(AIReference);
  //       nextSetOfMoves.concat(moveNode.getNextPossibleMoves());
  //     })
  //     this.updateChildren(AIReference, nextSetOfMoves, levels - 1);
  // }
  updateNode(AIReference, levels = 2) {
    this.updateNextPossibleMoves(AIReference);
    if (levels === 0) return;
    this.nextPossibleMoves.forEach((move) => {
      move.updateNode(AIReference, levels - 1);
    })
  }
}