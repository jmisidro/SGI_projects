import { MyObject } from './MyObject.js';
import * as THREE from 'three';

class MyButton extends MyObject {

    /**
     * Constructs a button object.
     * @constructor
     * @param {MyObject} object - The object associated with the button.
    */
    constructor(object) {
        super(object.name);
        this.object = object;
    }   

    /**
     * Initiates the button's motion.
     */
    play() {
        this.isSelectable = true;
    }

    /**
     * Stops the button's motion.
     */
    stop() {
        this.isSelectable = false;
    }

    /**
     * Updates the button's animation based on time.
     */
    update() {
        if (this.isSelectable) {            
            this.setColor(this.selected ? new THREE.Color(0.5, 0.5, 0.5) : new THREE.Color(1, 1, 1));
        }
    }
}
 
export { MyButton };