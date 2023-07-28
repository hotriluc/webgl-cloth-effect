import { ISizes } from "../interface/Size.interface";

import * as THREE from "three";
import * as C from "cannon-es";
import Media from "./Media";
import Cloth from "./Cloth";

export default class Gallery {
  scene: THREE.Scene;
  world: C.World;
  geometry: THREE.PlaneGeometry;

  viewport: ISizes = { width: 0, height: 0 };
  screen: ISizes = { width: 0, height: 0 };

  domFiguresList: Array<HTMLElement> | null = null;
  medias: Array<Media> | undefined = [];
  cloth: Cloth | null = null;

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

    this.geometry = new THREE.PlaneGeometry(1, 1, 8, 8);
    this.domFiguresList = Array.from(
      document.querySelectorAll(".gallery__figure")
    );

    this.setup();
  }

  setup() {
    this.medias = this.getMedias();

    // Add cloth physic to first Media object
    // later add setter to Cloth class to set current media
    if (this.medias) {
      this.cloth = new Cloth(this.medias[0], this.world);
    }
  }

  getMedias() {
    return this.domFiguresList?.map((el) => {
      const tile = new Media({
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
    this.medias?.forEach((tile) => tile.update());
    this.cloth?.update();
  }

  onResize({ screen, viewport }: { screen: ISizes; viewport: ISizes }) {
    this.medias?.forEach((tile) => tile.onResize({ screen, viewport }));
  }
}
