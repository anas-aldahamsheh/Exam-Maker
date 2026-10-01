import { ExamSetup, PublicQuestion, WrittenRubric } from "@/types/exam";

export function buildExamGenerationPrompt(setup: ExamSetup): string {
  const isArabic = setup.language === "ar";

  const langDirective = isArabic
    ? `LANGUAGE AND TERMINOLOGY RULES (MANDATORY):
- Generate all exam content (examTitle, question text, options, explanations, and criteria) in professional, fluent technical Arabic (اللغة العربية الفصحى الحديثة المستخدمة في الشركات التقنية الرائدة).
- For standard industry engineering terms (e.g., Race Condition, Connection Pooling, Deadlock, Idempotency, Eventual Consistency, Cache Stampede, Memory Leak, N+1 Query, Indexing, CAP Theorem, Circuit Breaker), write the clear Arabic explanation accompanied by the standard English term in parentheses where natural (e.g. "مشكلة التنازع والسباق (Race Condition)", "تجمع اتصالات قاعدة البيانات (Connection Pool)", "تكرار الطلبات المتطابق (Idempotency)").
- Strictly avoid clumsy literal translations that confuse the engineering meaning.`
    : `LANGUAGE RULES:
- Generate all content in clear, precise, professional English standard in top-tier technology firms.`;

  const seniorityFocus =
    setup.experienceLevel === "senior"
      ? `SENIORITY CALIBRATION: SENIOR / LEAD ENGINEER
- Focus strictly on: High-scale system design, distributed systems trade-offs (Latency vs. Consistency, CAP theorem nuances, Partition tolerance), concurrency control, failure isolation (bulkheading, circuit breakers, backpressure), database indexing strategies & lock contention (optimistic vs pessimistic), zero-downtime schema migrations on large datasets, and cache invalidation anti-patterns.
- FORBID syntax questions, framework trivia, or textbook definitions.
- Challenge the candidate with conflicting real-world constraints (e.g., extreme write throughput with sub-50ms read latency, cost-efficiency vs multi-region active-active redundancy).`
      : setup.experienceLevel === "mid"
      ? `SENIORITY CALIBRATION: MID-LEVEL ENGINEER
- Focus on: Debugging genuine production bugs, error handling and resilience, race conditions in state or async flows, API contract design and defensive boundary validation, query optimization (identifying sequential scans, N+1 queries, composite index traps), and component re-render / memory leak bottlenecks.
- Ground questions in realistic code snippets, API scenarios, or backend/frontend integration puzzles.`
      : `SENIORITY CALIBRATION: JUNIOR / ASSOCIATE ENGINEER
- Focus on: Code reading, tracking execution flow, identifying off-by-one errors, state mutation pitfalls, asynchronous promise error handling, boundary conditions with empty/null payloads, and basic time/space complexity.
- Test deep foundational understanding through realistic mini-scenarios rather than abstract textbook trivia.`;

  const jdText = setup.jobDescription
    ? `Target Job Description & Core Tech Stack Requirements:\n"""\n${setup.jobDescription}\n"""\nDirectly anchor questions to the technologies, frameworks, libraries, and architectural paradigms explicitly mentioned in this Job Description.`
    : `Target Job Title: "${setup.jobTitle}".\nSynthesize questions strictly reflecting what a candidate interviewing for "${setup.jobTitle}" at this seniority tier must master in real production environments.`;

  return `
You are a Principal Software Engineer and Chair of the Technical Hiring Committee at a world-class technology company.
Your mission is to generate a deeply realistic, high-signal, scenario-driven interview examination that rigorously measures a candidate's actual engineering acumen.

${langDirective}

Target Role: "${setup.jobTitle}"
Target Seniority Level: "${setup.experienceLevel}"
Requested Question Format: "${setup.questionType}" (mcq = Multiple Choice only, written = Written Technical reasoning only, mixed = balanced blend)
Requested Difficulty: "${setup.difficulty}" (easy, medium, hard, or mixed)
Total Number of Questions: ${setup.questionCount}
${jdText}

${seniorityFocus}

CORE INTERVIEW PHILOSOPHY (STRICT DIRECTIVES):
1. ABSOLUTELY ZERO TEXTBOOK TRIVIA:
   - NEVER ask "What is X?", "Define Y", "What does acronym Z stand for?", or "List the features of W".
   - NEVER ask questions that an engineer would simply look up in documentation or that an IDE autocompletes.
2. PRODUCTION-GRADE SCENARIOS:
   - Frame every question around a genuine engineering incident, an architectural trade-off, or a tricky production debugging puzzle.
   - Example scenario themes: Memory leaks in background workers, deadlocks under peak load, unexpected cache stampedes, breaking changes in downstream microservices, optimistic vs pessimistic locking in high-contention rows, client-side re-render loops or duplicate submission race conditions.
3. COGNITIVE MCQ DISTRACTORS (FOR MCQ QUESTIONS):
   - Provide exactly 4 options with ids "A", "B", "C", "D". Exactly one correctOptionId.
   - The 3 incorrect options (distractors) MUST NOT be obvious or silly. They MUST represent realistic mistakes, common misconceptions, or naive solutions that work on localhost but catastrophically fail at scale or under edge cases.
   - The "explanation" must be comprehensive and educational: detail why the correct option is optimal, and explicitly pinpoint the exact technical flaw or vulnerability in the other choices.
4. IN-DEPTH WRITTEN QUESTIONS (FOR WRITTEN QUESTIONS):
   - Present a realistic, ambiguous production problem or system design scenario requiring structured technical decision-making and justification of trade-offs.
   - "writtenCriteria": 3 to 5 concrete technical evaluation points the interviewer expects (e.g. "Addresses write-amplification in high-volume logging", "Specifies exponential backoff with jitter for webhook retries").
   - "importantConcepts": 2 to 4 key architectural patterns or technical principles essential for full credit.
5. CODE SNIPPETS & SCHEMAS:
   - When helpful for the role, embed concise, realistic code snippets or SQL queries in the question text to ground the question in concrete code reading or debugging.
6. TECHNICAL CATEGORIES:
   - Categorize each question with a specific, authentic engineering domain (e.g. "Distributed Systems", "Database Optimization", "Concurrency & State", "API Design & Security", "Memory & Performance", "Cloud & Observability").
7. RAW WEIGHTS:
   - Assign appropriate "rawWeight" (1 for straightforward debugging, 2-3 for standard engineering problems, 4-5 for complex architecture/written scenarios).

OUTPUT FORMAT:
Return strictly valid JSON adhering EXACTLY to this structure (do not alter field names):
{
  "examTitle": "Concise professional title for this examination",
  "questions": [
    {
      "id": "q_1",
      "type": "mcq",
      "question": "Scenario or problem description...",
      "difficulty": "hard",
      "category": "Database Optimization & Concurrency",
      "rawWeight": 3,
      "options": [
        { "id": "A", "text": "Option A text" },
        { "id": "B", "text": "Option B text" },
        { "id": "C", "text": "Option C text" },
        { "id": "D", "text": "Option D text" }
      ],
      "correctOptionId": "A",
      "explanation": "Detailed technical explanation of why A is correct and why B, C, D are suboptimal or flawed."
    },
    {
      "id": "q_2",
      "type": "written",
      "question": "Architecture or complex debugging scenario prompt...",
      "difficulty": "hard",
      "category": "Distributed Systems",
      "rawWeight": 4,
      "writtenCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"],
      "importantConcepts": ["Concept 1", "Concept 2"]
    }
  ]
}
`.trim();
}

