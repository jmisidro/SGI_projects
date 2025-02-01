import * as THREE from 'three';

class MyPoleAndFlags {
    /**
     * Constructs a pole object.
     * @param {Object} position - Position of the pole {x, y, z}.
     * @param {number} height - Height of the pole.
     * @param {number} radius - Radius (thickness) of the pole.
     * @param {THREE.Material} material - Material of the pole.
     */
    constructor(position = { x: 0, y: 0, z: 0 }, height = 15, radius = 0.5, material ){
        this.position = position;
        this.height = height;
        this.radius = radius;
        this.material = material;
    }

    /**
     * Creates the pole object.
     * @returns {THREE.Mesh} The pole as a 3D object.
     */
    createPole() {
        const geometry = new THREE.CylinderGeometry(this.radius, this.radius, this.height, 16);
        const pole = new THREE.Mesh(geometry, this.material);

        // Position the pole
        pole.position.set(this.position.x, this.position.y + this.height / 2, this.position.z);

        return pole;
    }

    createString(startPosition, endPosition, material) {
        // Create a curve for the string
        const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(startPosition.x, startPosition.y, startPosition.z),
            new THREE.Vector3((startPosition.x + endPosition.x) / 2, startPosition.y + 2 * (-2), (startPosition.z + endPosition.z) / 2), // Midpoint slightly under
            new THREE.Vector3(endPosition.x, endPosition.y, endPosition.z),
        ]);

        // Generate points along the curve
        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        const line = new THREE.Line(geometry, material);

        return line;
    }

    createFlag(basePoint1, basePoint2, tipPoint, material) {
        const geometry = new THREE.BufferGeometry().setFromPoints([basePoint1, basePoint2, tipPoint]);
        geometry.computeVertexNormals();
    
        // Create the flag mesh
        return new THREE.Mesh(geometry, material);
    }
    
    
    addFlagsToString(stringPoints, fenceGroup, flagColor) {
        const flagHeight = 7;
        const spacing = 3;   
    
        for (let i = 0; i < stringPoints.length - 1; i += spacing) {
            const point = stringPoints[i];
            const nextPoint = stringPoints[i + 1];
    
            // base corners on the string
            const v1 = new THREE.Vector3(point.x, point.y, point.z);
            const v2 = new THREE.Vector3(nextPoint.x, nextPoint.y, nextPoint.z);
    
            // tip is below the midpoint by flagHeight
            const midX = (v1.x + v2.x) / 2;
            const midY = v1.y - flagHeight;
            const midZ = (v1.z + v2.z) / 2;
            const v3 = new THREE.Vector3(midX, midY, midZ);
    
            // Create the flag material
            const mat = new THREE.MeshStandardMaterial({ color: flagColor });
            mat.side = THREE.DoubleSide;
    
            // Build and add the flag
            const flag = this.createFlag(v1, v2, v3, mat);
            fenceGroup.add(flag);
        }
    }
    
}

export { MyPoleAndFlags };
