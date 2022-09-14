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

  scale = {
    canvas: 1.5
  };

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initializeContext();

      this.adjustCanvas();
      this.resetCanvasState();

      this.prepareJigsaw();
    }, 1000);
  }

  initializeContext() {
    this.context = this.canvasElement.nativeElement.getContext('2d')!;
  }

  adjustCanvas() {
    this.initializeCanvas();
    this.setCanvasElementSize();
    this.initializeJigsaw();
  }

  resetCanvasState() {
    this.clearCanvas();
    this.displayBoundaries();
    this.displayBackground();
  }

  initializeCanvas() {
    this.canvas = new Canvas(
      innerWidth, innerHeight, 
      0, 0, 
      this.scale.canvas
    );
  }

  setCanvasElementSize() {
    this.canvasElement.nativeElement.width = this.canvas.size.width;
    this.canvasElement.nativeElement.height = this.canvas.size.height;
  }

  initializeJigsaw() {
    this.jigsaw = new Jigsaw(
      4, 4, 
      this.imageElement.nativeElement.width, 
      this.imageElement.nativeElement.height, 
      innerWidth, innerHeight, 0.75
      );
  }

  clearCanvas() {
    this.context.clearRect(
      this.canvas.position.x, this.canvas.position.y, 
      this.canvas.size.width, this.canvas.size.height
    );
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
    this.context.drawImage(this.imageElement.nativeElement, 
      this.jigsaw.x, this.jigsaw.y, this.jigsaw.width, this.jigsaw.height);
    this.context.restore();
  }

  prepareJigsaw() {
    for (let row = 0; row < this.jigsaw.rows; row++) {
      for (let col = 0; col < this.jigsaw.cols; col++) {
        const id = row * this.jigsaw.cols + col + 1;
        const sx = this.jigsaw.imagePieceWidth * col;
        const sy = this.jigsaw.imagePieceHeight * row;
        const dx = Math.random() * (innerWidth - this.jigsaw.pieceWidth);
        const dy = Math.random() * (innerHeight - this.jigsaw.pieceHeight);

        const piece: Piece = new Piece(id, row, col, sx, sy, dx, dy);
        this.jigsaw.addPiece(piece);

        this.context.drawImage(this.imageElement.nativeElement, 
          sx, sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
          dx, dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
      }
    }
  }

  pickUpPiece(event: MouseEvent) {
    for (let i = this.jigsaw.pieces.length - 1; i >= 0 && !this.activePiece; i--) {
      const piece = this.jigsaw.pieces[i];

      if (!piece.locked && this.isMouseOverPiece(piece, event.pageX, event.pageY)) {
        this.activePiece = piece;
      }
    }
  }

  dragPiece(event: MouseEvent) {
    if (this.activePiece) {
      this.resetCanvasState();

      const adjacentPieces = this.getAllAdjacentPieces(this.activePiece);

      this.jigsaw.pieces.forEach(piece => {
        if (!adjacentPieces.includes(piece)) {
          this.context.drawImage(this.imageElement.nativeElement, 
            piece.sx, piece.sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
            piece.dx, piece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
        }
      }); 

      const newPosition = {
        x: event.pageX - this.jigsaw.pieceWidth / 2,
        y: event.pageY - this.jigsaw.pieceHeight / 2,
      }

      const change = {
        x: newPosition.x - this.activePiece.dx,
        y: newPosition.y - this.activePiece.dy
      }

      this.activePiece.setPosition(newPosition.x, newPosition.y);
      this.jigsaw.movePieceToTop(this.activePiece);

      this.context.drawImage(this.imageElement.nativeElement, 
        this.activePiece.sx, this.activePiece.sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
        this.activePiece.dx, this.activePiece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);

      adjacentPieces.forEach(piece => {
        if (piece != this.activePiece) {
          piece.setPosition(piece.dx + change.x, piece.dy + change.y);
          this.jigsaw.movePieceToTop(piece);
  
          this.context.drawImage(this.imageElement.nativeElement, 
            piece.sx, piece.sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
            piece.dx, piece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
        }
      });
    }
  }

 getAllAdjacentPieces(activePiece: Piece, allAdjacentPieces: Piece[] = []) {
    const adjacentPieces = activePiece.connections
      .filter(connection => connection.connected)
      .map(connection => this.jigsaw.getPiece(connection.row, connection.col));

    allAdjacentPieces.push(activePiece);

    adjacentPieces.forEach(piece => {
      if (!allAdjacentPieces.includes(piece)) {
        this.getAllAdjacentPieces(piece, allAdjacentPieces);
      }
    });

    return allAdjacentPieces;
  }

  dropPiece(event: MouseEvent) {
    if (this.activePiece) {
      if (this.isPieceInDefaultPosition(this.activePiece, event.pageX, event.pageY)) {
        this.resetCanvasState();

        let defaultPosition = this.jigsaw.getDefaultPositionOfPiece(this.activePiece);
        this.activePiece.setPosition(defaultPosition.x, defaultPosition.y);
        this.activePiece.locked = true;

        this.jigsaw.movePieceToBottom(this.activePiece);

        this.context.drawImage(this.imageElement.nativeElement, 
          this.activePiece.sx, this.activePiece.sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
          defaultPosition.x, defaultPosition.y, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);

        const adjacentPieces = this.getAllAdjacentPieces(this.activePiece);

        adjacentPieces.forEach(piece => {
          defaultPosition = this.jigsaw.getDefaultPositionOfPiece(piece);
          piece.setPosition(defaultPosition.x, defaultPosition.y);
          piece.locked = true;

          this.jigsaw.movePieceToBottom(piece);
  
          this.context.drawImage(this.imageElement.nativeElement, 
            piece.sx, piece.sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
            piece.dx, piece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
        });

        this.jigsaw.pieces.forEach(piece => {
          if (piece != this.activePiece) {
            this.context.drawImage(this.imageElement.nativeElement, 
              piece.sx, piece.sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
              piece.dx, piece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
          }
        }); 
      } else {
        const adjacentPieces = this.getAllAdjacentPieces(this.activePiece);
        let connector: Piece | null = null;

        adjacentPieces.forEach(piece => {
          let res = this.connectPiece(piece);
          if (res) {
            connector = res;
          }
        });

        if (connector) {
          this.resetCanvasState();

          adjacentPieces.forEach(piece => {
            let relativePosition = this.jigsaw.getRelativePositionOfPiece(piece, connector!);
            piece.setPosition(relativePosition.x, relativePosition.y);

            this.jigsaw.movePieceToTop(piece);
          });

        this.jigsaw.pieces.forEach(piece => {
          this.context.drawImage(this.imageElement.nativeElement, 
            piece.sx, piece.sy, this.jigsaw.imagePieceWidth, this.jigsaw.imagePieceHeight,
            piece.dx, piece.dy, this.jigsaw.pieceWidth, this.jigsaw.pieceHeight);
        });
      }
    }

      this.activePiece = null;
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

  isPieceInDefaultPosition(piece: Piece, x: number, y: number) {
    const defaultPosition = this.jigsaw.getDefaultPositionOfPiece(piece);
    const offset = { x: this.jigsaw.pieceWidth / 4, y: this.jigsaw.pieceHeight / 4 };

    if (x >= defaultPosition.x + offset.x && x <= defaultPosition.x + this.jigsaw.pieceWidth - offset.x
      && y >= defaultPosition.y + offset.x && y <= defaultPosition.y + this.jigsaw.pieceHeight - offset.y) {
      return true;
    } else {
      return false;
    }
  }

  connectPiece(piece: Piece) {
    const offset = { x: this.jigsaw.pieceWidth / 4, y: this.jigsaw.pieceHeight / 4 };

    let connector: Piece | null = null;

    for (let i = 0; i < piece.connections.length && !connector; i++) {
      const connection = piece.connections[i];
      const adjacentPiece = this.jigsaw.getPiece(connection.row, connection.col);

      if (adjacentPiece && !connection.connected) {
        switch (connection.direction) {
          case 'left':
            if (Math.abs(adjacentPiece.dx + this.jigsaw.pieceWidth - piece.dx) <= offset.x
              && Math.abs(adjacentPiece.dy - piece.dy) <= offset.y) {
              //piece.setPosition(adjacentPiece.dx + this.jigsaw.pieceWidth, adjacentPiece.dy);
              piece.setConnection('left');
              adjacentPiece.setConnection('right');
              connector = adjacentPiece;
            }
            break;

          case 'right':
            if (Math.abs(piece.dx + this.jigsaw.pieceWidth - adjacentPiece.dx) <= offset.x
              && Math.abs(adjacentPiece.dy - piece.dy) <= offset.y) {
              //piece.setPosition(adjacentPiece.dx - this.jigsaw.pieceWidth, adjacentPiece.dy);
              piece.setConnection('right');
              adjacentPiece.setConnection('left');
              connector = adjacentPiece;
            }
            break;

          case 'top':
            if (Math.abs(adjacentPiece.dy + this.jigsaw.pieceHeight - piece.dy) <= offset.y
              && Math.abs(adjacentPiece.dx - piece.dx) <= offset.y) {
              //piece.setPosition(adjacentPiece.dx, adjacentPiece.dy + this.jigsaw.pieceHeight);
              piece.setConnection('top');
              adjacentPiece.setConnection('bottom');
              connector = adjacentPiece;
            }
            break;

          case 'bottom':
            if (Math.abs(piece.dy + this.jigsaw.pieceHeight - adjacentPiece.dy) <= offset.y
              && Math.abs(adjacentPiece.dx - piece.dx) <= offset.y) {
              //piece.setPosition(adjacentPiece.dx, adjacentPiece.dy - this.jigsaw.pieceHeight);
              piece.setConnection('bottom');
              adjacentPiece.setConnection('top');
              connector = adjacentPiece;
            }
            break;
        
          default:
            break;
        }
      }
    };

    return connector;
  }
}