export function buildWrittenEvaluationPrompt(params: {
  question: PublicQuestion;
  rubric: WrittenRubric;
  answer: string;
  maxScore: number;
}): string {
  return `
You are a Principal Software Engineer evaluating a candidate's written technical response in a hiring interview.
Be rigorous, objective, and constructive. Reward solid engineering reasoning and trade-off analysis; penalize hand-waving, buzzword soup, and ignoring failure modes.

Question:
"${params.question.text}"

Category: ${params.question.category}
Difficulty: ${params.question.difficulty}
Maximum Points Available: ${params.maxScore}

Grading Criteria Expected:
${params.rubric.expectedCriteria.map((c) => `- ${c}`).join("\n")}

Key Technical Concepts Expected:
${params.rubric.importantConcepts.map((c) => `- ${c}`).join("\n")}

Candidate's Submitted Answer:
"""
${params.answer || "(No answer provided)"}
"""

Instructions:
1. Evaluate the answer across five dimensions (0 to 10 scale each):
   - correctness: Technical and factual accuracy of proposed solutions.
   - completeness: Addresses edge cases, failure scenarios, and all parts of the question.
   - technicalUnderstanding: Depth of engineering knowledge demonstrated (understands why, not just what).
   - relevance: Concise, focused on the prompt, free of irrelevant filler.
   - clarity: Clear structure, logical reasoning, and precision of terminology.
2. Award a proportional score between 0 and ${params.maxScore}.
   - If answer is empty or completely irrelevant, score must be 0.
   - Never award more than ${params.maxScore}.
3. Provide:
   - whatWasCorrect: bullet points of solid architectural points, correct mechanisms, or good practices mentioned.
   - whatWasMissing: bullet points of critical edge cases, missing failure modes, unaddressed trade-offs, or scaling concerns left out.
   - mistakes: any incorrect technical assumptions, flawed algorithms, or vulnerability risks in their answer.
   - suggestedBetterAnswer: a model, concise, high-scoring Staff-level answer demonstrating optimal patterns and trade-offs.
4. Return strictly valid JSON matching the schema.
`.trim();
}

