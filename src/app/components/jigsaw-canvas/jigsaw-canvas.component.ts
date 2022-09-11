import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Canvas } from 'src/app/models/canvas';
import { Jigsaw } from 'src/app/models/jigsaw';
import { Piece } from 'src/app/models/piece';

@Component({
  selector: 'app-jigsaw-canvas',
  templateUrl: './jigsaw-canvas.component.html',
  styleUrls: ['./jigsaw-canvas.component.scss']
})
export class JigsawCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;

  context!: CanvasRenderingContext2D;

  canvas!: Canvas;
  jigsaw!: Jigsaw;

  activePiece: Piece | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeContext();
      this.initializeJigsaw();
      this.initializeCanvas();
      this.setCanvasElementSize();

      this.resetCanvas();
      this.prepareJigsaw();
    }, 1000);
  }

  initializeContext() {
    this.context = this.canvasElement.nativeElement.getContext('2d')!;
  }

  initializeJigsaw() {
    this.jigsaw = new Jigsaw(
      2, 2,
      this.imageElement.nativeElement.width,
      this.imageElement.nativeElement.height
    );
  }

  initializeCanvas() {
    this.canvas = new Canvas(
      1.5 * this.imageElement.nativeElement.width, 
      1.5 * this.imageElement.nativeElement.height
    );
  }

  setCanvasElementSize() {
    this.canvasElement.nativeElement.width = this.canvas.width;
    this.canvasElement.nativeElement.height = this.canvas.height;
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  displayBoundaries() {
    this.context.beginPath();
    this.context.rect(this.jigsaw.x, this.jigsaw.y, this.jigsaw.width, this.jigsaw.height);
    this.context.stroke();
    this.context.save();
  }

  displayBackground() {
    this.context.save();
    this.context.globalAlpha = 0.4;
    this.context.drawImage(this.imageElement.nativeElement, this.jigsaw.x, this.jigsaw.y);
    this.context.restore();
  }

  resetCanvas() {
    this.clearCanvas();
    this.displayBoundaries();
    this.displayBackground();
  }

  prepareJigsaw() {
    for (let row = 0; row < this.jigsaw.rows; row++) {
      for (let col = 0; col < this.jigsaw.cols; col++) {
        const sx = this.jigsaw.pieceWidth * col;
        const sy = this.jigsaw.pieceHeight * row;
        const dx = Math.random() * (this.canvas.width - this.jigsaw.pieceWidth);
        const dy = Math.random() * (this.canvas.height - this.jigsaw.pieceHeight);

        const piece: Piece = new Piece(row, col, sx, sy, dx, dy);
        this.jigsaw.addPiece(piece);

        this.context.drawImage(this.imageElement.nativeElement, 
          sx, sy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight,
          dx, dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
      }
    }
  }

  pickUpPiece(event: MouseEvent) {
    for (let i = this.jigsaw.pieces.length - 1; i >= 0 && !this.activePiece; i--) {
      const piece = this.jigsaw.pieces[i];

      if (this.isMouseOverPiece(piece, event.pageX, event.pageY)) {
        this.activePiece = piece;
      }
    }
  }

  isMouseOverPiece(piece: Piece, x: number, y: number) {
    if (x >= piece.dx && x <= piece.dx + this.jigsaw.pieceWidth 
      && y >= piece.dy && y <= piece.dy + this.jigsaw.pieceHeight) {
      return true;
    } else {
      return false;
    }
  }

  dragPiece(event: MouseEvent) {
    if (this.activePiece) {
      this.resetCanvas();

      this.jigsaw.pieces.forEach(piece => {
        if (piece != this.activePiece) {
          this.context.drawImage(this.imageElement.nativeElement, 
            piece.sx, piece.sy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight,
            piece.dx, piece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
        }
      }); 

      this.activePiece.dx = event.pageX - this.jigsaw.pieceWidth / 2;
      this.activePiece.dy = event.pageY - this.jigsaw.pieceHeight / 2;

      this.jigsaw.putPieceOnTop(this.activePiece);

      this.context.drawImage(this.imageElement.nativeElement, 
        this.activePiece.sx, this.activePiece.sy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight,
        this.activePiece.dx, this.activePiece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
    }
  }

  dropPiece(event: MouseEvent) {
    this.activePiece = null;
  }
}
