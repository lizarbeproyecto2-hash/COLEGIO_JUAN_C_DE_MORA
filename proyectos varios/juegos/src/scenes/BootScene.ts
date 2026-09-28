// src/scenes/BootScene.ts
import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  preload(): void {
    // Load placeholder assets (simple colored squares generated via data URL)
    const playerDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAIElEQVR42mNgoBvgP4ZGBgYGRiYGBgYGK5hKQoAABfUBrL3uK4/AAAAAElFTkSuQmCC";
    const platformDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAIElEQVR42mNgoBvgP4ZGBgYGRiYGBgYGK5hKQoAABfUBrL3uK4/AAAAAElFTkSuQmCC";
    this.load.image("player", playerDataUrl);
    this.load.image("platform", platformDataUrl);
  }

  create(): void {
    this.scene.start("PlayScene");
  }
}
