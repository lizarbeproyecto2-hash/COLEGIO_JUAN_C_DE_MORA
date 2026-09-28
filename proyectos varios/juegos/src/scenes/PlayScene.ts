// src/scenes/PlayScene.ts
import Phaser from "phaser";
import HUD from "../ui/HUD";
import io from "socket.io-client";

interface Puzzle {
  question: string;
  answer: number;
}

export default class PlayScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hud!: HUD;
  private socket!: ReturnType<typeof io>;
  private currentPuzzle!: Puzzle;
  private puzzleText!: Phaser.GameObjects.Text;
  private answerInput!: HTMLInputElement;
  private lives: number = 3;
  private level: number = 1;

  constructor() {
    super({ key: "PlayScene" });
  }

  preload(): void {
    // assets already loaded in BootScene
  }

  create(): void {
    // simple platform group
    const platforms = this.physics.add.staticGroup();
    platforms.create(400, 580, "platform").setScale(2).refreshBody(); // ground
    platforms.create(600, 400, "platform");
    platforms.create(200, 300, "platform");

    // player
    this.player = this.physics.add.sprite(100, 450, "player");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    // controls
    this.cursors = this.input.keyboard.createCursorKeys();

    // HUD
    this.hud = new HUD(this);
    this.hud.updateLives(this.lives);
    this.hud.updateLevel(this.level);

    // socket.io client
    this.socket = io("http://localhost:4000");
    this.socket.emit("joinRoom", { roomId: "default" });
    this.socket.on("stateUpdate", (data: any) => {
      // simple sync: update lives if server says so
      if (data.lives !== undefined) this.lives = data.lives;
      this.hud.updateLives(this.lives);
    });

    // puzzle UI
    this.generatePuzzle();
    this.puzzleText = this.add.text(400, 50, this.currentPuzzle.question, { fontSize: "32px", color: "#000" }).setOrigin(0.5);
    // create a DOM input element for answer (Phaser 3 supports adding DOM element)
    const element = this.add.dom(400, 100).createFromHTML('<input type="text" id="answer" placeholder="Respuesta" style="font-size:24px; padding:5px;"/>');
    this.answerInput = element.getChildByID("answer") as HTMLInputElement;
    element.addListener('click');
    element.on('click', (event: any) => {
      if (event.target.id === 'answer') {
        // ignore
      }
    });
    // listen for Enter key on the DOM element
    this.answerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.checkAnswer();
      }
    });
  }

  update(): void {
    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(160);
    } else {
      this.player.setVelocityX(0);
    }
    if (this.cursors.up?.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
    }
    // send position to server for sync (very simple)
    this.socket.emit("playerMove", { x: this.player.x, y: this.player.y });
  }

  private generatePuzzle(): void {
    const a = Phaser.Math.Between(1, 10 * this.level);
    const b = Phaser.Math.Between(1, 10 * this.level);
    const isAdd = Phaser.Math.Between(0, 1) === 0;
    const question = isAdd ? `${a} + ${b} = ?` : `${a} - ${b} = ?`;
    const answer = isAdd ? a + b : a - b;
    this.currentPuzzle = { question, answer };
    if (this.puzzleText) this.puzzleText.setText(question);
  }

  private checkAnswer(): void {
    const userAns = parseInt(this.answerInput.value);
    if (!isNaN(userAns) && userAns === this.currentPuzzle.answer) {
      // correct! level up, gain life
      this.lives += 1;
      this.level += 1;
      this.hud.updateLives(this.lives);
      this.hud.updateLevel(this.level);
      this.socket.emit("levelComplete", { lives: this.lives, level: this.level });
      // reset puzzle
      this.answerInput.value = "";
      this.generatePuzzle();
    } else {
      // wrong, maybe flash red
      this.tweens.add({ targets: this.puzzleText, tint: 0xff0000, duration: 200, yoyo: true, repeat: 1 });
    }
  }
}
