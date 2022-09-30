import { Coordinates } from "./coordinates";
import { Size } from "./size";

export class Canvas {
  private _size: Size;
  private _position: Coordinates;
  private _context: CanvasRenderingContext2D;
  private _scale: number;

  constructor(
    windowWidth: number, windowHeight: number, 
    x: number, y: number, 
    context: CanvasRenderingContext2D, scale: number
  ) {
    this._size = new Size(windowWidth * scale, windowHeight * scale);
    this._position = new Coordinates(x, y);
    this._context = context;
    this._scale = scale;
  }
  
  public get position() {
    return this._position;
  }
  
  public get size() {
    return this._size;
  }

  public get context() {
    return this._context;
  }
}
