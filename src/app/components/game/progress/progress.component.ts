import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeEnterAnimation, fadeLeaveAnimation } from 'src/app/helpers/animation';
import { ProgressBar } from 'src/app/models/interfaces/progress-bar';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-progress',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit, OnDestroy {
  progressBar!: ProgressBar;
  progressBarSubscription!: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.progressBarSubscription = this.gameService.progressBar$.subscribe(progressBar => {
      if (progressBar) {
        this.progressBar = progressBar;
      }
    });
  }

  ngOnDestroy(): void {
    this.progressBarSubscription.unsubscribe();
  }
}
