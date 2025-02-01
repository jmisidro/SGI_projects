import * as THREE from "three";

export default class MyTable {
  constructor(baseColor, columnColor, position) {
    this.baseColor = baseColor;
    this.columnColor = columnColor;
    this.position = position;

    this.base = { radiusTop: 2, radiusBottom: 2, height: 0.5, radialSegments: 32 };
    this.column = { radiusTop: 0.3, radiusBottom: 0.3, height: 10, radialSegments: 32 };
    this.top = { radiusTop: 1, radiusBottom: 2, height: 2, radialSegments: 32, openEnded: true };
  }

  buildLamp(lightOn=true, topColor="#1d5f99") {

    const baseGeometry = new THREE.CylinderGeometry(
      this.base.radiusTop,
      this.base.radiusBottom,
      this.base.height,
      this.base.radialSegments
    );
    
    const baseMaterial = new THREE.MeshLambertMaterial({
      color: this.baseColor,
      side: THREE.DoubleSide,
    });

    const base = new THREE.Mesh(baseGeometry, baseMaterial);
    base.position.y = 0;

    const columnGeometry = new THREE.CylinderGeometry(
      this.column.radiusTop,
      this.column.radiusBottom,
      this.column.height,
      this.column.radialSegments
    );

    const columnMaterial = new THREE.MeshLambertMaterial({
      color: this.columnColor,
      side: THREE.DoubleSide,
    });

    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.y = 5;

    const topMaterial = new THREE.MeshPhongMaterial({
      color: topColor,
      specular: "#768ea3",
      shininess: 10,
      side: THREE.DoubleSide,
    });

    const topGeometry = new THREE.CylinderGeometry(
      this.top.radiusTop,
      this.top.radiusBottom,
      this.top.height,
      this.top.radialSegments,
      this.top.openEnded
    );

    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 10;

    const lamp = new THREE.Group();
    lamp.add(base);
    lamp.add(column);
    lamp.add(top);

    lamp.castShadow = true;
    lamp.receiveShadow = true;

    // create a spotlight to point downwards
    const spotLight = new THREE.SpotLight(topColor, 100);
    spotLight.position.set(0, 11, 0);
    spotLight.target.position.set(0,0,0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.1;
    spotLight.decay = 2;
    spotLight.castShadow = true;
    spotLight.receiveShadow = true;


    if (lightOn) {
      lamp.add(spotLight);
      lamp.add(spotLight.target);
    }

    // translate the lamp to the position
    lamp.position.set(this.position.x, this.position.y, this.position.z);

    return lamp;

  }
}

