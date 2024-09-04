import * as THREE from 'three';

export const createBlock = (
    texture: THREE.Texture,
    x: number,
    y: number,
    z: number,
    geometry: THREE.BoxGeometry
) => {
    const material = new THREE.MeshStandardMaterial({ map: texture });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y, z);
    block.castShadow = true;
    block.receiveShadow = true;
    return block;
};

export const addTree = (
    x: number,
    z: number,
    textures: { [key: string]: THREE.Texture },
    geometry: THREE.BoxGeometry,
    scene: THREE.Scene,
    collisionObjects: THREE.Mesh[]
) => {
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