"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Planet } from "@/lib/types";
import { hash } from "@/lib/universe";

type Props = {
  planets: Planet[];
  username: string;
  selected: Planet | null;
  onSelect: (planet: Planet) => void;
  paused: boolean;
  zoom: number;
  onZoom: (value: number) => void;
  resetKey: number;
};

const WORLD_SCALE = 0.043;
const CAMERA_DISTANCE = 44;

function seeded(seed: number) {
  let value = seed || 1;
  return () => {
    value = Math.imul(value ^ (value >>> 15), 1 | value);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function glowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d")!;
  const gradient = context.createRadialGradient(64, 64, 2, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.14, "rgba(255,255,255,.72)");
  gradient.addColorStop(0.42, "rgba(255,255,255,.18)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

type Rgb = [number, number, number];

function noisePoint(x: number, y: number, seed: number) {
  let value = Math.imul(x + seed * 17, 374761393) + Math.imul(y - seed * 23, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function smoothNoise(x: number, y: number, seed: number) {
  const x0 = Math.floor(x),
    y0 = Math.floor(y);
  const tx = x - x0,
    ty = y - y0;
  const sx = tx * tx * (3 - 2 * tx),
    sy = ty * ty * (3 - 2 * ty);
  const top = THREE.MathUtils.lerp(noisePoint(x0, y0, seed), noisePoint(x0 + 1, y0, seed), sx);
  const bottom = THREE.MathUtils.lerp(
    noisePoint(x0, y0 + 1, seed),
    noisePoint(x0 + 1, y0 + 1, seed),
    sx
  );
  return THREE.MathUtils.lerp(top, bottom, sy);
}

function terrainNoise(x: number, y: number, seed: number) {
  let value = 0,
    amplitude = 0.56,
    frequency = 1;
  for (let octave = 0; octave < 4; octave++) {
    value += smoothNoise(x * frequency, y * frequency, seed + octave * 97) * amplitude;
    frequency *= 2;
    amplitude *= 0.5;
  }
  return value;
}

function rgb(color: THREE.Color): Rgb {
  return [color.r * 255, color.g * 255, color.b * 255];
}

function blend(a: Rgb, b: Rgb, amount: number): Rgb {
  const t = THREE.MathUtils.clamp(amount, 0, 1);
  return [
    THREE.MathUtils.lerp(a[0], b[0], t),
    THREE.MathUtils.lerp(a[1], b[1], t),
    THREE.MathUtils.lerp(a[2], b[2], t)
  ];
}

function createPlanetTexture(planet: Planet) {
  const width = 160,
    height = 80;
  const data = new Uint8Array(width * height * 4);
  const seed = hash(`${planet.id}-${planet.name}`);
  const style = seed % 4;
  const source = new THREE.Color(planet.color);
  const hsl = { h: 0, s: 0, l: 0 };
  source.getHSL(hsl);
  const hue = (hsl.h + (((seed >>> 8) % 11) - 5) / 100 + 1) % 1;
  const saturation = THREE.MathUtils.clamp(hsl.s * 0.62, 0.3, 0.66);
  const deep = rgb(new THREE.Color().setHSL(hue, saturation * 0.86, style === 3 ? 0.09 : 0.16));
  const middle = rgb(new THREE.Color().setHSL(hue, saturation, style === 2 ? 0.57 : 0.38));
  const light = rgb(
    new THREE.Color().setHSL((hue + 0.035) % 1, saturation * 0.58, style === 2 ? 0.88 : 0.68)
  );
  const accent = rgb(
    new THREE.Color().setHSL(
      (hue + (style === 3 ? 0.08 : 0.13)) % 1,
      Math.min(0.82, saturation + 0.18),
      style === 3 ? 0.52 : 0.46
    )
  );
  const phase = (seed % 628) / 100;

  for (let y = 0; y < height; y++) {
    const latitude = (y / (height - 1) - 0.5) * Math.PI;
    for (let x = 0; x < width; x++) {
      const longitude = (x / width) * Math.PI * 2;
      const cloud = terrainNoise(x / 19, y / 13, seed);
      const detail = terrainNoise(x / 7, y / 7, seed + 331);
      let color: Rgb;

      if (style === 0) {
        // Gas giant: latitude bands, turbulence and a deterministic storm.
        const bands = 0.5 + 0.5 * Math.sin(latitude * 15 + cloud * 3.2 + phase);
        color = blend(deep, light, bands * 0.72 + detail * 0.2);
        const stormLon = phase % (Math.PI * 2);
        const wrappedLon = Math.atan2(
          Math.sin(longitude - stormLon),
          Math.cos(longitude - stormLon)
        );
        const storm = (wrappedLon / 0.48) ** 2 + ((latitude - 0.28) / 0.2) ** 2;
        if (storm < 1) color = blend(color, accent, (1 - storm) * 0.9);
      } else if (style === 1) {
        // Temperate/rocky world: large land masses with bright highlands.
        const land = cloud + Math.sin(longitude * 2.3 + Math.sin(latitude * 3)) * 0.09;
        color =
          land > 0.64 ? blend(middle, light, detail * 0.7) : blend(deep, middle, detail * 0.24);
        if (Math.abs(latitude) > 1.18)
          color = blend(color, light, (Math.abs(latitude) - 1.18) * 1.7);
      } else if (style === 2) {
        // Ice world: pale caps with long blue fissures.
        const fissure = Math.abs(Math.sin(longitude * 4.2 + cloud * 8 + Math.sin(latitude * 6)));
        color = blend(middle, light, 0.38 + cloud * 0.56);
        if (fissure < 0.09) color = blend(color, deep, 0.7);
      } else {
        // Volcanic world: charcoal terrain cut by glowing mineral seams.
        const ridge = Math.abs(Math.sin(longitude * 3 + latitude * 5 + cloud * 9));
        color = blend(deep, middle, detail * 0.5);
        if (ridge < 0.075) color = blend(color, accent, (0.075 - ridge) * 11);
      }

      const shade = 0.88 + detail * 0.18;
      const offset = (y * width + x) * 4;
      data[offset] = Math.min(255, color[0] * shade);
      data[offset + 1] = Math.min(255, color[1] * shade);
      data[offset + 2] = Math.min(255, color[2] * shade);
      data[offset + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return {
    texture,
    style,
    atmosphere: new THREE.Color().setHSL(hue, Math.min(0.82, saturation + 0.2), 0.68)
  };
}

function createPlanetLabelTexture(planet: Planet) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d")!;

  context.beginPath();
  context.roundRect(6, 6, 500, 116, 24);
  context.fillStyle = "rgba(7, 11, 26, .86)";
  context.fill();
  context.lineWidth = 2;
  context.strokeStyle = planet.color;
  context.globalAlpha = 0.6;
  context.stroke();
  context.globalAlpha = 1;

  context.beginPath();
  context.arc(34, 42, 10, 0, Math.PI * 2);
  context.fillStyle = planet.color;
  context.shadowColor = planet.color;
  context.shadowBlur = 14;
  context.fill();
  context.shadowBlur = 0;

  const displayName = planet.name.length > 26 ? `${planet.name.slice(0, 25)}…` : planet.name;
  context.fillStyle = "#f4f7ff";
  context.font = "600 29px Inter, Arial, sans-serif";
  context.textBaseline = "middle";
  context.fillText(displayName, 58, 42, 426);

  context.fillStyle = "#9aa8c2";
  context.font = "500 22px Inter, Arial, sans-serif";
  context.fillText(`★ ${planet.stars.toLocaleString("en-US")} stars`, 25, 88);
  if (planet.language) {
    context.textAlign = "right";
    context.fillStyle = "#7787a6";
    context.fillText(planet.language, 482, 88, 210);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function drawExportPlanetIndex(
  context: CanvasRenderingContext2D,
  items: { planet: Planet; mesh: THREE.Mesh }[],
  camera: THREE.PerspectiveCamera,
  width: number,
  height: number
) {
  const projected = items
    .map(({ planet, mesh }) => {
      const point = new THREE.Vector3();
      mesh.getWorldPosition(point);
      point.project(camera);
      return {
        planet,
        x: (point.x * 0.5 + 0.5) * width,
        y: (-point.y * 0.5 + 0.5) * height
      };
    })
    .sort((a, b) => a.x - b.x);

  const split = Math.ceil(projected.length / 2);
  const columns = [projected.slice(0, split), projected.slice(split)];
  const boxWidth = 600;
  const top = 260;
  const bottom = height - 190;

  columns.forEach((column, columnIndex) => {
    const side = columnIndex === 0 ? "left" : "right";
    const sorted = column.sort((a, b) => a.y - b.y);
    const slotHeight = (bottom - top) / Math.max(1, sorted.length);
    const boxHeight = Math.min(72, slotHeight - 8);
    const boxX = side === "left" ? 70 : width - boxWidth - 70;

    sorted.forEach(({ planet, x, y }, index) => {
      const boxY = top + index * slotHeight + (slotHeight - boxHeight) / 2;
      const edgeX = side === "left" ? boxX + boxWidth : boxX;
      const edgeY = boxY + boxHeight / 2;
      const anchorX = THREE.MathUtils.clamp(x, 0, width);
      const anchorY = THREE.MathUtils.clamp(y, 150, height - 130);

      context.save();
      context.globalAlpha = 0.42;
      context.strokeStyle = planet.color;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(anchorX, anchorY);
      context.lineTo(side === "left" ? edgeX + 28 : edgeX - 28, edgeY);
      context.lineTo(edgeX, edgeY);
      context.stroke();

      context.globalAlpha = 1;
      context.fillStyle = planet.color;
      context.beginPath();
      context.arc(anchorX, anchorY, 5, 0, Math.PI * 2);
      context.fill();

      context.beginPath();
      context.roundRect(boxX, boxY, boxWidth, boxHeight, 15);
      context.fillStyle = "rgba(7, 11, 27, .9)";
      context.fill();
      context.globalAlpha = 0.58;
      context.strokeStyle = planet.color;
      context.stroke();
      context.globalAlpha = 1;

      context.fillStyle = planet.color;
      context.beginPath();
      context.arc(boxX + 27, edgeY, 7, 0, Math.PI * 2);
      context.fill();

      const displayName = planet.name.length > 27 ? `${planet.name.slice(0, 26)}…` : planet.name;
      context.textBaseline = "middle";
      context.textAlign = "left";
      context.fillStyle = "#f4f7ff";
      context.font = "600 25px Inter, Arial, sans-serif";
      context.fillText(displayName, boxX + 49, edgeY, 390);

      context.textAlign = "right";
      context.fillStyle = "#aab6cf";
      context.font = "500 22px Inter, Arial, sans-serif";
      context.fillText(`★ ${planet.stars.toLocaleString("en-US")}`, boxX + boxWidth - 22, edgeY);
      context.restore();
    });
  });
}

export default function UniverseCanvas({
  planets,
  username,
  selected,
  onSelect,
  paused,
  zoom,
  onZoom,
  resetKey
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useRef(paused);
  const selectedRef = useRef(selected);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const exportRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    const direction = camera.position.clone().sub(controls.target).normalize();
    camera.position.copy(controls.target).add(direction.multiplyScalar(CAMERA_DISTANCE / zoom));
    controls.update();
  }, [zoom]);

  useEffect(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;
    controls.target.set(0, 0, 0);
    camera.position.set(27, 19, 37).normalize().multiplyScalar(CAMERA_DISTANCE);
    controls.update();
  }, [resetKey]);

  useEffect(() => {
    const nullableCanvas = canvasRef.current;
    if (!nullableCanvas) return;
    const canvas: HTMLCanvasElement = nullableCanvas;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050814");
    scene.fog = new THREE.FogExp2("#070b1a", 0.009);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 240);
    camera.position.set(27, 19, 37).normalize().multiplyScalar(CAMERA_DISTANCE);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.055;
    controls.minDistance = 16;
    controls.maxDistance = 86;
    controls.zoomSpeed = 0.7;
    controls.panSpeed = 0.55;
    controls.rotateSpeed = 0.45;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight("#9bc7ff", "#110a2b", 1.8));
    const keyLight = new THREE.PointLight("#8cecff", 1350, 75, 1.65);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight("#815cff", 2.5);
    rimLight.position.set(-16, 12, -10);
    scene.add(rimLight);

    const texture = glowTexture();
    const starRandom = seeded(hash(username));
    const starPositions = new Float32Array(2100 * 3);
    const starColors = new Float32Array(2100 * 3);
    const cool = new THREE.Color("#86c9ff");
    const warm = new THREE.Color("#dcc8ff");
    for (let index = 0; index < 2100; index++) {
      const radius = 55 + starRandom() * 105;
      const theta = starRandom() * Math.PI * 2;
      const phi = Math.acos(2 * starRandom() - 1);
      starPositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[index * 3 + 1] = radius * Math.cos(phi);
      starPositions[index * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      const color = cool.clone().lerp(warm, starRandom());
      starColors[index * 3] = color.r;
      starColors[index * 3 + 1] = color.g;
      starColors[index * 3 + 2] = color.b;
    }
    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starsGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const stars = new THREE.Points(
      starsGeometry,
      new THREE.PointsMaterial({
        size: 0.22,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.82,
        depthWrite: false
      })
    );
    scene.add(stars);

    const galaxyGeometry = new THREE.BufferGeometry();
    const galaxyPositions = new Float32Array(900 * 3);
    for (let index = 0; index < 900; index++) {
      const radius = 8 + Math.pow(starRandom(), 0.65) * 68;
      const angle = starRandom() * Math.PI * 2 + radius * 0.1;
      galaxyPositions[index * 3] = Math.cos(angle) * radius;
      galaxyPositions[index * 3 + 1] = (starRandom() - 0.5) * (3 + radius * 0.08);
      galaxyPositions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    galaxyGeometry.setAttribute("position", new THREE.BufferAttribute(galaxyPositions, 3));
    const galaxy = new THREE.Points(
      galaxyGeometry,
      new THREE.PointsMaterial({
        color: "#6156b8",
        size: 0.34,
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    galaxy.rotation.z = -0.14;
    scene.add(galaxy);

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(1.65, 48, 48),
      new THREE.MeshBasicMaterial({ color: "#dffcff" })
    );
    scene.add(sun);
    const sunGlow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: texture,
        color: "#5ee7ff",
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sunGlow.scale.setScalar(11);
    scene.add(sunGlow);

    const uniqueRadii = [...new Set(planets.map((planet) => planet.orbitRadius))];
    uniqueRadii.forEach((orbitRadius, index) => {
      const radius = orbitRadius * WORLD_SCALE;
      const points = Array.from({ length: 160 }, (_, pointIndex) => {
        const angle = (pointIndex / 160) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      });
      const ring = new THREE.LineLoop(
        new THREE.BufferGeometry().setFromPoints(points),
        new THREE.LineBasicMaterial({
          color: index % 2 ? "#6570b5" : "#68b4d0",
          transparent: true,
          opacity: 0.2
        })
      );
      scene.add(ring);
    });

    const planetMeshes: THREE.Mesh[] = [];
    const surfaceTextures: THREE.DataTexture[] = [];
    const labelTextures: THREE.CanvasTexture[] = [];
    const planetObjects = planets.map((planet) => {
      const size = Math.max(0.42, planet.radius * 0.082);
      const surface = createPlanetTexture(planet);
      surfaceTextures.push(surface.texture);
      const material = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        map: surface.texture,
        bumpMap: surface.texture,
        bumpScale: surface.style === 0 ? 0.018 : 0.065,
        emissive: surface.style === 3 ? surface.atmosphere : new THREE.Color(planet.color),
        emissiveIntensity: surface.style === 3 ? 0.16 : 0.035,
        roughness: surface.style === 0 ? 0.8 : 0.92,
        metalness: 0.015
      });
      const sphereGeometry = new THREE.SphereGeometry(size, 48, 32);
      const mesh = new THREE.Mesh(sphereGeometry, material);
      mesh.userData.planet = planet;
      scene.add(mesh);
      planetMeshes.push(mesh);

      const atmosphere = new THREE.Mesh(
        new THREE.SphereGeometry(size * 1.075, 36, 24),
        new THREE.MeshBasicMaterial({
          color: surface.atmosphere,
          transparent: true,
          opacity: 0.12 + planet.glowIntensity * 0.04,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      mesh.add(atmosphere);

      const glow = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: texture,
          color: surface.atmosphere,
          transparent: true,
          opacity: 0.1 + planet.glowIntensity * 0.08,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      glow.scale.setScalar(size * (2.7 + planet.glowIntensity * 0.5));
      mesh.add(glow);

      if (hash(`${planet.id}-rings`) % 7 === 0 && size > 0.58) {
        const planetaryRing = new THREE.Mesh(
          new THREE.RingGeometry(size * 1.28, size * 2.02, 72),
          new THREE.MeshBasicMaterial({
            color: surface.atmosphere,
            transparent: true,
            opacity: 0.34,
            side: THREE.DoubleSide,
            depthWrite: false
          })
        );
        planetaryRing.rotation.x = Math.PI / 2 + ((hash(`${planet.id}-tilt`) % 15) - 7) / 100;
        mesh.add(planetaryRing);
      }

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(size * 1.55, Math.max(0.025, size * 0.035), 10, 64),
        new THREE.MeshBasicMaterial({
          color: "#ffffff",
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
      halo.visible = false;
      halo.rotation.x = Math.PI / 2;
      mesh.add(halo);

      const labelTexture = createPlanetLabelTexture(planet);
      labelTextures.push(labelTexture);
      const labelMaterial = new THREE.SpriteMaterial({
        map: labelTexture,
        transparent: true,
        opacity: 0.78,
        depthTest: true,
        depthWrite: false
      });
      const label = new THREE.Sprite(labelMaterial);
      label.center.set(0.5, 0);
      label.position.set(0, size + 0.34, 0);
      label.renderOrder = 20;
      mesh.add(label);
      return { planet, mesh, halo, label, labelMaterial };
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDown = { x: 0, y: 0 };
    let simulationTime = 0;
    let lastTime = performance.now();
    let frame = 0;

    function hitTest(event: PointerEvent) {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(
        ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
        -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      );
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(planetMeshes, false)[0]?.object as THREE.Mesh | undefined;
    }

    const onPointerDown = (event: PointerEvent) => {
      pointerDown = { x: event.clientX, y: event.clientY };
    };
    const onPointerUp = (event: PointerEvent) => {
      if (Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) > 5) return;
      const hit = hitTest(event);
      if (hit?.userData.planet) onSelect(hit.userData.planet as Planet);
    };
    const onPointerMove = (event: PointerEvent) => {
      canvas.style.cursor = hitTest(event) ? "pointer" : "grab";
    };
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointermove", onPointerMove);

    let zoomTimer = 0;
    controls.addEventListener("change", () => {
      window.clearTimeout(zoomTimer);
      zoomTimer = window.setTimeout(() => {
        const nextZoom = Math.max(
          0.5,
          Math.min(2.5, CAMERA_DISTANCE / camera.position.distanceTo(controls.target))
        );
        onZoom(Number(nextZoom.toFixed(2)));
      }, 90);
    });

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / Math.max(bounds.height, 1);
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const handleExportRequest = () => exportRef.current?.();
    window.addEventListener("repoastral:export-png", handleExportRequest);

    exportRef.current = () => {
      const exportWidth = 3840;
      const exportHeight = 2160;
      const bounds = canvas.getBoundingClientRect();
      const previousPixelRatio = renderer.getPixelRatio();
      const previousAspect = camera.aspect;
      const labelVisibility = planetObjects.map(({ label }) => label.visible);

      // Export the clean solar system first; labels are composed separately to avoid overlap.
      planetObjects.forEach(({ label }) => {
        label.visible = false;
      });
      renderer.setPixelRatio(1);
      renderer.setSize(exportWidth, exportHeight, false);
      camera.aspect = exportWidth / exportHeight;
      camera.updateProjectionMatrix();
      controls.update();
      renderer.render(scene, camera);
      scene.updateMatrixWorld(true);

      const output = document.createElement("canvas");
      output.width = exportWidth;
      output.height = exportHeight;
      const context = output.getContext("2d");
      if (context) {
        context.drawImage(canvas, 0, 0, exportWidth, exportHeight);

        const topShade = context.createLinearGradient(0, 0, 0, 360);
        topShade.addColorStop(0, "rgba(3, 6, 18, .88)");
        topShade.addColorStop(1, "rgba(3, 6, 18, 0)");
        context.fillStyle = topShade;
        context.fillRect(0, 0, exportWidth, 380);

        const bottomShade = context.createLinearGradient(0, exportHeight - 260, 0, exportHeight);
        bottomShade.addColorStop(0, "rgba(3, 6, 18, 0)");
        bottomShade.addColorStop(1, "rgba(3, 6, 18, .82)");
        context.fillStyle = bottomShade;
        context.fillRect(0, exportHeight - 260, exportWidth, 260);

        context.fillStyle = "#f5f7ff";
        context.font = "600 70px Inter, Arial, sans-serif";
        context.fillText(`@${username}`, 86, 112);
        context.fillStyle = "#91a0bd";
        context.font = "32px Inter, Arial, sans-serif";
        const totalStars = planets.reduce((sum, planet) => sum + planet.stars, 0);
        context.fillText(
          `${planets.length} repositories  ·  ${totalStars.toLocaleString()} stars  ·  3D universe`,
          88,
          166
        );

        drawExportPlanetIndex(context, planetObjects, camera, exportWidth, exportHeight);

        context.fillStyle = "#f5f7ff";
        context.textAlign = "left";
        context.font = "600 30px Inter, Arial, sans-serif";
        context.fillText("Repo", 86, exportHeight - 84);
        const repoWidth = context.measureText("Repo").width;
        context.fillStyle = "#9b87f5";
        context.fillText("Astral", 86 + repoWidth, exportHeight - 84);
        context.fillStyle = "#64748b";
        context.font = "24px Inter, Arial, sans-serif";
        context.fillText("Your coding universe.", 86, exportHeight - 42);
      }

      // Restore the interactive renderer immediately after capturing.
      planetObjects.forEach(({ label }, index) => {
        label.visible = labelVisibility[index];
      });
      renderer.setPixelRatio(previousPixelRatio);
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = previousAspect;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);

      const download = (url: string, revoke = false) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = `repoastral-${username}.png`;
        link.click();
        if (revoke) window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
      output.toBlob((blob) => {
        if (blob) download(URL.createObjectURL(blob), true);
        else download(output.toDataURL("image/png"));
      }, "image/png");
    };

    const render = (time: number) => {
      const delta = Math.min(50, time - lastTime);
      lastTime = time;
      if (!pausedRef.current) simulationTime += delta;
      planetObjects.forEach(({ planet, mesh, halo, label, labelMaterial }) => {
        const angle = planet.initialAngle + simulationTime * planet.angularSpeed;
        const radius = planet.orbitRadius * WORLD_SCALE;
        mesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        mesh.rotation.y += delta * 0.00018;
        const isSelected = selectedRef.current?.id === planet.id;
        halo.visible = isSelected;
        if (halo.visible) halo.rotation.z += delta * 0.0007;
        const labelWidth = THREE.MathUtils.clamp(
          camera.position.distanceTo(mesh.position) * 0.095,
          3.6,
          5.8
        );
        label.scale.set(labelWidth, labelWidth * 0.25, 1);
        labelMaterial.opacity = isSelected ? 1 : 0.76;
      });
      const pulse = 1 + Math.sin(time * 0.0015) * 0.035;
      sun.scale.setScalar(pulse);
      sunGlow.scale.setScalar(11 * pulse);
      stars.rotation.y = time * 0.000008;
      galaxy.rotation.y = -time * 0.000015;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(zoomTimer);
      resizeObserver.disconnect();
      window.removeEventListener("repoastral:export-png", handleExportRequest);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointermove", onPointerMove);
      controls.dispose();
      scene.traverse((object) => {
        if (
          object instanceof THREE.Mesh ||
          object instanceof THREE.Points ||
          object instanceof THREE.Line
        ) {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        } else if (object instanceof THREE.Sprite) {
          object.material.dispose();
        }
      });
      surfaceTextures.forEach((surfaceTexture) => surfaceTexture.dispose());
      labelTextures.forEach((labelTexture) => labelTexture.dispose());
      texture.dispose();
      renderer.dispose();
      exportRef.current = null;
      cameraRef.current = null;
      controlsRef.current = null;
    };
  }, [planets, username, onSelect, onZoom]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Interactive 3D universe for ${username}`}
      className="absolute inset-0 h-full w-full cursor-grab touch-none active:cursor-grabbing"
    />
  );
}
