import * as THREE from 'three';

let FONT_TEXTURE = null; // Cache the texture once loaded
const FONT_TEXTURE_URL = 'scenes/textures/OoliteFont.png'; // Hardcoded path to the font


// Loads the OoliteFont.png once and saves
function loadFontTexture() {
    if (FONT_TEXTURE) return FONT_TEXTURE;

    const loader = new THREE.TextureLoader();
    FONT_TEXTURE = loader.load(FONT_TEXTURE_URL, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
    });

    return FONT_TEXTURE;
}

// Given an ASCII code, returns its UV region in a 16×16 grid in a 512×512 texture
function getCharUV(ascii) {
    if (ascii < 0) ascii = 0;
    if (ascii > 255) ascii = 255;

    // Each cell 1/16
    const col = ascii % 16;
    const row = Math.floor(ascii / 16);

    const cellSize = 1 / 16;
    const uMin = col * cellSize;
    const uMax = (col + 1) * cellSize;

    // Flip the row
    const rowInverted = 15 - row;
    const vMin = rowInverted * cellSize;
    const vMax = (rowInverted + 1) * cellSize;

    return { uMin, vMin, uMax, vMax };
}

//SPrite for one char 
function createCharSprite(ascii, size) {
    if (!FONT_TEXTURE) {
        console.error('Font texture not loaded. Call loadFontTexture() first.');
        return null;
    }

    const { uMin, vMin, uMax, vMax } = getCharUV(ascii);

    // Clone the texture so each sprite can have its own offset/repeat
    const charTex = FONT_TEXTURE.clone();
    charTex.offset.set(uMin, vMin);
    charTex.repeat.set(uMax - uMin, vMax - vMin);

    // Create a Sprite Material
    const mat = new THREE.SpriteMaterial({
        map: charTex,
        transparent: true,
    });

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(size, size, 1);
    return sprite;
}

// Creates phrase with sprites for a string with a given size and spacing
function createTextSprites(text, size = 2, spacing = 0.2, direction = 'X') {
    if (!FONT_TEXTURE) {
        console.error('Font texture not loaded. Call loadFontTexture() first.');
        return null;
    }

    const group = new THREE.Group();
    let offset = 0;
    for (let i = 0; i < text.length; i++) {
        const ascii = text.charCodeAt(i);
        const charSprite = createCharSprite(ascii, size);
        
        // place it relative to offset in the specified direction
        if (direction === 'X') {
            charSprite.position.x = offset;
        } else if (direction === 'Y') {
            charSprite.position.y = offset;
        } else {
            charSprite.position.z = offset;
        }
        
        offset += (size + spacing);
        group.add(charSprite);
    }

    return group;
}

export { loadFontTexture, createTextSprites };
