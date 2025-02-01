import * as THREE from "three";

export default class MyWalls {
  constructor(width = 40, height = 40) {
    this.width = width;
    this.height = height;
  }

    /**
     * builds the walls around the table
     */
    buildWalls(color) {
        let wallMaterial = new THREE.MeshPhongMaterial({ 
            color: color, 
            specular: '#444444',
            emissive: "#000000", 
            shininess: 15,
            normalMap: new THREE.TextureLoader().load('textures/normal_map.webp'),
            normalScale: new THREE.Vector2(0.15,0.15)
        })

        // Create front wall mesh
        const frontWall = new THREE.PlaneGeometry( this.width, this.height );
        const frontWallMesh = new THREE.Mesh( frontWall, wallMaterial );
        frontWallMesh.rotation.y = -Math.PI / 2;
        frontWallMesh.position.set(this.width / 2, this.height / 2, 0);

        // Create back wall mesh
        const backWall = new THREE.PlaneGeometry( this.width, this.height );
        const backWallMesh = new THREE.Mesh( backWall, wallMaterial );
        backWallMesh.rotation.y = Math.PI / 2;
        backWallMesh.position.set(-this.width / 2, this.height / 2, 0);

        // Create left wall mesh
        const leftWall = new THREE.PlaneGeometry( this.width, this.height );
        const leftWallMesh = new THREE.Mesh( leftWall, wallMaterial );
        leftWallMesh.rotation.y = Math.PI;
        leftWallMesh.position.set(0, this.height / 2, this.width / 2);

        // Create right wall mesh
        const wallRight = new THREE.PlaneGeometry( this.width, this.height );
        const rightWallMesh = new THREE.Mesh( wallRight, wallMaterial );
        rightWallMesh.position.set(0, this.height / 2, -this.width / 2);


        const walls = new THREE.Group();
        walls.add(frontWallMesh);
        walls.add(backWallMesh);
        walls.add(leftWallMesh);
        walls.add(rightWallMesh);

        return walls;
    }
}

