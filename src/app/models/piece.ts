export class Piece {
  row: number;
  col: number;
  sx: number;
  sy: number;
  dx: number;
  dy: number;

  constructor(
    row: number, 
    col: number, 
    sx: number, 
    sy: number, 
    dx: number, 
    dy: number
) {
    this.row = row;
    this.col = col;
    this.sx = sx;
    this.sy = sy;
    this.dx = dx;
    this.dy = dy;
  }
}
