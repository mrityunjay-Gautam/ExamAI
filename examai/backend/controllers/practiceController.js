const Groq = require("groq-sdk")
const db = require("../config/firebase")

const groq = process.env.PRACTICE_GROQ_API_KEY
  ? new Groq({ apiKey: process.env.PRACTICE_GROQ_API_KEY })
  : null

const PRACTICE_CONFIG = {
  jee: {
    label: "JEE Main Style",
    positiveMarks: 4,
    negativeMarks: 1,
    subjectOrder: ["Physics", "Chemistry", "Mathematics"],
    fullDistribution: [
      { subject: "Physics", count: 25 },
      { subject: "Chemistry", count: 25 },
      { subject: "Mathematics", count: 25 }
    ],
    sampleTopics: {
      Physics: [
        "Kinematics",
        "Laws of Motion",
        "Work Energy Power",
        "Thermodynamics",
        "Current Electricity",
        "Electrostatics",
        "Ray Optics",
        "Modern Physics"
      ],
      Chemistry: [
        "Chemical Bonding",
        "Thermodynamics",
        "Equilibrium",
        "Electrochemistry",
        "Chemical Kinetics",
        "Coordination Compounds",
        "Organic Reaction Mechanism",
        "Solutions"
      ],
      Mathematics: [
        "Functions",
        "Quadratic Equations",
        "Matrices",
        "Determinants",
        "Probability",
        "Permutation and Combination",
        "Vectors",
        "3D Geometry",
        "Differential Calculus",
        "Integral Calculus"
      ]
    }
  },
  neet: {
    label: "NEET Style",
    positiveMarks: 4,
    negativeMarks: 1,
    subjectOrder: ["Physics", "Chemistry", "Botany", "Zoology"],
    fullDistribution: [
      { subject: "Physics", count: 45 },
      { subject: "Chemistry", count: 45 },
      { subject: "Botany", count: 45 },
      { subject: "Zoology", count: 45 }
    ],
    sampleTopics: {
      Physics: [
        "Units and Dimensions",
        "Laws of Motion",
        "Work Energy Power",
        "Thermodynamics",
        "Current Electricity",
        "Ray Optics",
        "Semiconductors",
        "Oscillations"
      ],
      Chemistry: [
        "Chemical Bonding",
        "Thermodynamics",
        "Equilibrium",
        "Electrochemistry",
        "Chemical Kinetics",
        "Coordination Compounds",
        "p-Block Elements",
        "Organic Reaction Mechanism"
      ],
      Botany: [
        "Photosynthesis",
        "Respiration in Plants",
        "Plant Growth and Development",
        "Plant Kingdom",
        "Cell Cycle and Cell Division",
        "Molecular Basis of Inheritance",
        "Sexual Reproduction in Flowering Plants",
        "Ecology"
      ],
      Zoology: [
        "Breathing and Exchange of Gases",
        "Body Fluids and Circulation",
        "Neural Control and Coordination",
        "Chemical Coordination and Integration",
        "Human Reproduction",
        "Human Health and Disease",
        "Evolution",
        "Biotechnology"
      ]
    }
  }
}

const SUBJECT_KEYWORDS = {
  Physics: [
    "units and dimensions",
    "kinematics",
    "motion",
    "laws of motion",
    "work energy power",
    "thermodynamics",
    "electrostatics",
    "current electricity",
    "ray optics",
    "modern physics",
    "semiconductors",
    "oscillations",
    "waves",
    "gravitation",
    "electric field",
    "magnetic field"
  ],
  Chemistry: [
    "chemical bonding",
    "thermodynamics",
    "equilibrium",
    "electrochemistry",
    "chemical kinetics",
    "coordination compounds",
    "organic reaction mechanism",
    "solutions",
    "p-block",
    "organic chemistry",
    "redox",
    "ionic equilibrium",
    "surface chemistry"
  ],
  Botany: [
    "photosynthesis",
    "respiration in plants",
    "plant growth",
    "plant kingdom",
    "cell cycle",
    "cell division",
    "molecular basis of inheritance",
    "flowering plants",
    "ecology",
    "plant physiology"
  ],
  Zoology: [
    "breathing and exchange of gases",
    "body fluids and circulation",
    "neural control and coordination",
    "chemical coordination and integration",
    "human reproduction",
    "human health and disease",
    "evolution",
    "biotechnology",
    "human physiology",
    "immunity",
    "heart",
    "blood"
  ],
  Mathematics: [
    "functions",
    "quadratic equations",
    "matrices",
    "determinants",
    "probability",
    "permutation and combination",
    "vectors",
    "3d geometry",
    "differential calculus",
    "integral calculus",
    "limits",
    "trigonometric functions",
    "complex numbers"
  ]
}

