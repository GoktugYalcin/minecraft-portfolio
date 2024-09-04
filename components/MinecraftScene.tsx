import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  initializeControls,
  handleKeyDown,
  handleResize,
} from "@/sidestructures/controls";
import { loadTextures } from "@/sidestructures/utils";
import {
  createAmbientLight,
  createDirectionalLight,
} from "@/sidestructures/lighting";
import { createBlock, addTree } from "@/sidestructures/objects";
import {
  boundary,
  moveSpeed,
  rotateSpeed,
  gridSize,
} from "@/sidestructures/consts";
import { Raleway } from "next/font/google";

const font = Raleway({
  weight: "400",
  subsets: ["latin"],
});

const MinecraftScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const skyboxRef = useRef<THREE.Mesh | null>(null);
  const isPointerLocked = useRef(false);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    } else {
      console.error("Failed to find the mounting element.");
      return;
    }

    const cameraHelper = new THREE.Object3D();
    cameraHelper.add(camera);
    scene.add(cameraHelper);

    const keyState: { [key: string]: boolean } = {};
    const removeControls = initializeControls(keyState);

    const collisionObjects: THREE.Mesh[] = [];
    const textures = loadTextures(renderer);

    const ambientLight = createAmbientLight();
    scene.add(ambientLight);

    const directionalLight = createDirectionalLight();
    scene.add(directionalLight);

    const skyboxGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyboxTexture = new THREE.TextureLoader().load(
      "/textures/skybox.png",
    );
    const skyboxMaterial = new THREE.MeshBasicMaterial({
      map: skyboxTexture,
      side: THREE.BackSide,
    });
    const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    scene.add(skyboxMesh);
    skyboxRef.current = skyboxMesh;

    const cubeSize = 1;
    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        const texture = Math.random() > 0.5 ? textures.grass : textures.dirt;
        const block = createBlock(
          texture,
          x * cubeSize,
          0,
          z * cubeSize,
          geometry,
        );
        scene.add(block);
      }
    }

    const edgeDistance = gridSize / 2 - 2;
    for (let i = -edgeDistance; i <= edgeDistance; i += 5) {
      addTree(-edgeDistance, i, textures, geometry, scene, collisionObjects);
      addTree(edgeDistance, i, textures, geometry, scene, collisionObjects);
      addTree(i, -edgeDistance, textures, geometry, scene, collisionObjects);
      addTree(i, edgeDistance, textures, geometry, scene, collisionObjects);
    }

    const planeGeometry = new THREE.PlaneGeometry(
      gridSize * cubeSize,
      gridSize * cubeSize,
    );
    const planeMaterial = new THREE.MeshStandardMaterial({
      map: textures.grass,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -0.5;
    plane.receiveShadow = true;
    scene.add(plane);

    const createHouse = (centerX: number, centerZ: number, title: string) => {
      const houseSize = 4;
      const halfSize = houseSize / 2;

      const material = textures.stone;

      for (let y = 0; y < houseSize; y++) {
        for (let i = 0; i < houseSize; i++) {
          for (let j = 0; j < houseSize; j++) {
            if (j === houseSize - 1) continue;
            if (i > 0 && i < houseSize - 1 && j > 0 && j < houseSize - 1)
              continue;

            const x = centerX - halfSize + i * cubeSize;
            const z = centerZ - halfSize + j * cubeSize;

            const block = createBlock(material, x, y * cubeSize, z, geometry);
            scene.add(block);
          }
        }
      }

      for (let i = 0; i < houseSize; i++) {
        for (let j = 0; j < houseSize; j++) {
          const x = centerX - halfSize + i * cubeSize;
          const z = centerZ - halfSize + j * cubeSize;

          const block = createBlock(
            material,
            x,
            houseSize * cubeSize,
            z,
            geometry,
          );
          scene.add(block);
        }
      }

      const panelWidth = 2 * cubeSize;
      const panelHeight = cubeSize;

      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 128;
      const context = canvas.getContext("2d");

      if (context) {
        const plankImage = new Image();
        plankImage.src = "/textures/plank.png";
        plankImage.onload = () => {
          context.drawImage(plankImage, 0, 0, canvas.width, canvas.height);

          context.fillStyle = "black";
          context.font = `bolder 36px ${font.style.fontFamily}`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText(title, canvas.width / 2, canvas.height / 2);

          const texture = new THREE.CanvasTexture(canvas);
          const panelMaterial = new THREE.MeshBasicMaterial({ map: texture });

          const panelGeometry = new THREE.PlaneGeometry(
            panelWidth,
            panelHeight,
          );
          const panel = new THREE.Mesh(panelGeometry, panelMaterial);

          panel.position.set(
            centerX - 0.5,
            houseSize * cubeSize,
            centerZ + halfSize * cubeSize - 0.45,
          );
          panel.rotation.y = 0;

          scene.add(panel);
        };
      }
    };
    const startPoint = gridSize / 2 - 12;
    createHouse(startPoint, -10, "📋 CV");
    createHouse(startPoint - 8, -10, "🧑🏽‍💻 Projects");
    createHouse(startPoint - 16, -10, "📸 Photos");
    createHouse(startPoint - 24, -10, "✍🏼 Blog");
    createHouse(startPoint - 32, -10, "📓 Guestbook");

    const mouseSensitivity = 0.1;
    const verticalLimit = 1.5;

    const onMouseMove = (event: MouseEvent) => {
      if (isPointerLocked.current) {
        const deltaX = event.movementX * mouseSensitivity;
        const deltaY = event.movementY * mouseSensitivity;

        cameraHelper.rotation.y -= deltaX;
        camera.rotation.x -= deltaY;

        camera.rotation.x = Math.max(
          -verticalLimit,
          Math.min(verticalLimit, camera.rotation.x),
        );
      }
    };

    const onPointerLockChange = () => {
      isPointerLocked.current =
        document.pointerLockElement === mountRef.current;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        document.exitPointerLock();
      }
    };

    const requestPointerLock = () => {
      mountRef.current?.requestPointerLock();
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);
    window.addEventListener("keydown", onKeyDown);

    window.addEventListener("click", requestPointerLock);

    cameraHelper.position.set(0, 2, gridSize / 2 - 3);

    window.addEventListener("resize", () => handleResize(camera, renderer));

    const clock = new THREE.Clock();
    const maxFPS = 60;

    const animate = () => {
      const delta = clock.getDelta();
      if (delta < 1 / maxFPS) {
        requestAnimationFrame(animate);
        return;
      }

      if (skyboxRef.current) {
        skyboxRef.current.rotation.y += 0.001;
      }

      handleKeyDown(
        keyState,
        cameraHelper,
        camera,
        moveSpeed,
        rotateSpeed,
        collisionObjects,
        boundary,
      );

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", requestPointerLock);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      window.removeEventListener("keydown", onKeyDown);

      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      removeControls();

      Object.values(textures).forEach((texture) => texture.dispose());
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ width: "100vw", height: "100vh", position: "relative" }}
    >
      {/* Crosshair */}
      <div
        id="crosshair"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "20px",
          height: "20px",
          background: "transparent",
          pointerEvents: "none",
          transform: "translate(-50%, -50%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "2px",
            height: "20px",
            backgroundColor: "white",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "20px",
            height: "2px",
            backgroundColor: "white",
          }}
        />
      </div>
    </div>
  );
};

export default MinecraftScene;
