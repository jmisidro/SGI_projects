import * as THREE from 'three';

export default class MyCake {
    constructor(cakeColor, sliceColor, position) {
        this.cakeColor = cakeColor;
        this.sliceColor = sliceColor;
        this.position = position;
    }

    buildCake() {
        const cakeGroup = new THREE.Group();

        const cakeGeometry = new THREE.CylinderGeometry(
            1.8, // top radius
            1.8, // bottom radiu
            0.5, // Height
            32,
            1,
            false, 
            Math.PI / 2, // Start angle
            Math.PI * 7 / 4  // size of the slice
        );

        const cakeTopTexture = new THREE.TextureLoader().load('textures/cakeTop.jpg');
        cakeTopTexture.wrapS = THREE.RepeatWrapping;
        cakeTopTexture.wrapT = THREE.RepeatWrapping;

        // Create a cakeTop Mesh with basic material
        let cakeTopSizeU = 1.8;
        let cakeTopSizeV = 0.5;
        let cakeTopUVRate = cakeTopSizeV / cakeTopSizeU;
        let cakeTopTextureUVRate = 2000 / 1335; // image dimensions
        let cakeTopTextureRepeatU = 1;
        let cakeTopTextureRepeatV = cakeTopTextureRepeatU * cakeTopUVRate * cakeTopTextureUVRate;
        cakeTopTexture.repeat.set( cakeTopTextureRepeatU, cakeTopTextureRepeatV );
        cakeTopTexture.rotation = 0;
        cakeTopTexture.offset = new THREE.Vector2(0,0);

        const cakeTopMaterial = new THREE.MeshStandardMaterial({
            color: this.cakeColor,
            roughness: 0.8,
            side: THREE.DoubleSide, 
            map: cakeTopTexture
        });

        const cakeMesh = new THREE.Mesh(cakeGeometry, cakeTopMaterial);

        cakeMesh.receiveShadow = true;
        cakeMesh.castShadow = true;
        cakeGroup.add(cakeMesh);

        const cakeSideTexture = new THREE.TextureLoader().load('textures/cakeSide.jpg');
        cakeSideTexture.wrapS = THREE.RepeatWrapping;
        cakeSideTexture.wrapT = THREE.RepeatWrapping;

        // Create a cakeSide Mesh with basic material
        let cakeSideSizeU = 1.8;
        let cakeSideSizeV = 0.5;
        let cakeSideUVRate = cakeSideSizeV / cakeSideSizeU;
        let cakeSideTextureUVRate = 540 / 360; // image dimensions
        let cakeSideTextureRepeatU = 1;
        let cakeSideTextureRepeatV = cakeSideTextureRepeatU * cakeSideUVRate * cakeSideTextureUVRate;
        cakeSideTexture.repeat.set( cakeSideTextureRepeatU, cakeSideTextureRepeatV );
        cakeSideTexture.rotation = 0;
        cakeSideTexture.offset = new THREE.Vector2(0,0);
        const cakeSide = new THREE.PlaneGeometry( cakeSideSizeU, cakeSideSizeV );

        const cakeSideMaterial = new THREE.MeshStandardMaterial({
            color: this.sliceColor,
            roughness: 0.5,
            side: THREE.DoubleSide, 
            map: cakeSideTexture,
        });
        const cakeSideMeshLeft = new THREE.Mesh(cakeSide, cakeSideMaterial);

        cakeSideMeshLeft.position.set(0.64, 0, 0.64); 
        cakeSideMeshLeft.rotation.y = Math.PI * 7 / 4;

        cakeSideMeshLeft.receiveShadow = true;
        cakeSideMeshLeft.castShadow = true
        cakeGroup.add(cakeSideMeshLeft);

        const cakeSideMeshRight = new THREE.Mesh(cakeSide, cakeSideMaterial);

        cakeSideMeshRight.position.set(0.9, 0, 0); 
        cakeSideMeshRight.rotation.y = Math.PI;  

        cakeSideMeshRight.receiveShadow = true;
        cakeSideMeshRight.castShadow = true;
        cakeGroup.add(cakeSideMeshRight);

        // Translate the cake to the position given
        cakeGroup.position.set(this.position.x, this.position.y, this.position.z);  

        return cakeGroup;
    }
}
