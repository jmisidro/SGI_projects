import * as THREE from "three";

export default class MyCarpet {
  constructor(size, position) {
    this.size = size;
    this.position = position;
  }

  buildCarpet(texturePath='textures/carpet.jpg', textureOn=true) {

    // carpet texture
    let texture = new THREE.TextureLoader().load(texturePath);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // carpet material
    const material = new THREE.MeshStandardMaterial({
        color: "#CCCCCC",
        roughness: 0.5,  
        metalness: 0,
        side: THREE.DoubleSide,
        map: textureOn ? texture : null
    })

    // Create a carpet Mesh with the given texture
    const geometry = new THREE.PlaneGeometry( this.size, this.size );
    const carpet = new THREE.Mesh( geometry, material );
    carpet.rotation.x = -Math.PI / 2;

    carpet.castShadow = true;
    carpet.receiveShadow = true;

    // translate the carpet to the desired position
    carpet.position.set(this.position.x, this.position.y, this.position.z);
    
    return carpet;

  }
}

