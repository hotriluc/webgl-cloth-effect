import { ISizes } from "../interface/Size.interface";

import * as THREE from "three";
import * as C from "cannon-es";

import Tile from "./Tile";

const segments = 8;

export default class {
  scene: THREE.Scene;
  world: C.World;
  viewport: ISizes = { width: 0, height: 0 };
  screen: ISizes = { width: 0, height: 0 };

  geometry: THREE.BufferGeometry;

  domFiguresList: Array<HTMLElement> | null = null;
  slides: Array<Tile> | undefined = [];

  constructor(
    scene: THREE.Scene,
    world: C.World,
    viewport: ISizes,
    screen: ISizes
  ) {
    this.scene = scene;
    this.world = world;
    this.viewport = viewport;
    this.screen = screen;

    this.geometry = new THREE.PlaneGeometry(1, 1, segments, segments);
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
        world: this.world,
        screen: this.screen,
        viewport: this.viewport,
      });

      return tile;
    });
  }

  update() {
    this.world.step(1 / 60);

    this.slides?.forEach((tile) => tile.update());
  }

  onResize({ screen, viewport }: { screen: ISizes; viewport: ISizes }) {
    this.slides?.forEach((tile) => tile.onResize({ screen, viewport }));
  }
}
