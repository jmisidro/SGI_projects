import * as THREE from 'three';

class MyObject extends THREE.Group {

    /**
     * Initializes a basic object that can be extended.
     * @param {String} name - The name of the object to display in the side menu.
     * @param {String} materialId - The identifier for the material of the contained items.
     */
    constructor(name, materialId) {
        super();
        this.name = name;
        this.materialId = materialId;
    }
}

export { MyObject }