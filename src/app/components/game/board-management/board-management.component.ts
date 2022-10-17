import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription, take } from 'rxjs';
import { BoardSettings } from 'src/app/models/interfaces/board-settings';
import { GameProgress } from 'src/app/models/interfaces/game-progress';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-board-management',
  templateUrl: './board-management.component.html',
  styleUrls: ['./board-management.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BoardManagementComponent implements OnInit, OnDestroy {
  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;
  gameProgress!: GameProgress;
  gameProgressSubscription!: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;
      }
    });

    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(gameProgress => {
      if (gameProgress) {
        this.gameProgress = gameProgress;
      }
    });
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
    this.gameProgressSubscription.unsubscribe();
  }
  
  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.gameProgress.progressBar.value != 100) {
      event.deltaY < 0 ? this.gameService.zoomIn() : this.gameService.zoomOut();
    }
  }

  zoomIn() {
    this.gameService.zoomIn();
  }

  zoomOut() {
    this.gameService.zoomOut();
  }

  toggleFullImage() {
    this.gameService.toggleFullImage();
  }

  togglePreview() {
    this.gameService.togglePreview();
  }

  toggleTimer() {
    this.gameService.toggleTimer();
  }

  toggleFullscreen() {
    this.gameService.toggleFullscreen();
    this.manageFullscreen();
  }

  manageFullscreen() {
    if (this.boardSettings.fullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }
}
