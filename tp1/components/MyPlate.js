import * as THREE from "three";

export default class MyPlate {
  constructor(color, position) {
    this.color = color;
    this.position = position;

    this.plateGeometry = { radiusTop: 2, radiusBottom: 2, height: 0.1, radialSegments: 32 };
  }

  buildPlate() {

    const planeGeometry = new THREE.CylinderGeometry(
        this.plateGeometry.radiusTop,
        this.plateGeometry.radiusBottom,
        this.plateGeometry.height,
        this.plateGeometry.radialSegments
    );

    const texture = new THREE.TextureLoader().load('textures/plate.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;

    
    const material = new THREE.MeshPhysicalMaterial({
      color: this.color,
      roughness: 0.8,
      transmission: 0.1,
      thickness: 1,
      side: THREE.DoubleSide,
      map: texture,
    });

    const plate = new THREE.Mesh(planeGeometry, material);

    plate.castShadow = true;
    plate.receiveShadow = true;
    
    // translate the plate to the position given
    plate.position.set(this.position.x, this.position.y, this.position.z);

    return plate;

  }
}