function getConfig(examType) {
  return PRACTICE_CONFIG[String(examType || "").toLowerCase()] || PRACTICE_CONFIG.jee
}

function cleanText(value) {
  return String(value || "").trim()
}

function normalizeDifficulty(value) {
  return String(value || "").toLowerCase() === "hard" ? "hard" : "moderate"
}

function parseTopics(topics) {
  return String(topics || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch (error) {
    const cleaned = String(text || "")
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .trim()
    return JSON.parse(cleaned)
  }
}

function stripLatexInline(text) {
  let output = String(text || "")
  output = output.replace(/\$\$([\s\S]*?)\$\$/g, "$1")
  output = output.replace(/\$([^$]+)\$/g, "$1")
  output = output.replace(/\\\(([\s\S]*?)\\\)/g, "$1")
  output = output.replace(/\\\[([\s\S]*?)\\\]/g, "$1")
  output = output.replace(/\\rightarrow/g, "->")
  output = output.replace(/\\to/g, "->")
  output = output.replace(/\\leftrightarrow/g, "<->")
  output = output.replace(/\\rightleftharpoons/g, "<=>")
  output = output.replace(/\\Delta/g, "Delta")
  output = output.replace(/\\times/g, "×")
  output = output.replace(/\\cdot/g, "·")
  output = output.replace(/\\mathrm\{([^}]*)\}/g, "$1")
  output = output.replace(/\\text\{([^}]*)\}/g, "$1")
  output = output.replace(/\\left/g, "")
  output = output.replace(/\\right/g, "")
  output = output.replace(/_\{([^}]*)\}/g, "$1")
  output = output.replace(/\^\{([^}]*)\}/g, "$1")
  output = output.replace(/_([A-Za-z0-9+\-]+)/g, "$1")
  output = output.replace(/\^([A-Za-z0-9+\-]+)/g, "$1")
  output = output.replace(/\\/g, "")
  output = output.replace(/\s+/g, " ").trim()
  return output
}

function normalizeOptions(options) {
  if (Array.isArray(options)) {
    return {
      A: stripLatexInline(options[0] || ""),
      B: stripLatexInline(options[1] || ""),
      C: stripLatexInline(options[2] || ""),
      D: stripLatexInline(options[3] || "")
    }
  }

  const source = options || {}
  return {
    A: stripLatexInline(cleanText(source.A)),
    B: stripLatexInline(cleanText(source.B)),
    C: stripLatexInline(cleanText(source.C)),
    D: stripLatexInline(cleanText(source.D))
  }
}

function sanitizeQuestion(question) {
  return {
    ...question,
    question: stripLatexInline(question.question),
    subject: stripLatexInline(question.subject),
    topic: stripLatexInline(question.topic),
    questionType: stripLatexInline(question.questionType),
    explanation: stripLatexInline(question.explanation),
    trapExplanation: stripLatexInline(question.trapExplanation),
    options: normalizeOptions(question.options)
  }
}

function isPlaceholderQuestion(question) {
  const text = [
    question.question,
    question.explanation,
    question.trapExplanation,
    question.subject,
    question.topic
  ]
    .join(" ")
    .toLowerCase()

  const bannedPhrases = [
    "placeholder",
    "dummy question",
    "lorem ipsum",
    "question will be added later",
    "to be updated",
    "coming soon",
    "not available",
    "sample placeholder",
    "no question generated",
    "insert question here",
    "under standard competitive exam treatment",
    "which option reflects the most defensible",
    "which option is most consistent with",
    "a problem from",
    "which approach is most suitable"
  ]

  return bannedPhrases.some((item) => text.includes(item))
}

