import * as THREE from 'three';

class MyAnimation {
    /**
     * Creates an instance of Animation.
     * @constructor
     * @param {THREE.Object3D} object - The Three.js object to animate.
     * @param {Array} points - The points for the animation.
     */
    constructor(object, points = []) {
        this.object = object;
        this.position = object.position;
        this.points = points;
        this.run = false;

        if (this.points.length) {
            this.initAnimation();
        }
    }

    /**
     * Initializes the animation based on provided animation points.
     */
    initAnimation() {
        const times = this.points.map(point => parseFloat(point.time));
        const points = this.points.flatMap(point => [parseFloat(point.x), parseFloat(point.y), parseFloat(point.z)]);
        const duration = times[times.length - 1]; // The last time is the duration of the animation

        this.keyframes = new THREE.VectorKeyframeTrack('.position', times, points, THREE.InterpolateSmooth);
        this.clip = new THREE.AnimationClip('positionAnimation', duration, [this.keyframes]);
        this.mixer = new THREE.AnimationMixer(this.object);
        this.animation = this.mixer.clipAction(this.clip);
    }

    /**
     * Calculates the angle in relation to the origin from two positions
     * @param {THREE.Vector3} position1 - The first position
     * @param {THREE.Vector3} position2 - The second position
     * @returns {number} The angle in radians
     */
    angle(position1, position2) {
        const vector = position2.sub(position1);
        return Math.atan2(vector.x, vector.z);
    }

    /**
     * Updates the animation based on the elapsed time.
     * @param {number} delta - The time elapsed since the last frame.
     */
    update(delta) {
        if (this.mixer && this.run) {
            this.mixer.update(delta);
        }
    }

    /**
     * Stops the animation.
     */
    stop() {
        if (this.mixer) {
            this.animation.stop();
            this.run = false;
        }
    }

    /**
     * Plays the animation.
     */
    play() {
        if (this.mixer) {
            this.animation.play();
            this.run = true;
        }
    }
}

export { MyAnimation };
