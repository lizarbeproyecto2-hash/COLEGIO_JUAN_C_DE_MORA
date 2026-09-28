// server/game/Player.ts
export class Player {
  public socketId: string;
  public lives: number;
  public level: number;

  constructor(socketId: string) {
    this.socketId = socketId;
    this.lives = 3; // starting lives
    this.level = 1;
  }
}