function ensureQuestionShape(question, config, fallbackSubject, fallbackTopic, difficulty, index) {
  const options = normalizeOptions(question.options || question.choices || question.answers || {})
  const answer = cleanText(question.correctAnswer || question.answerKey || question.answer).toUpperCase()

  return sanitizeQuestion({
    id: cleanText(question.id) || `q_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
    question: cleanText(question.question || question.stem || `Question ${index + 1}`),
    subject: cleanText(question.subject) || fallbackSubject,
    topic: cleanText(question.topic) || fallbackTopic,
    questionType: cleanText(question.questionType) || "MCQ",
    difficulty: normalizeDifficulty(question.difficulty || difficulty),
    options: {
      A: options.A || "Option A",
      B: options.B || "Option B",
      C: options.C || "Option C",
      D: options.D || "Option D"
    },
    correctAnswer: ["A", "B", "C", "D"].includes(answer) ? answer : "A",
    explanation: cleanText(question.explanation) || "Explanation not available.",
    trapExplanation: cleanText(question.trapExplanation) || "Students may get confused by close options.",
    marks: config.positiveMarks,
    negativeMarks: config.negativeMarks
  })
}

function detectSubjectFromTopic(topic, examType) {
  const config = getConfig(examType)
  const topicLower = String(topic || "").toLowerCase()

  for (const subject of config.subjectOrder) {
    const keywords = SUBJECT_KEYWORDS[subject] || []
    if (keywords.some((keyword) => topicLower.includes(keyword))) {
      return subject
    }
  }

  if (String(examType || "").toLowerCase() === "neet") {
    if (
      topicLower.includes("plant") ||
      topicLower.includes("photosynthesis") ||
      topicLower.includes("flower") ||
      topicLower.includes("ecology") ||
      topicLower.includes("inheritance")
    ) {
      return "Botany"
    }

    if (
      topicLower.includes("human") ||
      topicLower.includes("blood") ||
      topicLower.includes("heart") ||
      topicLower.includes("reproduction") ||
      topicLower.includes("disease") ||
      topicLower.includes("evolution")
    ) {
      return "Zoology"
    }
  }

  return config.subjectOrder[0]
}

function buildTopicObjects(topics, examType) {
  const list = parseTopics(topics)
  return list.map((topic) => ({
    topic,
    subject: detectSubjectFromTopic(topic, examType)
  }))
}

function buildTopicObjectsFromDefaultsAll(examType) {
  const config = getConfig(examType)
  const result = []

  for (const subject of config.subjectOrder) {
    for (const topic of config.sampleTopics[subject] || []) {
      result.push({ subject, topic })
    }
  }

  return result
}

function distributeEvenly(total, buckets) {
  if (buckets <= 0) return []
  const base = Math.floor(total / buckets)
  let extra = total % buckets
  const out = Array.from({ length: buckets }, () => base)

  for (let i = 0; i < out.length && extra > 0; i += 1) {
    out[i] += 1
    extra -= 1
  }

  return out
}

function buildSmallPaperPlan(topicObjects, examType, totalCount) {
  const config = getConfig(examType)
  const counts = distributeEvenly(totalCount, config.subjectOrder.length)
  const plan = []

  config.subjectOrder.forEach((subject, subjectIndex) => {
    const subjectTopics = topicObjects.filter((item) => item.subject === subject)
    const pool =
      subjectTopics.length > 0
        ? subjectTopics.map((item) => item.topic)
        : config.sampleTopics[subject]

    const count = counts[subjectIndex] || 0
    for (let i = 0; i < count; i += 1) {
      plan.push({
        subject,
        topic: pool[i % pool.length],
        count: 1
      })
    }
  })

  return plan
}

function buildFullPaperPlan(topicObjects, examType) {
  const config = getConfig(examType)
  const plan = []

  for (const part of config.fullDistribution) {
    const subjectTopics = topicObjects.filter((item) => item.subject === part.subject)
    const pool =
      subjectTopics.length > 0
        ? subjectTopics.map((item) => item.topic)
        : config.sampleTopics[part.subject]

    for (let i = 0; i < part.count; i += 1) {
      plan.push({
        subject: part.subject,
        topic: pool[i % pool.length],
        count: 1
      })
    }
  }

  return plan
}

function buildGenerationPrompt({ examType, subject, topic, count, difficulty }) {
  const config = getConfig(examType)

  return `
You are an expert Indian competitive exam question setter for ${config.label}.

Generate exactly ${count} multiple-choice questions.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

Important rules:
- Do not generate placeholder or dummy questions
- Make questions readable and exam-style
- Each question must have 4 options: A, B, C, D
- Exactly one correct answer
- Give short explanation
- Give trapExplanation
- Return plain JSON only
- No markdown
- No extra text outside JSON

Return this exact structure:
{
  "questions": [
    {
      "question": "Question text",
      "subject": "${subject}",
      "topic": "${topic}",
      "questionType": "MCQ",
      "difficulty": "${difficulty}",
      "options": {
        "A": "Option A",
        "B": "Option B",
        "C": "Option C",
        "D": "Option D"
      },
      "correctAnswer": "A",
      "explanation": "Why the answer is correct",
      "trapExplanation": "Why students may get confused"
    }
  ]
}
`
}

async function requestGeneratedQuestions({ examType, subject, topic, count, difficulty }) {
  if (!groq) return []

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.45,
    messages: [
      {
        role: "system",
        content: "You generate competitive exam MCQs. Return only valid JSON. No markdown."
      },
      {
        role: "user",
        content: buildGenerationPrompt({ examType, subject, topic, count, difficulty })
      }
    ]
  })

  const content = completion.choices?.[0]?.message?.content || '{"questions":[]}'
  const parsed = safeJsonParse(content)
  return Array.isArray(parsed.questions) ? parsed.questions : []
}

const FALLBACK_BANK = {
  Physics: [
    {
      topic: "Kinematics",
      template: (i) => {
        const a = 2 + (i % 5)
        const t = 2 + (i % 4)
        const s = Math.round(0.5 * a * t * t)
        return {
          question: `A body starts from rest and moves with constant acceleration of ${a} m/s2. The distance covered in ${t} s is:`,
          options: {
            A: `${s - 2} m`,
            B: `${s} m`,
            C: `${s + 2} m`,
            D: `${s + 4} m`
          },
          correctAnswer: "B",
          explanation: `Using s = 1/2 at2, distance = ${s} m.`,
          trapExplanation: "Students often forget the half factor."
        }
      }
    },
    {
      topic: "Current Electricity",
      template: (i) => {
        const r = 2 + (i % 8)
        const c = 1 + (i % 5)
        const v = r * c
        return {
          question: `If a resistor of ${r} ohm carries a current of ${c} A, the potential difference across it is:`,
          options: {
            A: `${v - 1} V`,
            B: `${v} V`,
            C: `${v + 1} V`,
            D: `${v + 2} V`
          },
          correctAnswer: "B",
          explanation: `By Ohm's law, V = IR = ${v} V.`,
          trapExplanation: "Students may add current and resistance instead of multiplying."
        }
      }
    },
    {
      topic: "Work Energy Power",
      template: (i) => {
        const m = 1 + (i % 4)
        const v = 2 + (i % 6)
        const ke = Math.round(0.5 * m * v * v)
        return {
          question: `The kinetic energy of a body of mass ${m} kg moving with speed ${v} m/s is:`,
          options: {
            A: `${ke - 2} J`,
            B: `${ke} J`,
            C: `${ke + 2} J`,
            D: `${ke + 4} J`
          },
          correctAnswer: "B",
          explanation: `Using 1/2 mv2, the kinetic energy is ${ke} J.`,
          trapExplanation: "Students often forget to square the speed."
        }
      }
    },
    {
      topic: "Modern Physics",
      template: () => ({
        question: "The charge on an electron is:",
        options: {
          A: "1.6 × 10^-19 C",
          B: "-1.6 × 10^-19 C",
          C: "9.1 × 10^-31 C",
          D: "1 C"
        },
        correctAnswer: "B",
        explanation: "Electron carries negative elementary charge.",
        trapExplanation: "Students often forget the negative sign."
      })
    }
  ],
  Chemistry: [
    {
      topic: "Chemical Bonding",
      template: () => ({
        question: "The bond formed by sharing of electron pairs between atoms is called:",
        options: {
          A: "Ionic bond",
          B: "Coordinate bond",
          C: "Covalent bond",
          D: "Metallic bond"
        },
        correctAnswer: "C",
        explanation: "A covalent bond is formed by sharing electron pairs.",
        trapExplanation: "Students often confuse sharing with transfer."
      })
    },
    {
      topic: "Equilibrium",
      template: () => ({
        question: "At equilibrium, the rate of forward reaction is:",
        options: {
          A: "Zero",
          B: "Greater than reverse reaction",
          C: "Less than reverse reaction",
          D: "Equal to reverse reaction"
        },
        correctAnswer: "D",
        explanation: "In dynamic equilibrium, forward and reverse rates are equal.",
        trapExplanation: "Students often think reaction stops at equilibrium."
      })
    },
    {
      topic: "Chemical Kinetics",
      template: () => ({
        question: "For a first order reaction, if the initial concentration is doubled, the rate becomes:",
        options: {
          A: "Half",
          B: "Same",
          C: "Double",
          D: "Four times"
        },
        correctAnswer: "C",
        explanation: "For first order, rate is directly proportional to concentration.",
        trapExplanation: "Students often confuse first order with second order."
      })
    },
    {
      topic: "Solutions",
      template: () => ({
        question: "Molarity is defined as number of moles of solute present in:",
        options: {
          A: "1 kg of solvent",
          B: "1 L of solution",
          C: "1 kg of solution",
          D: "100 mL of solution"
        },
        correctAnswer: "B",
        explanation: "Molarity means moles of solute per litre of solution.",
        trapExplanation: "Students often confuse molarity with molality."
      })
    }
  ],
  Mathematics: [
    {
      topic: "Functions",
      template: (i) => {
        const x = 2 + (i % 6)
        const value = 2 * x + 3
        return {
          question: `If f(x) = 2x + 3, then f(${x}) equals:`,
          options: {
            A: `${value - 1}`,
            B: `${value}`,
            C: `${value + 1}`,
            D: `${value + 2}`
          },
          correctAnswer: "B",
          explanation: `Substitute x = ${x}.`,
          trapExplanation: "Students may substitute incorrectly."
        }
      }
    },
    {
      topic: "Quadratic Equations",
      template: (i) => {
        const b = 5 + (i % 8)
        const c = 6 + (i % 7)
        return {
          question: `For the equation x2 - ${b}x + ${c} = 0, the sum of roots is:`,
          options: {
            A: `${b - 1}`,
            B: `${b}`,
            C: `${c}`,
            D: `${b + 1}`
          },
          correctAnswer: "B",
          explanation: "For x2 - bx + c = 0, sum of roots is b.",
          trapExplanation: "Students often confuse sum with product."
        }
      }
    },
    {
      topic: "Determinants",
      template: (i) => {
        const x = 2 + (i % 10)
        const det = 4 * x - 6
        return {
          question: `The determinant of the matrix [[${x}, 2], [3, 4]] is:`,
          options: {
            A: `${det - 2}`,
            B: `${det}`,
            C: `${det + 2}`,
            D: `${det + 4}`
          },
          correctAnswer: "B",
          explanation: `Determinant = (${x} × 4) - (2 × 3) = ${det}.`,
          trapExplanation: "Students may use wrong sign while evaluating determinant."
        }
      }
    },
    {
      topic: "Probability",
      template: () => ({
        question: "A coin is tossed three times. The probability of getting exactly two heads is:",
        options: {
          A: "1/8",
          B: "2/8",
          C: "3/8",
          D: "4/8"
        },
        correctAnswer: "C",
        explanation: "The favourable cases are HHT, HTH and THH.",
        trapExplanation: "Students often count at least two heads instead of exactly two."
      })
    }
  ],
  Botany: [
    {
      topic: "Photosynthesis",
      template: () => ({
        question: "The green pigment directly involved in photosynthesis is:",
        options: {
          A: "Haemoglobin",
          B: "Chlorophyll",
          C: "Melanin",
          D: "Auxin"
        },
        correctAnswer: "B",
        explanation: "Chlorophyll is the main photosynthetic pigment.",
        trapExplanation: "Students often confuse pigment with hormone."
      })
    },
    {
      topic: "Cell Cycle and Cell Division",
      template: () => ({
        question: "DNA replication occurs during which phase of the cell cycle?",
        options: {
          A: "G1 phase",
          B: "S phase",
          C: "G2 phase",
          D: "M phase"
        },
        correctAnswer: "B",
        explanation: "DNA synthesis occurs in the S phase.",
        trapExplanation: "Students often mix S phase with M phase."
      })
    },
    {
      topic: "Plant Kingdom",
      template: () => ({
        question: "Bryophytes are commonly called:",
        options: {
          A: "Seed plants",
          B: "Amphibians of plant kingdom",
          C: "Flowering plants",
          D: "Gymnosperms"
        },
        correctAnswer: "B",
        explanation: "Bryophytes need water for reproduction.",
        trapExplanation: "Students often confuse bryophytes with pteridophytes."
      })
    },
    {
      topic: "Molecular Basis of Inheritance",
      template: () => ({
        question: "DNA stands for:",
        options: {
          A: "Deoxyribonucleic acid",
          B: "Dinitrogen acid",
          C: "Double nuclear acid",
          D: "Dynamic nucleic acid"
        },
        correctAnswer: "A",
        explanation: "DNA expands to deoxyribonucleic acid.",
        trapExplanation: "Students may get confused by similar terms."
      })
    }
  ],
  Zoology: [
    {
      topic: "Breathing and Exchange of Gases",
      template: () => ({
        question: "Gas exchange in human lungs occurs mainly in the:",
        options: {
          A: "Bronchi",
          B: "Trachea",
          C: "Alveoli",
          D: "Larynx"
        },
        correctAnswer: "C",
        explanation: "Alveoli provide the exchange surface for gases.",
        trapExplanation: "Students often choose the conducting part instead of exchange surface."
      })
    },
    {
      topic: "Body Fluids and Circulation",
      template: () => ({
        question: "The human heart has how many chambers?",
        options: {
          A: "2",
          B: "3",
          C: "4",
          D: "5"
        },
        correctAnswer: "C",
        explanation: "The human heart has two atria and two ventricles.",
        trapExplanation: "Students sometimes forget both upper and lower chambers are counted."
      })
    },
    {
      topic: "Chemical Coordination and Integration",
      template: () => ({
        question: "Insulin is secreted by:",
        options: {
          A: "Thyroid gland",
          B: "Pancreas",
          C: "Pituitary gland",
          D: "Adrenal gland"
        },
        correctAnswer: "B",
        explanation: "Insulin is secreted by beta cells of pancreas.",
        trapExplanation: "Students often confuse endocrine glands."
      })
    },
    {
      topic: "Human Health and Disease",
      template: () => ({
        question: "AIDS is caused by:",
        options: {
          A: "Bacterium",
          B: "Virus",
          C: "Fungus",
          D: "Protozoan"
        },
        correctAnswer: "B",
        explanation: "AIDS is caused by HIV, which is a virus.",
        trapExplanation: "Students may know the disease but forget the organism type."
      })
    }
  ]
}

