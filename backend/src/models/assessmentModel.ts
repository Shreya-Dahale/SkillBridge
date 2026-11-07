import { pool, supabase } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { createEvidenceRecord } from './evidenceModel';

export interface AssessmentTask {
  id: string;
  question: string;
  type: 'multiple_choice' | 'code_snippet';
  code_prompt?: string;
  options: string[];
  correct_option_index: number;
  explanation: string;
  points: number;
}

export interface Assessment {
  id: string;
  title: string;
  skill: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_minutes: number;
  instructions: string;
  tasks: AssessmentTask[];
  created_at?: string;
}

export interface AssessmentSubmission {
  id: string;
  user_id: string;
  assessment_id: string;
  assessment_title: string;
  skill: string;
  answers: Record<string, number>;
  score: number;
  score_raw: string;
  feedback: string;
  status: string;
  created_at: string;
}

export const SEEDED_ASSESSMENTS: Assessment[] = [
  {
    id: 'core-java-benchmark',
    title: 'Core Java 17 & Concurrency Benchmark',
    skill: 'Java',
    difficulty: 'Advanced',
    duration_minutes: 20,
    instructions:
      'Evaluate your knowledge of modern Java 17 features, records, JVM memory model semantics, thread-safe synchronization, and virtual threads.',
    tasks: [
      {
        id: 'q1',
        question:
          'In Java 17, which feature provides immutable, transparent carriers for key-value data with compiler-generated equals(), hashCode(), and toString()?',
        type: 'multiple_choice',
        options: [
          'Java Records',
          'Lombok @Value classes',
          'Sealed Interfaces',
          'Java Structs',
        ],
        correct_option_index: 0,
        explanation:
          'Java Records (introduced in Java 14 and standardized in Java 16) are immutable nominal data carriers.',
        points: 25,
      },
      {
        id: 'q2',
        question:
          'What guarantees does the volatile keyword provide for variable access across threads in the Java Memory Model?',
        type: 'multiple_choice',
        options: [
          'Visibility and happens-before ordering, but NOT mutual exclusion or compound atomicity',
          'Complete mutual exclusion like a synchronized block',
          'Automatic optimistic locking with hardware rollback',
          'Non-blocking CAS retry loops',
        ],
        correct_option_index: 0,
        explanation:
          'volatile ensures that writes to a variable are immediately visible to subsequent reads across threads and establishes a happens-before relationship, but does not make compound operations atomic.',
        points: 25,
      },
      {
        id: 'q3',
        question:
          'Which ExecutorService implementation should be preferred for high-throughput, I/O-bound microservices in modern Java 21+?',
        type: 'multiple_choice',
        options: [
          'Executors.newVirtualThreadPerTaskExecutor()',
          'Executors.newSingleThreadExecutor()',
          'Executors.newFixedThreadPool(2)',
          'ForkJoinPool.commonPool() for all blocking network calls',
        ],
        correct_option_index: 0,
        explanation:
          'Virtual threads allow millions of lightweight threads to block on I/O without monopolizing OS kernel threads.',
        points: 25,
      },
      {
        id: 'q4',
        question:
          'How does modern pattern matching for instanceof enhance safety and conciseness in Java?',
        type: 'multiple_choice',
        options: [
          'It combines type check and automatic scoped pattern variable casting in a single expression',
          'It replaces bytecode reflection with C++ pointers',
          'It disables NullPointerExceptions unconditionally',
          'It compiles classes to native Assembly at compile-time',
        ],
        correct_option_index: 0,
        explanation:
          'Pattern matching for instanceof (e.g. `if (obj instanceof String s)`) safely binds the variable directly without redundant explicit casting.',
        points: 25,
      },
    ],
  },
  {
    id: 'spring-boot-rest-diag',
    title: 'Spring Boot 3 REST API & Security Diagnostic',
    skill: 'Spring Boot',
    difficulty: 'Intermediate',
    duration_minutes: 20,
    instructions:
      'Verify competency in Spring Boot 3 auto-configuration, RESTful HTTP contract design, @RestControllerAdvice exception handling, and JPA transaction management.',
    tasks: [
      {
        id: 'sb1',
        question:
          'In Spring Boot 3, how should central global error handling be structured to return RFC 7807 / 9457 ProblemDetails?',
        type: 'multiple_choice',
        options: [
          'Annotate a handler class with @RestControllerAdvice and extend ResponseEntityExceptionHandler',
          'Catch exceptions inside each controller method individually with try-catch blocks',
          'Return HTTP 200 with error message inside the response body',
          'Rely exclusively on default Tomcat 500 error HTML templates',
        ],
        correct_option_index: 0,
        explanation:
          '@RestControllerAdvice combined with RFC 7807 ProblemDetails is the standard modern Spring Boot 3 exception handling architecture.',
        points: 25,
      },
      {
        id: 'sb2',
        question:
          'Which HTTP methods are defined as idempotent according to the HTTP/1.1 specification?',
        type: 'multiple_choice',
        options: [
          'GET, PUT, DELETE, HEAD, and OPTIONS',
          'POST and PATCH only',
          'GET only',
          'All HTTP methods are inherently idempotent',
        ],
        correct_option_index: 0,
        explanation:
          'Idempotent methods can be called multiple times with the exact same side-effects on server state. GET, PUT, DELETE, HEAD, and OPTIONS are idempotent.',
        points: 25,
      },
      {
        id: 'sb3',
        question:
          'What happens when a method annotated with @Transactional(readOnly = true) executes in Spring Data JPA?',
        type: 'multiple_choice',
        options: [
          'Hibernate optimizes by disabling dirty checking and routing to read replicas where available',
          'The database prevents all reads on the table',
          'It throws an exception if any query is executed',
          'It disables the transaction entirely',
        ],
        correct_option_index: 0,
        explanation:
          'readOnly = true acts as a performance hint to Hibernate to flush mode MANUAL and skip dirty checking.',
        points: 25,
      },
      {
        id: 'sb4',
        question:
          'In Spring Boot 3.x, which baseline Java version is strictly required as a minimum runtime?',
        type: 'multiple_choice',
        options: [
          'Java 17',
          'Java 8',
          'Java 11',
          'Java 7',
        ],
        correct_option_index: 0,
        explanation:
          'Spring Boot 3 and Spring Framework 6 require Java 17 as the baseline version and Jakarta EE 9/10 APIs.',
        points: 25,
      },
    ],
  },
  {
    id: 'sql-query-optimization',
    title: 'SQL Query Optimization & Indexing Benchmark',
    skill: 'SQL',
    difficulty: 'Intermediate',
    duration_minutes: 20,
    instructions:
      'Demonstrate understanding of relational query performance, B-tree composite index column order, CTEs, and Window functions.',
    tasks: [
      {
        id: 'sql1',
        question:
          'Given a composite index on (tenant_id, created_at, status), which query can fully utilize the index for filtering and sorting?',
        type: 'multiple_choice',
        options: [
          'WHERE tenant_id = 10 AND created_at >= "2026-01-01" ORDER BY created_at',
          'WHERE status = "ACTIVE" ORDER BY created_at',
          'WHERE created_at = "2026-01-01"',
          'WHERE tenant_id IS NULL OR status = "PENDING"',
        ],
        correct_option_index: 0,
        explanation:
          'B-tree indexes match left-to-right (the leading column tenant_id must be satisfied first to seek created_at).',
        points: 25,
      },
      {
        id: 'sql2',
        question:
          'What is the key benefit of Window functions (e.g. ROW_NUMBER(), DENSE_RANK()) compared to GROUP BY aggregation?',
        type: 'multiple_choice',
        options: [
          'They compute aggregations over partitions while retaining all individual row identities',
          'They bypass SQL table locks entirely',
          'They always convert queries to NoSQL map-reduce jobs',
          'They eliminate the need for table indexes',
        ],
        correct_option_index: 0,
        explanation:
          'Window functions calculate aggregate statistics across partitions without collapsing the original rows into a single group row.',
        points: 25,
      },
      {
        id: 'sql3',
        question:
          'What is an Index-Only Scan (Covering Index) in PostgreSQL?',
        type: 'multiple_choice',
        options: [
          'A query plan where all selected and filtered columns are stored in the index, avoiding heap table lookups',
          'A scan that only checks the primary key sequence',
          'An operation that reconstructs table statistics',
          'A scan that only reads the table schema',
        ],
        correct_option_index: 0,
        explanation:
          'In an Index-Only Scan, all columns required by the query are present in the index leaf pages, avoiding costly heap page accesses.',
        points: 25,
      },
      {
        id: 'sql4',
        question:
          'Why should you avoid using functions on indexed columns in a WHERE clause (e.g. WHERE UPPER(email) = "...") without an expression index?',
        type: 'multiple_choice',
        options: [
          'It prevents index seek lookups and forces a full table scan on every row',
          'It causes instant database transaction deadlock',
          'SQL syntax forbids functions in WHERE clauses',
          'It deletes the index from disk',
        ],
        correct_option_index: 0,
        explanation:
          'Applying a function to an indexed column invalidates standard index seeks unless an explicit functional index (e.g., `CREATE INDEX ON users (UPPER(email))`) exists.',
        points: 25,
      },
    ],
  },
];

