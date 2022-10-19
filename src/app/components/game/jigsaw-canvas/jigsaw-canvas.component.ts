import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { Canvas } from 'src/app/models/classes/canvas';
import { Coordinates } from 'src/app/models/classes/coordinates';
import { Game } from 'src/app/models/classes/game';
import { Jigsaw } from 'src/app/models/classes/jigsaw';
import { Piece } from 'src/app/models/classes/piece';
import { BoardSettings } from 'src/app/models/interfaces/board-settings';
import { GameProgress } from 'src/app/models/interfaces/game-progress';
import { GameSettings } from 'src/app/models/interfaces/game-settings';
import { ProgressBar } from 'src/app/models/interfaces/progress-bar';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-jigsaw-canvas',
  templateUrl: './jigsaw-canvas.component.html',
  styleUrls: ['./jigsaw-canvas.component.scss']
})
export class JigsawCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasElement!: ElementRef<HTMLCanvasElement>;
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;
  @Input() gameSettings!: GameSettings;
  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;
  gameProgress!: GameProgress;
  gameProgressSubscription!: Subscription;

  game!: Game;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;

        if (this.game && this.game.started) {
          if (boardSettings.zoomChange != 0) {
            this.game.jigsaw.zoom(this.boardSettings.zoomChange);
          }

          this.drawJigsaw();

          this.manageFullImage();
        }
      }
    });

    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(gameProgress => {
      if (gameProgress) {
        this.gameProgress = gameProgress;
      }
    });
  }

  ngAfterViewInit(): void {
    this.setImageElementSrc();

    setTimeout(() => {
      this.initializeGame();
      this.setCanvasElementSize();
      this.resetCanvasState();

      this.prepareJigsaw();
      this.setGameProgress();
    }, 1000);
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
    this.gameProgressSubscription.unsubscribe();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.game.canvas.resetSize();
    this.setCanvasElementSize();
    
    if (this.gameProgress.progressBar.value == 100) {
      this.game.jigsaw.defaultSizeAndPosition();
      this.summaryCanvasState();
    } else {
      this.drawJigsaw(); 
    }
  }

  setImageElementSrc() {
    this.imageElement.nativeElement.src = URL.createObjectURL(this.gameSettings.image);
  }

  initializeGame() {
    const canvas = new Canvas(
      this.canvasElement.nativeElement.getContext('2d')!
    );

    const jigsaw = new Jigsaw(
      canvas,
      this.gameSettings.rows, this.gameSettings.cols, 
      this.imageElement.nativeElement.width, 
      this.imageElement.nativeElement.height
    );

    this.game = new Game(canvas, jigsaw);
  }

  setCanvasElementSize() {
    this.canvasElement.nativeElement.width = this.game.canvas.size.width;
    this.canvasElement.nativeElement.height = this.game.canvas.size.height;
  }

  resetCanvasState() {
    this.clearCanvas();
    this.displayBoundaries();
    if (this.boardSettings.preview) {
      this.displayBackground();
    }
  }

  summaryCanvasState() {
    this.clearCanvas();
    this.displayBoundaries();
    this.displayBackground(1);
  }

  manageFullImage() {
    if (this.boardSettings.fullImage) {
      this.imageElement.nativeElement.style.display = 'initial';
    } else {
      this.imageElement.nativeElement.style.display = 'none';
    }
  }

  clearCanvas() {
    this.game.canvas.context.clearRect(
      this.game.canvas.position.x, this.game.canvas.position.y, 
      this.game.canvas.size.width, this.game.canvas.size.height
    );

    this.game.canvas.context.fillStyle = 'rgba(26, 28, 39, 0.9)';
    this.game.canvas.context.fillRect(
      this.game.canvas.position.x, this.game.canvas.position.y, 
      this.game.canvas.size.width, this.game.canvas.size.height
    );
  }

  displayBoundaries() {
    this.game.canvas.context.beginPath();
    this.game.canvas.context.rect(
      this.game.jigsaw.position.x, this.game.jigsaw.position.y, 
      this.game.jigsaw.size.width, this.game.jigsaw.size.height
    );
    this.game.canvas.context.stroke();
    this.game.canvas.context.save();
  }

  displayBackground(alpha = 0.4) {
    this.game.canvas.context.save();
    this.game.canvas.context.globalAlpha = alpha;
    this.game.canvas.context.drawImage(
      this.imageElement.nativeElement, 
      this.game.jigsaw.position.x, this.game.jigsaw.position.y, 
      this.game.jigsaw.size.width, this.game.jigsaw.size.height
    );
    this.game.canvas.context.restore();
  }

  prepareJigsaw() {
    this.game.jigsaw.createPieces();
    this.drawJigsaw();
    this.game.start();
  }

  setGameProgress() {
    const progressBar: ProgressBar = { 
      currentPieces: 0, 
      allPieces: this.game.jigsaw.pieces.length, 
      value: 0
    };
    const gameProgress: GameProgress = { progressBar, time: null };

    this.gameService.setGameProgress(gameProgress);
  }

  drawPiece(piece: Piece) {
    this.game.canvas.context.drawImage(
      this.imageElement.nativeElement, 
      piece.sourcePosition.x, piece.sourcePosition.y, 
      this.game.jigsaw.sourcePieceSize.width, this.game.jigsaw.sourcePieceSize.height,
      piece.destPosition.x, piece.destPosition.y, 
      this.game.jigsaw.destPieceSize.width, this.game.jigsaw.destPieceSize.height
    );

    this.game.canvas.context.strokeRect(
      piece.destPosition.x, piece.destPosition.y, 
      this.game.jigsaw.destPieceSize.width, this.game.jigsaw.destPieceSize.height
    );
  }

  drawJigsaw() {
    this.resetCanvasState();

    this.game.jigsaw.pieces.forEach(piece => {
      this.drawPiece(piece);
    });
  }

  pickUpPiece(event: MouseEvent) {
    for (let i = this.game.jigsaw.pieces.length - 1; i >= 0 && !this.game.activePiece; i--) {
      const piece = this.game.jigsaw.pieces[i];

      if (!piece.locked && this.isMouseOverPiece(piece, event)) {
        this.game.activePiece = piece;
      }
    }

    if (!this.game.activePiece) {
      this.game.canvasDragging = new Coordinates(event.clientX, event.clientY);
    }
  }

  dragPiece(event: MouseEvent) {
    if (this.game.activePiece) {
      const adjacentPieces = this.game.jigsaw.getGroupOfAdjacentPieces(this.game.activePiece)
      const vector = this.calculateActivePieceVector(event);
  
      this.game.activePiece.destPosition = this.calculateActivePiecePosition(event);
  
      adjacentPieces.forEach(piece => {
        this.game.jigsaw.movePieceToTop(piece);
  
        if (piece != this.game.activePiece) {
          piece.moveByVector(vector);
        }
      });
  
    } else if (this.game.canvasDragging) {
      const vector = new Coordinates(
        event.clientX - this.game.canvasDragging.x, 
        event.clientY - this.game.canvasDragging.y
      );
  
      this.game.jigsaw.move(vector);
  
      this.game.canvasDragging = new Coordinates(event.clientX, event.clientY);
    }

    this.drawJigsaw();
  }

  dropPiece(event: MouseEvent) {
    if (this.game.activePiece) {
      const adjacentPieces = this.game.jigsaw.getGroupOfAdjacentPieces(this.game.activePiece);

      if (this.isMouseOverTargetPosition(this.game.activePiece, event)) {
        adjacentPieces.forEach(piece => {
          this.game.jigsaw.movePieceToBottom(piece);
          piece.setPositionToTarget();
          piece.lock();
          this.gameService.updateProgressBar();
        });
      } else {
        const connector = this.game.jigsaw.findConnectionsBetweenPieces(adjacentPieces);

        if (connector) {
          this.game.jigsaw.movePieceToTop(connector);

          adjacentPieces.forEach(piece => {
            this.game.jigsaw.movePieceToTop(piece);
            piece.setPositionBasedOnReferencePiece(connector);
          });
        }
      }

      this.game.activePiece = null;

      if (this.gameProgress.progressBar.value == 100) {
        this.game.jigsaw.defaultSizeAndPosition();
        this.summaryCanvasState();
      } else {
        this.drawJigsaw(); 
      }
    } else if (this.game.canvasDragging) {
      this.game.canvasDragging = null;
    }
  }

  getMousePosition(event: MouseEvent) {
    const rect = this.canvasElement.nativeElement.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }

  isMouseOverPiece(piece: Piece, event: MouseEvent) {
    const position = this.getMousePosition(event);

    if (position.x >= piece.destPosition.x && position.x <= piece.destPosition.x + this.game.jigsaw.destPieceSize.width 
      && position.y >= piece.destPosition.y && position.y <= piece.destPosition.y + this.game.jigsaw.destPieceSize.height) {
      return true;
    } else {
      return false;
    }
  }

  isMouseOverTargetPosition(piece: Piece, event: MouseEvent) {
    const position = this.getMousePosition(event);

    if (position.x >= piece.targetPosition.x + this.game.jigsaw.offset.x 
      && position.x <= piece.targetPosition.x + this.game.jigsaw.destPieceSize.width - this.game.jigsaw.offset.x
      && position.y >= piece.targetPosition.y + this.game.jigsaw.offset.x 
      && position.y <= piece.targetPosition.y + this.game.jigsaw.destPieceSize.height - this.game.jigsaw.offset.y) {
      return true;
    } else {
      return false;
    }
  }

  calculateActivePiecePosition(event: MouseEvent) {
    const position = this.getMousePosition(event);

    return new Coordinates(
      position.x - this.game.jigsaw.destPieceSize.width / 2, 
      position.y- this.game.jigsaw.destPieceSize.height / 2
    );
  }

  calculateActivePieceVector(event: MouseEvent) {
    const position = this.getMousePosition(event);

    return new Coordinates(
      position.x - this.game.jigsaw.destPieceSize.width / 2 - this.game.activePiece!.destPosition.x,
      position.y - this.game.jigsaw.destPieceSize.height / 2 - this.game.activePiece!.destPosition.y
    );
  }
}
