import {
  getRandomFloat,
  getRandomInt,
  funcOrVal,
  getRandomCoordinates,
  isOutOfBounds,
} from "./utils";

class Viewport {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  width: number;
  height: number;
  center: { x: number; y: number };

  constructor(canvas: HTMLCanvasElement, color: string) {
    this.canvas = canvas;
    this.ctx = this.canvas.getContext("2d");
    this.update();
    this.initColor(color);
    window.addEventListener("resize", () =>
      requestAnimationFrame(this.update.bind(this))
    );
  }

  update() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.center = {
      x: this.width / 2,
      y: this.height / 2,
    };
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.initColor();
  }

  get() {
    return {
      canvas: this.canvas,
      ctx: this.ctx,
    };
  }

  // init canvas color
  initColor(color = `rgb(0, 0, 0)`) {
    console.log("init");
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  partialColorWipe() {
    this.ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

/**
 * Extensible particle fields
 */
type ParticleFields = {
  initX: number;
  initY: number;
  x: number;
  y: number;
  fill: string;
  height: number;
  width: number;
  velocity: number;
  angle: number;
  rotation: number;
  frames: number;
  age: number;
};

type LazyParticleFields = {
  [field in keyof ParticleFields]?:
    | ParticleFields[field]
    | (() => ParticleFields[field]);
};

/**
 * Initialization config
 */
type ParticleConfig = LazyParticleFields & {
  vp: Viewport;
};

// Entity that controls the rendering of itself
export class Particle implements ParticleFields {
  // configurable
  config: LazyParticleFields;
  initX: number;
  initY: number;
  x: number;
  y: number;
  fill: string;
  height: number;
  width: number;
  velocity: number;
  angle: number;
  rotation: number;
  frames: number;
  age: number;

  // private
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;

  constructor(config: ParticleConfig) {
    const { vp, ...initConfig } = config || {};
    this.config = initConfig;
    this.init(config);
  }

  init(newConfig?: Partial<ParticleConfig>) {
    const config = { ...this.config, ...newConfig };
    const coords = getRandomCoordinates();
    const {
      x = coords.x,
      y = coords.y,
      fill = `rgba(${getRandomInt(0, 255)}, 255, 255, 0.4)`,
      height = 2,
      width = 1,
      velocity = 1,
      angle = getRandomFloat(3, Math.PI * 2),
      rotation = getRandomFloat(0.01, 0.015),
      vp,
    } = config;

    if (vp && !this.ctx && !this.canvas) {
      const { ctx, canvas } = vp.get();
      this.ctx = ctx;
      this.canvas = canvas;
    }

    // Set particle values based on initial config merged with new config (if provided)
    this.x = funcOrVal(x);
    this.y = funcOrVal(y);
    this.initX = this.x;
    this.initY = this.y;
    this.height = funcOrVal(height);
    this.width = funcOrVal(width);
    this.fill = funcOrVal(fill);
    this.velocity = funcOrVal(velocity);
    this.angle = funcOrVal(angle);
    this.rotation = funcOrVal(rotation);
    this.frames = 0;
    this.age = 0;
  }

  draw() {
    throw new Error("Particle must implement draw method");
  }

  update() {
    throw new Error("Particle must implement update method");
  }
}
export class LightParticle extends Particle {
  update() {
    this.angle += this.rotation;
    this.x = this.x + this.velocity * Math.cos(this.angle);
    this.y = this.y + this.velocity * Math.pow(Math.sin(this.angle), 3) * 0.8;
    this.frames++;
    this.age = this.frames / 60;
    this.velocity += getRandomFloat(-0.15, 0.15);

    if (
      !isOutOfBounds(this.x, this.y) &&
      this.frames &&
      this.x !== this.initX &&
      this.y !== this.initY
    ) {
      this.draw();
    } else {
      this.init();
    }
  }

  draw() {
    const { x, y, height, fill, angle } = this;
    this.ctx.beginPath();
    this.ctx.arc(x, y, height, angle, Math.PI * 2);
    this.ctx.fillStyle = fill;
    this.ctx.fill();
  }
}

export class WaveParticle extends Particle {
  update() {
    this.velocity += getRandomFloat(-0.01, 0.015);
    this.x += this.velocity;
    this.y += Math.sin(this.x * 0.002 + this.velocity);

    if (!isOutOfBounds(this.x, this.y)) {
      this.draw();
    } else {
      this.init({ ...this.config, x: 0 });
    }
  }

  draw() {
    const { x, y, height, width, fill } = this;

    this.ctx.fillStyle = fill;
    this.ctx.fillRect(x, y, height, width);
  }
}

// Manages a collection of particles, trigger their updates
class Emitter {
  vp: Viewport;
  initialParticles: {
    particleInstance: typeof Particle;
    initializationObject: Partial<ParticleConfig>;
    numberOf: number;
  }[] = [];
  particles: Particle[] = [];

  constructor(vp: Viewport) {
    if (!(vp instanceof Viewport)) {
      throw new Error("Viewport is not properly initialized!");
    }

    this.vp = vp;
  }

  addParticle(...particles: Particle[]) {
    for (let i = 0, len = particles.length; i < len; i++) {
      const particle = particles[i];
      if (particle instanceof Particle) {
        this.particles.push(particle);
      } else {
        console.error("Argument is not an instance of Particle");
      }
    }
  }

  createParticles(
    particleInstance: typeof Particle,
    initializationObject: Partial<ParticleConfig> = {},
    numberOf = 1
  ) {
    const particles = new Array(numberOf)
      .fill(null)
      .map(
        () => new particleInstance({ ...initializationObject, vp: this.vp })
      );

    this.initialParticles.push({
      particleInstance,
      initializationObject,
      numberOf,
    });
    this.addParticle(...particles);
  }

  update() {
    this.particles.forEach((particle) => particle.update());
  }

  resetParticles() {
    this.particles = [];
    const reInit = [...this.initialParticles];
    this.initialParticles = [];

    for (let i = 0, len = reInit.length; i < len; i++) {
      const { particleInstance, initializationObject, numberOf } = reInit[i];
      this.createParticles(particleInstance, initializationObject, numberOf);
    }
  }
}

// Render all particles

const initializeCanvas = (canvas: string | HTMLCanvasElement) => {
  if (canvas instanceof Element) {
    return canvas;
  }

  if (typeof canvas === "string") {
    return document.getElementById(canvas);
  }

  return;
};

type LittlePlanetsParameters = {
  canvas?: string | HTMLCanvasElement;
  viewportBGColor?: string;
};

export class LittlePlanets {
  canvas: HTMLCanvasElement;
  viewport: Viewport;
  emitters: Emitter[];
  canRun: boolean;

  constructor(props: LittlePlanetsParameters = {}) {
    this.init(props);
  }

  init({ canvas, viewportBGColor }: LittlePlanetsParameters) {
    let c = initializeCanvas(canvas);
    if (!(c instanceof HTMLCanvasElement)) {
      throw new Error("Canvas is not a valid html element or element ID!");
    }

    this.canvas = c;
    this.viewport = new Viewport(this.canvas, viewportBGColor);
    this.emitters = [];
    this.canRun = true;
  }

  createEmitter() {
    return new Emitter(this.viewport);
  }

  addEmitter(...emitters: Emitter[]) {
    this.emitters.push(...emitters.filter((em) => em instanceof Emitter));
  }

  render() {
    if (this.canRun) {
      this.viewport.partialColorWipe();

      for (let i = 0, len = this.emitters.length; i < len; i++) {
        const em = this.emitters[i];

        em.update();
      }

      requestAnimationFrame(this.render.bind(this));
    }
  }

  stop() {
    this.canRun = false;
    this.viewport.initColor();

    for (let i = 0, len = this.emitters.length; i < len; i++) {
      const em = this.emitters[i];

      em.resetParticles();
    }
  }

  pause() {
    this.canRun = false;
  }

  start() {
    this.canRun = true;
    this.render();
  }
}
