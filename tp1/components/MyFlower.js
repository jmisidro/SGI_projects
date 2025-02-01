import * as THREE from "three";
import MyNurbsBuilder from './MyNurbsBuilder.js';


export default class MyJar {
  constructor(stemColor, petalColor, position) {
    this.stemColor = stemColor;
    this.petalColor = petalColor;
    this.position = position;

    this.nurbsBuilder = new MyNurbsBuilder();
    this.numberOfPetals = 6;
    this.stemRadius = 0.03;
    this.stemHeight = 1.5;
  }

  buildFlower() {

    const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0.2, this.stemHeight * 0.4, 0),
        new THREE.Vector3(0.05, this.stemHeight * 0.7, 0),
        new THREE.Vector3(0, this.stemHeight, 0),
    ]);

    const stemPath = stemCurve.getPoints(50);

    const stemGeometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(stemPath), 50, this.stemRadius, 8, false);

    const stemMaterial = new THREE.MeshPhysicalMaterial({
        color: this.stemColor,
        roughness: 0.8,
        transmission: 0,
        thickness: 1,
        side: THREE.DoubleSide
    });

    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(0,-this.stemHeight*0.5,0);

    const petalAngleStep = (Math.PI * 2) / this.numberOfPetals;
    const petalLength = Math.PI * this.stemRadius * 100 / this.numberOfPetals;

    const controlPoints = [
        [
            [0, 0, 0, 1],
            [-1.5*petalLength, 3, 0, 1],
            [-1*petalLength, 5, 0, 1],
            [-0.25*petalLength, 6, 0, 1],
            [0, 7, 0, 1],
        ],
        [
            [0, 0, 0, 1],
            [0, 3, -0.5, 1],
            [0, 5, -1, 1],
            [0, 6, -0.5, 1],
            [0, 7, 0, 1],
        ],
        [
            [0, 0, 0, 1],
            [1.5*this.numberOfPetals, 3, 0, 1],
            [1*this.numberOfPetals, 5, 0, 1],
            [0.25*this.numberOfPetals, 6, 0, 1],
            [0, 7, 0, 1],
        ]
    ];


    // define the degree of the curve
    const degree1 = 2;
    const degree2 = 3;
    
    // define the number of samples
    const samples = 30;

    const petalTexture = new THREE.TextureLoader().load('textures/petal.jpg');
    petalTexture.wrapS = THREE.RepeatWrapping;
    petalTexture.wrapT = THREE.RepeatWrapping;

    const petalMateiral = new THREE.MeshPhysicalMaterial( { 
        color: this.petalColor,
        roughness: 0.7,  
        transmission: 0,  
        thickness: 1,
        side: THREE.DoubleSide,
        map: petalTexture,
      });
      

    const petal = this.nurbsBuilder.build(controlPoints, degree1, degree2, samples, samples, petalMateiral);

    // Create a group to hold the petals
    const petals = new THREE.Group();

    for (let i = 0; i < this.numberOfPetals; i++) {
        // Clone the petal
        let newPetal = petal.clone();

        // Calculate the position of the petal
        const angle = i * petalAngleStep;
        const petalX = Math.cos(angle) * (this.stemRadius * 6);
        const petalZ = Math.sin(angle) * (this.stemRadius * 6);

        // Scale the petal
        newPetal.scale.set(0.075, 0.075, 0.075);

        // Position the petal
        newPetal.position.set(petalX, this.stemHeight, petalZ);

        // Calculate the rotation angle to point the petal outward
        const petalRotationAngle = -angle - Math.PI / 2;

        // Rotate the petal
        newPetal.rotation.set(-Math.PI / 2, 0, petalRotationAngle);

        newPetal.receiveShadow = true;
        newPetal.castShadow = true;

        petals.add(newPetal);
    }

    petals.position.set(-0.05,-0.3*this.stemHeight, -0.85);
    petals.rotateX(Math.PI/5);

    const centerGeometry = new THREE.SphereGeometry(this.stemRadius * 7, 32, 32);
    centerGeometry.scale(1, 0.5, 1);

    const centerMaterial = new THREE.MeshPhysicalMaterial({
        color: "#ffe380",
        roughness: 0.7,
        transmission: 0,
        thickness: 1,
        side: THREE.DoubleSide,
        normalMap: new THREE.TextureLoader().load('textures/normal_map.webp'),
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
        
    // Position the center of the flower
    center.position.set(0, this.stemHeight, 0);
    petals.add(center);

    center.receiveShadow = true;
    center.castShadow = true;
    stem.receiveShadow = true;
    stem.castShadow = true;

    // Create a group to hold the surface
    const flower = new THREE.Group();
    flower.add(stem);
    flower.add(petals);

    // translate the flower to the position given
    flower.position.set(this.position.x, this.position.y, this.position.z);

    return flower;
}
}

