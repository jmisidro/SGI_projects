import * as THREE from "three";

export default class MyWindow {
    constructor(position) {
        this.position = position;

        this.sideValues = { x: 0.25, y: 6.2, z: 0.25 };
        this.verticalValues = { x: 12.25, y: 0.25, z: 0.25 };
        this.windowValues = { x: 12, y: 6, z: 0.25 };
    }
  
    buildWindow(intensity=25) {
        const bgTexture = new THREE.TextureLoader().load("textures/feup_b.jpg");
        const bgMaterial = new THREE.MeshBasicMaterial({
            color: "#CCCCCC",
            side: THREE.DoubleSide,
            map: bgTexture
        });

        // Create a bg Mesh with the given texture
        let bgSizeU = 12;
        let bgSizeV = 6;
        let bgUVRate = bgSizeV / bgSizeU;
        let bgTextureUVRate = 3354 / 2385; // image dimensions
        let bgTextureRepeatU = 1;
        let bgTextureRepeatV = bgTextureRepeatU * bgUVRate * bgTextureUVRate;
        bgTexture.repeat.set( bgTextureRepeatU, bgTextureRepeatV );
        bgTexture.rotation = 0;
        bgTexture.offset = new THREE.Vector2(0,0);
        const bgGeometry = new THREE.PlaneGeometry( bgSizeU, bgSizeV );
        const bgMesh = new THREE.Mesh( bgGeometry, bgMaterial );
        bgMesh.position.y = 0;
        
        bgMesh.position.set(0, 0, -0.1);

        const windowMaterial = new THREE.MeshPhysicalMaterial({  
            roughness: 0.05,  
            transmission: 1,  
            thickness: 1,
            ior: 1.5, // Index of Refraction
        });
        const windowGeometry = new THREE.BoxGeometry(
            this.windowValues.x,
            this.windowValues.y,
            this.windowValues.z
        );
        
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(0, 0, -0.3);

        // add frames around the window
        const frameMaterial = new THREE.MeshLambertMaterial({  
            color: "#999999",  
            side: THREE.DoubleSide
        });

        const horizontalFrameGeometry = new THREE.BoxGeometry(
            this.sideValues.x,
            this.sideValues.y,
            this.sideValues.z
        );

        const verticalFrameGeometry = new THREE.BoxGeometry(
            this.verticalValues.x,
            this.verticalValues.y,
            this.verticalValues.z
        );

        // place the frames around the window
        const leftFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
        leftFrame.position.set(-6.1, 0, -0.25);
        const rightFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
        rightFrame.position.set(6.1, 0, -0.25);
        const horizontalFrame = new THREE.Mesh(horizontalFrameGeometry, frameMaterial);
        horizontalFrame.position.set(0, 0, -0.25);
        const topFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
        topFrame.position.set(0, 3.1, -0.25);
        const bottomFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
        bottomFrame.position.set(0, -3.1, -0.25);
        const verticalFrame = new THREE.Mesh(verticalFrameGeometry, frameMaterial);
        verticalFrame.position.set(0, 0, -0.25);



        const window = new THREE.Group();
        window.add(bgMesh);
        window.add(windowMesh);
        window.add(leftFrame);
        window.add(horizontalFrame);
        window.add(rightFrame);
        window.add(topFrame);
        window.add(bottomFrame);
        window.add(verticalFrame);

        // add a rectarea light to the window
        const rectAreaLight = new THREE.RectAreaLight(0xffffff, intensity, 12, 6);
        rectAreaLight.position.set(0, 0, 0);
        rectAreaLight.lookAt(0, 0, -1);
        window.add(rectAreaLight);

        // translate the window to the position given
        window.position.set(this.position.x, this.position.y, this.position.z);
    
        return window;
  
    }
  }
  