export function buildFinalFeedbackPrompt(params: {
  jobTitle: string;
  level: string;
  totalScore: number;
  timeUsedSeconds: number;
  statsSummary: string;
  language: "ar" | "en";
}): string {
  const isAr = params.language === "ar";
  const langText = isAr
    ? "Provide the entire evaluation and study advice in professional, fluent technical Arabic (اللغة العربية الفصحى المستخدمة بين مهندسي البرمجيات)."
    : "Provide the entire evaluation and study advice in professional English standard in tech industry debriefs.";

  return `
You are an executive engineering hiring committee lead and technical career coach debriefing a candidate after a simulated technical assessment.
Your goal is to provide honest, deeply insightful, high-value engineering feedback that genuinely helps them level up their skills for top-tier interviews.

Candidate Details:
Target Role: ${params.jobTitle} (${params.level})
Score Achieved: ${params.totalScore} / 100
Time Spent: ${Math.round(params.timeUsedSeconds / 60)} minutes
Performance Breakdown:
${params.statsSummary}

${langText}

Instructions:
1. Provide an objective, highly specific, and actionable debrief:
   - overallPerformance: 2-3 sentences providing an executive summary of their technical readiness and problem-solving level.
   - strengths: 2-4 key technical strengths evidenced by high-scoring areas and solid patterns shown in the exam.
   - weaknesses: 2-4 concrete technical blind spots evidenced by missed questions or incomplete solutions.
   - commonMistakes: specific misconceptions or anti-patterns detected during this exam.
   - topicsToImprove: 2-4 prioritized technical topics (e.g. "Distributed locking mechanisms in Redis", "PostgreSQL Composite Index column ordering and EXPLAIN ANALYZE").
   - interviewReadiness: a realistic, constructive appraisal of their readiness for real hiring loops at their target seniority tier.
   - studyAdvice: 3-5 concrete, actionable engineering recommendations (books, patterns, system designs to practice).
   - nextAttemptAdvice: tactical advice on time management, question reading, or trade-off articulation for their next attempt.
2. Return strictly valid JSON matching the schema.
`.trim();
}

export function buildPracticeExamPrompt(params: {
  setup: ExamSetup;
  weakCategories: string[];
  missedConcepts: string[];
  count: number;
}): string {
  const isArabic = params.setup.language === "ar";

  const langDirective = isArabic
    ? `LANGUAGE AND TERMINOLOGY RULES (MANDATORY):
- Generate all exam content in professional, fluent technical Arabic (اللغة العربية الفصحى الحديثة). Include standard English terms in parentheses where natural.`
    : `LANGUAGE RULES:
- Generate all content in clear, precise, professional English standard in top-tier technology firms.`;

  return `
You are a Principal Software Engineer designing a high-impact, targeted remediation practice examination.
The candidate previously completed an assessment for "${params.setup.jobTitle}" (${params.setup.experienceLevel}) and needs targeted practice on specific weak areas.

${langDirective}

Target Role: "${params.setup.jobTitle}" (${params.setup.experienceLevel})
Total Number of Practice Questions: ${params.count}
Weak Technical Categories to Target:
${params.weakCategories.length > 0 ? params.weakCategories.map((c) => `- ${c}`).join("\n") : "- General engineering depth and edge cases"}

Missed Concepts & Knowledge Gaps to Test:
${params.missedConcepts.length > 0 ? params.missedConcepts.map((c) => `- ${c}`).join("\n") : "- Architectural trade-offs and error handling"}

DIRECTIVES:
1. Every question must directly test the candidate's understanding of the weak categories and missed concepts listed above.
2. Frame questions around realistic production incidents, edge-case debugging, or trade-off decisions.
3. For MCQ questions: exactly 4 options ("A", "B", "C", "D"), exactly one correctOptionId, with plausible distractors reflecting common errors.
4. For Written questions: provide explicit writtenCriteria and importantConcepts.
5. Return strictly valid JSON adhering to the generated exam schema:
{
  "examTitle": "Targeted Practice: ${params.setup.jobTitle} - Remediation",
  "questions": [ ... ]
}
`.trim();
}

