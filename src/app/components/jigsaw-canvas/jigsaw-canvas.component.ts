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

  scale = { canvas: 1.5, jigsaw: 0.75 };
  alpha = 0.4;

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
      innerWidth, innerHeight, this.scale.jigsaw
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
    this.context.rect(
      this.jigsaw.position.x, this.jigsaw.position.y, 
      this.jigsaw.size.width, this.jigsaw.size.height
    );
    this.context.stroke();
    this.context.save();
  }

  displayBackground() {
    this.context.save();
    this.context.globalAlpha = this.alpha;
    this.context.drawImage(
      this.imageElement.nativeElement, 
      this.jigsaw.position.x, this.jigsaw.position.y, 
      this.jigsaw.size.width, this.jigsaw.size.height
    );
    this.context.restore();
  }

  prepareJigsaw() {
    for (let row = 0; row < this.jigsaw.size.rows; row++) {
      for (let col = 0; col < this.jigsaw.size.cols; col++) {
        const id = row * this.jigsaw.size.cols + col + 1;
        const sx = this.jigsaw.sourcePieceSize.width * col;
        const sy = this.jigsaw.sourcePieceSize.height * row;
        const dx = Math.random() * (innerWidth - this.jigsaw.destPieceSize.width);
        const dy = Math.random() * (innerHeight - this.jigsaw.destPieceSize.height);

        const piece: Piece = new Piece(id, row, col, sx, sy, dx, dy);
        this.jigsaw.addPiece(piece);
        this.drawPiece(piece);
      }
    }
  }

  drawPiece(piece: Piece) {
    this.context.drawImage(
      this.imageElement.nativeElement, 
      piece.sx, piece.sy, this.jigsaw.sourcePieceSize.width, this.jigsaw.sourcePieceSize.height,
      piece.dx, piece.dy, this.jigsaw.destPieceSize.width, this.jigsaw.destPieceSize.height
    );
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

      const adjacentPieces = this.getGroupOfAdjacentPieces(this.activePiece);

      this.jigsaw.pieces.forEach(piece => {
        if (!adjacentPieces.includes(piece)) {
          this.drawPiece(piece);
        }
      }); 

      const newPosition = {
        x: event.pageX - this.jigsaw.destPieceSize.width / 2,
        y: event.pageY - this.jigsaw.destPieceSize.height / 2,
      }

      const vector = {
        x: newPosition.x - this.activePiece.dx,
        y: newPosition.y - this.activePiece.dy
      }

      this.activePiece.setPosition(newPosition.x, newPosition.y);
      this.jigsaw.movePieceToTop(this.activePiece);
      this.drawPiece(this.activePiece);

      adjacentPieces.forEach(piece => {
        if (piece != this.activePiece) {
          piece.setPosition(piece.dx + vector.x, piece.dy + vector.y);
          this.jigsaw.movePieceToTop(piece);
          this.drawPiece(piece);
        }
      });
    }
  }

  dropPiece(event: MouseEvent) {
    if (this.activePiece) {
      const adjacentPieces = this.getGroupOfAdjacentPieces(this.activePiece);

      if (this.isPieceInDefaultPosition(this.activePiece, event.pageX, event.pageY)) {
        this.resetCanvasState();

        adjacentPieces.forEach(piece => {
          const defaultPosition = this.jigsaw.getDefaultPositionOfPiece(piece);
          piece.setPosition(defaultPosition.x, defaultPosition.y);
          this.jigsaw.movePieceToBottom(piece);
          piece.locked = true;
        });
  
        this.jigsaw.pieces.forEach(piece => {
          this.drawPiece(piece);
        }); 
      } else {
        let connector: Piece | null = null;

        adjacentPieces.forEach(piece => {
          let result = this.connectPiece(piece);
          if (result) {
            connector = result;
          }
        });

        if (connector) {
          this.resetCanvasState();

          adjacentPieces.forEach(piece => {
            const relativePosition = this.jigsaw.getRelativePositionOfPiece(piece, connector!);
            piece.setPosition(relativePosition.x, relativePosition.y);
            this.jigsaw.movePieceToTop(piece);
          });

          this.jigsaw.pieces.forEach(piece => {
            this.drawPiece(piece);
          });
        }
      }

      this.activePiece = null;
    }
  }

  getGroupOfAdjacentPieces(activePiece: Piece, allAdjacentPieces: Piece[] = []) {
    const adjacentPieces = activePiece.connections
      .filter(connection => connection.connected)
      .map(connection => this.jigsaw.getPiece(connection.row, connection.col));

    allAdjacentPieces.push(activePiece);

    adjacentPieces.forEach(piece => {
      if (!allAdjacentPieces.includes(piece)) {
        this.getGroupOfAdjacentPieces(piece, allAdjacentPieces);
      }
    });

    return allAdjacentPieces;
  }

  isMouseOverPiece(piece: Piece, x: number, y: number) {
    if (x >= piece.dx && x <= piece.dx + this.jigsaw.destPieceSize.width 
      && y >= piece.dy && y <= piece.dy + this.jigsaw.destPieceSize.height) {
      return true;
    } else {
      return false;
    }
  }

  isPieceInDefaultPosition(piece: Piece, x: number, y: number) {
    const defaultPosition = this.jigsaw.getDefaultPositionOfPiece(piece);

    if (x >= defaultPosition.x + this.jigsaw.offset.x 
      && x <= defaultPosition.x + this.jigsaw.destPieceSize.width - this.jigsaw.offset.x
      && y >= defaultPosition.y + this.jigsaw.offset.x 
      && y <= defaultPosition.y + this.jigsaw.destPieceSize.height - this.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  connectPiece(piece: Piece) {
    let connector: Piece | null = null;

    for (let i = 0; i < piece.connections.length && !connector; i++) {
      const connection = piece.connections[i];
      const adjacentPiece = this.jigsaw.getPiece(connection.row, connection.col);

      if (adjacentPiece && !connection.connected) {
        switch (connection.direction) {
          case 'left':
            if (this.canBeConnectedOnLeft(piece, adjacentPiece)) {
              piece.setConnection('left');
              adjacentPiece.setConnection('right');
              connector = adjacentPiece;
            }
            break;

          case 'right':
            if (this.canBeConnectedOnRight(piece, adjacentPiece)) {
              piece.setConnection('right');
              adjacentPiece.setConnection('left');
              connector = adjacentPiece;
            }
            break;

          case 'top':
            if (this.canBeConnectedOnTop(piece, adjacentPiece)) {
              piece.setConnection('top');
              adjacentPiece.setConnection('bottom');
              connector = adjacentPiece;
            }
            break;

          case 'bottom':
            if (this.canBeConnectedOnBottom(piece, adjacentPiece)) {
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

  canBeConnectedOnLeft(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(adjacentPiece.dx + this.jigsaw.destPieceSize.width - piece.dx) <= this.jigsaw.offset.x
      && Math.abs(adjacentPiece.dy - piece.dy) <= this.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  canBeConnectedOnRight(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(piece.dx + this.jigsaw.destPieceSize.width - adjacentPiece.dx) <= this.jigsaw.offset.x
      && Math.abs(adjacentPiece.dy - piece.dy) <= this.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  canBeConnectedOnTop(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(adjacentPiece.dy + this.jigsaw.destPieceSize.height - piece.dy) <= this.jigsaw.offset.y
      && Math.abs(adjacentPiece.dx - piece.dx) <= this.jigsaw.offset.x) {
      return true;
    } else {
      return false;
    }
  }

  canBeConnectedOnBottom(piece: Piece, adjacentPiece: Piece) {
    if (Math.abs(piece.dy + this.jigsaw.destPieceSize.height - adjacentPiece.dy) <= this.jigsaw.offset.y
      && Math.abs(adjacentPiece.dx - piece.dx) <= this.jigsaw.offset.x) {
      return true;
    } else {
      return false;
    }
  }
}
