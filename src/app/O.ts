import { Object3D } from "three";
import { ISizes } from "../interface/Size.interface";

export default class O extends Object3D {
  el: HTMLElement | undefined;
  bounds: DOMRect | undefined;
  pos: { x: number; y: number } = { x: 0, y: 0 };
  viewport: ISizes = { width: 0, height: 0 };
  screen: ISizes = { width: 0, height: 0 };

  constructor(el: HTMLElement) {
    super();

    this.el = el;

    this.resize();
  }

  resize() {
    const { screen, viewport } = window.APP.Layout;

    this.bounds = this.el?.getBoundingClientRect();
    this.screen = screen;
    this.viewport = viewport;

    if (this.bounds) {
      const scaleX =
        (this.viewport.width * this.bounds.width) / this.screen.width;
      const offsetX =
        (this.bounds.left * this.viewport.width) / this.screen.width;

      const scaleY =
        (this.bounds.height * this.viewport.height) / this.screen.height;
      const offsetY =
        (this.bounds.top * this.viewport.height) / this.screen.height;

      this.pos = {
        x: -(this.viewport.width / 2) + scaleX / 2 + offsetX,
        y: this.viewport.height / 2 - scaleY / 2 - offsetY,
      };
    }

    this.position.x = this.pos.x;
    this.position.y = this.pos.y;

    this.update();
  }

  update(current?: number) {
    current && (this.position.y = current + this.pos.y);
  }
}
