import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-new-game',
  templateUrl: './new-game.component.html',
  styleUrls: ['./new-game.component.scss']
})
export class NewGameComponent implements OnInit {
  newGameForm = this.fb.group({
    numberOfPieces: [null, Validators.required],
    rows: [null, Validators.required],
    cols: [null, Validators.required],
    image: [null, Validators.required]
  });

  sizing = [
    { numberOfPieces: 24, rows: 4, cols: 6 },
    { numberOfPieces: 35, rows: 5, cols: 7 },
    { numberOfPieces: 54, rows: 6, cols: 9 },
    { numberOfPieces: 77, rows: 7, cols: 11 },
    { numberOfPieces: 96, rows: 8, cols: 12 },
    { numberOfPieces: 150, rows: 10, cols: 15 },
    { numberOfPieces: 204, rows: 12, cols: 17 },
    { numberOfPieces: 320, rows: 16, cols: 20 }
  ];

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
  }

  onFileSelected(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      this.checkResolution(file);

      this.newGameForm.patchValue({
        image: file,
        numberOfPieces: null
      });

    } else {
      this.newGameForm.patchValue({
        image: null,
        numberOfPieces: null
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
    this.newGameForm.patchValue({
      rows: this.sizing[index].rows,
      cols: this.sizing[index].cols
    });
  }

  startGame() {
    //service
    this.router.navigateByUrl('game');
  }
}
