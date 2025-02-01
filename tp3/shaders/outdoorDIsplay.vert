#include <packing>
    
uniform sampler2D uSampler2;  // Depth texture
uniform float scaleFactor;    // Intensity of displacement
uniform float uCameraNear;
uniform float uCameraFar;

varying vec2 vUv;

float readDepth( sampler2D depthSampler, vec2 coord ) {
    float fragCoordZ = texture2D( depthSampler, coord ).x;
    float viewZ = perspectiveDepthToViewZ( fragCoordZ, uCameraNear, uCameraFar );
    return viewZToOrthographicDepth( viewZ, uCameraNear, uCameraFar );
}

void main() {
    vUv = uv; // Pass UV to fragment shader

    if (vUv.x == 0.0 || vUv.x == 1.0 || vUv.y == 0.0 || vUv.y == 1.0) {
        // Skip border vertices
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        return;
    }

    // Read depth from the depth texture
    float depthValue = readDepth(uSampler2, vUv);

    // Scale depth for displacement
    float displacement = (1.0 - depthValue) * scaleFactor;

    // Apply displacement along the normal
    vec3 displacedPosition = position + normal * displacement;

    // Final transformed position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
}