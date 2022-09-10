import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Piece } from 'src/app/models/piece';

@Component({
  selector: 'app-jigsaw-canvas',
  templateUrl: './jigsaw-canvas.component.html',
  styleUrls: ['./jigsaw-canvas.component.scss']
})
export class JigsawCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('image') image!: ElementRef<HTMLImageElement>;
  context!: CanvasRenderingContext2D;

  canvasSize!: { width: number, height: number };
  jigsawSize!: { rows: number, cols: number, width: number, height: number };
  pieceSize!: { width: number, height: number };

  pieces: Piece[] = [];
  activePiece: Piece | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.getContext();
      this.setJigsawSize();
      this.setCanvasSize();
      this.setPieceSize();
      this.displayBackground();
      this.displayBoundaries();
      this.cutImage();
    }, 1000);
  }

  getContext() {
    this.context = this.canvas.nativeElement.getContext('2d')!;
  }

  setCanvasSize() {
    this.canvasSize = {
      width: 1.5 * this.image.nativeElement.width,
      height: 1.5 * this.image.nativeElement.height
    };

    this.canvas.nativeElement.width = 1.5 * this.jigsawSize.width;
    this.canvas.nativeElement.height = 1.5 * this.jigsawSize.height;
  }

  setJigsawSize() {
    this.jigsawSize = {
      rows: 10,
      cols: 10,
      width: this.image.nativeElement.width,
      height: this.image.nativeElement.height
    };
  }

  setPieceSize() {
    this.pieceSize = { 
      width: this.jigsawSize.width / this.jigsawSize.cols,
      height: this.jigsawSize.height / this.jigsawSize.rows
    };
  }

  clearCanvas() {
    this.context.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
  }

  displayBackground() {
    this.context.save();
    this.context.globalAlpha = 0.4;
    this.context.drawImage(this.image.nativeElement, this.canvasSize.width / 6, 10);
    this.context.restore();
  }

  displayBoundaries() {
    this.context.beginPath();
    this.context.rect(this.canvasSize.width / 6, 10, this.jigsawSize.width, this.jigsawSize.height);
    this.context.stroke();
    this.context.save();
  }

  cutImage() {
    for (let row = 0; row < this.jigsawSize.rows; row++) {
      for (let col = 0; col < this.jigsawSize.cols; col++) {
        const sx = Math.floor(this.jigsawSize.width / this.jigsawSize.cols) * col;
        const sy = Math.floor(this.jigsawSize.height / this.jigsawSize.rows) * row;
        const dx = Math.random() * (this.canvasSize.width - this.pieceSize.width);
        const dy = Math.random() * (this.canvasSize.height - this.pieceSize.height);

        const piece: Piece = { row, col, sx, sy, dx, dy };
        this.pieces.push(piece);

        this.context.drawImage(this.image.nativeElement, sx, sy, this.pieceSize.width, this.pieceSize.height,
          dx, dy, this.pieceSize.width, this.pieceSize.height);
      }
    }
  }

  resetJigsawCanvas() {
    this.clearCanvas();
    this.displayBackground();
    this.displayBoundaries();
  }

  pickUpPiece(event: MouseEvent) {
    const x = event.pageX;
    const y = event.pageY;

    for (let i = this.pieces.length - 1; i >= 0 && !this.activePiece; i--) {
      const piece = this.pieces[i];

      if (this.isMouseOverPiece(piece, x, y)) {
        this.activePiece = piece;
      }
    }
  }

  isMouseOverPiece(piece: Piece, x: number, y: number) {
    if (x >= piece.dx && x <= piece.dx + this.pieceSize.width 
      && y >= piece.dy && y <= piece.dy + this.pieceSize.height) {
      return true;
    } else {
      return false;
    }
  }

  dragPiece(event: MouseEvent) {
    if (this.activePiece) {
      this.resetJigsawCanvas();

      this.pieces.forEach(piece => {
        if (piece != this.activePiece) {
          this.context.drawImage(this.image.nativeElement, piece.sx, piece.sy, this.pieceSize.width, this.pieceSize.height,
            piece.dx, piece.dy, this.pieceSize.width, this.pieceSize.height);
        }
      }); 

      this.activePiece.dx = event.pageX - this.pieceSize.width / 2;
      this.activePiece.dy = event.pageY - this.pieceSize.height / 2;

      this.pieces.push(this.pieces.splice(this.pieces.indexOf(this.activePiece), 1)[0]);

      this.context.drawImage(this.image.nativeElement, this.activePiece.sx, this.activePiece.sy, this.pieceSize.width, this.pieceSize.height,
        this.activePiece.dx, this.activePiece.dy, this.pieceSize.width, this.pieceSize.height);
    }
  }

  dropPiece($event: MouseEvent) {
    this.activePiece = null;
  }
}
