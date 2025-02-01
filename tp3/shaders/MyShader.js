import * as THREE from 'three';

class MyShader {
    constructor(fileBaseName, uniforms = {}) {
        this.fileBaseName = fileBaseName;
        this.uniforms = uniforms;
        this.material = null;
        this.vertexShader = null;
        this.fragmentShader = null;
        
        // Start reading .vert and .frag
        this.loadShaderFile(`shaders/${fileBaseName}.vert`, true);
        this.loadShaderFile(`shaders/${fileBaseName}.frag`, false);
    }

    loadShaderFile(path, isVertex) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.onload = () => {
            if (xhr.status === 200) {
                if (isVertex) {
                    this.vertexShader = xhr.responseText;
                } else {
                    this.fragmentShader = xhr.responseText;
                }
                this.tryBuildMaterial();
            }
        };
        xhr.send();
    }

    tryBuildMaterial() {
        if (this.vertexShader && this.fragmentShader) {
            this.material = new THREE.ShaderMaterial({
                uniforms: this.uniforms,
                vertexShader: this.vertexShader,
                fragmentShader: this.fragmentShader,
            });
        }
    }

    updateUniform(key, value) {
        if (this.material && this.material.uniforms[key]) {
            this.material.uniforms[key].value = value;
        }
    }

    isReady() {
        return (this.material !== null);
    }
}

export { MyShader };
