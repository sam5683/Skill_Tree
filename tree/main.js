import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.153.0/build/three.module.js';

// Initialize scene with a cosmic background
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0f1f); // Deep space black

// Create camera with dynamic aspect ratio
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 8); // Increased Z to see the tree better
camera.lookAt(0, 2, 0);

// Set up renderer with high-quality settings
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('treeCanvas'),
  antialias: true,
  alpha: true // Allow transparent background
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

// 🌳 Create a mystical stem with glowing texture
const stemGeometry = new THREE.CylinderGeometry(0.25, 0.25, 4, 32);
const stemMaterial = new THREE.MeshStandardMaterial({
  color: 0x4a3c2e, // Earthy brown
  emissive: 0x1a2a3f, // Subtle glow
  emissiveIntensity: 0.3,
  metalness: 0.4,
  roughness: 0.5
});
const stem = new THREE.Mesh(stemGeometry, stemMaterial);
stem.position.y = 2;
stem.castShadow = true;
stem.receiveShadow = true;
scene.add(stem);

// 🌿 Create two curved branches with a magical twist
const branchGeometry = new THREE.CylinderGeometry(0.15, 0.15, 2, 24);
const branchMaterial = new THREE.MeshStandardMaterial({
  color: 0x3b2e1f, // Darker wood tone
  emissive: 0x2d4060, // Mystic blue glow
  emissiveIntensity: 0.4,
  metalness: 0.3,
  roughness: 0.6
});

const branchLeft = new THREE.Mesh(branchGeometry, branchMaterial);
branchLeft.position.set(-1.2, 3.5, 0);
branchLeft.rotation.z = 0.6;
branchLeft.castShadow = true;
scene.add(branchLeft);

const branchRight = new THREE.Mesh(branchGeometry, branchMaterial);
branchRight.position.set(1.2, 3.5, 0);
branchRight.rotation.z = -0.6;
branchRight.castShadow = true;
scene.add(branchRight);

// 🍃 Create two glowing nodes/leaves with Loki-series vibe
const nodeGeometry = new THREE.DodecahedronGeometry(0.3, 2); // Cosmic shape
const nodeMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ffcc, // Vibrant cyan
  emissive: 0x00cc99, // Glowing teal
  emissiveIntensity: 0.8,
  transparent: true,
  opacity: 0.9
});

const node1 = new THREE.Mesh(nodeGeometry, nodeMaterial);
node1.position.set(-1.8, 4.5, 0);
node1.castShadow = true;
scene.add(node1);

const node2 = new THREE.Mesh(nodeGeometry, nodeMaterial);
node2.position.set(1.8, 4.5, 0);
node2.castShadow = true;
scene.add(node2);

// 💡 Add cosmic lighting with dynamic effects
const pointLight = new THREE.PointLight(0xffffff, 1.5, 20);
pointLight.position.set(5, 5, 5);
pointLight.castShadow = true;
scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0x202040, 1.2); // Dim purple ambient
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0x00ffcc, 0.7);
directionalLight.position.set(0, 10, 0);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 📸 Animation loop with blinking effect
let blinkIntensity = 0;
let isIncreasing = true;

function animate() {
  requestAnimationFrame(animate);

  // Gentle rotation for natural movement
  stem.rotation.y += 0.0015;
  branchLeft.rotation.y += 0.002;
  branchRight.rotation.y += 0.002;
  node1.rotation.y += 0.004;
  node2.rotation.y += 0.004;

  // Camera orbit for a centered view
  const time = Date.now() * 0.0003;
  camera.position.x = Math.sin(time) * 6;
  camera.position.z = Math.cos(time) * 8; // Adjusted for better centering
  camera.lookAt(0, 2, 0);

  // Blinking effect inspired by Loki series
  if (isIncreasing) {
    blinkIntensity += 0.01;
    if (blinkIntensity >= 1) isIncreasing = false;
  } else {
    blinkIntensity -= 0.01;
    if (blinkIntensity <= 0.3) isIncreasing = true;
  }
  nodeMaterial.emissiveIntensity = blinkIntensity;
  nodeMaterial.opacity = 0.7 + blinkIntensity * 0.2;

  renderer.render(scene, camera);
}

// Handle window resize for responsiveness
window.addEventListener('resize', () => {
  const canvas = document.getElementById('treeCanvas');
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  canvas.height = window.innerHeight - (window.innerWidth <= 768 ? 48 : 64); // Adjust for header
});

// Start animation
animate();n