/**
 * Pro Presentations - PPTX Generator
 *
 * Creates professional PowerPoint presentations using pptxgenjs.
 * Uses a dark modern design system with colored accents.
 *
 * Usage:
 *   node create_pptx.js slides.json
 *
 * The slides.json file defines the presentation structure.
 * See README or examples for the JSON format.
 */

const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

// ============================================
// DESIGN SYSTEM
// ============================================

const COLORS = {
  bgSurface: "1a1f2e",
  bgCard: "2d3548",
  bgDark: "1f2937",
  accentRed: "e63946",
  accentGreen: "2ecc71",
  accentGreenDark: "27ae60",
  accentOrange: "f59e0b",
  accentBlue: "3b82f6",
  textPrimary: "ffffff",
  textSecondary: "a8b2c1",
  textMuted: "6b7280",
  textDark: "4a5568",
};

const FONT = "Arial";

// ============================================
// SLIDE BUILDERS
// ============================================

function addTitleSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgSurface };

  // Eyebrow
  if (data.eyebrow) {
    slide.addText(data.eyebrow.toUpperCase(), {
      x: 1.5, y: 1.8, w: 7, h: 0.4,
      fontSize: 11, color: COLORS.accentRed, fontFace: FONT,
      align: "center", charSpacing: 3,
    });
  }

  // Title
  slide.addText(data.title, {
    x: 1, y: 2.2, w: 8, h: 1,
    fontSize: 36, color: COLORS.textPrimary, fontFace: FONT,
    align: "center", bold: true,
  });

  // Divider line
  slide.addShape(pptx.ShapeType.rect, {
    x: 4.4, y: 3.3, w: 1.2, h: 0.04,
    fill: { color: COLORS.accentRed },
    line: { type: "none" },
  });

  // Subtitle
  if (data.subtitle) {
    slide.addText(data.subtitle, {
      x: 1.5, y: 3.5, w: 7, h: 0.8,
      fontSize: 16, color: COLORS.textSecondary, fontFace: FONT,
      align: "center",
    });
  }

  // Footer
  if (data.footer) {
    slide.addText(data.footer, {
      x: 2, y: 6.8, w: 6, h: 0.4,
      fontSize: 11, color: COLORS.textDark, fontFace: FONT,
      align: "center",
    });
  }
}

function addContentSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgSurface };

  // Eyebrow
  if (data.eyebrow) {
    slide.addText(data.eyebrow.toUpperCase(), {
      x: 0.5, y: 0.3, w: 9, h: 0.3,
      fontSize: 10, color: data.eyebrowColor || COLORS.accentGreen, fontFace: FONT,
      charSpacing: 2,
    });
  }

  // Title
  slide.addText(data.title, {
    x: 0.5, y: 0.55, w: 9, h: 0.5,
    fontSize: 24, color: COLORS.textPrimary, fontFace: FONT,
    bold: true,
  });

  // Bullet points
  if (data.bullets) {
    const bulletText = data.bullets.map(b => ({
      text: b.text || b,
      options: {
        fontSize: 12,
        color: COLORS.textPrimary,
        bullet: { type: "bullet", color: b.color || COLORS.textSecondary },
        paraSpaceAfter: 6,
      }
    }));
    slide.addText(bulletText, {
      x: 0.5, y: 1.2, w: 9, h: 5,
      fontFace: FONT, valign: "top",
    });
  }

  // Cards
  if (data.cards) {
    const cardHeight = Math.min(1.2, 4.5 / data.cards.length);
    data.cards.forEach((card, i) => {
      const y = 1.2 + i * (cardHeight + 0.15);
      // Card background
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5, y, w: 9, h: cardHeight,
        fill: { color: COLORS.bgCard },
        rectRadius: 0.05,
        line: { type: "none" },
      });
      // Left border accent
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.5, y, w: 0.04, h: cardHeight,
        fill: { color: card.color || COLORS.accentGreen },
        line: { type: "none" },
      });
      // Card label
      if (card.label) {
        slide.addText(card.label.toUpperCase(), {
          x: 0.7, y: y + 0.1, w: 8.5, h: 0.3,
          fontSize: 10, color: card.color || COLORS.accentGreen, fontFace: FONT,
          bold: true,
        });
      }
      // Card text
      slide.addText(card.text, {
        x: 0.7, y: y + 0.35, w: 8.5, h: cardHeight - 0.45,
        fontSize: 12, color: COLORS.textPrimary, fontFace: FONT,
        valign: "top",
      });
    });
  }

  // Footer bar
  if (data.conclusion) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 6.5, w: 9, h: 0.5,
      fill: { color: COLORS.bgDark },
      rectRadius: 0.05,
      line: { type: "none" },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 6.5, w: 0.05, h: 0.5,
      fill: { color: COLORS.accentGreen },
      line: { type: "none" },
    });
    slide.addText([
      { text: "Conclusion: ", options: { bold: true, color: COLORS.accentGreen } },
      { text: data.conclusion, options: { color: COLORS.textPrimary } },
    ], {
      x: 0.7, y: 6.5, w: 8.6, h: 0.5,
      fontSize: 12, fontFace: FONT, align: "center", valign: "middle",
    });
  }
}

function addComparisonSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgSurface };

  // Eyebrow + Title
  if (data.eyebrow) {
    slide.addText(data.eyebrow.toUpperCase(), {
      x: 0.5, y: 0.3, w: 9, h: 0.3,
      fontSize: 10, color: COLORS.accentOrange, fontFace: FONT, charSpacing: 2,
    });
  }
  slide.addText(data.title, {
    x: 0.5, y: 0.55, w: 9, h: 0.5,
    fontSize: 24, color: COLORS.textPrimary, fontFace: FONT, bold: true,
  });

  // Option A (left - bad)
  const optA = data.optionA || {};
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.5, y: 1.2, w: 4.3, h: 4.5,
    fill: { color: COLORS.bgCard }, rectRadius: 0.05,
    line: { color: COLORS.accentRed, width: 2 },
  });
  slide.addText(optA.label || "OPTION A", {
    x: 0.7, y: 1.4, w: 3.9, h: 0.3,
    fontSize: 11, color: COLORS.accentRed, fontFace: FONT, bold: true,
  });
  slide.addText(optA.value || "", {
    x: 0.7, y: 1.8, w: 3.9, h: 0.5,
    fontSize: 22, color: COLORS.accentRed, fontFace: FONT, bold: true,
  });
  if (optA.bullets) {
    const bulletText = optA.bullets.map(b => ({
      text: b, options: { fontSize: 10, color: COLORS.textSecondary, bullet: true, paraSpaceAfter: 4 }
    }));
    slide.addText(bulletText, {
      x: 0.7, y: 2.4, w: 3.9, h: 3, fontFace: FONT, valign: "top",
    });
  }

  // Option B (right - good)
  const optB = data.optionB || {};
  slide.addShape(pptx.ShapeType.rect, {
    x: 5.2, y: 1.2, w: 4.3, h: 4.5,
    fill: { color: COLORS.bgCard }, rectRadius: 0.05,
    line: { color: COLORS.accentGreen, width: 2 },
  });
  slide.addText(optB.label || "OPTION B", {
    x: 5.4, y: 1.4, w: 3.9, h: 0.3,
    fontSize: 11, color: COLORS.accentGreen, fontFace: FONT, bold: true,
  });
  slide.addText(optB.value || "", {
    x: 5.4, y: 1.8, w: 3.9, h: 0.5,
    fontSize: 22, color: COLORS.accentGreen, fontFace: FONT, bold: true,
  });
  if (optB.bullets) {
    const bulletText = optB.bullets.map(b => ({
      text: b, options: { fontSize: 10, color: COLORS.textSecondary, bullet: true, paraSpaceAfter: 4 }
    }));
    slide.addText(bulletText, {
      x: 5.4, y: 2.4, w: 3.9, h: 3, fontFace: FONT, valign: "top",
    });
  }

  // Conclusion bar
  if (data.conclusion) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 6.0, w: 9, h: 0.5,
      fill: { color: COLORS.bgDark }, rectRadius: 0.05, line: { type: "none" },
    });
    slide.addText([
      { text: "Conclusion: ", options: { bold: true, color: COLORS.accentGreen } },
      { text: data.conclusion, options: { color: COLORS.textPrimary } },
    ], {
      x: 0.7, y: 6.0, w: 8.6, h: 0.5,
      fontSize: 12, fontFace: FONT, align: "center", valign: "middle",
    });
  }
}

