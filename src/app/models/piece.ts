export class Piece {
  id: number;
  row: number;
  col: number;
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  locked = false;
  connections: {
    direction: string,
    row: number;
    col: number;
    connected: boolean;
  }[] = [];

  constructor(
    id: number,
    row: number, 
    col: number, 
    sx: number, 
    sy: number, 
    dx: number, 
    dy: number
  ) {
    this.id = id;
    this.row = row;
    this.col = col;
    this.sx = sx;
    this.sy = sy;
    this.dx = dx;
    this.dy = dy;
    this.initializeConnections();
  }

  initializeConnections() {
    this.connections.push({
      direction: 'left',
      row: this.row,
      col: this.col - 1,
      connected: false
    }, {
      direction: 'right',
      row: this.row,
      col: this.col + 1,
      connected: false
    }, {
      direction: 'top',
      row: this.row - 1,
      col: this.col,
      connected: false
    }, {
      direction: 'bottom',
      row: this.row + 1,
      col: this.col,
      connected: false
    });
  }

  setPosition(dx: number, dy: number) {
    this.dx = dx;
    this.dy = dy;
  }

  setConnection(direction: string) {
    this.connections.map(connection => {
      if (connection.direction == direction) {
        connection.connected = true;
      }
    });
  }
}
