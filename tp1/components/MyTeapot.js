import * as THREE from "three";
import { TeapotGeometry } from 'three/addons/geometries/TeapotGeometry.js';

export default class MyTeapot {
    constructor(color, position) {
        this.color = color;
        this.position = position;
        this.teapotGeometry = { size: 1, segments: 20 };
    }
  
    buildTeapot() {
  
      const geometry = new TeapotGeometry(
          this.teapotGeometry.size,
          this.teapotGeometry.segments
      );
      
      const material = new THREE.MeshPhysicalMaterial({
        color: this.color,
        metalness: 1.0,
        roughness: 0.35,
        specularColor: "#111111",
        side: THREE.DoubleSide,
      });
  
      const teapot = new THREE.Mesh(geometry, material);
      teapot.rotateY(-Math.PI / 2);

      // translate the teapot to the position given
      teapot.position.set(this.position.x, this.position.y, this.position.z);
  
      return teapot;
  
    }
  }
  