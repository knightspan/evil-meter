import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Tone from 'tone';

// ============================================
// SOUND ENGINE - Punchy & Satisfying
// ============================================
const Sound = {
  ready: false,
  synths: {},
  
  async init() {
    if (this.ready) return;
    await Tone.start();
    
    // Punchy launch
    this.synths.launch = new Tone.MembraneSynth({
      pitchDecay: 0.02, octaves: 2,
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
    }).toDestination();
    this.synths.launch.volume.value = -5;
    
    // Satisfying hit - changes with combo
    this.synths.hit = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
    }).toDestination();
    
    // Combo chime - ascending
    this.synths.combo = new Tone.PolySynth(Tone.Synth).toDestination();
    this.synths.combo.volume.value = -8;
    
    // Miss - sad trombone vibe
    this.synths.miss = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0, release: 0.2 }
    }).toDestination();
    this.synths.miss.volume.value = -10;
    
    // Timer tick
    this.synths.tick = new Tone.MetalSynth({
      envelope: { attack: 0.001, decay: 0.02, release: 0.01 }
    }).toDestination();
    this.synths.tick.volume.value = -25;
    
    // Big hit for tier 3
    this.synths.bigHit = new Tone.MembraneSynth().toDestination();
    this.synths.bigHit.volume.value = -3;

    this.ready = true;
  },
  
  launch() { 
    if (!this.ready) return;
    this.synths.launch.triggerAttackRelease('G2', '16n'); 
  },
  
  hit(combo, tier) { 
    if (!this.ready) return;
    const note = ['C4', 'E4', 'G4', 'C5', 'E5', 'G5'][Math.min(combo, 5)];
    this.synths.hit.triggerAttackRelease(note, '16n');
    if (tier === 3) this.synths.bigHit.triggerAttackRelease('C2', '8n');
  },
  
  combo(level) {
    if (!this.ready) return;
    const chords = [['C4','E4'],['E4','G4'],['G4','C5'],['C5','E5'],['E5','G5']];
    this.synths.combo.triggerAttackRelease(chords[Math.min(level-1, 4)], '16n');
  },
  
  miss() { 
    if (!this.ready) return;
    this.synths.miss.triggerAttackRelease('C2', '8n'); 
  },
  
  tick() { 
    if (!this.ready) return;
    this.synths.tick.triggerAttackRelease('C6', '32n'); 
  },
  
  victory() {
    if (!this.ready) return;
    const now = Tone.now();
    this.synths.combo.triggerAttackRelease(['C4','E4','G4'], '8n', now);
    this.synths.combo.triggerAttackRelease(['E4','G4','C5'], '8n', now + 0.15);
    this.synths.combo.triggerAttackRelease(['G4','C5','E5'], '4n', now + 0.3);
  }
};

