import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import katex from 'katex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const FILES_CONFIG = [
  {
    relPath: 'exam_notes/area_a/history_of_architecture.md',
    area: 'Area A',
    topic: 'History of Architecture',
    topicSlug: 'history',
    idPrefix: 'area-a_history',
  },
  {
    relPath: 'exam_notes/area_a/theory_of_architecture.md',
    area: 'Area A',
    topic: 'Theory of Architecture',
    topicSlug: 'theory',
    idPrefix: 'area-a_theory',
  },
  {
    relPath: 'exam_notes/area_a/professional_practice.md',
    area: 'Area A',
    topic: 'Professional Practice',
    topicSlug: 'practice',
    idPrefix: 'area-a_practice',
  },
  {
    relPath: 'exam_notes/area_b/architectural_structures.md',
    area: 'Area B',
    topic: 'Architectural Structures',
    topicSlug: 'structures',
    idPrefix: 'area-b_structures',
  },
  {
    relPath: 'exam_notes/area_b/building_technology.md',
    area: 'Area B',
    topic: 'Building Technology',
    topicSlug: 'technology',
    idPrefix: 'area-b_technology',
  },
  {
    relPath: 'exam_notes/area_b/building_utilities.md',
    area: 'Area B',
    topic: 'Building Utilities',
    topicSlug: 'utilities',
    idPrefix: 'area-b_utilities',
  },
  {
    relPath: 'exam_notes/area_b/construction_methods.md',
    area: 'Area B',
    topic: 'Construction Methods',
    topicSlug: 'methods',
    idPrefix: 'area-b_methods',
  },
];

/**
 * Clean up markdown-escaped LaTeX artifacts (like \(f'\_c\) -> \(f'_c\))
 * while preserving all valid LaTeX syntax ($...$, $$...$$, \(...\), \[...\]).
 */
