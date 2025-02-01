import { MyObject } from './MyObject.js';
import { MyAnimation } from '../game/MyAnimation.js';
import * as THREE from 'three';

class MyBalloon extends MyObject {

    /**
     * Constructs a balloon object.
     * @constructor
     * @param {MyObject} object - The object associated with the balloon.
     * @param {number} radius - The radius of the balloon.
     */
    constructor(object, app, radius = 1, keyframes = []) {
        super(object.name);
        this.object = object;
        this.app = app;
        this.initialRadius = radius;
        this.radius = radius;
        this.move = false;
        this.verticalSpeed = 0;
        this.orientation = Math.PI / 2;
        this.track = null;
        this.route = null;
        this.POVcamera = null;
        this.TPCamera = null;
        this.settings = null;
        this.obstacles = [];
        this.powerUps = [];
        this.opponent = null;
        this.outOfBounds = false;
        this.autoMove = false;
        this.playing = false;
        this.checkPoints = null;
        this.nextCheckpont = 1;
        this.lapCount = 0;
        this.windLayer = null;

        this.penaltyMultiplier = 1;
        this.penaltyCooldown = 0;
        this.powerUpMultiplier = 1;
        this.powerUpCooldown = 0;

        this.minAltitude = 0;
        this.maxAltitude = Infinity;

        const topMesh = this.object.children[0];
        if (topMesh.material && topMesh.material.color) {
            this.baseColor = topMesh.material.color.clone(); 
        } else {
            this.baseColor = new THREE.Color(0xffffff);
        }


        this.keyframes = keyframes;
    }

    /**
     * Sets a predefined route for the autonomous balloon.
     * @param {Object} route - The predefined route for the autonomous balloon.
     */
    setRoute(route) {
        this.route = route;
    }

    /**
     * Sets a predefined track for the balloon.
     * @param {Object} track - The predefined track for the balloon.
     */
    setTrack(track) {
        this.track = track;
    }

    /**
     * Sets the POV camera associated with the balloon.
     * @param {THREE.PerspectiveCamera} camera - The POV camera associated with the balloon.
     */
    setPOVCamera(camera) {
        this.POVcamera = camera;
    }

    /**
     * Sets the TP (Third Person) camera associated with the balloon.
     * @param {THREE.PerspectiveCamera} camera - The TP (Third Person) camera associated with the balloon.
     */
    setTPCamera(camera) {
        this.TPCamera = camera;
    }


    /**
     * Sets obstacles in the balloon's path.
     * @param {Array<MyObstacle>} obstacles - Array of obstacles in the balloon's path.
     */
    setObstacles(obstacles) {
        this.obstacles = obstacles;
    }

    /**
     * Sets power-ups in the balloon's path.
     * @param {Array<MyPowerUp>} powerUps - Array of power-ups in the balloon's path.
     */
    setPowerUps(powerUps) {
        this.powerUps = powerUps;
    }

    /**
     * Sets the opponent balloon.
     * @param {MyBalloon} opponent - The opponent balloon.
     */
    setOpponent(opponent) {
        this.opponent = opponent;
    }

    /**
     * Sets the settings for the balloon.
     * @param {Object} settings - The settings for the balloon.
     */
    setSettings(settings){
        this.settings = settings;
        this.playing = true;
        this.windLayer = settings.windLayers[0];
    }
    
    /**
     * Sets the keyframes for the balloon's animation.
     * @param {*} keyframes - The keyframes for the balloon's animation.
     */
    setKeyframes(keyframes){
        this.keyframes = keyframes;

        if (keyframes.length > 0) {
            this.animation = new MyAnimation(this.object, keyframes);
            this.animation.play();
        }
    }

     /**
     * Sets the checkpoints for the balloon to follow during a race.
     * @param {Array<Object>} checkpoints - The array of checkpoint objects.
     */
     setCheckPoints(checkpoints) {
        this.checkPoints = checkpoints;
    }

