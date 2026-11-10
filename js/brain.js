/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   Data Brain / Procedural Canvas Visualization

   Concept:
   - Organic brain silhouette
   - Statistical/data-science modules inside the brain
   - Neural background network
   - Fast synaptic pulses + micro sparks
   - Ambient depth particles
   - Mouse interaction
   - Responsive density
   - Dark / Light theme integration
   ========================================================= */

(() => {
  "use strict";

  /* =======================================================
     01. CANVAS
     ======================================================= */

  const canvas = document.querySelector("#brain-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const root = document.documentElement;

  /* =======================================================
     02. ACCESSIBILITY / DEVICE
     ======================================================= */

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const touchDevice = window.matchMedia(
    "(hover: none)"
  ).matches;

  /* =======================================================
     03. CONFIGURATION
     ======================================================= */

  const CONFIG = {
    desktop: {
      nodes: 210,
      maxNeighbors: 4,
      connectionDistance: 0.235,
      ambientParticles: 30
    },

    tablet: {
      nodes: 138,
      maxNeighbors: 4,
      connectionDistance: 0.275,
      ambientParticles: 18
    },

    mobile: {
      nodes: 82,
      maxNeighbors: 3,
      connectionDistance: 0.32,
      ambientParticles: 10
    },

    nodeMinRadius: 0.95,
    nodeMaxRadius: 2.15,

    mouseRadius: 155,

    /* Pulsos rápidos, pero sin convertirse en ruido */
    pulseInterval: 115,
    pulseMinSpeed: 1.15,
    pulseMaxSpeed: 1.85,
    maxPulses: 18,

    sparkCountMin: 2,
    sparkCountMax: 5,

    idleAmplitude: 1.25,

    parallaxX: 9,
    parallaxY: 5,

    seed: 20260815
  };

  /* =======================================================
     04. INTERNAL DATA-SCIENCE MODULE LAYOUT

     Coordinates are relative to brainWidth / brainHeight.
     ======================================================= */

  const MODULES = {
    distribution: {
      x: -0.22,
      y: -0.23,
      w: 0.20,
      h: 0.16
    },

    regression: {
      x: -0.30,
      y: 0.05,
      w: 0.24,
      h: 0.18
    },

    timeSeries: {
      x: -0.07,
      y: 0.25,
      w: 0.27,
      h: 0.12
    },

    heatmap: {
      x: 0.23,
      y: 0.13,
      w: 0.17,
      h: 0.16
    },

    network: {
      x: 0.23,
      y: -0.20,
      w: 0.20,
      h: 0.17
    }
  };

  /* =======================================================
     05. THEME / DESIGN SYSTEM
     ======================================================= */

  let THEME = {};

  const getCSSValue = (variable, fallback = "") => {
    const value = getComputedStyle(root)
      .getPropertyValue(variable)
      .trim();

    return value || fallback;
  };

  const getCSSNumber = (variable, fallback = 0) => {
    const value = Number.parseFloat(getCSSValue(variable));
    return Number.isFinite(value) ? value : fallback;
  };

  const withAlpha = (color, alpha) => {
    if (!color) {
      return `rgba(255,255,255,${alpha})`;
    }

    if (color.startsWith("#")) {
      let hex = color.slice(1);

      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((char) => char + char)
          .join("");
      }

      if (hex.length === 6) {
        const red = Number.parseInt(hex.slice(0, 2), 16);
        const green = Number.parseInt(hex.slice(2, 4), 16);
        const blue = Number.parseInt(hex.slice(4, 6), 16);

        return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
      }
    }

    const numbers = color.match(/[\d.]+/g);

    if (numbers && numbers.length >= 3) {
      return `rgba(${numbers[0]}, ${numbers[1]}, ${numbers[2]}, ${alpha})`;
    }

    return color;
  };

  const refreshTheme = () => {
    THEME = {
      isLight: root.dataset.theme === "light",

      purple: getCSSValue("--color-primary-light", "#9b6dff"),
      purpleDark: getCSSValue("--color-primary", "#723ec3"),
      blue: getCSSValue("--color-blue", "#5e8cff"),
      blueLight: getCSSValue("--color-blue-light", "#8aa9ff"),

      brainBackground: getCSSValue(
        "--brain-background",
        "rgba(16,17,31,0.70)"
      ),

      brainCenter: getCSSValue(
        "--brain-background-center",
        "rgba(33,28,65,0.88)"
      ),

      outline: getCSSValue(
        "--brain-outline",
        "rgba(155,109,255,0.15)"
      ),

      foldPurple: getCSSValue(
        "--brain-fold-purple",
        "rgba(155,109,255,0.11)"
      ),

      foldBlue: getCSSValue(
        "--brain-fold-blue",
        "rgba(94,140,255,0.10)"
      ),

      edgeAlpha: getCSSNumber("--brain-edge-alpha", 0.07),
      nodeCore: getCSSValue("--brain-node-core", "#ffffff"),

      ambientPrimary: getCSSValue(
        "--brain-ambient-primary",
        "rgba(155,109,255,0.13)"
      ),

      ambientSecondary: getCSSValue(
        "--brain-ambient-secondary",
        "rgba(94,140,255,0.055)"
      ),

      moduleBg: getCSSValue(
        "--brain-module-bg",
        "rgba(10,10,18,0.24)"
      ),

      moduleBorder: getCSSValue(
        "--brain-module-border",
        "rgba(155,109,255,0.20)"
      ),

      moduleGrid: getCSSValue(
        "--brain-module-grid",
        "rgba(155,109,255,0.08)"
      ),

      chartLine: getCSSValue("--brain-chart-line", "#7bb0ff"),
      chartLine2: getCSSValue("--brain-chart-line-2", "#b275ff"),
      chartPoint: getCSSValue("--brain-chart-point", "#69a9ff"),
      chartPoint2: getCSSValue("--brain-chart-point-2", "#bb86ff"),
      histBar: getCSSValue("--brain-hist-bar", "rgba(114,62,195,0.60)"),

      heatA: getCSSValue("--brain-heat-a", "#2d3f87"),
      heatB: getCSSValue("--brain-heat-b", "#4f4fcd"),
      heatC: getCSSValue("--brain-heat-c", "#8c4cff"),
      heatD: getCSSValue("--brain-heat-d", "#ff6bd7"),

      networkLine: getCSSValue(
        "--brain-network-line",
        "rgba(122,187,255,0.35)"
      ),

      networkNode: getCSSValue("--brain-network-node", "#86b6ff"),

      glowStrong: getCSSValue(
        "--brain-glow-strong",
        "rgba(155,109,255,0.35)"
      ),

      glowSoft: getCSSValue(
        "--brain-glow-soft",
        "rgba(94,140,255,0.18)"
      )
    };
  };

  refreshTheme();

  /* =======================================================
     06. GLOBAL STATE
     ======================================================= */

  let width = 0;
  let height = 0;
  let dpr = 1;

  let centerX = 0;
  let centerY = 0;

  let brainWidth = 0;
  let brainHeight = 0;

  let nodes = [];
  let edges = [];
  let pulses = [];
  let sparks = [];
  let ambientParticles = [];

  let animationFrame = null;
  let resizeFrame = null;

  let previousTime = performance.now();
  let lastPulseTime = 0;
  let pageVisible = !document.hidden;

  /* =======================================================
     07. POINTER STATE
     ======================================================= */

  const pointer = {
    active: false,
    x: 0,
    y: 0,
    normalizedX: 0,
    normalizedY: 0,
    offsetX: 0,
    offsetY: 0,
    targetOffsetX: 0,
    targetOffsetY: 0
  };

  /* =======================================================
     08. SEEDED RANDOM
     ======================================================= */

  const createRandom = (seed) => {
    let value = seed >>> 0;

    return () => {
      value += 0x6d2b79f5;

      let t = value;

      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  let random = createRandom(CONFIG.seed);

  const randomRange = (min, max) => {
    return min + random() * (max - min);
  };

  /* =======================================================
     09. RESPONSIVE PROFILE
     ======================================================= */

  const getProfile = () => {
    if (window.innerWidth <= 700) return CONFIG.mobile;
    if (window.innerWidth <= 1100) return CONFIG.tablet;
    return CONFIG.desktop;
  };

  /* =======================================================
     10. BRAIN GEOMETRY

     More organic than the previous symmetric cloud.
     The shape is intentionally anatomical-tech rather than
     medically exact.
     ======================================================= */

  const getBrainPath = (offsetX = pointer.offsetX, offsetY = pointer.offsetY) => {
    const x = centerX + offsetX;
    const y = centerY + offsetY;
    const w = brainWidth;
    const h = brainHeight;

    const path = new Path2D();

    path.moveTo(
      x - w * 0.46,
      y + h * 0.10
    );

    /* Frontal / upper-left contour */
    path.bezierCurveTo(
      x - w * 0.52,
      y - h * 0.03,
      x - w * 0.49,
      y - h * 0.22,
      x - w * 0.37,
      y - h * 0.29
    );

    path.bezierCurveTo(
      x - w * 0.34,
      y - h * 0.42,
      x - w * 0.18,
      y - h * 0.50,
      x - w * 0.05,
      y - h * 0.42
    );

    /* Superior / parietal */
    path.bezierCurveTo(
      x + w * 0.08,
      y - h * 0.50,
      x + w * 0.25,
      y - h * 0.46,
      x + w * 0.31,
      y - h * 0.34
    );

    /* Posterior */
    path.bezierCurveTo(
      x + w * 0.45,
      y - h * 0.33,
      x + w * 0.50,
      y - h * 0.15,
      x + w * 0.45,
      y - h * 0.04
    );

    path.bezierCurveTo(
      x + w * 0.53,
      y + h * 0.08,
      x + w * 0.47,
      y + h * 0.24,
      x + w * 0.34,
      y + h * 0.29
    );

    /* Inferior / temporal */
    path.bezierCurveTo(
      x + w * 0.30,
      y + h * 0.40,
      x + w * 0.15,
      y + h * 0.44,
      x + w * 0.04,
      y + h * 0.36
    );

    path.bezierCurveTo(
      x - w * 0.07,
      y + h * 0.44,
      x - w * 0.23,
      y + h * 0.39,
      x - w * 0.29,
      y + h * 0.29
    );

    path.bezierCurveTo(
      x - w * 0.42,
      y + h * 0.29,
      x - w * 0.50,
      y + h * 0.22,
      x - w * 0.46,
      y + h * 0.10
    );

    path.closePath();

    return path;
  };

  const isInsideBrain = (nx, ny) => {
    const path = getBrainPath(0, 0);

    const x = centerX + nx * brainWidth * 0.5;
    const y = centerY + ny * brainHeight * 0.5;

    return ctx.isPointInPath(path, x, y);
  };

  /* =======================================================
     11. MODULE EXCLUSION ZONES

     Keep the background network from obscuring charts.
     ======================================================= */

  const isInsideModuleZone = (nx, ny) => {
    const px = nx * 0.5;
    const py = ny * 0.5;

    return Object.values(MODULES).some((module) => {
      const paddingX = module.w * 0.42;
      const paddingY = module.h * 0.40;

      return (
        Math.abs(px - module.x) < paddingX &&
        Math.abs(py - module.y) < paddingY
      );
    });
  };

  /* =======================================================
     12. NEURAL NODE
     ======================================================= */

  class NeuralNode {
    constructor(nx, ny, index) {
      this.nx = nx;
      this.ny = ny;
      this.index = index;

      this.phase = randomRange(0, Math.PI * 2);
      this.speed = randomRange(0.45, 1.10);
      this.radius = randomRange(CONFIG.nodeMinRadius, CONFIG.nodeMaxRadius);
      this.depth = randomRange(0.55, 1.15);
      this.colorType = random() > 0.48 ? "purple" : "blue";

      this.x = 0;
      this.y = 0;
      this.brightness = 0;
    }

    update(time, mouseX, mouseY) {
      const baseX =
        centerX +
        pointer.offsetX +
        this.nx * brainWidth * 0.5;

      const baseY =
        centerY +
        pointer.offsetY +
        this.ny * brainHeight * 0.5;

      let idleX = 0;
      let idleY = 0;

      if (!reducedMotion) {
        idleX =
          Math.sin(time * 0.00058 * this.speed + this.phase) *
          CONFIG.idleAmplitude *
          this.depth;

        idleY =
          Math.cos(time * 0.00050 * this.speed + this.phase) *
          CONFIG.idleAmplitude *
          this.depth;
      }

      let interactionX = 0;
      let interactionY = 0;

      this.brightness = 0;

      if (pointer.active && !touchDevice && !reducedMotion) {
        const dx = baseX - mouseX;
        const dy = baseY - mouseY;
        const distance = Math.hypot(dx, dy);

        if (distance < CONFIG.mouseRadius) {
          const strength = 1 - distance / CONFIG.mouseRadius;
          const safeDistance = Math.max(distance, 1);

          interactionX = (dx / safeDistance) * strength * 6;
          interactionY = (dy / safeDistance) * strength * 6;
          this.brightness = strength;
        }
      }

      this.x = baseX + idleX + interactionX;
      this.y = baseY + idleY + interactionY;
    }
  }

  /* =======================================================
     13. CREATE NODES
     ======================================================= */

  const createNodes = () => {
    nodes = [];

    const profile = getProfile();
    random = createRandom(CONFIG.seed + profile.nodes);

    let attempts = 0;
    const maxAttempts = profile.nodes * 180;

    while (nodes.length < profile.nodes && attempts < maxAttempts) {
      attempts += 1;

      const nx = randomRange(-1, 1);
      const ny = randomRange(-0.92, 0.88);

      if (!isInsideBrain(nx, ny)) continue;
      if (isInsideModuleZone(nx, ny)) continue;

      const tooClose = nodes.some((node) => {
        const dx = node.nx - nx;
        const dy = node.ny - ny;
        return dx * dx + dy * dy < 0.0034;
      });

      if (tooClose) continue;

      nodes.push(new NeuralNode(nx, ny, nodes.length));
    }
  };

  /* =======================================================
     14. CREATE EDGES
     ======================================================= */

  const createEdges = () => {
    edges = [];

    const profile = getProfile();
    const created = new Set();

    nodes.forEach((node, nodeIndex) => {
      const neighbors = [];

      nodes.forEach((candidate, candidateIndex) => {
        if (candidateIndex === nodeIndex) return;

        const dx = node.nx - candidate.nx;
        const dy = (node.ny - candidate.ny) * 0.86;
        const distance = Math.hypot(dx, dy);

        if (distance <= profile.connectionDistance) {
          neighbors.push({
            index: candidateIndex,
            distance
          });
        }
      });

      neighbors.sort((a, b) => a.distance - b.distance);

      neighbors
        .slice(0, profile.maxNeighbors)
        .forEach((neighbor) => {
          const first = Math.min(nodeIndex, neighbor.index);
          const second = Math.max(nodeIndex, neighbor.index);
          const key = `${first}-${second}`;

          if (created.has(key)) return;

          created.add(key);

          edges.push({
            from: first,
            to: second,
            distance: neighbor.distance,
            phase: randomRange(0, Math.PI * 2)
          });
        });
    });
  };

  /* =======================================================
     15. AMBIENT PARTICLES
     ======================================================= */

  const createAmbientParticles = () => {
    ambientParticles = [];

    const count = getProfile().ambientParticles;

    for (let i = 0; i < count; i += 1) {
      const depth = randomRange(0.25, 1);
      const layer = random();

      let radius;

      if (layer < 0.18) {
        radius = randomRange(0.30, 0.46);
      } else if (layer < 0.84) {
        radius = randomRange(0.50, 0.72);
      } else {
        radius = randomRange(0.74, 0.90);
      }

      ambientParticles.push({
        angle: randomRange(0, Math.PI * 2),
        radius,
        orbitX: randomRange(0.88, 1.14),
        orbitY: randomRange(0.70, 1.02),
        direction: random() > 0.5 ? 1 : -1,

        speed:
          randomRange(0.000018, 0.000064) *
          (0.65 + depth * 0.55),

        radialAmplitude: randomRange(0.008, 0.030),
        radialSpeed: randomRange(0.00035, 0.0010),

        driftAmplitude: randomRange(1.5, 6),
        driftSpeed: randomRange(0.00025, 0.00075),

        phase: randomRange(0, Math.PI * 2),
        twinkleSpeed: randomRange(0.0007, 0.0018),

        depth,

        size:
          randomRange(0.4, 1.15) *
          (0.55 + depth * 0.55),

        colorType: random() > 0.52 ? "purple" : "blue",

        opacity:
          randomRange(0.05, 0.16) *
          (0.55 + depth * 0.45)
      });
    }
  };

  /* =======================================================
     16. SYNAPTIC PULSES
     ======================================================= */

  class NeuralPulse {
    constructor(edge) {
      this.edge = edge;
      this.progress = 0;
      this.speed = randomRange(CONFIG.pulseMinSpeed, CONFIG.pulseMaxSpeed);
      this.colorType = random() > 0.5 ? "purple" : "blue";
      this.life = 1;
      this.burstCreated = false;
    }

    update(deltaSeconds) {
      this.progress += deltaSeconds * this.speed;

      if (this.progress >= 1) {
        this.progress = 1;
        this.life = 0;
      }
    }
  }

  const createPulse = () => {
    if (!edges.length || pulses.length >= CONFIG.maxPulses) return;

    const edge = edges[Math.floor(random() * edges.length)];
    pulses.push(new NeuralPulse(edge));
  };

  /* =======================================================
     17. SYNAPTIC SPARKS
     ======================================================= */

  const createSynapticBurst = (node, colorType) => {
    if (!node) return;

    const count = Math.floor(
      randomRange(CONFIG.sparkCountMin, CONFIG.sparkCountMax + 1)
    );

    for (let i = 0; i < count; i += 1) {
      const angle = randomRange(0, Math.PI * 2);
      const speed = randomRange(12, 28);
      const life = randomRange(0.18, 0.42);

      sparks.push({
        x: node.x,
        y: node.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: randomRange(0.45, 1.15),
        colorType
      });
    }
  };

  /* =======================================================
     18. BRAIN GLOW / VOLUME
     ======================================================= */

  const drawBrainGlow = () => {
    const radius = Math.max(brainWidth, brainHeight) * 0.58;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    gradient.addColorStop(0, THEME.ambientPrimary);
    gradient.addColorStop(0.46, THEME.ambientSecondary);
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.ellipse(
      centerX,
      centerY,
      brainWidth * 0.58,
      brainHeight * 0.61,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();
  };

  const drawBrainVolume = () => {
    const x = centerX + pointer.offsetX;
    const y = centerY + pointer.offsetY;
    const path = getBrainPath();

    ctx.save();

    const gradient = ctx.createRadialGradient(
      x - brainWidth * 0.08,
      y - brainHeight * 0.08,
      brainWidth * 0.03,
      x,
      y,
      brainWidth * 0.55
    );

    gradient.addColorStop(0, THEME.brainCenter);
    gradient.addColorStop(0.62, THEME.brainBackground);
    gradient.addColorStop(
      1,
      withAlpha(THEME.purpleDark, THEME.isLight ? 0.025 : 0.055)
    );

    ctx.fillStyle = gradient;
    ctx.fill(path);

    ctx.restore();
  };

  /* =======================================================
     19. ORGANIC CORTICAL FOLDS
     ======================================================= */

  const drawCorticalFolds = (time) => {
    const x = centerX + pointer.offsetX;
    const y = centerY + pointer.offsetY;
    const w = brainWidth;
    const h = brainHeight;

    const drift = reducedMotion
      ? 0
      : Math.sin(time * 0.00035) * 1.2;

    const folds = [
      [-0.38, -0.17, -0.29, -0.28, -0.19, -0.26, -0.11, -0.18, "purple"],
      [-0.40,  0.02, -0.29, -0.08, -0.21,  0.05, -0.10, -0.02, "purple"],
      [-0.36,  0.18, -0.28,  0.10, -0.18,  0.21, -0.08,  0.14, "purple"],
      [-0.18, -0.35, -0.08, -0.29,  0.02, -0.36,  0.12, -0.28, "purple"],
      [-0.09, -0.10,  0.01, -0.17,  0.12, -0.05,  0.22, -0.12, "blue"],
      [-0.06,  0.09,  0.04,  0.01,  0.15,  0.15,  0.27,  0.05, "blue"],
      [ 0.12, -0.29,  0.20, -0.20,  0.32, -0.29,  0.39, -0.17, "blue"],
      [ 0.15,  0.20,  0.23,  0.12,  0.34,  0.22,  0.40,  0.12, "blue"],
      [-0.24,  0.31, -0.13,  0.24, -0.01,  0.34,  0.10,  0.27, "purple"],
      [ 0.08,  0.31,  0.18,  0.25,  0.27,  0.31,  0.33,  0.24, "blue"]
    ];

    ctx.save();
    ctx.clip(getBrainPath());

    folds.forEach((fold, index) => {
      const [sx, sy, c1x, c1y, c2x, c2y, ex, ey, type] = fold;

      ctx.beginPath();
      ctx.moveTo(x + sx * w, y + sy * h);
      ctx.bezierCurveTo(
        x + c1x * w,
        y + c1y * h + drift * (index % 2 === 0 ? 1 : -1),
        x + c2x * w,
        y + c2y * h - drift * 0.5,
        x + ex * w,
        y + ey * h
      );

      ctx.strokeStyle = type === "purple"
        ? THEME.foldPurple
        : THEME.foldBlue;

      ctx.lineWidth = THEME.isLight ? 1 : 0.82;
      ctx.stroke();
    });

    ctx.restore();
  };

  /* =======================================================
     20. BACKGROUND NEURAL NETWORK
     ======================================================= */

  const drawEdges = (time) => {
    ctx.save();

    ctx.globalCompositeOperation = THEME.isLight
      ? "source-over"
      : "lighter";

    edges.forEach((edge) => {
      const from = nodes[edge.from];
      const to = nodes[edge.to];

      if (!from || !to) return;

      const activity = (from.brightness + to.brightness) * 0.5;
      const breathing = reducedMotion
        ? 0
        : (Math.sin(time * 0.001 + edge.phase) + 1) * 0.008;

      const alpha = Math.min(
        THEME.isLight ? 0.22 : 0.20,
        THEME.edgeAlpha + breathing + activity * 0.16
      );

      const gradient = ctx.createLinearGradient(
        from.x,
        from.y,
        to.x,
        to.y
      );

      gradient.addColorStop(0, withAlpha(THEME.purple, alpha));
      gradient.addColorStop(1, withAlpha(THEME.blue, alpha));

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 0.45 + activity * 0.65;
      ctx.stroke();
    });

    ctx.restore();
  };

  const drawNode = (node, time) => {
    const color = node.colorType === "purple"
      ? THEME.purple
      : THEME.blueLight;

    const breathing = reducedMotion
      ? 0
      : (Math.sin(time * 0.00135 + node.phase) + 1) * 0.07;

    const intensity = Math.min(
      1,
      0.40 + breathing + node.brightness * 0.58
    );

    const radius =
      node.radius *
      node.depth *
      (1 + node.brightness * 0.32);

    const halo = ctx.createRadialGradient(
      node.x,
      node.y,
      0,
      node.x,
      node.y,
      radius * 6.5
    );

    halo.addColorStop(
      0,
      withAlpha(
        color,
        (THEME.isLight ? 0.10 : 0.17) * intensity
      )
    );

    halo.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius * 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.globalAlpha = intensity;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = THEME.isLight
      ? 4 + node.brightness * 5
      : 7 + node.brightness * 10;

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = THEME.nodeCore;
    ctx.globalAlpha = THEME.isLight ? 0.72 : 0.90;
    ctx.beginPath();
    ctx.arc(
      node.x,
      node.y,
      Math.max(0.4, radius * 0.34),
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  };

  /* =======================================================
     21. STATISTICAL / DATA-SCIENCE MODULES
     ======================================================= */

  const roundedRectPath = (x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    const path = new Path2D();

    path.moveTo(x + radius, y);
    path.lineTo(x + w - radius, y);
    path.quadraticCurveTo(x + w, y, x + w, y + radius);
    path.lineTo(x + w, y + h - radius);
    path.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    path.lineTo(x + radius, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - radius);
    path.lineTo(x, y + radius);
    path.quadraticCurveTo(x, y, x + radius, y);
    path.closePath();

    return path;
  };

  const getModuleRect = (module) => {
    return {
      cx: centerX + pointer.offsetX + module.x * brainWidth,
      cy: centerY + pointer.offsetY + module.y * brainHeight,
      w: module.w * brainWidth,
      h: module.h * brainHeight
    };
  };

  const drawModuleFrame = (cx, cy, w, h) => {
    const x = cx - w / 2;
    const y = cy - h / 2;
    const path = roundedRectPath(x, y, w, h, 9);

    ctx.save();

    ctx.fillStyle = THEME.moduleBg;
    ctx.strokeStyle = THEME.moduleBorder;
    ctx.lineWidth = 0.8;

    ctx.fill(path);
    ctx.stroke(path);

    ctx.strokeStyle = THEME.moduleGrid;
    ctx.lineWidth = 0.45;

    for (let i = 1; i < 4; i += 1) {
      const gx = x + (w / 4) * i;
      ctx.beginPath();
      ctx.moveTo(gx, y + 4);
      ctx.lineTo(gx, y + h - 4);
      ctx.stroke();
    }

    for (let i = 1; i < 3; i += 1) {
      const gy = y + (h / 3) * i;
      ctx.beginPath();
      ctx.moveTo(x + 4, gy);
      ctx.lineTo(x + w - 4, gy);
      ctx.stroke();
    }

    ctx.restore();
  };

  const drawDistributionModule = () => {
    const { cx, cy, w, h } = getModuleRect(MODULES.distribution);
    drawModuleFrame(cx, cy, w, h);

    const left = cx - w * 0.40;
    const right = cx + w * 0.40;
    const bottom = cy + h * 0.28;

    ctx.save();

    /* Tiny histogram */
    const bars = [0.18, 0.34, 0.55, 0.78, 0.52, 0.29, 0.16];
    const barWidth = (right - left) / bars.length;

    bars.forEach((value, index) => {
      ctx.fillStyle = withAlpha(THEME.purple, 0.22 + value * 0.25);
      ctx.fillRect(
        left + index * barWidth + 1,
        bottom - value * h * 0.45,
        Math.max(2, barWidth - 2),
        value * h * 0.45
      );
    });

    /* Distribution curve */
    ctx.beginPath();

    for (let i = 0; i <= 50; i += 1) {
      const t = i / 50;
      const px = left + t * (right - left);
      const sigma = 0.16;
      const gaussian = Math.exp(-((t - 0.52) ** 2) / (2 * sigma * sigma));
      const py = bottom - gaussian * h * 0.66;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.strokeStyle = THEME.chartLine2;
    ctx.lineWidth = 1.65;
    ctx.shadowColor = THEME.chartLine2;
    ctx.shadowBlur = THEME.isLight ? 3 : 7;
    ctx.stroke();

    ctx.restore();
  };

  const drawRegressionModule = () => {
    const { cx, cy, w, h } = getModuleRect(MODULES.regression);
    drawModuleFrame(cx, cy, w, h);

    ctx.save();

    for (let i = 0; i < 20; i += 1) {
      const t = i / 19;
      const px = cx - w * 0.40 + t * w * 0.80;
      const noise = Math.sin(i * 1.73) * h * 0.09 + Math.cos(i * 0.61) * h * 0.035;
      const py = cy + h * 0.26 - t * h * 0.50 + noise;

      ctx.fillStyle = i % 2 === 0
        ? THEME.chartPoint
        : THEME.chartPoint2;

      ctx.beginPath();
      ctx.arc(px, py, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    /* Regression band */
    ctx.fillStyle = withAlpha(THEME.chartLine2, THEME.isLight ? 0.08 : 0.12);
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.40, cy + h * 0.31);
    ctx.lineTo(cx + w * 0.40, cy - h * 0.22);
    ctx.lineTo(cx + w * 0.40, cy - h * 0.30);
    ctx.lineTo(cx - w * 0.40, cy + h * 0.23);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = THEME.chartLine2;
    ctx.lineWidth = 1.7;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.40, cy + h * 0.27);
    ctx.lineTo(cx + w * 0.40, cy - h * 0.26);
    ctx.stroke();

    ctx.restore();
  };

  const drawTimeSeriesModule = (time) => {
    const { cx, cy, w, h } = getModuleRect(MODULES.timeSeries);
    drawModuleFrame(cx, cy, w, h);

    ctx.save();
    ctx.strokeStyle = THEME.chartLine;
    ctx.lineWidth = 1.45;
    ctx.shadowColor = THEME.chartLine;
    ctx.shadowBlur = THEME.isLight ? 2 : 5;

    ctx.beginPath();

    for (let i = 0; i <= 65; i += 1) {
      const t = i / 65;
      const px = cx - w * 0.43 + t * w * 0.86;

      const wave =
        Math.sin(t * 9.2 + time * 0.0015) * 0.31 +
        Math.sin(t * 21.0 + time * 0.0008) * 0.16 +
        Math.cos(t * 36.0) * 0.07;

      const py = cy + wave * h * 0.48;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    ctx.stroke();
    ctx.restore();
  };

  const drawHeatmapModule = (time) => {
    const { cx, cy, w, h } = getModuleRect(MODULES.heatmap);
    drawModuleFrame(cx, cy, w, h);

    const cols = 5;
    const rows = 4;
    const gap = Math.max(2, w * 0.025);

    const innerW = w * 0.78;
    const innerH = h * 0.72;

    const startX = cx - innerW / 2;
    const startY = cy - innerH / 2;

    const cellW = (innerW - gap * (cols - 1)) / cols;
    const cellH = (innerH - gap * (rows - 1)) / rows;

    const palette = [
      THEME.heatA,
      THEME.heatB,
      THEME.heatC,
      THEME.heatD
    ];

    ctx.save();

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const pulse =
          (Math.sin(time * 0.0014 + row * 0.8 + col * 0.6) + 1) * 0.5;

        const paletteIndex =
          (row * 2 + col + Math.round(pulse)) % palette.length;

        ctx.globalAlpha = 0.55 + pulse * 0.35;
        ctx.fillStyle = palette[paletteIndex];

        ctx.fillRect(
          startX + col * (cellW + gap),
          startY + row * (cellH + gap),
          cellW,
          cellH
        );
      }
    }

    ctx.restore();
  };

  const drawNetworkModule = (time) => {
    const { cx, cy, w, h } = getModuleRect(MODULES.network);
    drawModuleFrame(cx, cy, w, h);

    const points = [
      [-0.34, -0.20],
      [-0.07, -0.31],
      [ 0.28, -0.17],
      [-0.22,  0.04],
      [ 0.08,  0.03],
      [-0.31,  0.28],
      [ 0.01,  0.30],
      [ 0.32,  0.21]
    ].map(([px, py], index) => ({
      x: cx + px * w,
      y: cy + py * h,
      phase: index * 0.9
    }));

    const links = [
      [0, 1], [1, 2], [0, 3], [1, 4], [2, 4],
      [3, 4], [3, 5], [4, 6], [4, 7], [5, 6], [6, 7]
    ];

    ctx.save();

    ctx.strokeStyle = THEME.networkLine;
    ctx.lineWidth = 0.8;

    links.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(points[a].x, points[a].y);
      ctx.lineTo(points[b].x, points[b].y);
      ctx.stroke();
    });

    points.forEach((point) => {
      const pulse = reducedMotion
        ? 1
        : 0.75 + Math.sin(time * 0.002 + point.phase) * 0.25;

      ctx.fillStyle = THEME.networkNode;
      ctx.globalAlpha = pulse;
      ctx.shadowColor = THEME.networkNode;
      ctx.shadowBlur = THEME.isLight ? 2 : 5;

      ctx.beginPath();
      ctx.arc(point.x, point.y, 1.8 + pulse * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  const drawIntegratedStatModules = (time) => {
    ctx.save();
    ctx.clip(getBrainPath());

    drawDistributionModule();
    drawRegressionModule();
    drawTimeSeriesModule(time);
    drawHeatmapModule(time);
    drawNetworkModule(time);

    ctx.restore();
  };

  /* =======================================================
     22. SYNAPTIC PULSE DRAWING
     ======================================================= */

  const drawPulses = () => {
    ctx.save();

    ctx.globalCompositeOperation = THEME.isLight
      ? "source-over"
      : "lighter";

    pulses.forEach((pulse) => {
      const from = nodes[pulse.edge.from];
      const to = nodes[pulse.edge.to];

      if (!from || !to) return;

      const progress = Math.min(1, pulse.progress);
      const tailProgress = Math.max(0, progress - 0.13);

      const x = from.x + (to.x - from.x) * progress;
      const y = from.y + (to.y - from.y) * progress;

      const tailX = from.x + (to.x - from.x) * tailProgress;
      const tailY = from.y + (to.y - from.y) * tailProgress;

      const color = pulse.colorType === "purple"
        ? THEME.purple
        : THEME.blueLight;

      /* Signal tail */
      const tailGradient = ctx.createLinearGradient(
        tailX,
        tailY,
        x,
        y
      );

      tailGradient.addColorStop(0, withAlpha(color, 0));
      tailGradient.addColorStop(1, withAlpha(color, THEME.isLight ? 0.70 : 0.95));

      ctx.strokeStyle = tailGradient;
      ctx.lineWidth = THEME.isLight ? 1.2 : 1.6;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(x, y);
      ctx.stroke();

      /* Signal head */
      const size = THEME.isLight ? 7.5 : 10.5;

      const glow = ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        size
      );

      glow.addColorStop(0, withAlpha(THEME.nodeCore, 1));
      glow.addColorStop(
        0.20,
        withAlpha(color, THEME.isLight ? 0.68 : 0.92)
      );
      glow.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = THEME.nodeCore;
      ctx.beginPath();
      ctx.arc(x, y, THEME.isLight ? 1.3 : 1.8, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  /* =======================================================
     23. SYNAPTIC SPARK DRAWING
     ======================================================= */

  const drawSparks = () => {
    ctx.save();

    ctx.globalCompositeOperation = THEME.isLight
      ? "source-over"
      : "lighter";

    sparks.forEach((spark) => {
      const alpha = Math.max(0, spark.life / spark.maxLife);
      const color = spark.colorType === "purple"
        ? THEME.purple
        : THEME.blueLight;

      ctx.fillStyle = withAlpha(color, alpha * 0.85);
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  /* =======================================================
     24. AMBIENT PARTICLE DRAWING
     ======================================================= */

  const drawAmbientParticles = (time) => {
    ctx.save();

    ambientParticles.forEach((particle) => {
      const angle =
        particle.angle +
        time * particle.speed * particle.direction;

      const radialMovement =
        Math.sin(time * particle.radialSpeed + particle.phase) *
        particle.radialAmplitude;

      const currentRadius = particle.radius + radialMovement;

      const radiusX =
        brainWidth *
        currentRadius *
        particle.orbitX;

      const radiusY =
        brainHeight *
        currentRadius *
        particle.orbitY;

      const drift = reducedMotion
        ? 0
        : Math.sin(time * particle.driftSpeed + particle.phase) *
          particle.driftAmplitude;

      const x =
        centerX +
        pointer.offsetX +
        Math.cos(angle) * radiusX;

      const y =
        centerY +
        pointer.offsetY +
        Math.sin(angle) * radiusY +
        drift;

      const twinkle = reducedMotion
        ? 0.75
        : 0.55 +
          (Math.sin(time * particle.twinkleSpeed + particle.phase) + 1) *
            0.225;

      const alpha = particle.opacity * twinkle;

      const color = particle.colorType === "purple"
        ? THEME.purple
        : THEME.blueLight;

      if (particle.depth > 0.62) {
        const glowRadius = particle.size * (3 + particle.depth * 2.5);

        const glow = ctx.createRadialGradient(
          x,
          y,
          0,
          x,
          y,
          glowRadius
        );

        glow.addColorStop(0, withAlpha(color, alpha * 0.60));
        glow.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = withAlpha(color, alpha);
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  };

  /* =======================================================
     25. BRAIN OUTLINE
     ======================================================= */

  const drawBrainOutline = () => {
    ctx.save();

    ctx.strokeStyle = THEME.outline;
    ctx.lineWidth = THEME.isLight ? 1.05 : 0.85;
    ctx.shadowColor = THEME.purple;
    ctx.shadowBlur = THEME.isLight ? 5 : 12;
    ctx.stroke(getBrainPath());

    ctx.restore();
  };

  /* =======================================================
     26. UPDATE PARALLAX / POINTER
     ======================================================= */

  const updateParallax = () => {
    pointer.offsetX +=
      (pointer.targetOffsetX - pointer.offsetX) * 0.05;

    pointer.offsetY +=
      (pointer.targetOffsetY - pointer.offsetY) * 0.05;
  };

  const handlePointerMove = (event) => {
    if (touchDevice || reducedMotion) return;

    const rect = canvas.getBoundingClientRect();

    const inside =
      event.clientX >= rect.left &&
      event.clientX <= rect.right &&
      event.clientY >= rect.top &&
      event.clientY <= rect.bottom;

    pointer.active = inside;

    if (!inside) {
      pointer.targetOffsetX = 0;
      pointer.targetOffsetY = 0;
      return;
    }

    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;

    pointer.normalizedX = (pointer.x / rect.width) * 2 - 1;
    pointer.normalizedY = (pointer.y / rect.height) * 2 - 1;

    pointer.targetOffsetX = pointer.normalizedX * CONFIG.parallaxX;
    pointer.targetOffsetY = pointer.normalizedY * CONFIG.parallaxY;
  };

  const handlePointerLeave = () => {
    pointer.active = false;
    pointer.targetOffsetX = 0;
    pointer.targetOffsetY = 0;
  };

  /* =======================================================
     27. RESIZE
     ======================================================= */

  const resizeCanvas = () => {
    const rect = canvas.getBoundingClientRect();

    width = Math.max(rect.width, 1);
    height = Math.max(rect.height, 1);

    dpr = Math.min(
      window.devicePixelRatio || 1,
      window.innerWidth <= 700 ? 1.25 : 1.75
    );

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = width * 0.52;
    centerY = height * 0.50;

    /* More horizontal brain, closer to the chosen reference */
    brainWidth = Math.min(
      width * 0.93,
      height * 1.22
    );

    brainHeight = brainWidth * 0.72;

    if (brainHeight > height * 0.84) {
      brainHeight = height * 0.84;
      brainWidth = brainHeight / 0.72;
    }

    createNodes();
    createEdges();
    createAmbientParticles();

    pulses = [];
    sparks = [];

    const now = performance.now();

    nodes.forEach((node) => {
      node.update(now, pointer.x, pointer.y);
    });

    if (reducedMotion) {
      renderStaticFrame();
    }
  };

  const scheduleResize = () => {
    if (resizeFrame) {
      cancelAnimationFrame(resizeFrame);
    }

    resizeFrame = requestAnimationFrame(() => {
      resizeCanvas();
      resizeFrame = null;
    });
  };

  /* =======================================================
     28. UPDATE
     ======================================================= */

  const update = (time, deltaSeconds) => {
    updateParallax();

    nodes.forEach((node) => {
      node.update(time, pointer.x, pointer.y);
    });

    pulses.forEach((pulse) => {
      pulse.update(deltaSeconds);

      if (pulse.life <= 0 && !pulse.burstCreated) {
        const target = nodes[pulse.edge.to];
        createSynapticBurst(target, pulse.colorType);
        pulse.burstCreated = true;
      }
    });

    pulses = pulses.filter((pulse) => pulse.life > 0);

    sparks.forEach((spark) => {
      spark.x += spark.vx * deltaSeconds;
      spark.y += spark.vy * deltaSeconds;

      spark.vx *= 0.94;
      spark.vy *= 0.94;

      spark.life -= deltaSeconds;
    });

    sparks = sparks.filter((spark) => spark.life > 0);

    if (
      !reducedMotion &&
      time - lastPulseTime >= CONFIG.pulseInterval
    ) {
      createPulse();

      lastPulseTime =
        time +
        randomRange(-35, 55);
    }
  };

  /* =======================================================
     29. RENDER
     ======================================================= */

  const render = (time) => {
    ctx.clearRect(0, 0, width, height);

    /* Depth order */
    drawBrainGlow();
    drawBrainVolume();
    drawCorticalFolds(time);
    drawAmbientParticles(time);

    /* Neural structure remains visible as background */
    drawEdges(time);

    nodes.forEach((node) => {
      drawNode(node, time);
    });

    /* Main identity: statistics + data science */
    drawIntegratedStatModules(time);

    /* Activity overlays */
    drawPulses();
    drawSparks();

    drawBrainOutline();
  };

  /* =======================================================
     30. STATIC FRAME
     ======================================================= */

  const renderStaticFrame = () => {
    const time = performance.now();

    nodes.forEach((node) => {
      node.update(time, -9999, -9999);
    });

    render(time);
  };

  /* =======================================================
     31. ANIMATION LOOP
     ======================================================= */

  const animate = (currentTime) => {
    if (!pageVisible) {
      animationFrame = null;
      return;
    }

    const deltaMilliseconds = Math.min(
      currentTime - previousTime,
      40
    );

    previousTime = currentTime;

    update(currentTime, deltaMilliseconds / 1000);
    render(currentTime);

    animationFrame = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (reducedMotion || animationFrame) return;

    previousTime = performance.now();
    animationFrame = requestAnimationFrame(animate);
  };

  const stopAnimation = () => {
    if (!animationFrame) return;

    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  };

  /* =======================================================
     32. PAGE VISIBILITY
     ======================================================= */

  const handleVisibilityChange = () => {
    pageVisible = !document.hidden;

    if (pageVisible) {
      if (reducedMotion) renderStaticFrame();
      else startAnimation();
    } else {
      stopAnimation();
    }
  };

  /* =======================================================
     33. DYNAMIC THEME SWITCHING
     ======================================================= */

  const themeObserver = new MutationObserver((mutations) => {
    const changed = mutations.some(
      (mutation) =>
        mutation.type === "attributes" &&
        mutation.attributeName === "data-theme"
    );

    if (!changed) return;

    refreshTheme();

    if (reducedMotion) {
      renderStaticFrame();
    }
  });

  themeObserver.observe(root, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  /* =======================================================
     34. RESIZE OBSERVER
     ======================================================= */

  let resizeObserver = null;

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(canvas);
  } else {
    window.addEventListener("resize", scheduleResize);
  }

  /* =======================================================
     35. EVENTS
     ======================================================= */

  if (!touchDevice && !reducedMotion) {
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true
    });

    window.addEventListener("pointerleave", handlePointerLeave);
  }

  document.addEventListener(
    "visibilitychange",
    handleVisibilityChange
  );

  /* =======================================================
     36. INITIALIZATION
     ======================================================= */

  const init = () => {
    refreshTheme();
    resizeCanvas();

    if (reducedMotion) {
      renderStaticFrame();
      return;
    }

    startAnimation();
  };

  init();

  /* =======================================================
     37. CLEANUP
     ======================================================= */

  window.addEventListener("beforeunload", () => {
    stopAnimation();

    if (resizeFrame) {
      cancelAnimationFrame(resizeFrame);
    }

    if (resizeObserver) {
      resizeObserver.disconnect();
    }

    themeObserver.disconnect();

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerleave", handlePointerLeave);
    window.removeEventListener("resize", scheduleResize);

    document.removeEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
  });
})();