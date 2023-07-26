import { ISizes } from "../interface/Size.interface";

import * as THREE from "three";
import Tile from "./Tile";

export default class {
  scene: THREE.Scene;
  viewport: ISizes = { width: 0, height: 0 };
  screen: ISizes = { width: 0, height: 0 };

  geometry: THREE.BufferGeometry;

  domFiguresList: Array<HTMLElement> | null = null;
  slides: Array<Tile> | undefined = [];

  constructor(scene: THREE.Scene, viewport: ISizes, screen: ISizes) {
    this.scene = scene;
    this.viewport = viewport;
    this.screen = screen;

    this.geometry = new THREE.PlaneGeometry();
    this.domFiguresList = Array.from(
      document.querySelectorAll(".gallery__figure")
    );

    this.setup();
  }

  setup() {
    this.slides = this.getSlides();
  }

  getSlides() {
    return this.domFiguresList?.map((el) => {
      const tile = new Tile({
        element: el,
        geometry: this.geometry,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
      });

      return tile;
    });
  }

  update() {
    this.slides?.forEach((tile) => tile.update());
  }

  onResize({ screen, viewport }: { screen: ISizes; viewport: ISizes }) {
    this.slides?.forEach((tile) => tile.onResize({ screen, viewport }));
  }
}
