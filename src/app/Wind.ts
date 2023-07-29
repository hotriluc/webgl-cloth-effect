import * as THREE from "three";

import Media from "./Media";
import { createNoise3D } from "simplex-noise";
import { gsap } from "gsap";
import { ISizes } from "../interface/Size.interface";

const noise = createNoise3D();
const baseForce = 11.5;
const off = 0.1;

export default class Wind {
  figure: Media;
  screen: ISizes;

  force: number;
  clock: THREE.Clock;
  direction: THREE.Vector3;
  flowField: Array<THREE.Vector3>;

  constructor(figure: Media, screen: ISizes) {
    const { count } = figure.geometry.attributes.position;
    this.screen = screen;

    this.figure = figure;
    this.force = baseForce / count;
    this.clock = new THREE.Clock();

    this.direction = new THREE.Vector3(0, 0, -0.4);

    // each cell will contain force direction vector(wind x force)
    // these vectors will be applied to cloth stitches
    this.flowField = new Array(count);

    this.update();
    this.bindEvents();
  }

  update() {
    const time = this.clock.getElapsedTime();

    const { position } = this.figure.geometry.attributes;
    const size = this.figure.geometry.parameters.widthSegments;

    // To simulate wind we use 3d simplex noise that changes over the time
    for (let i = 0; i < position.count; i++) {
      const col = i % (size + 1);
      const row = Math.floor(i / (size + 1));

      // The highest the row/col the more force
      const force =
        (noise(row * off, col * off, time) * 0.5 + 0.5) * this.force;

      this.flowField[i] = this.direction.clone().multiplyScalar(force);
    }
  }

  onMouseMove({
    clientX: x,
    clientY: y,
  }: {
    clientX: number;
    clientY: number;
  }) {
    gsap.to(this.direction, {
      duration: 0.1,
      x: x / this.screen.width - 0.5,
      y: -(y / this.screen.height) + 0.5,
    });
  }

  bindEvents() {
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
}
