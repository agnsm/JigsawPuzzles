import { Piece } from "./piece";

export class Jigsaw {
  rows: number;
  cols: number;
  width: number;
  height: number;
  x: number;
  y: number;
  pieces: Piece[] = [];
  pieceWidth: number;
  pieceHeight: number;

  constructor(
    rows: number, 
    cols: number, 
    width: number, 
    height: number
) {
    this.rows = rows;
    this.cols = cols;
    this.width = width;
    this.height = height;
    this.x = width / 4;
    this.y = height / 4;
    this.pieceWidth = width / cols;
    this.pieceHeight = height / rows;
  }

  addPiece(piece: Piece) {
    this.pieces.push(piece);
  }

  putPieceOnTop(piece: Piece) {
    const index = this.pieces.indexOf(piece);

    if (index >= 0) {
      this.pieces.splice(index, 1);
      this.addPiece(piece);
    }
  }
}
