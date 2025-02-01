import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import * as THREE from 'three';


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

    init() {
        this.createFolders();
        this.setupAxisControls();
    }

    update() { 
        this.setupCameraControls(this.app.cameras[this.app.activeCameraName]);
        this.setupObjectControls();
        this.setupLightControls(this.app.lights[this.app.selectedLightType]);
        this.setupMaterialControls();
    }

    createFolders() {
        this.mainFolder = this.datgui.addFolder("Main");
        this.cameraFolder = this.datgui.addFolder("Camera");
        this.objectFolder = this.datgui.addFolder('Objects');
        this.lightsFolder = this.datgui.addFolder('Lights');
        this.materialFolder = this.datgui.addFolder('Materials');
    }

    setupAxisControls() {
        this.mainFolder.add(this.contents.axis, 'enabled', true).name('Show axis').onChange(() => {
            !this.contents.axis.enabled ? this.app.scene.remove(this.contents.axis) : this.app.scene.add(this.contents.axis);
        });
    }

    setupCameraControls(camera) {
        this.cameraFolder.children.slice().forEach(controller => controller.destroy());
        const cameraNames = Object.keys(this.app.cameras);
        const activeCameraController = this.cameraFolder.add(this.app, 'activeCameraName', cameraNames).name("Active Camera");

        activeCameraController.onChange((selectedCameraName) => {
            this.clearFolder(this.cameraFolder, "activeCameraName");
            const selectedCamera = this.app.cameras[selectedCameraName];
            this.addCameraControls(selectedCamera);
        });

        this.addCameraControls(camera);
    }

    addCameraControls(camera) {
        if (!camera) return;

        if (camera instanceof THREE.OrthographicCamera) {
            this.cameraFolder.add(camera, 'left', -100, 100).name("Left");
            this.cameraFolder.add(camera, 'right', -100, 100).name("Right");
            this.cameraFolder.add(camera, 'top', -100, 100).name("Top");
            this.cameraFolder.add(camera, 'bottom', -100, 100).name("Bottom");
        } else if (camera instanceof THREE.PerspectiveCamera) {
            this.cameraFolder.add(camera, 'fov', 1, 180).name("Field of View").onChange(() => camera.updateProjectionMatrix());
        }

        this.cameraFolder.add(camera, 'near', 0.1, 1000).name("Near").onChange(() => camera.updateProjectionMatrix());
        this.cameraFolder.add(camera, 'far', 100, 5000).name("Far").onChange(() => camera.updateProjectionMatrix());

        const positionFolder = this.cameraFolder.addFolder('Position');
        positionFolder.add(camera.position, 'x', -50, 50).name("X");
        positionFolder.add(camera.position, 'y', -50, 50).name("Y");
        positionFolder.add(camera.position, 'z', -50, 50).name("Z");

        const lookAtFolder = this.cameraFolder.addFolder('LookAt');
        const lookAtControls = {
            lookAtX: camera.userData.target ? camera.userData.target.x : 0,
            lookAtY: camera.userData.target ? camera.userData.target.y : 0,
            lookAtZ: camera.userData.target ? camera.userData.target.z : 0,
        };

        const updateLookAt = () => {
            camera.userData.target = new THREE.Vector3(lookAtControls.lookAtX, lookAtControls.lookAtY, lookAtControls.lookAtZ);
            this.app.updateCameraTarget();
        };

        lookAtFolder.add(lookAtControls, 'lookAtX', -100, 300).name("LookAt X").onChange(updateLookAt);
        lookAtFolder.add(lookAtControls, 'lookAtY', -100, 100).name("LookAt Y").onChange(updateLookAt);
        lookAtFolder.add(lookAtControls, 'lookAtZ', -100, 100).name("LookAt Z").onChange(updateLookAt);
    }

    setupObjectControls() {
        // Clear the object folder
        this.objectFolder.children.slice().forEach(controller => controller.destroy());

        // Objects
        this.objControlVars = {
            xPos: 0,
            yPos: 0,
            zPos: 0,
            xSca: 1,
            ySca: 1,
            zSca: 1,
            ang: 0,
            xVec: 0,
            yVec: 0,
            zVec: 0,
            sendScale: () => {
            const transformObj = this.app.getObjectByName(this.app.selectedObject);
            if (this.objControlVars.xSca !== 0 && this.objControlVars.ySca !== 0 && this.objControlVars.zSca !== 0) {
                transformObj.scale.set(
                transformObj.scale.x * this.objControlVars.xSca,
                transformObj.scale.y * this.objControlVars.ySca,
                transformObj.scale.z * this.objControlVars.zSca
                );
            }
            },
            sendRotation: () => {
            const transformObj = this.app.getObjectByName(this.app.selectedObject);
            const rotationVector = new THREE.Vector3(this.objControlVars.xVec, this.objControlVars.yVec, this.objControlVars.zVec);
            const angRadians = THREE.MathUtils.degToRad(this.objControlVars.ang);
            transformObj.rotateOnAxis(rotationVector.normalize(), angRadians);
            }
        };
        this.objectFolder.add(this.app, 'selectedObject', this.app.objectList.filter(obj => obj && obj.name).map(obj => obj.name).sort()).name("Selected object");

        this.objectFolder.add(this.objControlVars, "xPos", -50, 50).onChange(value => this.updateObjectPosition('x', value)).name("Transform X");
        this.objectFolder.add(this.objControlVars, "yPos", -50, 50).onChange(value => this.updateObjectPosition('y', value)).name("Transform Y");
        this.objectFolder.add(this.objControlVars, "zPos", -50, 50).onChange(value => this.updateObjectPosition('z', value)).name("Transform Z");

        this.objectFolder.add(this.objControlVars, "xSca").name("Scale in x");
        this.objectFolder.add(this.objControlVars, "ySca").name("Scale in y");
        this.objectFolder.add(this.objControlVars, "zSca").name("Scale in z");
        this.objectFolder.add(this.objControlVars, "sendScale").name("Update Scale");

        this.objectFolder.add(this.objControlVars, "ang").name("Rotation Angle (degrees)");
        this.objectFolder.add(this.objControlVars, "xVec").name("Rotation Vector X");
        this.objectFolder.add(this.objControlVars, "yVec").name("Rotation Vector Y");
        this.objectFolder.add(this.objControlVars, "zVec").name("Rotation Vector Z");
        this.objectFolder.add(this.objControlVars, "sendRotation").name("Update Rotation");
    }

    updateObjectPosition(axis, value) {
        const transformObj = this.app.getObjectByName(this.app.selectedObject);
        switch (axis) {
            case 'x':
                transformObj.position.set(value, transformObj.position.y, transformObj.position.z);
                break;
            case 'y':
                transformObj.position.set(transformObj.position.x, value, transformObj.position.z);
                break;
            case 'z':
                transformObj.position.set(transformObj.position.x, transformObj.position.y, value);
                break;
            default:
                break;
        }
    }

    setupLightControls(light) {
        // Clear the lights folder
        this.lightsFolder.children.slice().forEach(controller => controller.destroy());

        const lightNames = Object.keys(this.app.lights);
        const selectedLightController = this.lightsFolder.add(this.app, 'selectedLightType', lightNames).name("Selected Light");

        selectedLightController.onChange((selectedLightType) => {
            const selectedLight = this.app.lights[selectedLightType];
            this.addLightControls(selectedLight);
        });

        this.addLightControls(light);
    }

    addLightControls(light) {
        if (!light) return;

        this.clearFolder(this.lightsFolder, "selectedLightType");

        switch (light.type) {
            case 'AmbientLight':
                this.lightsFolder.addColor(light, 'color').name("Color");
                this.lightsFolder.add(light, 'intensity', 0, 100).name("Intensity");
                break;
            case 'PointLight':
                this.lightsFolder.add(light, 'distance', 0, 1000).name("Distance");
                this.lightsFolder.add(light, 'decay', 0, 50).name("Decay");
                break;
            case 'SpotLight':
                this.lightAttributes = { "angle": THREE.MathUtils.radToDeg(light.angle) };
                this.lightsFolder.add(light, 'distance', 0, 1000).name("Distance");
                this.lightsFolder.add(this.lightAttributes, 'angle', 0, 180).name("Angle").onChange(value => light.angle = THREE.MathUtils.degToRad(value));
                this.lightsFolder.add(light, 'decay', 0, 50).name("Decay");
                this.lightsFolder.add(light, 'penumbra', 0, 1).name("Penumbra");
                const targetFolder = this.lightsFolder.addFolder('Target');
                targetFolder.add(light.target.position, 'x', -50, 50).name("X");
                targetFolder.add(light.target.position, 'y', -50, 50).name("Y");
                targetFolder.add(light.target.position, 'z', -50, 50).name("Z");
                break;
            case 'DirectionalLight':
                this.lightsFolder.add(light.shadow.camera, 'left', -50, 50).name("Shadow Left");
                this.lightsFolder.add(light.shadow.camera, 'right', -50, 50).name("Shadow Right");
                this.lightsFolder.add(light.shadow.camera, 'bottom', -50, 50).name("Shadow Bottom");
                this.lightsFolder.add(light.shadow.camera, 'top', -50, 50).name("Shadow Top");
                break;
            default:
                break;
        }

        this.lightsFolder.add(light, 'visible').name("Enabled");
        this.lightsFolder.addColor(light, 'color').name("Color");
        this.lightsFolder.add(light, 'intensity', 0, 100).name("Intensity");
        const positionFolder = this.lightsFolder.addFolder('Position');
        positionFolder.add(light.position, 'x', -50, 50).name("X");
        positionFolder.add(light.position, 'y', -50, 50).name("Y");
        positionFolder.add(light.position, 'z', -50, 50).name("Z");
        this.lightsFolder.add(light, 'castShadow').name("Cast Shadow");
        this.lightsFolder.add(light.shadow.camera, 'far', 0, 1000).name("Shadow Far").onChange(() => light.shadow.camera.updateProjectionMatrix());
        this.lightsFolder.add(light.shadow.mapSize, 'width', 0, 1024).name("Shadow Map Width");
        this.lightsFolder.add(light.shadow.mapSize, 'height', 0, 1024).name("Shadow Map Height");
    }

    /**
     * Initialize the gui interface
     */
    setupMaterialControls() {
        // Clear the material folder
        this.materialFolder.children.slice().forEach(controller => controller.destroy());

        const materialSet = new Set();
        this.app.objectList.forEach(obj => {
            if (obj && obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(mat => materialSet.add(mat));
                } else {
                    materialSet.add(obj.material);
                }
            }
        });

        // Remove duplicates (same name) and sort the material names
        materialSet.forEach(mat => {
            if (mat.name) {
                const sameNameMats = [...materialSet].filter(otherMat => otherMat.name === mat.name);
                if (sameNameMats.length > 1) {
                    // keep the first one and remove the others
                    sameNameMats.slice(1).forEach(otherMat => materialSet.delete(otherMat));
                }
            }
        });


        const materialNames = [...materialSet].map(mat => mat.name).filter(name => name).sort();
        this.materialFolder.add(this.app, 'selectedMaterial', materialNames).name("Selected Material").onChange((selectedMaterialName) => {
            const selectedMaterial = [...materialSet].find(mat => mat.name === selectedMaterialName);
            this.addMaterialControls(selectedMaterial);
        });

        const initialMaterial = [...materialSet].find(mat => mat.name === this.app.selectedMaterial);
        this.addMaterialControls(initialMaterial);
    }

    addMaterialControls(material) {
        if (!material) return;

        this.clearFolder(this.materialFolder, "selectedMaterial");

        const materialInfo = {
            color: material.color.getHex(),
            specular: material.specular ?? 0,
            shininess: material.shininess || 0,
            emissive: material.emissive ?? 0,
            transparent: material.transparent || false,
            opacity: material.opacity || 1,
            wireframe: material.wireframe || false,
            flatShading: material.flatShading || false,
            side: material.side || THREE.FrontSide,
            bumpScale: material.bumpScale || 1,
        };

        this.materialFolder.addColor(materialInfo, 'color').name("Color").onChange(() => this.updateMaterialProperty(material, 'color', materialInfo.color));
        if (material.specular) this.materialFolder.addColor(materialInfo, 'specular').name("Specular").onChange(() => this.updateMaterialProperty(material, 'specular', materialInfo.specular));
        if (material.emissive) this.materialFolder.addColor(materialInfo, 'emissive').name("Emissive").onChange(() => this.updateMaterialProperty(material, 'emissive', materialInfo.emissive));
        if (material.shininess !== undefined) this.materialFolder.add(materialInfo, 'shininess', 0, 100).name("Shininess").onChange(() => this.updateMaterialProperty(material, 'shininess', materialInfo.shininess));
        this.materialFolder.add(materialInfo, 'transparent').name("Transparent").onChange(() => this.updateMaterialProperty(material, 'transparent', materialInfo.transparent));
        this.materialFolder.add(materialInfo, 'opacity', 0, 1).name("Opacity").onChange(() => this.updateMaterialProperty(material, 'opacity', materialInfo.opacity));
        this.materialFolder.add(materialInfo, 'wireframe').name("Wireframe").onChange(() => this.updateMaterialProperty(material, 'wireframe', materialInfo.wireframe));
        this.materialFolder.add(materialInfo, 'flatShading').name("Flat Shading").onChange(() => this.updateMaterialProperty(material, 'flatShading', materialInfo.flatShading));
        this.materialFolder.add(materialInfo, 'side', { Front: THREE.FrontSide, Back: THREE.BackSide, Double: THREE.DoubleSide }).name("TwoSided").onChange(() => this.updateMaterialProperty(material, 'side', materialInfo.side));
        if (material.bumpScale !== undefined) this.materialFolder.add(materialInfo, 'bumpScale', 0, 1).name("Bump Scale").onChange(() => this.updateMaterialProperty(material, 'bumpScale', materialInfo.bumpScale));
    }

    updateMaterialProperty(material, property, value) {
        if (property === 'color' || property === 'specular' || property === 'emissive') {
            material[property].setHex(value);
        } else {
            material[property] = value;
        }
        material.needsUpdate = true;

        this.app.updateMaterial(material.name, material);
    }

    updateMaterial(materialName, material) {
        this.app.updateMaterial(materialName, material);
    }

    clearFolder(folder, excludeProperty) {
        const children = [...folder.children].filter(controller => controller.property !== excludeProperty);
        children.forEach(controller => controller.destroy());
    }
}

export { MyGuiInterface };