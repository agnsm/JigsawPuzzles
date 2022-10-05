import { Component, OnDestroy, OnInit } from '@angular/core';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { fadeEnterAnimation } from 'src/app/helpers/animation';
import { GameProgress } from 'src/app/models/interfaces/game-progress';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-summary',
  animations: [fadeEnterAnimation],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit, OnDestroy {
  gameProgress!: GameProgress;
  gameProgressSubscription!: Subscription;

  faPuzzlePiece = faPuzzlePiece;

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
