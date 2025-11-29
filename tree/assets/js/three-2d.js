/* tree-2d.js — Fallback or temporary 2D tree */

import { openSkillEditor } from "./ui.js";
import { addSkillToSelector } from "./notes.js";

// Example static nodes (optional)
const demoSkills = ["HTML", "CSS", "Java", "Python", "DSA"];

demoSkills.forEach(addSkillToSelector);

// If you still want SVG nodes clickable, call like below:
document.querySelectorAll(".skill-node").forEach((node) => {
  node.addEventListener("click", () => {
    const skill = node.getAttribute("data-skill");
    openSkillEditor(skill, "");
  });
});
