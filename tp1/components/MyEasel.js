// MyEasel.js

import * as THREE from 'three';

class MyEasel {
    constructor(position) {
        this.position = position;

        this.legWidth = 0.5;  
        this.legDepth = 0.5;  
        this.frontLegHeight = 12;  
        this.rearLegHeight = 11.8;
        this.legSpread = 5;  // Spread between front legs

        // Crossbar dimensions
        this.crossbarWidth = this.legSpread + 0.6;
        this.crossbarHeight = 0.5;
        this.crossbarDepth = 0.5;
        this.crossbarPositionY = 5.5;

        // Load wood texture
        const textureLoader = new THREE.TextureLoader();
        this.woodTexture = textureLoader.load('textures/wood2.jpg');

        this.material = new THREE.MeshPhongMaterial({
            map: this.woodTexture,
            shininess: 60
        });
    }

    buildEasel() {
        const easelGroup = new THREE.Group();
    
        const frontAssembly = new THREE.Group();
    
        // Build front legs
        const frontLeftLeg = this.createLeg(this.frontLegHeight);
        frontLeftLeg.position.set(-this.legSpread / 2, -0.4, this.legSpread / 2);
        const frontRightLeg = this.createLeg(this.frontLegHeight);
        frontRightLeg.position.set(this.legSpread / 2, -0.4, this.legSpread / 2);
    
        // Build bottom crossbar
        const bottomCrossbar = this.createCrossbar();
        bottomCrossbar.position.set(0, this.crossbarPositionY, this.crossbarDepth / 2 + this.legSpread / 2);
    
        // Build top crossbar
        const topCrossbar = this.createCrossbar();
        topCrossbar.position.set(0, this.frontLegHeight - 1, this.crossbarDepth / 2 + this.legSpread / 2);
    
        frontAssembly.add(frontLeftLeg);
        frontAssembly.add(frontRightLeg);
        frontAssembly.add(bottomCrossbar);
        frontAssembly.add(topCrossbar);
    
        // Some inclination to front assembly
        frontAssembly.rotation.x = -Math.PI / 20; 
    
        // Build rear leg
        const rearLeg = this.createLeg(this.rearLegHeight);
        rearLeg.position.set(0, 0, -this.legSpread / 2);
        rearLeg.rotation.x = Math.PI / 11.2;
    
        const canvasMesh = this.createCanvas();
        frontAssembly.add(canvasMesh);
    
        // Add all parts to the easel group
        easelGroup.add(frontAssembly);
        easelGroup.add(rearLeg);
    
        easelGroup.position.copy(this.position);
    
        return easelGroup;
    }
    
    createLeg(height) {
        const geometry = new THREE.BoxGeometry(this.legWidth, height, this.legDepth);

        geometry.translate(0, height / 2, 0);

        const leg = new THREE.Mesh(geometry, this.material);
        return leg;
    }

    createCrossbar() {
        const geometry = new THREE.BoxGeometry(this.crossbarWidth, this.crossbarHeight, this.crossbarDepth);
        const crossbar = new THREE.Mesh(geometry, this.material);
        return crossbar;
    }

    createCanvas() {
        const canvasWidth = 6; 
        const canvasHeight = 4.5; 
        const canvasDepth = 0.3; 
    
        // Create canvas geometry
        const canvasGeometry = new THREE.BoxGeometry(canvasWidth, canvasHeight, canvasDepth);
        const canvasTexture = new THREE.TextureLoader().load('textures/canvas_texture.jpg');
        const canvasMaterial = new THREE.MeshPhongMaterial({
            map: canvasTexture,
            side: THREE.DoubleSide,
        });
        const canvas = new THREE.Mesh(canvasGeometry, canvasMaterial);
    
        /* Add  painting to the canvas */
        const paintingTexture = new THREE.TextureLoader().load('textures/the_persistence_of_memory_salvador_dali.jpg');
    
        const paintingGeometry = new THREE.PlaneGeometry(canvasWidth * 0.95, canvasHeight* 0.95);
        const paintingMaterial = new THREE.MeshPhongMaterial({
            map: paintingTexture,
        });
    
        // Create the painting mesh
        const paintingMesh = new THREE.Mesh(paintingGeometry, paintingMaterial);
        paintingMesh.position.set(0, 0, canvasDepth / 2 + 0.01); // Slightly in front of the canvas
        canvas.add(paintingMesh);
        /* End of painting addition */
    
        // Position the canvas on the easel
        const canvasPositionY = this.crossbarPositionY + canvasHeight / 2 + 0.1;
        const canvasPositionZ = this.crossbarDepth / 2 + this.legSpread / 2 + 0.15; // Slightly in front of the crossbar
    
        canvas.position.set(0, canvasPositionY, canvasPositionZ);
    
        return canvas;
    }    
}

export default MyEasel;
