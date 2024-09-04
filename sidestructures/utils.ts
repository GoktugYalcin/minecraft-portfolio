import * as THREE from 'three';

export const loadTextures = (renderer: THREE.WebGLRenderer) => {
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

    return textures;
};