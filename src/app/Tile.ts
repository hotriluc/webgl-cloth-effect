import * as THREE from "three";
import * as C from "cannon-es";

import { ISizes } from "../interface/Size.interface";

import vertexShader from "../shaders/sketch/vertex.glsl";
import fragmentShader from "../shaders/sketch/fragment.glsl";

interface IConstructor {
  element: HTMLElement;
  geometry: THREE.BufferGeometry;
  world: C.World;
  scene: THREE.Scene;
  screen: ISizes;
  viewport: ISizes;
}

const mass = 1;
const segments = 8;

export default class Tile {
  image: HTMLImageElement | null;
  bounds: DOMRect | undefined;
  stitches: Array<C.Body> = [];

  world: C.World;
  scene: THREE.Scene;
  screen: ISizes;
  viewport: ISizes;

  geometry: THREE.BufferGeometry;
  mesh: THREE.Mesh | null = null;

  constructor({
    element,
    geometry,
    scene,
    world,
    screen,
    viewport,
  }: IConstructor) {
    this.image = element.querySelector("img");

    this.scene = scene;
    this.world = world;

    this.screen = screen;
    this.viewport = viewport;

    this.geometry = geometry;

    this.setup();
  }

  setup() {
    this.createMesh();
    this.createBounds();
    this.createStitches();
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

    // Load texture
    if (this.image) {
      image.src = this.image.src;

      image.onload = () => {
        // Update uniforms
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

  createStitches() {
    const particleShape = new C.Particle();
    const { position } = this.geometry.attributes;
    this.stitches = [];

    // To create soft material body
    // We will add particle shape to each vertex of our geometry
    for (let i = 0; i < position.count; i++) {
      // calculating which row
      const row = Math.floor(i / (segments + 1));

      // Because in createBounds() position values are already normalized
      // so stitches pos don't need to be normalized
      const pos = new C.Vec3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      );

      const stitch = new C.Body({
        // We divide the mass of our body by the total number of points in our mesh.
        // This way, an object with a lot of vertices doesn’t have a bigger mass.
        mass: row === 0 ? 0 : mass / position.count,
        linearDamping: 0.8,
        position: pos,
        shape: particleShape,
        velocity: new C.Vec3(0, 0, -2),
      });

      this.stitches.push(stitch);
      this.world.addBody(stitch);
    }

    // Making distance constraint between neighbor vertices
    for (let i = 0; i < position.count; i++) {
      const col = i % (segments + 1);
      const row = Math.floor(i / (segments + 1));

      if (col < segments) this.connect(i, i + 1);
      if (row < segments) this.connect(i, i + segments + 1);
    }
  }

  connect(i: number, j: number) {
    const c = new C.DistanceConstraint(this.stitches[i], this.stitches[j]);

    this.world.addConstraint(c);
  }

  updateScale() {
    if (this.mesh && this.bounds) {
      this.mesh.scale.x =
        (this.viewport.width * this.bounds.width) / this.screen.width;
      this.mesh.scale.y =
        (this.viewport.height * this.bounds.height) / this.screen.height;
    }
  }

  // Translate img X offset to 3D
  updateX(x = 0) {
    if (this.mesh && this.bounds) {
      this.mesh.position.x =
        -(this.viewport.width / 2) +
        this.mesh.scale.x / 2 +
        ((this.bounds.left - x) / this.screen.width) * this.viewport.width;
    }
  }

  // Translate img Y offset to 3D
  updateY(y = 0) {
    if (this.mesh && this.bounds) {
      this.mesh.position.y =
        this.viewport.height / 2 -
        this.mesh.scale.y / 2 -
        ((this.bounds.top - y) / this.screen.height) * this.viewport.height;
    }
  }

  // Translate Stitches position from Physic world to ThreeJS
  updateStitches() {
    const { position } = this.geometry.attributes;

    for (let i = 0; i < position.count; i++) {
      position.setXYZ(
        i,
        this.stitches[i].position.x,
        this.stitches[i].position.y,
        this.stitches[i].position.z
      );
    }

    position.needsUpdate = true;
  }

  update() {
    this.updateScale();
    this.updateX();
    this.updateY();
    this.updateStitches();
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
