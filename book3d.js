import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

/**
 * ============================================================================
 * 3D INTERACTIVE HARDCOVER BOOK — IMAN SETIA'S LIBRARY
 * ============================================================================
 */

const COVER_IMAGE_URL = "https://picsum.photos/seed/tanizaki-shadows/600/900?grayscale";
const BOOK_TITLE = "IN PRAISE OF SHADOWS";
const BOOK_AUTHOR = "JUN’ICHIRŌ TANIZAKI";

function initBook3D() {
  const container = document.getElementById("book-canvas-container");
  const fallbackEl = document.getElementById("book-fallback");
  const heroSection = document.getElementById("hero");

  if (!container) return;

  // VARIABEL DIPINDAHKAN KE ATAS AGAR TIDAK ERROR "Cannot access before initialization"
  let isHeroVisible = true;
  let animationFrameId = null;
  const clock = new THREE.Clock();

  // Helper to show 2D fallback image if WebGL fails
  function showFallback() {
    if (fallbackEl) {
      fallbackEl.hidden = false;
    }
  }

  // 1. Check WebGL availability & initialize Renderer
  let renderer;
  try {
    const testCanvas = document.createElement("canvas");
    const gl =
      testCanvas.getContext("webgl2") ||
      testCanvas.getContext("webgl") ||
      testCanvas.getContext("experimental-webgl");

    if (!gl) {
      showFallback();
      return;
    }

    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
  } catch (err) {
    showFallback();
    return;
  }

  // Cap pixel ratio at 2
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  // Hide fallback and mount canvas
  if (fallbackEl) fallbackEl.hidden = true;
  container.appendChild(renderer.domElement);

  // 2. Scene & Camera Setup
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    34,
    container.clientWidth / container.clientHeight,
    0.1,
    50
  );
  camera.position.set(0, 0.15, 7.2);
  camera.lookAt(0, 0, 0);

  // 3. Soft Lighting (Ambient + Directional + Fill)
  const ambientLight = new THREE.AmbientLight(0xfffbf4, 1.55);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xfff7ea, 1.9);
  keyLight.position.set(4.5, 6.0, 5.5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xe6dfd5, 0.75);
  rimLight.position.set(-5.0, 2.0, -3.5);
  scene.add(rimLight);

  function updateThemeLighting(theme) {
    const isDark = theme === "dark";
    if (isDark) {
      ambientLight.color.setHex(0xd8d0c5);
      ambientLight.intensity = 1.05;
      keyLight.color.setHex(0xffe9c8);
      keyLight.intensity = 1.45;
      rimLight.intensity = 0.55;
      if (shadowMesh) shadowMesh.material.opacity = 0.42;
    } else {
      ambientLight.color.setHex(0xfffbf4);
      ambientLight.intensity = 1.65;
      keyLight.color.setHex(0xfff7ea);
      keyLight.intensity = 1.95;
      rimLight.intensity = 0.75;
      if (shadowMesh) shadowMesh.material.opacity = 0.22;
    }
    requestRenderIfStatic();
  }

  // 4. Procedural Canvas Textures
  function createSpineTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 1536;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0);
    grad.addColorStop(0.0, "#101214");
    grad.addColorStop(0.18, "#232629");
    grad.addColorStop(0.5, "#2b2e31");
    grad.addColorStop(0.82, "#232629");
    grad.addColorStop(1.0, "#0f1113");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += 6) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#d8cfc2";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(44, 110);
    ctx.lineTo(canvas.width - 44, 110);
    ctx.moveTo(44, canvas.height - 110);
    ctx.lineTo(canvas.width - 44, canvas.height - 110);
    ctx.stroke();

    ctx.fillStyle = "#d8cfc2";
    ctx.font = "500 30px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("01", canvas.width / 2, 82);

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);

    ctx.fillStyle = "#f2ebe4";
    ctx.font = "400 54px Georgia, 'Instrument Serif', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(BOOK_TITLE, -110, 0);

    ctx.fillStyle = "#a79f94";
    ctx.font = "400 28px 'IBM Plex Mono', monospace";
    ctx.fillText(BOOK_AUTHOR, 340, 0);
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function createCoverTexture(loadedImage = null) {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#1d1f21";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (loadedImage) {
      ctx.save();
      ctx.filter = "grayscale(100%) contrast(1.06)";
      ctx.drawImage(loadedImage, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      const radGrad = ctx.createRadialGradient(400, 600, 220, 400, 600, 720);
      radGrad.addColorStop(0, "rgba(0,0,0,0.05)");
      radGrad.addColorStop(1, "rgba(0,0,0,0.45)");
      ctx.fillStyle = radGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "rgba(242, 235, 228, 0.92)";
    ctx.fillRect(90, 96, 620, 260);
    ctx.strokeStyle = "rgba(13, 20, 27, 0.35)";
    ctx.lineWidth = 2;
    ctx.strokeRect(102, 108, 596, 236);

    ctx.fillStyle = "#0D141B";
    ctx.textAlign = "center";
    ctx.font = "400 58px Georgia, 'Instrument Serif', serif";
    ctx.fillText("In Praise of Shadows", 400, 195);

    ctx.fillStyle = "#5c5852";
    ctx.font = "400 22px 'IBM Plex Mono', monospace";
    ctx.fillText("JUN’ICHIRŌ TANIZAKI · EDITION 01", 400, 265);

    const spineGroove = ctx.createLinearGradient(0, 0, 56, 0);
    spineGroove.addColorStop(0.0, "rgba(0, 0, 0, 0.58)");
    spineGroove.addColorStop(0.45, "rgba(0, 0, 0, 0.18)");
    spineGroove.addColorStop(0.75, "rgba(255, 255, 255, 0.08)");
    spineGroove.addColorStop(1.0, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = spineGroove;
    ctx.fillRect(0, 0, 56, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function createInteriorPageTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#F4EFE6";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const gutter = ctx.createLinearGradient(0, 0, 90, 0);
    gutter.addColorStop(0, "rgba(13, 20, 27, 0.22)");
    gutter.addColorStop(1, "rgba(13, 20, 27, 0)");
    ctx.fillStyle = gutter;
    ctx.fillRect(0, 0, 90, canvas.height);

    ctx.fillStyle = "#555049";
    ctx.font = "400 16px 'IBM Plex Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("EX LIBRIS · IMAN SETIA", canvas.width / 2 + 12, 260);

    ctx.fillStyle = "#1c1c1a";
    ctx.font = "italic 34px Georgia, serif";
    ctx.fillText("In Praise of Shadows", canvas.width / 2 + 12, 320);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function createPageEdgeTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#EFEAE0";
    ctx.fillRect(0, 0, 128, 128);

    ctx.fillStyle = "rgba(13, 20, 27, 0.07)";
    for (let x = 0; x < 128; x += 3) {
      ctx.fillRect(x, 0, 1, 128);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 1);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  function createShadowTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 120);
    grad.addColorStop(0.0, "rgba(10, 10, 10, 0.7)");
    grad.addColorStop(0.55, "rgba(10, 10, 10, 0.22)");
    grad.addColorStop(1.0, "rgba(10, 10, 10, 0)");

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    return new THREE.CanvasTexture(canvas);
  }

  // 5. Build Hardcover Book Geometry
  const bookWidth = 2.1;
  const bookHeight = 3.15;
  const bookThickness = 0.34;
  const boardThickness = 0.045;
  const pageOverhang = 0.06;

  const bookRoot = new THREE.Group();
  const baseRotationY = -0.32;
  const baseRotationX = 0.08;
  bookRoot.rotation.set(baseRotationX, baseRotationY, 0);
  scene.add(bookRoot);

  const clothMaterial = new THREE.MeshStandardMaterial({
    color: 0x222528,
    roughness: 0.82,
    metalness: 0.04
  });

  const endpaperMaterial = new THREE.MeshStandardMaterial({
    color: 0xe6dfd3,
    roughness: 0.9,
    metalness: 0.0
  });

  const coverTexture = createCoverTexture(null);
  const frontCoverFaceMaterial = new THREE.MeshStandardMaterial({
    map: coverTexture,
    roughness: 0.68,
    metalness: 0.04
  });

  const textureLoader = new THREE.TextureLoader();
  textureLoader.setCrossOrigin("anonymous");
  textureLoader.load(
    COVER_IMAGE_URL,
    (loadedTex) => {
      const updatedCoverTex = createCoverTexture(loadedTex.image);
      frontCoverFaceMaterial.map.dispose();
      frontCoverFaceMaterial.map = updatedCoverTex;
      frontCoverFaceMaterial.needsUpdate = true;
      requestRenderIfStatic();
    }
  );

  const backCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, boardThickness);
  const backCoverMaterials = [
    clothMaterial,
    clothMaterial,
    clothMaterial,
    clothMaterial,
    endpaperMaterial,
    clothMaterial
  ];
  const backCoverMesh = new THREE.Mesh(backCoverGeo, backCoverMaterials);
  backCoverMesh.position.set(0, 0, -(bookThickness / 2 - boardThickness / 2));
  bookRoot.add(backCoverMesh);

  const spineWidth = boardThickness * 1.35;
  const spineGeo = new THREE.BoxGeometry(spineWidth, bookHeight, bookThickness);
  const spineTitleMaterial = new THREE.MeshStandardMaterial({
    map: createSpineTexture(),
    roughness: 0.72,
    metalness: 0.05
  });
  const spineMaterials = [
    clothMaterial,
    spineTitleMaterial,
    clothMaterial,
    clothMaterial,
    clothMaterial,
    clothMaterial
  ];
  const spineMesh = new THREE.Mesh(spineGeo, spineMaterials);
  spineMesh.position.set(-bookWidth / 2 + spineWidth / 2 - 0.01, 0, 0);
  bookRoot.add(spineMesh);

  const pageWidth = bookWidth - pageOverhang - spineWidth * 0.5;
  const pageHeight = bookHeight - pageOverhang * 1.8;
  const pageThickness = bookThickness - boardThickness * 2.05;

  const pageEdgeMat = new THREE.MeshStandardMaterial({
    map: createPageEdgeTexture(),
    roughness: 0.88,
    metalness: 0.0
  });

  const interiorPageMat = new THREE.MeshStandardMaterial({
    map: createInteriorPageTexture(),
    roughness: 0.85,
    metalness: 0.0
  });

  const pageBlockGeo = new THREE.BoxGeometry(pageWidth, pageHeight, pageThickness);
  const pageBlockMaterials = [
    pageEdgeMat,
    pageEdgeMat,
    pageEdgeMat,
    pageEdgeMat,
    interiorPageMat,
    pageEdgeMat
  ];
  const pageBlockMesh = new THREE.Mesh(pageBlockGeo, pageBlockMaterials);
  pageBlockMesh.position.set((spineWidth * 0.5 - pageOverhang * 0.5) * 0.5, 0, 0);
  bookRoot.add(pageBlockMesh);

  const frontCoverPivot = new THREE.Group();
  frontCoverPivot.position.set(
    -bookWidth / 2 + boardThickness * 0.5,
    0,
    bookThickness / 2 - boardThickness / 2
  );
  bookRoot.add(frontCoverPivot);

  const frontCoverGeo = new THREE.BoxGeometry(bookWidth, bookHeight, boardThickness);
  const frontCoverMaterials = [
    clothMaterial,
    clothMaterial,
    clothMaterial,
    clothMaterial,
    frontCoverFaceMaterial,
    endpaperMaterial
  ];
  const frontCoverMesh = new THREE.Mesh(frontCoverGeo, frontCoverMaterials);
  frontCoverMesh.position.set(bookWidth / 2 - boardThickness * 0.5, 0, 0);
  frontCoverPivot.add(frontCoverMesh);

  const shadowGeo = new THREE.PlaneGeometry(3.5, 1.9);
  const shadowMat = new THREE.MeshBasicMaterial({
    map: createShadowTexture(),
    transparent: true,
    opacity: 0.22,
    depthWrite: false
  });
  let shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x = -Math.PI / 2;
  shadowMesh.position.set(0, -1.92, 0);
  scene.add(shadowMesh);

  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  updateThemeLighting(currentTheme);

  window.addEventListener("themechange", (e) => {
    const nextTheme = e.detail && e.detail.theme ? e.detail.theme : "light";
    updateThemeLighting(nextTheme);
  });

  // 6. Interaction State
  let isDragging = false;
  let isHovered = false;
  let isTappedOpen = false;

  let previousPointerX = 0;
  let previousPointerY = 0;

  let userRotationY = 0;
  let userRotationX = 0;
  let velocityY = 0;
  let velocityX = 0;

  let currentCoverOpenAngle = 0;
  const OPEN_ANGLE_RAD = THREE.MathUtils.degToRad(25);
  const MAX_IDLE_ROT_RAD = THREE.MathUtils.degToRad(8);

  const prefersReducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let prefersReducedMotion = prefersReducedMotionQuery.matches;
  prefersReducedMotionQuery.addEventListener("change", (e) => {
    prefersReducedMotion = e.matches;
    requestRenderIfStatic();
  });

  container.addEventListener("mouseenter", () => {
    isHovered = true;
    requestRenderIfStatic();
  });

  container.addEventListener("mouseleave", () => {
    isHovered = false;
    isDragging = false;
    requestRenderIfStatic();
  });

  container.addEventListener("mousedown", (e) => {
    isDragging = true;
    previousPointerX = e.clientX;
    previousPointerY = e.clientY;
    velocityY = 0;
    velocityX = 0;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - previousPointerX;
    const deltaY = e.clientY - previousPointerY;

    previousPointerX = e.clientX;
    previousPointerY = e.clientY;

    velocityY = deltaX * 0.0085;
    velocityX = deltaY * 0.0045;

    userRotationY += velocityY;
    userRotationX = THREE.MathUtils.clamp(userRotationX + velocityX, -0.45, 0.45);
    requestRenderIfStatic();
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
  });

  let touchStartX = 0;
  let touchStartY = 0;
  let touchStartTime = 0;
  let touchLockHorizontal = null;

  container.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      previousPointerX = touch.clientX;
      previousPointerY = touch.clientY;
      touchStartTime = performance.now();
      touchLockHorizontal = null;
      isDragging = true;
      velocityY = 0;
      velocityX = 0;
    },
    { passive: true }
  );

  container.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const touch = e.touches[0];
      const totalDx = Math.abs(touch.clientX - touchStartX);
      const totalDy = Math.abs(touch.clientY - touchStartY);

      if (touchLockHorizontal === null && (totalDx > 5 || totalDy > 5)) {
        touchLockHorizontal = totalDx > totalDy;
      }

      if (touchLockHorizontal) {
        const deltaX = touch.clientX - previousPointerX;
        velocityY = deltaX * 0.009;
        userRotationY += velocityY;
        requestRenderIfStatic();
      }

      previousPointerX = touch.clientX;
      previousPointerY = touch.clientY;
    },
    { passive: true }
  );

  container.addEventListener(
    "touchend",
    (e) => {
      isDragging = false;
      const elapsed = performance.now() - touchStartTime;
      const changedTouch = e.changedTouches[0];
      if (changedTouch) {
        const moveDist = Math.hypot(
          changedTouch.clientX - touchStartX,
          changedTouch.clientY - touchStartY
        );
        if (moveDist < 10 && elapsed < 300) {
          isTappedOpen = !isTappedOpen;
          requestRenderIfStatic();
        }
      }
      touchLockHorizontal = null;
    },
    { passive: true }
  );

  function handleResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    requestRenderIfStatic();
  }

  window.addEventListener("resize", handleResize);

  function renderFrame() {
    animationFrameId = null;

    if (!isHeroVisible) return;

    const elapsedTime = clock.getElapsedTime();

    if (!isDragging) {
      userRotationY += velocityY;
      userRotationX = THREE.MathUtils.clamp(userRotationX + velocityX, -0.45, 0.45);
      velocityY *= 0.93;
      velocityX *= 0.93;

      if (Math.abs(velocityY) < 0.00005) velocityY = 0;
      if (Math.abs(velocityX) < 0.00005) velocityX = 0;
    }

    let idleOffsetY = 0;
    let idleRotY = 0;
    let idleRotZ = 0;

    if (!prefersReducedMotion) {
      idleOffsetY = Math.sin(elapsedTime * 1.35) * 0.075;
      idleRotY = Math.sin(elapsedTime * 0.75) * MAX_IDLE_ROT_RAD;
      idleRotZ = Math.cos(elapsedTime * 0.95) * 0.025;
    }

    const shouldOpenCover = isHovered || isTappedOpen;
    const targetOpenAngle = shouldOpenCover ? -OPEN_ANGLE_RAD : 0;
    currentCoverOpenAngle += (targetOpenAngle - currentCoverOpenAngle) * 0.1;
    frontCoverPivot.rotation.y = currentCoverOpenAngle;

    const hoverTiltX = shouldOpenCover ? 0.06 : 0;
    const hoverTiltY = shouldOpenCover ? 0.12 : 0;

    bookRoot.position.y = idleOffsetY;
    bookRoot.rotation.y = baseRotationY + userRotationY + idleRotY + hoverTiltY;
    bookRoot.rotation.x = baseRotationX + userRotationX + hoverTiltX;
    bookRoot.rotation.z = idleRotZ;

    const shadowScale = 1 - idleOffsetY * 0.85;
    shadowMesh.scale.set(shadowScale, shadowScale, 1);

    renderer.render(scene, camera);

    const isSettling =
      Math.abs(velocityY) > 0.0001 ||
      Math.abs(velocityX) > 0.0001 ||
      Math.abs(targetOpenAngle - currentCoverOpenAngle) > 0.001 ||
      isDragging;

    if (!prefersReducedMotion || isSettling) {
      animationFrameId = requestAnimationFrame(renderFrame);
    }
  }

  function startLoop() {
    if (animationFrameId === null && isHeroVisible) {
      clock.getDelta();
      animationFrameId = requestAnimationFrame(renderFrame);
    }
  }

  function stopLoop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function requestRenderIfStatic() {
    if (isHeroVisible && animationFrameId === null) {
      animationFrameId = requestAnimationFrame(renderFrame);
    }
  }

  if ("IntersectionObserver" in window && heroSection) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isHeroVisible = entry.isIntersecting;
          if (isHeroVisible) {
            startLoop();
          } else {
            stopLoop();
          }
        });
      },
      { threshold: 0.02 }
    );
    heroObserver.observe(heroSection);
  }

  startLoop();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBook3D);
} else {
  initBook3D();
}
