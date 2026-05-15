/**
 * patch_ui.js  — Batch UI fix: compact fonts, remove avatar bubbles, proportional CTAs
 * Run from: frontend/   →  node patch_ui.js
 */
const fs = require('fs');

// ─────────────────────────────────────────────────────────────────────
//  GENERIC REGEX REPLACEMENTS applied to every file
// ─────────────────────────────────────────────────────────────────────
const GLOBAL_RULES = [

  // ── 1. Stat card value font 28px → 22px ─────────────────────────────
  { re: /fontSize:\s*["']28px["']/g,   val: "fontSize: '22px'" },

  // ── 2. Table cell / row padding: reduce 22-28px → 14-18px ───────────
  { re: /padding:\s*["']22px\s+24px["']/g,  val: "padding: '14px 18px'" },
  { re: /padding:\s*["']28px["']/g,          val: "padding: '18px'" },

  // ── 3. Section / content padding 28px → 20px ────────────────────────
  { re: /padding:\s*["']28px["'](?=,\s*overflowY)/g, val: "padding: '20px'" },

  // ── 4. Header font 22px → 18px ───────────────────────────────────────
  { re: /fontSize:\s*["']22px["']/g,   val: "fontSize: '18px'" },

  // ── 5. Topbar/sub font 15px → 13.5px ─────────────────────────────────
  { re: /fontSize:\s*["']15px["']/g,   val: "fontSize: '13.5px'" },

  // ── 6. Common label font 13px → 12px ─────────────────────────────────
  // (be conservative — only in specific contexts: color:#64748b or fontWeight)
  // We'll do this per-file in targeted patches below

  // ── 7. Large row padding: 18px 24px / 16px 24px / 14px 24px → 10px 16px
  { re: /padding:\s*["']18px\s+24px["']/g,  val: "padding: '10px 16px'" },
  { re: /padding:\s*["']16px\s+24px["']/g,  val: "padding: '10px 16px'" },
  { re: /padding:\s*["']14px\s+24px["']/g,  val: "padding: '10px 16px'" },
  { re: /padding:\s*["']13px\s+24px["']/g,  val: "padding: '9px 16px'" },

  // ── 8. Stat card inner padding 22px 24px ─────────────────────────────
  // Already covered above (22px 24px)

  // ── 9. Topbar padding 0 28px → 0 20px ────────────────────────────────
  { re: /padding:\s*["']0\s+28px["']/g,     val: "padding: '0 20px'" },

  // ── 10. Modal padding 28px → 22px ────────────────────────────────────
  // leave modal alone — they look fine

  // ── 11. Button padding 9px 18px → 7px 14px ───────────────────────────
  { re: /padding:\s*["']9px\s+18px["']/g,   val: "padding: '7px 14px'" },
  { re: /padding:\s*["']8px\s+16px["']/g,   val: "padding: '6px 12px'" },
  { re: /padding:\s*["']7px\s+16px["']/g,   val: "padding: '6px 12px'" },

  // ── 12. Search / filter box width 220px → 170px ──────────────────────
  { re: /width:\s*["']220px["']/g,           val: "width: '170px'" },
  { re: /minWidth:\s*["']200px["']/g,        val: "minWidth: '150px'" },
];

// ─────────────────────────────────────────────────────────────────────
//  PER-FILE avatar bubble removal patterns
// ─────────────────────────────────────────────────────────────────────
// Each entry: { file, patches: [{from, to}] }
// We use string.replace(from, to) — from can be a regex or string
const FILE_PATCHES = [

  // ──────────── DashboardHR ─────────────────────────────────────────────
  {
    file: 'src/pages/HR/DashboardHR.jsx',
    patches: [
      // Stat card padding
      { from: /padding:\s*"22px 24px"/g, to: 'padding: "14px 18px"' },
      // Table row avatar (name col with 32/34/36px circle)
      {
        from: /<div style=\{\{\s*width:\s*['"]3[2-6]px['"],\s*height:\s*['"]3[2-6]px['"],\s*borderRadius:\s*['"]50%['"],[^}]+\}\}>[^<]*\{[^}]+\.slice\(0,\s*2\)[^}]*\}\s*<\/div>/g,
        to: ''
      },
    ]
  },

  // ──────────── CandidateHR ─────────────────────────────────────────────
  {
    file: 'src/pages/HR/CandidateHR.jsx',
    patches: [
      // Remove table avatar bubbles - large (36-40px)
      {
        from: /<div style=\{\{\s*width:\s*['"](?:36|38|40|42)px['"],\s*height:\s*['"](?:36|38|40|42)px['"],\s*borderRadius:\s*['"]50%['"],[^}]+\}\}>[^<]*\{[^}]+\.slice\(0,\s*2\)[^}]*\}\s*<\/div>/gs,
        to: ''
      },
      // Remove smaller avatar bubbles (32-35px)
      {
        from: /<div style=\{\{\s*width:\s*['"](?:32|33|34|35)px['"],\s*height:\s*['"](?:32|33|34|35)px['"],\s*borderRadius:\s*['"]50%['"],[^}]+\}\}>[^<]*\{[^}]+\.slice\(0,\s*2\)[^}]*\}\s*<\/div>/gs,
        to: ''
      },
    ]
  },

  // ──────────── AssignMentor ────────────────────────────────────────────
  {
    file: 'src/pages/HR/AssignMentor.jsx',
    patches: [
      {
        from: /<div style=\{\{\s*width:\s*['"](?:32|33|34|35|36|38|40)px['"],\s*height:\s*['"](?:32|33|34|35|36|38|40)px['"],\s*borderRadius:\s*['"]50%['"],[^}]+\}\}>[^<]*\{[^}]+\.slice\(0,\s*2\)[^}]*\}\s*<\/div>/gs,
        to: ''
      },
    ]
  },

  // ──────────── GenerateLOA ─────────────────────────────────────────────
  {
    file: 'src/pages/HR/GenerateLOA.jsx',
    patches: [
      {
        from: /<div style=\{\{\s*width:\s*['"](?:32|34|36|38|40)px['"],\s*height:\s*['"](?:32|34|36|38|40)px['"],\s*borderRadius:\s*['"]50%['"],[^}]+\}\}>[^<]*\{[^}]+\.slice\(0,\s*2\)[^}]*\}\s*<\/div>/gs,
        to: ''
      },
    ]
  },

  // ──────────── DashboardMentor ────────────────────────────────────────
  {
    file: 'src/pages/Mentor/DashboardMentor.jsx',
    patches: [
      // Shrink search box width
      { from: /width:\s*"220px"/g, to: 'width: "160px"' },
      // Tab button font + padding
      { from: /padding:\s*"6px 20px"/g, to: 'padding: "5px 14px"' },
      { from: /fontSize:\s*"13px",\s*fontWeight:\s*600,\s*fontFamily:\s*"inherit"/g, to: 'fontSize: "12px", fontWeight: 600, fontFamily: "inherit"' },
      // Stat value 28px
      { from: /fontSize:\s*"28px",\s*fontWeight:\s*"800"/g, to: 'fontSize: "22px", fontWeight: "800"' },
      // card header label
      { from: /fontSize:\s*"15px",\s*fontWeight:\s*700,\s*color:\s*"#0f172a"/g, to: 'fontSize: "13.5px", fontWeight: 700, color: "#0f172a"' },
      // topbar padding
      { from: /padding:\s*"14px 28px"/g, to: 'padding: "10px 20px"' },
      // content padding
      { from: /padding:\s*"28px",\s*flex:\s*1,\s*overflowY:\s*"auto"/g, to: 'padding: "18px", flex: 1, overflowY: "auto"' },
      // export button
      { from: /height:\s*"34px"(?=[^}]*padding:\s*"7px 14px")/g, to: 'height: "30px"' },
      { from: /padding:\s*"7px 14px",\s*background:\s*"#fff"/g, to: 'padding: "5px 12px", background: "#fff"' },
      // search box height
      { from: /height:\s*"34px"(?=[^}]*width:\s*"(220|160)px")/g, to: 'height: "30px"' },
      { from: /padding:\s*"7px 14px",\s*width:\s*"(220|160)px"/g, to: 'padding: "5px 10px", width: "160px"' },
    ]
  },

  // ──────────── AssignTasksMentor ───────────────────────────────────────
  {
    file: 'src/pages/Mentor/AssignTasksMentor.jsx',
    patches: [
      { from: /fontSize:\s*['"]22px['"]/g, to: "fontSize: '18px'" },
      { from: /padding:\s*['"]28px['"]/g,  to: "padding: '18px'" },
      { from: /padding:\s*['"]18px 24px['"]/g, to: "padding: '10px 16px'" },
    ]
  },

  // ──────────── CertificateMentor ──────────────────────────────────────
  {
    file: 'src/pages/Mentor/CertificateMentor.jsx',
    patches: [
      { from: /fontSize:\s*['"]22px['"]/g, to: "fontSize: '18px'" },
      { from: /padding:\s*['"]28px['"]/g,  to: "padding: '18px'" },
    ]
  },
];

// ─────────────────────────────────────────────────────────────────────
//  Execute
// ─────────────────────────────────────────────────────────────────────
let totalChanged = 0;

FILE_PATCHES.forEach(({ file, patches }) => {
  if (!fs.existsSync(file)) { console.log(`SKIP (not found): ${file}`); return; }
  let code = fs.readFileSync(file, 'utf8');
  const orig = code;

  // Apply global rules first
  GLOBAL_RULES.forEach(({ re, val }) => { code = code.replace(re, val); });

  // Apply per-file patches
  patches.forEach(({ from, to }) => { code = code.replace(from, to); });

  if (code !== orig) {
    fs.writeFileSync(file, code, 'utf8');
    totalChanged++;
    console.log(`✓ patched: ${file}`);
  } else {
    console.log(`  (no change): ${file}`);
  }
});

console.log(`\nDone. ${totalChanged} files patched.`);
