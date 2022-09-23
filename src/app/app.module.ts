import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BoardManagementComponent } from './components/game/board-management/board-management.component';
import { GameComponent } from './components/game/game/game.component';
import { JigsawCanvasComponent } from './components/game/jigsaw-canvas/jigsaw-canvas.component';
import { NewGameComponent } from './components/new-game/new-game.component';
import { TransitionComponent } from './components/shared/transition/transition.component';

@NgModule({
  declarations: [
    AppComponent,
    NewGameComponent,
    GameComponent,
    JigsawCanvasComponent,
    BoardManagementComponent,
    TransitionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
