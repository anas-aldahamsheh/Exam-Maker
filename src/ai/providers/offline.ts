import {
  ExamSetup,
  PublicQuestion,
  WrittenRubric,
  WrittenEvaluation,
  AIFinalFeedback,
} from "@/types/exam";
import { GeneratedExamPayload, GeneratedQuestionItem } from "@/ai/schemas/exam";
import { AIProvider, FinalFeedbackInput } from "./types";

export class OfflineMockProvider implements AIProvider {
  name = "offline-mock";

  async generateExam(setup: ExamSetup): Promise<GeneratedExamPayload> {
    const isAr = setup.language === "ar";
    const title = isAr
      ? `اختبار تقييم مقابلة: ${setup.jobTitle} (${setup.experienceLevel})`
      : `Technical Interview Assessment: ${setup.jobTitle} (${setup.experienceLevel})`;

    const questions: GeneratedQuestionItem[] = [];
    const count = setup.questionCount;

    // Categories relevant to technical roles
    const categoriesEn = [
      "System Design & Architecture",
      "Data Structures & Algorithms",
      "Database & Data Modeling",
      "Concurrency & Performance",
      "API Design & Web Protocols",
      "Security & Best Practices",
    ];

    const categoriesAr = [
      "تصميم النظم والمعمارية البرمجية",
      "هياكل البيانات والخوارزميات",
      "قواعد البيانات ونمذجة البيانات",
      "التزامن والأداء العالي",
      "تصميم واجهات البرمجة والبروتوكولات",
      "الأمان والممارسات القياسية",
    ];

    const categories = isAr ? categoriesAr : categoriesEn;

    for (let i = 0; i < count; i++) {
      const qIndex = i + 1;
      const category = categories[i % categories.length];

      // Decide type based on filter
      let type: "mcq" | "written";
      if (setup.questionType === "mcq") {
        type = "mcq";
      } else if (setup.questionType === "written") {
        type = "written";
      } else {
        type = i % 2 === 0 ? "mcq" : "written";
      }

      // Decide difficulty based on filter
      let difficulty: "easy" | "medium" | "hard";
      if (setup.difficulty === "mixed") {
        difficulty = i % 3 === 0 ? "easy" : i % 3 === 1 ? "medium" : "hard";
      } else {
        difficulty = setup.difficulty;
      }

      const rawWeight = difficulty === "hard" ? 3 : difficulty === "medium" ? 2 : 1;

      if (type === "mcq") {
        const questionText = isAr
          ? `في سياق دور ${setup.jobTitle}، ما هو الأسلوب الأمثل والأنسب للتعامل مع تحدي (${category}) في بيئة الإنتاج؟ (السؤال ${qIndex})`
          : `In the context of a ${setup.jobTitle} role, what is the recommended industry approach to handle (${category}) challenges in production? (Question ${qIndex})`;

        const options = isAr
          ? [
              {
                id: "A" as const,
                text: "تطبيق استراتيجية الفصل الصارم بين الاهتمامات مع التخزين المؤقت الموزع والتحقق الصارم من الحدود.",
              },
              {
                id: "B" as const,
                text: "الاعتماد كلياً على العمليات المتزامنة الفورية دون أي آليات عزل أو تسجيل للأخطاء.",
              },
              {
                id: "C" as const,
                text: "تخزين كافة الحالات مؤقتاً في ذاكرة المعالجة المحلية بدون أي مرونة للتوسع الأفقي.",
              },
              {
                id: "D" as const,
                text: "تجاهل مقاييس زمن الاستجابة والتركيز فقط على التحميل الكلي للبيانات في دفعة واحدة.",
              },
            ]
          : [
              {
                id: "A" as const,
                text: "Implement strict separation of concerns with distributed caching and boundary validation.",
              },
              {
                id: "B" as const,
                text: "Rely solely on synchronous blocking execution without isolating failure domains or logging.",
              },
              {
                id: "C" as const,
                text: "Store all shared state in local process memory with no provisions for horizontal scalability.",
              },
              {
                id: "D" as const,
                text: "Disregard latency metrics and favor monolithic bulk data fetching on every incoming request.",
              },
            ];

        questions.push({
          id: `q_${qIndex}`,
          type: "mcq",
          question: questionText,
          difficulty,
          category,
          rawWeight,
          options,
          correctOptionId: "A",
          explanation: isAr
            ? "الخيار (A) هو الحل الهندسي الأمثل لأنه يحقق قابلية التوسع، وتخفيف الضغط، ويضمن استقرار النظام في الإنتاج."
            : "Option (A) is the architecturally sound solution because it provides fault isolation, horizontal scalability, and maintains consistent throughput.",
        });
      } else {
        const questionText = isAr
          ? `قم بتحليل وتصميم حل تقني لمعالجة (${category}) في نظام واسع النطاق خاص بـ ${setup.jobTitle}. اشرح المفاضلات الهندسية، والمخاطر المحتملة، وكيفية ضمان التوافقية العالية. (السؤال ${qIndex})`
          : `Analyze and design an engineering approach for (${category}) in a large-scale system as a ${setup.jobTitle}. Detail key trade-offs, edge-case risks, and how high availability is ensured. (Question ${qIndex})`;

        questions.push({
          id: `q_${qIndex}`,
          type: "written",
          question: questionText,
          difficulty,
          category,
          rawWeight: rawWeight * 1.5,
          writtenCriteria: isAr
            ? [
                "توضيح المعمارية المقترحة بدقة",
                "مناقشة المفاضلات بين زمن الوصول والاتساق (Trade-offs)",
                "إبراز إجراءات الأمان والمرونة عند فشل المكونات",
                "تقديم خطوات ملموسة لمراقبة الأداء واكتشاف الأعطال",
              ]
            : [
                "Clear architecture and data flow articulation",
                "Thorough discussion of latency vs consistency trade-offs",
                "Fault tolerance, retry policies, and circuit breaking",
                "Observability, logging, and performance metrics strategy",
              ],
          importantConcepts: isAr
            ? ["قابلية التوسع الأفقي", "التماسك النهائي", "العزل ضد الأعطال", "استراتيجيات التخزين المؤقت"]
            : ["Horizontal scalability", "Eventual consistency", "Fault isolation", "Cache invalidation"],
        });
      }
    }

    return {
      examTitle: title,
      questions,
    };
  }

