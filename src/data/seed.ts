import type { Chapter, StudyOsData, Subject, Topic } from "../types";

const subjectSpecs = [
  {
    id: "sub-aptitude",
    name: "General Aptitude",
    color: "#6b7280",
    targetWeight: 15,
    chapters: [
      ["Verbal Aptitude", ["Tenses", "Articles", "Adjectives", "Prepositions", "Conjunctions", "Subject-Verb Agreement", "Parts of Speech", "Selecting Words", "Idioms and Phrases", "Reading Comprehension"]],
      ["Quantitative Aptitude", ["Bar Graph", "Line Graphs", "Pie Chart", "Table Chart", "Ratio and Proportion", "Percentages", "Powers", "Exponents and Logarithms", "Permutations and Combinations", "Series", "Mensuration and Geometry", "Elementary Statistics and Probability"]],
      ["Analytical Aptitude", ["Statement and Conclusions", "Statement and Assumptions", "Syllogisms", "Verbal Analogies", "Number Series", "Alphanumeric Series"]],
      ["Spatial Aptitude", ["Translation", "Rotation", "Scaling", "Mirroring", "Assembling", "Grouping", "Paper Folding", "Cutting"]]
    ]
  },
  {
    id: "sub-eng-math",
    name: "Engineering Mathematics",
    color: "#5b7cfa",
    targetWeight: 7, // Grouped with Discrete for 13
    chapters: [
      ["Linear Algebra", ["Matrices", "Determinants", "System of Linear Equations", "Eigenvalues and Eigenvectors", "LU Decomposition"]],
      ["Calculus", ["Limits, Continuity and Differentiability", "Maxima and Minima", "Mean Value Theorem", "Integration"]],
      ["Probability and Statistics", ["Random Variables", "Uniform, Normal, Exponential, Poisson and Binomial Distributions", "Mean, Median, Mode and Standard Deviation", "Conditional Probability and Bayes Theorem"]]
    ]
  },
  {
    id: "sub-discrete-math",
    name: "Discrete Mathematics",
    color: "#4f46e5",
    targetWeight: 6, // Grouped with Eng Math for 13
    chapters: [
      ["Propositional and First-Order Logic", ["Propositional Logic", "Knowledge Representation in First-Order Logic", "Propositional Equivalences", "Predicates and Quantifiers", "Rules of Inference"]],
      ["Sets, Relations & Functions", ["Set Theory", "Relation and Function", "Recurrence Relations", "Closure of Relations and Warshall's Algorithm", "Representation of Relation in Graphs and Matrices"]],
      ["Partial Order and Lattices", ["Partial Orders and Lattices", "Partial Orders and Lattices (Set-2)", "Elements of POSET", "Hasse Diagrams", "Groups and Monoids"]],
      ["Graphs", ["Graph Theory", "Matching and Coloring", "K-connected Graph and Biconnected Graph"]],
      ["Combinatorics", ["Principle of Counting", "Principle of Inclusion and Exclusion", "Pigeonhole Principle", "Permutations and Combinations", "Recurrence Relations", "Generating Functions"]]
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
  },
  {
    id: "sub-coa",
    name: "Computer Organization and Architecture",
    color: "#d97706",
    targetWeight: 8,
    chapters: [
      ["Architecture Basics", ["Floating Point Representation", "Basics of Computer System & Micr", "Instruction & Addressing Modes"]],
      ["Processor & Control", ["CPU, Data-path & Control Unit", "Pipelining"]],
      ["Memory & I/O", ["Memory & Cache", "I/O Organization"]]
    ]
  },
  {
    id: "sub-pds",
    name: "Programming and Data Structure",
    color: "#0f9f8f",
    targetWeight: 15,
    chapters: [
      ["Programming in C", ["Functions", "Recursion", "Parameter passing", "Pointers", "Arrays"]],
      ["Data Structures", ["Linked lists", "Stacks", "Queues", "Trees", "Binary search trees", "Heaps", "Graphs"]]
    ]
  },
  {
    id: "sub-algo",
    name: "Algorithms",
    color: "#059669",
    targetWeight: 7,
    chapters: [
      ["Analysis", ["Asymptotic notation", "Space and time complexity", "Notations"]],
      ["Design Techniques", ["Searching", "Sorting", "Greedy algorithms", "Dynamic programming", "Divide and conquer"]]
    ]
  },
  {
    id: "sub-toc",
    name: "Theory of Computation",
    color: "#7c3aed",
    targetWeight: 6,
    chapters: [
      ["Automata", ["Regular languages", "DFA and NFA", "Context-free grammars"]],
      ["Computability", ["Turing machines", "Decidability", "Undecidability"]]
    ]
  },
  {
    id: "sub-compiler",
    name: "Compiler Design",
    color: "#c2410c",
    targetWeight: 4,
    chapters: [
      ["Front End", ["Lexical analysis", "Parsing", "Syntax-directed translation"]],
      ["Back End", ["Intermediate code", "Code optimization", "Runtime environments"]]
    ]
  },
  {
    id: "sub-os",
    name: "Operating System",
    color: "#8b5cf6",
    targetWeight: 9,
    chapters: [
      ["Process Management", ["Process Management Basics", "CPU Scheduling", "Threads & Multithreading", "Process Synchronization & Deadlock"]],
      ["Memory & Storage", ["Memory Management", "Virtual Memory", "File System"]]
    ]
  },
  {
    id: "sub-dbms",
    name: "Databases",
    color: "#e11d48",
    targetWeight: 7,
    chapters: [
      ["Relational Model", ["ER model", "Relational algebra", "SQL"]],
      ["Transactions", ["Normalization", "Concurrency control", "Recovery"]]
    ]
  },
  {
    id: "sub-networks",
    name: "Computer Networks",
    color: "#0284c7",
    targetWeight: 10,
    chapters: [
      ["Protocol Stack", ["OSI and TCP/IP", "Transport layer", "Routing"]],
      ["Applications", ["DNS", "HTTP", "Congestion control"]]
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
    mockTests: [],
    vaultNotes: []
  };
}
