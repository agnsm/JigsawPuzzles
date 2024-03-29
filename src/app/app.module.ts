import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgFireworksModule } from '@fireworks-js/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardManagementComponent } from './components/game/board-management/board-management.component';
import { GameComponent } from './components/game/game/game.component';
import { JigsawCanvasComponent } from './components/game/jigsaw-canvas/jigsaw-canvas.component';
import { ProgressBarComponent } from './components/game/progress-bar/progress-bar.component';
import { SummaryComponent } from './components/game/summary/summary.component';
import { TimerComponent } from './components/game/timer/timer.component';
import { NewGameComponent } from './components/new-game/new-game.component';
import { TransitionComponent } from './components/shared/transition/transition.component';

@NgModule({
  declarations: [
    AppComponent,
    NewGameComponent,
    GameComponent,
    JigsawCanvasComponent,
    BoardManagementComponent,
    TransitionComponent,
    ProgressBarComponent,
    TimerComponent,
    SummaryComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule,
    NgFireworksModule,
    MatSnackBarModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
