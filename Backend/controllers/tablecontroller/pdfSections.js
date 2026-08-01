const {
  MARGIN,
  COLORS,
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
} = require('./pdfDesign')

// ===========================================================================
// COVER PAGE
// Navy hero banner (brand + headline stats) followed by a white
// "Department Breakdown" panel with a real proportional bar per department.
// ===========================================================================
function drawCoverPage(doc, { totalCount, maleCount, femaleCount, deptCounts }) {
  const pageWidth = doc.page.width - 2 * MARGIN
  const pageHeight = doc.page.height
  const cx = doc.page.width / 2

  // ---- hero ----
  const heroH = 260
  doc.save()
  doc.fillColor(COLORS.navy).rect(0, 0, doc.page.width, heroH).fill()
  doc.restore()

  doc.save()
  doc.fillColor(COLORS.teal).fillOpacity(0.16)
  doc.circle(doc.page.width + 10, -10, 170).fill()
  doc.restore()

  // logo mark
  const logoCy = 58
  doc.save()
  doc.strokeColor(COLORS.teal).lineWidth(1.6)
  doc.circle(cx, logoCy, 24).stroke()
  doc.restore()
  centerTextBoth(doc, 'H', cx, logoCy, { font: 'Helvetica-Bold', size: 18, color: COLORS.white })

  centerText(doc, 'HURRYEP TECHNOLOGY', cx, 96, { font: 'Helvetica-Bold', size: 23, color: COLORS.white })
  centerText(doc, 'Employee Records Report', cx, 124, { font: 'Helvetica', size: 12, color: COLORS.heroLine })

  doc.save()
  doc.strokeColor(COLORS.teal).lineWidth(1.3)
  doc.moveTo(cx - 22, 146).lineTo(cx + 22, 146).stroke()
  doc.restore()

  centerText(doc, `Generated on ${formatDate(new Date())}`, cx, 156, { font: 'Helvetica', size: 8.5, color: COLORS.heroMuted })

  // ---- stats row ----
  const statY = 190
  const stats = [
    ['TOTAL EMPLOYEES', String(totalCount)],
    ['MALE', String(maleCount)],
    ['FEMALE', String(femaleCount)],
  ]
  const segW = (pageWidth - 60) / 3
  const startX = MARGIN + 30
  stats.forEach(([label, val], i) => {
    const sx = startX + i * segW
    centerText(doc, val, sx, statY, { font: 'Helvetica-Bold', size: 26, color: COLORS.white })
    centerText(doc, label, sx, statY + 32, { font: 'Helvetica-Bold', size: 8, color: COLORS.heroMuted })
    if (i < 2) {
      doc.save()
      doc.strokeColor(COLORS.heroDivider).lineWidth(1)
      const lx = startX + segW * (i + 0.5)
      doc.moveTo(lx, statY - 18).lineTo(lx, statY + 12).stroke()
      doc.restore()
    }
  })

  // ---- department breakdown panel ----
  const panelY = heroH + 20
  const panelBottomGap = 66
  const panelH = pageHeight - panelY - panelBottomGap
  roundedPanel(doc, MARGIN, panelY, pageWidth, panelH, 12, { fill: COLORS.cardBg, stroke: COLORS.border, lineWidth: 1, shadow: true })

  const pad = 26
  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13)
  doc.text('Department Breakdown', MARGIN + pad, panelY + 22, { lineBreak: false })
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8.7)
  doc.text(
    `Headcount distribution across ${deptCounts.length} department${deptCounts.length === 1 ? '' : 's'} \u00b7 ${totalCount} total employees`,
    MARGIN + pad, panelY + 38, { lineBreak: false }
  )

  doc.save()
  doc.strokeColor(COLORS.line).lineWidth(0.8)
  doc.moveTo(MARGIN + pad, panelY + 52).lineTo(MARGIN + pageWidth - pad, panelY + 52).stroke()
  doc.restore()

  const rowsTop = panelY + 62
  const rowsAvailable = panelH - 62 - 14
  const rowH = Math.max(18, Math.min(30, rowsAvailable / Math.max(deptCounts.length, 1)))
  const nameW = 110
  const countW = 74
  const barX = MARGIN + pad + nameW
  const barRight = MARGIN + pageWidth - pad - countW
  const barWMax = barRight - barX
  const maxCount = Math.max(...deptCounts.map((d) => d[1]), 1)

  deptCounts.forEach(([dept, count], i) => {
    const ry = rowsTop + i * rowH
    const color = deptColor(dept)

    doc.save()
    doc.fillColor(color).circle(MARGIN + pad + 4, ry + 4, 3.4).fill()
    doc.restore()
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(9)
    doc.text(dept, MARGIN + pad + 14, ry, { width: nameW - 16, lineBreak: false, ellipsis: true })

    const bw = barWMax * (count / maxCount)
    roundedPanel(doc, barX, ry, barWMax, 9, 4.5, { fill: COLORS.barTrack })
    if (bw > 0) roundedPanel(doc, barX, ry, Math.max(bw, 9), 9, 4.5, { fill: color })

    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(9)
    doc.text(String(count), MARGIN + pageWidth - pad - countW, ry, { width: countW, align: 'right', lineBreak: false })
    doc.fillColor(COLORS.muted).font('Helvetica').fontSize(7.6)
    doc.text(`${pct}% of total`, MARGIN + pageWidth - pad - countW, ry + 11, { width: countW, align: 'right', lineBreak: false })
  })

  centerText(doc, 'Confidential \u2014 Internal HR Use Only', cx, pageHeight - 34, {
    font: 'Helvetica-Oblique', size: 8.5, color: COLORS.heroMuted,
  })
}

