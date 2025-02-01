import * as THREE from 'three';
import { MyTrack } from '../objects/MyTrack.js';
import { MyObstacle } from '../objects/MyObstacle.js';
import { MyPowerUp } from '../objects/MyPowerUp.js';
import { MyRoute } from '../objects/MyRoute.js';
import { MyBalloon } from '../objects/MyBalloon.js';
import { MyFireworks } from '../objects/MyFireworks.js';
import { MyButton } from '../objects/MyButton.js';
import { MyFenceSection } from '../objects/MyFenceSection.js';
import { MyPoleAndFlags } from '../objects/MyPoleAndFlags.js';
import { loadFontTexture, createTextSprites } from '../utils/MySpritesheet.js';
import { MyShader } from '../shaders/MyShader.js';
import { MyHUD } from './MyHUD.js';

/*
 * Game States
 */
const states = {
    start: "start",
    chooseName: "chooseName",
    chooseUserBalloon: "userBalloon",
    chooseOpponentBalloon: "opponentBalloon",
    playing: "playing",
    pause: "pause",
    free: "free",
    end: "end",
};



class MyGame {
    constructor(app) {
        this.app = app
        this.contents = null

        this.track = null;
        this.routes = []; // List of routes
        this.obstacles = []; // List of obstacles
        this.powerUps = []; // List of power ups
        this.fireworks = []; // List of fireworks
        this.animatedObjects = []; // List of animated objects
        this.userBalloons = []; // List of user balloons
        this.botBalloons = []; // List of bot balloons
        this.pressedKeys = {}; // List of pressed keys

        this.userBalloonLastPos = null; // Last position of the user balloon
        this.botBalloonLastPos = null; // Last position of the bot balloon

        this.settings = null; // Game settings
        this.hud = null; // HUD object
        this.ended = true; // Game ended flag

        this.clock = new THREE.Clock();
    }

    init() {
        this.initSprites();
        this.initShaders();
        this.initSettings();
        this.createTrack();
        this.createRoutes();
        this.createObstacles();
        this.createPowerUps();
        this.createBalloons();
        this.createSceneExtras();
        this.createParkingLots();
        this.addSpritesToDisplay();
        this.createWindVisualization();
        this.initFireworks();
        this.initMenus();
        this.initGame();
        this.initHUD();
        this.addOutdoorDisplay();

        // Every minute, recapture the scene
        setInterval(() => {
            this.app.textureNeedsUpdate = true;
        }, 3000);

    }

    initSettings() {
        this.settings = {
            state: states.start,
            maxVelocity: 30,
            velocityIncrement: 1,
            angleIncrement: Math.PI / 2,
            maxHeight: 40,
            minHeight: -140,
            heightIncrement: 10,
            pressedKeys: this.pressedKeys,
            laps: 3,
            elapsedTime: 0,
            penaltyMultiplier: 0.7,
            penaltyCooldown: 5,
            powerUpMultiplier: 2,
            powerUpCooldown: 5,
            windSpeed: 5,
            windLayers: [
                { direction: new THREE.Vector3(0, 0, 0), speed: 0, layerName: "No Wind" },
                { direction: new THREE.Vector3(0, 0, 1), speed: 8, layerName: "North" },
                { direction: new THREE.Vector3(0, 0, -1), speed: 6, layerName: "South" },
                { direction: new THREE.Vector3(1, 0, 0), speed: 12, layerName: "East" },
                { direction: new THREE.Vector3(-1, 0, 0), speed: 10, layerName: "West" },
            ],
            outOfBoundsPenalty: 2, // seconds
            vouchers: 0,
            difficulty: 3, // 1: Easy, 2: Medium, 3: Hard
        }
    }

    /**
     * Initializes the text sprites.
     */
    initSprites() {
        loadFontTexture();
    }

    /**
     * Initializes the shaders.
     */
    initShaders() {
        // Initialize MyShader for balloons
        this.balloonShader = new MyShader('balloon', {
            heatFactor: { value: 0.0 },
            baseColor: { value: new THREE.Color(1, 1, 1) }
        });

        // Initialize MyShader for outdoor display
        this.outdoorDisplayShader = new MyShader('outdoorDisplay', {
            uSampler1: { value: this.app.getRGBTexture() }, // RGB texture
            uSampler2: { value: this.app.getDepthTexture() }, // Depth texture
            scaleFactor: { value: 20.0 }, // Relief intensity
            uCameraNear: { value: this.getCamera().near },
            uCameraFar: { value: this.getCamera().far },
        });
    }

    /**
     * Initializes the Outdoor Display.
     */
    addOutdoorDisplay() {
        const planeGeometry = new THREE.PlaneGeometry(160, 80, 50, 50);
    
        // Wait for the shader material to be ready
        const checkShaderReady = setInterval(() => {
            if (this.outdoorDisplayShader.isReady()) {
                clearInterval(checkShaderReady);
    
                const planeMaterial = this.outdoorDisplayShader.material;
    
                this.outdoorPlane = new THREE.Mesh(planeGeometry, planeMaterial);
                this.outdoorPlane.position.set(-175, -45, -0.4);
                this.outdoorPlane.rotation.y = Math.PI / 2;
                this.app.scene.add(this.outdoorPlane);
            }
        }, 100);
    }
    
    /**
     * Creates the track.
     */
    createTrack() {
        // Define track points
        this.trackPoints = [
            new THREE.Vector3(-40, -145, -50), // Bottom-left corner
            new THREE.Vector3(40, -145, -50),  // Bottom-right corner
        
            // Smoother inward dip on the right side
            new THREE.Vector3(30, -145, -30),  // Start curving inward
            new THREE.Vector3(0, -145, 0),     // Dip inward
            new THREE.Vector3(30, -145, 30),   // Start curving outward again
        
            new THREE.Vector3(40, -145, 50),   // Top-right corner
            new THREE.Vector3(-40, -145, 50),  // Top-left corner,
        ];
        

        const trackWidth = 8; 
        const trackSegments = 200;
        const isClosed = true;

        const trackMaterial = new THREE.MeshStandardMaterial({
            color: 0x555555,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.FrontSide,
        });

        // Create and add the track with vertical squash (scaleY < 1)
        this.track = new MyTrack(this.trackPoints, trackWidth, trackSegments, isClosed, trackMaterial, 0.1, -135);
        this.app.scene.add(this.track.build());
    }

    /**
     * Creates the routes.
     */
    createRoutes() {
        // Define route points (based on track and on wind layers)
        const routePoints = [
            new THREE.Vector3(-40, -50, -50), // Bottom-left corner
            new THREE.Vector3(40, 35, -50),  // Bottom-right corner
        
            // Smoother inward dip on the right side
            new THREE.Vector3(30, -90, -30),  // Start curving inward
            new THREE.Vector3(0, -100, 0),     // Dip inward
            new THREE.Vector3(30, -90, 30),   // Start curving outward again
        
            new THREE.Vector3(40, 40, 50),   // Top-right corner
            new THREE.Vector3(-40, -50, 50),  // Top-left corner
            new THREE.Vector3(-40, -50, -50) // Bottom-left corner
        ];

        const path = new THREE.CatmullRomCurve3(routePoints, true);
        path.name = "route1";

        const tube = new THREE.TubeGeometry(path, 64, 1);
        const material = new THREE.LineBasicMaterial({ color: 0x9cc2ff });
        const mesh = new THREE.Mesh(tube, material);

        const trackKeyframes = routePoints.map((point, index) => ({
            x: point.x,
            y: point.y,
            z: point.z,
            time: index * (4 - this.settings.difficulty) * 2
        }));

        const initialPosition = new THREE.Vector3(-40, -50, -50);
        
        const route1 = new MyRoute(mesh, trackKeyframes, initialPosition);

        // Add the route to the routes list
        this.routes.push(route1);

        // Add the route to the animated objects list
        this.animatedObjects.push(route1);

        // Add the route to the scene
        this.app.scene.add(route1.object);
    }


