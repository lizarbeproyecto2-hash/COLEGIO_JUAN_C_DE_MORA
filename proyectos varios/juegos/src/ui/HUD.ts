// src/ui/HUD.ts
import Phaser from "phaser";

export default class HUD {
  private scene: Phaser.Scene;
  private livesText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.create();
  }

  private create(): void {
    this.livesText = this.scene.add.text(16, 16, "Vidas: 0", {
      fontSize: "20px",
      color: "#000",
    });
    this.levelText = this.scene.add.text(16, 40, "Nivel: 0", {
      fontSize: "20px",
      color: "#000",
    });
  }

  updateLives(lives: number): void {
    this.livesText.setText(`Vidas: ${lives}`);
  }

  updateLevel(level: number): void {
    this.levelText.setText(`Nivel: ${level}`);
  }
}