function addConclusionSlide(pptx, data) {
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.bgSurface };

  // Eyebrow + Title
  slide.addText("CONCLUSION", {
    x: 0.6, y: 0.4, w: 8.8, h: 0.3,
    fontSize: 11, color: COLORS.accentGreen, fontFace: FONT, charSpacing: 2,
  });
  slide.addText(data.title, {
    x: 0.6, y: 0.7, w: 8.8, h: 0.6,
    fontSize: 28, color: COLORS.textPrimary, fontFace: FONT, bold: true,
  });

  // Key points
  if (data.points) {
    data.points.forEach((point, i) => {
      const y = 1.5 + i * 1.1;
      slide.addShape(pptx.ShapeType.rect, {
        x: 0.6, y, w: 5, h: 0.9,
        fill: { color: COLORS.bgCard }, rectRadius: 0.05, line: { type: "none" },
      });
      slide.addText(point.label || "", {
        x: 0.8, y: y + 0.05, w: 4.6, h: 0.3,
        fontSize: 10, color: point.color || COLORS.accentGreen, fontFace: FONT, bold: true,
      });
      slide.addText(point.text || "", {
        x: 0.8, y: y + 0.35, w: 4.6, h: 0.5,
        fontSize: 12, color: COLORS.textPrimary, fontFace: FONT,
      });
    });
  }

  // CTA box (right side)
  if (data.cta) {
    slide.addShape(pptx.ShapeType.rect, {
      x: 6, y: 1.5, w: 3.6, h: 4.5,
      fill: { color: COLORS.accentGreen }, rectRadius: 0.08, line: { type: "none" },
    });
    slide.addText(data.cta.label || "NEXT STEPS", {
      x: 6.2, y: 1.7, w: 3.2, h: 0.3,
      fontSize: 12, color: "ffffff", fontFace: FONT, bold: false,
    });
    slide.addText(data.cta.text || "", {
      x: 6.2, y: 2.1, w: 3.2, h: 3.6,
      fontSize: 14, color: "ffffff", fontFace: FONT, valign: "top",
    });
  }
}

// ============================================
// MAIN
// ============================================

async function createPresentation() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Usage: node create_pptx.js <slides.json>");
    console.error("");
    console.error("slides.json format:");
    console.error(JSON.stringify({
      title: "Presentation Title",
      author: "Author",
      output: "output.pptx",
      slides: [
        { type: "title", title: "...", subtitle: "...", eyebrow: "...", footer: "..." },
        { type: "content", title: "...", eyebrow: "...", cards: [{ label: "...", text: "...", color: "..." }] },
        { type: "comparison", title: "...", optionA: {}, optionB: {}, conclusion: "..." },
        { type: "conclusion", title: "...", points: [], cta: {} },
      ]
    }, null, 2));
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(inputFile, "utf8"));
  const pptx = new pptxgen();

  pptx.layout = "LAYOUT_16x9";
  pptx.title = config.title || "Presentation";
  pptx.author = config.author || "";
  pptx.subject = config.subject || "";

  for (const slideData of config.slides) {
    switch (slideData.type) {
      case "title":
        addTitleSlide(pptx, slideData);
        break;
      case "content":
        addContentSlide(pptx, slideData);
        break;
      case "comparison":
        addComparisonSlide(pptx, slideData);
        break;
      case "conclusion":
        addConclusionSlide(pptx, slideData);
        break;
      default:
        // Default to content slide
        addContentSlide(pptx, slideData);
    }
    console.log(`+ Added: ${slideData.type} - ${slideData.title || "(untitled)"}`);
  }

  const outputFile = config.output || "presentation.pptx";
  const outputPath = path.resolve(path.dirname(inputFile), outputFile);
  await pptx.writeFile({ fileName: outputPath });
  console.log(`\nSaved: ${outputPath}`);
}

createPresentation().catch(err => {
  console.error("Failed:", err.message);
  process.exit(1);
});
