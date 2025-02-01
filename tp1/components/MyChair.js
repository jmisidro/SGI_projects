import * as THREE from "three";

export default class MyChair {
  constructor(sideColor, topColor, position) {
    this.sideColor = sideColor;
    this.topColor = topColor;
    this.position = position;

    this.legs = { radiusTop: 0.25, radiusBottom: 0.25, height: 4, radialSegments: 20 };
    this.seatPlane = { x: 0.5, y: 4, z: 4 };
    this.backPlane = { x: 0.5, y: 4, z: 8 };
  }

  buildChair(seatTextureFile='textures/wood2.jpg', backTextureFile='textures/wood2.jpg') {

    // Create the legs of the chair
    const legGeometry = new THREE.CylinderGeometry(
      this.legs.radiusTop,
      this.legs.radiusBottom,
      this.legs.height,
      this.legs.radialSegments
    );

    const legTexture = new THREE.TextureLoader().load('textures/wood2.jpg');
    legTexture.wrapS = THREE.RepeatWrapping;
    legTexture.wrapT = THREE.RepeatWrapping;

    const legMaterial = new THREE.MeshPhysicalMaterial({ 
        color: this.sideColor, 
        metalness: 0.9,
        roughness: 0.35,
        specularColor: "#111111",
        map: legTexture 
    });

    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(-this.seatPlane.z / 2 + 0.5, this.legs.height / 2, -this.seatPlane.z / 2 + 0.5);

    const leg2 = new THREE.Mesh(legGeometry, legMaterial);
    leg2.position.set(this.seatPlane.z / 2 - 0.5, this.legs.height / 2, -this.seatPlane.z / 2 + 0.5);

    const leg3 = new THREE.Mesh(legGeometry, legMaterial);
    leg3.position.set(-this.seatPlane.z / 2 + 0.5, this.legs.height / 2, this.seatPlane.z / 2 - 0.5);

    const leg4 = new THREE.Mesh(legGeometry, legMaterial);
    leg4.position.set(this.seatPlane.z / 2 - 0.5, this.legs.height / 2, this.seatPlane.z / 2 - 0.5);

    const seatTexture = new THREE.TextureLoader().load(seatTextureFile);
    seatTexture.wrapS = THREE.RepeatWrapping;
    seatTexture.wrapT = THREE.RepeatWrapping;

    // Create the seat of the chair
    const seatGeometry = new THREE.BoxGeometry(this.seatPlane.x, this.seatPlane.y, this.seatPlane.z);
    const seatMaterial = new THREE.MeshLambertMaterial({ 
        color: this.topColor,
        map: seatTexture 
    });
    const seat = new THREE.Mesh(seatGeometry, seatMaterial);
    seat.position.set(0, this.legs.height, 0);
    // rotate the seat so it is horizontal
    seat.rotateZ(-Math.PI / 2);
    
    const backTexture = new THREE.TextureLoader().load(backTextureFile);
    backTexture.wrapS = THREE.RepeatWrapping;
    backTexture.wrapT = THREE.RepeatWrapping;

    // Create the back of the chair
    const backGeometry = new THREE.BoxGeometry(this.backPlane.x, this.backPlane.y, this.backPlane.z / 2);
    const backMaterial = new THREE.MeshLambertMaterial({ 
        color: this.topColor, 
        map: backTexture 
    });
    const back = new THREE.Mesh(backGeometry, backMaterial);
    back.position.set(0, this.legs.height + this.backPlane.y / 2 - 0.25, -this.backPlane.z / 4);
    // rotate the back so it faces the seat
    back.rotateY(-Math.PI / 2);

    // Shadows
    seat.castShadow = true;
    seat.receiveShadow = true;
    back.castShadow = true;
    back.receiveShadow = true;
    leg1.castShadow = true;
    leg1.receiveShadow = true;
    leg2.castShadow = true;
    leg2.receiveShadow = true;
    leg3.castShadow = true;
    leg3.receiveShadow = true;
    leg4.castShadow = true;
    leg4.receiveShadow = true;
    
    const chair = new THREE.Group();
    chair.add(seat);
    chair.add(back);
    chair.add(leg1);
    chair.add(leg2);
    chair.add(leg3);
    chair.add(leg4);

    // translate the table to the position given
    chair.position.set(this.position.x, this.position.y, this.position.z);    

    return chair;

  }
}

