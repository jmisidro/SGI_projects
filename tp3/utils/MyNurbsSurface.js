import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';

class MyNurbsSurface {
    constructor() {
        this.nurbsBuilder = new MyNurbsBuilder();
        this.meshes = [];
    }

    parseNurbs(parameters, material) {
        // Validate JSON structure
        if (
            !parameters.controlpoints ||
            !Array.isArray(parameters.controlpoints) ||
            parameters.degree_u === undefined ||
            parameters.degree_v === undefined ||
            parameters.parts_u === undefined ||
            parameters.parts_v === undefined
        ) {
            console.error('Invalid NURBS parameters provided:', parameters);
            return null;
        }
    
        const degreeU = parameters.degree_u;
        const degreeV = parameters.degree_v;
        const partsU = parameters.parts_u;
        const partsV = parameters.parts_v;
    
        // Organize control points into a 2D array
        const controlPoints = [];
        let pointIndex = 0;
    
        for (let i = 0; i <= degreeU; i++) {
            const row = [];
            for (let j = 0; j <= degreeV; j++) {
                const controlPointData = parameters.controlpoints[pointIndex];
                if (!controlPointData || controlPointData.x === undefined || controlPointData.y === undefined || controlPointData.z === undefined) {
                    console.error(`Missing or invalid control point at index ${pointIndex}`);
                    return null;
                }
                row.push([
                    controlPointData.x,
                    controlPointData.y,
                    controlPointData.z,
                    1 // Default weight for homogeneous coordinates
                ]);
                pointIndex++;
            }
            controlPoints.push(row);
        }
    
        // Create NURBS surface
        return this.createNurbsSurfaces(0, 0, 0, controlPoints, degreeU, degreeV, partsU, partsV, material);
    }
    

    /**
     * Create a NURBS surface.
     * @param {number} x - X-coordinate of the surface's position.
     * @param {number} y - Y-coordinate of the surface's position.
     * @param {number} z - Z-coordinate of the surface's position.
     * @param {Array} controlPoints - Control points for the NURBS surface.
     * @param {number} orderU - The order in the U direction.
     * @param {number} orderV - The order in the V direction.
     * @param {number} samplesU - Number of samples in the U direction (default is 10).
     * @param {number} samplesV - Number of samples in the V direction (default is 10).
     * @returns {THREE.Mesh} The NURBS surface mesh.
     */
    createNurbsSurfaces(x, y, z, controlPoints, orderU, orderV, samplesU = 10, samplesV = 10, material) {
        const surfaceData = this.nurbsBuilder.build(
            controlPoints,
            orderU,
            orderV,
            samplesU,
            samplesV,
            material
        );
        const mesh = new THREE.Mesh(surfaceData, material);
        mesh.rotation.set(0, 0, 0);
        mesh.scale.set(1, 1, 1);
        mesh.position.set(x, y, z);
        this.meshes.push(mesh);

        return mesh;
    }
}

export { MyNurbsSurface };