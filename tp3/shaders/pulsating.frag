uniform sampler2D uSampler;

// Same vUv from the vertex shader
varying vec2 vUv;

void main() {
    // Keep the power-up’s original texture
    gl_FragColor = texture2D(uSampler, vUv);
}
