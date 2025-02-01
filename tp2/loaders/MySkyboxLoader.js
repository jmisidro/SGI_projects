import * as THREE from 'three';

class MySkyboxLoader {

    /**
     * Loads and creates a skybox based on the given skybox data.
     *
     * @param {Object} data - Data containing information about the skybox.
     * @returns {THREE.Mesh} - The created skybox as a THREE.Mesh.
    */
    load(data) {
        const skyboxGeometry = new THREE.BoxGeometry(...data.size);

        const loader = new THREE.TextureLoader();
        const skyboxMaterial = [];

        const textureUrls = [
            data.right,
            data.left,
            data.up,
            data.down,
            data.front,
            data.back
        ];

        textureUrls.forEach((url, index) => {
            loader.load(url, (texture) => {
                const material = new THREE.MeshStandardMaterial({
                    map: texture,
                    fog: false,
                    side: THREE.BackSide,
                    emissive: new THREE.Color(data.emissive),
                    emissiveIntensity: data.intensity / 10
                });
                skyboxMaterial[index] = material;
            });
        });

        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

        skybox.position.set(...data.center);


        return skybox;
    }
}

export { MySkyboxLoader};