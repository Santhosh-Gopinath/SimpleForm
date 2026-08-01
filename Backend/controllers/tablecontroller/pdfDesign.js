// ---------------------------------------------------------------------------
// Design system for the Employee Bio-Data PDF export.
// Colors, small geometry helpers, and reusable draw functions live here so
// tablecontroller.js stays focused on layout/flow instead of drawing details.
// ---------------------------------------------------------------------------

const MARGIN = 40

const COLORS = {
  navy: '#16283D',
  navy2: '#1F3B57',
  teal: '#2FB8A6',
  cardBg: '#FFFFFF',
  border: '#DCE3EA',
  white: '#FFFFFF',
  text: '#1C2833',
  muted: '#8A96A3',
  label: '#5B6B7A',
  shadow: '#C9D2DA',
  line: '#E6EAEE',
  badgeBg: '#EEF2F6',
  barTrack: '#EEF2F6',
  heroMuted: '#8FA0B0',
  heroLine: '#B9C6D3',
  heroDivider: '#33495E',
}

const DEPT_COLORS = {
  Engineering: '#2E86AB',
  HR: '#7B4FA3',
  Sales: '#E08E29',
  Finance: '#2E9E5B',
  Marketing: '#D6598E',
  Operations: '#C99A2E',
  Support: '#1F9E9E',
}
const DEFAULT_DEPT_COLOR = '#7A8894'

const TYPE_COLORS = {
  'Full-time': '#2E9E5B',
  Intern: '#4A90D9',
  Contract: '#E08E29',
}
const DEFAULT_TYPE_COLOR = '#7A8894'

const STATUS_COLORS = {
  Active: '#2E9E5B',
  Resigned: '#9AA0A6',
  'On Leave': '#D9A441',
}
const DEFAULT_STATUS_COLOR = '#9AA0A6'

