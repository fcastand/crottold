// CROTTOQ Audio Module — Programmatic Web Audio Synthesizer
export const AudioSystem = {
  ctx: null,
  enabled: true,

  init() {
    // Lazy initialize audio context on first user click to bypass browser policies
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  toggle(btnElement) {
    this.enabled = !this.enabled;
    const icon = btnElement.querySelector('i');
    if (this.enabled) {
      icon.className = 'fa-solid fa-volume-high';
      btnElement.style.background = 'var(--primary-light)';
      btnElement.style.color = 'var(--primary-dark)';
      this.play('click');
    } else {
      icon.className = 'fa-solid fa-volume-xmark';
      btnElement.style.background = 'var(--light-border)';
      btnElement.style.color = 'var(--grey-text)';
    }
  },

  play(type) {
    if (!this.enabled) return;
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;
      switch (type) {
        case 'click': {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }
        case 'chime': { // Achievement / success chime
          const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);
            gain.gain.setValueAtTime(0.1, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.08 + 0.3);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.35);
          });
          break;
        }
        case 'warning': { // Warning buzzer
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(130, now);
          osc.frequency.setValueAtTime(110, now + 0.08);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.setValueAtTime(0.01, now + 0.25);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }
        case 'flush': { // Toilet flush sound effect synthesis
          // 1. Noise Node for water rushing
          const bufferSize = this.ctx.sampleRate * 1.5; // 1.5s
          const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          
          const noise = this.ctx.createBufferSource();
          noise.buffer = buffer;

          // Bandpass filter to make noise sound watery
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(600, now);
          filter.frequency.exponentialRampToValueAtTime(150, now + 1.2);
          filter.Q.value = 1.0;

          const noiseGain = this.ctx.createGain();
          noiseGain.gain.setValueAtTime(0.15, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1.4);

          noise.connect(filter);
          filter.connect(noiseGain);
          noiseGain.connect(this.ctx.destination);
          noise.start(now);
          noise.stop(now + 1.5);

          // 2. High bubbling frequency for completion splash
          const bubbleOsc = this.ctx.createOscillator();
          const bubbleGain = this.ctx.createGain();
          bubbleOsc.type = 'triangle';
          bubbleOsc.frequency.setValueAtTime(80, now + 0.5);
          bubbleOsc.frequency.exponentialRampToValueAtTime(350, now + 1.1);
          bubbleGain.gain.setValueAtTime(0.0, now + 0.5);
          bubbleGain.gain.linearRampToValueAtTime(0.08, now + 0.8);
          bubbleGain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

          bubbleOsc.connect(bubbleGain);
          bubbleGain.connect(this.ctx.destination);
          bubbleOsc.start(now + 0.5);
          bubbleOsc.stop(now + 1.3);
          break;
        }
        case 'fart': { // Cartoon fart sound synthesis
          const duration = 0.5; // 0.5 seconds
          
          // 1. Primary Buzzy Oscillator
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(110, now); // Low frequency
          
          // Frequency wobble (buzzy flutter) using LFO
          const lfo = this.ctx.createOscillator();
          const lfoGain = this.ctx.createGain();
          lfo.type = 'sawtooth';
          lfo.frequency.setValueAtTime(18, now); // 18Hz flutter
          lfoGain.gain.setValueAtTime(30, now); // Amplitude of pitch wobble
          
          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          
          // 2. Volume envelope (rough envelope, starts loud, dips, fades)
          gainNode.gain.setValueAtTime(0.001, now);
          gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
          gainNode.gain.linearRampToValueAtTime(0.1, now + 0.2);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
          
          // Filter to muffle high pitch harshness
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(450, now); // Bassy and muffled
          
          osc.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(this.ctx.destination);
          
          // Start oscillators
          osc.start(now);
          lfo.start(now);
          
          // Stop oscillators
          osc.stop(now + duration);
          lfo.stop(now + duration);
          break;
        }
        case 'lidClose': { // Toilet lid closing sound synthesis (Thump / Clack)
          // 1. High frequency plastic impact "Clack"
          const osc1 = this.ctx.createOscillator();
          const gain1 = this.ctx.createGain();
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(250, now);
          osc1.frequency.exponentialRampToValueAtTime(80, now + 0.08);
          
          gain1.gain.setValueAtTime(0.2, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          
          osc1.connect(gain1);
          gain1.connect(this.ctx.destination);
          osc1.start(now);
          osc1.stop(now + 0.09);

          // 2. Low resonance "Thud" of the toilet bowl
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(90, now + 0.01);
          osc2.frequency.linearRampToValueAtTime(45, now + 0.25);
          
          gain2.gain.setValueAtTime(0.3, now + 0.01);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
          
          // Lowpass filter to make it sound hollow and muffled
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(120, now);
          
          osc2.connect(filter);
          filter.connect(gain2);
          gain2.connect(this.ctx.destination);
          
          osc2.start(now + 0.01);
          osc2.stop(now + 0.26);
          break;
        }
      }
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }
};
