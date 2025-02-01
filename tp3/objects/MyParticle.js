import * as THREE from 'three';
import { MyObject } from './MyObject.js';

class MyParticle extends MyObject {

    /**
     * Constructs a particle object.
     * @constructor
     * @param {Vector3} position - The initial position of the particle.
     * @param {number} level - The level of the particle.
     * @param {number} limit - The limit for randomizing particle position.
     * @param {number} height - The height range for randomizing particle position.
     * @param {number} speed - The speed at which the particle moves.
     * @param {THREE.Color} color - The color of the particle. If not provided, a random color will be generated.
     * @param {String} direction - The axis/direction of the particle
     * @param {Number} radius - The radius of the sphere/particle
     * @param {Number} angle - The particle angle, in radians
     */
    constructor({ position, app, level = 1, limit = 5, height = 50, speed = 150, color = null, direction = 'y', radius = 0.1, angle = 0 }) {
        super('particle_object');
        this.initialPosition = position;
        this.app = app;
        this.level = level;
        this.limit = limit;
        this.height = THREE.MathUtils.randFloat(height * 0.8, height * 1.6);
        this.speed = speed;
        this.color = color ?? new THREE.Color(Math.random() * 0xffffff);
        this.direction = direction.toLowerCase();
        this.radius = radius;
        this.angle = angle;
        
        this.destination = [];
        this.particle = null;
        this.finished = false;

        this.build();
    }

    /**
     * Builds the particle.
     */
    build() {
        this.material = new THREE.MeshBasicMaterial({
            color: this.color,
            opacity: 1,
            transparent: true,
        });

        let x, y, z;
        if (this.direction === 'x') {
            x = this.height + this.initialPosition.x;
            y = THREE.MathUtils.randFloat(- this.limit, this.limit) * Math.sin(this.angle) + this.initialPosition.y;
            z = THREE.MathUtils.randFloat(- this.limit, this.limit) * Math.cos(this.angle) + this.initialPosition.z;
        } 
        else if (this.direction === 'y') {
            x = THREE.MathUtils.randFloat(- this.limit, this.limit) + this.initialPosition.x;
            y = this.level == 2
                ? THREE.MathUtils.randFloat(- this.height, this.height) + this.initialPosition.y
                : this.height + this.initialPosition.y
            z = THREE.MathUtils.randFloat(- this.limit, this.limit) + this.initialPosition.z;
        } 
        else if (this.direction === 'z') {
            x = this.initialPosition.x - this.height * Math.sin(this.angle) + THREE.MathUtils.randFloat(-this.limit, this.limit);
            y = this.initialPosition.y + 1 + THREE.MathUtils.randFloat(-this.limit, this.limit);
            z = this.initialPosition.z + this.height * Math.cos(this.angle) + THREE.MathUtils.randFloat(-this.limit, this.limit);
        }
        else {
            console.error('Invalid direction for particle');
        }
        this.destination.push(x, y, z);

        const sphereGeometry = new THREE.SphereGeometry(this.radius, 8, 8);
        this.particle = new THREE.Mesh(sphereGeometry, this.material);
        this.particle.position.set(this.initialPosition.x, this.initialPosition.y, this.initialPosition.z);
        this.app.scene.add(this.particle);
    }

    /**
     * Updates the particle's position and handles its lifecycle.
     */
    update() {
        // Move the particle towards the destination
        this.particle.position.x += (this.destination[0] - this.particle.position.x) / this.speed;
        this.particle.position.y += (this.destination[1] - this.particle.position.y) / this.speed;
        this.particle.position.z -= (this.destination[2] - this.particle.position.z) / this.speed;

        if (this.material.opacity > 0) {
            this.material.opacity -= 0.015;
            this.material.needsUpdate = true;
        } else {
            this.reset();
            this.finished = true;
        }
    }

    /**
     * Resets the particle.
     */
    reset() {
        if (this.particle) {
            this.app.scene.remove(this.particle);
            this.particle.geometry.dispose();
        }
        this.destination = [];
    }

    /**
     * Gets the position of the particle.
     * @returns {THREE.Vector3} - The particle position.
     */
    getPosition() {
        return this.particle.position;
    }

    /**
     * Gets the level of the particle.
     * @returns {number} - The particle level.
     */
    getLevel() {
        return this.level;
    }
}

export { MyParticle };