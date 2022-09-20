import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { GameSettings } from '../models/gameSettings';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private gameSettings = new BehaviorSubject<GameSettings | null>(null);
  public gameSettings$ = this.gameSettings.asObservable();

  constructor() { }

  setGameSettings(gameSettingsForm: GameSettings) {
    this.gameSettings.next(gameSettingsForm);
  }
}
