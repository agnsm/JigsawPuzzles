import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameProgress } from 'src/app/models/interfaces/game-progress';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {
  gameProgress!: GameProgress;
  gameProgressSubscription!: Subscription;

  constructor(private gameService: GameService) { }

  ngOnInit(): void {
    this.gameProgressSubscription = this.gameService.gameProgress$.subscribe(progress => {
      if (progress) {
        this.gameProgress = progress;
      }    
    });
  }

  ngOnDestroy(): void {
    this.gameProgressSubscription.unsubscribe();
  }

  zeroPad(number: number) {
    return number.toString().padStart(2, '0');
  }
}
