uniform sampler2D uSampler1;  // RGB texture
varying vec2 vUv;

void main() {
    // Fetch color from the RGB texture
    vec4 color = texture2D(uSampler1, vUv);

    // Output the color
    gl_FragColor = color;
}