import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Buttons from './buttons';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
const Planet = () => {




    const [asteroidCount, setAsteroidCount] = useState(0);
    const containerRef = useRef(null);
    const asteroids = [];
    const sceneRef = useRef(null);
    const asteroidsRef = useRef([]);
    const asteroidModelRef = useRef(null);
    const createAsteroidRef = useRef(null);
    const removeAsteroidRef = useRef(null);
    const removeAllAsteroidsRef = useRef(null);
    const logCount = useRef(null)
    useEffect(() => {
    const scene = new THREE.Scene();


    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 200; // spread across a large area
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.2,
        sizeAttenuation: true, // stars farther away appear smaller
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);


    sceneRef.current = scene;
    const asteroidLoader = new GLTFLoader();
    let asteroidModel;
    asteroidLoader.load('/Planet/Asteroid.glb', (gltf) => {
        asteroidModelRef.current = gltf.scene;
        const scale = 0.05 + Math.random() * 0.1;
        asteroidModelRef.current.position.set(3, 0, 0);
        asteroidModelRef.current.scale.set(scale, scale, scale);
    });
    
    createAsteroidRef.current = () => {
        if (!asteroidModelRef.current) return;

        const asteroid = asteroidModelRef.current.clone();

        const angle = Math.random() * Math.PI * 2;
        const radius = 1.5 + Math.random() * 0.5;

        asteroid.userData.angle = angle;
        asteroid.userData.radius = radius;

        const position = new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );

        position.applyEuler(new THREE.Euler(
            THREE.MathUtils.degToRad(110),
            THREE.MathUtils.degToRad(10),
            0
        ));

        asteroid.position.copy(position);
        asteroid.position.y += 0.8;
        const scale = 0.05 + Math.random() * 0.1;
        asteroid.scale.set(scale, scale, scale);

        scene.add(asteroid);
        asteroidsRef.current.push(asteroid);
    };
    removeAsteroidRef.current = () => {
        if (asteroidsRef.current.length === 0) return;

        // take the last asteroid from the array
        const asteroid = asteroidsRef.current.pop();  // removes from ref array
        asteroids.pop();                               // removes from local array
        scene.remove(asteroid);                        // removes from scene

        // dispose geometry and materials to free memory
        asteroid.traverse((child) => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        
    };
    removeAllAsteroidsRef.current = () => {
        for(const asteroid of asteroidsRef.current) {
            if (asteroidsRef.current.length === 0) return;
            scene.remove(asteroid);                        // removes from scene

            // dispose geometry and materials to free memory
            asteroid.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });
            
        }
        asteroidsRef.current = [];
        
    }

    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    let obj;
    let ring;
    const loader = new OBJLoader();

    

    loader.load('/Planet/violetplanet/planet2.obj', function (loadedObj, loadedRing) {
    obj = loadedObj;
    ring = loadedRing;

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/Planet/violetplanet/planet2.png');

    obj.traverse(function (child) {
        if (child.isMesh) {
            child.material = new THREE.MeshBasicMaterial({
                map: texture
            });
        }
    });

    obj.scale.set(0.01, 0.01, 0.01);
    obj.rotation.x = THREE.MathUtils.degToRad(30);

    scene.add(obj);
    const geometry = new THREE.RingGeometry(1.5, 2, 34);
    const material = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        transparent: true,
        opacity: 0.5,
    side: THREE.DoubleSide
    });

    ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = THREE.MathUtils.degToRad(110);
    ring.rotation.y = THREE.MathUtils.degToRad(10);
    ring.position.set(0, 0.8, 0.4);
    scene.add(ring);
    
    const box = new THREE.Box3().setFromObject(obj);
    console.log('size:', box.getSize(new THREE.Vector3()).toArray());

    const light = new THREE.AmbientLight(0xffffff, 2);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

}, undefined, function (error) {
    console.error(error);
});

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    containerRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;      // smooth feel
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.maxDistance = 20; // can't zoom out past this
    controls.minDistance = 2;  // can't zoom in too close either
    function animate() {
        if (obj) {
            obj.rotation.y += 0.005;
        }

        if (ring) {
            ring.rotation.z -= 0.005;
        }
        asteroidsRef.current.forEach((asteroid) => {
            asteroid.userData.angle += 0.01;

            const angle = asteroid.userData.angle;
            const radius = asteroid.userData.radius;

            const position = new THREE.Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius,
                0
            );

            position.applyEuler(new THREE.Euler(
                THREE.MathUtils.degToRad(110),
                THREE.MathUtils.degToRad(10),
                0
            ));

            position.add(new THREE.Vector3(0, 0.8, 0));

            asteroid.position.copy(position);

            // власне обертання
            asteroid.rotation.x += 0.01;
            asteroid.rotation.y += 0.01;
        });
        controls.update(); // add this line at the top
        if (obj) obj.rotation.y += 0.005;
        if (ring) ring.rotation.z -= 0.005;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }

    animate();

    return () => {
        renderer.dispose();
        renderer.domElement.remove();
    };
    }, []);
    const addAsteroid = () => {
        setAsteroidCount(prev => prev + 1);

        if (createAsteroidRef.current) {
            createAsteroidRef.current();
        }
    };
    const removeAsteroid = () => {
        if (asteroidCount <= 0) return;
        setAsteroidCount(prev => prev - 1);

        if (removeAsteroidRef.current) {
            removeAsteroidRef.current();
        }
    };
    const removeAllAsteroids = () => {
        if (asteroidCount <= 0) return;
        setAsteroidCount(0);

        if (removeAllAsteroidsRef.current) {
            removeAllAsteroidsRef.current();
        }
    };
    return <div ref={containerRef}>
        <Buttons
            count={asteroidCount}
            increase={addAsteroid}
            decrease={removeAsteroid}
            reset={removeAllAsteroids}
        />
    </div>;
};

export default Planet;