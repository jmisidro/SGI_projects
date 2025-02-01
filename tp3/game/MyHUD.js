import * as THREE from 'three';
import { loadFontTexture, createTextSprites } from '../utils/MySpritesheet.js';


class MyHUD {

    /**
     * Constructs a button object.
     * @constructor
     * @param {MyObject} object - The object associated with the button.
    */
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.textSprites = [];
    
        loadFontTexture();
    }   

    addText(name, text, size = 0.01, offsetX = 0.1, offsetY = 0.1, spacing = 0.001) {
        const textSprites = createTextSprites(text, size, spacing);
        const textPosition = new THREE.Vector3(-0.9 + offsetX, 0.9 + offsetY, -1);

        textSprites.position.set(textPosition.x, textPosition.y, textPosition.z);
        textSprites.name = name;
        textSprites.userData.size = size;
        textSprites.userData.offsetX = offsetX;
        textSprites.userData.offsetY = offsetY;
        textSprites.userData.spacing = spacing;
        this.textSprites.push(textSprites);
        this.scene.add(textSprites);
    }

    updateText(name, text) {
        const oldSprite = this.textSprites.find(sprite => sprite.name === name);
        if (oldSprite) {
            const { position, userData } = oldSprite;
            this.scene.remove(oldSprite);
            this.textSprites = this.textSprites.filter(sprite => sprite.name !== name);

            const newTextSprites = createTextSprites(text, userData.size, userData.spacing);
            newTextSprites.position.copy(position);
            newTextSprites.name = name;
            Object.assign(newTextSprites.userData, userData);
            this.textSprites.push(newTextSprites);
            this.scene.add(newTextSprites);
        }
    }

    update() {
        const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
        const distance = 0.1; // 10cm

        this.textSprites.forEach((textSprite) => {
            // Calculate the final position with offsets
            const newPosition = new THREE.Vector3();
            newPosition.copy(this.camera.position).addScaledVector(direction, distance);
            newPosition.add(new THREE.Vector3(textSprite.userData.offsetX, textSprite.userData.offsetY, 0).applyQuaternion(this.camera.quaternion));

            // Update position and orientation
            textSprite.position.copy(newPosition);
            textSprite.quaternion.copy(this.camera.quaternion);
        });
    }

}
 
export { MyHUD };