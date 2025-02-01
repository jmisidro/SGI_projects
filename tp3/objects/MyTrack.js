import * as THREE from 'three';

class MyTrack {
    constructor(points, width, segments, closed, material, scaleY = 0.2, positionY = 0) {
        this.points = points;
        this.width = width; // Base radius of the tube
        this.segments = segments; // Number of segments along the tube
        this.closed = closed; // Whether the track is closed
        this.material = material; // Material for the track
        this.scaleY = scaleY; // Vertical scaling factor for flattening
        this.positionY = positionY; // Y-offset for positioning
    }

    getPoints() {
        return this.points;
    }

    build() {
        // Create a Catmull-Rom curve for the track
        const curve = new THREE.CatmullRomCurve3(this.points, this.closed);

        // Create the tube geometry for the track
        const geometry = new THREE.TubeGeometry(curve, this.segments, this.width, 16, this.closed);

        // Apply scaling to squash the tube vertically
        geometry.scale(1, this.scaleY, 1);

        // Create the mesh for the track
        const trackMesh = new THREE.Mesh(geometry, this.material);

        trackMesh.position.y = this.positionY;

        return trackMesh;
    }

     /**
     * Checks whether the given object is within the bounds of the track.
     * @param {Object} object - The object to check.
     * @returns {boolean} - True if the object is within the track bounds, false otherwise.
     */
    isObjectWithinBounds(object) {

        // TODO: CHECK IF THE OBJECT IS WITHIN THE TRACK BOUNDS
        // Disregard the object's Y-position

        // Get the position of the object
        const position = object.position;

        // Find the closest point on the track to the object
        const curve = new THREE.CatmullRomCurve3(this.points, this.closed);
        const points = curve.getPoints(100);
        let closestPoint = null;
        let minDist = Infinity;

        for (let i = 0; i <= 100; i++) {
            const point = points[i];
            // Calculate distance in the XZ-plane only
            const dist = Math.sqrt(Math.pow(point.x - position.x, 2) + Math.pow(point.z - position.z, 2));
            if (dist < minDist) {
                minDist = dist;
                closestPoint = point;
            }
        }

        // Calculate the distance from the object to the closest point on the track
        const dist = minDist;

        // It is within the track if the distance does not exceed the width
        return dist <= this.width;
    }
}

export { MyTrack };
