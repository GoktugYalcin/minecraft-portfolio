'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const MinecraftScene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;

        if (mountRef.current) {
            mountRef.current.appendChild(renderer.domElement);
        }

        const cameraHelper = new THREE.Object3D();
        cameraHelper.add(camera);
        scene.add(cameraHelper);

        const keyState: { [key: string]: boolean } = {};

        const onKeyDown = (event: KeyboardEvent) => {
            keyState[event.code] = true;
        };

        const onKeyUp = (event: KeyboardEvent) => {
            keyState[event.code] = false;
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        const moveSpeed = 0.25;
        const rotateSpeed = 0.075;
        const boundary = {
            minX: -49,
            maxX: 49,
            minY: 1,
            maxY: 19,
            minZ: -49,
            maxZ: 49,
        };

        const collisionObjects: THREE.Mesh[] = [];

        const checkCollision = (position: THREE.Vector3): boolean => {
            const playerBoundingBox = new THREE.Box3().setFromCenterAndSize(
                position,
                new THREE.Vector3(0.5, 1, 0.5)
            );

            for (const object of collisionObjects) {
                const objectBoundingBox = new THREE.Box3().setFromObject(object);
                if (playerBoundingBox.intersectsBox(objectBoundingBox)) {
                    return true;
                }
            }
            return false;
        };

        const animate = () => {
            if (keyState['ArrowLeft']) cameraHelper.rotation.y += rotateSpeed;
            if (keyState['ArrowRight']) cameraHelper.rotation.y -= rotateSpeed;
            if (keyState['ArrowUp']) camera.rotation.x += rotateSpeed;
            if (keyState['ArrowDown']) camera.rotation.x -= rotateSpeed;

            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

            const forward = new THREE.Vector3(0, 0, -1);
            forward.applyQuaternion(cameraHelper.quaternion);
            const right = new THREE.Vector3(1, 0, 0);
            right.applyQuaternion(cameraHelper.quaternion);

            const originalPosition = cameraHelper.position.clone();

            if (keyState['KeyW']) cameraHelper.position.addScaledVector(forward, moveSpeed);
            if (keyState['KeyS']) cameraHelper.position.addScaledVector(forward, -moveSpeed);
            if (keyState['KeyA']) cameraHelper.position.addScaledVector(right, -moveSpeed);
            if (keyState['KeyD']) cameraHelper.position.addScaledVector(right, moveSpeed);

            if (checkCollision(cameraHelper.position)) {
                cameraHelper.position.copy(originalPosition);
            }

            cameraHelper.position.x = Math.max(boundary.minX, Math.min(boundary.maxX, cameraHelper.position.x));
            cameraHelper.position.y = Math.max(boundary.minY, Math.min(boundary.maxY, cameraHelper.position.y));
            cameraHelper.position.z = Math.max(boundary.minZ, Math.min(boundary.maxZ, cameraHelper.position.z));

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };

        const textureLoader = new THREE.TextureLoader();
        const grassTexture = textureLoader.load('/textures/grass.png');
        const stoneTexture = textureLoader.load('/textures/stone.png');
        const dirtTexture = textureLoader.load('/textures/dirt.png');
        const woodTexture = textureLoader.load('/textures/wood.png');
        const leafTexture = textureLoader.load('/textures/leaf.png');

        const skyColor = new THREE.Color(0x87CEEB);
        scene.background = skyColor;

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        scene.add(directionalLight);

        const cubeSize = 1;
        const gridSize = 100;
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

        const createBlock = (texture: THREE.Texture, x: number, y: number, z: number) => {
            const material = new THREE.MeshStandardMaterial({
                map: texture,
                transparent: true,
                opacity: 1.0,
                alphaTest: 0.1
            });
            const block = new THREE.Mesh(geometry, material);
            block.position.set(x, y, z);
            block.castShadow = true;
            block.receiveShadow = true;
            return block;
        };

        for (let x = -gridSize / 2; x < gridSize / 2; x++) {
            for (let z = -gridSize / 2; z < gridSize / 2; z++) {
                const texture = Math.random() > 0.5 ? grassTexture : dirtTexture;
                const block = createBlock(texture, x * cubeSize, 0, z * cubeSize);
                scene.add(block);
            }
        }

        const addTree = (x: number, z: number) => {
            for (let y = 1; y <= 3; y++) {
                const trunkBlock = createBlock(woodTexture, x, y, z);
                scene.add(trunkBlock);
                collisionObjects.push(trunkBlock);
            }

            const leafHeight = 3;
            for (let y = leafHeight; y > 0; y--) {
                const layerY = 4 + (leafHeight - y);
                for (let offsetX = -y; offsetX <= y; offsetX++) {
                    for (let offsetZ = -y; offsetZ <= y; offsetZ++) {
                        const leafBlock = createBlock(leafTexture, x + offsetX, layerY, z + offsetZ);
                        scene.add(leafBlock);
                        collisionObjects.push(leafBlock);
                    }
                }
            }
        };

        for (let i = 0; i < 10; i++) {
            const x = Math.floor(Math.random() * gridSize) - gridSize / 2;
            const z = Math.floor(Math.random() * gridSize) - gridSize / 2;
            addTree(x, z);
        }

        const planeGeometry = new THREE.PlaneGeometry(gridSize * cubeSize, gridSize * cubeSize);
        const planeMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.5;
        plane.receiveShadow = true;
        scene.add(plane);

        cameraHelper.position.set(5, 2, 5);

        animate();

        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);

            grassTexture.dispose();
            stoneTexture.dispose();
            woodTexture.dispose();
            dirtTexture.dispose();
            leafTexture.dispose();
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{ width: '100vw', height: '100vh' }}
        />
    );
};

export default MinecraftScene;