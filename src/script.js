import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import * as dat from 'dat.gui';
import gsap from 'gsap';

let progressRatio;
// Canvas
const canvas = document.querySelector('.webgl');
const loadingBarElement = document.querySelector('.loading-bar');
//loader
const loadingManager = new THREE.LoadingManager(
	//Loaded
	() => {
		setTimeout(() => {
			if (camera.aspect < 1) {
				gsap.to('.loading-bar-c', 0.2, { opacity: 0, display: 'none' });
				gsap.to(turbine.position, {
					duration: 0.6,
					ease: 'easeInOutQuart',
					x: '0',
				});
			} else {
				gsap.to('.loading-bar-c', 0.2, { opacity: 0, display: 'none' });
				gsap.to(turbine.position, {
					duration: 0.6,
					ease: 'easeInOutQuart',
					x: '-0.5',
				});
			}
		}, 500);
	},
	(itemUrl, itemsLoaded, itemsTotal) => {
		progressRatio = itemsLoaded / itemsTotal;
		let progressNumber = progressRatio * 100;
		loadingBarElement.innerHTML = progressNumber + '%';
	}
);

const gltfLoader = new GLTFLoader(loadingManager);
/**
 * Sizes
 */
const sizes = {};
sizes.width = window.innerWidth;
sizes.height = window.innerHeight;

