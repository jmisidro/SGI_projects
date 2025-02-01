import * as THREE from "three";
import MyNurbsBuilder from './MyNurbsBuilder.js';


export default class MyJar {
  constructor(color, position) {
    this.color = color;
    this.position = position;

    this.nurbsBuilder = new MyNurbsBuilder();
  }

  buildJar() { // Vase ???
    // define the control points for half of a jar (vase?) surface
    const controlPoints = [
      [
        [ -1, 0,  0, 1],
        [ -2, 1,  0, 1],
        [ -0.5, 4, 0, 1],
        [ -1.5, 5, 0, 1]
      ],
      [
        [ 0, 0,  1*2, 1],
        [ 0, 1,  2*2, 1],
        [ 0, 4, 0.5*2, 1],
        [ 0, 5, 1.5*2, 1]
      ],
      [
        [ 1, 0, 0, 1],
        [ 2, 1, 0, 1],
        [ 0.5, 4, 0, 1],
        [ 1.5, 5, 0, 1]
      ],
    ];


    // define the degree of the curve
    const degree1 = 2;
    const degree2 = 3;
    
    // define the number of samples
    const samples = 30;

    // create a texture for the jar
    const jarTexture = new THREE.TextureLoader().load('textures/vase.jpg');
    jarTexture.wrapS = THREE.RepeatWrapping;
    jarTexture.wrapT = THREE.RepeatWrapping;

    // create a material for the jar
    const jarMateiral = new THREE.MeshPhysicalMaterial( { 
      color: this.color,
      roughness: 0.7,  
      transmission: 0,  
      thickness: 1,
      side: THREE.DoubleSide,
      map: jarTexture,
    });
    

    // create the left NURBS surface
    const nurbsSurfaceLeft = this.nurbsBuilder.build(controlPoints, degree1, degree2, samples, samples, jarMateiral);
    // adjust the position of the left surface

    // rotate the left surface
    nurbsSurfaceLeft.rotateY(Math.PI / 2);

    const nurbsSurfaceRight = this.nurbsBuilder.build(controlPoints, degree1, degree2, samples, samples, jarMateiral);
    // adjust the position of the right surface

    // rotate the right surface
    nurbsSurfaceRight.rotateY(-Math.PI / 2);

    const dirtTexture = new THREE.TextureLoader().load('./textures/soil.jpg');
    dirtTexture.wrapS = THREE.RepeatWrapping;
    dirtTexture.wrapT = THREE.RepeatWrapping;
    
    // Create the dirt geometry
    const dirtGeometry = new THREE.CircleGeometry(1, 32);
    const dirtMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513, map: dirtTexture }); // Brown color

   
    const dirt = new THREE.Mesh(dirtGeometry, dirtMaterial);
    dirt.rotation.x = -Math.PI/2;
    dirt.position.set(0, 4, 0);
    
    nurbsSurfaceLeft.receiveShadow = true;
    nurbsSurfaceLeft.castShadow = true;
    nurbsSurfaceRight.receiveShadow = true;
    nurbsSurfaceRight.castShadow = true;
    dirt.receiveShadow = true;
    dirt.castShadow = true;
    
    // create a group to hold the surface
    const jar = new THREE.Group();
    jar.add(nurbsSurfaceLeft);
    jar.add(nurbsSurfaceRight);
    jar.add(dirt);

    // translate the jar to the position given
    jar.position.set(this.position.x, this.position.y, this.position.z);

    return jar;
}
}

