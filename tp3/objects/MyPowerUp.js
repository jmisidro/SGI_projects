import { MyObject } from './MyObject.js';
import { MyAnimation } from '../game/MyAnimation.js';
import { MyShader } from '../shaders/MyShader.js';
import * as THREE from 'three';

class MyPowerUp extends MyObject {
 
    /**
     * Constructs a power-up object.
     * @constructor
     * @param {MyObject} object - The object associated with the power-up.
     */
    constructor(object, type = "voucher", radius = 1, keyframes = []) {
        super(object.name);
        this.object = object;
        this.type = type;
        this.radius = radius;
        this.cooldown = 0;
        this.initialColor = this.object.material.color;
        this.originalMap = this.object.material.map || null;
        if (keyframes && keyframes.length > 0)
            this.animation = new MyAnimation(this.object, keyframes);
        this.time = 0.0;
        this.pulsatingShader = new MyShader(
            'pulsating',                  
            {
                time:       { value: 0.0 },
                amplitude:  { value: 0.2 },   // how much it grows/shrinks
                frequency:  { value: 2.0 },   // how fast it oscillates
                uSampler:   { value: this.originalMap } 
            },
            'shaders/pulsating.vert',   
            'shaders/pulsating.frag'    
        );
    }

    /**
     * Sets the power-up as inactive.
     */
    setInactive(){
        this.setColor(new THREE.Color(0.5,0.5,0.5));
    }

    /**
     * Sets the power-up as active.
     */
    setActive(){
        this.setColor(this.initialColor);
    }

    /**
     * Updates the object animation based on time.
     * @param {Number} delta - the time 
     */
    update(delta) {
        if (this.run) {
            this.time += delta;
            if (this.animation)
                this.animation.update(delta);
        }

        if (this.pulsatingShader.isReady()) {
            this.pulsatingShader.updateUniform('time', this.time);

            if (this.object.material !== this.pulsatingShader.material) {
                this.object.material = this.pulsatingShader.material;
            }
        }

        if (this.cooldown > 0)
            this.cooldown = Math.max(0, this.cooldown - delta);
        else if (this.cooldown == 0)
            this.setActive();
    }

    /**
     * Init object animations
     */
    animate() {
        this.run = true;
    }
 }
 
export { MyPowerUp };
 