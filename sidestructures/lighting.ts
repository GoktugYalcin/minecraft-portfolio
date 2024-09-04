import * as THREE from 'three';

export const createAmbientLight = () => {
    const ambientLight = new THREE.AmbientLight(0x606060);
    return ambientLight;
};

export const createDirectionalLight = () => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 256;
    directionalLight.shadow.mapSize.height = 256;
    return directionalLight;
};