function deptColor(dept) {
  return DEPT_COLORS[dept] || DEFAULT_DEPT_COLOR
}
function typeColor(type) {
  return TYPE_COLORS[type] || DEFAULT_TYPE_COLOR
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

// ---- low level shape helpers ----

function roundedPanel(doc, x, y, w, h, r, { fill, stroke, lineWidth = 1, shadow = false } = {}) {
  if (shadow) {
    doc.save()
    doc.fillColor(COLORS.shadow).fillOpacity(0.5)
    doc.roundedRect(x + 2, y + 3, w, h, r).fill()
    doc.restore()
  }
  doc.save()
  doc.roundedRect(x, y, w, h, r)
  if (fill && stroke) {
    doc.fillColor(fill).strokeColor(stroke).lineWidth(lineWidth)
    doc.fillAndStroke(fill, stroke)
  } else if (fill) {
    doc.fillColor(fill).fill()
  } else if (stroke) {
    doc.strokeColor(stroke).lineWidth(lineWidth).stroke()
  }
  doc.restore()
}

// Horizontally-centered single line of text, y = top of the text box.
function centerText(doc, text, cx, y, { font = 'Helvetica', size = 10, color = COLORS.text } = {}) {
  doc.font(font).fontSize(size).fillColor(color)
  const w = doc.widthOfString(text)
  doc.text(text, cx - w / 2, y, { lineBreak: false })
  return w
}

// Text whose visual center sits at (cx, cy) - used for avatar initials etc.
function centerTextBoth(doc, text, cx, cy, { font = 'Helvetica-Bold', size = 10, color = COLORS.white } = {}) {
  doc.font(font).fontSize(size).fillColor(color)
  const w = doc.widthOfString(text)
  doc.text(text, cx - w / 2, cy - size / 2, { lineBreak: false })
}

// Small fully-rounded pill (used for the status pill and page counter).
function drawPill(doc, x, y, text, bg, opts = {}) {
  const { fg = COLORS.white, font = 'Helvetica-Bold', size = 7.5, padX = 7, height = 14 } = opts
  doc.font(font).fontSize(size)
  const w = doc.widthOfString(text) + padX * 2
  doc.save()
  doc.fillColor(bg)
  doc.roundedRect(x, y, w, height, height / 2).fill()
  doc.fillColor(fg)
  doc.text(text, x + padX, y + (height - size) / 2 - 1, { lineBreak: false })
  doc.restore()
  return w
}

// Rectangular tag with a subtle left accent block - visually distinct from
// the fully-rounded status pill, used for the department tag on each card.
function drawTag(doc, x, y, text, color, opts = {}) {
  const { fg = COLORS.white, font = 'Helvetica-Bold', size = 7.3, padX = 8, height = 13 } = opts
  doc.font(font).fontSize(size)
  const w = doc.widthOfString(text) + padX * 2 + 8
  doc.save()
  doc.fillColor(color)
  doc.roundedRect(x, y, w, height, 2.5).fill()
  doc.fillColor(COLORS.white).fillOpacity(0.55)
  doc.rect(x, y, 3, height).fill()
  doc.fillOpacity(1)
  doc.fillColor(fg)
  doc.text(text, x + padX + 2, y + (height - size) / 2 - 1, { lineBreak: false })
  doc.restore()
  return w
}

// Faint diagonal brand watermark, repeated on every card page.
function drawWatermark(doc) {
  const cx = doc.page.width / 2
  const cy = doc.page.height / 2
  doc.save()
  doc.fillColor(COLORS.navy2).fillOpacity(0.045)
  doc.font('Helvetica-Bold').fontSize(90)
  doc.rotate(38, { origin: [cx, cy] })
  const text = 'HURRYEP'
  const w = doc.widthOfString(text)
  doc.text(text, cx - w / 2, cy - 45, { lineBreak: false })
  doc.restore()
}

// Slim repeating brand strip at the top of every card page.
function drawSlimHeader(doc, pageWidth) {
  const y = 16
  doc.save()
  doc.fillColor(COLORS.navy)
  doc.rect(MARGIN, y, pageWidth, 16).fill()
  doc.fillColor(COLORS.white).font('Helvetica-Bold').fontSize(8.5)
  doc.text('HURRYEP TECHNOLOGY', MARGIN + 8, y + 4, { lineBreak: false })
  doc.font('Helvetica').fontSize(8)
  const label = 'Employee Records'
  const w = doc.widthOfString(label)
  doc.text(label, MARGIN + pageWidth - 8 - w, y + 4, { lineBreak: false })
  doc.restore()
}

// Footer with a hairline, the generation date, centered page number, and brand.
function drawFooter(doc, pageWidth, pageNum, totalPages) {
  const pageHeight = doc.page.height
  const y = pageHeight - MARGIN + 6
  doc.save()
  doc.strokeColor(COLORS.line).lineWidth(0.6)
  doc.moveTo(MARGIN, y).lineTo(MARGIN + pageWidth, y).stroke()
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8)

  const genLabel = `Generated on ${formatDate(new Date())}`
  doc.text(genLabel, MARGIN, y + 8, { lineBreak: false })

  const pageLabel = `Page ${pageNum} of ${totalPages}`
  const plw = doc.widthOfString(pageLabel)
  doc.text(pageLabel, MARGIN + pageWidth / 2 - plw / 2, y + 8, { lineBreak: false })

  const brand = 'Hurryep Technology'
  const bw = doc.widthOfString(brand)
  doc.text(brand, MARGIN + pageWidth - bw, y + 8, { lineBreak: false })
  doc.restore()
}

module.exports = {
  MARGIN,
  COLORS,
  DEPT_COLORS,
  deptColor,
  typeColor,
  statusColor,
  genderLabel,
  formatDate,
  initials,
  roundedPanel,
  centerText,
  centerTextBoth,
  drawPill,
  drawTag,
  drawWatermark,
  drawSlimHeader,
  drawFooter,
}
