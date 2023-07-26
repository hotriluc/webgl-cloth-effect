import * as THREE from "three";
import { ISizes } from "../interface/Size.interface";

interface IConstructor {
  element: HTMLElement;
  geometry: THREE.PlaneGeometry;
  scene: THREE.Scene;
  screen: ISizes;
  viewport: ISizes;
}

export default class Tile {
  constructor({ element, geometry, scene, screen, viewport }: IConstructor) {
    console.log(element, geometry, scene, screen, viewport);
  }
}