// ============================================
// HITLER FACE COMPONENT - Reactive & Animated
// ============================================
const HitlerFace = React.memo(({ level = 0, size = 100 }) => {
  // 0: Smirky, 1: Annoyed, 2: Worried, 3: Scared, 4: PANICKING
  const expressions = useMemo(() => [
    { eyeY: 0, browAngle: -5, mouthCurve: 8, pupilSize: 4, sweat: 0, blush: false },
    { eyeY: 0, browAngle: 0, mouthCurve: 2, pupilSize: 4, sweat: 0, blush: false },
    { eyeY: 1, browAngle: 8, mouthCurve: -2, pupilSize: 3.5, sweat: 1, blush: false },
    { eyeY: 2, browAngle: 15, mouthCurve: -5, pupilSize: 3, sweat: 2, blush: true },
    { eyeY: 3, browAngle: 25, mouthCurve: -10, pupilSize: 2.5, sweat: 3, blush: true, shake: true },
  ], []);
  
  const exp = expressions[Math.min(level, 4)];
  
  return (
    <svg 
      viewBox="0 0 100 120" 
      width={size} 
      height={size * 1.2}
      style={{ 
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
        animation: exp.shake ? 'faceShake 0.1s infinite' : 'none'
      }}
    >
      <defs>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFDCB5" />
          <stop offset="100%" stopColor="#E8BC98" />
        </linearGradient>
        <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4A3728" />
          <stop offset="100%" stopColor="#2D1F14" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      
      {/* Head */}
      <ellipse cx="50" cy="58" rx="38" ry="42" fill="url(#skinGrad)" />
      
      {/* Ears */}
      <ellipse cx="12" cy="60" rx="8" ry="12" fill="url(#skinGrad)" />
      <ellipse cx="88" cy="60" rx="8" ry="12" fill="url(#skinGrad)" />
      
      {/* Hair */}
      <path d="M12 42 Q25 15 50 12 Q75 15 88 42 L85 50 Q70 30 50 28 Q30 30 15 50 Z" fill="url(#hairGrad)" />
      <path d="M35 12 Q40 2 48 8 Q52 15 48 22 Q42 18 38 22 Q34 18 35 12" fill="url(#hairGrad)" />
      
      {/* Blush */}
      {exp.blush && (
        <>
          <ellipse cx="28" cy="68" rx="10" ry="5" fill="#E57373" opacity="0.5" />
          <ellipse cx="72" cy="68" rx="10" ry="5" fill="#E57373" opacity="0.5" />
        </>
      )}
      
      {/* Eyebrows */}
      <g transform={`rotate(${exp.browAngle}, 35, 45)`}>
        <path d="M22 45 Q30 40 42 44" fill="none" stroke="#3D2914" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g transform={`rotate(${-exp.browAngle}, 65, 45)`}>
        <path d="M58 44 Q70 40 78 45" fill="none" stroke="#3D2914" strokeWidth="4" strokeLinecap="round" />
      </g>
      
      {/* Eyes */}
      <ellipse cx="35" cy={55 + exp.eyeY} rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
      <ellipse cx="65" cy={55 + exp.eyeY} rx="10" ry="12" fill="white" stroke="#333" strokeWidth="1.5" />
      
      {/* Pupils */}
      <circle cx="35" cy={55 + exp.eyeY} r={exp.pupilSize} fill="#2D2D2D" />
      <circle cx="65" cy={55 + exp.eyeY} r={exp.pupilSize} fill="#2D2D2D" />
      <circle cx="33" cy={53 + exp.eyeY} r="2" fill="white" />
      <circle cx="63" cy={53 + exp.eyeY} r="2" fill="white" />
      
      {/* Nose */}
      <ellipse cx="50" cy="72" rx="8" ry="10" fill="#EABA90" />
      <ellipse cx="46" cy="76" rx="2.5" ry="2" fill="#D4A57B" />
      <ellipse cx="54" cy="76" rx="2.5" ry="2" fill="#D4A57B" />
      
      {/* Mustache */}
      <rect x="40" y="80" width="20" height="8" rx="2" fill="#2D1F14" />
      
      {/* Mouth */}
      <path 
        d={`M35 95 Q50 ${95 + exp.mouthCurve} 65 95`} 
        fill={exp.mouthCurve < -5 ? "#8B0000" : "none"} 
        stroke="#8B5A5A" 
        strokeWidth="3" 
        strokeLinecap="round"
      />
      {exp.mouthCurve < -5 && (
        <ellipse cx="50" cy="100" rx="8" ry="4" fill="#5a2020" />
      )}
      
      {/* Sweat drops */}
      {exp.sweat >= 1 && (
        <ellipse cx="85" cy="40" rx="4" ry="6" fill="#87CEEB" opacity="0.9">
          <animate attributeName="cy" values="40;50;40" dur="0.7s" repeatCount="indefinite" />
        </ellipse>
      )}
      {exp.sweat >= 2 && (
        <ellipse cx="15" cy="45" rx="3" ry="5" fill="#87CEEB" opacity="0.9">
          <animate attributeName="cy" values="45;55;45" dur="0.9s" repeatCount="indefinite" />
        </ellipse>
      )}
      {exp.sweat >= 3 && (
        <ellipse cx="90" cy="60" rx="3" ry="4" fill="#87CEEB" opacity="0.8">
          <animate attributeName="cy" values="60;70;60" dur="0.6s" repeatCount="indefinite" />
        </ellipse>
      )}
      
      {/* Collar */}
      <path d="M30 115 Q50 108 70 115" fill="none" stroke="#5D4E37" strokeWidth="4" />
    </svg>
  );
});

