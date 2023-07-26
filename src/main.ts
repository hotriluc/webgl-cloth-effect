import Scene from "./app/Scene";

interface IApp {
  Scene: Scene;
}

declare const window: Window &
  typeof globalThis & {
    APP: IApp;
  };

const APP = window.APP || {};

const initApp = () => {
  window.APP = APP;

  APP.Scene = new Scene();
};

initApp();
