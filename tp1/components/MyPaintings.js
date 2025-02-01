import * as THREE from 'three';

export default class MyPaintings {
    constructor(position1, position2, photo1, photo2, canvasTexturePath) {
        this.position1 = position1;
        this.position2 = position2;
        this.photo1 = photo1;
        this.photo2 = photo2;
        this.canvasTexturePath = canvasTexturePath; 
    }

    buildPaintings() {
        const paintingsGroup = new THREE.Group();

        const canvasTexture = new THREE.TextureLoader().load(this.canvasTexturePath);
        canvasTexture.wrapS = THREE.RepeatWrapping;
        canvasTexture.wrapT = THREE.RepeatWrapping;

        const canvasGeometry = new THREE.BoxGeometry(8, 4.5, 0.4);  

        const canvasMaterial = new THREE.MeshStandardMaterial({
            color: 0xAAAAAA,
            map: canvasTexture
        });

        // First Canvas
        const canvasMesh1 = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvasMesh1.position.set(this.position1.x, this.position1.y, this.position1.z);
        canvasMesh1.rotation.y = -Math.PI / 2; 

        // Plane for the photo
        const photoWidth = 7.5; // Slightly smaller then canvas 
        const photoHeight = 4;  
        const photoGeometry = new THREE.PlaneGeometry(photoWidth, photoHeight);

        const photoTexture1 = new THREE.TextureLoader().load(this.photo1);
        const photoMaterial1 = new THREE.MeshStandardMaterial({
            color: 0xBBBBBB,
            map: photoTexture1,
            transparent: true, 
        });

        const photoMesh1 = new THREE.Mesh(photoGeometry, photoMaterial1);

        photoMesh1.position.set(0, 0, -0.21);  // Slightly in front of the canvas
        photoMesh1.rotation.y = Math.PI;

        // Add the photoMesh to the canvasMesh1
        canvasMesh1.add(photoMesh1);
        paintingsGroup.add(canvasMesh1);

        const canvasMesh2 = new THREE.Mesh(canvasGeometry, canvasMaterial);
        canvasMesh2.position.set(this.position2.x, this.position2.y, this.position2.z);
        canvasMesh2.rotation.y = -Math.PI / 2;

        const photoTexture2 = new THREE.TextureLoader().load(this.photo2);
        const photoMaterial2 = new THREE.MeshStandardMaterial({
            color: 0xBBBBBB,
            map: photoTexture2,
            transparent: true,
        });

        const photoMesh2 = new THREE.Mesh(photoGeometry, photoMaterial2);

        photoMesh2.position.set(0, 0, -0.21);
        photoMesh2.rotation.y = Math.PI;

        canvasMesh2.add(photoMesh2);
        paintingsGroup.add(canvasMesh2);

        return paintingsGroup;
    }
}