function buildFallbackQuestion(subject, topic, difficulty, config, index) {
  const bank = FALLBACK_BANK[subject] || FALLBACK_BANK.Physics
  const item = bank[index % bank.length]
  const built = item.template(index)

  return sanitizeQuestion({
    id: `fallback_${subject.toLowerCase()}_${Date.now()}_${index}_${Math.floor(Math.random() * 100000)}`,
    question: built.question,
    subject,
    topic: cleanText(topic) || item.topic || subject,
    questionType: "MCQ",
    difficulty,
    options: built.options,
    correctAnswer: built.correctAnswer,
    explanation: built.explanation,
    trapExplanation: built.trapExplanation,
    marks: config.positiveMarks,
    negativeMarks: config.negativeMarks
  })
}

async function generateQuestionsForPlanItem({
  examType,
  subject,
  topic,
  count,
  difficulty,
  startIndex = 0
}) {
  const config = getConfig(examType)
  const accepted = []

  if (groq) {
    try {
      const rawQuestions = await requestGeneratedQuestions({
        examType,
        subject,
        topic,
        count,
        difficulty
      })

      for (let i = 0; i < rawQuestions.length; i += 1) {
        const q = ensureQuestionShape(
          rawQuestions[i],
          config,
          subject,
          topic,
          difficulty,
          startIndex + i
        )

        if (!isPlaceholderQuestion(q)) {
          accepted.push(q)
        }
      }
    } catch (error) {
      console.log("AI GENERATION BLOCK ERROR:", error.message)
    }
  }

  let fillerIndex = 0
  while (accepted.length < count) {
    const fallback = buildFallbackQuestion(
      subject,
      topic,
      difficulty,
      config,
      startIndex + fillerIndex
    )

    if (!isPlaceholderQuestion(fallback)) {
      accepted.push(fallback)
    }

    fillerIndex += 1
  }

  return accepted.slice(0, count)
}