// ============================================
// 60 SUPER RELATABLE SINS
// ============================================
const SINS = [
  // Social Media (Tier 1-2)
  { t: "Stalked ex at 2am", e: "🌙", p: 120, tier: 1 },
  { t: "Liked 47-week old pic", e: "💀", p: 220, tier: 2 },
  { t: "Screenshot to gc", e: "📸", p: 160, tier: 2 },
  { t: "Posted breakup thirst trap", e: "🔥", p: 180, tier: 2 },
  { t: "Watched story, no reply", e: "👁️", p: 130, tier: 1 },
  { t: "Subtweeted someone", e: "🐦", p: 110, tier: 1 },
  
  // Texting Crimes
  { t: "'OMW' still in bed", e: "🛏️", p: 90, tier: 1 },
  { t: "'Just saw this' (lying)", e: "👀", p: 100, tier: 1 },
  { t: "Left on read 3 days", e: "✓✓", p: 150, tier: 2 },
  { t: "Replied 'K' to essay", e: "💬", p: 120, tier: 1 },
  { t: "2min voice message", e: "🎙️", p: 170, tier: 2 },
  { t: "Wrong chat risky text", e: "😱", p: 280, tier: 3 },
  
  // Food Crimes
  { t: "Ate LABELED food", e: "🍕", p: 200, tier: 2 },
  { t: "'One fry' took 15", e: "🍟", p: 80, tier: 1 },
  { t: "FISH IN MICROWAVE", e: "🐟", p: 400, tier: 3 },
  { t: "Finished ice cream secretly", e: "🍦", p: 150, tier: 2 },
  { t: "'Not hungry' ate half", e: "😋", p: 130, tier: 1 },
  { t: "Double dipped twice", e: "🥨", p: 100, tier: 1 },
  { t: "Empty box in cabinet", e: "📦", p: 140, tier: 2 },
  { t: "Last slice no asking", e: "🍰", p: 110, tier: 1 },
  
  // Work Chaos
  { t: "Reply-all disaster", e: "📧", p: 300, tier: 3 },
  { t: "'Per my last email'", e: "✍️", p: 160, tier: 2 },
  { t: "Took credit in meeting", e: "🏆", p: 350, tier: 3 },
  { t: "4:30pm Friday meeting", e: "📅", p: 250, tier: 2 },
  { t: "Unmuted while roasting", e: "🎤", p: 320, tier: 3 },
  { t: "'Let's circle back' never", e: "🔄", p: 90, tier: 1 },
  { t: "Blamed wifi for cam off", e: "📶", p: 80, tier: 1 },
  
  // Relationship Sins
  { t: "Checked their phone", e: "📱", p: 380, tier: 3 },
  { t: "'I'm fine' (not fine)", e: "🙂", p: 70, tier: 1 },
  { t: "Kept the hoodie", e: "🧥", p: 120, tier: 1 },
  { t: "Revenge Spotify playlist", e: "🎵", p: 190, tier: 2 },
  { t: "Ghosted after date 3", e: "👻", p: 220, tier: 2 },
  { t: "Deleted Netflix profile", e: "📺", p: 300, tier: 3 },
  { t: "Weaponized 'whatever'", e: "💅", p: 130, tier: 1 },
  { t: "Still follows ex's mom", e: "👀", p: 160, tier: 2 },
  
  // Public Menace
  { t: "Reclined full flight", e: "✈️", p: 200, tier: 2 },
  { t: "Both armrests taken", e: "💺", p: 150, tier: 2 },
  { t: "Cart in parking spot", e: "🛒", p: 180, tier: 2 },
  { t: "Slow walked middle", e: "🚶", p: 140, tier: 1 },
  { t: "Speakerphone public", e: "🔈", p: 210, tier: 2 },
  { t: "No wave in traffic", e: "🚗", p: 170, tier: 2 },
  { t: "Parked over the line", e: "🅿️", p: 160, tier: 2 },
  { t: "Elevator close spam", e: "🛗", p: 100, tier: 1 },
  
  // Friend Crimes
  { t: "'Let's hang!' (never)", e: "🤝", p: 120, tier: 1 },
  { t: "Cancelled last minute", e: "❌", p: 150, tier: 2 },
  { t: "One-upped their story", e: "☝️", p: 130, tier: 1 },
  { t: "Pretended not to see", e: "🙈", p: 90, tier: 1 },
  { t: "Spinach teeth silence", e: "🥬", p: 110, tier: 1 },
  
  // Internet Chaos
  { t: "SPOILED ENDING", e: "💀", p: 450, tier: 3 },
  { t: "Grammar in argument", e: "🤓", p: 110, tier: 1 },
  { t: "'Well actually' wrong", e: "🤡", p: 140, tier: 1 },
  { t: "6 streaming passwords", e: "🔑", p: 160, tier: 2 },
  { t: "47 concert videos", e: "🎸", p: 150, tier: 2 },
  { t: "Shared without reading", e: "📰", p: 90, tier: 1 },
  
  // Chaotic Neutral
  { t: "Blamed dog (no dog)", e: "🐕", p: 130, tier: 1 },
  { t: "'You too' at movies", e: "🎬", p: 70, tier: 1 },
  { t: "Fake laugh boss joke", e: "😆", p: 80, tier: 1 },
  { t: "Hotel toiletries hoarded", e: "🧴", p: 60, tier: 1 },
  { t: "Pocketed work pens", e: "🖊️", p: 50, tier: 1 },
];

// ============================================
// VILLAIN TIERS
// ============================================
const VILLAINS = [
  { name: "GOLDEN RETRIEVER", min: 0, desc: "You return shopping carts AND say thank you to Alexa", emoji: "🐕" },
  { name: "YOUR GRANDMA", min: 500, desc: "Suspiciously nice. What's behind those cookies?", emoji: "👵" },
  { name: "A SEAGULL", min: 1200, desc: "Chaotic fry thief energy", emoji: "🦅" },
  { name: "THAT COWORKER", min: 2000, desc: "HR has a whole folder on you", emoji: "💼" },
  { name: "YOUR EX", min: 3200, desc: "Emotional damage: DEALT", emoji: "💔" },
  { name: "DMV EMPLOYEE", min: 4500, desc: "You enjoy watching people suffer", emoji: "🏛️" },
  { name: "VLAD THE IMPALER", min: 6000, desc: "Medieval levels of chaos", emoji: "🧛" },
  { name: "GENGHIS KHAN", min: 8000, desc: "You didn't just take the pizza, you conquered the pizzeria", emoji: "⚔️" },
  { name: "LITERALLY SATAN", min: 10000, desc: "Even your therapist has a therapist", emoji: "😈" },
];

