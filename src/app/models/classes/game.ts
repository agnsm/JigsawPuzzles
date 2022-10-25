import { Canvas } from "./canvas";
import { Direction } from "./connection";
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

  public drawJigsaw() {
    this.resetCanvasState();

    this.jigsaw.pieces.forEach(piece => {
      this.drawCutPiece(piece);
    });
  }

  public drawFinishedJigsaw() {
    this.clearCanvas();
    this.displayBoundaries();
    this.displayBackground(1);
  }

  private resetCanvasState() {
    this.clearCanvas();
    this.displayBoundaries();
    if (this._previewEnabled) {
      this.displayBackground();
    }
  }

  private clearCanvas() {
    this.canvas.context.clearRect(
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

  private drawCutPiece(piece: Piece) {
    this.canvas.context.save();
    this.canvas.context.beginPath();
    this.canvas.context.moveTo(piece.destPosition.x, piece.destPosition.y);

    let startingPoint = new Coordinates(piece.destPosition.x, piece.destPosition.y);

    const horizontalOffsetBefore = Math.round(this.jigsaw.destPieceSize.width * 3/8);
    const horizontalOffsetAfter = Math.round(this.jigsaw.destPieceSize.width * 5/8);

    const verticalOffsetBefore = Math.round(this.jigsaw.destPieceSize.height * 3/8);
    const verticalOffsetAfter = Math.round(this.jigsaw.destPieceSize.height * 5/8);

    const curveConvexityDest = Math.round(this.jigsaw.destPieceSize.width * 1/5);
    const curveConvexitySource = Math.round(this.jigsaw.sourcePieceSize.width * 1/5);

    let connection;

    if (connection = piece.connections.find(x => x.direction == Direction.Top)) {
      this.drawHorizontalEdge(startingPoint, horizontalOffsetBefore, horizontalOffsetAfter, connection.type * curveConvexityDest);
    } 

    startingPoint.addVector(new Coordinates(this.jigsaw.destPieceSize.width, 0));
    this.canvas.context.lineTo(startingPoint.x, startingPoint.y);

    if (connection = piece.connections.find(x => x.direction == Direction.Right)) {
      this.drawVerticalEdge(startingPoint, verticalOffsetBefore, verticalOffsetAfter, connection.type * curveConvexityDest);
    }

    startingPoint.addVector(new Coordinates(0, this.jigsaw.destPieceSize.height));
    this.canvas.context.lineTo(startingPoint.x, startingPoint.y);

    if (connection = piece.connections.find(x => x.direction == Direction.Bottom)) {
      this.drawHorizontalEdge(startingPoint, -horizontalOffsetBefore, -horizontalOffsetAfter, connection.type * curveConvexityDest);
    }

    startingPoint.addVector(new Coordinates(-this.jigsaw.destPieceSize.width, 0));
    this.canvas.context.lineTo(startingPoint.x, startingPoint.y);

    if (connection = piece.connections.find(x => x.direction == Direction.Left)) {
      this.drawVerticalEdge(startingPoint, -verticalOffsetBefore, -verticalOffsetAfter, connection.type * curveConvexityDest);
    }

    this.canvas.context.lineTo(piece.destPosition.x, piece.destPosition.y);

    // if (!piece.locked) {
    //   this.canvas.context.shadowBlur = 10;
    //   this.canvas.context.shadowColor = 'rgba(0, 0, 0, 0.75)';
    //   this.canvas.context.fill();
    // }

    this.canvas.context.stroke();
    this.canvas.context.clip();

    this.canvas.context.drawImage(
      this._image, 
      piece.sourcePosition.x - curveConvexitySource, piece.sourcePosition.y - curveConvexitySource, 
      this.jigsaw.sourcePieceSize.width + 2 * curveConvexitySource, this.jigsaw.sourcePieceSize.height + 2 * curveConvexitySource,
      piece.destPosition.x - curveConvexityDest, piece.destPosition.y - curveConvexityDest, 
      this.jigsaw.destPieceSize.width + 2 * curveConvexityDest, this.jigsaw.destPieceSize.height + 2 * curveConvexityDest
    );

    this.canvas.context.restore();
  }

  private drawHorizontalEdge(startingPoint: Coordinates, offsetBefore: number, offsetAfter: number, curveConvexity: number) {
    this.canvas.context.lineTo(startingPoint.x + offsetBefore, startingPoint.y);
    this.canvas.context.bezierCurveTo(
      startingPoint.x + offsetBefore, startingPoint.y + curveConvexity, 
      startingPoint.x + offsetAfter, startingPoint.y + curveConvexity, 
      startingPoint.x + offsetAfter, startingPoint.y
    );
  }

  private drawVerticalEdge(startingPoint: Coordinates, offsetBefore: number, offsetAfter: number, curveConvexity: number) {
    this.canvas.context.lineTo(startingPoint.x, startingPoint.y + offsetBefore);
    this.canvas.context.bezierCurveTo(
      startingPoint.x + curveConvexity, startingPoint.y + offsetBefore, 
      startingPoint.x + curveConvexity, startingPoint.y + offsetAfter, 
      startingPoint.x, startingPoint.y + offsetAfter
    );
  }
}
