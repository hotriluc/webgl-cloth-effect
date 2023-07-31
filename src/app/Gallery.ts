import * as THREE from "three";
import * as C from "cannon-es";

import normalizeWheel from "normalize-wheel";

import Media from "./Media";
import Cloth from "./Cloth";
import Wind from "./Wind";

import { gsap } from "gsap";
import { lerp } from "three/src/math/MathUtils.js";

export default class Gallery {
  scene: THREE.Scene;

  world: C.World;
  wind: Wind | null = null;
  cloth: Cloth | null = null;

  domElements: {
    gallery: HTMLElement | null;
    medias: NodeListOf<HTMLElement> | null;
    title: NodeListOf<HTMLElement> | null;
  };

  medias: Array<Media> | undefined = [];

  scroll = {
    ease: 0.05,
    current: 0,
    target: 0,
    last: 0,
    position: 0,
  };

  isDown = false;
  start = 0;

  constructor(scene: THREE.Scene, world: C.World) {
    this.scene = scene;
    this.world = world;

    this.domElements = {
      gallery: document.querySelector(".gallery"),
      medias: document.querySelectorAll(".gallery__figure"),
      title: document.querySelectorAll(".title"),
    };

    this.setup();
    this.showText();
    this.bindEvents();
  }

  setup() {
    this.medias = this.getMedias();

    // Add cloth physic to first Media object
    // later add setter to Cloth class to set current media
    if (this.medias && this.medias.length) {
      this.cloth = new Cloth(this.medias[1], this.world);
      this.wind = new Wind(this.medias[1]);
    }
  }

  getMedias() {
    if (!this.domElements.medias) return;

    return Array.from(this.domElements.medias).map((el) => {
      const tile = new Media({
        element: el,
        scene: this.scene,
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
    this.scroll.current = lerp(
      this.scroll.current,
      this.scroll.target,
      this.scroll.ease
    );

    this.medias?.forEach((tile) => {
      tile.update(this.scroll.current);
    });
    this.wind?.update();
    this.cloth?.update();

    this.scroll.last = this.scroll.current;

    if (this.wind) {
      this.cloth?.applyWind(this.wind);
    }
  }

  onResize() {
    this.wind?.onResize();
    this.medias?.forEach((tile) => tile.onResize());
  }

  onWheel(event: Event) {
    const normalized = normalizeWheel(event);
    const speed = normalized.pixelY;

    this.scroll.target += speed * 0.5;
  }

  onTouchDown(event: MouseEvent | TouchEvent) {
    this.isDown = true;

    this.scroll.position = this.scroll.current;
    if (event instanceof TouchEvent) {
      this.start = event.touches[0].clientY;
    }

    if (event instanceof MouseEvent) {
      this.start = event.clientY;
    }
  }

  onTouchMove(event: MouseEvent | TouchEvent) {
    if (!this.isDown) return;

    let y = 0;

    if (event instanceof TouchEvent) {
      y = event.touches[0].clientY;
    }
    if (event instanceof MouseEvent) {
      y = event.clientY;
    }

    const distance = (this.start - y) * 2;

    this.scroll.target = this.scroll.position + distance;
  }

  onTouchUp() {
    this.isDown = false;
  }

  bindEvents() {
    window.addEventListener("mousewheel", this.onWheel.bind(this));
    window.addEventListener("wheel", this.onWheel.bind(this));

    window.addEventListener("mousedown", this.onTouchDown.bind(this));
    window.addEventListener("mousemove", this.onTouchMove.bind(this));
    window.addEventListener("mouseup", this.onTouchUp.bind(this));

    window.addEventListener("touchstart", this.onTouchDown.bind(this));
    window.addEventListener("touchmove", this.onTouchMove.bind(this));
    window.addEventListener("touchend", this.onTouchUp.bind(this));
  }
}
