import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { GameSettings } from 'src/app/models/interfaces/game-settings';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  gameSettings!: GameSettings;

  constructor(private gameService: GameService, private router: Router) { }

  ngOnInit(): void {
    this.gameService.gameSettings$.pipe(take(1)).subscribe(gameSettings => {
      if (gameSettings) {
        this.gameSettings = gameSettings;
      } else {
        this.router.navigateByUrl('new-game');
      }
    });
  }

}