  async evaluateWrittenAnswer(params: {
    question: PublicQuestion;
    rubric: WrittenRubric;
    answer: string;
    maxScore: number;
    language: "ar" | "en";
  }): Promise<WrittenEvaluation> {
    const isAr = params.language === "ar";
    const answerTrimmed = params.answer.trim();

    if (!answerTrimmed || answerTrimmed.length < 5) {
      return {
        questionId: params.question.id,
        score: 0,
        maxScore: params.maxScore,
        dimensionScores: {
          correctness: 0,
          completeness: 0,
          technicalUnderstanding: 0,
          relevance: 0,
          clarity: 0,
        },
        whatWasCorrect: [],
        whatWasMissing: params.rubric.expectedCriteria,
        mistakes: [isAr ? "لم يتم تقديم إجابة قابلة للتقييم." : "No substantive response was provided."],
        suggestedBetterAnswer: isAr
          ? `إجابة نموذجية تغطي ${params.rubric.importantConcepts.join("، ")} مع توضيح استراتيجيات المعمارية والمفاضلات التقنية.`
          : `A comprehensive answer addressing ${params.rubric.importantConcepts.join(", ")} with explicit architectural patterns and trade-off analysis.`,
        confidence: 0.95,
      };
    }

    // Proportional heuristic based on length and concepts present
    const lengthScore = Math.min(10, Math.floor(answerTrimmed.length / 50));
    const matchedConcepts = params.rubric.importantConcepts.filter((c) =>
      answerTrimmed.toLowerCase().includes(c.toLowerCase())
    );

    const ratio = Math.min(1, Math.max(0.3, (lengthScore / 10 + matchedConcepts.length) / 3));
    const awardedScore = Math.round(ratio * params.maxScore);

    return {
      questionId: params.question.id,
      score: awardedScore,
      maxScore: params.maxScore,
      dimensionScores: {
        correctness: Math.round(ratio * 10),
        completeness: Math.round(ratio * 9),
        technicalUnderstanding: Math.round(ratio * 10),
        relevance: Math.round(Math.min(10, ratio * 10 + 1)),
        clarity: Math.round(ratio * 8 + 1),
      },
      whatWasCorrect: [
        isAr
          ? "أظهرت الإجابة فهماً عاماً للسياق التقني المطلوب والمفاهيم الأساسية."
          : "Demonstrated fundamental technical awareness of the scenario requirements.",
      ],
      whatWasMissing: params.rubric.expectedCriteria.slice(0, 2),
      mistakes: [
        isAr
          ? "كان بالإمكان التعمق أكثر في معالجة الحالات الحدية (Edge cases) وآليات التعافي من الأعطال."
          : "Could have expanded further on edge-case failure modes and recovery procedures.",
      ],
      suggestedBetterAnswer: isAr
        ? `للحصول على الدرجة الكاملة، يفضل البدء برسم تدفق البيانات بوضوح، ثم ذكر ${params.rubric.importantConcepts.join(" و")} بالتفصيل مع توضيح مقاييس الأداء والمراقبة.`
        : `An ideal response begins with a clear system topology, systematically integrates ${params.rubric.importantConcepts.join(", ")}, and concludes with explicit SLA monitoring strategies.`,
      confidence: 0.88,
    };
  }

