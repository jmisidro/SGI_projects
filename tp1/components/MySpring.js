import * as THREE from 'three';

class MySpring {
    constructor(color, position) {
        this.color = color;
        this.position = position;  

        // Spring geometry properties
        this.radius = 0.5;
        this.length = 2;
        this.turns = 4;
        this.pointsPerTurn = 35;
        this.wireThickness = 0.12;

        // Spring material properties
        this.material = new THREE.MeshStandardMaterial({
            color: this.color,
            metalness: 1.0,
            roughness: 0.35,
            side: THREE.DoubleSide,
        });
    }

    buildSpringBody() {
        const springPath = this.createSpiralPath();
        
        const springGeometry = new THREE.TubeGeometry(
            springPath, // path
            this.turns * this.pointsPerTurn, // nº of points
            this.wireThickness, // radius
            16, // radial segments (smoothness)
            false // closed
        );
        
        const springMesh = new THREE.Mesh(springGeometry, this.material);

        springMesh.castShadow = true;
        springMesh.receiveShadow = true

        springMesh.position.copy(this.position);
        
        return springMesh; 
    }
        

    createSpiralPath() {
        const points = [];
        const numberPoints = this.turns * this.pointsPerTurn;
        for (let i = 0; i <= numberPoints; i++) {
            const angle = (i / this.pointsPerTurn) * Math.PI * 2; // angle for each point 
            const x = this.radius * Math.cos(angle); 
            const y = this.radius * Math.sin(angle);
            const z = (i / (this.turns * this.pointsPerTurn)) * this.length; // gradually increasing z
            points.push(new THREE.Vector3(x, y, z));
        }
        return new THREE.CatmullRomCurve3(points);
    }
}

export default MySpring;