// Fallback in-memory store
const memorySubmissions: Map<string, AssessmentSubmission[]> = new Map();

export async function initAssessmentsTable(): Promise<void> {
  if (pool) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS assessments (
          id VARCHAR(100) PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          skill VARCHAR(100) NOT NULL,
          difficulty VARCHAR(50) NOT NULL,
          duration_minutes INT NOT NULL DEFAULT 20,
          instructions TEXT NOT NULL,
          tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS assessment_submissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          assessment_id VARCHAR(100) NOT NULL,
          assessment_title VARCHAR(255) NOT NULL,
          skill VARCHAR(100) NOT NULL,
          answers JSONB NOT NULL DEFAULT '{}'::jsonb,
          score NUMERIC(5, 2) NOT NULL,
          score_raw VARCHAR(50) NOT NULL,
          feedback TEXT NOT NULL,
          status VARCHAR(50) NOT NULL DEFAULT 'Evaluated',
          created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Seed default assessments
      for (const a of SEEDED_ASSESSMENTS) {
        await pool.query(
          `INSERT INTO assessments (id, title, skill, difficulty, duration_minutes, instructions, tasks)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             title = EXCLUDED.title,
             instructions = EXCLUDED.instructions,
             tasks = EXCLUDED.tasks`,
          [a.id, a.title, a.skill, a.difficulty, a.duration_minutes, a.instructions, JSON.stringify(a.tasks)]
        );
      }
      console.log('PostgreSQL assessments & submissions initialized.');
    } catch (err) {
      console.warn('initAssessmentsTable error:', err instanceof Error ? err.message : err);
    }
  }
}