// ============================================
// MAIN GAME COMPONENT
// ============================================
export default function EvilMeter() {
  const [stage, setStage] = useState('landing'); // landing, countdown, playing, result
  const stageRef = useRef('landing'); // Fix for black screen bug
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(40);
  const [countdown, setCountdown] = useState(3);
  const [hits, setHits] = useState([]);
  const [totalShots, setTotalShots] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem('evilMeterHighScore') || '0'); } 
    catch { return 0; }
  });
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(null);
  
  const gameRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const stateRef = useRef({
    targets: [],
    projectiles: [],
    particles: [],
    textParticles: [],
    slingshot: { x: 80, y: 400 },
    drag: { active: false, x: 0, y: 0 },
    sinIndex: 0,
    lastSpawn: 0,
    combo: 0,
    score: 0,
  });
  
  const shuffledSins = useMemo(() => [...SINS].sort(() => Math.random() - 0.5), []);
  
  // Keep stageRef in sync (fixes black screen bug)
  useEffect(() => { stageRef.current = stage; }, [stage]);
  
  const getVillain = useCallback((pts) => {
    for (let i = VILLAINS.length - 1; i >= 0; i--) {
      if (pts >= VILLAINS[i].min) return VILLAINS[i];
    }
    return VILLAINS[0];
  }, []);

  // ========== GAME LOOP ==========
  const gameLoop = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const state = stateRef.current;
    if (!ctx || stageRef.current !== 'playing') return;

    // Clear
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid background
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
    
    // Spawn targets
    if (timestamp - state.lastSpawn > 850) {
      const sin = shuffledSins[state.sinIndex % shuffledSins.length];
      state.sinIndex++;
      state.targets.push({
        id: Date.now(),
        ...sin,
        x: canvas.width + 60,
        y: 80 + Math.random() * (canvas.height - 200),
        vx: -2.8 - Math.random() * 1.2,
        scale: 1,
        hit: false,
        angle: 0,
      });
      state.lastSpawn = timestamp;
    }

    // Update & Draw targets
    state.targets = state.targets.filter(t => {
      t.x += t.vx;
      t.angle = Math.sin(timestamp / 300 + t.id) * 0.08;
      
      if (t.x < -100) return false;
      
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.angle);
      
      // Card
      const w = 100, h = 70;
      ctx.shadowColor = t.tier === 3 ? '#FFD700' : t.tier === 2 ? '#E63946' : '#000';
      ctx.shadowBlur = t.tier === 3 ? 20 : t.tier === 2 ? 12 : 8;
      
      // Background
      const gradient = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
      if (t.tier === 3) {
        gradient.addColorStop(0, '#3d2010');
        gradient.addColorStop(1, '#1a0a05');
      } else if (t.tier === 2) {
        gradient.addColorStop(0, '#2a1515');
        gradient.addColorStop(1, '#150a0a');
      } else {
        gradient.addColorStop(0, '#1f1f1f');
        gradient.addColorStop(1, '#0f0f0f');
      }
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(-w/2, -h/2, w, h, 12);
      ctx.fill();
      
      // Border
      ctx.strokeStyle = t.tier === 3 ? '#FFD700' : t.tier === 2 ? '#E63946' : '#333';
      ctx.lineWidth = t.tier === 3 ? 3 : 2;
      ctx.stroke();
      
      ctx.shadowBlur = 0;
      
      // Emoji
      ctx.font = '32px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(t.e, 0, -10);
      
      // Text
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.fillStyle = '#fff';
      ctx.fillText(t.t, 0, 16);
      
      // Points
      ctx.font = 'bold 12px system-ui, sans-serif';
      ctx.fillStyle = t.tier === 3 ? '#FFD700' : t.tier === 2 ? '#E63946' : '#666';
      ctx.fillText(`+${t.p}`, 0, 30);
      
      ctx.restore();
      return true;
    });

    // Update & Draw projectiles
    state.projectiles = state.projectiles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4;
      p.rot += 0.15;
      
      if (p.x > canvas.width + 50 || p.y > canvas.height + 50) {
        if (state.combo > 0) {
          Sound.miss();
          state.combo = 0;
          setCombo(0);
        }
        return false;
      }
      
      // Check collision
      for (let i = state.targets.length - 1; i >= 0; i--) {
        const t = state.targets[i];
        if (Math.hypot(p.x - t.x, p.y - t.y) < 50) {
          // HIT!
          state.combo++;
          const mult = 1 + (state.combo - 1) * 0.3;
          const pts = Math.floor(t.p * mult);
          state.score += pts;
          
          setScore(s => s + pts);
          setCombo(state.combo);
          setMaxCombo(m => Math.max(m, state.combo));
          setHits(h => [...h, { e: t.e, p: pts, tier: t.tier }]);
          
          Sound.hit(state.combo, t.tier);
          if (state.combo > 1) Sound.combo(state.combo);
          
          // Screen effects
          if (t.tier === 3) {
            setShake(true);
            setFlash('gold');
            setTimeout(() => { setShake(false); setFlash(null); }, 150);
          } else if (t.tier === 2) {
            setShake(true);
            setTimeout(() => setShake(false), 80);
          }
          
          // Particles
          const colors = t.tier === 3 ? ['#FFD700', '#FFA500', '#FF6B35'] : 
                         t.tier === 2 ? ['#E63946', '#FF6B6B', '#FFF'] : 
                         ['#666', '#888', '#AAA'];
          for (let j = 0; j < (t.tier === 3 ? 16 : 10); j++) {
            const ang = (j / (t.tier === 3 ? 16 : 10)) * Math.PI * 2;
            const spd = 4 + Math.random() * 5;
            state.particles.push({
              x: t.x, y: t.y,
              vx: Math.cos(ang) * spd,
              vy: Math.sin(ang) * spd - 2,
              life: 40,
              color: colors[j % colors.length],
              size: 4 + Math.random() * 4,
            });
          }
          
          // Points text
          state.textParticles.push({
            x: t.x, y: t.y - 30,
            text: `+${pts}`,
            life: 50,
            color: t.tier === 3 ? '#FFD700' : t.tier === 2 ? '#E63946' : '#FFF',
            size: t.tier === 3 ? 28 : 22,
          });
          
          // Combo text
          if (state.combo > 1) {
            state.textParticles.push({
              x: t.x, y: t.y - 55,
              text: `${state.combo}x COMBO!`,
              life: 40,
              color: '#00FF88',
              size: 16,
            });
          }
          
          // Emoji burst
          state.particles.push({
            x: t.x, y: t.y,
            vx: (Math.random() - 0.5) * 6,
            vy: -6 - Math.random() * 3,
            life: 50,
            emoji: t.e,
            size: 36,
          });
          
          state.targets.splice(i, 1);
          return false;
        }
      }
      
      // Draw projectile (skull)
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      
      // Glow
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 15;
      
      // Skull shape
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.ellipse(0, -4, 16, 13, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-10, 6, 20, 12);
      
      // Eyes
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.ellipse(-5, -4, 5, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(5, -4, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Red glow in eyes
      ctx.fillStyle = '#E63946';
      ctx.beginPath();
      ctx.arc(-5, -5, 2, 0, Math.PI * 2);
      ctx.arc(5, -5, 2, 0, Math.PI * 2);
      ctx.fill();
      
      // Teeth
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-6, 10, 3, 6);
      ctx.fillRect(-1, 10, 3, 6);
      ctx.fillRect(4, 10, 3, 6);
      
      ctx.restore();
      return true;
    });

    // Update & Draw particles
    state.particles = state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
      
      if (p.life <= 0) return false;
      
      ctx.globalAlpha = p.life / 40;
      
      if (p.emoji) {
        ctx.font = `${p.size}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, p.x, p.y);
      } else {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / 40), 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      return true;
    });

    // Update & Draw text particles
    state.textParticles = state.textParticles.filter(p => {
      p.y -= 1.5;
      p.life--;
      
      if (p.life <= 0) return false;
      
      ctx.globalAlpha = Math.min(1, p.life / 20);
      ctx.font = `bold ${p.size}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = p.color;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 3;
      ctx.strokeText(p.text, p.x, p.y);
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
      
      return true;
    });

    // Draw slingshot
    const sp = state.slingshot;
    const drag = state.drag;
    
    // Slingshot frame
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 10;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sp.x - 18, sp.y - 50);
    ctx.lineTo(sp.x - 22, sp.y + 30);
    ctx.moveTo(sp.x + 18, sp.y - 50);
    ctx.lineTo(sp.x + 22, sp.y + 30);
    ctx.stroke();
    
    ctx.strokeStyle = '#A0522D';
    ctx.lineWidth = 6;
    ctx.stroke();
    
    // Elastic
    const skullX = drag.active ? drag.x : sp.x;
    const skullY = drag.active ? drag.y : sp.y - 60;
    
    ctx.strokeStyle = '#E63946';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sp.x - 18, sp.y - 50);
    ctx.lineTo(skullX, skullY);
    ctx.lineTo(sp.x + 18, sp.y - 50);
    ctx.stroke();
    
    // Trajectory preview
    if (drag.active) {
      const dx = sp.x - drag.x, dy = sp.y - drag.y;
      const power = Math.hypot(dx, dy) * 0.28;
      const angle = Math.atan2(dy, dx);
      
      ctx.globalAlpha = 0.4;
      let tx = sp.x, ty = sp.y - 60;
      let tvx = Math.cos(angle) * power, tvy = Math.sin(angle) * power;
      for (let i = 0; i < 10; i++) {
        tx += tvx * 3;
        ty += tvy * 3;
        tvy += 1.2;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(tx, ty, 4 - i * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      
      // Power indicator
      const pct = Math.min(100, Math.floor(power * 3));
      ctx.fillStyle = pct > 70 ? '#22c55e' : pct > 40 ? '#eab308' : '#ef4444';
      ctx.font = 'bold 16px system-ui, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${pct}%`, drag.x + 30, drag.y);
    }
    
    // Skull at slingshot
    ctx.save();
    ctx.translate(skullX, skullY);
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = drag.active ? 25 : 15;
    
    const scale = drag.active ? 1 + Math.hypot(sp.x - drag.x, sp.y - drag.y) * 0.002 : 1;
    ctx.scale(scale, scale);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(0, -4, 18, 15, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-12, 8, 24, 14);
    
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(-6, -4, 6, 7, 0, 0, Math.PI * 2);
    ctx.ellipse(6, -4, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#E63946';
    ctx.beginPath();
    ctx.arc(-6, -5, 2.5, 0, Math.PI * 2);
    ctx.arc(6, -5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-8, 12, 4, 8);
    ctx.fillRect(-2, 12, 4, 8);
    ctx.fillRect(4, 12, 4, 8);
    
    ctx.restore();

    rafRef.current = requestAnimationFrame(gameLoop);
  }, [shuffledSins]); // removed stage dep - using stageRef now

  // ========== EFFECTS ==========
  
  // Start game loop
  useEffect(() => {
    if (stage === 'playing') {
      const state = stateRef.current;
      state.targets = [];
      state.projectiles = [];
      state.particles = [];
      state.textParticles = [];
      state.sinIndex = 0;
      state.lastSpawn = 0;
      state.combo = 0;
      state.score = 0;
      rafRef.current = requestAnimationFrame(gameLoop);
    }
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
  }, [stage, gameLoop]);

  // Canvas setup & input
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = gameRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      stateRef.current.slingshot = { x: 90, y: canvas.height - 80 };
    };
    resize();
    window.addEventListener('resize', resize);

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const onStart = (e) => {
      if (stage !== 'playing') return;
      const pos = getPos(e);
      const sp = stateRef.current.slingshot;
      if (Math.hypot(pos.x - sp.x, pos.y - (sp.y - 60)) < 70) {
        stateRef.current.drag = { active: true, x: pos.x, y: pos.y };
      }
    };

    const onMove = (e) => {
      if (!stateRef.current.drag.active) return;
      e.preventDefault();
      const pos = getPos(e);
      const sp = stateRef.current.slingshot;
      const dx = pos.x - sp.x, dy = pos.y - sp.y;
      const dist = Math.hypot(dx, dy);
      const maxDist = 140;
      if (dist > maxDist) {
        pos.x = sp.x + (dx / dist) * maxDist;
        pos.y = sp.y + (dy / dist) * maxDist;
      }
      stateRef.current.drag.x = pos.x;
      stateRef.current.drag.y = pos.y;
    };

    const onEnd = () => {
      const state = stateRef.current;
      if (!state.drag.active) return;

      const sp = state.slingshot;
      const dx = sp.x - state.drag.x, dy = sp.y - state.drag.y;
      const power = Math.hypot(dx, dy) * 0.28;

      if (power > 5) {
        const angle = Math.atan2(dy, dx);
        state.projectiles.push({
          x: sp.x, y: sp.y - 60,
          vx: Math.cos(angle) * power,
          vy: Math.sin(angle) * power,
          rot: 0,
        });
        Sound.launch();
        setTotalShots(s => s + 1);
      }

      state.drag.active = false;
    };

    canvas.addEventListener('mousedown', onStart);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseup', onEnd);
    canvas.addEventListener('mouseleave', onEnd);
    canvas.addEventListener('touchstart', onStart, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    canvas.addEventListener('touchend', onEnd);

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousedown', onStart);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseup', onEnd);
      canvas.removeEventListener('mouseleave', onEnd);
      canvas.removeEventListener('touchstart', onStart);
      canvas.removeEventListener('touchmove', onMove);
      canvas.removeEventListener('touchend', onEnd);
    };
  }, [stage]);

  // Timer
  useEffect(() => {
    if (stage !== 'playing') return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 10 && t > 0) Sound.tick();
        if (t <= 1) {
          Sound.victory();
          // Save high score
          if (score > highScore) {
            setHighScore(score);
            try { localStorage.setItem('evilMeterHighScore', score.toString()); } catch {}
          }
          setStage('result');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, score, highScore]);

  // Countdown
  useEffect(() => {
    if (stage !== 'countdown') return;
    if (countdown > 0) {
      Sound.tick();
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    } else {
      setStage('playing');
    }
  }, [stage, countdown]);

  const startGame = async () => {
    await Sound.init();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setTimeLeft(40);
    setCountdown(3);
    setHits([]);
    setTotalShots(0);
    setStage('countdown');
  };

  // ========== SHARE FUNCTIONS ==========
  const getShareText = useCallback(() => {
    const v = getVillain(score);
    const pct = (score / 10000 * 100).toFixed(2);
    const acc = totalShots > 0 ? Math.round(hits.length / totalShots * 100) : 0;
    
    // Emoji grid (like Wordle)
    const grid = hits.slice(0, 10).map(h => 
      h.tier === 3 ? '🟨' : h.tier === 2 ? '🟥' : '⬜'
    ).join('');
    
    return `🔥 EVIL METER 🔥

${v.emoji} I'm ${pct}% as evil as Hitler
Level: ${v.name}

📊 Score: ${score.toLocaleString()}
🎯 Accuracy: ${acc}%
⚡ Max Combo: x${maxCombo}

${grid}

Think you're worse? 😈
#EvilMeter`;
  }, [score, hits, maxCombo, totalShots, getVillain]);

  const shareTwitter = () => {
    const text = encodeURIComponent(getShareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  const copyResult = () => {
    navigator.clipboard.writeText(getShareText());
  };

  const villain = getVillain(score);
  const hitlerLevel = score >= 8000 ? 4 : score >= 6000 ? 3 : score >= 4000 ? 2 : score >= 2000 ? 1 : 0;

  // ========== STYLES ==========
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Outfit:wght@400;600;700&display=swap');
    
    @keyframes faceShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-3px) rotate(-2deg); }
      75% { transform: translateX(3px) rotate(2deg); }
    }
    
    @keyframes pulse { 
      0%, 100% { transform: scale(1); } 
      50% { transform: scale(1.05); } 
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-10px); }
      40% { transform: translateX(10px); }
      60% { transform: translateX(-10px); }
      80% { transform: translateX(10px); }
    }
    
    .font-display { font-family: 'Bangers', cursive; letter-spacing: 1px; }
    .font-body { font-family: 'Outfit', sans-serif; }
    .animate-pulse { animation: pulse 2s ease-in-out infinite; }
    .animate-float { animation: float 3s ease-in-out infinite; }
    .animate-slideUp { animation: slideUp 0.5s ease-out forwards; }
    .animate-shake { animation: shake 0.15s ease-in-out; }
  `;

  // ========== LANDING ==========
  if (stage === 'landing') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        <style>{styles}</style>
        
        <div className="text-center w-full max-w-[340px] sm:max-w-md lg:max-w-lg">
          {/* Floating emojis */}
          <div className="flex justify-center gap-3 sm:gap-5 mb-2 sm:mb-4">
            {['🔥', '😈', '🔥'].map((e, i) => (
              <span key={i} className="text-xl sm:text-3xl animate-float" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
            ))}
          </div>
          
          <h1 className="text-3xl sm:text-5xl lg:text-6xl text-yellow-400 font-display mb-1 animate-pulse"
              style={{ textShadow: '0 0 25px rgba(250,204,21,0.5)' }}>
            EVIL METER
          </h1>
          
          <p className="text-zinc-400 font-body text-[10px] sm:text-sm mb-3 sm:mb-5">How evil are you compared to history's worst?</p>
          
          {/* Hitler face preview */}
          <div className="my-3 sm:my-6 relative">
            <HitlerFace level={0} size={70} />
            <p className="text-zinc-500 text-[9px] sm:text-xs mt-1.5 sm:mt-2 font-body">
              Can you wipe that smirk off his face?
            </p>
          </div>
          
          {/* Instructions */}
          <div className="bg-zinc-900/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-5 border border-zinc-800">
            <div className="flex items-center justify-center gap-4 sm:gap-8 text-[9px] sm:text-xs text-zinc-400 font-body">
              <div className="text-center">
                <span className="text-base sm:text-xl">🎯</span>
                <p>Slingshot</p>
              </div>
              <div className="text-center">
                <span className="text-base sm:text-xl">😈</span>
                <p>Hit sins</p>
              </div>
              <div className="text-center">
                <span className="text-base sm:text-xl">⚡</span>
                <p>Combos</p>
              </div>
            </div>
          </div>
          
          {/* High score */}
          {highScore > 0 && (
            <p className="text-zinc-600 text-[9px] sm:text-xs mb-2 sm:mb-3 font-body">
              🏆 Your best: {highScore.toLocaleString()}
            </p>
          )}
          
          <button 
            onClick={startGame}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 
                       text-white px-6 sm:px-10 py-2 sm:py-3 text-base sm:text-xl rounded-lg font-display
                       border-2 border-yellow-400 transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: '0 0 20px rgba(239,68,68,0.4), 0 3px 0 #b91c1c' }}
          >
            FIND OUT 🔥
          </button>
          
          <p className="text-zinc-700 text-[9px] sm:text-xs mt-3 sm:mt-4 font-body">🔊 Sound on</p>
        </div>
      </div>
    );
  }

  // ========== COUNTDOWN ==========
  if (stage === 'countdown') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <style>{styles}</style>
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4 font-body">GET READY!</p>
          <span className="text-9xl text-yellow-400 font-display animate-pulse"
                style={{ textShadow: '0 0 60px rgba(250,204,21,0.6)' }}>
            {countdown || '💀'}
          </span>
        </div>
      </div>
    );
  }

  // ========== PLAYING ==========
  if (stage === 'playing') {
    return (
      <div className={`h-screen bg-zinc-950 overflow-hidden select-none touch-none ${shake ? 'animate-shake' : ''}`}>
        <style>{styles}</style>
        
        {/* Flash overlay */}
        {flash && (
          <div className={`absolute inset-0 z-50 pointer-events-none transition-opacity duration-150
            ${flash === 'gold' ? 'bg-yellow-400' : 'bg-red-500'}`} 
            style={{ opacity: 0.3 }} 
          />
        )}
        
        {/* HUD */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none">
          <div>
            <p className="text-zinc-600 text-xs font-body">SCORE</p>
            <p className="text-3xl text-yellow-400 font-display">{score.toLocaleString()}</p>
          </div>
          
          <div className="text-center">
            {combo > 1 && (
              <div key={combo} className="animate-slideUp">
                <p className="text-4xl text-green-400 font-display" style={{ textShadow: '0 0 20px rgba(34,197,94,0.8)' }}>
                  x{combo}
                </p>
                <p className="text-zinc-500 text-xs font-body">COMBO!</p>
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-zinc-600 text-xs font-body">TIME</p>
            <p className={`text-3xl font-display ${timeLeft <= 10 ? 'text-red-500' : 'text-white'}`}
               style={{ textShadow: timeLeft <= 10 ? '0 0 20px rgba(239,68,68,0.8)' : 'none' }}>
              {timeLeft}s
            </p>
          </div>
        </div>

        {/* Mini Hitler - reacts to score */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-60">
          <HitlerFace level={hitlerLevel} size={50} />
        </div>

        {/* Canvas */}
        <div ref={gameRef} className="w-full h-full">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>
        
        {/* Bottom hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-zinc-600 text-xs font-body pointer-events-none">
          Drag skull • Release to launch • Hit YOUR sins!
        </div>
      </div>
    );
  }

  // ========== RESULTS ==========
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col p-2 sm:p-4 lg:p-6 overflow-auto">
      <style>{styles}</style>
      
      <div className="w-full max-w-[360px] sm:max-w-lg lg:max-w-xl mx-auto my-auto">
        {/* Celebration */}
        <div className="text-center mb-1 sm:mb-3 animate-slideUp">
          <div className="flex justify-center gap-1.5 sm:gap-3 text-lg sm:text-2xl lg:text-3xl">
            {['🔥', '😈', '💀', '😈', '🔥'].map((e, i) => (
              <span key={i} className="animate-float" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
            ))}
          </div>
          {score > highScore && score > 0 && (
            <p className="text-yellow-400 font-display text-xs sm:text-sm">🎉 NEW HIGH SCORE!</p>
          )}
        </div>

        {/* Main card */}
        <div className="bg-zinc-900 border-2 border-yellow-400 rounded-xl p-2.5 sm:p-4 lg:p-6 animate-slideUp"
             style={{ boxShadow: '0 0 25px rgba(250,204,21,0.15), 4px 4px 0 #E63946' }}>
          
          {/* Hitler face with message */}
          <div className="text-center mb-1.5 sm:mb-3">
            <div className="inline-block"><HitlerFace level={hitlerLevel} size={50} /></div>
            <div className="bg-white rounded-lg px-2 py-1 mt-1 mx-auto max-w-[160px] sm:max-w-[200px] relative">
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45" />
              <p className="text-zinc-800 font-body font-semibold text-[9px] sm:text-xs">
                {hitlerLevel === 0 && '"Pathetic. That\'s it?"'}
                {hitlerLevel === 1 && '"Hmm... not bad"'}
                {hitlerLevel === 2 && '"Wait, you\'re getting close..."'}
                {hitlerLevel === 3 && '"This is concerning!"'}
                {hitlerLevel === 4 && '"NEIN NEIN NEIN!"'}
              </p>
            </div>
          </div>

          {/* Percentage */}
          <div className="text-center mb-1.5 sm:mb-3">
            <p className="text-zinc-500 text-[9px] sm:text-xs font-body">You are</p>
            <p className="text-2xl sm:text-4xl lg:text-5xl font-display text-yellow-400" style={{ textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
              {(score / 10000 * 100).toFixed(2)}%
            </p>
            <p className="text-zinc-500 text-[9px] sm:text-xs font-body">as evil as Hitler</p>
          </div>

          {/* Progress bar */}
          <div className="mb-1.5 sm:mb-3">
            <div className="flex justify-between text-[8px] sm:text-[10px] text-zinc-600 mb-0.5 font-body">
              <span>😇 Angel</span>
              <span>Hitler 💀</span>
            </div>
            <div className="h-1.5 sm:h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-1000"
                style={{ 
                  width: `${Math.min(score / 10000 * 100, 100)}%`,
                  background: 'linear-gradient(90deg, #22c55e, #eab308, #ef4444)',
                }}
              />
            </div>
          </div>

          {/* Villain level */}
          <div className="bg-zinc-950/50 rounded-lg p-1.5 sm:p-2.5 mb-1.5 sm:mb-3 text-center">
            <p className="text-zinc-500 text-[8px] sm:text-[10px] font-body">YOUR EVIL LEVEL</p>
            <p className="text-sm sm:text-lg lg:text-xl font-display text-yellow-400">{villain.emoji} {villain.name}</p>
            <p className="text-zinc-400 text-[9px] sm:text-xs font-body">"{villain.desc}"</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1 sm:gap-2 mb-1.5 sm:mb-3">
            <div className="bg-zinc-950/50 rounded p-1 sm:p-2 text-center">
              <p className="text-yellow-400 text-sm sm:text-xl font-display">{score.toLocaleString()}</p>
              <p className="text-zinc-500 text-[7px] sm:text-[10px] font-body">Score</p>
            </div>
            <div className="bg-zinc-950/50 rounded p-1 sm:p-2 text-center">
              <p className="text-green-400 text-sm sm:text-xl font-display">x{maxCombo}</p>
              <p className="text-zinc-500 text-[7px] sm:text-[10px] font-body">Max Combo</p>
            </div>
            <div className="bg-zinc-950/50 rounded p-1 sm:p-2 text-center">
              <p className="text-white text-sm sm:text-xl font-display">
                {totalShots > 0 ? Math.round(hits.length / totalShots * 100) : 0}%
              </p>
              <p className="text-zinc-500 text-[7px] sm:text-[10px] font-body">Accuracy</p>
            </div>
          </div>

          {/* Sin grid */}
          {hits.length > 0 && (
            <div className="mb-1.5 sm:mb-3">
              <p className="text-zinc-600 text-[8px] sm:text-[10px] text-center mb-1 font-body">YOUR SINS</p>
              <div className="flex flex-wrap justify-center gap-0.5">
                {[...new Set(hits.map(h => h.e))].slice(0, 8).map((e, i) => (
                  <span key={i} className="text-xs sm:text-base bg-zinc-950/50 p-0.5 sm:p-1 rounded">{e}</span>
                ))}
              </div>
            </div>
          )}

          {/* Share buttons */}
          <div className="space-y-1 sm:space-y-2">
            <button 
              onClick={shareTwitter}
              className="w-full py-1.5 sm:py-2.5 bg-black border border-zinc-700 text-white rounded-lg 
                         hover:border-blue-400 transition-all flex items-center justify-center gap-1.5 sm:gap-2 font-body text-[10px] sm:text-sm"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span className="font-semibold">Share on X</span>
            </button>
            
            <div className="flex gap-1 sm:gap-2">
              <button 
                onClick={startGame}
                className="flex-1 py-1.5 sm:py-2.5 border-2 border-yellow-400 text-yellow-400 rounded-lg 
                           hover:bg-yellow-400 hover:text-black transition-all font-display text-xs sm:text-base"
              >
                AGAIN
              </button>
              <button 
                onClick={copyResult}
                className="flex-1 py-1.5 sm:py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all font-display text-xs sm:text-base"
              >
                COPY
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-700 text-[8px] sm:text-[10px] mt-1.5 sm:mt-3 font-body">
          Satire • Hitler was the worst • You're fine 🐟
        </p>
      </div>
    </div>
  );
}