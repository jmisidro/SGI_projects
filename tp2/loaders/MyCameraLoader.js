import * as THREE from 'three';

class MyCameraLoader {

    /**
     * Loads cameras from an array of camera data objects.
     * @param {Array} data - Array of objects containing camera configuration data.
     * @returns {Array<THREE.Camera>} An array of THREE.Camera instances.
     */
    load(data) {
        const cameras = data.map(cameraData => {
            let camera;

            if (cameraData.type === "orthogonal") {
                camera = new THREE.OrthographicCamera(
                    cameraData.left,
                    cameraData.right,
                    cameraData.top,
                    cameraData.bottom
                );
            } else if (cameraData.type === "perspective") {
                camera = new THREE.PerspectiveCamera(
                    cameraData.angle,
                    window.innerWidth / window.innerHeight
                );
            } else {
                console.error(`Unknown camera type: ${cameraData.type}, Skipping`);
                return null;
            }

            camera.near = cameraData.near;
            camera.far = cameraData.far;
            camera.name = cameraData.id;
            camera.position.fromArray(cameraData.location);
            camera.userData.target = new THREE.Vector3(...cameraData.target);
            camera.lookAt(camera.userData.target);
            camera.userData.id = cameraData.id;
            camera.userData.custom = cameraData.custom;

            return camera;
        }).filter(camera => camera !== null);

        if (cameras.length === 0) {
            console.log("No valid cameras provided. Creating a default camera.");
            const defaultCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
            cameras.push(defaultCamera);
        }

        return cameras;
    }
}

export { MyCameraLoader };
