import { ISizes } from "../interface/Size.interface";

import * as THREE from "three";
import * as C from "cannon-es";

import Media from "./Media";
import Cloth from "./Cloth";
import Wind from "./Wind";

import { gsap } from "gsap";

export default class Gallery {
  scene: THREE.Scene;
  screen: ISizes = { width: 0, height: 0 };
  viewport: ISizes = { width: 0, height: 0 };

  world: C.World;
  wind: Wind | null = null;
  cloth: Cloth | null = null;

  domElements: {
    gallery: HTMLElement | null;
    medias: NodeListOf<HTMLElement> | null;
    title: NodeListOf<HTMLElement> | null;
  };

  medias: Array<Media> | undefined = [];

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

    this.domElements = {
      gallery: document.querySelector(".gallery"),
      medias: document.querySelectorAll(".gallery__figure"),
      title: document.querySelectorAll(".title"),
    };

    this.setup();
    this.showText();
  }

  setup() {
    this.medias = this.getMedias();

    // Add cloth physic to first Media object
    // later add setter to Cloth class to set current media
    if (this.medias && this.medias.length) {
      this.cloth = new Cloth(this.medias[1], this.world);
      this.wind = new Wind(this.medias[1], this.screen);
    }
  }

  getMedias() {
    if (!this.domElements.medias) return;

    return Array.from(this.domElements.medias).map((el, index) => {
      const tile = new Media({
        element: el,
        index: index,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
      });

      return tile;
    });
  }

  showText() {
    gsap.fromTo(
      ".title__inner",
      { y: "100%", opacity: 0 },
      { y: 0, opacity: 1, ease: "power3.inOut", duration: 1.2 }
    );
  }

  update() {
    this.medias?.forEach((tile) => tile.update());
    this.wind?.update();
    this.cloth?.update();

    if (this.wind) {
      this.cloth?.applyWind(this.wind);
    }
  }

  onResize({ screen, viewport }: { screen: ISizes; viewport: ISizes }) {
    this.medias?.forEach((tile) => tile.onResize({ screen, viewport }));
  }
}
