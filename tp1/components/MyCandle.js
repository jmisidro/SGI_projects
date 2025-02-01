import * as THREE from 'three';

export default class MyCandle {
    constructor(candleColor1, candleColor2, flameColor, position) {
        this.candleColor1 = candleColor1;
        this.candleColor2 = candleColor2; 
        this.flameColor = flameColor;
        this.position = position;
    }

    buildCandle() {
        const candleGroup = new THREE.Group();

        const segmentHeight = 0.2;
        const radiusTop = 0.05;
        const radiusBottom = 0.05;
        const radialSegments = 16;
        const numSegments = 5; // Total number of segments

        
        for (let i = 0; i < numSegments; i++) {
            const color = (i % 2 === 0) ? this.candleColor1 : this.candleColor2;
            const candleBodyGeometry = new THREE.CylinderGeometry(
                radiusTop,
                radiusBottom,
                segmentHeight,
                radialSegments
            );
            const candleBodyMaterial = new THREE.MeshLambertMaterial({ color: color });
            const candleBody = new THREE.Mesh(candleBodyGeometry, candleBodyMaterial);

            candleBody.position.set(
                this.position.x,
                this.position.y + segmentHeight / 2 + i * segmentHeight,
                this.position.z
            );

            candleGroup.add(candleBody);
        }

        const flameGeometry = new THREE.ConeGeometry(
            0.05, 
            0.1, 
            16
        );

        const flameMaterial = new THREE.MeshBasicMaterial({ color: this.flameColor });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);

        // Position the flame on top of the last candle segment
        flame.position.set(
            this.position.x,
            this.position.y + segmentHeight * numSegments + 0.05,
            this.position.z
        );

        candleGroup.add(flame);

        return candleGroup;
    }
}