    /**
     * Checks if the balloon has passed a checkpoint and updates the lap count accordingly.
     */
    checkProgression() {
        const checkpoint = this.checkPoints[this.nextCheckpont];
        const distanceToCheckpoint = this.object.position.distanceTo(new THREE.Vector3(checkpoint.x, this.object.position.y, checkpoint.z));

        if (distanceToCheckpoint < this.radius) {
            this.nextCheckpont = (this.nextCheckpont + 1) % this.checkPoints.length;
            if (this.nextCheckpont === 1) {
            this.lapCount += 1;
            console.log("Lap: " + this.lapCount);
            }
        }
    }
    
    /**
     * Gets the lap count of the balloon.
     * @returns {number} - The lap count.
     */
    getLapCount() {
        return this.lapCount;
    }

    /**
     * Gets the index of the next checkpoint the balloon is heading to.
     * @returns {number} - The index of the next checkpoint.
     */
    getNextCheckPoint() {
        return this.nextCheckpont;
    }

    /**
     * Verifies if balloon has finished the game
     */
    verifyEndGame(){
        if(this.getLapCount() >= this.settings.laps){
            return true;
        }
        return false;
    }


    /**
     * Initiates the balloon's motion.
     */
    play() {
        if (this.route) this.route.play();
        this.move = true;
    }

    /**
     * Stops the balloon's motion.
     */
    stop() {
        if (this.route) this.route.stop();
        this.move = false;
    }

    /* 
     * Enables the auto move for the balloon (bot)
     */
    enableAutoMove(){
        this.autoMove = true;
    }  

    /**
     * Checks for collisions with obstacles in the balloon's path.
     */
    checkObstaclesCollision() {
        for (const obstacle of this.obstacles) {
            const distance = this.object.position.distanceTo(obstacle.object.position);
            if (distance <= this.radius + obstacle.radius && obstacle.cooldown <= 0) {
                if (this.settings.vouchers > 0) {
                    this.removeVoucher();
                }
                else {
                    this.addPenalties();
                }
                obstacle.cooldown = 5;
                obstacle.setInactive();
                return;
            }
        }
    }

    /**
     * Checks for collisions with power-ups in the balloon's path.
     */
    checkPowerUpsCollision() {
        for (const powerUp of this.powerUps) {
            const distance = this.object.position.distanceTo(powerUp.object.position);
            if (distance <= this.radius + powerUp.radius && powerUp.cooldown <= 0) {
                if (powerUp.type === 'voucher') {
                    this.addVoucher();
                }
                else if (powerUp.type === 'speed') {
                    this.addPowerUp();
                }
                powerUp.cooldown = 5;
                powerUp.setInactive();
                return;
            }
        }
    }

    /**
     * Gets the number of vouchers the balloon has.
     * @returns {number} - The number of vouchers the balloon has.
     */
    getVouchers(){
        return this.settings.vouchers;
    }

    /**
     * Applies penalties to the balloon - removes a voucher.
     */
    removeVoucher() {
        this.settings.vouchers -= 1;
    }

    /**
     * Applies penalties to the balloon - decreases speed.
     */
    addPenalties() {
        this.penaltyMultiplier = this.settings.penaltyMultiplier;
        this.penaltyCooldown = this.settings.penaltyCooldown;
    }

    /**
     * Applies power-ups to the balloon - adds a voucher.
     */
    addVoucher() {
        this.settings.vouchers += 1
    }

    /**
     * Applies power-ups to the balloon - increases speed.
     */
    addPowerUp() {
        this.powerUpMultiplier = this.settings.powerUpMultiplier;
        this.powerUpCooldown = this.settings.powerUpCooldown;
    }