  async generateFinalFeedback(input: FinalFeedbackInput): Promise<AIFinalFeedback> {
    const isAr = input.language === "ar";
    const score = input.totalScore;

    if (isAr) {
      return {
        overallPerformance:
          score >= 80
            ? `أداء متفوق يعكس تمكناً هندسياً عالياً واستعداداً قوياً لمتطلبات دور ${input.jobTitle}.`
            : score >= 60
            ? `أداء جيد جداً يظهر كفاءة مناسبة مع وجود بعض الجوانب التي تتطلب مزيداً من الصقل الهندسي.`
            : `محاولة جيدة تكشف عن مجالات واضحة تحتاج إلى مراجعة وتعميق المفاهيم الأساسية.`,
        strengths: [
          "إتقان المفاهيم الأساسية ومعايير التصميم البرمجي",
          "إدراك جيد لمتطلبات الصيانة وقابلية التوسع",
        ],
        weaknesses: [
          "التعامل مع المفاضلات المعمارية تحت ضغط الحالات الحدية",
          "صياغة تفاصيل بروتوكولات الأمان والمرونة العالية",
        ],
        commonMistakes: [
          "الافتراض المتفائل بعدم حدوث أعطال في الشبكة أو الخدمات الخارجية",
          "تجاهل استراتيجيات التخزين المؤقت الموزع",
        ],
        topicsToImprove: [
          "تصميم النظم الموزعة والمعمارية الموجهة للأحداث",
          "تقنيات عزل الأعطال والمراقبة في بيئات الإنتاج",
        ],
        interviewReadiness:
          score >= 80
            ? "جاهزية محاكاة ممتازة — تمتلك المهارات الأساسية المطلوبة لإجراء مقابلات تقنية متقدمة."
            : score >= 60
            ? "جاهزية مقبولة — يوصى بمراجعة الموضوعات المحددة قبل التقدم للمقابلات المباشرة."
            : "تحتاج إلى مزيد من الإعداد النظري والعملي لتحقيق أعلى درجات الاستعداد.",
        studyAdvice: [
          "دراسة أنماط Circuit Breaker وRate Limiting بشكل عملي",
          "قراءة ومراجعة تصاميم قواعد البيانات ومستويات العزل",
          "حل أسئلة معمارية واقعية مع تحديد المفاضلات الزمنية والمكانية",
        ],
        nextAttemptAdvice:
          "في المحاولة القادمة، ركز على إدارة وقتك بالتساوي واقرأ كافة خيارات الأسئلة بدقة قبل الحسم.",
      };
    }

    return {
      overallPerformance:
        score >= 80
          ? `Outstanding performance demonstrating solid domain mastery for a ${input.jobTitle} role.`
          : score >= 60
          ? `Solid assessment performance demonstrating good engineering grounding with specific areas ready for refinement.`
          : `Good initial assessment attempt highlighting actionable focal points for technical review.`,
      strengths: [
        "Strong core command of domain patterns and structural conventions",
        "Clear understanding of maintainability and separation of concerns",
      ],
      weaknesses: [
        "Handling non-trivial distributed systems trade-offs under edge constraints",
        "Deep technical defense of consistency models and fault recovery",
      ],
      commonMistakes: [
        "Overlooking network unreliability and cascading failure risks",
        "Insufficient attention to cache invalidation mechanics",
      ],
      topicsToImprove: [
        "Distributed Systems and Event-Driven Architecture",
        "Production Observability and Fault Isolation Patterns",
      ],
      interviewReadiness:
        score >= 80
          ? "Strong simulated readiness — demonstrates the technical confidence expected in peer interview rounds."
          : score >= 60
          ? "Moderate readiness — recommend focused practice on identified topics prior to senior rounds."
          : "Early readiness — target targeted revision on identified weak topics to build interview confidence.",
      studyAdvice: [
        "Implement and test circuit breaker and exponential backoff retry patterns",
        "Review database concurrency isolation levels and indexing strategies",
        "Practice whiteboarding end-to-end system architectures with explicit trade-offs",
      ],
      nextAttemptAdvice:
        "On your next attempt, pace your written explanations evenly and review all marked questions before submission.",
    };
  }

  async generatePracticeExam(params: {
    setup: ExamSetup;
    weakCategories: string[];
    missedConcepts: string[];
    count: number;
  }): Promise<GeneratedExamPayload> {
    // Generate focused questions targeting the weak categories
    const baseSetup: ExamSetup = {
      ...params.setup,
      questionCount: params.count,
    };
    return this.generateExam(baseSetup);
  }
}
