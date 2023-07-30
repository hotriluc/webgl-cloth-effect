import * as THREE from "three";

import { ISizes } from "../interface/Size.interface";

import vertexShader from "../shaders/sketch/vertex.glsl";
import fragmentShader from "../shaders/sketch/fragment.glsl";
import O from "./O";

interface IConstructor {
  element: HTMLElement;
  scene: THREE.Scene;
  screen: ISizes;
  viewport: ISizes;
}

const segments = 8;

export default class Media extends O {
  scene: THREE.Scene;
  image: HTMLImageElement | null = null;
  geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(
    1,
    1,
    segments,
    segments
  );
  mesh: THREE.Mesh | null = null;

  constructor({ element, scene, viewport, screen }: IConstructor) {
    super(element, viewport, screen);

    this.image = element.querySelector("img");
    this.scene = scene;

    this.createMesh();
    this.scaleMesh();
  }

  scaleMesh() {
    if (this.mesh && this.bounds) {
      this.mesh.scale.x =
        (this.viewport.width * this.bounds.width) / this.screen.width;
      this.mesh.scale.y =
        (this.viewport.height * this.bounds.height) / this.screen.height;
    }
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

    this.add(this.mesh);
    this.scene.add(this);
  }

  onResize(sizes: { screen: ISizes; viewport: ISizes }) {
    if (sizes) {
      const { screen, viewport } = sizes;

      if (screen) this.screen = screen;
      if (viewport) {
        this.viewport = viewport;
      }
    }

    // Recalculate bounds
    this.resize();
    this.scaleMesh();
  }
}
