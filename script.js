function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } ////////////////////
//// AUDIO CODE ////
////////////////////
let audioContext;
let microphone, meter;

// Get request for microphone usage
const requestAudioAccess = () => {
  if (navigator.mediaDevices) {
    navigator.mediaDevices.getUserMedia({ audio: true }).
      then(stream => setAudioStream(stream)).
      catch(err => alert('Hãy cho phép tui sử dụng micro'));
  } else
    alert('Trình duyệt này không được');
};

// Set up to record volume
const setAudioStream = stream => {
  audioContext = new AudioContext();
  microphone = audioContext.createMediaStreamSource(stream);
  meter = createAudioMeter(audioContext);

  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;

  microphone.connect(filter);
  filter.connect(meter);
};

// Check if is blowing
let lowpass = 0;
const ALPHA = 0.5, THRESHOLD = 0.09;
const isBlowing = () => {
  lowpass = ALPHA * meter.volume + (1.0 - ALPHA) * lowpass;
  return lowpass > THRESHOLD;
};

requestAudioAccess();

/////////////////////
//// CANDLE CODE ////
/////////////////////
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const cw = canvas.width = 800;
const ch = canvas.height = 400;

const particles = [];
const MAX_PART_COUNT = 25;

const REIGNITE_RATE = 1; // rate at which flame will recover
const MAX_PART_DOWNTIME = 15; // max limit at which smothered flame will recover

const rand = (min, max) => min + Math.random() * (max - min);

// Fire Particle
class FlameParticle {
  constructor(x = cw / 2, y = ch / 2) {
    _defineProperty(this, "update",











      () => {
        if (this.curLife <= 90) {
          this.radius -= Math.min(this.radius, 0.25);
          this.curAlpha -= 0.005;
        }

        if (microphone && isBlowing())
          this.x += rand(-meter.volume, meter.volume) * 50;

        this.curLife -= this.speed.y;
        this.y -= this.speed.y;
        this.draw();
      }); _defineProperty(this, "draw",

        () => {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, Math.PI * 2, false);
          ctx.fillStyle = `rgba(255, 183, 77, ${this.curAlpha})`;
          ctx.fill();
          ctx.closePath();
        }); this.radius = 15; this.speed = { x: rand(-0.5, 0.5), y: 2.5 }; this.life = rand(50, 100); this.alpha = 0.5; this.x = x; this.y = y; this.curAlpha = this.alpha; this.curLife = this.life;
  }
}


// Flame Base
class FlameBase {
  constructor() {
    _defineProperty(this, "update",
      this.draw = () => {
        ctx.beginPath();
        ctx.arc(cw / 2, ch / 2, 14, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(255,167,38,0.4)';
        ctx.fill();
        ctx.closePath();
      });
  }
}


////////////////////
let base = new FlameBase();
let particleCount = MAX_PART_COUNT;

const updateParticles = () => {
  for (let i = 0; i < particleCount; i++) {
    if (particles[i].curLife < 0) particles[i] = new FlameParticle();
    particles[i].update();
  };
};


var audio = new Audio('./music.mp3');

const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, cw, ch);

  // Smother flame if user is blowing
  if (microphone && isBlowing())
    if (particleCount > -MAX_PART_DOWNTIME) particleCount -= 1;
  if (particleCount == -15) {
    var app = document.getElementById('app');
    var mess = document.getElementById('mess');
    var body = document.getElementsByTagName('body');
    body[0].style.backgroundColor = '#E57373';
    app.classList.add('hide');
    mess.classList.remove('hide');
    audio.play();
  }

  // draw flame
  updateParticles();
  // draw base
  base.update();

};

// Initial particle generation
for (let i = 0; i < MAX_PART_COUNT; i++)
  particles.push(new FlameParticle());

// Interval to recover flames if smothered
setInterval(() => {
  if (particleCount < MAX_PART_COUNT)
    particleCount += REIGNITE_RATE;
}, 200);


animate();