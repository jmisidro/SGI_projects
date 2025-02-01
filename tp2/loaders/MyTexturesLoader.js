import * as THREE from 'three';

class MyTexturesLoader {

    /**
     * Load textures based on an object containing texture data.
     * @param {Object} textureData - Object with information to load the textures.
     * @returns {Map<string, Object>} A map of loaded textures, where keys are texture IDs.
     */
    getTexPaths(textureData) {
        const textureMap = new Map();

        for (const key in textureData) {
            const data = textureData[key];
            const { id, filepath, isVideo = false, anisotropy = 1 } = data;
            const mipmaps = new Map();

            for (let i = 0; i <= 7; i++) {
                const mipmap = data[`mipmap${i}`];
                if (mipmap) {
                    mipmaps.set(i, mipmap);
                } else {
                    break;
                }
            }

            textureMap.set(id, {
                id,
                filepath,
                isVideo,
                anisotropy,
                mipmaps: mipmaps.size ? mipmaps : null,
            });
        }

        return textureMap;
    }

    /**
     * Create a THREE.Texture object based on texture information.
     * @param {Object} textureInfo - Texture information from the textureMap.
     * @returns {THREE.Texture} The created texture object.
     */
    create(textureInfo) {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(textureInfo.filepath);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(textureInfo.textureS || 1, textureInfo.textureT || 1);
        return texture;
    }

    /**
     * Load an image and create a mipmap to be added to a texture at the defined level.
     * @param {THREE.Texture} parentTexture - The texture to which the mipmap is added.
     * @param {number} level - The level of the mipmap.
     * @param {string} path - The path for the mipmap image.
     */
    loadMipmap(parentTexture, level, path) {
        new THREE.TextureLoader().load(
            path,
            (mipmapTexture) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = mipmapTexture.image;

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                parentTexture.mipmaps[level] = canvas;
            },
            undefined,
            (err) => {
                console.error(`Unable to load the image ${path} as mipmap level ${level}.`, err);
            }
        );
    }
}

export { MyTexturesLoader};