    /**
     * Removes penalties and power-ups if they are no longer active.
     */
    cleanPenaltyAndPowerUp() {
        if (this.powerUpCooldown <= 0) {
            this.powerUpCooldown = 0;
            this.powerUpMultiplier = 1;
        }
        if (this.penaltyCooldown <= 0) {
            this.penaltyCooldown = 0;
            this.penaltyMultiplier = 1;
        }
    }

    /**
     * Updates the remaining time for penalties and power-ups.
     */
    updateMultipliersCooldown() {
        this.powerUpCooldown = Math.max(0, this.powerUpCooldown - 1);
        this.penaltyCooldown = Math.max(0, this.penaltyCooldown - 1);
    }

    /**
     * Updates the multipliers for penalties and power-ups.
     */
    updateMultipliers() {
        this.updateMultipliersCooldown();
        this.cleanPenaltyAndPowerUp();
    }

    /**
     * Checks for collisions with obstacles and power-ups.
     * TODO: Implement collisions for the opponent's balloon.
     */
    verifyColisions() {
        this.checkObstaclesCollision();
        this.checkPowerUpsCollision();
    }
    
    /**
     * Handles the balloon going out of bounds.
     * If the balloon goes out of bounds, it is stopped for a few seconds and then restarted.
     * The balloon is restarted from the track's center axis.
     */ 
    handleOutOfBounds() {
        this.outOfBounds = !this.track.isObjectWithinBounds(this.object);

        if (this.outOfBounds) {
            if (this.settings.vouchers > 0) {
                // Remove voucher if available
                this.removeVoucher();
            }
            else {
                // Apply penalty
                this.verticalSpeed = 0;
                // Restart from previous checkpoint
                this.object.position.set(
                    this.checkPoints[this.nextCheckpont - 1].x, 
                    this.object.position.y, 
                    this.checkPoints[this.nextCheckpont - 1].z
                );

                // Remain stopped for N seconds
                this.stop();
                setTimeout(() => {
                    this.play();
                }, this.settings.outOfBoundsPenalty * 1000);
            }
        }
    }

    /**
     * Turns the balloon by a specified value.
     * @param {Number} value - The value by which to turn the balloon.
     */
    turn(value) {
        if (this.move) {
            this.orientation += value;
            this.object.rotation.y = this.orientation;
        }
    }

    /**
     * Calculate final max velocity depending on powerUps and penalties
     */
    getMaxVelocity(){
        const outOfBoundsSpeed = this.outOfBounds? 0.7 : 1;
        const finalPenaltySpeed = Math.min(outOfBoundsSpeed, this.penaltyMultiplier);
        return this.settings.maxVelocity * this.powerUpMultiplier * finalPenaltySpeed;
    }


    /*
     * Moves the balloon upward.
     */   
    moveUp(value, delta){
        if (this.move) {
            const acceleration = value * delta;
            const newSpeed = this.verticalSpeed + acceleration;
            this.verticalSpeed = Math.max(-this.getMaxVelocity(), Math.min(newSpeed, this.getMaxVelocity()));
        }
    }

    /*
     * Moves the balloon downward.
     */   
    moveDown(value, delta){
        if (this.move) {
            const acceleration = value * delta;
            const newSpeed = this.verticalSpeed - acceleration;
            if(this.verticalSpeed > 0) this.verticalSpeed = Math.max(0, newSpeed);
            else if (this.verticalSpeed < 0) this.verticalSpeed = Math.min(0, newSpeed);
            else this.verticalSpeed = newSpeed; //just in case
        }
    }


    /**
     * Gets the wind layer.
     */
    getWindLayer(){
        return this.windLayer;
    }

    /**
     * Applies the wind effect based on the current layer.
     * @param {number} delta - The time delta.
     */
    applyWindEffect(delta) {
        // Calculate the layer index based on the balloon's height
        const layerIndex = Math.floor((this.object.position.y - this.settings.minHeight) / (this.settings.maxHeight - this.settings.minHeight) * 5);
        
        // Ensure the layer index is within the valid range
        const clampedLayerIndex = Math.max(0, Math.min(layerIndex, this.settings.windLayers.length - 1));
        
        // Get the wind layer based on the clamped layer index
        this.windLayer = this.settings.windLayers[clampedLayerIndex];
        
        // Apply the wind effect
        const windEffect = this.windLayer.direction.clone().multiplyScalar(this.windLayer.speed * delta);
        this.object.position.add(windEffect);
    }
    

