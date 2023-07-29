import { ISizes } from "../interface/Size.interface";

import * as THREE from "three";
import * as C from "cannon-es";

import Media from "./Media";
import Cloth from "./Cloth";
import Wind from "./Wind";

export default class Gallery {
  scene: THREE.Scene;
  screen: ISizes = { width: 0, height: 0 };
  viewport: ISizes = { width: 0, height: 0 };

  world: C.World;
  wind: Wind | null = null;
  cloth: Cloth | null = null;

  domFiguresList: Array<HTMLElement> = [];
  medias: Array<Media> = [];

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
    this.domFiguresList = Array.from(
      document.querySelectorAll(".gallery__figure")
    );

    this.setup();
  }

  setup() {
    this.medias = this.getMedias();

    // Add cloth physic to first Media object
    // later add setter to Cloth class to set current media
    if (this.medias.length) {
      this.cloth = new Cloth(this.medias[0], this.world);
      this.wind = new Wind(this.medias[0], this.screen);
    }
  }

  getMedias() {
    return this.domFiguresList.map((el) => {
      const tile = new Media({
        element: el,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
      });

      return tile;
    });
  }

  update() {
    this.medias.forEach((tile) => tile.update());
    this.wind?.update();
    this.cloth?.update();

    if (this.wind) {
      this.cloth?.applyWind(this.wind);
    }
  }

  onResize({ screen, viewport }: { screen: ISizes; viewport: ISizes }) {
    this.medias.forEach((tile) => tile.onResize({ screen, viewport }));
  }
}
