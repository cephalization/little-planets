import {
  LittlePlanets,
  LightParticle,
  WaveParticle,
  Particle
} from "../lib/index";
import { getRandomInt, getRandomFloat } from "../lib/utils";

// Instantiate little planets
const lp = new LittlePlanets({
  canvas: "canvas" // "canvas" is the id of the canvas element
});

// Create emitters
// Emitters store particles of any type, you can have one or many
const particleEmitter = lp.createEmitter();
const waveEmitter = lp.createEmitter();

// Create custom particle
class LazerParticle extends Particle {
  update() {
    this.x += this.velocity;

    if (this.x < this.canvas.width) {
      this.draw();
    } else {
      this.init({
        x: 0,
        y: getRandomInt(0, this.canvas.height)
      });
    }
  }

  draw() {
    const { fill, x, y, width, height } = this;

    this.ctx.fillStyle = fill;
    this.ctx.fillRect(x, y, width, height);
  }
}

// add particles to emitters
// note that there are pre-made particles to choose from
// params are: particleInstance, configuration object, number to generate
// properties that are functions will be re-evaluated whenever particle is reinitialized
particleEmitter.createParticles(LightParticle, { fill: "green" }, 1);
particleEmitter.createParticles(LightParticle, { fill: "pink" }, 10);
particleEmitter.createParticles(
  LazerParticle,
  { x: 0, velocity: () => getRandomFloat(1, 3), height: 10, width: 3 },
  100
);
waveEmitter.createParticles(WaveParticle, { height: 20, fill: "red" }, 1);

// add emitters to little planets
lp.addEmitter(particleEmitter);
lp.addEmitter(waveEmitter);

// render particles in each emitter
lp.start();

// lp provides helpful methods like "start", "stop", and "pause"
// e.g. window.lp.stop() will end rendering and wipe the screen
window.lp = lp;
