import { setTier, test } from '../framework/runner.js';
import {
  assert,
  assertEquals,
  assertContains,
} from '../framework/assert.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

setTier('Tier 1: Feature Coverage');

test('[F25-1] Constitution AGENTS.md integrity and Rule 0 presence', () => {
  const agentsMdPath = path.join(rootDir, 'AGENTS.md');
  assert(fs.existsSync(agentsMdPath), 'AGENTS.md must exist in root');
  const content = fs.readFileSync(agentsMdPath, 'utf-8');
  assertContains(content, 'RULE 0', 'Must contain RULE 0');
  assertContains(content, 'PRE-EXECUTION CHECKLIST', 'Must contain Pre-Execution Checklist');
  assertContains(content, 'POST-EXECUTION AUDIT PROTOCOL', 'Must contain Post-Execution Protocol');
  assertContains(content, 'getVndFromWon', 'Must mention Single Source of Truth for prices');
});

test('[F25-2] Anti-fragmentation: Legacy files eliminated', () => {
  assert(!fs.existsSync(path.join(rootDir, 'GEMINI.md')), 'GEMINI.md duplicate in root must be eliminated');
  assert(!fs.existsSync(path.join(rootDir, 'CLAUDE.md')), 'CLAUDE.md legacy in root must be eliminated');
  assert(!fs.existsSync(path.join(rootDir, '.claude')), '.claude/ legacy directory must be eliminated');
  assert(!fs.existsSync(path.join(rootDir, '.agent')), '.agent/ singular must be migrated to .agents/');
});

test('[F25-3] Modular technical rules in .agents/rules/', () => {
  const rules = [
    'ecommerce-guardrails.md',
    'deployment-parity.md',
    'qc-quality-gate.md',
    'korean-scraper-integrity.md',
  ];
  for (const r of rules) {
    const p = path.join(rootDir, '.agents', 'rules', r);
    assert(fs.existsSync(p), `Modular rule ${r} must exist`);
    assert(fs.statSync(p).size > 200, `Modular rule ${r} must have content`);
  }
});

test('[F25-4] Complete 8-subagents registry in .agents/subagents/', () => {
  const manifestPath = path.join(rootDir, '.agents', 'subagents', 'manifest.json');
  assert(fs.existsSync(manifestPath), 'manifest.json must exist');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assertEquals(manifest.total_subagents, 8, 'Must declare exactly 8 subagents');
  assertEquals(manifest.subagents.length, 8, 'Must contain 8 subagent records');

  const expectedIds = [
    'task-planner',
    'ui-ux-artisan',
    'fullstack-developer',
    'firebase-backend-specialist',
    'security-auditor',
    'qc-gatekeeper',
    'korean-scraper-specialist',
    'devops-deployment-engineer',
  ];

  for (const id of expectedIds) {
    const specPath = path.join(rootDir, '.agents', 'subagents', `${id}.json`);
    assert(fs.existsSync(specPath), `Spec file for ${id} must exist`);
    const spec = JSON.parse(fs.readFileSync(specPath, 'utf-8'));
    assertEquals(spec.id, id, `Spec id matches ${id}`);
    assert(spec.system_prompt.length > 50, `Spec ${id} must have non-empty system prompt`);
  }
});

test('[F25-5] All 8 on-demand skills in .agents/skills/ with valid frontmatter', () => {
  const expectedSkills = [
    'task-planner',
    'ui-ux-artisan',
    'fullstack-developer',
    'firebase-backend-specialist',
    'security-auditor',
    'qc-gatekeeper',
    'korean-scraper-specialist',
    'devops-deployment-engineer',
  ];

  for (const s of expectedSkills) {
    const skillPath = path.join(rootDir, '.agents', 'skills', s, 'SKILL.md');
    assert(fs.existsSync(skillPath), `SKILL.md for ${s} must exist`);
    const content = fs.readFileSync(skillPath, 'utf-8');
    assert(content.startsWith('---'), `Skill ${s} must start with YAML frontmatter`);
    assertContains(content, `name: ${s}`, `Skill frontmatter must include name: ${s}`);
    assertContains(content, 'description:', `Skill frontmatter must include description`);
  }
});
