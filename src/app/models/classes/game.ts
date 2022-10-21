import { Canvas } from "./canvas";
import { Coordinates } from "./coordinates";
import { Jigsaw } from "./jigsaw";
import { Piece } from "./piece";

export class Game {
  private _canvas: Canvas;
  private _jigsaw: Jigsaw;
  private _image: HTMLImageElement;
  private _activePiece: Piece | null;
  private _canvasDragging: Coordinates | null;
  private _started: boolean;
  private _previewEnabled: boolean;

  constructor(canvas: Canvas, jigsaw: Jigsaw, image: HTMLImageElement) {
    this._canvas = canvas;
    this._jigsaw = jigsaw;
    this._image = image;
    this._activePiece = null;
    this._canvasDragging = null;
    this._started = false;
    this._previewEnabled = false;
  }

  public get canvas() {
    return this._canvas;
  }
  
  public get jigsaw() {
    return this._jigsaw;
  }

  public get activePiece() {
    return this._activePiece;
  }

  public set activePiece(value: Piece | null) {
    this._activePiece = value;
  }

  public get canvasDragging() {
    return this._canvasDragging;
  }

  public set canvasDragging(value: Coordinates | null) {
    this._canvasDragging = value;
  }

  public get started() {
    return this._started;
  }

  public get previewEnabled() {
    return this._previewEnabled;
  }

  public start() {
    this._started = true;
  }

  public togglePreview() {
    this._previewEnabled = !this._previewEnabled;
  }

  public resetCanvasState() {
    this.clearCanvas();
    this.displayBoundaries();
    if (this._previewEnabled) {
      this.displayBackground();
    }
  }

  public summaryCanvasState() {
    this.clearCanvas();
    this.displayBoundaries();
    this.displayBackground(1);
  }

  public drawJigsaw() {
    this.resetCanvasState();

    this.jigsaw.pieces.forEach(piece => {
      this.drawPiece(piece);
    });
  }

  private clearCanvas() {
    this.canvas.context.clearRect(
      this.canvas.position.x, this.canvas.position.y, 
      this.canvas.size.width, this.canvas.size.height
    );

    this.canvas.context.fillStyle = 'rgba(26, 28, 39, 0.9)';
    this.canvas.context.fillRect(
      this.canvas.position.x, this.canvas.position.y, 
      this.canvas.size.width, this.canvas.size.height
    );
  }

  private displayBoundaries() {
    this.canvas.context.beginPath();
    this.canvas.context.rect(
      this.jigsaw.position.x, this.jigsaw.position.y, 
      this.jigsaw.size.width, this.jigsaw.size.height
    );
    this.canvas.context.stroke();
    this.canvas.context.save();
  }

  private displayBackground(alpha = 0.4) {
    this.canvas.context.save();
    this.canvas.context.globalAlpha = alpha;
    this.canvas.context.drawImage(
      this._image, 
      this.jigsaw.position.x, this.jigsaw.position.y, 
      this.jigsaw.size.width, this.jigsaw.size.height
    );
    this.canvas.context.restore();
  }
  
  private drawPiece(piece: Piece) {
    this.canvas.context.drawImage(
      this._image, 
      piece.sourcePosition.x, piece.sourcePosition.y, 
      this.jigsaw.sourcePieceSize.width, this.jigsaw.sourcePieceSize.height,
      piece.destPosition.x, piece.destPosition.y, 
      this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height
    );

    this.canvas.context.strokeRect(
      piece.destPosition.x, piece.destPosition.y, 
      this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height
    );
  }
}
