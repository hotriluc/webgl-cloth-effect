import * as THREE from "three";

import { ISizes } from "../interface/Size.interface";

import vertexShader from "../shaders/sketch/vertex.glsl";
import fragmentShader from "../shaders/sketch/fragment.glsl";

interface IConstructor {
  element: HTMLElement;
  scene: THREE.Scene;
  screen: ISizes;
  viewport: ISizes;
  index: number;
}

const segments = 8;

export default class Media {
  scene: THREE.Scene;
  screen: ISizes;
  viewport: ISizes;

  index: number;
  image: HTMLImageElement | null;
  bounds: DOMRect | undefined;

  geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(
    1,
    1,
    segments,
    segments
  );
  mesh: THREE.Mesh | null = null;

  constructor({ element, scene, screen, index, viewport }: IConstructor) {
    this.image = element.querySelector("img");
    this.index = index;

    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    this.setup();
  }

  setup() {
    this.createMesh();
    this.createBounds();
  }

  createBounds() {
    this.bounds = this.image?.getBoundingClientRect();

    this.updateScale();
    this.updateX();
    this.updateY();

    if (this.mesh) {
      (
        this.mesh.material as THREE.ShaderMaterial
      ).uniforms.u_plane_size.value.set(this.mesh.scale.x, this.mesh.scale.y);
    }
  }

  createMesh() {
    const image = new Image();

    // Texture loading
    if (this.image) {
      image.src = this.image.src;

      image.onload = () => {
        material.uniforms.u_image_size.value.set(
          image.naturalWidth,
          image.naturalHeight
        );

        material.uniforms.u_map.value = new THREE.TextureLoader().load(
          image.src
        );
      };
    }

    // Setup shader material
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_map: { value: null },
        u_plane_size: { value: new THREE.Vector2(0, 0) },
        u_image_size: {
          value: new THREE.Vector2(0, 0),
        },
        u_viewport_size: {
          value: new THREE.Vector2(this.viewport.width, this.viewport.height),
        },
        u_strength: { value: 0 },
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
    });

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.scene.add(this.mesh);
  }

  updateScale() {
    if (this.mesh && this.bounds) {
      this.mesh.scale.x =
        (this.viewport.width * this.bounds.width) / this.screen.width;
      this.mesh.scale.y =
        (this.viewport.height * this.bounds.height) / this.screen.height;
    }
  }

  updateX(x = 0) {
    if (this.mesh && this.bounds) {
      this.mesh.position.x =
        -(this.viewport.width / 2) +
        this.mesh.scale.x / 2 +
        ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
    }
  }

  updateY(y = 0) {
    if (this.mesh && this.bounds) {
      this.mesh.position.y =
        this.viewport.height / 2 -
        this.mesh.scale.y / 2 -
        ((this.bounds.top - y) / this.screen.height) * this.viewport.height;
    }
  }

  update() {
    this.updateScale();
    this.updateX();
    this.updateY();
  }

  onResize(sizes: { screen: ISizes; viewport: ISizes }) {
    if (sizes) {
      const { screen, viewport } = sizes;

      if (screen) this.screen = screen;
      if (viewport) {
        this.viewport = viewport;
      }
    }

    this.createBounds();
  }
}
