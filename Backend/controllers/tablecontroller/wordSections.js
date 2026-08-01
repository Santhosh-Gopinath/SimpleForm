const {
  Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, VerticalAlign, HeadingLevel,
  COLORS, deptColor, statusColor, genderLabel, formatDate, initials,
  NO_BORDER, NO_BORDERS, shadedCell, badgeParagraph, tagRun, proportionalBar,
} = require('./wordDesign')

const CARD_BORDER = {
  style: BorderStyle.SINGLE, size: 4, color: COLORS.border,
}
const HAIRLINE = { style: BorderStyle.SINGLE, size: 4, color: COLORS.line }

function center(children, opts = {}) {
  return new Paragraph({ alignment: AlignmentType.CENTER, children, ...opts })
}

// ===========================================================================
// COVER PAGE
// Returns an array of Paragraph/Table blocks to push into the document body.
// ===========================================================================
function buildCoverPage({ totalCount, maleCount, femaleCount, deptCounts, contentWidth }) {
  const blocks = []

  // ---- hero (navy banner as a single shaded cell) ----
  const heroChildren = [
    center([new TextRun({ text: 'H', color: COLORS.white, bold: true, size: 32 })], { spacing: { before: 160, after: 80 } }),
    center([new TextRun({ text: 'HURRYEP TECHNOLOGY', color: COLORS.white, bold: true, size: 34 })], { spacing: { after: 60 } }),
    center([new TextRun({ text: 'Employee Records Report', color: COLORS.heroLine, size: 20 })], { spacing: { after: 60 } }),
    center([new TextRun({ text: `Generated on ${formatDate(new Date())}`, color: COLORS.heroMuted, italics: true, size: 15 })], { spacing: { after: 160 } }),
  ]

  const statSegW = Math.floor(contentWidth / 3)
  const statsRow = new Table({
    width: { size: contentWidth, type: WidthType.DXA },
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          ['TOTAL EMPLOYEES', totalCount],
          ['MALE', maleCount],
          ['FEMALE', femaleCount],
        ].map(([label, val]) =>
          shadedCell({
            width: statSegW,
            fill: COLORS.navy,
            children: [
              center([new TextRun({ text: String(val), color: COLORS.white, bold: true, size: 40 })]),
              center([new TextRun({ text: label, color: COLORS.heroMuted, bold: true, size: 14 })]),
            ],
          })
        ),
      }),
    ],
  })

  blocks.push(
    new Table({
      width: { size: contentWidth, type: WidthType.DXA },
      borders: NO_BORDERS,
      rows: [
        new TableRow({ children: [shadedCell({ width: contentWidth, fill: COLORS.navy, children: heroChildren })] }),
        new TableRow({ children: [shadedCell({ width: contentWidth, fill: COLORS.navy, children: [statsRow], margins: { top: 0, bottom: 200, left: 0, right: 0 } })] }),
      ],
    })
  )

  blocks.push(new Paragraph({ spacing: { after: 200 }, children: [] }))

  // ---- department breakdown panel ----
  blocks.push(new Paragraph({
    spacing: { after: 40 },
    children: [new TextRun({ text: 'Department Breakdown', bold: true, size: 26, color: COLORS.text })],
  }))
  blocks.push(new Paragraph({
    border: { bottom: { ...HAIRLINE, space: 6 } },
    spacing: { after: 160 },
    children: [new TextRun({
      text: `Headcount distribution across ${deptCounts.length} department${deptCounts.length === 1 ? '' : 's'} \u00b7 ${totalCount} total employees`,
      color: COLORS.muted, size: 15,
    })],
  }))

  const nameW = Math.round(contentWidth * 0.22)
  const countW = Math.round(contentWidth * 0.10)
  const pctW = Math.round(contentWidth * 0.14)
  const barW = contentWidth - nameW - countW - pctW
  const maxCount = Math.max(...deptCounts.map((d) => d[1]), 1)

  // Each department is its own single-row table (name | bar | count | pct) so
  // the bar sits inline with its row instead of being stacked separately.
  const deptRows = deptCounts.map(([dept, count]) => {
    const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0
    const color = deptColor(dept)
    return new TableRow({
      children: [
        shadedCell({
          width: nameW,
          children: [new Paragraph({ children: [
            new TextRun({ text: '\u25CF ', color, bold: true, size: 15 }),
            new TextRun({ text: dept, bold: true, size: 18, color: COLORS.text }),
          ] })],
        }),
        shadedCell({ width: barW, children: [proportionalBar(barW, count / maxCount, color)] }),
        shadedCell({ width: countW, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: String(count), bold: true, size: 18, color: COLORS.text })] })] }),
        shadedCell({ width: pctW, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${pct}%`, size: 15, color: COLORS.muted })] })] }),
      ],
    })
  })

  blocks.push(new Table({
    width: { size: contentWidth, type: WidthType.DXA },
    borders: NO_BORDERS,
    rows: deptRows,
  }))

  blocks.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 300 },
    children: [new TextRun({ text: 'Confidential \u2014 Internal HR Use Only', italics: true, size: 15, color: COLORS.heroMuted })],
  }))

  return blocks
}

// ===========================================================================
// EMPLOYEE CARD
// ===========================================================================
function kvRow(leftLabel, leftVal, rightLabel, rightVal, colW) {
  const cell = (label, val) => shadedCell({
    width: colW,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: label
      ? [
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: String(label).toUpperCase(), bold: true, size: 13, color: COLORS.label })] }),
          new Paragraph({ children: [new TextRun({ text: val === undefined || val === null || val === '' ? '\u2014' : String(val), size: 19, color: COLORS.text })] }),
        ]
      : [new Paragraph('')],
  })
  return new TableRow({ children: [cell(leftLabel, leftVal), cell(rightLabel, rightVal)] })
}

function buildEmployeeCard(record, index, totalCount, contentWidth) {
  const dColor = deptColor(record.department)
  const sColor = statusColor(record.employmentStatus)
  const innerWidth = contentWidth - 240 // wrapper cell's left+right margins
  const avatarW = Math.round(innerWidth * 0.09)
  const nameW = innerWidth - avatarW - Math.round(innerWidth * 0.22)
  const badgeW = innerWidth - avatarW - nameW

  const counterText = `${String(index).padStart(2, '0')} / ${String(totalCount).padStart(2, '0')}`

  // ---- header row: avatar | name/designation/tag | status + counter ----
  const headerRow = new TableRow({
    children: [
      shadedCell({
        width: avatarW, fill: dColor, verticalAlign: VerticalAlign.CENTER,
        children: [center([new TextRun({ text: initials(record.name), color: COLORS.white, bold: true, size: 24 })])],
      }),
      shadedCell({
        width: nameW,
        children: [
          new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: record.name || '\u2014', bold: true, size: 24, color: COLORS.text })] }),
          new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: record.designation || '\u2014', size: 17, color: COLORS.muted })] }),
          new Paragraph({ children: [tagRun(record.department || 'Unspecified', dColor)] }),
        ],
      }),
      shadedCell({
        width: badgeW, verticalAlign: VerticalAlign.TOP,
        children: [
          badgeParagraph(record.employmentStatus || 'Active', { bg: sColor, align: AlignmentType.RIGHT }),
          badgeParagraph(counterText, { bg: COLORS.badgeBg, fg: COLORS.navy2, align: AlignmentType.RIGHT }),
        ],
      }),
    ],
  })

  const headerTable = new Table({
    width: { size: innerWidth, type: WidthType.DXA },
    borders: NO_BORDERS,
    rows: [headerRow],
  })

  // ---- body: two-column label/value grid ----
  const colW = Math.floor(innerWidth / 2) - 100
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
  const bodyRows = leftFields.map((lf, i) => kvRow(lf[0], lf[1], rightFields[i][0], rightFields[i][1], colW))
  const bodyTable = new Table({
    width: { size: innerWidth, type: WidthType.DXA },
    borders: NO_BORDERS,
    rows: bodyRows,
  })

  const dividerPara = new Paragraph({
    border: { bottom: { ...HAIRLINE, space: 4 } },
    spacing: { before: 100, after: 100 },
    children: [],
  })

  // ---- whole card wrapped in a single bordered cell so it reads as one panel ----
  return new Table({
    width: { size: contentWidth, type: WidthType.DXA },
    borders: NO_BORDERS,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: contentWidth, type: WidthType.DXA },
            borders: { top: CARD_BORDER, bottom: CARD_BORDER, left: CARD_BORDER, right: CARD_BORDER, insideHorizontal: NO_BORDER, insideVertical: NO_BORDER },
            margins: { top: 160, bottom: 160, left: 120, right: 120 },
            children: [headerTable, dividerPara, bodyTable],
          }),
        ],
      }),
    ],
  })
}

module.exports = { buildCoverPage, buildEmployeeCard }