window.addEventListener('resize', () => {
	// Save sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	//Mobile adjustment
	if (camera.aspect < 1) {
		camera.position.z = 6;
		turbine.position.y = -2;
		truck.position.y = -objectsDistance - 1.3;
		truck.scale.set(0.02, 0.02, 0.02);
	} else {
		camera.position.z = 3;
		turbine.position.y = -1.5;
		truck.position.y = -objectsDistance - 0.8;
		truck.scale.set(0.018, 0.018, 0.018);
	}

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Scene
const scene = new THREE.Scene();
const wireframeMaterial = new THREE.MeshBasicMaterial({
	opacity: 0.1,
	wireframe: true,
	transparent: true,
	color: 0xf9f9f9,
});

/**
 * Environnements
 */

scene.background = null;

/**Update turbine MAterials */
const updateAllMaterials = () => {
	scene.traverse((child) => {
		if (
			child instanceof THREE.Mesh &&
			child.material instanceof THREE.MeshStandardMaterial
		) {
			child.material.needsUpdate = true;
			child.castShadow = true;
			child.receiveShadow = true;
			child.material = wireframeMaterial;
		}
	});
};

let turbine;
let mixer = null;

const objectsDistance = 10;
gltfLoader.load(
	'https://uploads-ssl.webflow.com/628be43857417b0d036b27dc/6300c141f4c9140bdf60ac46_Turbine3D.glb.txt',
	(gltf) => {
		mixer = new THREE.AnimationMixer(gltf.scene);
		const clips = gltf.animations;
		// Play all animations at the same time
		clips.forEach(function (clip) {
			const action = mixer.clipAction(clip);
			action.play();
		});

		scene.add(gltf.scene);
		turbine = gltf.scenes[0].children[0];
		/**Mobile   Adjustment */
		if (camera.aspect < 1) {
			turbine.position.y = -2;
		} else {
			turbine.position.y = -1.5;
		}

		turbine.position.x = 4;
		turbine.rotation.y = -0.8;

		updateAllMaterials();
	}
);
let truck;
let mixer2 = null;

gltfLoader.load(
	'https://uploads-ssl.webflow.com/628be43857417b0d036b27dc/6300c142d7739c6b5ed15c6a_Truck3D%20.glb.txt',
	(gltf) => {
		mixer2 = new THREE.AnimationMixer(gltf.scene);

		const clips = gltf.animations;
		// Play all animations at the same time
		clips.forEach(function (clip) {
			const action = mixer2.clipAction(clip);
			action.play();
		});

		scene.add(gltf.scene);
		truck = gltf.scenes[0].children[0];
		if (camera.aspect < 1) {
			truck.position.y = -objectsDistance - 1.3;
			truck.scale.set(0.02, 0.02, 0.02);
		} else {
			truck.position.y = -objectsDistance - 0.7;
			truck.scale.set(0.018, 0.018, 0.018);
		}

		truck.rotation.y = Math.PI * -0.3;
		truck.position.x = 1;

		updateAllMaterials();
	}
);

/**
 * Lights
 */

const ambientLight = new THREE.AmbientLight('#eee', 6);
scene.add(ambientLight);

// Camera
const camera = new THREE.PerspectiveCamera(
	45,
	sizes.width / sizes.height,
	0.1,
	100
);

/**Mobile  Adjustment */
if (camera.aspect < 1) {
	camera.position.z = 6;
} else {
	camera.position.z = 3;
}
camera.position.x = 0;
camera.position.y = 0;

scene.add(camera);

// Renderer
const renderer = new THREE.WebGLRenderer({
	canvas: canvas,
	antialias: true,
	alpha: true,
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(sizes.width, sizes.height);

/**
 * Scroll
 */

let scrollY = window.scrollY;
window.addEventListener('scroll', () => {
	scrollY = window.scrollY;
});
let mouseX = 0;

/**
 * Loop
 */

const clock = new THREE.Clock();
let previousTime = 0;
const loop = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;
	if (mixer !== null) {
		mixer.update(deltaTime);
	}
	if (mixer2 !== null) {
		mixer2.update(deltaTime);
	}
	// Animate camera
	camera.position.y = (-scrollY / sizes.height) * objectsDistance;
	//animate objects

	// Render
	renderer.render(scene, camera);

	// Keep looping
	window.requestAnimationFrame(loop);
};
loop();

//Scrolify
$(function () {
	let currentIndex = $.scrollify.currentIndex();
	$.scrollify({
		section: '.section',
		interstitialSection: '.section-n',
		easing: 'swing',
		scrollSpeed: 1000,
		updateHash: false,
		before: function (nextIndex) {
			const objectByPage = [turbine, truck];

			const currentObject =
				currentIndex >= 0 && currentIndex < objectByPage.length
					? objectByPage[currentIndex]
					: null;
			const nextObject =
				nextIndex >= 0 && nextIndex < objectByPage.length
					? objectByPage[nextIndex]
					: null;

			if (currentObject !== null) {
				gsap.to(currentObject.position, {
					duration: 1.2,
					ease: 'easeInOutQuart',
					x: '3',
				});
			}
			if (nextObject !== null) {
				setTimeout(() => {
					if (nextObject == truck) {
						gsap.to(nextObject.position, {
							duration: 1,
							ease: 'easeInOutQuart',
							x: '1',
						});
					} else {
						if (camera.aspect < 1) {
							gsap.to(nextObject.position, {
								duration: 1,
								ease: 'easeInOutQuart',
								x: '0',
							});
						} else {
							gsap.to(nextObject.position, {
								duration: 1,
								ease: 'easeInOutQuart',
								x: '-0.5',
							});
						}
					}
				}, 300);
			}

			currentIndex = $.scrollify.currentIndex();
		},
	});
});

// // GUI
// let gui;
// let guiActive;
// guiActive = window.location.hash === '#debug';
// if (guiActive) {
// 	gui = new dat.GUI();
// 	gui.add(turbine.position, 'x').min(-3).max(3).name('turbineX');
// 	gui.add(turbine.position, 'y').min(-3).max(3).name('turbineY');
// 	gui.add(turbine.position, 'z').min(-3).max(3).name('turbineZ');

// 	gui.add(turbine.rotation, 'y').min(-3).max(3).name('turbineY-Rotation');

// 	gui.add(truck.position, 'z').min(-20).max(20).name('truckX');
// 	gui.add(truck.position, 'y').min(-20).max(20).name('truckY');
// 	gui.add(truck.position, 'x').min(-20).max(20).name('truckZ');
// 	gui.add(truck.rotation, 'z').min(-20).max(20).name('Rotation truckZ');
// 	gui.add(truck.rotation, 'y').min(-20).max(20).name('Rotation truckY');
// 	gui.add(truck.rotation, 'x').min(-20).max(20).name('Rotation truckX');
// }
window.addEventListener('pointermove', (event) => {
	// Update the mouse variable

	var deltaX = event.clientX - mouseX;
	rotateObjects(deltaX);
	mouseX = event.clientX;
});

function rotateObjects(deltaX) {
	turbine.rotation.y += deltaX / 3000;
	truck.rotation.y += deltaX / 5000;
}
