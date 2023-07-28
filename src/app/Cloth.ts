import * as C from "cannon-es";
import Media from "./Media";

// Cloth Physic Class
export default class Cloth {
  figure: Media;
  world: C.World;
  stitches: Array<C.Body> = [];
  stitchesShape: C.Particle = new C.Particle();

  totalMass: number = 3;
  stitchMass: number = 0;

  constructor(media: Media, world: C.World) {
    this.figure = media;
    this.world = world;

    this.setStitchesMass();
    this.setStitches();
  }

  /**
   * Set mass to each stitches
   * @param mass - stitch mass
   */
  setStitchesMass(mass?: number) {
    const { widthSegments, heightSegments } = this.figure.geometry.parameters;

    // We divide the mass of our body by the total number of points in our mesh.
    // This way, an object with a lot of vertices doesn’t have a bigger mass.
    this.stitchMass = mass ?? this.totalMass / (widthSegments * heightSegments);
  }

  /**
   * Creating stitches (IN PHYSIC WORLD)
   * by adding particle body to each vertex position of a mesh
   */
  setStitches() {
    const { position } = this.figure.geometry.attributes;
    const { widthSegments: cols, heightSegments: rows } =
      this.figure.geometry.parameters;

    this.stitches = [];

    for (let i = 0; i < position.count; i++) {
      const row = Math.floor(i / (rows + 1));

      // Mesh position is already normalized
      // so no need to multiply for height and width
      const pos = new C.Vec3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      );

      const stitch = new C.Body({
        mass: row === 0 ? 0 : this.stitchMass,
        linearDamping: 0.8,
        position: pos,
        shape: this.stitchesShape,
        velocity: new C.Vec3(0, 0, -2),
      });

      this.stitches.push(stitch);
      this.world.addBody(stitch);
    }

    // Create distance constraint between neighbor vertices
    for (let i = 0; i < position.count; i++) {
      const col = i % (cols + 1);
      const row = Math.floor(i / (rows + 1));

      if (col < cols) {
        this.connect(i, i + 1);
      }
      if (row < rows) {
        this.connect(i, i + rows + 1);
      }
    }
  }

  connect(i: number, j: number) {
    const c = new C.DistanceConstraint(this.stitches[i], this.stitches[j]);

    this.world.addConstraint(c);
  }

  /**
   * Translate Stitches to Three World
   */
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