function sortQuestionsInExamSequence(questions, examType) {
  const config = getConfig(examType)

  return [...questions].sort((a, b) => {
    const orderA = config.subjectOrder.indexOf(a.subject)
    const orderB = config.subjectOrder.indexOf(b.subject)

    if (orderA !== orderB) return orderA - orderB
    return String(a.topic || "").localeCompare(String(b.topic || ""))
  })
}

exports.generatePracticePaper = async (req, res) => {
  try {
    const { examType, topics, countMode, difficulty } = req.body

    if (!examType) {
      return res.status(400).json({
        success: false,
        message: "Exam type is required"
      })
    }

    const normalizedExam = String(examType).toLowerCase()
    const config = getConfig(normalizedExam)
    const normalizedDifficulty = normalizeDifficulty(difficulty)

    let topicObjects = buildTopicObjects(topics, normalizedExam)
    if (topicObjects.length === 0) {
      topicObjects = buildTopicObjectsFromDefaultsAll(normalizedExam)
    }

    let expectedCount = 15
    let title = `${config.label} Practice Paper`
    let plan = []

    if (String(countMode).toLowerCase() === "full") {
      expectedCount = config.fullDistribution.reduce((sum, item) => sum + item.count, 0)
      title = `${config.label} Full Mock Paper`
      plan = buildFullPaperPlan(topicObjects, normalizedExam)
    } else {
      expectedCount = [15, 30, 45].includes(Number(countMode)) ? Number(countMode) : 15
      title = `${config.label} ${expectedCount} Question Practice`
      plan = buildSmallPaperPlan(topicObjects, normalizedExam, expectedCount)
    }

    const questions = []
    let runningIndex = 0

    for (const item of plan) {
      const chunk = await generateQuestionsForPlanItem({
        examType: normalizedExam,
        subject: item.subject,
        topic: item.topic,
        count: item.count,
        difficulty: normalizedDifficulty,
        startIndex: runningIndex
      })

      questions.push(...chunk)
      runningIndex += item.count
    }

    let safety = 0
    while (questions.length < expectedCount) {
      const item = plan[safety % plan.length] || {
        subject: config.subjectOrder[safety % config.subjectOrder.length],
        topic: (config.sampleTopics[config.subjectOrder[safety % config.subjectOrder.length]] || [config.subjectOrder[0]])[0]
      }

      const fallback = buildFallbackQuestion(
        item.subject,
        item.topic,
        normalizedDifficulty,
        config,
        runningIndex + safety
      )

      if (!isPlaceholderQuestion(fallback)) {
        questions.push(fallback)
      }

      safety += 1
    }

    const finalQuestions = sortQuestionsInExamSequence(
      questions.slice(0, expectedCount),
      normalizedExam
    )

    return res.json({
      success: true,
      paper: {
        examType: normalizedExam,
        title,
        topics: parseTopics(topics).join(", "),
        difficulty: normalizedDifficulty,
        markingScheme: {
          correct: config.positiveMarks,
          incorrect: config.negativeMarks,
          maxQuestions: finalQuestions.length
        },
        questions: finalQuestions
      }
    })
  } catch (error) {
    console.log("GENERATE PRACTICE PAPER ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to generate practice paper",
      error: error.message
    })
  }
}

