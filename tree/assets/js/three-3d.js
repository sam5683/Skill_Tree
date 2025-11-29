/* tree-3d.js — Glowing 3D Skill Tree */

import { openSkillEditor } from "./ui.js";
import { addSkillToSelector } from "./notes.js";

const container = document.getElementById("treeCanvasContainer");

// Scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x00141c, 10, 50);

// Camera
const camera = new THREE.PerspectiveCamera(
  60,
  container.clientWidth / container.clientHeight,
  0.1,
  100
);
camera.position.set(0, 5, 12);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(devicePixelRatio);
container.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Create tree
function createTree() {
  const group = new THREE.Group();

  // trunk
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.55, 4.5, 12);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x00ffd6, emissive: 0x004c3f });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2;
  group.add(trunk);

  // glowing nodes
  const nodeGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0x00ffea,
    emissive: 0x006c66,
    emissiveIntensity: 1,
  });

  const positions = [
    { pos: [-2, 4.2, 0], name: "HTML" },
    { pos: [2, 4.6, -1], name: "CSS" },
    { pos: [-1, 5.3, 1], name: "Java" },
    { pos: [1.5, 4.8, 1], name: "Python" },
    { pos: [0, 6, 0], name: "DSA" },
  ];

  positions.forEach((entry) => {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    node.position.set(...entry.pos);
    node.skillName = entry.name;

    node.cursor = "pointer";

    // click event
    node.onClick = () => {
      openSkillEditor(entry.name, "");
    };

    addSkillToSelector(entry.name);
    group.add(node);
  });

  scene.add(group);
}

// Raycaster for interaction
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function handleClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.length) {
    const obj = intersects[0].object;
    if (obj.onClick) obj.onClick();
  }
}

renderer.domElement.addEventListener("click", handleClick);

// Lights
const light = new THREE.PointLight(0x00ffe6, 1.8);
light.position.set(0, 7, 10);
scene.add(light);

// Animation
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

createTree();
animate();

// Resize handler
window.addEventListener("resize", () => {
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
});
