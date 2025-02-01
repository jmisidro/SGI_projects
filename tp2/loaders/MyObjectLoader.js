import * as THREE from 'three';
import { MyNurbsSurface } from '../utils/MyNurbsSurface.js';
import { MyLightLoader } from './MyLightLoader.js';
import { MyMaterialsLoader } from './MyMaterialsLoader.js';
import { MyObject } from '../objects/MyObject.js';
import { MyTriangle } from '../objects/MyTriangle.js';
import { MyPolygon } from '../objects/MyPolygon.js';

class MyObjectLoader {
    constructor() {
        this.materialMap = {};
        
        this.nurbsSurface = new MyNurbsSurface();
        this.materialLoader = new MyMaterialsLoader();
        this.lightLoader = new MyLightLoader();
    }

    load(objectData, rootId, materialMap) {
        this.materialMap = materialMap;
        const rootNode = objectData.find(({ id }) => id === rootId);
        return this.parseNode(rootNode);
    }

    createPrimitive(primitive, materialId, castShadow = false, receiveShadow = false) {
        let objPrimitive;
        let parameters = primitive.representations[0];
        let material;
        let materialInfo;
    
        if (materialId === "defaultMaterial") {
            material = new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
            });
        } 
        else materialInfo = this.materialMap.get(materialId);

        switch (primitive.subtype) {
            case 'rectangle':
                objPrimitive = this.createRectangle(parameters, material, materialInfo);
                break;
            case 'triangle':
                objPrimitive = this.createTriangle(parameters, material, materialInfo);
                break;
            case 'cylinder':
                objPrimitive = this.createCylinder(parameters, materialInfo);
                break;
            case 'box':
                objPrimitive = this.createBox(parameters, materialInfo);
                break;
            case 'nurbs':
                objPrimitive = this.createNurbs(parameters, material, materialInfo);
                break;
            case 'sphere':
                objPrimitive = this.createSphere(parameters, material, materialInfo);
                break;
            case 'polygon':
                objPrimitive = this.createPolygon(parameters);
                break;
            default:
                console.error(`Unknown primitive subtype: ${primitive.subtype}`);
                return null;
        }

        objPrimitive.castShadow = castShadow;
        objPrimitive.receiveShadow = receiveShadow;
        objPrimitive.name = `${primitive.subtype}_obj`;
        return objPrimitive;
    }

    parseNode(node) {
        const stack = [];
        const allObjects = {};

        const rootObject = new MyObject(node.id);
        stack.push(this.createStackItem(node, rootObject));

        while (stack.length > 0) {
            let { node: treeNode, object, currentMaterials, castShadow, receiveShadow, dist } = stack.pop();
            const returnedObject = this.createReturnedObject(treeNode);
            const newMaterials = this.getMaterials(treeNode, currentMaterials);

            if (treeNode.castShadows) 
                castShadow = true;
            if (treeNode.receiveShadows) 
                receiveShadow = true;

            for (const key in treeNode.children) {
                const child = treeNode.children[key];
                const parentName = this.getParentName(object, returnedObject);

                if (child.type === 'primitive') {
                    const primitive = this.createPrimitive(child, newMaterials[1], castShadow, receiveShadow);
                    this.updatePrimitiveName(primitive, parentName);
                    returnedObject.add(primitive);
                } else if (this.isLight(child.type)) {
                    const light = this.lightLoader.load(child);
                    this.updateLightName(light, parentName);
                    returnedObject.add(light);
                } else {
                    this.handleNodeOrLod(child, returnedObject, newMaterials, castShadow, receiveShadow, dist, stack, allObjects);
                }
            }

            this.applyTransformations(returnedObject, treeNode.transformations);
            this.updateObjectName(object, returnedObject);
            this.addObjectToParent(object, returnedObject, dist);
            allObjects[treeNode.id] = returnedObject;
        }

        return rootObject;
    }

    createStackItem(node, rootObject, currentMaterials = [], castShadow = false, receiveShadow = false, mindist = 0) {
        return {
            node,
            object: rootObject,
            currentMaterials: currentMaterials,
            castShadow: castShadow,
            receiveShadow: receiveShadow,
            dist: mindist
        };
    }

    createReturnedObject(treeNode) {
        return treeNode.type === 'lod' ? new THREE.LOD() : new MyObject(treeNode.id);
    }

    getParentName(object, returnedObject) {
        const granpaName = object.name.replace(/_obj|_lod/g, '_');
        return granpaName + returnedObject.name.replace(/_obj|_lod/g, '_');
    }

    updatePrimitiveName(primitive, parentName) {
        primitive.name = `${parentName}_${primitive.name}`.replace(/^scene(?=scene)/, '');
    }

    isLight(type) {
        return ['pointlight', 'spotlight', 'directionallight'].includes(type);
    }

    updateLightName(light, parentName) {
        light.name = `${parentName}_${light.name}`.replace(/^scene(?=scene)/, '');
        light.children[0].name = `${light.name}${light.children[0].name}`;
    }

    handleNodeOrLod(child, returnedObject, newMaterials, castShadow, receiveShadow, dist, stack, allObjects) {
        const objectChild = allObjects[child.id];
        if (objectChild) {
            const clonedChild = objectChild.clone();
            this.updateCloneNames(clonedChild, this.getParentName(returnedObject, objectChild));
            returnedObject.add(clonedChild);
        } else if (returnedObject.isLOD) {
            stack.push(this.createStackItem(child.node, returnedObject, newMaterials[0], castShadow, receiveShadow, child.mindist));
        } else {
            stack.push(this.createStackItem(child, returnedObject, newMaterials[0], castShadow, receiveShadow, 0));
        }
    }

    applyTransformations(object, transformations) {
        for (const key in transformations) {
            const transformation = transformations[key];
            this.applyTransformation(object, transformation);
        }
    }

    applyTransformation(object, transformation) {
        switch (transformation.type) {
            case 'R':
                this.applyRotation(object, transformation.rotation);
                break;
            case 'T':
                this.applyTranslation(object, transformation.translate);
                break;
            case 'S':
                this.applyScale(object, transformation.scale);
                break;
            default:
                break;
        }
    }

    applyRotation(object, rotation) {
        // Convert degrees to radians
        rotation = rotation.map(angle => angle * Math.PI / 180);
        object.rotation.x = rotation[0];
        object.rotation.y = rotation[1];
        object.rotation.z = rotation[2];   
    }

    applyTranslation(object, translate) {
        object.position.set(translate[0], translate[1], translate[2]);
    }

    applyScale(object, scale) {
        object.scale.set(scale[0], scale[1], scale[2]);
    }

    updateObjectName(object, returnedObject) {
        const parentName = object.name.replace(/_obj|_lod/g, '_');
        returnedObject.name = `${parentName}${returnedObject.name}${returnedObject.isLOD ? '_lod' : '_obj'}`.replace(/^scene(?=scene)/, '');
    }

    addObjectToParent(object, returnedObject, dist) {
        if (object.isLOD) {
            object.addLevel(returnedObject, dist);
        } else {
            object.add(returnedObject);
        }
    }

    getMaterials(node, materialList) {
        if (!node.materialIds || node.materialIds.length === 0) {
            return materialList.length === 0 ? [materialList, 'defaultMaterial'] : [materialList, materialList[0]];
        }
        return [node.materialIds, node.materialIds[0]];
    }

    updateCloneNames(cloneChild, newFatherName) {
        const secondToLastUnderscoreIndex = cloneChild.name.lastIndexOf('_', cloneChild.name.lastIndexOf('_') - 1);
        const relevantName = cloneChild.name.substring(secondToLastUnderscoreIndex);
        cloneChild.name = `${newFatherName}${relevantName}`;
        cloneChild.traverse(item => {
            if (item.name === cloneChild.name) return;
            const parentName = item.parent.name.replace(/_obj|_lod/g, '_');
            const indexPos = item.name.lastIndexOf('_', item.name.lastIndexOf('_') - 1);
            const impPart = item.name.substring(indexPos);
            item.name = `${parentName}${impPart}`;
        });
    }

    createRectangle(parameters, material, materialInfo) {
        const width = Math.abs(parameters.xy2[0] - parameters.xy1[0]);
        const height = Math.abs(parameters.xy2[1] - parameters.xy1[1]);
        if (materialInfo) material = this.materialLoader.create(materialInfo, width, height);
        const objGeometry = new THREE.PlaneGeometry(width, height, parameters.parts_x, parameters.parts_y);
        const objPrimitive = new THREE.Mesh(objGeometry, material);
        objPrimitive.position.set((parameters.xy2[0] + parameters.xy1[0]) / 2, (parameters.xy2[1] + parameters.xy1[1]) / 2, 0);
        return objPrimitive;
    }

    createTriangle(parameters, material, materialInfo) {
        const p1 = new THREE.Vector3(...parameters.xyz1);
        const p2 = new THREE.Vector3(...parameters.xyz2);
        const p3 = new THREE.Vector3(...parameters.xyz3);
        const width = p1.distanceTo(p2);
        const a = p1.distanceTo(p2);
        const b = p2.distanceTo(p3);
        const c = p3.distanceTo(p1);
        const s = 0.5 * (a + b + c);
        const area = Math.sqrt(s * (s - a) * (s - b) * (s - c));
        const height = (2 * area) / width;
        if (materialInfo) material = this.materialLoader.create(materialInfo, width, height);
        const objGeometry = new MyTriangle(parameters.xyz1, parameters.xyz2, parameters.xyz3);
        return new THREE.Mesh(objGeometry, material);
    }

    createCylinder(parameters, materialInfo) {
        const faceMaterials = [];
        if (materialInfo) {
            const dimensions = [
                [2 * Math.PI * ((parameters.top + parameters.base) / 2), parameters.height],
                [2 * parameters.top, 2 * parameters.top],
                [2 * parameters.bottom, 2 * parameters.bottom]
            ];
            for (const dimension of dimensions) {
                faceMaterials.push(this.materialLoader.create(materialInfo, dimension[0], dimension[1]));
            }
        }
        const cylinderGeometry = new THREE.CylinderGeometry(
            parameters.top,
            parameters.base,
            parameters.height,
            parameters.slices,
            parameters.stacks,
            !parameters.capsclose,
            parameters.thetastart,
            parameters.thetalength
        );
        return new THREE.Mesh(cylinderGeometry, faceMaterials);
    }

    createBox(parameters, materialInfo) {
        const width = Math.abs(parameters.xyz2[0] - parameters.xyz1[0]);
        const height = Math.abs(parameters.xyz2[1] - parameters.xyz1[1]);
        const depth = Math.abs(parameters.xyz2[2] - parameters.xyz1[2]);
        const faceMaterials = [];
        if (materialInfo) {
            const faceDimensions = [
                [depth, height],
                [depth, height],
                [width, depth],
                [width, depth],
                [width, height],
                [width, height]
            ];
            for (const dimension of faceDimensions) {
                let material = this.materialLoader.create(materialInfo, dimension[0], dimension[1]);
                faceMaterials.push(material);
            }
        }
        const objGeometry = new THREE.BoxGeometry(width, height, depth);
        const objPrimitive = new THREE.Mesh(objGeometry, faceMaterials);
        objPrimitive.position.set(
            (parameters.xyz2[0] + parameters.xyz1[0]) / 2,
            (parameters.xyz2[1] + parameters.xyz1[1]) / 2,
            (parameters.xyz2[2] + parameters.xyz1[2]) / 2
        );
        return objPrimitive;
    }

    createNurbs(parameters, material, materialInfo) {
        if (materialInfo) {
            const points = parameters.controlpoints;
            const findMinMax = points.reduce(
                (res, { x, y, z }) => ({
                    minX: Math.min(res.minX, x),
                    minY: Math.min(res.minY, y),
                    minZ: Math.min(res.minZ, z),
                    maxX: Math.max(res.maxX, x),
                    maxY: Math.max(res.maxY, y),
                    maxZ: Math.max(res.maxZ, z)
                }),
                { minX: Infinity, minY: Infinity, minZ: Infinity, maxX: -Infinity, maxY: -Infinity, maxZ: -Infinity }
            );
            const ranges = {
                xx: findMinMax.maxX - findMinMax.minX,
                yy: findMinMax.maxY - findMinMax.minY,
                zz: findMinMax.maxZ - findMinMax.minZ
            };
            material = this.materialLoader.create(materialInfo, ranges.xx, ranges.yy);
        }
        return this.nurbsSurface.parseNurbs(parameters, material);
    }

    createSphere(parameters, material, materialInfo) {
        const radius = parameters.radius;
        const widthSegments = parameters.slices;
        const heightSegments = parameters.stacks;
        const phiStart = parameters.phistart ?? 0;
        const phiLength = parameters.philength ?? Math.PI * 2;
        const thetaStart = parameters.thetastart ?? 0;
        const thetaLength = parameters.thetalength ?? Math.PI;
        if (materialInfo) {
            material = this.materialLoader.create(materialInfo, 2 * Math.PI * radius, 2 * Math.PI * radius);
        }
        const objGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength);
        return new THREE.Mesh(objGeometry, material);
    }

    createPolygon(parameters) {
        const color_c = new THREE.Color(parameters.color_c[0], parameters.color_c[1], parameters.color_c[2]);
        const color_p = new THREE.Color(parameters.color_p[0], parameters.color_p[1], parameters.color_p[2]);
        const polygon = new MyPolygon(parameters.radius, parameters.stacks, parameters.slices, color_c, color_p);
        const material = new THREE.MeshBasicMaterial( {
            side: THREE.DoubleSide, vertexColors: true
        });
        return new THREE.Mesh(polygon, material);
    }
}

export { MyObjectLoader };