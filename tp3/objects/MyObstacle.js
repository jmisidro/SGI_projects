import { MyObject } from './MyObject.js';
import { MyAnimation } from '../game/MyAnimation.js';
import { MyShader } from '../shaders/MyShader.js';
import * as THREE from 'three';

class MyObstacle extends MyObject {

    /**
     * Constructs an obstacle object.
     * @constructor
     * @param {MyObject} object - The object associated with the obstacle.
     * @param {number} radius - The radius of the obstacle.
     * @param {Array} keyframes - The keyframes for the object animation.
     */
    constructor(object, radius = 1, keyframes = []) {
        super(object.name);
        this.object = object;
        this.radius = radius;
        this.cooldown = 0.0;
        this.initialColor = this.object.material.color;
        // Capture the original texture, if present
        this.originalMap = this.object.material.map || null;
        if (keyframes.length > 0)
            this.animation = new MyAnimation(this.object, keyframes);

        this.time = 0.0;
        
        this.pulsatingShader = new MyShader(
            'pulsating',
            {
                time:       { value: 0.0 },
                amplitude:  { value: 0.3 },
                frequency:  { value: 1.5 }, 
                uSampler:   { value: this.originalMap }
            },
            'shaders/pulsating.vert',   
            'shaders/pulsating.frag'   
        );
    }

    /**
     * Sets the obstacle as inactive.
     */
    setInactive(){
        this.setColor(new THREE.Color(0.5,0.5,0.5));
    }
    
    /**
     * Sets the obstacle as active.
     */
    setActive(){
        this.setColor(this.initialColor);
    }

    /**
     * Updates the object animation based on time.
     * @param {Number} delta - The delta time.
     */
    update(delta) {
        if (this.run) {
            this.time += delta;
            if (this.animation) this.animation.update(delta);
        }

        if (this.pulsatingShader.isReady()) {
            this.pulsatingShader.updateUniform('time', this.time);

            if (this.object.material !== this.pulsatingShader.material) {
                this.object.material = this.pulsatingShader.material;
            }
        }

        if(this.cooldown > 0)
            this.cooldown = Math.max(0,this.cooldown-delta);
        else if(this.cooldown == 0)
            this.setActive();
    }

    /**
     * Init object animations
     */
    animate() {
        this.run = true;
    }
}

export { MyObstacle };