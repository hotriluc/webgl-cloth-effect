import * as THREE from "three";

export default class {
  screen: { width: number; height: number } = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  viewport: { width: number; height: number } = {
    width: 0,
    height: 0,
  };

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".canvas")!,
    alpha: true,
  });
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  scene: THREE.Scene = new THREE.Scene();

  constructor() {
    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupCamera();
    this.setSizes();

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);

    this.update();
    this.addEventListeners();
  }

  setupRenderer() {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  setupCamera() {
    this.camera.fov = 45;
    this.camera.position.z = 5;
  }

  /**
   * Handlers
   */
  onWheel() {}

  setSizes() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      width,
      height,
    };
  }

  update() {
    requestAnimationFrame(this.update.bind(this));
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Add Event Listeners
   */

  addEventListeners() {
    window.addEventListener("resize", this.setSizes.bind(this));
  }
}
