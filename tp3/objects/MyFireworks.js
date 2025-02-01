import { MyObject } from './MyObject.js';
import { MyParticle } from './MyParticle.js';
import * as THREE from 'three';


class MyFireworks extends MyObject {

    /**
     * Constructs a firework object.
     * @constructor
     * @param {THREE.Object3D} object - The THREE.Object3D representing the firework.
     */
    constructor(object, app) {
        super(object.name);
        this.object = object;
        this.app = app;
        this.run = false;
        this.fireworks = [];
    }

    /**
     * Initiates the playback of the firework.
     */
    animate() {
        this.run = true;
    }

    /**
     * Pauses the playback of the firework.
     */
    stop() {
        this.run = false;
    }

    /**
     * Adds a new firework to the scene.
     */
    addFirework() {
        this.fireworks.push(new MyParticle({
            position: this.object.position, 
            app: this.app,
            radius: this.object.geometry.parameters.radius,
            color: // Random shade of blue
                new THREE.Color(
                    Math.random(),
                    Math.random(),
                    1
                )
        }));
    }

    /**
     * Updates the firework and manages its particles.
     * @param {number} delta - The time delta for the update.
     */
    update(delta) {

        // If runnning, add new fireworks every 10% of the time
        if (Math.random() < 0.1 && this.run)
            this.addFirework();

        // Check fireworks state
        for (let i = 0; i < this.fireworks.length; i++) {
            const firework = this.fireworks[i];

            // If the firework has finished its display
            if (firework.finished) {

                // If the firework has finished its display but is still in process,
                // create a new set of particles for the next level
                if (firework.getLevel() === 1) {
                    const position = firework.getPosition();
                    for (let j = 0 ; j < THREE.MathUtils.randInt(50, 100) ; j++) {
                        this.fireworks.push(new MyParticle({
                            position: position, 
                            app: this.app,
                            level: 2, 
                            limit: 20, 
                            height: 10, 
                            speed: 180,
                            color: // Random shade of blue
                                new THREE.Color(
                                    Math.random(),
                                    Math.random(),
                                    1
                                ),
                            radius: this.object.geometry.parameters.radius,
                        }));
                    }
                }

                // Remove the old one
                this.fireworks.splice(i, 1) 
            }

            // If the particle is in process, update it
            else {
                this.fireworks[i].update();
            }
        }
    }
}

export { MyFireworks }