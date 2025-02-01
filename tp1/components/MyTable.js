import * as THREE from "three";

export default class MyTable {
  constructor(sideColor, topColor) {
    this.sideColor = sideColor;
    this.topColor = topColor;

    this.sidePillars = { radiusTop: 0.5, radiusBottom: 0.5, height: 4, radialSegments: 20 };
    this.topPlane = { x: 0.5, y: 12, z: 12 };
  }

  buildTable(size) {

    const sideGeometry = new THREE.CylinderGeometry(
        this.sidePillars.radiusTop,
        this.sidePillars.radiusBottom,
        this.sidePillars.height,
        this.sidePillars.radialSegments
    );

    const sideMaterial = new THREE.MeshPhysicalMaterial({
      color: this.sideColor,
      metalness: 0.9,
      roughness: 0.35,
      specularColor: "#111111",
      side: THREE.DoubleSide,
    });

    const leftSide = new THREE.Mesh(sideGeometry, sideMaterial);
    leftSide.position.set(-5, -2, -5);

    const rightSide = new THREE.Mesh(sideGeometry, sideMaterial);
    rightSide.position.set(5, -2, -5);

    const frontSide = new THREE.Mesh(sideGeometry, sideMaterial);
    frontSide.position.set(-5, -2, 5);

    const backSide = new THREE.Mesh(sideGeometry, sideMaterial);
    backSide.position.set(5, -2, 5);
        
    const topTexture = new THREE.TextureLoader().load('textures/wood2.jpg');
    topTexture.wrapS = THREE.RepeatWrapping;
    topTexture.wrapT = THREE.RepeatWrapping;

    const topMaterial = new THREE.MeshPhongMaterial({
      color: this.topColor,
      side: THREE.DoubleSide,
      map: topTexture,
    });

    const topGeometry = new THREE.BoxGeometry(
      this.topPlane.x,
      this.topPlane.y,
      this.topPlane.z
    );

    const topPlane = new THREE.Mesh(topGeometry, topMaterial);
    topPlane.position.y = 0;
    topPlane.rotateZ(-Math.PI / 2);

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

    const table = new THREE.Group();
    table.add(leftSide);
    table.add(rightSide);
    table.add(backSide);
    table.add(frontSide);
    table.add(topPlane);
    

    // scale the table
    table.scale.set(size, size, size);

    return table;

  }
}

