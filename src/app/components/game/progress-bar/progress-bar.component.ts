import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeEnterAnimation, fadeLeaveAnimation } from 'src/app/helpers/animation';
import { ProgressBar } from 'src/app/models/interfaces/progress-bar';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-progress-bar',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit, OnDestroy {
  progressBar!: ProgressBar;
  progressBarSubscription!: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.progressBarSubscription = this.gameService.gameProgress$.subscribe(progress => {
      if (progress) {
        this.progressBar = progress.progressBar;
      }
    });
  }

  ngOnDestroy(): void {
    this.progressBarSubscription.unsubscribe();
  }
}
