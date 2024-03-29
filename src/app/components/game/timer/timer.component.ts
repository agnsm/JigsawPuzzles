import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { fadeEnterAnimation, fadeLeaveAnimation } from 'src/app/helpers/animation';
import { BoardSettings } from 'src/app/models/interfaces/board-settings';
import { Stopwatch } from 'src/app/models/interfaces/stopwatch';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-timer',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.scss']
})
export class TimerComponent implements OnInit, OnDestroy {
  boardSettings!: BoardSettings;
  boardSettingsSubscription!: Subscription;
  gameProgressSubscription!: Subscription;

  stopwatch: Stopwatch = { seconds: 0, minutes: 0,  hours: 0 };
  stopwatchInterval: any;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.boardSettingsSubscription = this.gameService.boardSettings$.subscribe(boardSettings => {
      if (boardSettings) {
        this.boardSettings = boardSettings;
      }
    });

    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(progress => {
      if (progress && progress.progressBar.value == 100) {
        this.stopStopwatch();
      }
    });

    this.startStopwatch();
  }

  ngOnDestroy(): void {
    this.boardSettingsSubscription.unsubscribe();
    if (!this.gameProgressSubscription.closed) {
      this.gameProgressSubscription.unsubscribe();
    }
  }

  startStopwatch() {
    this.stopwatchInterval = setInterval(() => {
      this.stopwatch.seconds++;

      if (this.stopwatch.seconds == 60) {
        this.stopwatch.seconds = 0;
        this.stopwatch.minutes++;
      }

      if (this.stopwatch.minutes == 60) {
        this.stopwatch.minutes = 0;
        this.stopwatch.hours++;
      }
    }, 1000);
  }

  stopStopwatch() {
    clearInterval(this.stopwatchInterval);
    
    this.gameProgressSubscription.unsubscribe();
    this.gameService.recordTime(this.stopwatch);
  }

  zeroPad(number: number) {
    return number.toString().padStart(2, '0');
  }
}
