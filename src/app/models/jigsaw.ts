import { Piece } from "./piece";

export class Jigsaw {
  rows: number;
  cols: number;
  width: number;
  height: number;
  x: number;
  y: number;
  scale: number;
  ratio: number;
  pieces: Piece[] = [];
  pieceWidth: number;
  pieceHeight: number;
  imagePieceWidth: number;
  imagePieceHeight: number;

  constructor(
    rows: number, 
    cols: number, 
    imageWidth: number,
    imageHeight: number,
    canvasWidth: number, 
    canvasHeight: number,
    scale: number
  ) {
    this.rows = rows;
    this.cols = cols;

    this.scale = scale;
    this.ratio = scale * Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);

    this.width = imageWidth * this.ratio;
    this.height = imageHeight * this.ratio;

    this.x = (canvasWidth - this.width) / 2;
    this.y = (canvasHeight - this.height) / 2;

    this.pieceWidth = this.width / cols;
    this.pieceHeight = this.height / rows;

    this.imagePieceWidth = imageWidth / cols;
    this.imagePieceHeight = imageHeight / rows;
  }

  addPiece(piece: Piece) {
    this.pieces.push(piece);
  }

  movePieceToTop(piece: Piece) {
    const index = this.pieces.indexOf(piece);

    if (index >= 0) {
      this.pieces.splice(index, 1);
      this.addPiece(piece);
    }
  }

  movePieceToBottom(piece: Piece) {
    const index = this.pieces.indexOf(piece);

    if (index >= 0) {
      this.pieces.splice(index, 1);
      this.pieces.unshift(piece);
    }
  }

  getDefaultPositionOfPiece(piece: Piece) {
    return {
      x: this.x + piece.col * this.pieceWidth,
      y: this.y + piece.row * this.pieceHeight
    };
  }

  getRelativePositionOfPiece(piece: Piece, basePiece: Piece) {
    const basePieceDefaultPosition = this.getDefaultPositionOfPiece(basePiece);
    const vector = { x: basePiece.dx - basePieceDefaultPosition.x, y: basePiece.dy - basePieceDefaultPosition.y };
    const pieceDefaultPosition = this.getDefaultPositionOfPiece(piece);

    return {
      x: pieceDefaultPosition.x + vector.x,
      y: pieceDefaultPosition.y + vector.y
    };
  }

  getPiece(row: number, col: number) {
    return this.pieces.filter(piece => piece.row == row && piece.col == col)[0];
  }
}
