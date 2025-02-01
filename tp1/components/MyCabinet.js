import * as THREE from "three";

export default class MyCabinet {
  constructor(color, position) {
    this.color = color;
    this.position = position;

    this.sidePillars = { radiusTop: 0.25, radiusBottom: 0.25, height: 1.5, radialSegments: 20 };
    this.topPlane = { x: 2, y: 4, z: 12 };
  }

  buildCabinet() {

    const sideGeometry = new THREE.CylinderGeometry(
        this.sidePillars.radiusTop,
        this.sidePillars.radiusBottom,
        this.sidePillars.height,
        this.sidePillars.radialSegments
    );

    const sideMaterial = new THREE.MeshPhysicalMaterial({
      color: this.color,
      metalness: 0.9,
      roughness: 0.35,
      specularColor: "#111111",
      side: THREE.DoubleSide,
    });

    const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
    leftSide.position.set(-1.5, 1, -5);

    const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
    rightSide.position.set(1.5, 1, -5);

    const frontSide = new THREE.Mesh(sideGeometry, sideMaterial);
    frontSide.position.set(-1.5, 1, 5);

    const backSide = new THREE.Mesh(sideGeometry, sideMaterial);
    backSide.position.set(1.5, 1, 5);
        
    const topTexture = new THREE.TextureLoader().load('textures/wood.jpg');
    topTexture.wrapS = THREE.RepeatWrapping;
    topTexture.wrapT = THREE.RepeatWrapping;

    const topMaterial = new THREE.MeshPhongMaterial({
      color: this.color,
      side: THREE.DoubleSide,
      map: topTexture,
    });

    const topGeometry = new THREE.BoxGeometry(
      this.topPlane.x,
      this.topPlane.y,
      this.topPlane.z
    );

    const topPlane = new THREE.Mesh(topGeometry, topMaterial);
    topPlane.position.y = 2.5;
    topPlane.rotateZ(-Math.PI / 2);


    const cabinetTexture = new THREE.TextureLoader().load('textures/cabinet.jpg');
    cabinetTexture.wrapS = THREE.RepeatWrapping;
    cabinetTexture.wrapT = THREE.RepeatWrapping;

    // Add a plane in front of the cabinet
    const frontPlaneGeometry = new THREE.PlaneGeometry(2, 12);
    const frontPlaneMaterial = new THREE.MeshLambertMaterial({
        color: this.color,
        side: THREE.DoubleSide,
        map: cabinetTexture
    });

    const frontPlane = new THREE.Mesh(frontPlaneGeometry, frontPlaneMaterial);
    frontPlane.rotateY(Math.PI / 2);
    frontPlane.rotateZ(Math.PI / 2);
    frontPlane.position.set(-2.05, 2.5, 0);

    // cast & receive shadows
    leftSide.castShadow = true;
    leftSide.receiveShadow = true;
    rightSide.castShadow = true;
    rightSide.receiveShadow = true;
    frontSide.castShadow = true;
    frontSide.receiveShadow = true;
    backSide.castShadow = true;
    backSide.receiveShadow = true;
    topPlane.castShadow = true;
    topPlane.receiveShadow = true;

    const cabinet = new THREE.Group();
    cabinet.add(leftSide);
    cabinet.add(rightSide);
    cabinet.add(backSide);
    cabinet.add(frontSide);
    cabinet.add(topPlane);
    cabinet.add(frontPlane);
    
    // translate the cabinet to the position given
    cabinet.position.set(this.position.x, this.position.y, this.position.z);

    return cabinet;

  }
}

