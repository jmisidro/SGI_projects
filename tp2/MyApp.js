
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import Stats from 'three/addons/libs/stats.module.js'

/**
 * This class contains the application object
 */
class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null
        this.stats = null

        // camera related attributes
        this.activeCamera = null
        this.activeCameraName = null
        this.lastCameraName = null
        this.cameras = {}
        this.frustumSize = 20

        // objects related attributes
        this.objectList = [];
        this.selectedObject = null;

        // light related attributes
        this.lights = [];
        this.selectedLightType = null;

        // material related attributes
        this.selectedMaterial = null;

        // other attributes
        this.renderer = null
        this.controls = null
        this.gui = null
        this.axis = null
        this.contents == null
    }
    /**
     * initializes the application
     */
    init() {
                
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        this.initCameras();
        this.setActiveCamera('Default')

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap; // default THREE.PCFShadowMap

        // Configure renderer size
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild( this.renderer.domElement );

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false );
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        // Create a basic perspective camera
        const perspective1 = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight )
        perspective1.near = 0.1
        perspective1.far = 1000
        perspective1.position.set(-15,10,15)
        perspective1.lookAt(0,0,0)
        perspective1.userData.target = new THREE.Vector3(0,0,0)
        perspective1.name = 'Default'
        this.cameras['Default'] = perspective1
    }

    /**
     * Add a new camera to the scene
     * @param {THREE.Camera} camera 
     */
    addCamera(camera) {
        this.cameras[camera.name] = camera
    }

    /**
     * sets the active camera by name
     */
    setActiveCamera(camera) {   
        this.activeCameraName = camera
        this.activeCamera = this.cameras[camera]
        if (this.gui !== null) {
            this.gui.update()
        }
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {

        // camera changed?
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName]
            document.getElementById("camera").innerHTML = this.activeCameraName
           
            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize()

            // are the controls yet?
            if (this.controls === null) {
                // Orbit controls allow the camera to orbit around a target.
                this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                this.controls.enableZoom = true;
                this.updateCameraTarget()
            }
            else {
                this.controls.object = this.activeCamera
                this.updateCameraTarget()
            }
        }
    }

    /**
     * the camera target handler
     */
    updateCameraTarget(){
        this.controls.target.copy(this.activeCamera.userData.target);
        this.controls.update();
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        }
    }
    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {   
        this.gui = gui
    }

    /**
     * Add an object to the object list
     * @param {THREE.Object3D} object
     */
    addObject(object) {
        this.objectList.push(object);
        if (this.gui !== null) {
            this.gui.update()
        }
    }

    /**
     * Add a light to the light list
     * @param {THREE.Light} light
     */
    addLight(light) {
        this.lights[light.name] = light;
        if (this.gui !== null) {
            this.gui.update()
        }
    }


    /**
     * Update a material in the all the objects in the scene
     * @param {string} name - name of the material
     * @param {THREE.Material} material - the material to update
     */
    updateMaterial(name, material) {
        this.objectList.forEach(obj => {
            if (obj && obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material = obj.material.map(mat => 
                        mat.name === name ? material : mat
                    );
                } else {
                    if (obj.material.name === name)
                        obj.material = material;
                }
            }
        });
    }


    /**
     * Get object from objectList by name
     * @param {string} name - name of the object to retrieve
     * @return {THREE.Object3D|null} - the object if found, else null
     */
    getObjectByName(name) {
        if (!name) return null;
        return this.objectList.find(obj => obj.name === name) || null;
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
        this.stats.begin()
        this.updateCameraIfRequired()

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update()
        }

        // required if controls.enableDamping or controls.autoRotate are set to true
        this.controls.update();

        // render the scene
        this.renderer.render(this.scene, this.activeCamera);

        // subsequent async calls to the render loop
        requestAnimationFrame( this.render.bind(this) );

        this.lastCameraName = this.activeCameraName
        this.stats.end()
    }
}


export { MyApp };