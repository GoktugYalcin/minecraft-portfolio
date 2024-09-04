import * as THREE from 'three';

export const handleKeyDown = (
    keyState: { [key: string]: boolean },
    cameraHelper: THREE.Object3D,
    camera: THREE.PerspectiveCamera,
    moveSpeed: number,
    rotateSpeed: number,
    collisionObjects: THREE.Mesh[],
    boundary: { minX: number; maxX: number; minY: number; maxY: number; minZ: number; maxZ: number }
) => {
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

    if (checkCollision(cameraHelper.position, collisionObjects)) {
        cameraHelper.position.copy(originalPosition);
    }

    cameraHelper.position.x = Math.max(boundary.minX, Math.min(boundary.maxX, cameraHelper.position.x));
    cameraHelper.position.y = Math.max(boundary.minY, Math.min(boundary.maxY, cameraHelper.position.y));
    cameraHelper.position.z = Math.max(boundary.minZ, Math.min(boundary.maxZ, cameraHelper.position.z));
};

export const checkCollision = (position: THREE.Vector3, collisionObjects: THREE.Mesh[]): boolean => {
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

export const handleKeyUp = (event: KeyboardEvent, keyState: { [key: string]: boolean }) => {
    keyState[event.code] = false;
};

export const initializeControls = (keyState: { [key: string]: boolean }) => {
    const onKeyDown = (event: KeyboardEvent) => {
        keyState[event.code] = true;
    };

    const onKeyUp = (event: KeyboardEvent) => {
        keyState[event.code] = false;
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
    };
};

export const handleResize = (camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};