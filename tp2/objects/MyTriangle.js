import * as THREE from 'three';

class MyTriangle extends THREE.BufferGeometry {

    /**
        * Initializes a triangle mesh.
        * @param {Array} xyz1 - The coordinates of the first vertex.
        * @param {Array} xyz2 - The coordinates of the second vertex.
        * @param {Array} xyz3 - The coordinates of the third vertex.
     */
    constructor(xyz1, xyz2, xyz3) {
        super();
        
        this.point1 = new THREE.Vector3(...xyz1);
        this.point2 = new THREE.Vector3(...xyz2);
        this.point3 = new THREE.Vector3(...xyz3);
        this.initBuffers();
    }

    /**
    * Initializes buffers for a triangle mesh, including position, normals, and texture coordinates.
    */
    initBuffers() {
        // Calculate normals
        const vectorA = new THREE.Vector3().subVectors(this.point2, this.point1);
        const vectorB = new THREE.Vector3().subVectors(this.point3, this.point1);
        const normal = new THREE.Vector3().crossVectors(vectorA, vectorB).normalize();

        // Calculate texture coordinates
        const a = this.point1.distanceTo(this.point2);
        const b = this.point2.distanceTo(this.point3);
        const c = this.point1.distanceTo(this.point3);
        const cos_ac = (a * a - b * b + c * c) / (2 * a * c);
        const sin_ac = Math.sqrt(1 - cos_ac * cos_ac);

        // Define vertices, indices, normals, and uvs
        const vertices = new Float32Array([
            ...this.point1.toArray(),
            ...this.point2.toArray(),
            ...this.point3.toArray(),
        ]);

        const indices = [0, 1, 2];

        const normals = new Float32Array([
            ...normal.toArray(),
            ...normal.toArray(),
            ...normal.toArray(),
        ]);

        const uvs = new Float32Array([
            0, 0,
            1, 0,
            cos_ac, sin_ac,
        ]);

        // Set geometry attributes
        this.setIndex(indices);
        this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        this.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    }
}

export { MyTriangle };