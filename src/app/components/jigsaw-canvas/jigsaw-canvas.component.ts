import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Piece } from 'src/app/models/piece';

@Component({
  selector: 'app-jigsaw-canvas',
  templateUrl: './jigsaw-canvas.component.html',
  styleUrls: ['./jigsaw-canvas.component.scss']
})
export class JigsawCanvasComponent implements OnInit, AfterViewInit {
  @ViewChild('jigsawCanvas') jigsawCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('image') image!: ElementRef<HTMLImageElement>;
  context!: CanvasRenderingContext2D;

  jigsawSize = { rows: 2, cols: 2 };
  pieceSize!: { width: number, height: number };

  pieces: Piece[] = [];

  draggingPiece: Piece | null = null;

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.context = this.jigsawCanvas.nativeElement.getContext('2d')!;

    setTimeout(() => {
      this.setJigsawCanvasSize();
      this.setPieceSize();
      this.displayBackground();
      this.displayBoundaries();
      this.cutImage();
    }, 1000);

  }

  setJigsawCanvasSize() {
    this.jigsawCanvas.nativeElement.width = 1.5 * this.image.nativeElement.width;
    this.jigsawCanvas.nativeElement.height = 1.5 * this.image.nativeElement.height;
  }

  setPieceSize() {
    this.pieceSize = { 
      width: Math.floor(this.image.nativeElement.width / this.jigsawSize.cols),
      height: Math.floor(this.image.nativeElement.height / this.jigsawSize.rows)
    };
  }

  displayBackground() {
    this.context.save();
    this.context.globalAlpha = 0.4;
    this.context.drawImage(this.image.nativeElement, this.jigsawCanvas.nativeElement.width / 6, 0);
    this.context.restore();
  }

  displayBoundaries() {
    this.context.beginPath();
    this.context.rect(this.jigsawCanvas.nativeElement.width / 6, 0, 
      this.jigsawCanvas.nativeElement.width / 1.5, this.jigsawCanvas.nativeElement.height / 1.5);
    this.context.stroke();
    this.context.save();
  }

  cutImage() {
    for (let row = 0; row < this.jigsawSize.rows; row++) {
      for (let col = 0; col < this.jigsawSize.cols; col++) {
        const sx = Math.floor(this.image.nativeElement.width / this.jigsawSize.cols) * col;
        const sy = Math.floor(this.image.nativeElement.height / this.jigsawSize.rows) * row;
        const dx = Math.random() * (this.jigsawCanvas.nativeElement.width - this.pieceSize.width);
        const dy = Math.random() * (this.jigsawCanvas.nativeElement.height - this.pieceSize.height);

        const piece: Piece = { row, col, sx, sy, dx, dy };
        this.pieces.push(piece);

        this.context.drawImage(this.image.nativeElement, sx, sy, this.pieceSize.width, this.pieceSize.height,
          dx, dy, this.pieceSize.width, this.pieceSize.height);
      }
    }
  }

  dragPiece(event: MouseEvent) {
    const x = event.pageX;
    const y = event.pageY;

    let pieceToMove: Piece | null = null;

    for (let i = this.pieces.length - 1; i >= 0 && !this.draggingPiece; i--) {
      const piece = this.pieces[i];

      if (this.isMouseOverPiece(piece, x, y)) {
        if (!pieceToMove) {
          this.draggingPiece = piece;
        }
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

  movePiece(event: MouseEvent) {
    if (this.draggingPiece) {
      this.resetJigsawCanvas();

      this.pieces.forEach(piece => {
        if (piece != this.draggingPiece)
        this.context.drawImage(this.image.nativeElement, piece.sx, piece.sy, this.pieceSize.width, this.pieceSize.height,
          piece.dx, piece.dy, this.pieceSize.width, this.pieceSize.height);
      }); 

      this.draggingPiece.dx = event.pageX - this.pieceSize.width / 2;
      this.draggingPiece.dy = event.pageY - this.pieceSize.height / 2;
      this.pieces.push(this.pieces.splice(this.pieces.indexOf(this.draggingPiece), 1)[0]);

      this.context.drawImage(this.image.nativeElement, this.draggingPiece.sx, this.draggingPiece.sy, this.pieceSize.width, this.pieceSize.height,
        this.draggingPiece.dx, this.draggingPiece.dy, this.pieceSize.width, this.pieceSize.height);
    }
  }

  dropPiece($event: MouseEvent) {
    this.draggingPiece = null;
  }

  resetJigsawCanvas() {
    this.context.clearRect(0, 0, this.jigsawCanvas.nativeElement.width, this.jigsawCanvas.nativeElement.height);

    this.displayBackground();
    this.displayBoundaries();
  }
}