// ===========================================================================
// EMPLOYEE CARD
// ===========================================================================
const PAD_L = 20
const HEAD_H = 54
const ROW_GAP = 32
const BODY_ROWS = 7

function cardHeight() {
  return HEAD_H + BODY_ROWS * ROW_GAP + 20
}

function kv(doc, x, y, label, value) {
  if (!label) return
  doc.fillColor(COLORS.label).font('Helvetica-Bold').fontSize(7.3)
  doc.text(String(label).toUpperCase(), x, y, { lineBreak: false })
  doc.fillColor(COLORS.text).font('Helvetica').fontSize(9.7)
  doc.text(value === undefined || value === null || value === '' ? '\u2014' : String(value), x, y + 12, {
    width: 230, lineBreak: false, ellipsis: true,
  })
}

function drawCard(doc, x, y, record, index, totalCount, contentWidth) {
  const h = cardHeight()
  roundedPanel(doc, x, y, contentWidth, h, 9, { fill: COLORS.cardBg, stroke: COLORS.border, lineWidth: 1.3, shadow: true })

  const headBottom = y + HEAD_H
  const dColor = deptColor(record.department)
  const sColor = statusColor(record.employmentStatus)

  const avR = 17
  const avCx = x + PAD_L + avR
  const avCy = y + HEAD_H / 2
  doc.save()
  doc.fillColor(dColor).circle(avCx, avCy, avR).fill()
  doc.restore()
  centerTextBoth(doc, initials(record.name), avCx, avCy, { font: 'Helvetica-Bold', size: 12, color: COLORS.white })

  const tx = avCx + avR + 12
  doc.fillColor(COLORS.text).font('Helvetica-Bold').fontSize(13)
  doc.text(record.name || '\u2014', tx, avCy - 15, { width: 220, lineBreak: false, ellipsis: true })
  doc.fillColor(COLORS.muted).font('Helvetica').fontSize(8.7)
  doc.text(record.designation || '\u2014', tx, avCy - 1, { width: 220, lineBreak: false, ellipsis: true })
  drawTag(doc, tx, avCy + 11, record.department || 'Unspecified', dColor, { size: 7.3, height: 13 })

  const counterText = `${String(index).padStart(2, '0')} / ${String(totalCount).padStart(2, '0')}`
  const counterW = doc.font('Helvetica-Bold').fontSize(7.5).widthOfString(counterText) + 14
  const counterX = x + contentWidth - counterW - 14
  drawPill(doc, counterX, avCy - 7, counterText, COLORS.badgeBg, { fg: COLORS.navy2 })

  const statusText = record.employmentStatus || 'Active'
  const statusW = doc.font('Helvetica-Bold').fontSize(7.5).widthOfString(statusText) + 14
  drawPill(doc, counterX - statusW - 6, avCy - 7, statusText, sColor)

  doc.save()
  doc.strokeColor(COLORS.line).lineWidth(0.8)
  doc.moveTo(x + 10, headBottom).lineTo(x + contentWidth - 10, headBottom).stroke()
  doc.restore()

  const colGap = 18
  const colW = (contentWidth - PAD_L - 14 - colGap) / 2
  const lcolX = x + PAD_L
  const rcolX = lcolX + colW + colGap
  const midX = lcolX + colW + colGap / 2

  doc.save()
  doc.strokeColor(COLORS.line).lineWidth(0.7)
  doc.moveTo(midX, headBottom + 8).lineTo(midX, y + h - 10).stroke()
  doc.restore()

  const leftFields = [
    ['Email', record.email],
    ['Phone', record.phone],
    ['Date of Birth', record.dob],
    ['Gender', genderLabel(record.gender)],
    ['Blood Group', record.bloodGroup],
    ['Emergency Contact', record.emergencyContact],
    ['Address', record.address],
  ]
  const rightFields = [
    ['Employee ID', record.employeeId],
    ['Date of Joining', record.dateOfJoining],
    ['Employment Type', record.employmentType],
    ['Reporting Manager', record.reportingManager],
    ['Qualification', record.qualification],
    ['', ''],
    ['', ''],
  ]

  let yy = headBottom + 24
  for (let i = 0; i < leftFields.length; i++) {
    kv(doc, lcolX, yy, leftFields[i][0], leftFields[i][1])
    kv(doc, rcolX, yy, rightFields[i][0], rightFields[i][1])
    yy += ROW_GAP
  }

  return y + h
}

module.exports = { drawCoverPage, drawCard, cardHeight }
