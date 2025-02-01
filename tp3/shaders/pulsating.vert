uniform float time;
uniform float amplitude;
uniform float frequency;

// Pass UV coords to the fragment shader so that textures remain visible
varying vec2 vUv;

void main() {
    // Keep the current UV mapping
    vUv = uv;

    float scaleFactor = 1.0 + amplitude * sin(time * frequency);

    // Scale the vertex positions
    vec3 newPosition = position * scaleFactor;
    
    // Standard transform
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}