exports.submitPracticePaper = async (req, res) => {
  try {
    const { examType, title, questions, userAnswers, difficulty } = req.body

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Questions are required"
      })
    }

    const config = getConfig(examType)
    const answers = userAnswers || {}

    let attempted = 0
    let correct = 0
    let incorrect = 0
    let unattempted = 0
    let score = 0

    const subjectMap = {}
    const review = []

    for (const question of questions) {
      const selected = cleanText(answers[question.id]).toUpperCase()
      const correctAnswer = cleanText(question.correctAnswer).toUpperCase() || "A"
      const subject = cleanText(question.subject) || "General"

      if (!subjectMap[subject]) {
        subjectMap[subject] = {
          subject,
          correct: 0,
          incorrect: 0,
          unattempted: 0,
          score: 0
        }
      }

      if (!selected) {
        unattempted += 1
        subjectMap[subject].unattempted += 1
      } else {
        attempted += 1
        if (selected === correctAnswer) {
          correct += 1
          score += config.positiveMarks
          subjectMap[subject].correct += 1
          subjectMap[subject].score += config.positiveMarks
        } else {
          incorrect += 1
          score -= config.negativeMarks
          subjectMap[subject].incorrect += 1
          subjectMap[subject].score -= config.negativeMarks
        }
      }

      review.push({
        id: question.id,
        question: stripLatexInline(question.question),
        subject: stripLatexInline(question.subject),
        topic: stripLatexInline(question.topic),
        questionType: stripLatexInline(question.questionType || "MCQ"),
        difficulty: question.difficulty || normalizeDifficulty(difficulty),
        selectedAnswer: selected || "Not Attempted",
        correctAnswer,
        explanation: stripLatexInline(question.explanation || "No explanation available."),
        trapExplanation:
          stripLatexInline(question.trapExplanation) ||
          "Students may get trapped by close options.",
        options: {
          A: stripLatexInline(question.options?.A || ""),
          B: stripLatexInline(question.options?.B || ""),
          C: stripLatexInline(question.options?.C || ""),
          D: stripLatexInline(question.options?.D || "")
        }
      })
    }

    const maxScore = questions.length * config.positiveMarks
    const percentage = maxScore > 0 ? Number(((score / maxScore) * 100).toFixed(2)) : 0

    const scoreCard = {
      examType: String(examType || "").toLowerCase(),
      title: title || `${config.label} Practice`,
      difficulty: normalizeDifficulty(difficulty),
      totalQuestions: questions.length,
      attempted,
      correct,
      incorrect,
      unattempted,
      score,
      maxScore,
      percentage,
      subjectBreakdown: Object.values(subjectMap),
      createdAt: new Date()
    }

    let scoreCardId = null
    try {
      const docRef = await db.collection("practiceScores").add(scoreCard)
      scoreCardId = docRef.id
    } catch (saveError) {
      console.log("PRACTICE SCORE SAVE ERROR:", saveError)
    }

    return res.json({
      success: true,
      message: "Practice submitted successfully",
      scoreCardId,
      scoreCard,
      review
    })
  } catch (error) {
    console.log("SUBMIT PRACTICE ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to submit practice paper",
      error: error.message
    })
  }
}

