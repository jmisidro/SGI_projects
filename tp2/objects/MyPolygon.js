import * as THREE from 'three';

class MyPolygon extends THREE.BufferGeometry {
    /**
     * @param {number} radius - Radius of the polygon.
     * @param {number} stacks - Number of stacks in the polygon.
     * @param {number} slices - Number of slices in the polygon.
     * @param {THREE.Color} color_c - Color for the polygon.
     * @param {THREE.Color} color_p - Other color parameter (not used in the code).
     */
    constructor(radius, stacks, slices, color_c, color_p) {
        super();

        this.radius = radius;
        this.stacks = stacks;
        this.slices = slices;
        this.color_c = color_c;
        this.color_p = color_p;

        this.vertices = [];
        this.indices = [];
        this.normals = [];
        this.colors = [];

        this.initBuffers();
    }

    /**
     * Rounds a given number to a specified number of decimal places.
     *
     * @param {number} number - The number to be rounded.
     * @param {number} decimal - The number of decimal places to round to.
     * @returns {number} The rounded number.
     */
    round(number, decimal) {
        const approximation = 10 ** decimal;
        return Math.round(number * approximation) / approximation;
    }

    /**
     * Gets the current number of vertices in the geometry.
     *
     * @returns {number} The rounded count of vertices.
     */
    currentVertices() {
        return Math.round(this.vertices.length / 3);
    }

    /**
     * Initializes the buffers for the regular geometry, including vertices, indices, normals, and colors.
     * This function constructs the geometry based on the specified number of stacks and slices,
     * creating a shape with interpolated colors.
     */
    initBuffers() {
        this.createFirstLine();
        this.createSlices();
        this.setGeometryAttributes();
    }

    createFirstLine() {
        for (let stack = 0; stack <= this.stacks; stack++) {
            const x = this.round(stack * (this.radius / this.stacks), 2);
            const color = new THREE.Color().lerpColors(this.color_c, this.color_p, stack / this.stacks);
            this.vertices.push(x, 0, 0);
            this.normals.push(0, 0, 1);
            this.colors.push(color.r, color.g, color.b);
        }
    }

    createSlices() {
        for (let slice = 1; slice <= this.slices; slice++) {
            const lastSlice = slice === this.slices;
            for (let stack = 1; stack <= this.stacks; stack++) {
                if (!lastSlice) {
                    this.addVertex(slice, stack);
                }
                this.addIndices(stack, lastSlice);
            }
        }
    }

    addVertex(slice, stack) {
        const theta = (2 * Math.PI * slice) / this.slices;
        const r = (stack * this.radius) / this.stacks;
        const x = this.round(r * Math.cos(theta), 2);
        const y = this.round(r * Math.sin(theta), 2);
        const color = new THREE.Color().lerpColors(this.color_c, this.color_p, stack / this.stacks);

        this.vertices.push(x, y, 0);
        this.normals.push(0, 0, 1);
        this.colors.push(color.r, color.g, color.b);
    }

    addIndices(stack, lastSlice) {
        const a = lastSlice ? stack : Math.round(this.vertices.length / 3) - 1;
        let b, c, d;

        if (stack === 1) {
            b = 0;
            c = lastSlice ? Math.round(this.vertices.length / 3) - 1 : a - this.stacks;
            this.indices.push(a, b, c);
        } else {
            b = a - 1;
            c = lastSlice ? Math.round(this.vertices.length / 3) - this.stacks + a - 2 : a - this.stacks - 1;
            d = c + 1;
            this.indices.push(a, b, c, a, c, d);
        }
    }

    setGeometryAttributes() {
        this.setIndex(new THREE.BufferAttribute(new Uint32Array(this.indices), 1));
        this.setAttribute('position', new THREE.Float32BufferAttribute(this.vertices, 3));
        this.setAttribute('color', new THREE.Float32BufferAttribute(this.colors, 3));
        this.setAttribute('normal', new THREE.Float32BufferAttribute(this.normals, 3));
    }
}

export { MyPolygon };