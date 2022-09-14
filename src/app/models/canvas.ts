import { Position } from "./position";
import { Size } from "./size";

export class Canvas {
  private _size: Size;
  private _position: Position;
  private _scale: number;

  constructor(windowWidth: number, windowHeight: number, x: number, y: number, scale: number) {
    this._size = new Size(windowWidth * scale, windowHeight * scale);
    this._position = new Position(x, y);
    this._scale = scale;
  }
  
  public get position() {
    return this._position;
  }
  
  public get size() {
    return this._size;
  }
}
