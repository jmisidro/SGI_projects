import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import MyFloor from './components/MyFloor.js';
import MyWalls from './components/MyWalls.js';
import MyCarpet from './components/MyCarpet.js';
import MyTable from './components/MyTable.js';
import MyPlate from './components/MyPlate.js';
import MyLamp from './components/MyLamp.js';
import MyTeapot from './components/MyTeapot.js';
import MyCake from './components/MyCake.js';
import MyCakeSlice from './components/MyCakeSlice.js';
import MyCandle from './components/MyCandle.js';
import MyWindow from './components/MyWindow.js';
import MyChair from './components/MyChair.js';
import MyPaintings from './components/MyPaintings.js';
import MyNewspaper from './components/MyNewspaper.js';
import MyJar from './components/MyJar.js';
import MyFlower from './components/MyFlower.js';
import MyBeetle from './components/MyBeetle.js';
import MySpring from './components/MySpring.js';
import MyDoor from './components/MyDoor.js';
import MyCabinet from './components/MyCabinet.js';
import MyEasel from './components/MyEasel.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        this.mapSize = 1024

        
        // table related attributes
        this.tableMesh = null
        this.tableMeshSize = 1.0
        this.tableEnabled = true
        this.lastTableEnabled = null
        this.tableDisplacement = new THREE.Vector3(0,4,0)
        const tableSideColor = "#bfbdb8";
        const tableTopColor = "#996633";
        this.table = new MyTable(tableSideColor, tableTopColor);
        
        // chair related attributes
        const chairSideColor = "#bfbdb8";
        const chairTopColor = "#996633";
        const chairPosition = new THREE.Vector3(0, 0, -9);
        this.chair = new MyChair(chairSideColor, chairTopColor, chairPosition);
        
        // left lamp related attributes
        this.leftLampOn = false
        this.lastLeftLampOn = null
        this.lampTopColor = "#1d5f99";
        const lampBaseColor = "#4d2600";
        const lampColumnColor = "#d9ae84";
        const lampPosition = new THREE.Vector3(-16, 0, 16);
        this.leftLamp = new MyLamp(lampBaseColor, lampColumnColor, lampPosition);
        
        // right lamp related attributes
        this.rightLampOn = false
        this.lastRightLampOn = null
        const rightLampPosition = new THREE.Vector3(-16, 0, -16);
        this.rightLamp = new MyLamp(lampBaseColor, lampColumnColor, rightLampPosition);
        
        // teapot related attributes
        const teapotColor = "#ffffff";
        const teapotPosition = new THREE.Vector3(-3.5, 5.3, 3);
        this.teapot = new MyTeapot(teapotColor, teapotPosition);
        
        // plate related attributes
        const plateColor = "#b8b4ad";
        const platePosition = new THREE.Vector3(0, 4.3, 0); // top of the table
        this.plate = new MyPlate(plateColor, platePosition);

        // Cake related attributes
        const cakeColor = "#ffcc99";  // Light cake color
        const sliceColor = "#DDDDDD"; // White layer inside cake
        const cakePosition = new THREE.Vector3(0, 4.62, 0);  // top of the plate
        this.cake = new MyCake(cakeColor,sliceColor, cakePosition);

        // plate related attributes
        const slicePlatePosition = new THREE.Vector3(4, 4.3, 0); // top of the table
        this.sliceplate = new MyPlate(plateColor, slicePlatePosition);

        // Cake Slice related attributes
        const slicePosition = new THREE.Vector3(3.5, 4.62, 1);  // top of the slicePlate
        this.cakeSlice = new MyCakeSlice(cakeColor, sliceColor, slicePosition);

        // Candle related attributes
        const candleColor1 = '#0000FF'; // Blue
        const candleColor2 = '#FFFFFF'; // White
        const flameColor = "#ff9900"; 
        const candlePosition = new THREE.Vector3(0, 4.4, 0);
        this.candle = new MyCandle(candleColor1, candleColor2, flameColor, candlePosition);

        // window related attributes
        this.windowLightIntensity = 25;
        const windowPosition = new THREE.Vector3(0, 15, 20);
        this.window = new MyWindow(windowPosition);

        // painting related attributes
        const paintingPosition1 = new THREE.Vector3(-19.8, 14, -6); 
        const paintingPosition2 = new THREE.Vector3(-19.8, 14, 6);
        this.paintings = new MyPaintings(paintingPosition1, paintingPosition2, 'textures/painting2.jpg', 'textures/painting1.jpg', 'textures/canvas_texture.jpg');

        // floor related attributes
        this.applyFloorTexture = true
        this.diffuseFloorColor = "#fff0d1"
        this.specularFloorColor = "#777777"
        const floorSize = 40;
        this.floor = new MyFloor(floorSize);

        // carpet related attributes
        const carpetSize = 20;
        const carpetPosition = new THREE.Vector3(0, 0.1, 0);
        this.carpet = new MyCarpet(carpetSize, carpetPosition);
        
        // walls related attributes
        this.wallColor = "#40484f"
        const width = 40;
        const height = 20;
        this.walls = new MyWalls(width, height);

        // door related attributes
        const doorColor = "#ad8b72";
        const doorSizeX = 6;
        const doorSizeY = 10;
        const doorPosition = new THREE.Vector3(-19.9, 5, 0);
        this.door = new MyDoor(doorColor, doorSizeX, doorSizeY, doorPosition);

        // beetle related attributes
        const beetlePosition = new THREE.Vector3(0, 15, -19.6);
        const beetleScale = 0.5;
        this.beetle = new MyBeetle(beetleScale, beetlePosition);

        // newspaper related attributes
        const newspaperPosition = new THREE.Vector3(1.5, 4.4, -4.5);
        this.newspaper = new MyNewspaper(newspaperPosition);

        // jar related attributes
        const jarColor = "#8B4513";
        const jarPosition = new THREE.Vector3(18, 3.5, -8);
        this.jar = new MyJar(jarColor, jarPosition);

        // flower related attributes
        const flowerStemColor = "#228B22";
        const flowerPetalColor = "#fbff00";
        const flowerPosition = new THREE.Vector3(18, 8.5, -8);
        this.flower = new MyFlower(flowerStemColor, flowerPetalColor, flowerPosition);

        // spring related attributes
        const springColor = "#FFFFFF";
        const springPosition = new THREE.Vector3(4.5, 4.8, 2.8);
        this.spring = new MySpring(springColor, springPosition);

        // cabinet related attributes
        const cabinetColor = "#8a6b4e";
        const cabinetPosition = new THREE.Vector3(18, 0, -8);
        this.cabinet = new MyCabinet(cabinetColor, cabinetPosition);

        // easel related attributes
        const easelPosition = new THREE.Vector3(16, 0, 16);
        this.easel = new MyEasel(easelPosition);
    }


    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add a point light on top of the model
        const pointLight = new THREE.PointLight( 0xffffff, 300, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add directional light
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
        directionalLight.position.set( 30, 30, 5 );
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = this.mapSize;
        directionalLight.shadow.mapSize.height = this.mapSize;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 100;
        directionalLight.shadow.camera.left = -30;
        directionalLight.shadow.camera.right = 30;
        directionalLight.shadow.camera.bottom = -30;
        directionalLight.shadow.camera.top = 30;
        this.app.scene.add( directionalLight );


        // add a spot light on top of the cake
        this.spotLightColor = 0xffffff
        this.spotLight = new THREE.SpotLight( this.spotLightColor, 60 );
        this.spotLight.position.set(2, 8, 2);
        this.spotLight.target.position.set(0,5,0);
        this.spotLight.angle = Math.PI / 4;
        this.spotLight.penumbra = 0.1;
        this.spotLight.decay = 2;
        this.spotLight.castShadow = true;
        this.spotLight.shadow.mapSize.width = this.mapSize;
        this.spotLight.shadow.mapSize.height = this.mapSize;
        this.spotLight.shadow.camera.near = 0;
        this.spotLight.shadow.camera.far = 50;
        this.app.scene.add( this.spotLight );


        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        this.app.scene.add( ambientLight );

        /* WALLS */
        this.wallsMesh = this.walls.buildWalls(this.wallColor);
        this.app.scene.add(this.wallsMesh);

        /* DOOR */
        const doorMesh = this.door.buildDoor();
        this.app.scene.add(doorMesh);
        
        /* TABLE */
        this.tableMesh = this.table.buildTable(this.tableMeshSize);
        this.app.scene.add(this.tableMesh);

        /* CHAIR */
        const chairMesh = this.chair.buildChair();
        this.app.scene.add(chairMesh);

        /* PLATE */
        const plateMesh = this.plate.buildPlate();
        this.app.scene.add(plateMesh);

        /* LAMPS */
        this.leftLampMesh = this.leftLamp.buildLamp(this.leftLampOn, this.lampTopColor);
        this.app.scene.add(this.leftLampMesh);
        this.rightLampMesh = this.rightLamp.buildLamp(this.rightLampOn, this.lampTopColor);
        this.app.scene.add(this.rightLampMesh);

        /* TEAPOT */
        const teapotMesh = this.teapot.buildTeapot();
        this.app.scene.add(teapotMesh);

        /* CAKE */
        const cakeMesh = this.cake.buildCake()
        this.app.scene.add(cakeMesh);

        /* CAKE SLICE PLATE */
        const slicePlateMesh = this.sliceplate.buildPlate();
        slicePlateMesh.scale.set(0.7, 0.7, 0.7);
        this.app.scene.add(slicePlateMesh);

        /* CAKE SLICE */
        const cakeSliceMesh = this.cakeSlice.buildSlice();
        cakeSliceMesh.rotateY(3 * Math.PI / 4);
        this.app.scene.add(cakeSliceMesh);

        /* CANDLE */
        const candleMesh = this.candle.buildCandle();
        this.app.scene.add(candleMesh);

        /* WINDOW */
        this.windowMesh = this.window.buildWindow(this.windowLightIntensity);
        this.app.scene.add(this.windowMesh);

        /* FLOOR */
        this.floorMesh = this.floor.buildFloor(this.diffuseFloorColor, this.specularFloorColor, this.applyFloorTexture);
        this.app.scene.add( this.floorMesh );

        /* CARPET */
        const carpetMesh = this.carpet.buildCarpet();
        this.app.scene.add(carpetMesh);

        /* PAINTINGS */
        const paintingsMesh = this.paintings.buildPaintings();
        this.app.scene.add(paintingsMesh);

        /* NEWSPAPER */
        const newspaperMesh = this.newspaper.buildNewspaper();
        this.app.scene.add(newspaperMesh);

        /* JAR */
        const jarMesh = this.jar.buildJar();
        this.app.scene.add(jarMesh);

        /* FLOWER */
        const flowerMesh = this.flower.buildFlower();
        this.app.scene.add(flowerMesh);

        /* BEETLE */
        const beetleMesh = this.beetle.buildBeetle();
        this.app.scene.add(beetleMesh);

        /* SPRING */
        const springMesh = this.spring.buildSpringBody();
        this.app.scene.add(springMesh); 

        /* CABINET */
        const cabinetMesh = this.cabinet.buildCabinet();
        this.app.scene.add(cabinetMesh);

        /* EASEL */
        const easelMesh = this.easel.buildEasel();
        easelMesh.rotation.y = 5*Math.PI / 4;
        this.app.scene.add(easelMesh);
    }

       /**
     * updates the spot light color and the material
     * @param {THREE.Color} value 
     */
       updateSpotLightColor(value) {
        this.spotLightColor = value
        this.spotLight.color.set(value)
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffuseFloorColor(value) {
        this.diffuseFloorColor = value
        this.rebuildFloor()
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularFloorColor(value) {
        this.specularFloorColor = value
        this.rebuildFloor()
    }

    /**
     * updates the plane texture and the material
     */
    updateFloorTexture(value) {
        this.applyFloorTexture = value
        this.rebuildFloor()
    }

    /**
     * rebuilds the floor mesh if required
     * this method is called from the gui interface
     */
    rebuildFloor() {
        // remove floorMesh if exists
        if (this.floorMesh !== undefined && this.floorMesh !== null) {  
            this.app.scene.remove(this.floorMesh)
        }
        this.floorMesh = this.floor.buildFloor(this.diffuseFloorColor, this.specularFloorColor, this.applyFloorTexture);
        this.app.scene.add(this.floorMesh)
    }

    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateWallColor(value) {
        this.wallColor = value
        this.rebuildWalls()
    }

    rebuildWalls() {
        // remove walls if exists
        if (this.wallsMesh !== undefined && this.wallsMesh !== null) {  
            this.app.scene.remove(this.wallsMesh)
        }
        this.wallsMesh = this.walls.buildWalls(this.wallColor);
        this.app.scene.add(this.wallsMesh)
    }

    /**
     * rebuilds the table mesh if required
     * this method is called from the gui interface
     */
    rebuildTable() {
        // remove tableMesh if exists
        if (this.tableMesh !== undefined && this.tableMesh !== null) {  
            this.app.scene.remove(this.tableMesh)
        }
        this.tableMesh = this.table.buildTable(this.tableMeshSize);
        this.lastTableEnabled = null
    }
    
    /**
     * updates the table mesh if required
     * this method is called from the render method of the app
     * updates are trigered by tableEnabled property changes
     */
    updateTableIfRequired() {
        if (this.tableEnabled !== this.lastTableEnabled) {
            this.lastTableEnabled = this.tableEnabled
            if (this.tableEnabled) {
                this.app.scene.add(this.tableMesh)
            }
            else {
                this.app.scene.remove(this.tableMesh)
            }
        }
    }

    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateLampColor(value) {
        this.lampTopColor = value
        this.rebuildLeftLamp()
        this.rebuildRightLamp()
    }

    rebuildWindow() {
        if (this.windowMesh !== undefined && this.windowMesh !== null) {
            this.app.scene.remove(this.windowMesh);
        }
        const windowMesh = this.window.buildWindow(this.windowLightIntensity);
        this.app.scene.add(windowMesh);
    }

    /**
     * rebuilds the left lamp mesh if required
     * this method is called from the gui interface
     */
    rebuildLeftLamp() {
        // remove leftLampMesh if exists
        if (this.leftLampMesh !== undefined && this.leftLampMesh !== null) {  
            this.app.scene.remove(this.leftLampMesh)
        }
        this.leftLampMesh = this.leftLamp.buildLamp(this.leftLampOn, this.lampTopColor);
        this.lastLeftLampOn = null
    }
    
    /**
     * updates the left lamp mesh if required
     * this method is called from the render method of the app
     * updates are trigered by leftLampOn property changes
     */
    updateLeftLampIfRequired() {
        if (this.leftLampOn !== this.lastLeftLampOn) {
            this.lastLeftLampOn = this.leftLampOn
            this.app.scene.add(this.leftLampMesh)
        }
    }

    /**
     * rebuilds the right lamp mesh if required
     * this method is called from the gui interface
     */
    rebuildRightLamp() {
        // remove rightLampMesh if exists
        if (this.rightLampMesh !== undefined && this.rightLampMesh !== null) {  
            this.app.scene.remove(this.rightLampMesh)
        }
        this.rightLampMesh = this.rightLamp.buildLamp(this.rightLampOn, this.lampTopColor);
        this.lastRightLampOn = null
    }
    
    /**
     * updates the right lamp mesh if required
     * this method is called from the render method of the app
     * updates are trigered by rightLampOn property changes
     */
    updateRightLampIfRequired() {
        if (this.rightLampOn !== this.lastRightLampOn) {
            this.lastRightLampOn = this.rightLampOn
            this.app.scene.add(this.rightLampMesh)
        }
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if table mesh needs to be updated
        this.updateTableIfRequired()

        // check if left lamp mesh needs to be updated
        this.updateLeftLampIfRequired()

        // check if right lamp mesh needs to be updated
        this.updateRightLampIfRequired()

        // sets the table mesh position based on the displacement vector
        this.tableMesh.position.x = this.tableDisplacement.x
        this.tableMesh.position.y = this.tableDisplacement.y
        this.tableMesh.position.z = this.tableDisplacement.z
        
    }

}

export { MyContents };