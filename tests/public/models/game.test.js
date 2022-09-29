import gameStart from "../../../public/js/models/game";
import assert from "assert";

let game;

beforeEach(function setup() {
  game = gameStart("easy");
});