function normalizeMathAndText(text) {
  if (!text) return '';
  let cleaned = text;

  // Fix known typo in theory_of_architecture.md Q54 where closing $ after 85% was omitted
  cleaned = cleaned.replace(/\$85%\s+and\s+indoor\s+air\s+velocity\s+is\s+\$/g, '$85\\%$ and indoor air velocity is $');

  // Convert \( ... \) to $ ... $ and \[ ... \] to $$ ... $$, escaping any literal $ inside them
  cleaned = cleaned.replace(/\\\(([\s\S]*?)\\\)/g, (match, inner) => {
    const safeInner = inner.replace(/(?<!\\)\$/g, '\\$');
    return `$${safeInner}$`;
  });
  cleaned = cleaned.replace(/\\\[([\s\S]*?)\\\]/g, (match, inner) => {
    const safeInner = inner.replace(/(?<!\\)\$/g, '\\$');
    return `$$${safeInner}$$`;
  });

  // Clean up markdown-escaped underscores (\_) and unescaped percent signs (%) inside $$...$$ and $...$
  cleaned = cleaned.replace(/(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$|(?<!\\)\$([\s\S]*?)(?<!\\)\$/g, (match, blockInner, inlineInner) => {
    const isBlock = blockInner !== undefined;
    let inner = isBlock ? blockInner : inlineInner;
    inner = inner.replace(/\\_/g, '_');
    // Escape unescaped % signs in LaTeX math mode
    inner = inner.replace(/(?<!\\)%/g, '\\%');
    return isBlock ? `$$${inner}$$` : `$${inner}$`;
  });

  return cleaned.trim();
}

function parseMarkdownFile(config) {
  const fullPath = path.join(ROOT_DIR, config.relPath);
  const rawContent = fs.readFileSync(fullPath, 'utf-8').replace(/\r\n/g, '\n');

  // Split by horizontal rules `---` on their own line
  const rawBlocks = rawContent.split(/\n---+\n/);
  const parsedQuestions = [];

  for (const rawBlock of rawBlocks) {
    const lines = rawBlock
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    // Filter out PART headers and italic focus lines
    const contentLines = lines.filter((line) => {
      if (/^#{2,3}\s+PART\s+\d+/i.test(line)) return false;
      if (/^_Focus:/i.test(line) || /^_Core architectural/i.test(line) || /^_Structural/i.test(line) || /^_Complex/i.test(line) || /^_Integration/i.test(line) || /^_[A-Z][^_]+_$/.test(line)) {
        // Only skip standalone italic section description lines that appear right after PART headers
        if (!line.includes('A.') && !line.includes('B.') && !line.includes('Correct Answer')) {
          return false;
        }
      }
      return true;
    });

    if (contentLines.length === 0) continue;

    // Check if this block actually has a question and Correct Answer
    const hasCorrectAnswer = contentLines.some((l) => /\*\*Correct Answer:\*\*/i.test(l));
    if (!hasCorrectAnswer) continue;

    let visualReference = null;
    let questionNumber = null;
    const stemParts = [];
    const optionMap = {};
    let currentOptionKey = null;
    let correctAnswer = null;
    let rationale = '';
    let inRationale = false;

    for (let i = 0; i < contentLines.length; i++) {
      let line = contentLines[i];

      // 1. Check for Visual Reference anywhere in the line
      const visualMatch = line.match(/(⚠️\s*\[VISUAL REFERENCE REQUIRED:[\s\S]*?\])/);
      if (visualMatch) {
        visualReference = visualMatch[1].trim();
        // Remove the visual reference from the line so we can still parse question number if attached
        line = line.replace(visualMatch[1], '').trim();
      }

      if (!line) continue;

      // 2. Check for Correct Answer line
      const correctMatch = line.match(/^(?:-\s*)?\*\*Correct Answer:\*\*\s*([A-D])\b/i);
      if (correctMatch) {
        correctAnswer = correctMatch[1].toUpperCase();
        currentOptionKey = null;
        inRationale = false;
        continue;
      }

      // 3. Check for Technical Rationale line
      const rationaleMatch = line.match(/^(?:-\s*)?\*\*Technical Rationale:\*\*\s*([\s\S]*)$/i);
      if (rationaleMatch) {
        rationale = rationaleMatch[1].trim();
        currentOptionKey = null;
        inRationale = true;
        continue;
      }

      if (inRationale) {
        rationale += ' ' + line;
        continue;
      }

      // 4. Check for Question Header:
      // Variants:
      // "### 1. Question text..."
      // "#### 1. Question text..."
      // "### 1."
      // "### Question 1"
      const headerMatch1 = line.match(/^#{3,4}\s+Question\s+(\d+)\s*(.*)$/i);
      const headerMatch2 = line.match(/^#{3,4}\s+(\d+)\.\s*(.*)$/);
      if (headerMatch1) {
        questionNumber = parseInt(headerMatch1[1], 10);
        line = headerMatch1[2].trim();
        if (!line) continue;
      } else if (headerMatch2) {
        questionNumber = parseInt(headerMatch2[1], 10);
        line = headerMatch2[2].trim();
        if (!line) continue;
      }

      // 5. Check if line is an Option line: `A. ...` or `- A. ...`
      const optionLineMatch = line.match(/^(?:-\s*)?([A-D])\.\s+([\s\S]*)$/);
      if (optionLineMatch) {
        const key = optionLineMatch[1];
        const text = optionLineMatch[2].trim();
        optionMap[key] = text;
        currentOptionKey = key;
        continue;
      }

      // 6. Otherwise, it's part of the question stem (or has an inline ` A. ...` at the end!)
      // Check if the line ends with an inline ` A. <option text>`
      const inlineOptionAMatch = line.match(/^([\s\S]+?)\s+A\.\s+([\s\S]+)$/);
      if (inlineOptionAMatch && !optionMap['A']) {
        stemParts.push(inlineOptionAMatch[1].trim());
        optionMap['A'] = inlineOptionAMatch[2].trim();
        currentOptionKey = 'A';
      } else if (currentOptionKey) {
        optionMap[currentOptionKey] += ' ' + line;
      } else {
        stemParts.push(line);
      }
    }

    const numStr = String(questionNumber || parsedQuestions.length + 1).padStart(2, '0');
    const id = `${config.idPrefix}_${numStr}`;
    const questionText = normalizeMathAndText(stemParts.join('\n\n'));
    const options = ['A', 'B', 'C', 'D'].map((key) => ({
      key,
      text: normalizeMathAndText(optionMap[key] || ''),
    }));

    // Validation checks
    if (!questionText) {
      throw new Error(`Missing question text in ${config.relPath} for item ${id}`);
    }
    for (const opt of options) {
      if (!opt.text) {
        throw new Error(`Missing option ${opt.key} in ${config.relPath} for item ${id}. Stem: ${questionText}`);
      }
    }
    if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      throw new Error(`Invalid or missing correctAnswer in ${config.relPath} for item ${id}`);
    }
    if (!rationale) {
      throw new Error(`Missing rationale in ${config.relPath} for item ${id}`);
    }

    parsedQuestions.push({
      id,
      area: config.area,
      topic: config.topic,
      topicSlug: config.topicSlug,
      questionNumber: questionNumber || parsedQuestions.length + 1,
      question: questionText,
      visualReference: visualReference ? normalizeMathAndText(visualReference) : null,
      imageSrc: '',
      options,
      correctAnswer,
      rationale: normalizeMathAndText(rationale),
    });
  }

  return parsedQuestions;
}

function main() {
  const allQuestions = [];
  console.log('=== Parsing Architecture Licensure Exam Markdown Files ===');

  for (const config of FILES_CONFIG) {
    const questions = parseMarkdownFile(config);
    const visualCount = questions.filter((q) => q.visualReference !== null).length;
    console.log(
      `✔ [${config.area}] ${config.topic.padEnd(26)} -> ${questions.length} items parsed (${visualCount} visual references)`
    );
    if (questions.length !== 60) {
      console.warn(`⚠ Expected 60 questions in ${config.relPath}, got ${questions.length}`);
    }
    allQuestions.push(...questions);
  }

  const outDir = path.join(ROOT_DIR, 'src', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'questions.json');
  fs.writeFileSync(outPath, JSON.stringify(allQuestions, null, 2), 'utf-8');

  // Verify all KaTeX expressions across the entire 420-question bank
  const mathRegex = /(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$|(?<!\\)\$([\s\S]*?)(?<!\\)\$/g;
  let mathCount = 0;
  let mathErrors = 0;

  for (const q of allQuestions) {
    const fields = [q.question, q.visualReference || '', q.rationale, ...q.options.map((o) => o.text)];
    for (const field of fields) {
      let m;
      while ((m = mathRegex.exec(field)) !== null) {
        mathCount++;
        const isBlock = m[1] !== undefined;
        const expr = (isBlock ? m[1] : m[2]).trim();
        try {
          katex.renderToString(expr, { displayMode: isBlock, throwOnError: true, strict: false });
        } catch (err) {
          mathErrors++;
          console.error(`❌ KaTeX error in ${q.id}: ${expr} -> ${err.message}`);
        }
      }
    }
  }

  console.log(`✔ Verified ${mathCount} LaTeX mathematical expressions with KaTeX (${mathErrors} errors)`);
  console.log(`✔ Successfully wrote ${allQuestions.length} total questions to src/data/questions.json`);
}

main();
