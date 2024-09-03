'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createBlock } from "@/utils/createBlock";

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
            minX: -28,
            maxX: 28,
            minY: 1,
            maxY: 19,
            minZ: -28,
            maxZ: 28,
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
        const textures = {
            grass: textureLoader.load('/textures/grass.png'),
            stone: textureLoader.load('/textures/stone.png'),
            dirt: textureLoader.load('/textures/dirt.png'),
            wood: textureLoader.load('/textures/wood.png'),
            leaf: textureLoader.load('/textures/leaf.png'),
        };

        Object.values(textures).forEach(texture => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        });

        const skyColor = new THREE.Color(0x87CEEB);
        scene.background = skyColor;

        const ambientLight = new THREE.AmbientLight(0x606060);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 512;
        directionalLight.shadow.mapSize.height = 512;
        scene.add(directionalLight);

        const cubeSize = 1;
        const gridSize = 60;
        const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

        for (let x = -gridSize / 2; x < gridSize / 2; x++) {
            for (let z = -gridSize / 2; z < gridSize / 2; z++) {
                const texture = Math.random() > 0.5 ? textures.grass : textures.dirt;
                const block = createBlock(texture, x * cubeSize, 0, z * cubeSize, geometry);
                scene.add(block);
            }
        }

        const addTree = (x: number, z: number) => {
            for (let y = 1; y <= 3; y++) {
                const trunkBlock = createBlock(textures.wood, x, y, z, geometry);
                scene.add(trunkBlock);
                collisionObjects.push(trunkBlock);
            }

            const leafHeight = 4;
            for (let y = leafHeight; y > 0; y--) {
                const layerY = 4 + (leafHeight - y);
                for (let offsetX = -y; offsetX <= y; offsetX++) {
                    for (let offsetZ = -y; offsetZ <= y; offsetZ++) {
                        const leafBlock = createBlock(textures.leaf, x + offsetX, layerY, z + offsetZ, geometry);
                        scene.add(leafBlock);
                        collisionObjects.push(leafBlock);
                    }
                }
            }
        };

        const edgeDistance = gridSize / 2 - 2;
        for (let i = -edgeDistance; i <= edgeDistance; i += 5) {
            addTree(-edgeDistance, i);
            addTree(edgeDistance, i);
            addTree(i, -edgeDistance);
            addTree(i, edgeDistance);
        }

        const planeGeometry = new THREE.PlaneGeometry(gridSize * cubeSize, gridSize * cubeSize);
        const planeMaterial = new THREE.MeshStandardMaterial({ map: textures.grass });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.5;
        plane.receiveShadow = true;
        scene.add(plane);

        cameraHelper.position.set(0, 2, 28);

        animate();

        return () => {
            if (mountRef.current) {
                mountRef.current.removeChild(renderer.domElement);
            }
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);

            Object.values(textures).forEach(texture => texture.dispose());
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
