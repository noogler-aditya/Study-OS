import type { Chapter, StudyOsData, Subject, Topic } from "../types";

const subjectSpecs = [
  {
    id: "sub-engineering-math",
    name: "Engineering Mathematics",
    color: "#5b7cfa",
    targetWeight: 13,
    chapters: [
      ["Linear Algebra", ["Matrices", "Eigenvalues and eigenvectors", "Systems of linear equations"]],
      ["Calculus", ["Limits and continuity", "Differentiability", "Maxima and minima"]],
      ["Probability", ["Random variables", "Distributions", "Bayes theorem"]]
    ]
  },
  {
    id: "sub-dsa",
    name: "Data Structures & Algorithms",
    color: "#0f9f8f",
    targetWeight: 14,
    chapters: [
      ["Data Structures", ["Arrays and linked lists", "Stacks and queues", "Trees", "Graphs"]],
      ["Algorithms", ["Sorting", "Searching", "Greedy algorithms", "Dynamic programming"]]
    ]
  },
  {
    id: "sub-coa",
    name: "Computer Organization",
    color: "#d97706",
    targetWeight: 9,
    chapters: [
      ["Processor Design", ["Instruction formats", "Addressing modes", "Pipelining"]],
      ["Memory and I/O", ["Cache memory", "Virtual memory", "I/O interfaces"]]
    ]
  },
  {
    id: "sub-os",
    name: "Operating Systems",
    color: "#8b5cf6",
    targetWeight: 10,
    chapters: [
      ["Processes", ["CPU scheduling", "Synchronization", "Deadlocks"]],
      ["Memory and Files", ["Paging", "Segmentation", "File systems"]]
    ]
  },
  {
    id: "sub-dbms",
    name: "DBMS",
    color: "#e11d48",
    targetWeight: 8,
    chapters: [
      ["Relational Model", ["ER model", "Relational algebra", "SQL"]],
      ["Transactions", ["Normalization", "Concurrency control", "Recovery"]]
    ]
  },
  {
    id: "sub-networks",
    name: "Computer Networks",
    color: "#0284c7",
    targetWeight: 8,
    chapters: [
      ["Protocol Stack", ["OSI and TCP/IP", "Transport layer", "Routing"]],
      ["Applications", ["DNS", "HTTP", "Congestion control"]]
    ]
  },
  {
    id: "sub-toc",
    name: "Theory of Computation",
    color: "#7c3aed",
    targetWeight: 8,
    chapters: [
      ["Automata", ["Regular languages", "DFA and NFA", "Context-free grammars"]],
      ["Computability", ["Turing machines", "Decidability", "Undecidability"]]
    ]
  },
  {
    id: "sub-compiler",
    name: "Compiler Design",
    color: "#c2410c",
    targetWeight: 5,
    chapters: [
      ["Front End", ["Lexical analysis", "Parsing", "Syntax-directed translation"]],
      ["Back End", ["Intermediate code", "Code optimization", "Runtime environments"]]
    ]
  },
  {
    id: "sub-digital",
    name: "Digital Logic",
    color: "#16a34a",
    targetWeight: 6,
    chapters: [
      ["Combinational Logic", ["Boolean algebra", "K-maps", "Combinational circuits"]],
      ["Sequential Logic", ["Flip-flops", "Counters", "State machines"]]
    ]
  }
] as const;

/**
 * Creates a clean seed with all GATE CS subjects, chapters, and topics.
 * Everything starts at zero — no fake progress, no pre-filled data.
 */
export function createSeedData(): StudyOsData {
  const subjects: Subject[] = subjectSpecs.map(({ id, name, color, targetWeight }) => ({ id, name, color, targetWeight }));
  const chapters: Chapter[] = [];
  const topics: Topic[] = [];

  subjectSpecs.forEach((subject) => {
    subject.chapters.forEach(([chapterName, topicNames], chapterIndex) => {
      const chapterId = `${subject.id}-ch-${chapterIndex + 1}`;
      chapters.push({ id: chapterId, subjectId: subject.id, name: chapterName, order: chapterIndex + 1 });
      topicNames.forEach((topicName, topicIndex) => {
        const id = `${chapterId}-topic-${topicIndex + 1}`;
        topics.push({
          id,
          chapterId,
          subjectId: subject.id,
          name: topicName,
          status: "not-started",
          confidence: "low",
          studiedOn: undefined,
          revisionCount: 0,
          nextRevisionOn: undefined,
          forgotten: false,
          pyqSolved: 0,
          pyqTotal: 40,
          mastery: 0
        });
      });
    });
  });

  return {
    subjects,
    chapters,
    topics,
    studyBlocks: [],
    mockTests: [],
    vaultNotes: []
  };
}
