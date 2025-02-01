import * as THREE from 'three';

class MyBeetle {
    constructor(scale = 1, position) {
        this.scale = scale;  // Scaling of  the Beetle and the canvas
        this.position = position;  // Position of the Beetle
        this.beetleGroup = new THREE.Group();
        
        // Canvas dimensions
        this.canvasWidth = 24 * this.scale;
        this.canvasHeight = 12 * this.scale;

        // Build the canvas and frame
        this.buildFrame();
        this.buildCanvas();

        this.buildBeetleDrawing();

        // Center the entire beetleGroup
        this.beetleGroup.position.x = -this.canvasWidth / 2;  
        this.beetleGroup.position.y = -this.canvasHeight / 2; 
    }

    // Method to build the frame for the canvas
    buildFrame() {
        const frameGeometry = new THREE.BoxGeometry(this.canvasWidth, this.canvasHeight, 0.3);
        
        const textureLoader = new THREE.TextureLoader();
        const frameTexture = textureLoader.load('textures/wood.jpg');
        const frameMaterial = new THREE.MeshBasicMaterial({
            map: frameTexture,
            color: 0x8B4513, // Brown frame color
        });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.z = -0.25;
        this.beetleGroup.add(frame);
    }

    // Method to build the canvas
    buildCanvas() {
        const canvasGeometry = new THREE.PlaneGeometry(this.canvasWidth * 0.90, this.canvasHeight * 0.90);
        const canvasTexture = new THREE.TextureLoader().load('textures/canvas_texture.jpg');
        const canvasMaterial = new THREE.MeshBasicMaterial({ map: canvasTexture });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
        this.beetleGroup.add(canvas);
    }

    buildBeetleDrawing() {
        // Left Wheel
        const leftWheelCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(-8, -4, 0).multiplyScalar(this.scale),
            new THREE.Vector3(-8, 0, 0).multiplyScalar(this.scale),
            new THREE.Vector3(-2, 0, 0).multiplyScalar(this.scale),
            new THREE.Vector3(-2, -4, 0).multiplyScalar(this.scale)
        );
        
        // Right Wheel
        const rightWheelCurve = new THREE.CubicBezierCurve3(
            new THREE.Vector3(2, -4, 0).multiplyScalar(this.scale),   
            new THREE.Vector3(2, 0, 0).multiplyScalar(this.scale),         
            new THREE.Vector3(8, 0, 0).multiplyScalar(this.scale),          
            new THREE.Vector3(8, -4, 0).multiplyScalar(this.scale)  
        );

        // Left Top of the Car 
        const leftTopCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(-8, -4, 0).multiplyScalar(this.scale),   
            new THREE.Vector3(-8, 4, 0).multiplyScalar(this.scale),   
            new THREE.Vector3(0, 4, 0).multiplyScalar(this.scale), 
       );
        
        // Right Top of the Car
        const rightTopCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(0, 4, 0).multiplyScalar(this.scale),  
            new THREE.Vector3(4, 4, 0).multiplyScalar(this.scale),   
            new THREE.Vector3(4, 0, 0).multiplyScalar(this.scale)     
        );
        
        // Hood of the Car
        const hoodCurve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(4, 0, 0).multiplyScalar(this.scale),
            new THREE.Vector3(8, 0, 0).multiplyScalar(this.scale), 
            new THREE.Vector3(8, -4, 0).multiplyScalar(this.scale)
        );

        const curveMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        
        // Build lines from curves and add to the group
        this.beetleGroup.add(this.buildLineFromCurve(leftWheelCurve, curveMaterial));
        this.beetleGroup.add(this.buildLineFromCurve(rightWheelCurve, curveMaterial));
        this.beetleGroup.add(this.buildLineFromCurve(leftTopCurve, curveMaterial));
        this.beetleGroup.add(this.buildLineFromCurve(rightTopCurve, curveMaterial));
        this.beetleGroup.add(this.buildLineFromCurve(hoodCurve, curveMaterial));
    }

    buildLineFromCurve(curve, material) {
        const points = curve.getPoints(20);  
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        return new THREE.Line(geometry, material);
    }

    buildBeetle() {
        // translate the beetleGroup to the desired position
        this.beetleGroup.position.set(this.position.x, this.position.y, this.position.z);

        return this.beetleGroup;
    }
}

export default MyBeetle;
