import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // add a folder to the gui interface for the table
        const tableFolder = this.datgui.addFolder( 'Table' );
        // note that we are using a property from the contents object 
        tableFolder.add(this.contents, 'tableMeshSize', 0, 10).name("size").onChange( () => { this.contents.rebuildTable() } );
        tableFolder.add(this.contents, 'tableEnabled', true).name("enabled");
        tableFolder.add(this.contents.tableDisplacement, 'x', -5, 10)
        tableFolder.add(this.contents.tableDisplacement, 'y', -5, 10)
        tableFolder.add(this.contents.tableDisplacement, 'z', -5, 10)
        tableFolder.open()

        const lightData = {  
            'Color': this.contents.spotLightColor,
        };

        const lightFolder = this.datgui.addFolder('Spot light')
        lightFolder.addColor( lightData, 'Color' ).onChange( (value) => { this.contents.updateSpotLightColor(value) } );
        lightFolder.add(this.contents.spotLight, 'intensity', 0, 100).name("intensity");
        lightFolder.add(this.contents.spotLight, 'distance', 0, 20).name("distance");
        lightFolder.add(this.contents.spotLight.position, 'x', -5, 10).name("x coord")
        lightFolder.add(this.contents.spotLight.position, 'y', -5, 10).name("y coord")
        lightFolder.add(this.contents.spotLight.position, 'z', -5, 10).name("z coord")

        const windowFolder = this.datgui.addFolder('Window light')
        windowFolder.add(this.contents, 'windowLightIntensity', 0, 100).name("intensity").onChange( () => { this.contents.rebuildWindow() } );

        const lampData = {  
            'Color': this.contents.lampTopColor,
        };

        // add a folder to the gui interface for the lamps
        const lampsFolder = this.datgui.addFolder( 'Lamps' );
        lampsFolder.add(this.contents, 'leftLampOn', true).name("Left Lamp On").onChange( () => { this.contents.rebuildLeftLamp() } );
        lampsFolder.add(this.contents, 'rightLampOn', true).name("Right Lamp On").onChange( () => { this.contents.rebuildRightLamp() } );
        lampsFolder.addColor( lampData, 'Color' ).onChange( (value) => { this.contents.updateLampColor(value) } );

        const floorData = {  
            'Diffuse color': this.contents.diffuseFloorColor,
            'Specular color': this.contents.specularFloorColor,
        };

        // adds a folder to the gui interface for the floor
        const floorFolder = this.datgui.addFolder( 'Floor' );
        floorFolder.addColor( floorData, 'Diffuse color' ).onChange( (value) => { this.contents.updateDiffuseFloorColor(value) } );
        floorFolder.addColor( floorData, 'Specular color' ).onChange( (value) => { this.contents.updateSpecularFloorColor(value) } );
        floorFolder.add(this.contents, 'applyFloorTexture', true).name("Apply Texture").onChange( (value) => { this.contents.updateFloorTexture(value) } );
        floorFolder.open();

        const wallData = {  
            'Color': this.contents.wallColor,
        };
        // adds a folder to the gui interface for the walls
        const wallsFolder = this.datgui.addFolder( 'Walls' );
        wallsFolder.addColor( wallData, 'Color' ).onChange( (value) => { this.contents.updateWallColor(value) } );
        

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective','Perspective2', 'Left', 'Right', 'Top', 'Front', 'Back' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 30).name("x")
        cameraFolder.add(this.app.activeCamera.position, 'y', 0, 30).name("y")
        cameraFolder.add(this.app.activeCamera.position, 'z', 0, 30).name("z")
        cameraFolder.open()
    }
}

export { MyGuiInterface };