    createObstacles() {
        const createObstacle = (position, keyframes) => {
            const objectGeometry = new THREE.BoxGeometry(5, 5, 5);
            const texture = new THREE.TextureLoader().load('scenes/textures/obstacle.png');
            const objectMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.2,
                side: THREE.FrontSide,
                map: texture,
            });

            const object = new THREE.Mesh(objectGeometry, objectMaterial);
            object.position.copy(position);

            const obstacle = new MyObstacle(object, 5, keyframes);
            this.obstacles.push(obstacle);
            this.animatedObjects.push(obstacle);
            this.app.scene.add(obstacle.object);
        };

        createObstacle(new THREE.Vector3(0, -140, 50), [
            { x: 10, y: 20, z: -65, time: 0 },
            { x: 10, y: 10, z: -65, time: 1 },
            { x: 10, y: 20, z: -65, time: 2 },
        ]);

        createObstacle(new THREE.Vector3(0, -140, -50), [
            { x: -10, y: 20, z: 65, time: 0 },
            { x: -10, y: 10, z: 65, time: 1 },
            { x: -10, y: 20, z: 65, time: 2 },
        ]);
    }

    /**
     * Creates the power ups.
     */
    createPowerUps() {
        const createPowerUp = (type, position, keyframes) => {
            const puGeometry = new THREE.BoxGeometry(5, 5, 5);
            const texturePath = type === "voucher" ? "scenes/textures/powerup_voucher.png" : "scenes/textures/powerup_speed.png";
            const texture = new THREE.TextureLoader().load(texturePath);
            const puMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                roughness: 0.8,
                metalness: 0.2,
                side: THREE.FrontSide,
                map: texture,
            });

            const pu = new THREE.Mesh(puGeometry, puMaterial);
            pu.position.copy(position);

            // Create a new power up
            const powerUp = new MyPowerUp(pu, type, 5, keyframes);
            this.powerUps.push(powerUp);
            this.animatedObjects.push(powerUp);
            this.app.scene.add(powerUp.object);
        };

        // Create multiple power ups with different types, positions, and keyframes
        createPowerUp("voucher", new THREE.Vector3(40, 0, -65), [
            { x: 40, y: 0, z: -65, time: 0 },
            { x: 40, y: 10, z: -65, time: 1 },
            { x: 40, y: 0, z: -65, time: 2 },
        ]);

        createPowerUp("speed", new THREE.Vector3(-30, 0, 50), [
            { x: -30, y: 0, z: 50, time: 0 },
            { x: -30, y: 10, z: 50, time: 1 },
            { x: -30, y: 0, z: 50, time: 2 },
        ]);
        
    }

    /**
     * Creates the balloons.
     */
    createBalloons() {
        const createStick = (start, end, thickness) => {
            const direction = new THREE.Vector3().subVectors(end, start);
            const length = direction.length();
            const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
            const geometry = new THREE.CylinderGeometry(thickness, thickness, length, 8);
            const material = new THREE.MeshStandardMaterial({ color: 0x808080 });
            const stick = new THREE.Mesh(geometry, material);
    
            stick.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
            stick.position.copy(midpoint);
    
            return stick;
        };

        const createBalloon = (color, pos, name) => {
            const balloonTopGeometry = new THREE.SphereGeometry(4, 32, 32);
            const balloonTopMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.2 });
            const balloonSphere = new THREE.Mesh(balloonTopGeometry, balloonTopMaterial);
            balloonSphere.position.set(0, 9, 0);
            balloonSphere.name = name + "_top"

            const basketGeometry = new THREE.BoxGeometry(3, 4, 3);
            const basketMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0.2 });
            const basketMesh = new THREE.Mesh(basketGeometry, basketMaterial);
            basketMesh.position.set(0, 2, 0);

            const level1 = new THREE.Group();
            level1.add(balloonSphere);
            level1.add(basketMesh);

            const ringY = 6;
            const ringRadius = 2;
            const basketTopCorners = [
                new THREE.Vector3( 1.5, 4,  1.5),
                new THREE.Vector3(-1.5, 4,  1.5),
                new THREE.Vector3( 1.5, 4, -1.5),
                new THREE.Vector3(-1.5, 4, -1.5)
            ];
            const sphereRingCorners = [
                new THREE.Vector3( ringRadius, ringY,  ringRadius),
                new THREE.Vector3(-ringRadius, ringY,  ringRadius),
                new THREE.Vector3( ringRadius, ringY, -ringRadius),
                new THREE.Vector3(-ringRadius, ringY, -ringRadius)
            ];
            for (let i = 0; i < 4; i++) {
                const stick = createStick(basketTopCorners[i], sphereRingCorners[i], 0.1);
                level1.add(stick);
            }

            const lod = new THREE.LOD();

            // Level 1: Full detail
            lod.addLevel(level1, 0);

            // Level 2: Without sticks
            const level2 = new THREE.Group();
            level2.add(balloonSphere.clone());
            level2.add(basketMesh.clone());
            lod.addLevel(level2, 150);

            // Level 3: Billboard
            const billboard = new THREE.Group();

            // Create the circle (balloon top)
            const circleGeometry = new THREE.CircleGeometry(4, 32);
            const circleMaterial = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.2, side: THREE.DoubleSide  });
            const circle = new THREE.Mesh(circleGeometry, circleMaterial);
            circle.rotation.x = Math.PI / 2;
            circle.position.set(0, 0, 9);
            billboard.add(circle);

            // Create the square (basket)
            const squareGeometry = new THREE.PlaneGeometry(3, 4);
            const squareMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, metalness: 0.2, side: THREE.DoubleSide });
            const square = new THREE.Mesh(squareGeometry, squareMaterial);
            square.rotation.x = Math.PI / 2;
            square.position.set(0, 0, 2);
            billboard.add(square);

            // Make the billboard always face the camera
            billboard.lookAt(this.getCamera().position);

            lod.addLevel(billboard, 200);

            lod.position.copy(pos);
            lod.scale.set(2, 2, 2);
            lod.name = name;
            lod.traverse(child => { 
            // Set the name for all children except the already named ones
                if (!child.name) child.name = name;
            }); 

            return new MyBalloon(lod, this.app, 4);
        };

        // Create user balloons
        const userBalloon1 = createBalloon(0xff0000, new THREE.Vector3(-20, -130, 100), "userBalloon1");
        const userBalloon2 = createBalloon(0x00ff00, new THREE.Vector3(0, -130, 100), "userBalloon2");
        const userBalloon3 = createBalloon(0x0000ff, new THREE.Vector3(20, -130, 100), "userBalloon3");
        const userBalloon4 = createBalloon(0xff00ff, new THREE.Vector3(-20, -130, 120), "userBalloon4");
        const userBalloon5 = createBalloon(0xffff00, new THREE.Vector3(0, -130, 120), "userBalloon5");
        const userBalloon6 = createBalloon(0x00ffff, new THREE.Vector3(20, -130, 120), "userBalloon6");
        const userBalloon7 = createBalloon(0xffffff, new THREE.Vector3(-20, -130, 140), "userBalloon7");
        const userBalloon8 = createBalloon(0x000000, new THREE.Vector3(0, -130, 140), "userBalloon8");
        const userBalloon9 = createBalloon(0x808080, new THREE.Vector3(20, -130, 140), "userBalloon9");

        // Create bot balloons
        const botBalloon1 = createBalloon(0xff0000, new THREE.Vector3(-20, -130, -100), "botBalloon1");
        const botBalloon2 = createBalloon(0x00ff00, new THREE.Vector3(0, -130, -100), "botBalloon2");
        const botBalloon3 = createBalloon(0x0000ff, new THREE.Vector3(20, -130, -100), "botBalloon3");
        const botBalloon4 = createBalloon(0xff00ff, new THREE.Vector3(-20, -130, -120), "botBalloon4");
        const botBalloon5 = createBalloon(0xffff00, new THREE.Vector3(0, -130, -120), "botBalloon5");
        const botBalloon6 = createBalloon(0x00ffff, new THREE.Vector3(20, -130, -120), "botBalloon6");
        const botBalloon7 = createBalloon(0xffffff, new THREE.Vector3(-20, -130, -140), "botBalloon7");
        const botBalloon8 = createBalloon(0x000000, new THREE.Vector3(0, -130, -140), "botBalloon8");
        const botBalloon9 = createBalloon(0x808080, new THREE.Vector3(20, -130, -140), "botBalloon9");

        // Add the balloon to the scene
        this.app.scene.add(userBalloon1.object);
        this.app.scene.add(userBalloon2.object);
        this.app.scene.add(userBalloon3.object);
        this.app.scene.add(userBalloon4.object);
        this.app.scene.add(userBalloon5.object);
        this.app.scene.add(userBalloon6.object);
        this.app.scene.add(userBalloon7.object);
        this.app.scene.add(userBalloon8.object);
        this.app.scene.add(userBalloon9.object);
        this.app.scene.add(botBalloon1.object);
        this.app.scene.add(botBalloon2.object);
        this.app.scene.add(botBalloon3.object);
        this.app.scene.add(botBalloon4.object);
        this.app.scene.add(botBalloon5.object);
        this.app.scene.add(botBalloon6.object);
        this.app.scene.add(botBalloon7.object);
        this.app.scene.add(botBalloon8.object);
        this.app.scene.add(botBalloon9.object);

        // Add the balloon to the animated objects list
        this.animatedObjects.push(userBalloon1);
        this.animatedObjects.push(userBalloon2);
        this.animatedObjects.push(userBalloon3);
        this.animatedObjects.push(userBalloon4);
        this.animatedObjects.push(userBalloon5);
        this.animatedObjects.push(userBalloon6);
        this.animatedObjects.push(userBalloon7);
        this.animatedObjects.push(userBalloon8);
        this.animatedObjects.push(userBalloon9);
        this.animatedObjects.push(botBalloon1);
        this.animatedObjects.push(botBalloon2);
        this.animatedObjects.push(botBalloon3);
        this.animatedObjects.push(botBalloon4);
        this.animatedObjects.push(botBalloon5);
        this.animatedObjects.push(botBalloon6);
        this.animatedObjects.push(botBalloon7);
        this.animatedObjects.push(botBalloon8);
        this.animatedObjects.push(botBalloon9);

        // Add the balloon to the user balloons list
        this.userBalloons.push(userBalloon1);
        this.userBalloons.push(userBalloon2);
        this.userBalloons.push(userBalloon3);
        this.userBalloons.push(userBalloon4);
        this.userBalloons.push(userBalloon5);
        this.userBalloons.push(userBalloon6);
        this.userBalloons.push(userBalloon7);
        this.userBalloons.push(userBalloon8);
        this.userBalloons.push(userBalloon9);

        // Add the balloon to the bot balloons list
        this.botBalloons.push(botBalloon1);
        this.botBalloons.push(botBalloon2);
        this.botBalloons.push(botBalloon3);
        this.botBalloons.push(botBalloon4);
        this.botBalloons.push(botBalloon5);
        this.botBalloons.push(botBalloon6);
        this.botBalloons.push(botBalloon7);
        this.botBalloons.push(botBalloon8);
        this.botBalloons.push(botBalloon9);
    }

    /**
     * Creates the parking lots.
     * The parking lots are represented by fences with flags.
     */
    createParkingLots() {
        // First fence
        const fenceGroup1 = this.buildFenceGroup();
        fenceGroup1.position.set(0, 0, 130);
        this.addPolesToFence(fenceGroup1, 0xff0000);  // red color
        this.app.scene.add(fenceGroup1);
    
        // Second fence 
        const fenceGroup2 = this.buildFenceGroup();
        fenceGroup2.position.set(0, 0, -130);
        this.addPolesToFence(fenceGroup2, 0x0000ff);  // blue color
        this.app.scene.add(fenceGroup2);
    }
    
    
    buildFenceGroup() {
        const fenceLength = 50;
        const fenceHeight = 10;
        const boardSpacing = 1.5;
        const postSpacing = 10;
        const scale = 1.7;
    
        const fence1 = new MyFenceSection(fenceLength, fenceHeight, boardSpacing, postSpacing, scale);
        const fence2 = new MyFenceSection(fenceLength, fenceHeight, boardSpacing, postSpacing, scale);
        const fence3 = new MyFenceSection(fenceLength, fenceHeight, boardSpacing, postSpacing, scale);
        const fence4 = new MyFenceSection(fenceLength, fenceHeight, boardSpacing, postSpacing, scale);
    
        fence1.object.position.set(0, -142, fenceLength * scale / 2);
        fence2.object.position.set(fenceLength * scale / 2, -142, 0);
        fence2.object.rotation.y = Math.PI / 2;
    
        fence3.object.position.set(0, -142, -fenceLength * scale / 2);
        fence3.object.rotation.y = Math.PI;
    
        fence4.object.position.set(-fenceLength * scale / 2, -142, 0);
        fence4.object.rotation.y = -Math.PI / 2;
    
        const fenceGroup = new THREE.Group();
        fenceGroup.add(fence1.object, fence2.object, fence3.object, fence4.object);
    
        return fenceGroup;
    }

    addPolesToFence(fenceGroup, flagColor) {
        const poleHeight = 70;
        const poleRadius = 1;
        const poleMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    
        const corners = [
            { x: -45, y: -142, z: 45 },
            { x: 45,  y: -142, z: 45 },
            { x: 45,  y: -142, z: -45 },
            { x: -45, y: -142, z: -45 }
        ];
    
        // Create poles
        const poles = [];
        corners.forEach((corner) => {
            const pole = new MyPoleAndFlags(corner, poleHeight, poleRadius, poleMaterial).createPole();
            fenceGroup.add(pole);
            poles.push(pole);
        });
    
        const stringMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
    
        for (let i = 0; i < poles.length; i++) {
            const nextIndex = (i + 1) % poles.length;
            const start = new THREE.Vector3(corners[i].x, corners[i].y + poleHeight, corners[i].z);
            const end = new THREE.Vector3(corners[nextIndex].x, corners[nextIndex].y + poleHeight, corners[nextIndex].z);
    
            // Create and add the string
            const string = new MyPoleAndFlags().createString(start, end, stringMaterial);
            fenceGroup.add(string);
    
            // Extract points from the string geometry
            const stringPoints = string.geometry.attributes.position.array;
            const formattedPoints = [];
            for (let j = 0; j < stringPoints.length; j += 3) {
                formattedPoints.push(new THREE.Vector3(stringPoints[j], stringPoints[j + 1], stringPoints[j + 2]));
            }
    
            // Add flags to the string
            new MyPoleAndFlags().addFlagsToString(formattedPoints, fenceGroup, flagColor);
        }
    }
    

    initFireworks() {
        // Create basic firework object
        const fireworkMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
        });

        const fireworkGeo = new THREE.SphereGeometry(0.5, 16, 16);
        const object = new THREE.Mesh(fireworkGeo, fireworkMat);
        object.position.set(-250, -50, 15)

        const firework = new MyFireworks(object, this.app);
        this.fireworks.push(firework);
    }

    addSpritesToDisplay() {
        const sgi = createTextSprites("SGI", 10, 1, 'Z');
        sgi.position.set(170, -15, -10);
        this.app.scene.add(sgi);

        const machado = createTextSprites("MACHADO", 7, 1, 'Z');
        machado.position.set(170, -80, -65);
        this.app.scene.add(machado);

        const isidro = createTextSprites("ISIDRO", 7, 1, 'Z');
        isidro.position.set(170, -80, 25);
        this.app.scene.add(isidro);
    }

    addUserToDisplay() {
        const player = createTextSprites("Player:", 5, 1, 'Z');
        player.position.set(170, -50, 25);
        this.app.scene.add(player);

        const user = createTextSprites(this.username, 5, 1, 'Z');
        user.position.set(170, -60, 25);
        this.app.scene.add(user);
    }

    createWindVisualization() {
        // const windArrow = new THREE.ArrowHelper(
        //     new THREE.Vector3(0, 0, 1),
        //     new THREE.Vector3(0, 0, 0),
        //     10,
        //     0x00ff00
        // );
        // this.app.scene.add(windArrow);

        // const windSpeedLabel = createTextSprites("Wind Speed: 5", 2, 0);
        // windSpeedLabel.position.set(0, 10, 0);
        // this.app.scene.add(windSpeedLabel);

        this.settings.windLayers.map((wind, index) => {
            const text = createTextSprites(wind.layerName, 5, 1, 'Z');
            text.position.set(168, -60 + index * 10, -60);
            this.app.scene.add(text);

            const arrow = new THREE.ArrowHelper(
                wind.direction,
                new THREE.Vector3(0, 0, 0),
                10,
                0x00ff00
            );
            arrow.position.set(168, -60 + index * 10, -70);
            this.app.scene.add(arrow);
        });
    }

    /**
     * Creates a text input button
     * @param {*} name - The name of the button
     * @param {*} pos - The position of the button
     * @param {*} text - The text to display
     * @param {*} sizeX - The size of the button in the X axis
     * @param {*} sizeY - The size of the button in the Y axis
     * @returns 
     */
    createTextInput = (name, pos, text, sizeX = 10, sizeY = 5, direction = 'X') => {
        const geometry = new THREE.PlaneGeometry(sizeX, sizeY);
        const texture = new THREE.TextureLoader().load('scenes/textures/buttons/blank.png');
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            side: THREE.FrontSide, 
            map: texture
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = name;
        
        // Display the text
        const textObj = createTextSprites(text, 2, 0, direction);
        textObj.position.set(-sizeX / 2 + 3, 0, 0);

        const group = new THREE.Group();
        group.add(mesh);
        group.add(textObj);
        group.position.copy(pos);

        const button = new MyButton(group);
        button.enableSelecting();

        return button;
    }

    /**
     * Creates a button with a texture
     * @param {*} name - The name of the button
     * @param {*} pos - The position of the button
     * @param {*} texturePath - The path to the texture
     * @param {*} sizeX - The size of the button in the X axis
     * @param {*} sizeY - The size of the button in the Y axis
     * @returns 
     */
    createButton(name, pos, texturePath, sizeX = 10, sizeY = 5) {
        const geometry = new THREE.PlaneGeometry(sizeX, sizeY);
        const texture = new THREE.TextureLoader().load(texturePath);
        const material = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            side: THREE.FrontSide, 
            map: texture
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(pos);
        mesh.name = name;
        const button = new MyButton(mesh);
        button.enableSelecting();
        return button;
    };

    /**
     * Updates the displayed username
     */
    updateDisplayedUsername() {
        // Remove the previous username button
        if (this.usernameButton !== null || this.usernameButton !== undefined) {
            this.app.scene.remove(this.usernameButton.object);
    
            // Rmove from buttons list
            let index = this.buttons.indexOf(this.usernameButton);
            if (index > -1) this.buttons.splice(index, 1);

            // Remove from animated objects list
            index = this.animatedObjects.indexOf(this.usernameButton);
            if (index > -1) this.animatedObjects.splice(index, 1);
        }


        this.usernameButton = this.createTextInput("usernamebtn", new THREE.Vector3(0, 40, 250), this.username, 30, 5);
        this.buttons.push(this.usernameButton);
        this.animatedObjects.push(this.usernameButton);
        this.app.scene.add(this.usernameButton.object);
    }

    /**
     * Updates the displayed number of laps
     */
    updateDisplayedNumberOfLaps() {
        // Remove the previous lap button
        if (this.lapButton !== null || this.lapButton !== undefined) {
            this.app.scene.remove(this.lapButton.object);

            // Remove from buttons list
            let index = this.buttons.indexOf(this.lapButton);
            if (index > -1) this.buttons.splice(index, 1);

            // Remove from animated objects list
            index = this.animatedObjects.indexOf(this.lapButton);
            if (index > -1) this.animatedObjects.splice(index, 1);
        }

        this.lapButton = this.createTextInput("lapbtn", new THREE.Vector3(0, 50, 250), this.settings.laps.toString(), 8, 5);
        this.buttons.push(this.lapButton);
        this.animatedObjects.push(this.lapButton);
        this.app.scene.add(this.lapButton.object);
    }

    /**
     * Initializes the main menu
     */
    initMainMenu() {

        this.startButton = this.createButton("startbtn", 
            new THREE.Vector3(0, 30, 250), 'scenes/textures/buttons/start.png');
        this.usernameButton = this.createButton("usernamebtn", 
            new THREE.Vector3(0, 40, 250), 'scenes/textures/buttons/blank.png', 30, 5);
        const usernameLabel = this.createTextInput("usernamelabel", 
            new THREE.Vector3(0, 45, 250), 'Username:', 22, 3);
        this.minusLapButton = this.createButton("minusbtn", 
            new THREE.Vector3(-10, 50, 250), 'scenes/textures/buttons/minus.png', 8, 4);
        this.lapButton = this.createTextInput("lapbtn",
             new THREE.Vector3(0, 50, 250), this.settings.laps.toString(), 8, 5);
        this.plusLapButton = this.createButton("plusbtn", 
            new THREE.Vector3(10, 50, 250), 'scenes/textures/buttons/plus.png', 8, 4);
        const lapsLabel = this.createTextInput("lapslabel", 
            new THREE.Vector3(0, 55, 250), 'Number of Laps:', 34, 3);
        this.userBalloonButton = this.createButton("userballoonbtn", 
            new THREE.Vector3(-15, 60, 250), 'scenes/textures/buttons/userBalloon.png');
        this.botBalloonButton = this.createButton("botballoonbtn", 
            new THREE.Vector3(0, 60, 250), 'scenes/textures/buttons/botBalloon.png');
        this.editNameButton = this.createButton("editnamebtn", 
            new THREE.Vector3(15, 60, 250), 'scenes/textures/buttons/editName.png');

        // Add FEUP, SGI and authors labels
        const feupLabel = this.createButton("feuplabel", 
            new THREE.Vector3(-35, 30, 250), 'scenes/textures/buttons/feup.png', 10, 5);
        const sgiLabel = this.createButton("sgilabel", 
            new THREE.Vector3(-25, 30, 250), 'scenes/textures/buttons/sgi.png', 10, 5);
        const isidroLabel = this.createButton("isidrolabel",
            new THREE.Vector3(-35, 35, 250), 'scenes/textures/buttons/isidro.png', 10, 5);
        const machadoLabel = this.createButton("machadolabel",
            new THREE.Vector3(-25, 35, 250), 'scenes/textures/buttons/machado.png', 10, 5);

        // Add buttons to the buttons list
        this.buttons.push(this.startButton);
        this.buttons.push(this.usernameButton);
        this.buttons.push(usernameLabel);
        this.buttons.push(this.minusLapButton);
        this.buttons.push(this.lapButton);
        this.buttons.push(this.plusLapButton);
        this.buttons.push(lapsLabel);
        this.buttons.push(this.userBalloonButton);
        this.buttons.push(this.botBalloonButton);
        this.buttons.push(this.editNameButton);
        this.buttons.push(feupLabel);
        this.buttons.push(sgiLabel);
        this.buttons.push(isidroLabel);
        this.buttons.push(machadoLabel);

        // Add a background plane for the main menu
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x91e2ff,
            opacity: 0.7,
            transparent: true,
            side: THREE.FrontSide, 
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(0, 30, 249);
        this.app.scene.add(plane);
    }

    /**
     * Initializes the pause menu
     */
    initPauseMenu() {

        this.resumeButton = this.createButton("resumebtn", 
            new THREE.Vector3(0, 50, -250), 'scenes/textures/buttons/resume.png');
        this.quitButton = this.createButton("quitbtn", 
            new THREE.Vector3(0, 40, -250), 'scenes/textures/buttons/quit.png');

        // Add FEUP, SGI and authors labels
        const feupLabel = this.createButton("feuplabel", 
            new THREE.Vector3(35, 30, -250), 'scenes/textures/buttons/feup.png', 10, 5);
        const sgiLabel = this.createButton("sgilabel", 
            new THREE.Vector3(25, 30, -250), 'scenes/textures/buttons/sgi.png', 10, 5);
        const isidroLabel = this.createButton("isidrolabel",
            new THREE.Vector3(35, 35, -250), 'scenes/textures/buttons/isidro.png', 10, 5);
        const machadoLabel = this.createButton("machadolabel",
            new THREE.Vector3(25, 35, -250), 'scenes/textures/buttons/machado.png', 10, 5);


        // Rotate the buttons and labels so they face the camera
        this.resumeButton.object.rotateY(Math.PI);
        this.quitButton.object.rotateY(Math.PI);
        feupLabel.object.rotateY(Math.PI);
        sgiLabel.object.rotateY(Math.PI);
        isidroLabel.object.rotateY(Math.PI);
        machadoLabel.object.rotateY(Math.PI);

        // Add buttons to the buttons list
        this.buttons.push(this.resumeButton);
        this.buttons.push(this.quitButton);
        this.buttons.push(feupLabel);
        this.buttons.push(sgiLabel);
        this.buttons.push(isidroLabel);
        this.buttons.push(machadoLabel);

        // Add a background plane for the pause menu
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x91e2ff,
            opacity: 0.7,
            transparent: true,
            side: THREE.FrontSide, 
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(0, 30, -249);
        plane.rotateY(Math.PI);

        this.app.scene.add(plane);
    }

    initEndMenu() {
        this.restartButton = this.createButton("restartbtn",
            new THREE.Vector3(-250, -63, 0), 'scenes/textures/buttons/restart.png');
        this.quitGameButton = this.createButton("quitgamebtn", 
            new THREE.Vector3(-250, -70, 0), 'scenes/textures/buttons/quit.png');            

        // Add FEUP, SGI and authors labels
        const feupLabel = this.createButton("feuplabel", 
            new THREE.Vector3(-250, -70, -35), 'scenes/textures/buttons/feup.png', 10, 5);
        const sgiLabel = this.createButton("sgilabel", 
            new THREE.Vector3(-250, -70, -25), 'scenes/textures/buttons/sgi.png', 10, 5);
        const isidroLabel = this.createButton("isidrolabel",
            new THREE.Vector3(-250, -65, -35), 'scenes/textures/buttons/isidro.png', 10, 5);
        const machadoLabel = this.createButton("machadolabel",
            new THREE.Vector3(-250, -65, -25), 'scenes/textures/buttons/machado.png', 10, 5);


        // Rotate the buttons and labels so they face the camera
        this.restartButton.object.rotateY(-Math.PI / 2);
        this.quitGameButton.object.rotateY(-Math.PI / 2);
        feupLabel.object.rotateY(-Math.PI / 2);
        sgiLabel.object.rotateY(-Math.PI / 2);
        isidroLabel.object.rotateY(-Math.PI / 2);
        machadoLabel.object.rotateY(-Math.PI / 2);

        // Add buttons to the buttons list
        this.buttons.push(this.restartButton);
        this.buttons.push(this.quitGameButton);
        this.buttons.push(feupLabel);
        this.buttons.push(sgiLabel);
        this.buttons.push(isidroLabel);
        this.buttons.push(machadoLabel);

        // Add a background plane for the end menu
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x91e2ff,
            opacity: 0.7,
            transparent: true,
            side: THREE.FrontSide,
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.set(-249, -30, 0);
        plane.rotateY(-Math.PI / 2);

        this.app.scene.add(plane);
    }

    addFinalResults() {
        // Add time, and winner labels
        const timeLabel = this.createTextInput("timelabel", new THREE.Vector3(-250, -30, 0), 
        `Time: ${this.getFormatedtime(this.settings.elapsedTime)}`, 27, 5);
        const winnerLabel = this.createButton("winnerlabel", new THREE.Vector3(-250, -45, -30),
            'scenes/textures/buttons/winner.png', 10, 5);
        const winnerNameLabel = this.createTextInput("winnerlabel",
            new THREE.Vector3(-250, -45, -15), `${this.winner}`, 20, 5);
        const userPlaceLabel = this.createTextInput("userplacelabel", new THREE.Vector3(-250, -55, 20),
            `Place: ${this.winner == this.username ? "1st" : "2nd"}`, 25, 5);
        const usernameLabel = this.createTextInput("usernamelabel", new THREE.Vector3(-250, -55, -20),
            `User: ${this.username}`, 40, 5);

        // Rotate the labels so they face the camera
        timeLabel.object.rotateY(-Math.PI / 2);
        winnerLabel.object.rotateY(-Math.PI / 2);
        winnerNameLabel.object.rotateY(-Math.PI / 2);
        usernameLabel.object.rotateY(-Math.PI / 2);
        userPlaceLabel.object.rotateY(-Math.PI / 2);
        
        // Add labels to the scene
        this.app.scene.add(timeLabel.object);
        this.app.scene.add(winnerLabel.object);
        this.app.scene.add(winnerNameLabel.object);
        this.app.scene.add(usernameLabel.object);
        this.app.scene.add(userPlaceLabel.object);
    }

    addBalloonsToEndMenu(winerPos, loserPos) {
        if (this.winner == this.username) { // User won
            this.addUserBalloonToMenu(winerPos, 1);
            this.addBotBalloonToMenu(loserPos);
        }
        else { // Bot won
            this.addUserBalloonToMenu(loserPos);
            this.addBotBalloonToMenu(winerPos, 1);
        }
    }


    /**
     * Initializes the menus
     */
    initMenus() {
        this.buttons = [];

        this.initMainMenu();
        this.initPauseMenu();
        this.initEndMenu();

        // Add buttons to the animated objects list
        this.buttons.forEach((button) => this.animatedObjects.push(button));

        // Add buttons to the scene
        this.buttons.forEach((button) => this.app.scene.add(button.object));
    }

    addUserBalloonToMenu(pos, scale = 0.5) {
        // Add the user balloon to the main menu
        this.userBalloonLastPos = this.userBalloon.object.position.clone();
        this.userBalloon.object.position.copy(pos);
        this.userBalloon.object.scale.set(scale, scale, scale);
        this.app.scene.add(this.userBalloon.object);
    }


    addBotBalloonToMenu(pos, scale = 0.5) {
        // Add the bot balloon to the main menu
        this.botBalloonLastPos = this.botBalloon.object.position.clone();
        this.botBalloon.object.position.copy(pos);
        this.botBalloon.object.scale.set(scale, scale, scale);
        this.app.scene.add(this.botBalloon.object);
    }

    createSceneExtras() {
        this.createChampionsCup();
    }

    createChampionsCup() {
        const textureLoader = new THREE.TextureLoader();
        const goldTexture = textureLoader.load("./scenes/textures/gold.jpg");
    
        const baseMaterial = new THREE.MeshStandardMaterial({
            map: goldTexture,
            side: THREE.DoubleSide
        });
        

        const baseGeometry = new THREE.CylinderGeometry(2, 3, 1, 32);
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.set(0, 0.5, 0);
    
        const stemGeometry = new THREE.CylinderGeometry(1, 1.2, 2, 32);
        const stemMesh = new THREE.Mesh(stemGeometry, baseMaterial);
        stemMesh.position.set(0, 2, 0);
    
        const bowlGeometry = new THREE.CylinderGeometry(3, 1.5, 4, 32, 1, true);
        const bowlMesh = new THREE.Mesh(bowlGeometry, baseMaterial);
        bowlMesh.position.set(0, 5, 0);

        const handleGeometry = new THREE.TorusGeometry(1, 0.2, 16, 100, 4);
        const leftHandle = new THREE.Mesh(handleGeometry, baseMaterial);
        const rightHandle = new THREE.Mesh(handleGeometry, baseMaterial);

        leftHandle.rotation.z = Math.PI / 2;
        leftHandle.position.set(-2, 5, 0);
    
        rightHandle.rotation.z = Math.PI / 2;
        rightHandle.rotation.y = Math.PI;
        rightHandle.position.set(2, 5, 0);

        const cupGroup = new THREE.Group();
        cupGroup.add(baseMesh);
        cupGroup.add(stemMesh);
        cupGroup.add(bowlMesh);
        cupGroup.add(leftHandle);
        cupGroup.add(rightHandle);
    
        cupGroup.position.set(140, -135, -140);
        cupGroup.rotation.y = THREE.MathUtils.degToRad(135);
        cupGroup.scale.set(5, 5, 5);
    
        this.app.scene.add(cupGroup);
    }
    
    

    initGame() {
        // Init keyboard events
        document.addEventListener('keydown', this.onKeyDown.bind(this));
        document.addEventListener('keyup', this.onKeyUp.bind(this));

        // Init selecting
        this.pointer = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.raycaster.near = 1;
        this.raycaster.far = 200;
        document.addEventListener('click', this.onMouseClick.bind(this));
        this.enableSelecting(this.animatedObjects);

        // Find selected balloons
        this.userBalloon = (this.userBalloons.find(bal => bal.selected) || null);
        this.botBalloon =(this.botBalloons.find(bal => bal.selected) || null);

        // Init player's username
        this.username = null;

        // Default winner
        this.winner = "Bot";
        this.winnerBalloon = null;
    }

    initHUD() {
        this.hud = new MyHUD(this.app.scene, this.getCamera());
        this.hud.addText("wind", "Wind: --", 0.015, 0.12, -0.11, 0.0001)
        this.hud.addText("laps", "Laps: 0/--", 0.015, 0.12, -0.13, 0.0001)
        this.hud.addText("pos", "Position: --", 0.015, 0.12, -0.15, 0.0001)
        this.hud.addText("voucher", "Vouchers: 0", 0.015, -0.3, -0.13, 0.0001)
        this.hud.addText("time", "Time: 00:00", 0.015, -0.3, -0.15, 0.0001)
    }
    /**
    * Convert time in the format "mm:ss".
    * @param {number} time - The time in seconds.
    * @returns {string} - The formatted time.
    */
    getFormatedtime(time) {
        const min = Math.floor(time / 60).toString().padStart(2, '0');
        const sec = Math.floor(time % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    }

    getUserPosition() {        
        const userNextCheckPoint = this.userBalloon.getNextCheckPoint();
        const userLaps = this.userBalloon.getLapCount();

        const botNextCheckPoint = this.botBalloon.getNextCheckPoint();
        const botLaps = this.botBalloon.getLapCount();
        if (userLaps === botLaps && userNextCheckPoint === botNextCheckPoint) {
            return "--"; // same position
        } else if (userLaps > botLaps || (userLaps === botLaps && userLaps > 0 && userNextCheckPoint > botNextCheckPoint)) {
            return "1st";
        } else {
            return "2nd"; // user is behind
        }
    }

    updateHUD() {
        // Update laps
        this.hud.updateText("laps", `Laps: ${this.userBalloon.getLapCount()}/${this.settings.laps}`);

        // Update wind
        this.hud.updateText("wind", `Wind: ${this.userBalloon.getWindLayer().layerName}`);

        // Update position
        const pos = this.getUserPosition();
        this.hud.updateText("pos", `Position: ${pos}`);

        // Update vouchers
        this.hud.updateText("voucher", `Vouchers: ${this.userBalloon.getVouchers()}`);

        // Update time
        const time = this.getFormatedtime(this.settings.elapsedTime);
        this.hud.updateText("time", `Time: ${time}`);
    }

    /**
     * Start a new game
     */
    startGame(){
        // Reset the ended flag
        this.ended = false; 

        this.addUserToDisplay();

        // Get the initial position for the user and bot balloons
        const initialPos = this.routes[0].initialPosition;

        // Calculate min and max heights dynamically from route
        const routePoints = this.routes[0].keyframes.map(kf => kf.y);
        const minAltitude = Math.min(...routePoints);
        const maxAltitude = Math.max(...routePoints);

        // Update user and bot balloon altitude ranges
        this.userBalloon.setAltitudeRange(minAltitude, maxAltitude);
        this.botBalloon.setAltitudeRange(minAltitude, maxAltitude);

        // Set the balloons initial position
        this.userBalloon.object.position.copy(initialPos);
        this.botBalloon.object.position.copy(initialPos);

        // Set the balloons initial scale
        this.userBalloon.object.scale.set(2, 2, 2);
        this.botBalloon.object.scale.set(2, 2, 2);

        // Set settings
        this.userBalloon.setSettings(this.settings);
        this.botBalloon.setSettings(this.settings);

        // Set checkpoints
        this.userBalloon.setCheckPoints(this.track.getPoints());
        this.botBalloon.setCheckPoints(this.track.getPoints());

        // Set obstacles, powerups, opponent and road for the user balloon
        this.userBalloon.setObstacles(this.obstacles);
        this.userBalloon.setPowerUps(this.powerUps);
        this.userBalloon.setOpponent(this.botBalloon);
        this.userBalloon.setTrack(this.track);

        // Set the route and autonomous movement for the bot balloon
        this.botBalloon.setRoute(this.routes[0]);
        this.botBalloon.setKeyframes(this.routes[0].keyframes);
        this.botBalloon.enableAutoMove();

        // Set cameras (POV and Third Person)
        this.userBalloon.setPOVCamera(this.app.cameras['balloon']);
        this.userBalloon.setTPCamera(this.app.cameras['balloonthird']);

        // Init obstacles/powerups animations
        this.obstacles.forEach(obs => obs.animate());
        this.powerUps.forEach(pup => pup.animate());

        // If balloonShader is loaded, apply to just the selected balloons
        if (this.balloonShader.isReady()) {
            console.log("Applying ShaderMaterial to chosen user & bot balloons...");
            this.userBalloon.setShaderMaterial(this.balloonShader.material); 
            this.botBalloon.setShaderMaterial(this.balloonShader.material);
        } else {
            console.warn("Shader not loaded; continuing with standard materials.");
        }

        // Start counting time
        this.settings.elapsedTime = 0;
        this.elapsedTime = 0;
        
        // Start the animations
        this.playAnimations();
        
    }

    verifyEndGame() {
        if (this.userBalloon.verifyEndGame()) {
            this.winner = this.username;
            this.winnerBalloon = this.userBalloon;
            this.setState(states.end);
        }
        else if (this.botBalloon.verifyEndGame()) {
            this.winner = "Bot";
            this.winnerBalloon = this.botBalloon;
            this.setState(states.end);
        }
    }

    endGame() {
        if (this.ended) return;

        // Stop the animations
        this.stopAnimations();

        // Enable the buttons for the end menu
        this.restartButton.play();
        this.quitGameButton.play();
             
        // Enable the fireworks
        this.enableFireworks();

        // Add final results (winner and time) to the scene
        this.addFinalResults();

        // If no winner balloon was selected, set it to the bot balloon
        if (this.winnerBalloon === null) this.winnerBalloon = this.botBalloon; 

        // Reset the balloons
        this.userBalloon.endGame();
        this.botBalloon.endGame();

        // Add the winner balloon to the end menu
        this.addBalloonsToEndMenu(new THREE.Vector3(-250, -50, 0), new THREE.Vector3(-250, -50, 25));

        // Stop the obstacles/powerups animations
        this.obstacles.forEach(obs => obs.stop());
        this.powerUps.forEach(pup => pup.stop());

        // Reset Shaders if they were applied
        this.userBalloons.forEach(balloon => balloon.resetMaterial());
        this.botBalloons.forEach(balloon => balloon.resetMaterial());

        this.ended = true;

        // Disable fireworks after 15 seconds
        setTimeout(() => {
            this.disableFireworks();
        }, 15000);
    }

    /**
     * Play the animations for all animated objects.
     */
    playAnimations() {
        this.animatedObjects.forEach((obj) => obj.play());
    }

    /**
     * Stop the animations for all animated objects.
     */
    stopAnimations() {
        this.animatedObjects.forEach((obj) => obj.stop());
    }

    enableFireworks() {
        this.fireworks.forEach((firework) => firework.animate());
    }

    disableFireworks() {
        this.fireworks.forEach((firework) => firework.stop());
    }

    /** Enables selecting for a list of scene objects.
     * @param {Array} objects - List of scene objects to enable selecting for.
     */
    enableSelecting(objects) {
        objects.forEach((obj) => obj.enableSelecting());
    }

    /**
     * Listens to the mouse click event for object selection.
     * @param {MouseEvent} event - The mouse event containing information about the mouse movement.
     */
    onMouseClick(event) {
        this.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        this.raycaster.setFromCamera(this.pointer, this.getCamera());

        const intersects = this.raycaster.intersectObjects(this.app.scene.children);
        if (intersects.length > 0) this.selectObject(intersects[0])
    }

    /**
     * Handles the selection of scene objects.
     * @param {Object} selected - The object being selected.
     */
     selectObject(selected) {
        for (const animated of this.animatedObjects) {
            if (selected.object.name && animated.isSelectable && this.includes(animated, selected.object.name)) {
                if (animated.selected) animated.unselect();
                else animated.select();
                
                console.log("Selected: ", animated.name);
                return;
            }
        }
    }

    /**
     * Deselects scene objects.
     * @param {Array} objects - List of scene objects to deselect.
     */
    unselectObjects(objects) {
        objects.forEach((obj) => obj.unselect());
    }

    /**
     * Checks if a specified child object with the given name exists within a SceneObject.
     * @param {SceneObject} object - object to search for
     * @param {String} child - name of the child object to search for
     */
    includes(object, child) {
        let ret = false;
        object.object.traverse((obj) => {
            if (obj.name && obj.name === child) ret = true;
        });
        return ret;
    }

    /**
     * Listen to the keys pressed by the user.
     * @param {KeyboardEvent} event - The keyboard event containing information about the key pressed.
     */
    onKeyDown(event) {
        if (this.settings.state === states.playing) {
            this.pressedKeys[event.key.toUpperCase()] = true;

            if (event.key.toUpperCase() === ' ' || event.key.toUpperCase() === 'P') {
                this.setState(states.pause);
                this.setCamera("pause");
                this.userBalloon.pause();
                this.botBalloon.pause();
            }
            else if (event.key.toUpperCase() === 'C') {
                if (this.getCamera().name === "balloon") {
                    this.setCamera("balloonthird");
                }
                else this.setCamera("balloon");
            }
            else if (event.key.toUpperCase() === 'ESCAPE')
                this.setState(states.end); // End the game
        } 
        else if (this.settings.state === states.pause) {
            if (event.key.toUpperCase() === ' ' || event.key.toUpperCase() === 'P') {
                this.setState(states.playing);
                this.userBalloon.resume();
                this.botBalloon.resume();
                this.setCamera("balloon");
            }
            else if (event.key.toUpperCase() === 'K') {
                this.setState(states.free);
                this.setCamera("free");
            }
            else if (event.key.toUpperCase() === 'ESCAPE')
                this.setState(states.end); // End the game
        }
        else if (this.settings.state === states.free) {
            if (event.key.toUpperCase() === 'K') {
                this.setState(states.pause);
                this.setCamera("pause");
            }
        }
    }

    handleMainMenuButtons() {
        if (this.startButton.selected) {
            if(this.verifyUsername() && this.userBalloon && this.botBalloon){
                this.setState(states.playing);
                this.startGame();
                this.setCamera("balloon");
            }
            else {
                alert("Please select a user balloon, opponent balloon and enter a username.");
            }
        }
        if (this.userBalloonButton.selected) {
            this.setState(states.chooseUserBalloon);
            if (this.userBalloonLastPos !== null) {
                this.userBalloon.object.position.copy(this.userBalloonLastPos);
                this.userBalloon.object.scale.set(2, 2, 2);
            }
            this.userBalloon = null;
            this.userBalloons.forEach(bal => { bal.selected = false; });
        }
        if (this.botBalloonButton.selected) {
            this.setState(states.chooseOpponentBalloon);
            if (this.botBalloonLastPos !== null) {
                this.botBalloon.object.position.copy(this.botBalloonLastPos);
                this.botBalloon.object.scale.set(2, 2, 2);
            }
            this.botBalloon = null;
            this.botBalloons.forEach(bal => { bal.selected = false; });
        }
        if (this.editNameButton.selected || this.usernameButton.selected) {
            this.setState(states.chooseName);
            this.updateUsername();
        }
        if (this.minusLapButton.selected && this.settings.laps > 3) {
            this.settings.laps--;
            this.updateDisplayedNumberOfLaps();
        }
        if (this.plusLapButton.selected && this.settings.laps < 20) {
            this.settings.laps++;
            this.updateDisplayedNumberOfLaps();
        }

        this.unselectObjects(this.buttons);
    }

    handlePauseMenuButtons() {
        if (this.resumeButton.selected) {
            this.setState(states.playing);
            this.userBalloon.resume();
            this.botBalloon.resume();
            this.setCamera("balloon");
        }
        if (this.quitButton.selected) {
            this.setState(states.end);
        }

        this.unselectObjects(this.buttons);
    }

    handleEndMenuButtons() {
        if (this.restartButton.selected) {
            // Restart the game with the same settings
            this.setState(states.playing);
            this.startGame();
            this.setCamera("balloon");
        }
        if (this.quitGameButton.selected) {
            // Force reload to reset the game
            location.reload();
        }

        this.unselectObjects(this.buttons);
    }
    

    /**
     * Edits the player's username based on keyboard input and updates it in the game.
     */
    updateUsername() {
        if (this.settings.state === states.chooseName) {
            const keydownHandler = (event) => {
                const isAlphanumeric = /^[a-zA-Z0-9 ]$/.test(event.key);

                if (isAlphanumeric || (event.key === 'Backspace' && this.username)) {
                    if (event.key === 'Backspace') {
                        this.username = this.username.slice(0, -1);
                    } else {
                        this.username = (this.username || '') + event.key;
                    }

                    this.username = this.username.slice(0, 12);
                    this.updateDisplayedUsername();
                } 
                else if (event.key === 'Enter' && this.verifyUsername()) {
                    this.setState(states.start);
                    this.unselectObjects(this.buttons);
                    document.removeEventListener('keydown', keydownHandler);
                    this.updateDisplayedUsername();
                }


                // Update the username button with the current username
            };

            document.addEventListener('keydown', keydownHandler);
        }
    }
    
    /**
     * Checks if username is valid before starting the game.
     */
    verifyUsername() {
        return (this.username && this.username.length >= 1 && this.username.length <= 16);
    }

    /**
     * Listen to the keys released by the user.
     * @param {KeyboardEvent} event - The keyboard event containing information about the key released.
     */
    onKeyUp(event) {
        this.pressedKeys[event.key.toUpperCase()] = false;
    }

    getCamera() {
        return this.app.getActiveCamera();
    }

    setCamera(camera) {
        this.app.setActiveCamera(camera);
    }

    setState(state) {
        this.settings.state = state;
    }

    handleState() {
        if (this.settings === null) return;
        switch(this.settings.state) {
            case states.start:
                this.setCamera("main");
                this.handleMainMenuButtons();
                break;
            case states.chooseUserBalloon:
                this.setCamera("selectUserBalloon");
                const userBalloonSelected = this.userBalloons.find(bal => bal.selected);
                if (userBalloonSelected) {
                    this.userBalloon = userBalloonSelected;
                    userBalloonSelected.selected = false;
                    this.addUserBalloonToMenu(new THREE.Vector3(-15, 65, 250));
                    this.setState(states.start);
                }
                break;
            case states.chooseOpponentBalloon:
                this.setCamera("selectBotBalloonSelected");
                const botBalloonSelected = this.botBalloons.find(bal => bal.selected);
                if (botBalloonSelected) {
                    this.botBalloon = botBalloonSelected;
                    botBalloonSelected.selected = false;
                    this.addBotBalloonToMenu(new THREE.Vector3(0, 65, 250));
                    this.setState(states.start);
                }
                break;
            case states.playing:
                if (this.elapsedTime >= 1) {
                    this.settings.elapsedTime++;
                    this.updateHUD();
                    this.userBalloon.updateMultipliers();
                    this.elapsedTime = 0;  
                }
                this.verifyEndGame();
                break;
            case states.pause:
                this.setCamera("pause");
                this.handlePauseMenuButtons();
                break;        
            case states.end:
                this.setCamera("end");
                this.endGame();
                this.handleEndMenuButtons();
                break;
            default:
                return;
        }

    }
    updateAnimations(delta) {
        this.animatedObjects.forEach((obj) => obj.update(delta));
        this.fireworks.forEach((firework) => firework.update(delta));
    }
    

    update() {
        const delta = this.clock.getDelta();
        this.updateAnimations(delta);

        // Update the game state
        this.handleState();

        // Update the elapsed time
        this.elapsedTime += delta;    
        
        if (this.hud) this.hud.update(); // Update the HUD (position)
    }
}

export { MyGame };
