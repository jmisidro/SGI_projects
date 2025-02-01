import * as THREE from 'three';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

/**
 * Builds NURBS surfaces from given control points and degrees.
 */
export default class MyNurbsBuilder {
    constructor(position) {
        this.position = position;
    }

    build(controlPoints, degree1, degree2, samples1, samples2, material) {
        // Validate material
        if (!material) {
            console.warn('No material provided. Using default material.');
            material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        }

        // Generate valid knot vectors
        const knots1 = this.generateKnotVector(degree1, controlPoints.length);
        const knots2 = this.generateKnotVector(degree2, controlPoints[0].length);

        // Convert control points to 2D Vector4 array
        const stackedPoints = controlPoints.map(row =>
            row.map(point => new THREE.Vector4(point[0], point[1], point[2], point[3] || 1))
        );

        // Create the NURBS surface
        const nurbsSurface = new NURBSSurface(degree1, degree2, knots1, knots2, stackedPoints);

        // Create geometry using the NURBS surface
        const geometry = new ParametricGeometry((u, v, target) => {
            nurbsSurface.getPoint(u, v, target);
        }, samples1, samples2);

        // Create and return the mesh
        return new THREE.Mesh(geometry, material);
    }

    /**
     * Generates a knot vector for a given degree and number of control points.
     * @param {number} degree - Degree of the curve.
     * @param {number} controlPointsLength - Number of control points.
     * @returns {Array} Knot vector.
     */
    generateKnotVector(degree, controlPointsLength) {
        const knotVector = [];
        const segments = controlPointsLength - degree - 1;

        // Add leading zeros
        for (let i = 0; i <= degree; i++) {
            knotVector.push(0);
        }

        // Add middle segment
        for (let i = 1; i <= segments; i++) {
            knotVector.push(i / segments);
        }

        // Add trailing ones
        for (let i = 0; i <= degree; i++) {
            knotVector.push(1);
        }

        return knotVector;
    }
}