exports.getPracticeScores = async (req, res) => {
  try {
    const snapshot = await db.collection("practiceScores").get()
    const items = []

    snapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      })
    })

    items.sort((a, b) => {
      const getTime = (value) => {
        if (!value) return 0
        if (typeof value.toDate === "function") return value.toDate().getTime()
        if (value._seconds) return value._seconds * 1000
        const parsed = new Date(value).getTime()
        return Number.isNaN(parsed) ? 0 : parsed
      }
      return getTime(b.createdAt) - getTime(a.createdAt)
    })

    return res.json({
      success: true,
      scores: items
    })
  } catch (error) {
    console.log("GET PRACTICE SCORES ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to load score analysis",
      error: error.message
    })
  }
}

exports.deletePracticeScore = async (req, res) => {
  try {
    const { id } = req.params

    if (!cleanText(id)) {
      return res.status(400).json({
        success: false,
        message: "Scorecard id is required"
      })
    }

    const docRef = db.collection("practiceScores").doc(id)
    const docSnap = await docRef.get()

    if (!docSnap.exists) {
      return res.status(404).json({
        success: false,
        message: "Scorecard not found"
      })
    }

    await docRef.delete()

    return res.json({
      success: true,
      message: "Scorecard deleted successfully"
    })
  } catch (error) {
    console.log("DELETE PRACTICE SCORE ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to delete scorecard",
      error: error.message
    })
  }
}

