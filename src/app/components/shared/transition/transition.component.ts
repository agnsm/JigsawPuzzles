import { Component, Input, OnInit } from '@angular/core';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { fadeEnterAnimation, fadeLeaveAnimation } from 'src/app/helpers/animation';

@Component({
  selector: 'app-transition',
  animations: [fadeEnterAnimation, fadeLeaveAnimation],
  templateUrl: './transition.component.html',
  styleUrls: ['./transition.component.scss']
})
export class TransitionComponent implements OnInit {
  @Input() condition!: boolean;

  faPuzzlePiece = faPuzzlePiece;

  constructor() { }

  ngOnInit(): void {
  }

}
