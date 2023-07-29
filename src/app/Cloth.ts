import * as THREE from "three";
import * as C from "cannon-es";

import Media from "./Media";
import Wind from "./Wind";

// Cloth Physic Class
export default class Cloth {
  figure: Media;
  world: C.World;

  totalMass: number = 2;
  stitchMass: number = 0;
  stitches: Array<C.Body> = [];
  stitchesShape: C.Particle = new C.Particle();

  bufferV: THREE.Vector3 = new THREE.Vector3();
  bufferV2: C.Vec3 = new C.Vec3();

  constructor(media: Media, world: C.World) {
    this.figure = media;
    this.world = world;

    this.setStitchesMass();
    this.setStitches();
  }

  setStitchesMass(mass?: number) {
    const { widthSegments, heightSegments } = this.figure.geometry.parameters;

    // Dividing mass to number of mesh vertices in order to
    // make sure that the object with a lot of vertices doesn’t have a bigger mass.
    this.stitchMass = mass ?? this.totalMass / (widthSegments * heightSegments);
  }

  // Creating stitches (IN PHYSIC WORLD)
  setStitches() {
    const { position } = this.figure.geometry.attributes;
    this.stitches = [];

    for (let i = 0; i < position.count; i++) {
      // Mesh position is already normalized so no need to multiply for height and width
      const pos = new C.Vec3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      );

      const stitch = new C.Body({
        mass: this.stitchMass,
        linearDamping: 0.8,
        position: pos,
        shape: this.stitchesShape,
      });

      this.stitches.push(stitch);
      this.world.addBody(stitch);
    }

    this.sewStitches();
  }

  // Creating distance constraint between neighbor vertices
  sewStitches() {
    const { position } = this.figure.geometry.attributes;
    const { widthSegments: cols, heightSegments: rows } =
      this.figure.geometry.parameters;

    for (let i = 0; i < position.count; i++) {
      const col = i % (cols + 1);
      const row = Math.floor(i / (rows + 1));

      if (col < cols) {
        this.connect(i, i + 1);
      }
      if (row < rows) {
        this.connect(i, i + rows + 1);
      }

      if (row === 0) {
        const pos = this.stitches[i].position.clone();

        pos.y += 0.5;

        const b = new C.Body({
          mass: 0,
          position: pos,
          shape: new C.Particle(),
        });

        const cons = new C.DistanceConstraint(this.stitches[i], b);

        this.world.addConstraint(cons);
      }
    }
  }

  // Connecting two stitches
  connect(i: number, j: number) {
    const c = new C.DistanceConstraint(this.stitches[i], this.stitches[j]);

    this.world.addConstraint(c);
  }

  // Applying wind force to the cloth
  applyWind(wind: Wind) {
    const { position } = this.figure.geometry.attributes;

    for (let i = 0; i < position.count; i++) {
      const stitch = this.stitches[i];
      const windNoise = wind.flowField[i];

      // Store force vector in physic world vector
      const tmpPosPhysic = this.bufferV2.set(
        windNoise.x,
        windNoise.y,
        windNoise.z
      );

      stitch.applyForce(tmpPosPhysic, C.Vec3.ZERO);
    }
  }

  // Translating cloth physic to ThreeJS
  updateStitches() {
    if (!this.stitches.length) return;

    const { position } = this.figure.geometry.attributes;

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
    this.updateStitches();
  }
}