    /**
     * Calculates the point the balloon is looking at based on its orientation.
     * @returns {THREE.Vector3} - The point the balloon is looking at.
     */
    calculateLookAt() {
        return new THREE.Vector3(
            this.object.position.x + 2 * Math.sin(this.orientation),
            this.object.position.y,
            this.object.position.z + 2 * Math.cos(this.orientation)
        );
    }

    /**
     * Updates the balloon's cameras positions and targetsd.
     */
    updateCamera() {
        // Update the POV camera
        const offsetX = 0.7 * Math.sin(this.orientation);
        const offsetZ = 0.7 * Math.cos(this.orientation);
        this.POVcamera.position.set(this.object.position.x -offsetX, this.object.position.y + 1.3, this.object.position.z - offsetZ);
        this.POVcamera.userData.target = this.calculateLookAt();
        // Update the TP camera
        this.TPCamera.position.set(this.object.position.x - 50, this.object.position.y + 50, this.object.position.z);
        this.TPCamera.lookAt(this.object.position);
        this.TPCamera.userData.target = this.calculateLookAt();

        // Update the camera target        
        this.app.updateCameraTarget();
    }

    /**
     * Pauses the balloon's animation.
     */
    pause() {
        this.playing = false;
    }

    /**
     * Resumes the balloon's animation.
     */
    resume() {
        this.playing = true;
    }

    endGame(position = new THREE.Vector3(0, 0, 0)) {
        this.playing = false;
        this.orientation = Math.PI / 2; // Reset orientation
        this.verticalSpeed = 0; // Reset vertical speed
        this.lapCount = 0; // Reset lap count
        this.object.position.set(position.x, position.y, position.z); // Reset position
        this.object.rotation.set(0, 0, 0); // Reset rotation
    }

    setShaderMaterial(shaderMaterial) {
        const topMesh = this.object.children[0].children.find(child => child.name.endsWith('_top'));
        if (!topMesh) {
            console.error('Top mesh not found');
            return;
        }
    
        if (topMesh.material && topMesh.material.color) {
            this.baseColor = topMesh.material.color.clone();
        }
    
        if (shaderMaterial) {
            const shaderInstance = shaderMaterial.clone();
            // pass baseColor 
            if (shaderInstance.uniforms.baseColor) {
                shaderInstance.uniforms.baseColor.value = this.baseColor;
            }
            topMesh.material = shaderInstance;
        }
    }

    resetMaterial() {
        const topMesh = this.object.children[0].children.find(child => child.name.endsWith('_top'));
        if (!topMesh) {
            console.error('Top mesh not found');
            return;
        }
    
        if (topMesh.material && topMesh.material.color) {
            this.baseColor = topMesh.material.color.clone();
        }
        topMesh.material = new THREE.MeshPhongMaterial({ color: this.baseColor });
    }

    setAltitudeRange(minAltitude, maxAltitude) {
        this.minAltitude = minAltitude;
        this.maxAltitude = maxAltitude;
    }

    updateHeatFactor() {
        const topMesh = this.object.children[0].children.find(child => child.name.endsWith('_top'));
        if (!this.settings || !topMesh || !topMesh.material || !topMesh.material.uniforms) return;
    
        // Use dynamic altitude range
        const altitude = this.object.position.y;
        const range = this.maxAltitude - this.minAltitude;
        let normalizedAltitude = (altitude - this.minAltitude) / range;
        normalizedAltitude = THREE.MathUtils.clamp(normalizedAltitude, 0, 1);
    
        if (topMesh.material.uniforms.heatFactor) {
            topMesh.material.uniforms.heatFactor.value = normalizedAltitude;
        }
    }

