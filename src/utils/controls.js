let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

export function setMoveLeft(val) { moveLeft = val; }
export function setMoveRight(val) { moveRight = val; }
export function setMoveUp(val) { moveUp = val; }
export function setMoveDown(val) { moveDown = val; }

export function getMoveLeft() { return moveLeft; }
export function getMoveRight() { return moveRight; }
export function getMoveUp() { return moveUp; }
export function getMoveDown() { return moveDown; }
