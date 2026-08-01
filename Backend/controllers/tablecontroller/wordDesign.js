// ---------------------------------------------------------------------------
// Design system for the Employee Bio-Data WORD export.
// Mirrors pdfDesign.js so the .docx output stays visually consistent with
// the .pdf export. Word has no free-form vector drawing, so shapes like the
// avatar circle / status pill / department tag are approximated with shaded
// table cells and text runs instead of true circles / rounded rects.
// ---------------------------------------------------------------------------

const {
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  BorderStyle,
  AlignmentType,
  VerticalAlign,
  HeadingLevel,
} = require('docx')

const COLORS = {
  navy: '16283D',
  navy2: '1F3B57',
  teal: '2FB8A6',
  cardBg: 'FFFFFF',
  border: 'DCE3EA',
  white: 'FFFFFF',
  text: '1C2833',
  muted: '8A96A3',
  label: '5B6B7A',
  line: 'E6EAEE',
  badgeBg: 'EEF2F6',
  barTrack: 'EEF2F6',
  heroMuted: '8FA0B0',
  heroLine: 'B9C6D3',
}

const DEPT_COLORS = {
  Engineering: '2E86AB',
  HR: '7B4FA3',
  Sales: 'E08E29',
  Finance: '2E9E5B',
  Marketing: 'D6598E',
  Operations: 'C99A2E',
  Support: '1F9E9E',
}
const DEFAULT_DEPT_COLOR = '7A8894'

const STATUS_COLORS = {
  Active: '2E9E5B',
  Resigned: '9AA0A6',
  'On Leave': 'D9A441',
}
const DEFAULT_STATUS_COLOR = '9AA0A6'

function deptColor(dept) {
  return DEPT_COLORS[dept] || DEFAULT_DEPT_COLOR
}
function statusColor(status) {
  return STATUS_COLORS[status] || DEFAULT_STATUS_COLOR
}

function genderLabel(value) {
  if (value === 'male') return 'Male'
  if (value === 'female') return 'Female'
  if (value === 'other') return 'Other'
  return value || '\u2014'
}

function formatDate(d) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

// ---- no-border helper (used constantly for "layout" tables) ----
const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }
const NO_BORDERS = {
  top: NO_BORDER, bottom: NO_BORDER, left: NO_BORDER, right: NO_BORDER,
  insideHorizontal: NO_BORDER, insideVertical: NO_BORDER,
}

function shadedCell({
  children,
  width,
  fill,
  verticalAlign = VerticalAlign.CENTER,
  borders = NO_BORDERS,
  margins = { top: 40, bottom: 40, left: 60, right: 60 },
}) {
  return new TableCell({
    children,
    width: width ? { size: width, type: WidthType.DXA } : undefined,
    shading: fill ? { type: ShadingType.CLEAR, color: 'auto', fill } : undefined,
    verticalAlign,
    borders,
    margins,
  })
}

// Small "pill" badge (status / counter) — colored background, white bold text,
// no true rounding available in Word so it renders as a soft rectangle.
function badgeParagraph(text, { bg, fg = COLORS.white, size = 15, bold = true, align = AlignmentType.CENTER } = {}) {
  return new Paragraph({
    alignment: align,
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: bg },
    spacing: { before: 20, after: 20 },
    children: [new TextRun({ text, color: fg, bold, size })],
  })
}

// Department tag — same idea as the PDF's drawTag, rendered as a shaded run.
function tagRun(text, color) {
  return new TextRun({
    text: `  ${text}  `,
    color: COLORS.white,
    bold: true,
    size: 15,
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: color },
  })
}

// Proportional horizontal bar for the department-breakdown panel: a 1-row,
// 2-cell table where the first cell's width encodes the value.
function proportionalBar(totalWidthDXA, fraction, color, trackColor = COLORS.barTrack) {
  const filled = Math.max(Math.round(totalWidthDXA * fraction), fraction > 0 ? 40 : 0)
  const rest = Math.max(totalWidthDXA - filled, 0)
  const row = [
    shadedCell({ children: [new Paragraph('')], width: filled, fill: color, margins: { top: 30, bottom: 30, left: 0, right: 0 } }),
  ]
  if (rest > 0) {
    row.push(shadedCell({ children: [new Paragraph('')], width: rest, fill: trackColor, margins: { top: 30, bottom: 30, left: 0, right: 0 } }))
  }
  return new Table({
    width: { size: totalWidthDXA, type: WidthType.DXA },
    borders: NO_BORDERS,
    rows: [new TableRow({ children: row })],
  })
}

module.exports = {
  COLORS,
  DEPT_COLORS,
  deptColor,
  statusColor,
  genderLabel,
  formatDate,
  initials,
  NO_BORDER,
  NO_BORDERS,
  shadedCell,
  badgeParagraph,
  tagRun,
  proportionalBar,
  // re-export docx primitives so wordSections.js only needs one require
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, VerticalAlign, HeadingLevel,
}
