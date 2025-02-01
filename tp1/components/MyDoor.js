import * as THREE from "three";

export default class MyDoor {
  constructor(color, sizeX, sizeY, position) {
    this.color = color;
    this.sizeX = sizeX;
    this.sizeY = sizeY;
    this.position = position;
  }

  buildDoor(textureOn=true) {

    // door texture
    const doorTexture = new THREE.TextureLoader().load('textures/door.jpg');
    doorTexture.wrapS = THREE.RepeatWrapping;
    doorTexture.wrapT = THREE.RepeatWrapping;

    // door material
    const doorMaterial = new THREE.MeshLambertMaterial({
        color: this.color,
        side: THREE.DoubleSide,
        map: textureOn ? doorTexture : null
    })

    const doorGeometry = new THREE.BoxGeometry( this.sizeX, this.sizeY, 0.5 );
    const doorFrame = new THREE.Mesh( doorGeometry, doorMaterial );
    doorFrame.rotation.y = Math.PI / 2;
    doorFrame.position.y = 0;

    // door handle material
    const handleMaterial = new THREE.MeshPhysicalMaterial({
        color: "#DDDDDD",
        metalness: 0.8,
        roughness: 0.35,
        specularColor: "#111111",
        side: THREE.DoubleSide,
    });

    const handleGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(0.5, 0, -2);

    const door = new THREE.Group();
    door.add(doorFrame);
    door.add(handle);

    // translate the door to the desired position
    door.position.set(this.position.x, this.position.y, this.position.z);
    
    return door;

  }
}

