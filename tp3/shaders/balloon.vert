// balloon.vert

uniform float heatFactor;   // 0..1 (how “hot” the balloon is)
varying float vY;           // pass vertex Y to fragment

void main() {
    // We'll inflate only the top half (y>0) by heatFactor
    float inflate = 0.0;
    if (position.y > 0.0) {
        inflate = heatFactor * 0.4; // Increase if you want more visible inflation
    }

    // Displace vertex along its normal
    vec3 displaced = position + normal * inflate;

    // Pass the original Y to the fragment shader
    vY = position.y;

    // Standard transform
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
