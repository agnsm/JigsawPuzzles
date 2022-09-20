import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent implements OnInit {
  gameSettingsForm = this.fb.group({
    pieces: [null, Validators.required],
    rows: [null, Validators.required],
    cols: [null, Validators.required],
    image: [null, Validators.required]
  });

  sizing = [
    { pieces: 24, rows: 4, cols: 6 },
    { pieces: 35, rows: 5, cols: 7 },
    { pieces: 54, rows: 6, cols: 9 },
    { pieces: 77, rows: 7, cols: 11 },
    { pieces: 96, rows: 8, cols: 12 },
    { pieces: 150, rows: 10, cols: 15 },
    { pieces: 204, rows: 12, cols: 17 },
    { pieces: 320, rows: 16, cols: 20 }
  ];

  constructor(private gameService: GameService, private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.checkResolution(file);

      this.gameSettingsForm.patchValue({
        image: file,
        pieces: null
      });

    } else {
      this.gameSettingsForm.patchValue({
        image: null,
        pieces: null
      });
    }
  }

  checkResolution(file: File) {
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      if (image.height > image.width) {
        this.sizing.forEach(option => {
          const temp = option.rows;
          option.rows = option.cols;
          option.cols = temp;
        });
      }
    }
  }

  updateRowsAndCols(index: number) {
    this.gameSettingsForm.patchValue({
      rows: this.sizing[index].rows,
      cols: this.sizing[index].cols
    });
  }

  startGame() {
    this.gameService.setGameSettings(this.gameSettingsForm.value);
    this.router.navigateByUrl('game');
  }
}
