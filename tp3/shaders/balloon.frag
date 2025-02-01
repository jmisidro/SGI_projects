uniform float heatFactor;  // 0..1, controls the "hotness"
uniform vec3 baseColor;    // Original balloon color
varying float vY;          // Y position passed from vertex shader

void main() {
    float normalizedY = clamp((vY + 4.0) / 8.0, 0.0, 1.0);

    vec3 coolColor = vec3(0.0, 0.0, 1.0); // Blue for cool
    vec3 hotColor  = vec3(1.0, 0.0, 0.0); // Red for hot

    // Interpolate between cool (blue) and hot (red) using heatFactor
    vec3 mixedColor = mix(coolColor, hotColor, heatFactor);

    // Blend with the base color based on altitude (normalizedY)
    vec3 finalColor = mix(baseColor, mixedColor, normalizedY);

    gl_FragColor = vec4(finalColor, 1.0);
}
