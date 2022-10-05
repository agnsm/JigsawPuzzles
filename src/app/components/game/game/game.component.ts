import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FireworksOptions } from '@fireworks-js/angular';
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
  fireworksOptions = { };
  fireworksStyle = { 
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    position: 'fixed',
    zIndex: -1
   };

  constructor(public gameService: GameService, private router: Router) { }

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
