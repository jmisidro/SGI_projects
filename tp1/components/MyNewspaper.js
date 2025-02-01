import * as THREE from "three";
import MyNurbsBuilder from './MyNurbsBuilder.js';


export default class MyNewspaper {
  constructor(position) {
    this.position = position;

    this.nurbsBuilder = new MyNurbsBuilder();
  }

  buildNewspaper() {
    // define the control points for half of open book like surface
    const controlPoints =
      [
        [
            [ -1.5, -1.5, 0.0, 1 ],
            [ -1.5,  1.5, 0.0, 1 ]
        ],
        [
            [ 0, -1.5, 3.0, 1 ],
            [ 0,  1.5, 3.0, 1 ]
        ],
        [
            [ 1.5, -1.5, 0.0, 1 ],
            [ 1.5,  1.5, 0.0, 1 ]
        ]
      ];


    // define the degree of the curve
    const degree1 = 2;
    const degree2 = 1;
    
    // define the number of samples
    const samples = 10;

    const texture = new THREE.TextureLoader().load('textures/newspaper.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.rotation = Math.PI;
    // scale the texture
    texture.repeat.set( 0.9, 0.9 );

    // create a material for the newspaper
    const material = new THREE.MeshPhysicalMaterial( { 
        color: 0xdddddd,
        roughness: 0.8,
        thickness: 1,
        side: THREE.DoubleSide,
        map: texture,
    } );
    

    // create the left NURBS surface
    const nurbsSurfaceLeft = this.nurbsBuilder.build(controlPoints, degree1, degree2, samples, samples, material);
    // adjust the position of the left surface
    nurbsSurfaceLeft.position.set(0, 0, 0);
    // rotate the left surface
    nurbsSurfaceLeft.rotateX(-Math.PI / 2);
    nurbsSurfaceLeft.rotateZ(Math.PI / 2);

    const nurbsSurfaceRight = this.nurbsBuilder.build(controlPoints, degree1, degree2, samples, samples, material);
    // adjust the position of the right surface
    nurbsSurfaceRight.position.set(0, 0, 3);
    // rotate the right surface
    nurbsSurfaceRight.rotateX(-Math.PI / 2);
    nurbsSurfaceRight.rotateZ(Math.PI / 2);

    // Shadows
    nurbsSurfaceLeft.castShadow = true;
    nurbsSurfaceRight.castShadow = true;

    // create a group to hold the surface
    const newspaper = new THREE.Group();
    newspaper.add(nurbsSurfaceLeft);
    newspaper.add(nurbsSurfaceRight);

    // translate the newspaper to the position given
    newspaper.position.set(this.position.x, this.position.y, this.position.z);

    // rotate the newspaper
    newspaper.rotateY(-Math.PI / 2);

    return newspaper;
}
}

