/**
 * scripts/verify_agent_system.js
 * Automated Quality & Integrity Verification for Antigravity 2.0 Agent System.
 * Verifies rules, skills, subagents, and ensures zero duplication/drift.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;
const results = [];

function check(name, fn) {
  try {
    const res = fn();
    if (res === false) {
      results.push({ status: "FAIL", name, error: "Assertion returned false" });
      failed++;
    } else {
      results.push({ status: "PASS", name });
      passed++;
    }
  } catch (err) {
    results.push({ status: "FAIL", name, error: err.message });
    failed++;
  }
}

console.log("================================================================================");
console.log("  ANTIGRAVITY 2.0 AGENT SYSTEM INTEGRITY VERIFICATION");
console.log("================================================================================");

// 1. Root AGENTS.md Constitution Checks
check("[CONSTITUTION-01] Root AGENTS.md exists and is non-empty", () => {
  const p = path.join(rootDir, "AGENTS.md");
  return fs.existsSync(p) && fs.statSync(p).size > 1000;
});

check("[CONSTITUTION-02] AGENTS.md contains Rule 0 (Zero Mock & Absolute Honesty)", () => {
  const content = fs.readFileSync(path.join(rootDir, "AGENTS.md"), "utf8");
  return content.includes("RULE 0") && content.includes("Zero Fake / Mock Data");
});

check("[CONSTITUTION-03] AGENTS.md contains Pre-Execution DO/DON'T Checklist", () => {
  const content = fs.readFileSync(path.join(rootDir, "AGENTS.md"), "utf8");
  return content.includes("PRE-EXECUTION CHECKLIST") && content.includes("Single Source of Truth") && content.includes("CẤM Dữ Liệu Ảo");
});

check("[CONSTITUTION-04] AGENTS.md contains Post-Execution Audit Protocol", () => {
  const content = fs.readFileSync(path.join(rootDir, "AGENTS.md"), "utf8");
  return content.includes("POST-EXECUTION AUDIT PROTOCOL") && content.includes("303/303 PASS");
});

// 2. Anti-Fragmentation & Deduplication Checks
check("[DEDUP-01] Legacy root GEMINI.md is eliminated (no double context injection)", () => {
  return !fs.existsSync(path.join(rootDir, "GEMINI.md"));
});

check("[DEDUP-02] Legacy CLAUDE.md is eliminated", () => {
  return !fs.existsSync(path.join(rootDir, "CLAUDE.md"));
});

check("[DEDUP-03] Legacy .claude/ folder is eliminated", () => {
  return !fs.existsSync(path.join(rootDir, ".claude"));
});

check("[DEDUP-04] Legacy .agent/ singular folder is migrated to .agents/", () => {
  return !fs.existsSync(path.join(rootDir, ".agent")) && fs.existsSync(path.join(rootDir, ".agents"));
});

// 3. Modular Rules Checks (.agents/rules/)
const expectedRules = [
  "ecommerce-guardrails.md",
  "deployment-parity.md",
  "qc-quality-gate.md",
  "korean-scraper-integrity.md"
];

for (const r of expectedRules) {
  check(`[RULES-${r}] Modular rule file ${r} exists and is structured`, () => {
    const p = path.join(rootDir, ".agents", "rules", r);
    return fs.existsSync(p) && fs.statSync(p).size > 200;
  });
}

// 4. Subagent Registry Checks (.agents/subagents/)
check("[SUBAGENTS-01] Manifest file exists and is valid JSON", () => {
  const manifestPath = path.join(rootDir, ".agents", "subagents", "manifest.json");
  if (!fs.existsSync(manifestPath)) return false;
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  return manifest.total_subagents === 8 && Array.isArray(manifest.subagents) && manifest.subagents.length === 8;
});

const expectedSubagents = [
  "task-planner",
  "ui-ux-artisan",
  "fullstack-developer",
  "firebase-backend-specialist",
  "security-auditor",
  "qc-gatekeeper",
  "korean-scraper-specialist",
  "devops-deployment-engineer"
];

for (const subId of expectedSubagents) {
  check(`[SUBAGENTS-${subId}] Subagent spec ${subId}.json exists with complete definition`, () => {
    const p = path.join(rootDir, ".agents", "subagents", `${subId}.json`);
    if (!fs.existsSync(p)) return false;
    const spec = JSON.parse(fs.readFileSync(p, "utf8"));
    return spec.id === subId && spec.name && spec.system_prompt && spec.system_prompt.length > 50 && spec.tools;
  });
}

// 5. Skills Checks (.agents/skills/)
for (const skillId of expectedSubagents) {
  check(`[SKILLS-${skillId}] Skill ${skillId}/SKILL.md exists with valid frontmatter`, () => {
    const p = path.join(rootDir, ".agents", "skills", skillId, "SKILL.md");
    if (!fs.existsSync(p)) return false;
    const content = fs.readFileSync(p, "utf8");
    const hasFrontmatter = content.startsWith("---") && content.includes(`name: ${skillId}`) && content.includes("description:");
    return hasFrontmatter && content.length > 300;
  });
}

// Summary Reporting
console.log("");
for (const r of results) {
  const badge = r.status === "PASS" ? " PASS " : " FAIL ";
  const detail = r.error ? ` (${r.error})` : "";
  console.log(`  [${badge}] ${r.name}${detail}`);
}

console.log("================================================================================");
console.log(`  TOTAL CHECKS : ${passed + failed}`);
console.log(`  PASSED       : ${passed}`);
console.log(`  FAILED       : ${failed}`);
console.log(`  STATUS       : ${failed === 0 ? "SUCCESS (Exit Code 0)" : "FAILED (Exit Code 1)"}`);
console.log("================================================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
