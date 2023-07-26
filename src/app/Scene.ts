import * as THREE from "three";
import { ISizes } from "../interface/Size.interface";
import SlideShow from "./SlideShow";

export default class {
  screen: ISizes = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  viewport: ISizes = {
    width: 0,
    height: 0,
  };

  renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
    canvas: document.querySelector(".canvas")!,
    alpha: true,
  });
  camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera();
  scene: THREE.Scene = new THREE.Scene();

  slideshow: SlideShow | null = null;

  constructor() {
    this.setup();
    this.bindEvents();
  }

  setup() {
    this.setupCamera();
    this.onResize();

    this.addObjects();

    this.setupRenderer();
  }

  setupRenderer() {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setAnimationLoop(() => {
      this.update();
    });
  }

  setupCamera() {
    this.camera.fov = 45;
    this.camera.position.z = 5;
  }

  addObjects() {
    this.slideshow = new SlideShow(this.scene, this.viewport, this.screen);
  }

  update() {
    this.slideshow?.update();
    this.renderer.render(this.scene, this.camera);
  }

  // Event Handlers Callbacks
  onWheel() {}

  onResize() {
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

    this.slideshow?.onResize({ screen: this.screen, viewport: this.viewport });
  }

  // Events binding
  bindEvents() {
    window.addEventListener("resize", this.onResize.bind(this));
  }
}
