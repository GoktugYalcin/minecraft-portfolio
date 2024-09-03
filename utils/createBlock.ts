import * as THREE from "three";
import {BufferGeometry} from "three";

export const createBlock = (texture: THREE.Texture, x: number, y: number, z: number, geometry: BufferGeometry) => {
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