import * as THREE from 'three';
import { MyObject } from '../objects/MyObject.js';

class MyLightLoader {

    /**
     * Load a light based on the provided light object.
     * @method
     * @param {Object} light - Object with information to create and set up the light.
     * @returns {THREE.Object3D} The light object wrapped in a MyObject.
     */
    load(light) {
        const myObject = new MyObject();
        let lightObject;

        switch (light.type) {
            case 'pointlight':
                lightObject = this.createPointLight(light);
                break;
            case 'spotlight':
                lightObject = this.createSpotLight(light, myObject);
                break;
            case 'directionallight':
                lightObject = this.createDirectionalLight(light);
                break;
            default:
                throw new Error(`Unknown light type: ${light.type}`);
        }

        this.setupLight(lightObject, light);
        myObject.add(lightObject);
        myObject.name = "light_";

        return myObject;
    }

    createPointLight(light) {
        const pointLight = new THREE.PointLight();
        pointLight.distance = light.distance ?? 1000;
        pointLight.decay = light.decay ?? 2;
        return pointLight;
    }

    createSpotLight(light, myObject) {
        const spotLight = new THREE.SpotLight();
        spotLight.distance = light.distance ?? 1000;
        spotLight.angle = THREE.MathUtils.degToRad(light.angle);
        spotLight.decay = light.decay ?? 2;
        spotLight.penumbra = light.penumbra ?? 1;

        const lightTarget = new THREE.Object3D();
        spotLight.target = lightTarget;
        spotLight.target.position.set(...light.target);
        myObject.add(lightTarget);

        return spotLight;
    }

    createDirectionalLight(light) {
        const directionalLight = new THREE.DirectionalLight();
        directionalLight.shadow.camera.left = light.shadowleft ?? -5;
        directionalLight.shadow.camera.right = light.shadowright ?? 5;
        directionalLight.shadow.camera.bottom = light.shadowbottom ?? -5;
        directionalLight.shadow.camera.top = light.shadowtop ?? 5;
        return directionalLight;
    }

    setupLight(lightObject, light) {
        lightObject.enabled = light.enabled ?? true;
        lightObject.color = new THREE.Color(...light.color);
        lightObject.intensity = light.intensity ?? 1;
        lightObject.position.set(...light.position);
        lightObject.castShadow = light.castshadow ?? false;
        lightObject.shadow.camera.far = light.shadowfar ?? 500;
        lightObject.shadow.mapSize.width = light.shadowmapsize ?? 512;
        lightObject.shadow.mapSize.height = light.shadowmapsize ?? 512;
        lightObject.name = `${light.id}_light`;
    }
}

export { MyLightLoader };