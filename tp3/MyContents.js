import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyCameraLoader } from './loaders/MyCameraLoader.js';
import { MyMaterialsLoader } from './loaders/MyMaterialsLoader.js';
import { MyTexturesLoader } from './loaders/MyTexturesLoader.js';
import { MySkyboxLoader } from './loaders/MySkyboxLoader.js';
import { MyObjectLoader } from './loaders/MyObjectLoader.js';
import { MyGame } from './game/MyGame.js';


/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = null

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open("scenes/scene.json");

        this.cameraLoader = new MyCameraLoader();
        this.materialLoader = new MyMaterialsLoader();
        this.textureLoader = new MyTexturesLoader();
        this.skyboxLoader = new MySkyboxLoader();
        this.objectLoader = new MyObjectLoader();
        
        this.data = null;
        this.materials = new Map();
        this.objects = null;
        this.game = new MyGame(this.app);
    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
        }
    }

    /**
     * Called when the scene JSON file load is completed
     * @param {Object} data with the entire scene object
     */
    onSceneLoaded(data) {
        console.info("YASF loaded.")
        this.data = data;
        this.onAfterSceneLoadedAndBeforeRender(data);
        // Init Game
        this.game.init();
    }

    printYASF(data, indent = '') {
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                console.log(`${indent}${key}:`);
                this.printYASF(data[key], indent + '\t');
            } else {
                console.log(`${indent}${key}: ${data[key]}`);
            }
        }
    }

    onAfterSceneLoadedAndBeforeRender(data) {
        //this.printYASF(data);
        //console.log(data);

        // Cameras
        this.cameraLoader.load(data.cameras).forEach(camera => {
            this.app.addCamera(camera);
        });
        this.app.setActiveCamera(data.activeCameraId);

        // Globals
        const globalSettings = {
            background: new THREE.Color(...data.globals.background),
            ambient: new THREE.Color(...data.globals.ambient),
        };
        this.app.scene.background = globalSettings.background;
        const ambientLight = new THREE.AmbientLight(globalSettings.ambient);
        this.app.scene.add(ambientLight);

        // Fog
        if (data.fog !== "undefined") {
            const fogParams = {
                color: new THREE.Color(...data.fog.color),
                near: data.fog.near,
                far: data.fog.far,
                type: data.fog.type,
            };
            const fog = new THREE.Fog(fogParams.color, fogParams.near, fogParams.far);
            this.app.scene.fog = fog;
        }

        // Skybox
        const skybox = this.skyboxLoader.load(data.skybox);
        this.app.scene.add(skybox);

        // Textures and Materials
        const texturePaths = this.textureLoader.getTexPaths(data.textures);
        this.materials = this.materialLoader.getMaterials(data.materials, texturePaths);

        // Objects
        this.objects = this.objectLoader.load(data.nodes, data.rootId, this.materials);
        this.app.scene.add(this.objects);

        // Add objects and lights  in GUI interface
        this.objects.traverse((item) => {
            if (item.name && item.name.endsWith("_obj"))
                this.app.addObject(item);
            else if (item.name && item.name.endsWith("_light"))
                this.app.addLight(item);
        });
    }    


    update() {
        this.game.update();
    }
}

export { MyContents };
