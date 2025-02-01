import * as THREE from 'three';

class MyObject extends THREE.Group {

    /**
     * Constructs a base object that can be built upon.
     * @constructor
     * @param {String} name - the name of the object to appear on the side menu.
     * @param {String} materialId - The id for the material for the items inside.
     */
    constructor(name, materialId = null, object = null) {
        super();
        this.name = name;
        this.materialId = materialId;
        this.object = object;
        this.isSelectable = false;
        this.selected = false;
    }

    /**
     * Gets the current position of the object.
     * @returns {Vector3} - The current position of the object.
     */
    getPosition() {
        return this.object.position;
    }

    /**
     * Sets the object size
     */
    setSize(sizeX, sizeY, sizeZ) {
        this.object.scale.set(sizeX, sizeY, sizeZ);
    }

    /**
     * Sets the color of all sub-objects to the color provided.
     * @param {Color} color - the color to set the object to.
     */
    setColor(color) {
        this.object.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((_, index) => {
                        child.material[index].color = color;
                    });
                } else {
                    child.material.color = color;
                }
            }
        });
    }

    /**
     * Enables selecting for the object, allowing it to be interacted with.
     */
    enableSelecting() {
        this.isSelectable = true;
    }

    /**
     * Disables selecting for the object, preventing interactions.
     */
    disableSelecting() {
        this.isSelectable = false;
    }

    /**
     * Selects the object
     */
    select() {
        this.selected = true;
    }

    /*
     * Unselects the object
     */
    unselect() {
        this.selected = false;
    }

    /**
     * Updates the object animation based on time.
     * @param {Number} delta - The delta time.
     */
    update(delta) {
        if (this.animation)
            this.animation.update(delta);
    }

    /**
     * Inits the object movement
     */
    play() {
        if (this.animation)
            this.animation.play();
    }

    /**
     * Stops the object movement
     */
    stop() {
        if (this.animation)
            this.animation.stop();
    }
}

export { MyObject }