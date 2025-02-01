import * as THREE from "three";

export default class MyFloor {
  constructor(size) {
    this.size = size;
  }

  buildFloor(diffuseColor, specularColor, textureOn=true) {

    // floor texture
    const floorTexture = new THREE.TextureLoader().load('textures/wood.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    // floor material
    const floorMaterial = new THREE.MeshPhysicalMaterial({
        color: diffuseColor,
        specularColor: specularColor,
        roughness: 0.3,  
        transmission: 0,  
        thickness: 1,
        ior: 0.5, // Index of Refraction
        side: THREE.DoubleSide,
        map: textureOn ? floorTexture : null
    })

    // Create a floor Mesh with the given texture
    const floorSizeU = this.size;
    const floorSizeV = this.size;
    const floorUVRate = floorSizeV / floorSizeU;
    const floorTextureUVRate = 4256 / 2832; // image dimensions
    const floorTextureRepeatU = 1;
    const floorTextureRepeatV = floorTextureRepeatU * floorUVRate * floorTextureUVRate;
    floorTexture.repeat.set( floorTextureRepeatU, floorTextureRepeatV );
    floorTexture.rotation = 0;
    floorTexture.offset = new THREE.Vector2(0,0);
    const floorGeometry = new THREE.PlaneGeometry( floorSizeU, floorSizeV );
    const floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;

    floor.castShadow = true;
    floor.receiveShadow = true;
    
    return floor;

  }
}

