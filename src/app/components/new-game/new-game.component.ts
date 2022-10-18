import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { faPuzzlePiece, faUpload } from '@fortawesome/free-solid-svg-icons';
import { fadeEnterAnimation, fadeLeaveAnimation } from 'src/app/helpers/animation';
import { BoardSettings } from 'src/app/models/interfaces/board-settings';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-new-game',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
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

  sizing: { pieces: number, rows: number, cols: number }[] = [];

  faUpload = faUpload;
  faPuzzlePiece = faPuzzlePiece;

  constructor(private gameService: GameService, private fb: UntypedFormBuilder, 
    private router: Router) { }

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
      const longerEdge = image.height >= image.width ? image.height : image.width;
      const shorterEdge = image.height < image.width ? image.height : image.width;
      this.sizing = [];

      for (let i = 4; i < 27; i+=2) {
        let pieceSize = longerEdge / i;
        let j = Math.round(shorterEdge / pieceSize);

        const rows = image.height >= image.width ? i : j;
        const cols = image.height < image.width ? i : j;

        this.sizing.push({ pieces: rows * cols, rows, cols });
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
    const boardSettings: BoardSettings = { 
      zoom: 1,
      zoomLevel: 0, 
      zoomChange: 0, 
      fullImage: false,
      preview: false, 
      timer: true,
      fullscreen: false 
    };
    
    this.gameService.setBoardSettings(boardSettings);
    this.gameService.setGameSettings(this.gameSettingsForm.value);

    this.router.navigateByUrl('game');
  }
}