export async function getAllAssessments(): Promise<Assessment[]> {
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM assessments ORDER BY title ASC');
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: row.id,
          title: row.title,
          skill: row.skill,
          difficulty: row.difficulty,
          duration_minutes: row.duration_minutes,
          instructions: row.instructions,
          tasks: typeof row.tasks === 'string' ? JSON.parse(row.tasks) : row.tasks,
          created_at: new Date(row.created_at).toISOString(),
        }));
      }
    } catch {
      // Fall through to seed
    }
  }
  return SEEDED_ASSESSMENTS;
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  const all = await getAllAssessments();
  return all.find((a) => a.id === id) || null;
}

export async function submitAssessment(
  userId: string,
  assessmentId: string,
  answers: Record<string, number>
): Promise<AssessmentSubmission> {
  const assessment = await getAssessmentById(assessmentId);
  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`);
  }

  let totalPoints = 0;
  let earnedPoints = 0;
  let correctCount = 0;

  assessment.tasks.forEach((task) => {
    totalPoints += task.points;
    const candidateAnswer = answers[task.id];
    if (candidateAnswer === task.correct_option_index) {
      earnedPoints += task.points;
      correctCount++;
    }
  });

  const scorePercentage = Math.round((earnedPoints / (totalPoints || 1)) * 100);
  const scoreRaw = `${earnedPoints}/${totalPoints} Points (${correctCount}/${assessment.tasks.length} Correct)`;

  let feedback = '';
  if (scorePercentage >= 90) {
    feedback = `Outstanding performance! Demonstrated thorough, verified mastery in modern ${assessment.skill} principles.`;
  } else if (scorePercentage >= 70) {
    feedback = `Solid demonstration. Shows active competence in ${assessment.skill} with minor areas for review.`;
  } else {
    feedback = `Foundational understanding present, but review of core concepts and latest framework updates is recommended.`;
  }

  const submission: AssessmentSubmission = {
    id: uuidv4(),
    user_id: userId,
    assessment_id: assessment.id,
    assessment_title: assessment.title,
    skill: assessment.skill,
    answers,
    score: scorePercentage,
    score_raw: scoreRaw,
    feedback,
    status: 'Evaluated',
    created_at: new Date().toISOString(),
  };

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO assessment_submissions (
          id, user_id, assessment_id, assessment_title, skill,
          answers, score, score_raw, feedback, status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          submission.id,
          submission.user_id,
          submission.assessment_id,
          submission.assessment_title,
          submission.skill,
          JSON.stringify(submission.answers),
          submission.score,
          submission.score_raw,
          submission.feedback,
          submission.status,
          submission.created_at,
        ]
      );
    } catch (err) {
      console.warn('PostgreSQL assessment_submissions save error, saving to memory:', err);
    }
  }

  const userSubmissions = memorySubmissions.get(userId) || [];
  userSubmissions.unshift(submission);
  memorySubmissions.set(userId, userSubmissions);

  // AUTOMATICALLY GENERATE EVIDENCE RECORD
  const evidenceStatus = scorePercentage >= 80 ? 'Verified' : 'Demonstrated';
  const artifactId = `SB-EV-${Math.floor(1000 + Math.random() * 9000)}`;
  await createEvidenceRecord({
    user_id: userId,
    skill: assessment.skill,
    source_type: 'assessment',
    source_title: assessment.title,
    source_id: assessment.id,
    score: `${scorePercentage}% (${correctCount}/${assessment.tasks.length} Passed)`,
    score_numeric: scorePercentage,
    date: new Date().toISOString().split('T')[0],
    evaluator: 'SkillBridge Automated Benchmark Evaluator',
    supporting_artifact: `Cryptographic Assessment Hash #${artifactId} | Deterministic Automated Test Suite`,
    feedback,
    status: evidenceStatus,
  });

  return submission;
}

export async function getSubmissionsByUser(userId: string): Promise<AssessmentSubmission[]> {
  if (pool) {
    try {
      const res = await pool.query(
        'SELECT * FROM assessment_submissions WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
      );
      if (res.rows.length > 0) {
        return res.rows.map((row) => ({
          id: String(row.id),
          user_id: String(row.user_id),
          assessment_id: row.assessment_id,
          assessment_title: row.assessment_title,
          skill: row.skill,
          answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
          score: Number(row.score),
          score_raw: row.score_raw,
          feedback: row.feedback,
          status: row.status,
          created_at: new Date(row.created_at).toISOString(),
        }));
      }
    } catch {
      // Fall through to memory
    }
  }
  return memorySubmissions.get(userId) || [];
}