exports.solvePracticeDoubt = async (req, res) => {
  try {
    const { question, examType } = req.body

    if (!cleanText(question)) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      })
    }

    const config = getConfig(examType)

    if (!groq) {
      return res.json({
        success: true,
        answer: `Direct Answer:
This doubt belongs to ${config.label} preparation.

Concept Explanation:
Identify the exact chapter concept and the hidden condition in the question.

Step-by-Step Method:
1. Read the question carefully.
2. Identify the key concept.
3. Eliminate weak options.
4. Match the final answer with concept logic.

Quick Tip:
One keyword often changes the correct option in competitive exams.

Common Mistake:
Students often choose familiar-looking options without checking the full condition.`
      })
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      messages: [
        {
          role: "system",
          content: `You are an expert ${config.label} teacher.
Explain clearly in these sections:
1. Direct Answer
2. Concept Explanation
3. Step-by-Step Method
4. Quick Tip
5. Common Mistake

Do not use LaTeX. Use plain readable text only.`
        },
        {
          role: "user",
          content: stripLatexInline(question)
        }
      ]
    })

    const answer = stripLatexInline(
      completion.choices?.[0]?.message?.content || "No answer generated."
    )

    return res.json({
      success: true,
      answer
    })
  } catch (error) {
    console.log("PRACTICE DOUBT ERROR:", error)
    return res.status(500).json({
      success: false,
      message: "Failed to solve doubt",
      error: error.message
    })
  }
}