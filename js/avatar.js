/* =========================================================
   MATÍAS CORTÉS — PORTFOLIO
   AVATAR 3D LOW-POLY MÁS NATURAL
   =========================================================

   Objetivo:
   - que NO parezca Minecraft
   - que sea más natural
   - sin barba
   - mantener un estilo 3D geométrico elegante
   - que siga siendo liviano para GitHub Pages
   - que responda a dark / light theme
   - que se vea bien en desktop y mobile
   ========================================================= */

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

(() => {
  "use strict";

  /* =======================================================
     01. CONTENEDOR
     ======================================================= */

  const container = document.querySelector("#avatar-container");

  if (!container) return;

  /* =======================================================
     02. CONFIGURACIÓN GENERAL
     ======================================================= */

  const CONFIG = {
    camera: {
      fov: 34,
      near: 0.1,
      far: 100
    },

    motion: {
      idleFloat: 0.025,
      idleSpeed: 1.15,
      pointerEase: 0.06,
      maxRotateY: 0.18,
      maxRotateX: 0.05
    },

    performance: {
      desktopPixelRatio: 1.6,
      mobilePixelRatio: 1.2
    }
  };

  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  const touchQuery = window.matchMedia("(hover: none), (pointer: coarse)");

  /* =======================================================
     03. COLORES DEL AVATAR
     ======================================================= */

  const AVATAR = {
    skin: 0xd8ad8e,
    skinLight: 0xe8bea0,
    skinShadow: 0xc79574,

    hair: 0x2b211d,
    hairSoft: 0x3a2c26,

    eyebrow: 0x2a201c,
    mouth: 0x8f6a66,

    blazer: 0x4a67b7,
    blazerDark: 0x314a93,
    blazerLight: 0x5e7cdc,

    shirt: 0xf4f5f8,
    shirtSoft: 0xe4e6ee,

    pants: 0xcac6e8,
    pantsShadow: 0xb2acd6,

    shoes: 0x191a1f,
    shoesSoft: 0x2a2d35,

    eyeWhite: 0xf5f5f7,
    iris: 0x473a35,
    pupil: 0x151518
  };

  const getCSSVar = (name, fallback) => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();

    return value || fallback;
  };

  const getBrandColors = () => ({
    purple: getCSSVar("--color-primary-light", "#9b6dff"),
    blue: getCSSVar("--color-blue", "#5e8cff")
  });

  let BRAND = getBrandColors();

  /* =======================================================
     04. ESTADO INTERNO
     ======================================================= */

  let animationFrame = null;
  let isVisible = !document.hidden;
  let isInViewport = true;
  let destroyed = false;

  let targetRotationY = 0;
  let targetRotationX = 0;
  let currentRotationY = 0;
  let currentRotationX = 0;

  /* =======================================================
     05. ESCENA
     ======================================================= */

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    CONFIG.camera.fov,
    1,
    CONFIG.camera.near,
    CONFIG.camera.far
  );

  camera.position.set(0, 2.55, 8.5);
  camera.lookAt(0, 2.4, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = !mobileQuery.matches;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.setAttribute("role", "img");
  renderer.domElement.setAttribute("aria-label", "Avatar 3D estilizado de Matías Cortés");

  container.replaceChildren(renderer.domElement);

  /* =======================================================
     06. HELPERS
     ======================================================= */

  const createMaterial = (
    color,
    {
      roughness = 0.7,
      metalness = 0.04,
      emissive = 0x000000,
      emissiveIntensity = 0
    } = {}
  ) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness,
      metalness,
      emissive,
      emissiveIntensity
    });

  const createBox = ({
    width,
    height,
    depth,
    color,
    x = 0,
    y = 0,
    z = 0,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    roughness = 0.72,
    metalness = 0.03,
    castShadow = true,
    receiveShadow = true
  }) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      createMaterial(color, { roughness, metalness })
    );

    mesh.position.set(x, y, z);
    mesh.rotation.set(rotationX, rotationY, rotationZ);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;

    return mesh;
  };

  const createLowPolySphere = ({
    radius,
    color,
    x = 0,
    y = 0,
    z = 0,
    scaleX = 1,
    scaleY = 1,
    scaleZ = 1,
    roughness = 0.7,
    metalness = 0.03,
    castShadow = true,
    receiveShadow = true
  }) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 10, 8),
      createMaterial(color, { roughness, metalness })
    );

    mesh.position.set(x, y, z);
    mesh.scale.set(scaleX, scaleY, scaleZ);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;

    return mesh;
  };

  const createLowPolyCylinder = ({
    radiusTop,
    radiusBottom,
    height,
    color,
    x = 0,
    y = 0,
    z = 0,
    rotationX = 0,
    rotationY = 0,
    rotationZ = 0,
    roughness = 0.68,
    metalness = 0.03,
    castShadow = true,
    receiveShadow = true
  }) => {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 6),
      createMaterial(color, { roughness, metalness })
    );

    mesh.position.set(x, y, z);
    mesh.rotation.set(rotationX, rotationY, rotationZ);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;

    return mesh;
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  /* =======================================================
     07. GRUPO PRINCIPAL DEL AVATAR
     ======================================================= */

  const avatar = new THREE.Group();
  avatar.position.y = -0.12;
  scene.add(avatar);

  /* =======================================================
     08. CABEZA MÁS NATURAL
     ======================================================= */

  const headGroup = new THREE.Group();
  headGroup.position.y = 4.42;
  avatar.add(headGroup);

  const head = createLowPolySphere({
    radius: 0.76,
    scaleX: 0.92,
    scaleY: 1.06,
    scaleZ: 0.85,
    color: AVATAR.skin,
    y: 0.02
  });

  headGroup.add(head);

  /* -------------------------------------------------------
     Cabello
     ------------------------------------------------------- */

  headGroup.add(
    createBox({
      width: 1.28,
      height: 0.22,
      depth: 1.02,
      color: AVATAR.hair,
      y: 0.68,
      z: -0.04
    })
  );

  headGroup.add(
    createBox({
      width: 0.65,
      height: 0.12,
      depth: 0.18,
      color: AVATAR.hairSoft,
      x: -0.22,
      y: 0.56,
      z: 0.49,
      rotationZ: -0.08
    })
  );

  headGroup.add(
    createBox({
      width: 0.34,
      height: 0.10,
      depth: 0.16,
      color: AVATAR.hair,
      x: 0.30,
      y: 0.58,
      z: 0.47,
      rotationZ: 0.05
    })
  );

  headGroup.add(
    createBox({
      width: 0.15,
      height: 0.56,
      depth: 0.72,
      color: AVATAR.hair,
      x: -0.61,
      y: 0.20,
      z: -0.04
    })
  );

  headGroup.add(
    createBox({
      width: 0.15,
      height: 0.56,
      depth: 0.72,
      color: AVATAR.hair,
      x: 0.61,
      y: 0.20,
      z: -0.04
    })
  );

  headGroup.add(
    createBox({
      width: 1.02,
      height: 0.52,
      depth: 0.12,
      color: AVATAR.hairSoft,
      y: 0.18,
      z: -0.48
    })
  );

  /* -------------------------------------------------------
     Orejas
     ------------------------------------------------------- */

  headGroup.add(
    createLowPolySphere({
      radius: 0.14,
      scaleX: 0.55,
      scaleY: 1,
      scaleZ: 0.62,
      color: AVATAR.skinShadow,
      x: -0.70,
      y: -0.03
    })
  );

  headGroup.add(
    createLowPolySphere({
      radius: 0.14,
      scaleX: 0.55,
      scaleY: 1,
      scaleZ: 0.62,
      color: AVATAR.skinShadow,
      x: 0.70,
      y: -0.03
    })
  );

  /* -------------------------------------------------------
     Ojos más pequeños y naturales
     ------------------------------------------------------- */

  const createEye = (x) => {
    const eye = new THREE.Group();
    eye.position.set(x, 0.08, 0.64);

    eye.add(
      createLowPolySphere({
        radius: 0.11,
        scaleX: 1.2,
        scaleY: 0.7,
        scaleZ: 0.42,
        color: AVATAR.eyeWhite,
        castShadow: false,
        receiveShadow: false
      })
    );

    eye.add(
      createLowPolySphere({
        radius: 0.05,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 0.28,
        color: AVATAR.iris,
        z: 0.095,
        castShadow: false,
        receiveShadow: false
      })
    );

    eye.add(
      createLowPolySphere({
        radius: 0.024,
        scaleX: 1,
        scaleY: 1,
        scaleZ: 0.20,
        color: AVATAR.pupil,
        z: 0.116,
        castShadow: false,
        receiveShadow: false
      })
    );

    return eye;
  };

  headGroup.add(createEye(-0.26));
  headGroup.add(createEye(0.26));

  /* -------------------------------------------------------
     Cejas más finas
     ------------------------------------------------------- */

  headGroup.add(
    createBox({
      width: 0.28,
      height: 0.04,
      depth: 0.03,
      color: AVATAR.eyebrow,
      x: -0.27,
      y: 0.28,
      z: 0.62,
      rotationZ: -0.04,
      castShadow: false,
      receiveShadow: false
    })
  );

  headGroup.add(
    createBox({
      width: 0.28,
      height: 0.04,
      depth: 0.03,
      color: AVATAR.eyebrow,
      x: 0.27,
      y: 0.28,
      z: 0.62,
      rotationZ: 0.04,
      castShadow: false,
      receiveShadow: false
    })
  );

  /* -------------------------------------------------------
     Nariz pequeña
     ------------------------------------------------------- */

  headGroup.add(
    createLowPolySphere({
      radius: 0.12,
      scaleX: 0.68,
      scaleY: 1.15,
      scaleZ: 0.9,
      color: AVATAR.skinLight,
      y: -0.08,
      z: 0.68
    })
  );

  /* -------------------------------------------------------
     Boca simple
     ------------------------------------------------------- */

  headGroup.add(
    createBox({
      width: 0.24,
      height: 0.025,
      depth: 0.02,
      color: AVATAR.mouth,
      y: -0.36,
      z: 0.67,
      castShadow: false,
      receiveShadow: false
    })
  );

  /* =======================================================
     09. CUELLO
     ======================================================= */

  avatar.add(
    createLowPolyCylinder({
      radiusTop: 0.17,
      radiusBottom: 0.19,
      height: 0.34,
      color: AVATAR.skinShadow,
      y: 3.60
    })
  );

  /* =======================================================
     10. TORSO
     ======================================================= */

  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 2.92;
  avatar.add(torsoGroup);

  torsoGroup.add(
    createBox({
      width: 1.70,
      height: 1.54,
      depth: 0.78,
      color: AVATAR.blazer,
      roughness: 0.62
    })
  );

  torsoGroup.add(
    createBox({
      width: 0.54,
      height: 1.30,
      depth: 0.08,
      color: AVATAR.shirt,
      z: 0.43
    })
  );

  torsoGroup.add(
    createBox({
      width: 0.30,
      height: 0.90,
      depth: 0.09,
      color: AVATAR.blazerDark,
      x: -0.20,
      y: 0.12,
      z: 0.46,
      rotationZ: -0.23
    })
  );

  torsoGroup.add(
    createBox({
      width: 0.30,
      height: 0.90,
      depth: 0.09,
      color: AVATAR.blazerDark,
      x: 0.20,
      y: 0.12,
      z: 0.46,
      rotationZ: 0.23
    })
  );

  torsoGroup.add(
    createBox({
      width: 0.20,
      height: 0.06,
      depth: 0.05,
      color: AVATAR.shirt,
      x: 0.50,
      y: 0.30,
      z: 0.46
    })
  );

  /* =======================================================
     11. BRAZOS MÁS NATURALES
     ======================================================= */

  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-1.00, 3.17, 0);
  leftArmGroup.rotation.z = -0.14;
  leftArmGroup.rotation.x = -0.06;
  avatar.add(leftArmGroup);

  leftArmGroup.add(
    createLowPolyCylinder({
      radiusTop: 0.22,
      radiusBottom: 0.20,
      height: 1.34,
      color: AVATAR.blazer
    })
  );

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(1.00, 3.17, 0);
  rightArmGroup.rotation.z = 0.14;
  rightArmGroup.rotation.x = -0.06;
  avatar.add(rightArmGroup);

  rightArmGroup.add(
    createLowPolyCylinder({
      radiusTop: 0.22,
      radiusBottom: 0.20,
      height: 1.34,
      color: AVATAR.blazer
    })
  );

  /* -------------------------------------------------------
     Antebrazos cruzados al frente
     ------------------------------------------------------- */

  avatar.add(
    createLowPolyCylinder({
      radiusTop: 0.20,
      radiusBottom: 0.18,
      height: 1.02,
      color: AVATAR.blazerLight,
      x: -0.55,
      y: 2.20,
      z: 0.33,
      rotationZ: -0.84,
      rotationX: 0.10
    })
  );

  avatar.add(
    createLowPolyCylinder({
      radiusTop: 0.20,
      radiusBottom: 0.18,
      height: 1.02,
      color: AVATAR.blazerLight,
      x: 0.55,
      y: 2.20,
      z: 0.33,
      rotationZ: 0.84,
      rotationX: 0.10
    })
  );

  /* -------------------------------------------------------
     Puños de camisa
     ------------------------------------------------------- */

  avatar.add(
    createBox({
      width: 0.26,
      height: 0.13,
      depth: 0.22,
      color: AVATAR.shirt,
      x: -0.23,
      y: 1.92,
      z: 0.54,
      rotationZ: -0.15
    })
  );

  avatar.add(
    createBox({
      width: 0.26,
      height: 0.13,
      depth: 0.22,
      color: AVATAR.shirt,
      x: 0.23,
      y: 1.92,
      z: 0.55,
      rotationZ: 0.15
    })
  );

  /* -------------------------------------------------------
     Manos redondeadas
     ------------------------------------------------------- */

  avatar.add(
    createLowPolySphere({
      radius: 0.21,
      scaleX: 1.10,
      scaleY: 0.70,
      scaleZ: 0.82,
      color: AVATAR.skin,
      x: -0.16,
      y: 1.85,
      z: 0.58
    })
  );

  avatar.add(
    createLowPolySphere({
      radius: 0.21,
      scaleX: 1.10,
      scaleY: 0.70,
      scaleZ: 0.82,
      color: AVATAR.skinLight,
      x: 0.16,
      y: 1.85,
      z: 0.59
    })
  );

  /* =======================================================
     12. CINTURA Y PIERNAS
     ======================================================= */

  avatar.add(
    createBox({
      width: 1.34,
      height: 0.18,
      depth: 0.64,
      color: 0x31323b,
      y: 1.61
    })
  );

  avatar.add(
    createLowPolyCylinder({
      radiusTop: 0.33,
      radiusBottom: 0.29,
      height: 1.90,
      color: AVATAR.pants,
      x: -0.34,
      y: 0.67
    })
  );

  avatar.add(
    createLowPolyCylinder({
      radiusTop: 0.33,
      radiusBottom: 0.29,
      height: 1.90,
      color: AVATAR.pants,
      x: 0.34,
      y: 0.67
    })
  );

  avatar.add(
    createBox({
      width: 0.08,
      height: 1.55,
      depth: 0.50,
      color: AVATAR.pantsShadow,
      y: 0.64,
      z: -0.02
    })
  );

  /* =======================================================
     13. ZAPATOS
     ======================================================= */

  avatar.add(
    createBox({
      width: 0.68,
      height: 0.26,
      depth: 0.95,
      color: AVATAR.shoes,
      x: -0.34,
      y: -0.38,
      z: 0.12,
      roughness: 0.42
    })
  );

  avatar.add(
    createBox({
      width: 0.68,
      height: 0.26,
      depth: 0.95,
      color: AVATAR.shoes,
      x: 0.34,
      y: -0.38,
      z: 0.12,
      roughness: 0.42
    })
  );

  avatar.add(
    createBox({
      width: 0.55,
      height: 0.03,
      depth: 0.35,
      color: AVATAR.shoesSoft,
      x: -0.34,
      y: -0.24,
      z: 0.34
    })
  );

  avatar.add(
    createBox({
      width: 0.55,
      height: 0.03,
      depth: 0.35,
      color: AVATAR.shoesSoft,
      x: 0.34,
      y: -0.24,
      z: 0.34
    })
  );

  /* =======================================================
     14. PODIO Y ELEMENTOS DE APOYO
     ======================================================= */

  const podiumGroup = new THREE.Group();
  podiumGroup.position.y = -0.69;
  scene.add(podiumGroup);

  const podiumMaterial = createMaterial(0x0d0e16, {
    roughness: 0.34,
    metalness: 0.55
  });

  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(2.05, 2.22, 0.34, 64),
    podiumMaterial
  );

  podium.castShadow = true;
  podium.receiveShadow = true;
  podiumGroup.add(podium);

  const ringPurpleMaterial = new THREE.MeshStandardMaterial({
    color: BRAND.purple,
    emissive: BRAND.purple,
    emissiveIntensity: 1.7,
    roughness: 0.3
  });

  const ringBlueMaterial = new THREE.MeshStandardMaterial({
    color: BRAND.blue,
    emissive: BRAND.blue,
    emissiveIntensity: 1.35,
    roughness: 0.3
  });

  const ringPurple = new THREE.Mesh(
    new THREE.TorusGeometry(1.95, 0.03, 14, 90),
    ringPurpleMaterial
  );
  ringPurple.rotation.x = Math.PI / 2;
  ringPurple.position.y = 0.17;
  podiumGroup.add(ringPurple);

  const ringBlue = new THREE.Mesh(
    new THREE.TorusGeometry(1.55, 0.018, 12, 90),
    ringBlueMaterial
  );
  ringBlue.rotation.x = Math.PI / 2;
  ringBlue.position.y = 0.18;
  podiumGroup.add(ringBlue);

  /* -------------------------------------------------------
     Halo sutil detrás del avatar
     ------------------------------------------------------- */

  const haloGroup = new THREE.Group();
  haloGroup.position.set(0, 2.35, -0.75);
  scene.add(haloGroup);

  const createHaloRing = ({ radius, color, opacity, rotationZ = 0, arc = Math.PI * 1.65 }) => {
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.010, 8, 90, arc),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false
      })
    );

    mesh.rotation.z = rotationZ;
    return mesh;
  };

  const haloPurple = createHaloRing({
    radius: 2.48,
    color: BRAND.purple,
    opacity: 0.10,
    rotationZ: -0.45
  });

  const haloBlue = createHaloRing({
    radius: 2.10,
    color: BRAND.blue,
    opacity: 0.07,
    rotationZ: 1.10,
    arc: Math.PI * 1.25
  });

  haloGroup.add(haloPurple, haloBlue);

  /* -------------------------------------------------------
     Cubos flotantes
     ------------------------------------------------------- */

  const particlesGroup = new THREE.Group();
  particlesGroup.position.y = 2.30;
  scene.add(particlesGroup);

  const particlePositions = [
    [-2.0, 1.2, -0.4, 0.05],
    [ 2.1, 1.0, -0.4, 0.05],
    [-1.8,-0.1, -0.3, 0.04],
    [ 1.8,-0.1, -0.3, 0.04],
    [-1.3, 2.1, -0.8, 0.035],
    [ 1.3, 2.0, -0.8, 0.035]
  ];

  particlePositions.forEach(([x, y, z, size], index) => {
    const mesh = createBox({
      width: size,
      height: size,
      depth: size,
      color: index % 2 === 0 ? BRAND.purple : BRAND.blue,
      x,
      y,
      z,
      castShadow: false,
      receiveShadow: false,
      roughness: 0.28,
      metalness: 0.10
    });

    mesh.userData.baseY = y;
    mesh.userData.phase = index * 0.8;

    particlesGroup.add(mesh);
  });

  /* =======================================================
     15. ILUMINACIÓN
     ======================================================= */

  const hemiLight = new THREE.HemisphereLight(0xe4e8ff, 0x11131b, 1.55);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.55);
  keyLight.position.set(3.3, 7, 4.8);
  keyLight.castShadow = renderer.shadowMap.enabled;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 20;
  keyLight.shadow.camera.left = -5;
  keyLight.shadow.camera.right = 5;
  keyLight.shadow.camera.top = 7;
  keyLight.shadow.camera.bottom = -3;
  keyLight.shadow.bias = -0.00035;
  scene.add(keyLight);

  const purpleLight = new THREE.PointLight(BRAND.purple, 18, 9, 2);
  purpleLight.position.set(-3.1, 3.0, 2.0);
  scene.add(purpleLight);

  const blueLight = new THREE.PointLight(BRAND.blue, 15, 8, 2);
  blueLight.position.set(3.0, 2.7, 1.4);
  scene.add(blueLight);

  const floorLight = new THREE.PointLight(BRAND.purple, 9, 5, 2);
  floorLight.position.set(0, -0.15, 1.0);
  scene.add(floorLight);

  /* =======================================================
     16. TEMA CLARO / OSCURO
     ======================================================= */

  const applyTheme = () => {
    const isLight = document.documentElement.dataset.theme === "light";

    BRAND = getBrandColors();

    podiumMaterial.color.set(isLight ? 0xe4e5ee : 0x0d0e16);
    podiumMaterial.roughness = isLight ? 0.48 : 0.34;
    podiumMaterial.metalness = isLight ? 0.22 : 0.55;

    ringPurpleMaterial.color.set(BRAND.purple);
    ringPurpleMaterial.emissive.set(BRAND.purple);
    ringPurpleMaterial.emissiveIntensity = isLight ? 1.15 : 1.7;

    ringBlueMaterial.color.set(BRAND.blue);
    ringBlueMaterial.emissive.set(BRAND.blue);
    ringBlueMaterial.emissiveIntensity = isLight ? 0.95 : 1.35;

    purpleLight.color.set(BRAND.purple);
    blueLight.color.set(BRAND.blue);
    floorLight.color.set(BRAND.purple);

    purpleLight.intensity = isLight ? 11 : 18;
    blueLight.intensity = isLight ? 9 : 15;
    floorLight.intensity = isLight ? 6 : 9;

    haloPurple.material.color.set(BRAND.purple);
    haloPurple.material.opacity = isLight ? 0.07 : 0.10;

    haloBlue.material.color.set(BRAND.blue);
    haloBlue.material.opacity = isLight ? 0.05 : 0.07;

    renderOnce();
  };

  /* =======================================================
     17. RESPONSIVE
     ======================================================= */

  const updateResponsive = (width) => {
    if (width <= 560) {
      camera.position.set(0, 2.45, 9.25);
      camera.fov = 36;
      avatar.scale.setScalar(0.88);
      podiumGroup.scale.setScalar(0.88);
      haloGroup.scale.setScalar(0.90);
    } else if (width <= 900) {
      camera.position.set(0, 2.50, 8.95);
      camera.fov = 35;
      avatar.scale.setScalar(0.94);
      podiumGroup.scale.setScalar(0.94);
      haloGroup.scale.setScalar(0.95);
    } else {
      camera.position.set(0, 2.55, 8.5);
      camera.fov = 34;
      avatar.scale.setScalar(1);
      podiumGroup.scale.setScalar(1);
      haloGroup.scale.setScalar(1);
    }

    camera.lookAt(0, 2.35, 0);
    camera.updateProjectionMatrix();
  };

  const resizeRenderer = () => {
    if (destroyed) return;

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);

    updateResponsive(width);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        width <= 768
          ? CONFIG.performance.mobilePixelRatio
          : CONFIG.performance.desktopPixelRatio
      )
    );

    renderer.setSize(width, height, false);

    renderOnce();
  };

  /* =======================================================
     18. POINTER INTERACTION
     ======================================================= */

  const handlePointerMove = (event) => {
    if (reducedMotionQuery.matches || touchQuery.matches) return;

    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    targetRotationY = (x - 0.5) * CONFIG.motion.maxRotateY;
    targetRotationX = (y - 0.5) * -CONFIG.motion.maxRotateX;
  };

  const handlePointerLeave = () => {
    targetRotationY = 0;
    targetRotationX = 0;
  };

  container.addEventListener("pointermove", handlePointerMove, { passive: true });
  container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

  /* =======================================================
     19. OBSERVERS
     ======================================================= */

  let resizeObserver = null;

  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(resizeRenderer);
    resizeObserver.observe(container);
  } else {
    window.addEventListener("resize", resizeRenderer, { passive: true });
  }

  let intersectionObserver = null;

  if ("IntersectionObserver" in window) {
    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry?.isIntersecting ?? true;
        updateLoop();
      },
      {
        threshold: 0.02,
        rootMargin: "150px 0px 150px 0px"
      }
    );

    intersectionObserver.observe(container);
  }

  const handleVisibilityChange = () => {
    isVisible = !document.hidden;
    updateLoop();
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);

  /* =======================================================
     20. ANIMACIÓN
     ======================================================= */

  const clock = new THREE.Clock();

  const shouldAnimate = () => {
    return !destroyed && !reducedMotionQuery.matches && isVisible && isInViewport;
  };

  const renderOnce = () => {
    if (destroyed) return;
    renderer.render(scene, camera);
  };

  const animate = () => {
    if (destroyed) return;

    animationFrame = null;

    if (!shouldAnimate()) {
      renderOnce();
      return;
    }

    const t = clock.getElapsedTime();

    currentRotationY = lerp(currentRotationY, targetRotationY, CONFIG.motion.pointerEase);
    currentRotationX = lerp(currentRotationX, targetRotationX, CONFIG.motion.pointerEase);

    avatar.rotation.y = currentRotationY * 0.55;
    headGroup.rotation.y = currentRotationY * 1.15;
    headGroup.rotation.x = currentRotationX * 0.85;

    avatar.position.y =
      -0.12 +
      Math.sin(t * CONFIG.motion.idleSpeed) * CONFIG.motion.idleFloat;

    torsoGroup.scale.y =
      1 + Math.sin(t * 1.08) * 0.004;

    ringPurpleMaterial.emissiveIntensity =
      1.55 + Math.sin(t * 1.8) * 0.22;

    ringBlueMaterial.emissiveIntensity =
      1.20 + Math.sin(t * 1.45 + 1.1) * 0.18;

    haloGroup.rotation.z = Math.sin(t * 0.18) * 0.03;

    particlesGroup.children.forEach((particle, index) => {
      particle.position.y =
        particle.userData.baseY +
        Math.sin(t * 0.8 + particle.userData.phase) * 0.05;

      particle.rotation.x = t * (0.10 + index * 0.004);
      particle.rotation.y = t * (0.12 + index * 0.003);
    });

    renderOnce();

    animationFrame = requestAnimationFrame(animate);
  };

  const startLoop = () => {
    if (animationFrame || !shouldAnimate()) return;
    clock.start();
    animationFrame = requestAnimationFrame(animate);
  };

  const stopLoop = () => {
    if (!animationFrame) return;
    cancelAnimationFrame(animationFrame);
    animationFrame = null;
  };

  const updateLoop = () => {
    if (shouldAnimate()) startLoop();
    else stopLoop();
  };

  /* =======================================================
     21. REDUCED MOTION
     ======================================================= */

  const handleReducedMotionChange = () => {
    if (reducedMotionQuery.matches) {
      targetRotationY = 0;
      targetRotationX = 0;
      currentRotationY = 0;
      currentRotationX = 0;

      avatar.rotation.set(0, 0, 0);
      headGroup.rotation.set(0, 0, 0);
      avatar.position.y = -0.12;
      torsoGroup.scale.set(1, 1, 1);

      stopLoop();
      renderOnce();
      return;
    }

    updateLoop();
  };

  if (typeof reducedMotionQuery.addEventListener === "function") {
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
  } else {
    reducedMotionQuery.addListener(handleReducedMotionChange);
  }

  /* =======================================================
     22. THEME CHANGE
     ======================================================= */

  const handleThemeChange = () => {
    applyTheme();
  };

  window.addEventListener("themechange", handleThemeChange);

  /* =======================================================
     23. CLEANUP
     ======================================================= */

  const disposeScene = () => {
    const geometries = new Set();
    const materials = new Set();

    scene.traverse((object) => {
      if (object.geometry) geometries.add(object.geometry);

      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((mat) => materials.add(mat));
        } else {
          materials.add(object.material);
        }
      }
    });

    geometries.forEach((geometry) => geometry.dispose());

    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && value.isTexture) value.dispose();
      });

      material.dispose();
    });
  };

  const cleanup = () => {
    if (destroyed) return;
    destroyed = true;

    stopLoop();

    container.removeEventListener("pointermove", handlePointerMove);
    container.removeEventListener("pointerleave", handlePointerLeave);

    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("themechange", handleThemeChange);

    if (resizeObserver) {
      resizeObserver.disconnect();
    } else {
      window.removeEventListener("resize", resizeRenderer);
    }

    intersectionObserver?.disconnect();

    if (typeof reducedMotionQuery.removeEventListener === "function") {
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    } else {
      reducedMotionQuery.removeListener(handleReducedMotionChange);
    }

    disposeScene();
    renderer.dispose();

    if (renderer.forceContextLoss) {
      renderer.forceContextLoss();
    }

    if (renderer.domElement.parentNode === container) {
      renderer.domElement.remove();
    }
  };

  window.addEventListener(
    "pagehide",
    (event) => {
      if (event.persisted) {
        stopLoop();
        return;
      }

      cleanup();
    },
    { once: true }
  );

  /* =======================================================
     24. INICIO
     ======================================================= */

  resizeRenderer();
  applyTheme();

  if (reducedMotionQuery.matches) {
    renderOnce();
  } else {
    startLoop();
  }
})();