    /**
     * Updates the shadow of the balloon.
     * The shadow is a simple circle that follows the balloon's position 
     * and is projected onto the ground plane.
     * If the balloon is the closest to the ground, the shadow is darker and smaller.
     */
    updateShadow() {
        // Create the shadow if it does not exist
        if (!this.shadow) {
            const shadowGeometry = new THREE.CircleGeometry(this.radius / 3 + 1, 32);
            const shadowMaterial = new THREE.MeshBasicMaterial({
                color: 0x000000,
                transparent: true,
                opacity: 0.5,
            });

            this.shadow = new THREE.Mesh(shadowGeometry, shadowMaterial);
            this.shadow.rotation.x = -Math.PI / 2;
            this.shadow.position.y = this.settings.minHeight + 0.1;
            this.app.scene.add(this.shadow);
        }

        const groundLevel = this.settings.minHeight;
        const distanceToGround = this.object.position.y - groundLevel;
        const shadowScale = (this.radius / 3 + 1)  - distanceToGround / 100;
        const shadowIntensity = THREE.MathUtils.clamp(1 - distanceToGround / 100, 0.5, 1);

        // Update the shadow's scale and opacity
        this.shadow.scale.set(shadowScale, shadowScale, shadowScale);
        this.shadow.material.opacity = shadowIntensity;


        // Update the shadow's position
        this.shadow.position.x = this.object.position.x;
        this.shadow.position.z = this.object.position.z;
    }

    /**
     * Updates the balloon's animation based on time.
     * @param {number} delta - The time delta.
     */
    update(delta) {
        // If the balloon is not playing or moving,
        //  nothing else needs to be done
        if(!this.playing || !this.move) return;
        
        this.updateHeatFactor();

        if(this.autoMove) {

            // Update the balloon's animation (bot movement)
            if (this.animation) {
                this.orientation = this.object.rotation.y;
                this.animation.update(delta);
            }
        }
        else {
            // Update the balloon's height
            if (this.settings.pressedKeys['W']) {
                this.moveUp(this.settings.heightIncrement, delta);
            } else if (this.settings.pressedKeys['S']) {
                this.moveDown(this.settings.heightIncrement, delta);
            }

            // Update the balloon's rotation
            const angle = this.settings.angleIncrement * delta;
            if(Math.round(this.verticalSpeed) !== 0) {
                if (this.settings.pressedKeys['A']) this.turn(angle); // Turn left
                else if (this.settings.pressedKeys['D']) this.turn(-angle); // Turn right
            }

            // Calculate how much the balloon should move and calculate its new position
            const moveY = this.verticalSpeed * delta;
            if (this.object.position.y + moveY > this.settings.minHeight && this.object.position.y + moveY < this.settings.maxHeight) {
                this.object.position.y += moveY;
            }
            else if (this.object.position.y + moveY <= this.settings.minHeight) {
                this.object.position.y = this.settings.minHeight + 2;
                this.verticalSpeed = 0;
            }
            else if (this.object.position.y + moveY >= this.settings.maxHeight) {
                this.object.position.y = this.settings.maxHeight - 2;
                this.verticalSpeed = 0;
            }
        }

        // Update the balloon's radius
        this.radius = this.initialRadius * this.object.scale.x;
        
        // Apply wind effect
        this.applyWindEffect(delta);

        // Verify Collisions
        this.verifyColisions();

        // Verify Track Bounds
        if (this.track) {
            //this.handleOutOfBounds();
        }

        // Update the balloon's camera
        if (this.POVcamera && this.TPCamera)
            this.updateCamera();

        // Verify Checkpoints
        if (this.checkPoints)
            this.checkProgression();

        this.updateShadow();
        
    }

}

export { MyBalloon };
