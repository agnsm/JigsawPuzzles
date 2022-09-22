import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoardSettings } from 'src/app/models/boardSettings';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-board-management',
  templateUrl: './board-management.component.html',
  styleUrls: ['./board-management.component.scss']
})
export class BoardManagementComponent implements OnInit, OnDestroy {
  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;
      }
    });
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
  }

  togglePreview() {
    this.gameService.togglePreview();
  }

  toggleFullscreen() {
    this.gameService.toggleFullscreen();
  }
}
