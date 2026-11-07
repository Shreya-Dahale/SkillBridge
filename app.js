/**
 * SkillBridge - AI-Assisted Career Re-Entry Platform
 * Candidate-Side Interactive Prototype
 * Candidate: Priya Sharma
 */

// Initial Seed Data with LocalStorage Persistence
const INITIAL_DATA = {
  candidate: {
    name: "Priya Sharma",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256",
    title: "Senior Java Backend Developer (Returning Professional)",
    email: "priya.sharma@example.com",
    experienceYears: 4,
    breakYears: 3,
    breakReason: "Maternity & Family Caregiving",
    readinessScore: 68,
    targetRole: "Java Backend Developer",
    resumeUploaded: true,
    resumeName: "Priya_Sharma_Resume.pdf",
    resumeDate: "Oct 28, 2026",
  },
  skills: [
    {
      id: "java",
      name: "Java (Core & OOP)",
      category: "Backend",
      status: "Verified",
      score: "18/20 Tests Passed",
      scorePercent: 90,
      evidence: "Deterministic unit test suite passed. Demonstrates Java 17 records, streams, and concurrency handling.",
      date: "24 Oct 2026",
      hash: "SB-EV-9481",
      shareable: true,
      historical: "4 Years",
      targetRequired: true,
    },
    {
      id: "sql",
      name: "SQL & Relational Databases",
      category: "Database",
      status: "Demonstrated",
      score: "9/10 Queries Passed",
      scorePercent: 90,
      evidence: "Complex multi-table joins, subqueries, and execution plan indexing benchmarked on PostgreSQL.",
      date: "26 Oct 2026",
      hash: "SB-EV-9482",
      shareable: true,
      historical: "3.5 Years",
      targetRequired: true,
    },
    {
      id: "rest",
      name: "REST APIs & Architecture",
      category: "Backend",
      status: "Demonstrated",
      score: "100% Endpoints Validated",
      scorePercent: 100,
      evidence: "RESTful standard HTTP conventions, JWT authentication, and pagination implemented in live sandbox.",
      date: "27 Oct 2026",
      hash: "SB-EV-9483",
      shareable: true,
      historical: "3 Years",
      targetRequired: true,
    },
    {
      id: "spring",
      name: "Spring Boot 3.x",
      category: "Framework",
      status: "Needs Refresh",
      score: "In Progress (Module 3/5)",
      scorePercent: 60,
      evidence: "Historical Spring 4 MVC experience. Updating to Spring Boot 3 auto-configuration and Spring Data JPA.",
      date: "Ongoing",
      hash: "SB-EV-9484",
      shareable: false,
      historical: "3 Years",
      targetRequired: true,
    },
    {
      id: "python",
      name: "Python (Data & Scripting)",
      category: "Backend / Scripting",
      status: "Demonstrated",
      score: "88% Practical Tasks Passed",
      scorePercent: 88,
      evidence: "Automated JSON processing scripts, REST client automation, and data normalization routines.",
      date: "22 Oct 2026",
      hash: "SB-EV-9485",
      shareable: true,
      historical: "1 Year",
      targetRequired: false,
    },
    {
      id: "docker",
      name: "Docker & Container Basics",
      category: "DevOps / Cloud",
      status: "Developing",
      score: "Sandbox Labs in Progress",
      scorePercent: 45,
      evidence: "Multi-stage Dockerfile creation and containerizing Spring Boot microservice.",
      date: "Planned for Nov 2",
      hash: "SB-EV-9486",
      shareable: false,
      historical: "Limited",
      targetRequired: true,
    }
  ],
  companyProjects: [
    {
      id: "proj-1",
      title: "Enterprise Order Processing REST API",
      provider: "CloudScale Partner Sandbox",
      skills: ["Java 17", "Spring Boot", "REST API", "JUnit 5"],
      level: "Advanced",
      duration: "2-3 Weeks (15 Hours)",
      status: "In Progress",
      progress: 70,
      description: "Build an idempotent e-commerce order management microservice with RESTful CRUD endpoints, payment webhook validation, optimistic locking, and automated JUnit test cases.",
      rubric: [
        "Pass 15 deterministic integration test cases (HTTP 200/201/400/409)",
        "Implement JWT token authorization filter",
        "Clean repository architecture following standard SOLID principles"
      ],
      submissionEvidence: "12/15 tests passing in CI/CD pipeline",
    },
    {
      id: "proj-2",
      title: "Financial Transaction Fraud Analytics & SQL Optimization",
      provider: "FinCore Technology Task",
      skills: ["PostgreSQL", "SQL Window Functions", "Python", "REST API"],
      level: "Intermediate",
      duration: "1-2 Weeks (10 Hours)",
      status: "Available",
      progress: 0,
      description: "Analyze 250,000 synthetic banking transactions to detect velocity anomalies. Write optimized SQL queries utilizing Window functions and CTEs, followed by a Python reconciliation script.",
      rubric: [
        "Query execution time under 80ms on indexed tables",
        "Correct identification of 100% simulated fraud spikes",
        "Clean documentation and reproducible seed scripts"
      ],
      submissionEvidence: "Not started",
    },
    {
      id: "proj-3",
      title: "Microservices Inventory Sync Engine",
      provider: "Apex Global Tech Lab",
      skills: ["Java", "REST API", "Docker", "Mockito"],
      level: "Advanced",
      duration: "2 Weeks (12 Hours)",
      status: "Available",
      progress: 0,
      description: "Design an asynchronous inventory sync worker that consumes REST events, retries network failures with exponential backoff, and ensures zero lost updates.",
      rubric: [
        "Resilient HTTP client with retry policies",
        "Comprehensive mock testing with 85%+ branch coverage",
        "Docker Compose setup for local containerized verification"
      ],
      submissionEvidence: "Not started",
    },
    {
      id: "proj-4",
      title: "Customer Event Data Ingestion & Validation",
      provider: "InnoHealth Systems Task",
      skills: ["Python", "SQL", "REST API"],
      level: "Intermediate",
      duration: "10 Days (8 Hours)",
      status: "Available",
      progress: 0,
      description: "Develop a lightweight ingestion service that accepts telemetry data payloads, validates schemas against JSON schema standards, and logs clean records to SQL database.",
      rubric: [
        "Strict payload validation with user-friendly error codes",
        "Batch database inserts with rollback on failure",
        "Swagger / OpenAPI specification included"
      ],
      submissionEvidence: "Not started",
    }
  ],
  fellowships: [
    {
      id: "fel-1",
      title: "FinCore Systems Career Comeback Fellowship",
      type: "Enterprise Returnship",
      track: "Java Backend & Cloud",
      duration: "16 Weeks (Paid)",
      stipend: "₹65,000 / month",
      mode: "Hybrid (Bangalore)",
      conversion: "85% Full-Time Offer Rate",
      eligibility: "1+ years career hiatus; 3+ years prior Java or backend experience",
      description: "Structured technical re-entry program designed for returning software engineers. Includes 4 weeks of tech stack calibration, 10 weeks of live project immersion, and 1:1 senior leadership mentoring.",
      applied: false,
    },
    {
      id: "fel-2",
      title: "Apex Global Tech Returnship Program",
      type: "Return-to-Work Track",
      track: "Java Backend & Microservices",
      duration: "12 Weeks (Paid)",
      stipend: "₹60,000 / month",
      mode: "Remote / Flexible Hours",
      conversion: "80% Conversion Rate",
      eligibility: "Career break of 2+ years for caregiving, health, or personal reasons",
      description: "Focuses on rebuilding production muscle memory in Spring Boot and cloud-native systems. Offers flexible working hours, designated peer buddies, and guaranteed final interview rounds.",
      applied: true,
      appliedDate: "28 Oct 2026",
      applicationStatus: "Under Review",
    },
    {
      id: "fel-3",
      title: "CloudScale Women in Tech Re-Entry Cohort",
      type: "Cohort Fellowship",
      track: "Java / Python Distributed Systems",
      duration: "24 Weeks",
      stipend: "₹70,000 / month",
      mode: "Hybrid (Pune)",
      conversion: "90% Direct Placement",
      eligibility: "Previous engineering background in Java, Python, or Systems programming",
      description: "Sponsored returnship cohort pairing returning engineers with high-velocity product teams. Features weekly architecture workshops, mock technical drills, and returnee alumni networks.",
      applied: false,
    },
    {
      id: "fel-4",
      title: "InnoHealth Tech Reboot Fellowship",
      type: "Specialized Returnship",
      track: "REST APIs & Database Engineering",
      duration: "14 Weeks (Paid)",
      stipend: "₹55,000 / month",
      mode: "Remote",
      conversion: "75% Conversion Rate",
      eligibility: "Open to all career returnees with database or backend fundamentals",
      description: "Hands-on fellowship building secure healthcare data pipelines. Designed with psychological safety, gradual workload ramp-up, and dedicated returnee mentors.",
      applied: false,
    }
  ],
  mentors: [
    {
      id: "men-1",
      name: "Maya Raman",
      role: "Principal Software Architect",
      company: "Ex-Returnee • 14 Years Exp",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=256",
      expertise: ["System Design", "Java Microservices", "Career Break Narrative"],
      rating: 4.9,
      reviewsCount: 38,
      slots: ["Mon, Nov 3 • 4:00 PM", "Wed, Nov 5 • 6:30 PM", "Fri, Nov 7 • 5:00 PM"],
      bio: "Took a 4-year career break for childcare and successfully returned to lead large distributed systems. Passionate about helping returnees rebuild confidence in technical interviews.",
    },
    {
      id: "men-2",
      name: "Rajesh Kulkarni",
      role: "VP of Engineering",
      company: "Enterprise Cloud Leader • 18 Years Exp",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256",
      expertise: ["Senior Dev Expectations", "Overcoming Hiring Bias", "Salary Positioning"],
      rating: 4.8,
      reviewsCount: 52,
      slots: ["Tue, Nov 4 • 5:30 PM", "Thu, Nov 6 • 7:00 PM"],
      bio: "Hiring manager who actively champions returnship programs. Specializes in helping candidates frame their career hiatus strategically and excel in engineering leadership interviews.",
    },
    {
      id: "men-3",
      name: "Ananya Deshmukh",
      role: "Staff Backend Engineer & Diversity Lead",
      company: "FinTech Systems • 11 Years Exp",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256",
      expertise: ["Spring Boot 3.x", "REST Architecture", "Live Technical Mock"],
      rating: 5.0,
      reviewsCount: 29,
      slots: ["Sat, Nov 8 • 11:00 AM", "Sun, Nov 9 • 3:00 PM"],
      bio: "Expert backend developer offering rigorous, supportive mock coding rounds for Java, Spring Boot, and database query tuning.",
    },
    {
      id: "men-4",
      name: "Vikram Sengupta",
      role: "Tech Career Coach & Former Recruiter",
      company: "Talent Catalyst • 12 Years Exp",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256",
      expertise: ["Career Gap Explanation", "LinkedIn Optimization", "Offer Negotiation"],
      rating: 4.9,
      reviewsCount: 64,
      slots: ["Wed, Nov 5 • 3:00 PM", "Sat, Nov 8 • 4:30 PM"],
      bio: "Coached over 120 returners into tier-1 tech firms. Guides candidates on how to own their career break without apologetic language.",
    }
  ],
  bookedSessions: [
    {
      id: "book-1",
      mentorName: "Maya Raman",
      mentorRole: "Principal Software Architect",
      topic: "System Design & Java Microservices Architecture Calibration",
      date: "Monday, Nov 3 • 4:00 PM - 4:45 PM",
      status: "Confirmed",
      meetingLink: "https://meet.skillbridge.demo/priya-maya",
      notes: "Focus on discussing 3-year gap narrative and Spring Boot 3 migration architecture."
    }
  ],
  gapChecklist: [
    { id: "c1", label: "Relieving & Experience Letters from Last Employer", checked: true, note: "Documented 4 years as Software Engineer" },
    { id: "c2", label: "SkillBridge Verified Skill Passport (Java & SQL)", checked: true, note: "18/20 Java tests, 9/10 SQL benchmarks verified" },
    { id: "c3", label: "Independent Learning & Refresh Log", checked: true, note: "Completed Java 17 records & Spring Boot 3 modules" },
    { id: "c4", label: "Practical Company Project GitHub Evidence", checked: true, note: "Order Processing REST API repository linked" },
    { id: "c5", label: "Professional Reference Contacts (2 Former Managers/Leads)", checked: true, note: "References confirmed contactable" },
    { id: "c6", label: "Drafted 60-Second Confident Career Hiatus Narrative", checked: false, note: "Use the AI Narrative Generator below" }
  ],
  roadmapSteps: [
    {
      id: "step-1",
      phase: "Phase 1: Diagnostic & Skill Extraction",
      completed: true,
      tasks: [
        { label: "Upload historical resume and extract foundational skills", done: true },
        { label: "Map previous experience (4 yrs Java/SQL) against target role", done: true },
        { label: "Identify critical refresh areas (Spring Boot 3, REST testing)", done: true }
      ]
    },
    {
      id: "step-2",
      phase: "Phase 2: Core Refresher & Assessment Benchmarks",
      completed: true,
      tasks: [
        { label: "Pass Core Java 17 Deterministic Test Suite (Score: 18/20)", done: true },
        { label: "Complete SQL Database Optimization Benchmark (Score: 9/10)", done: true },
        { label: "Validate REST API & Authentication Test Sandbox", done: true }
      ]
    },
    {
      id: "step-3",
      phase: "Phase 3: Practical Company-Provided Project",
      completed: false,
      tasks: [
        { label: "Implement Enterprise Order Processing REST API", done: true },
        { label: "Run integration tests & achieve 85%+ code coverage", done: true },
        { label: "Submit verified project repository for employer evidence layer", done: false }
      ]
    },
    {
      id: "step-4",
      phase: "Phase 4: Fellowship Applications & Mentorship",
      completed: false,
      tasks: [
        { label: "Submit 2 Fellowship & Returnship applications", done: true },
        { label: "Book 1:1 System Design calibration session with Maya Raman", done: true },
        { label: "Practice Behavioral Career-Break narrative drills", done: false }
      ]
    },
    {
      id: "step-5",
      phase: "Phase 5: High-Impact Technical Interviews & Offers",
      completed: false,
      tasks: [
        { label: "Complete scheduled interview with Apex Global Tech", done: false },
        { label: "Share candidate-controlled Skill Freshness Passport link", done: false },
        { label: "Review and evaluate returnship conversion pathways", done: false }
      ]
    }
  ],
  interviewQuestions: [
    {
      id: "q1",
      category: "Technical: Java & Spring",
      difficulty: "Advanced",
      title: "Spring Boot Dependency Injection & Bean Lifecycles",
      question: "Explain how Spring Boot's ApplicationContext manages bean creation, dependency injection, and singleton scope lifecycles. What are the key architectural improvements introduced in Spring Boot 3.x?",
      sampleAnswer: "Spring Boot's ApplicationContext acts as the IoC container. During initialization, it scans component annotations (@Service, @Repository, @Component) and constructs the BeanDefinition registry. By default, beans are instantiated as singletons in eager fashion unless marked @Lazy. The lifecycle progresses through Instantiation, Populating Properties (Dependency Injection via constructor injection), BeanPostProcessors, @PostConstruct initialization, and finally ready for requests until the context closes and invokes PreDestroy. In Spring Boot 3.x, key architectural leaps include baseline requirement of Java 17+, migration from javax.* to jakarta.* namespaces, ahead-of-time (AOT) compilation for native GraalVM images, and native observability with Micrometer tracing.",
      criteria: ["Mentioned IoC & Bean lifecycle stages", "Constructor vs field injection", "Java 17 & Jakarta namespace upgrade in Spring 3.x", "GraalVM AOT compilation"]
    },
    {
      id: "q2",
      category: "Technical: SQL & Databases",
      difficulty: "Intermediate",
      title: "Query Optimization on High-Volume Tables",
      question: "An application experiences severe latency when querying a transaction table with 10 million rows. How would you systematically diagnose and optimize this query in PostgreSQL or MySQL?",
      sampleAnswer: "I would start by executing EXPLAIN ANALYZE on the slow query to examine the query plan, checking whether the database engine is performing sequential table scans instead of index scans. I will look for missing B-tree indexes on WHERE filtering columns and foreign keys used in JOIN operations. Next, I ensure the query avoids functions or expressions on indexed columns (e.g. UPPER(status) prevents standard index usage). For multi-column queries, I evaluate composite indexes with optimal column ordering (equality columns first, range columns last). If the query aggregates historical data, I would consider index covering (INCLUDE clause), table partitioning by date range, and reviewing connection pool settings.",
      criteria: ["EXPLAIN ANALYZE diagnostics", "B-tree & composite indexing strategy", "Preventing full table scans", "Covering indexes and table partitioning"]
    },
    {
      id: "q3",
      category: "Technical: REST APIs",
      difficulty: "Intermediate",
      title: "Idempotency and Error Handling in RESTful Services",
      question: "Why is idempotency critical in REST APIs, particularly for financial or order transactions? How do you implement idempotent POST endpoints and standard error formats?",
      sampleAnswer: "Idempotency guarantees that making the same request multiple times produces the identical side-effect as a single request, preventing catastrophic duplicate billing or inventory deduction during network timeouts or client retries. While GET, PUT, and DELETE are naturally idempotent, POST is not. To make POST idempotent, the client transmits a unique UUID 'Idempotency-Key' in the HTTP header. The backend checks a cache/database (like Redis with a TTL) to see if this key has already succeeded; if so, it returns the cached response without re-executing business logic. For error handling, I follow RFC 7807 (Problem Details for HTTP APIs) returning structured JSON containing type, title, status, detail, and timestamp.",
      criteria: ["Definition of idempotency across HTTP verbs", "Idempotency-Key header pattern", "Distributed lock/cache prevention of duplicate transactions", "RFC 7807 standardized error contracts"]
    },
    {
      id: "q4",
      category: "Behavioral: Career Break Narrative",
      difficulty: "Essential",
      title: "Articulating Your Career Hiatus Confidently",
      question: "You took a 3-year career break. How do you address this period directly and present your current capability to an engineering hiring manager?",
      sampleAnswer: "I took an intentional 3-year career break to dedicate time to maternity and family caregiving—a period that strengthened my resilience, time management, and clarity of purpose. Because technology continues to evolve, I treated my return to the industry with rigorous discipline: over the past several months, I refreshed my foundational 4 years of Java and SQL experience by completing modern Java 17 benchmarks and building an end-to-end Enterprise Order Processing microservice with Spring Boot 3. My SkillBridge Skill Freshness Passport provides concrete, verified proof with 18/20 unit tests passed and active CI/CD repos. I am excited to bring both my seasoned engineering experience and refreshed modern technical capabilities to your backend team.",
      criteria: ["Honest, confident framing without apology", "Clear transition to recent upskilling evidence", "Specific proof points (Java 17, Spring Boot 3, verified tests)", "Focus on forward-looking value for the employer"]
    }
  ],
  applications: [
    {
      id: "app-1",
      company: "Apex Global Tech",
      role: "Java Backend Engineer (Re-Entry Cohort)",
      appliedDate: "18 Oct 2026",
      status: "Interview",
      statusColor: "purple",
      location: "Remote",
      notes: "Technical interview scheduled with Principal Architect for Nov 3. Verified Java and REST evidence shared.",
      matchScore: 92
    },
    {
      id: "app-2",
      company: "FinCore Systems",
      role: "Enterprise Java & Cloud Fellow",
      appliedDate: "21 Oct 2026",
      status: "Assessment Pending",
      statusColor: "amber",
      location: "Bangalore (Hybrid)",
      notes: "Submitted practical Order Processing REST API project. Waiting for automated test results review.",
      matchScore: 88
    },
    {
      id: "app-3",
      company: "CloudScale Software",
      role: "Associate Backend Platform Engineer",
      appliedDate: "24 Oct 2026",
      status: "Under Review",
      statusColor: "blue",
      location: "Pune (Hybrid)",
      notes: "Resume parsed and matched with 85% requirement alignment. Awaiting recruiter review.",
      matchScore: 85
    },
    {
      id: "app-4",
      company: "InnoHealth Systems",
      role: "REST API & Database Developer",
      appliedDate: "27 Oct 2026",
      status: "Applied",
      statusColor: "slate",
      location: "Remote",
      notes: "Direct application submitted with Skill Freshness Passport attached.",
      matchScore: 80
    },
    {
      id: "app-5",
      company: "NextGen Data Solutions",
      role: "Junior-Mid Java Data Engineer",
      appliedDate: "12 Oct 2026",
      status: "Selected",
      statusColor: "emerald",
      location: "Hyderabad",
      notes: "Received offer letter for 16-week returnship leading to full-time SDE-2. Currently reviewing terms.",
      matchScore: 95
    }
  ],
  activities: [
    {
      id: "act-1",
      title: "Completed Java 17 Unit Test Benchmark",
      time: "2 hours ago",
      icon: "check-circle",
      color: "emerald",
      badge: "Verified 90%"
    },
    {
      id: "act-2",
      title: "Booked 1:1 Session with Maya Raman",
      time: "Yesterday",
      icon: "calendar",
      color: "purple",
      badge: "Confirmed"
    },
    {
      id: "act-3",
      title: "Updated Order Processing REST API Code",
      time: "2 days ago",
      icon: "code",
      color: "blue",
      badge: "In Progress"
    },
    {
      id: "act-4",
      title: "Applied to Apex Global Tech Returnship",
      time: "4 days ago",
      icon: "briefcase",
      color: "indigo",
      badge: "Interview Stage"
    }
  ]
};

// Application State Management
class SkillBridgeApp {
  constructor() {
    this.storageKey = "skillbridge_prototype_state_v1";
    this.state = this.loadState();
    this.currentTab = "dashboard";
    this.charts = {};
  }

  loadState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load local storage", e);
    }
    return JSON.parse(JSON.stringify(INITIAL_DATA));
  }

  saveState() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch (e) {
      console.error("Could not save state", e);
    }
  }

  resetData() {
    if (confirm("Reset all prototype data to initial presentation state for Priya Sharma?")) {
      this.state = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.saveState();
      this.initUI();
      this.showToast("Data reset to default presentation state!", "success");
    }
  }

  initUI() {
    this.setupNavigation();
    this.renderCandidateHeader();
    this.renderDashboard();
    this.renderResumeSection();
    this.renderSkillPassport();
    this.renderCompanyProjects();
    this.renderFellowships();
    this.renderMentors();
    this.renderGapDocumentation();
    this.renderRoadmap();
    this.renderInterviewPrep();
    this.renderApplications();
    this.renderRecentActivities();
    
    // Switch to initial tab
    this.switchTab(this.currentTab);
    
    // Refresh Lucide icons if available
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  setupNavigation() {
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", (e) => {
        const target = link.getAttribute("data-tab");
        if (target) {
          this.switchTab(target);
          // close mobile sidebar if open
          const sidebar = document.getElementById("mobile-sidebar");
          if (sidebar && !sidebar.classList.contains("hidden")) {
            sidebar.classList.add("hidden");
          }
        }
      });
    });

    // Mobile nav toggle
    const toggleBtn = document.getElementById("mobile-nav-toggle");
    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const sidebar = document.getElementById("mobile-sidebar");
        if (sidebar) sidebar.classList.toggle("hidden");
      });
    }

    const closeMobileBtn = document.getElementById("close-mobile-sidebar");
    if (closeMobileBtn) {
      closeMobileBtn.addEventListener("click", () => {
        const sidebar = document.getElementById("mobile-sidebar");
        if (sidebar) sidebar.classList.add("hidden");
      });
    }

    // Reset button
    const resetBtn = document.getElementById("btn-reset-data");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => this.resetData());
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    document.querySelectorAll(".nav-link").forEach((link) => {
      if (link.getAttribute("data-tab") === tabId) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    document.querySelectorAll(".tab-content").forEach((section) => {
      if (section.id === `tab-${tabId}`) {
        section.classList.remove("hidden");
      } else {
        section.classList.add("hidden");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });

    // Initialize or resize charts if on dashboard
    if (tabId === "dashboard") {
      setTimeout(() => this.initDashboardCharts(), 50);
    }

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderCandidateHeader() {
    const { candidate } = this.state;
    const nameEl = document.getElementById("header-user-name");
    const roleEl = document.getElementById("header-user-role");
    const avatarEl = document.getElementById("header-user-avatar");
    
    if (nameEl) nameEl.textContent = candidate.name;
    if (roleEl) roleEl.textContent = `${candidate.targetRole} • 4 yrs exp • 3-yr break`;
    if (avatarEl) avatarEl.src = candidate.avatar;
  }

  showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl text-sm font-medium border ${
      type === "success" 
        ? "bg-emerald-900/90 text-emerald-100 border-emerald-700" 
        : type === "warning"
        ? "bg-amber-900/90 text-amber-100 border-amber-700"
        : "bg-slate-900/95 text-white border-slate-700"
    }`;

    let iconSvg = '<svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
    if (type === "success") {
      iconSvg = '<svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.4s ease";
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  }

  // ================= 1. DASHBOARD =================
  renderDashboard() {
    const { candidate, skills, companyProjects, fellowships, applications } = this.state;
    
    // Welcome message
    const welcomeName = document.getElementById("dash-welcome-name");
    if (welcomeName) welcomeName.textContent = candidate.name;

    // Stat counters
    const verifiedCount = skills.filter(s => s.status === "Verified" || s.status === "Demonstrated").length;
    const activeProjectsCount = companyProjects.filter(p => p.status === "In Progress").length;
    const activeAppsCount = applications.length;

    const statVerified = document.getElementById("stat-verified-skills");
    if (statVerified) statVerified.textContent = `${verifiedCount} / ${skills.length}`;

    const statProjects = document.getElementById("stat-active-projects");
    if (statProjects) statProjects.textContent = activeProjectsCount;

    const statReadiness = document.getElementById("stat-readiness-percent");
    if (statReadiness) statReadiness.textContent = `${candidate.readinessScore}%`;

    const statApps = document.getElementById("stat-active-apps");
    if (statApps) statApps.textContent = activeAppsCount;

    // Dashboard Quick Recommended Opportunities
    const oppsContainer = document.getElementById("dash-recommended-opps");
    if (oppsContainer) {
      oppsContainer.innerHTML = fellowships.slice(0, 2).map(f => `
        <div class="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white transition-all">
          <div class="flex items-start justify-between gap-2">
            <div>
              <span class="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700 mb-1.5">${f.type}</span>
              <h4 class="font-bold text-slate-900 text-sm">${f.title}</h4>
              <p class="text-xs text-slate-500 mt-0.5">${f.mode} • Stipend: ${f.stipend}</p>
            </div>
            <button onclick="window.app.switchTab('fellowships')" class="px-3 py-1.5 text-xs font-medium bg-slate-900 hover:bg-indigo-600 text-white rounded-lg transition-colors whitespace-nowrap">
              View
            </button>
          </div>
        </div>
      `).join("");
    }
  }

  initDashboardCharts() {
    if (!window.Chart) return;

    // 1. Radar Chart: Skill Profile Comparison
    const radarCtx = document.getElementById("chart-skill-radar");
    if (radarCtx) {
      if (this.charts.radar) this.charts.radar.destroy();
      
      this.charts.radar = new Chart(radarCtx, {
        type: "radar",
        data: {
          labels: ["Core Java", "SQL / DB", "REST APIs", "Spring Boot", "Python", "Docker/Cloud"],
          datasets: [
            {
              label: "Current Demonstrated Evidence",
              data: [90, 90, 100, 60, 88, 45],
              fill: true,
              backgroundColor: "rgba(99, 102, 241, 0.2)",
              borderColor: "#6366f1",
              pointBackgroundColor: "#4f46e5",
              pointBorderColor: "#fff",
              pointHoverBackgroundColor: "#fff",
              pointHoverBorderColor: "#4f46e5",
            },
            {
              label: "Target Role Requirement",
              data: [85, 85, 90, 85, 60, 75],
              fill: true,
              backgroundColor: "rgba(148, 163, 184, 0.15)",
              borderColor: "#94a3b8",
              borderDash: [4, 4],
              pointBackgroundColor: "#94a3b8",
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            r: {
              angleLines: { color: "#e2e8f0" },
              grid: { color: "#f1f5f9" },
              pointLabels: {
                font: { family: "Plus Jakarta Sans", size: 11, weight: "600" },
                color: "#475569"
              },
              ticks: { display: false, max: 100, min: 0 }
            }
          },
          plugins: {
            legend: {
              position: "bottom",
              labels: { font: { family: "Plus Jakarta Sans", size: 12 }, boxWidth: 12 }
            }
          }
        }
      });
    }

    // 2. Bar Chart: Evidence Breakdown
    const barCtx = document.getElementById("chart-evidence-bar");
    if (barCtx) {
      if (this.charts.bar) this.charts.bar.destroy();

      this.charts.bar = new Chart(barCtx, {
        type: "bar",
        data: {
          labels: ["Java", "SQL", "REST API", "Spring Boot", "Python", "Docker"],
          datasets: [
            {
              label: "Verified Evidence Score (%)",
              data: [90, 90, 100, 60, 88, 45],
              backgroundColor: [
                "#10b981", // Verified
                "#3b82f6", // Demonstrated
                "#3b82f6", // Demonstrated
                "#8b5cf6", // Needs Refresh
                "#3b82f6", // Demonstrated
                "#f59e0b"  // Developing
              ],
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: "#f1f5f9" },
              ticks: { callback: v => v + "%" }
            },
            x: {
              grid: { display: false }
            }
          }
        }
      });
    }
  }

  renderRecentActivities() {
    const list = document.getElementById("dash-activities-list");
    if (!list) return;

    list.innerHTML = this.state.activities.map(act => `
      <div class="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
        <div class="w-8 h-8 rounded-full bg-${act.color}-50 text-${act.color}-600 flex items-center justify-center shrink-0 mt-0.5">
          <i data-lucide="${act.icon}" class="w-4 h-4"></i>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-slate-800 leading-tight">${act.title}</p>
          <span class="text-[11px] text-slate-400">${act.time}</span>
        </div>
        <span class="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-700">
          ${act.badge}
        </span>
      </div>
    `).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 2. RESUME & AI SKILL ANALYSIS =================
  renderResumeSection() {
    const { candidate } = this.state;
    const resumeStatus = document.getElementById("resume-file-info");
    if (resumeStatus) {
      resumeStatus.innerHTML = `
        <div class="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-indigo-600 text-white rounded-lg">
              <i data-lucide="file-text" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-sm font-semibold text-slate-900">${candidate.resumeName}</div>
              <div class="text-xs text-indigo-700">Uploaded • Parsed by SkillBridge AI Engine</div>
            </div>
          </div>
          <span class="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Extracted
          </span>
        </div>
      `;
    }

    // Role selector change
    const roleSelect = document.getElementById("select-target-role");
    if (roleSelect) {
      roleSelect.value = candidate.targetRole;
      roleSelect.onchange = (e) => {
        this.state.candidate.targetRole = e.target.value;
        this.saveState();
        this.renderCandidateHeader();
        this.renderGapAnalysis();
        this.showToast(`Target role updated to: ${e.target.value}`, "info");
      };
    }

    // Interactive file input
    const fileInput = document.getElementById("resume-file-upload");
    if (fileInput) {
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.simulateResumeParsing(file.name);
        }
      };
    }

    this.renderGapAnalysis();
  }

  simulateResumeParsing(filename = "Priya_Sharma_Resume.pdf") {
    const progressModal = document.getElementById("modal-parsing");
    if (progressModal) progressModal.classList.remove("hidden");

    const steps = [
      "Extracting text layers from PDF...",
      "Analyzing historical experience & 3-year hiatus context...",
      "Extracting core competencies (Java, Spring, SQL, REST)...",
      "Benchmarking against Target Role: Java Backend Developer...",
      "Synthesizing Skill Gap Analysis & Recommended Action Items..."
    ];

    let currentStep = 0;
    const stepLabel = document.getElementById("parsing-step-text");
    const progressBar = document.getElementById("parsing-progress-bar");

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        if (stepLabel) stepLabel.textContent = steps[currentStep];
        if (progressBar) progressBar.style.width = `${(currentStep / steps.length) * 100}%`;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (progressModal) progressModal.classList.add("hidden");
          this.state.candidate.resumeName = filename;
          this.state.candidate.resumeDate = "Just now";
          this.saveState();
          this.renderResumeSection();
          this.showToast("Resume parsed & AI Skill Gap re-calculated successfully!", "success");
        }, 500);
      }
    }, 450);
  }

  renderGapAnalysis() {
    const tableBody = document.getElementById("gap-analysis-table-body");
    if (!tableBody) return;

    const role = this.state.candidate.targetRole;
    const { skills } = this.state;

    tableBody.innerHTML = skills.map(skill => {
      let badgeClass = "badge-demonstrated";
      if (skill.status === "Verified") badgeClass = "badge-verified";
      if (skill.status === "Needs Refresh") badgeClass = "badge-refresh";
      if (skill.status === "Developing") badgeClass = "badge-developing";

      let actionBtn = "";
      if (skill.status === "Needs Refresh") {
        actionBtn = `<button onclick="window.app.switchTab('projects')" class="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-medium border border-purple-200">Start Mini-Project</button>`;
      } else if (skill.status === "Developing") {
        actionBtn = `<button onclick="window.app.openQuickAssessmentModal('${skill.id}')" class="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-medium border border-amber-200">Take Assessment</button>`;
      } else {
        actionBtn = `<span class="text-xs text-emerald-600 font-medium flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5"></i> Evidence Ready</span>`;
      }

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-800 text-sm">${skill.name}</div>
            <div class="text-xs text-slate-500">${skill.category}</div>
          </td>
          <td class="py-3 px-4 text-xs font-medium text-slate-600">${skill.historical}</td>
          <td class="py-3 px-4 text-xs font-semibold ${skill.targetRequired ? 'text-indigo-900' : 'text-slate-500'}">
            ${skill.targetRequired ? 'Required for ' + role.split(" ")[0] : 'Preferred'}
          </td>
          <td class="py-3 px-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}">
              ${skill.status}
            </span>
          </td>
          <td class="py-3 px-4">${actionBtn}</td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  // ================= 3. SKILL FRESHNESS PASSPORT =================
  renderSkillPassport() {
    const container = document.getElementById("passport-skills-grid");
    if (!container) return;

    const filterVal = document.getElementById("passport-filter")?.value || "all";
    let filtered = this.state.skills;

    if (filterVal === "verified") {
      filtered = filtered.filter(s => s.status === "Verified" || s.status === "Demonstrated");
    } else if (filterVal === "refresh") {
      filtered = filtered.filter(s => s.status === "Needs Refresh");
    } else if (filterVal === "developing") {
      filtered = filtered.filter(s => s.status === "Developing");
    }

    container.innerHTML = filtered.map(skill => {
      let badgeClass = "badge-demonstrated";
      let statusIcon = "check-circle";
      if (skill.status === "Verified") { badgeClass = "badge-verified"; statusIcon = "award"; }
      if (skill.status === "Needs Refresh") { badgeClass = "badge-refresh"; statusIcon = "refresh-cw"; }
      if (skill.status === "Developing") { badgeClass = "badge-developing"; statusIcon = "trending-up"; }

      return `
        <div class="saas-card p-5 relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50/50 to-transparent -mr-6 -mt-6 rounded-full pointer-events-none"></div>
          
          <div>
            <div class="flex items-start justify-between gap-2 mb-3">
              <div>
                <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">${skill.category}</span>
                <h3 class="font-bold text-slate-900 text-base leading-snug">${skill.name}</h3>
              </div>
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass}">
                <i data-lucide="${statusIcon}" class="w-3.5 h-3.5"></i> ${skill.status}
              </span>
            </div>

            <!-- Score Banner -->
            <div class="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
              <div>
                <div class="text-[10px] text-slate-500 font-medium">ASSESSMENT BENCHMARK</div>
                <div class="text-sm font-bold text-slate-800">${skill.score}</div>
              </div>
              <div class="text-right">
                <span class="text-xs font-bold text-indigo-600">${skill.scorePercent}%</span>
                <div class="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div class="bg-indigo-600 h-full rounded-full" style="width: ${skill.scorePercent}%"></div>
                </div>
              </div>
            </div>

            <!-- Evidence Details -->
            <div class="space-y-2 mb-4">
              <div class="text-xs text-slate-600 leading-relaxed">
                <strong class="text-slate-700">Verifiable Evidence:</strong> ${skill.evidence}
              </div>
              <div class="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                <span>Verified: <strong class="text-slate-600">${skill.date}</strong></span>
                <span class="mono-metric font-semibold text-slate-500">#${skill.hash}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Candidate-Control Toggle -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span class="text-xs text-slate-600 font-medium">Include in Employer Profile</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" ${skill.shareable ? 'checked' : ''} onchange="window.app.toggleSkillSharing('${skill.id}')" class="sr-only peer">
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  toggleSkillSharing(skillId) {
    const skill = this.state.skills.find(s => s.id === skillId);
    if (skill) {
      skill.shareable = !skill.shareable;
      this.saveState();
      this.showToast(`Sharing updated for ${skill.name}: ${skill.shareable ? 'Visible to Employers' : 'Private'}`, "info");
    }
  }

  openShareProfileModal() {
    const modal = document.getElementById("modal-share-passport");
    if (modal) modal.classList.remove("hidden");
  }

  closeShareProfileModal() {
    const modal = document.getElementById("modal-share-passport");
    if (modal) modal.classList.add("hidden");
  }

  copyShareLink() {
    const linkInput = document.getElementById("passport-share-url");
    if (linkInput) {
      navigator.clipboard.writeText(linkInput.value);
      this.showToast("Candidate Evidence Link copied to clipboard!", "success");
    }
  }

  // Quick assessment modal to simulate demonstrating a skill
  openQuickAssessmentModal(skillId) {
    const skill = this.state.skills.find(s => s.id === skillId);
    if (!skill) return;

    const modal = document.getElementById("modal-quick-assessment");
    if (!modal) return;

    document.getElementById("modal-assessment-skill-name").textContent = skill.name;
    document.getElementById("modal-assessment-skill-desc").textContent = `Simulate completing deterministic test suite for ${skill.name}.`;
    modal.setAttribute("data-skill-id", skillId);
    modal.classList.remove("hidden");
  }

  submitQuickAssessment() {
    const modal = document.getElementById("modal-quick-assessment");
    const skillId = modal.getAttribute("data-skill-id");
    const skill = this.state.skills.find(s => s.id === skillId);

    if (skill) {
      skill.status = "Verified";
      skill.score = "19/20 Tests Passed (95%)";
      skill.scorePercent = 95;
      skill.evidence = "Completed automated test suite and sandbox integration benchmark.";
      skill.date = "30 Oct 2026";
      skill.shareable = true;

      this.saveState();
      modal.classList.add("hidden");
      this.renderSkillPassport();
      this.renderGapAnalysis();
      this.renderDashboard();
      this.showToast(`Congratulations! ${skill.name} marked as Verified!`, "success");
    }
  }

  // ================= 4. COMPANY PROJECTS =================
  renderCompanyProjects() {
    const container = document.getElementById("projects-grid");
    if (!container) return;

    const { companyProjects } = this.state;
    container.innerHTML = companyProjects.map(proj => {
      const isInProgress = proj.status === "In Progress";
      return `
        <div class="saas-card p-6 flex flex-col justify-between">
          <div>
            <div class="flex items-start justify-between gap-2 mb-2">
              <div>
                <span class="text-xs font-semibold text-indigo-600 tracking-wide uppercase">${proj.provider}</span>
                <h3 class="font-bold text-slate-900 text-lg leading-tight mt-0.5">${proj.title}</h3>
              </div>
              <span class="px-2.5 py-1 text-xs font-semibold rounded-full ${isInProgress ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'}">
                ${proj.status}
              </span>
            </div>

            <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">${proj.description}</p>

            <div class="flex flex-wrap gap-1.5 mb-4">
              ${proj.skills.map(s => `<span class="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">${s}</span>`).join("")}
            </div>

            <div class="flex items-center justify-between text-xs text-slate-500 py-2 border-t border-slate-100 mb-4">
              <span>Duration: <strong class="text-slate-700">${proj.duration}</strong></span>
              <span>Level: <strong class="text-slate-700">${proj.level}</strong></span>
            </div>

            ${isInProgress ? `
              <div class="mb-4">
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-slate-700">Completion Evidence</span>
                  <span class="text-indigo-600">${proj.progress}%</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-indigo-600 h-full rounded-full transition-all duration-500" style="width: ${proj.progress}%"></div>
                </div>
              </div>
            ` : ''}
          </div>

          <div class="flex items-center gap-2 pt-2">
            <button onclick="window.app.openProjectDetailsModal('${proj.id}')" class="flex-1 py-2 text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-colors">
              View Details
            </button>
            <button onclick="window.app.toggleProjectStatus('${proj.id}')" class="flex-1 py-2 text-xs font-semibold ${isInProgress ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-900 hover:bg-indigo-600 text-white'} rounded-lg transition-colors">
              ${isInProgress ? 'Submit Final Code' : 'Start Project'}
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  openProjectDetailsModal(projId) {
    const proj = this.state.companyProjects.find(p => p.id === projId);
    if (!proj) return;

    const modal = document.getElementById("modal-project-details");
    if (!modal) return;

    document.getElementById("modal-proj-title").textContent = proj.title;
    document.getElementById("modal-proj-provider").textContent = `${proj.provider} • Duration: ${proj.duration}`;
    document.getElementById("modal-proj-desc").textContent = proj.description;
    
    const rubricList = document.getElementById("modal-proj-rubric");
    if (rubricList) {
      rubricList.innerHTML = proj.rubric.map(item => `<li class="flex items-start gap-2"><i data-lucide="check" class="w-4 h-4 text-emerald-600 mt-0.5 shrink-0"></i> <span>${item}</span></li>`).join("");
    }

    const startBtn = document.getElementById("modal-proj-action-btn");
    if (startBtn) {
      startBtn.textContent = proj.status === "In Progress" ? "Mark Submitted (Demo)" : "Accept & Start Project";
      startBtn.onclick = () => {
        this.toggleProjectStatus(projId);
        modal.classList.add("hidden");
      };
    }

    modal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  toggleProjectStatus(projId) {
    const proj = this.state.companyProjects.find(p => p.id === projId);
    if (!proj) return;

    if (proj.status === "In Progress") {
      proj.status = "Submitted & Verified";
      proj.progress = 100;
      this.showToast(`Project '${proj.title}' submitted! Evidence linked to your Skill Passport.`, "success");
    } else if (proj.status === "Available") {
      proj.status = "In Progress";
      proj.progress = 25;
      this.showToast(`Started practical project '${proj.title}'. Starter repo initialized!`, "info");
    } else {
      proj.status = "In Progress";
      proj.progress = 70;
    }

    this.saveState();
    this.renderCompanyProjects();
    this.renderDashboard();
  }

  // ================= 5. FELLOWSHIPS & RETURNSHIPS =================
  renderFellowships() {
    const container = document.getElementById("fellowships-grid");
    if (!container) return;

    const { fellowships } = this.state;
    container.innerHTML = fellowships.map(fel => `
      <div class="saas-card p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-start justify-between gap-3 mb-2">
            <div>
              <span class="inline-block px-2.5 py-0.5 text-xs font-semibold rounded bg-purple-50 text-purple-700 mb-1">${fel.type}</span>
              <h3 class="font-bold text-slate-900 text-lg leading-tight">${fel.title}</h3>
              <p class="text-xs text-indigo-600 font-medium mt-1">Track: ${fel.track}</p>
            </div>
            <span class="px-2.5 py-1 text-xs font-bold rounded-full ${fel.applied ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'} whitespace-nowrap">
              ${fel.applied ? 'Application Sent' : 'Open'}
            </span>
          </div>

          <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">${fel.description}</p>

          <div class="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100">
            <div><span class="text-slate-400 block text-[10px]">DURATION</span><strong class="text-slate-800">${fel.duration}</strong></div>
            <div><span class="text-slate-400 block text-[10px]">STIPEND</span><strong class="text-slate-800">${fel.stipend}</strong></div>
            <div><span class="text-slate-400 block text-[10px]">FORMAT</span><strong class="text-slate-800">${fel.mode}</strong></div>
            <div><span class="text-slate-400 block text-[10px]">CONVERSION</span><strong class="text-emerald-700">${fel.conversion}</strong></div>
          </div>

          <div class="text-[11px] text-slate-500 mb-4 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/60">
            <strong class="text-slate-700">Eligibility:</strong> ${fel.eligibility}
          </div>
        </div>

        <div class="pt-2 flex items-center gap-2">
          <button onclick="window.app.openFellowshipDetailsModal('${fel.id}')" class="flex-1 py-2 text-xs font-semibold border border-slate-300 hover:border-slate-400 text-slate-700 rounded-lg transition-colors">
            Program Details
          </button>
          <button onclick="window.app.applyToFellowship('${fel.id}')" ${fel.applied ? 'disabled' : ''} class="flex-1 py-2 text-xs font-semibold ${fel.applied ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} rounded-lg transition-colors">
            ${fel.applied ? 'Applied' : 'Apply with Passport'}
          </button>
        </div>
      </div>
    `).join("");
  }

  openFellowshipDetailsModal(felId) {
    const fel = this.state.fellowships.find(f => f.id === felId);
    if (!fel) return;

    const modal = document.getElementById("modal-fellowship-details");
    if (!modal) return;

    document.getElementById("modal-fel-title").textContent = fel.title;
    document.getElementById("modal-fel-badge").textContent = `${fel.type} • ${fel.mode}`;
    document.getElementById("modal-fel-desc").textContent = fel.description;
    document.getElementById("modal-fel-duration").textContent = fel.duration;
    document.getElementById("modal-fel-stipend").textContent = fel.stipend;
    document.getElementById("modal-fel-conversion").textContent = fel.conversion;
    document.getElementById("modal-fel-eligibility").textContent = fel.eligibility;

    const applyBtn = document.getElementById("modal-fel-apply-btn");
    if (applyBtn) {
      applyBtn.textContent = fel.applied ? "Application Already Submitted" : "Submit Re-Entry Application";
      applyBtn.disabled = fel.applied;
      applyBtn.onclick = () => {
        this.applyToFellowship(felId);
        modal.classList.add("hidden");
      };
    }

    modal.classList.remove("hidden");
  }

  applyToFellowship(felId) {
    const fel = this.state.fellowships.find(f => f.id === felId);
    if (!fel || fel.applied) return;

    fel.applied = true;
    fel.appliedDate = "30 Oct 2026";
    fel.applicationStatus = "Under Review";

    // Add to Application Tracker
    this.state.applications.unshift({
      id: "app-" + Date.now(),
      company: fel.title.split(" ")[0] + " Cohort",
      role: fel.title,
      appliedDate: "30 Oct 2026",
      status: "Under Review",
      statusColor: "blue",
      location: fel.mode,
      notes: "Applied directly through SkillBridge Returnship Portal with verified Skill Passport attached.",
      matchScore: 90
    });

    this.saveState();
    this.renderFellowships();
    this.renderApplications();
    this.renderDashboard();
    this.showToast(`Application submitted for ${fel.title}! Added to Application Tracker.`, "success");
  }

  // ================= 6. MENTOR SESSIONS =================
  renderMentors() {
    const grid = document.getElementById("mentors-grid");
    if (!grid) return;

    grid.innerHTML = this.state.mentors.map(m => `
      <div class="saas-card p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-start gap-4 mb-4">
            <img src="${m.avatar}" alt="${m.name}" class="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 shadow-sm shrink-0">
            <div>
              <h3 class="font-bold text-slate-900 text-base leading-tight">${m.name}</h3>
              <p class="text-xs font-medium text-slate-600">${m.role}</p>
              <p class="text-[11px] text-indigo-600 font-semibold mt-0.5">${m.company}</p>
              <div class="flex items-center gap-1 mt-1 text-xs text-amber-500 font-semibold">
                <span>★</span> <span>${m.rating}</span> <span class="text-slate-400 font-normal">(${m.reviewsCount} reviews)</span>
              </div>
            </div>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed mb-4">${m.bio}</p>

          <div class="mb-4">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">EXPERTISE & TOPICS</span>
            <div class="flex flex-wrap gap-1">
              ${m.expertise.map(e => `<span class="px-2 py-0.5 text-[11px] font-medium rounded-md bg-indigo-50 text-indigo-700">${e}</span>`).join("")}
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-100">
          <button onclick="window.app.openBookingModal('${m.id}')" class="w-full py-2.5 text-xs font-bold bg-slate-900 hover:bg-indigo-600 text-white rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5">
            <i data-lucide="calendar" class="w-4 h-4"></i> Book 1:1 Strategy Slot
          </button>
        </div>
      </div>
    `).join("");

    // Render Priya's Booked Sessions
    const bookedList = document.getElementById("mentor-booked-sessions");
    if (bookedList) {
      if (this.state.bookedSessions.length === 0) {
        bookedList.innerHTML = `<p class="text-xs text-slate-500 py-4 text-center">No upcoming sessions booked yet.</p>`;
      } else {
        bookedList.innerHTML = this.state.bookedSessions.map(b => `
          <div class="p-4 rounded-xl border border-indigo-200 bg-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-600 text-white">${b.status}</span>
                <span class="text-xs font-semibold text-slate-700">${b.date}</span>
              </div>
              <h4 class="font-bold text-slate-900 text-sm">${b.topic}</h4>
              <p class="text-xs text-slate-600">Mentor: <strong class="text-slate-800">${b.mentorName}</strong> (${b.mentorRole})</p>
              ${b.notes ? `<p class="text-xs text-indigo-800 mt-1 italic">Note: "${b.notes}"</p>` : ''}
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <a href="${b.meetingLink}" target="_blank" onclick="event.preventDefault(); window.app.showToast('Demo Meeting Room would open here.', 'info')" class="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-1">
                <i data-lucide="video" class="w-3.5 h-3.5"></i> Join Demo Room
              </a>
              <button onclick="window.app.cancelBooking('${b.id}')" class="px-3 py-1.5 text-xs font-semibold border border-rose-300 hover:bg-rose-50 text-rose-700 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </div>
        `).join("");
      }
    }

    if (window.lucide) window.lucide.createIcons();
  }

  openBookingModal(mentorId) {
    const mentor = this.state.mentors.find(m => m.id === mentorId);
    if (!mentor) return;

    const modal = document.getElementById("modal-booking");
    if (!modal) return;

    document.getElementById("booking-mentor-name").textContent = mentor.name;
    document.getElementById("booking-mentor-title").textContent = `${mentor.role} • ${mentor.company}`;
    
    // Populate slots
    const slotsContainer = document.getElementById("booking-slots-container");
    if (slotsContainer) {
      slotsContainer.innerHTML = mentor.slots.map((s, idx) => `
        <label class="cursor-pointer border border-slate-200 hover:border-indigo-500 rounded-lg p-2.5 flex items-center gap-2 text-xs font-medium text-slate-700 transition-colors">
          <input type="radio" name="booking-slot" value="${s}" ${idx === 0 ? 'checked' : ''} class="text-indigo-600 focus:ring-indigo-500">
          <span>${s}</span>
        </label>
      `).join("");
    }

    modal.setAttribute("data-mentor-id", mentorId);
    modal.classList.remove("hidden");
  }

  confirmBooking() {
    const modal = document.getElementById("modal-booking");
    const mentorId = modal.getAttribute("data-mentor-id");
    const mentor = this.state.mentors.find(m => m.id === mentorId);
    if (!mentor) return;

    const topic = document.getElementById("booking-topic-select").value;
    const selectedSlot = document.querySelector('input[name="booking-slot"]:checked')?.value || mentor.slots[0];
    const notes = document.getElementById("booking-notes-input").value;

    const newBooking = {
      id: "book-" + Date.now(),
      mentorName: mentor.name,
      mentorRole: mentor.role,
      topic: topic,
      date: selectedSlot,
      status: "Confirmed",
      meetingLink: "https://meet.skillbridge.demo/" + Date.now(),
      notes: notes || "Career break narrative review & technical calibration."
    };

    this.state.bookedSessions.unshift(newBooking);
    
    // Add activity
    this.state.activities.unshift({
      id: "act-" + Date.now(),
      title: `Booked 1:1 with ${mentor.name}`,
      time: "Just now",
      icon: "calendar",
      color: "purple",
      badge: "Confirmed"
    });

    this.saveState();
    modal.classList.add("hidden");
    this.renderMentors();
    this.renderDashboard();
    this.showToast(`1:1 Session with ${mentor.name} confirmed for ${selectedSlot}!`, "success");
  }

  cancelBooking(bookingId) {
    if (confirm("Cancel this mentorship booking?")) {
      this.state.bookedSessions = this.state.bookedSessions.filter(b => b.id !== bookingId);
      this.saveState();
      this.renderMentors();
      this.showToast("Mentorship booking cancelled.", "info");
    }
  }

  // ================= 7. GAP DOCUMENTATION ASSISTANT =================
  renderGapDocumentation() {
    const checklistContainer = document.getElementById("gap-checklist-container");
    if (!checklistContainer) return;

    const { gapChecklist } = this.state;
    const checkedCount = gapChecklist.filter(c => c.checked).length;
    const percent = Math.round((checkedCount / gapChecklist.length) * 100);

    const progressEl = document.getElementById("gap-checklist-percent");
    if (progressEl) progressEl.textContent = `${percent}% Ready`;

    const barEl = document.getElementById("gap-checklist-bar");
    if (barEl) barEl.style.width = `${percent}%`;

    checklistContainer.innerHTML = gapChecklist.map(item => `
      <div class="flex items-start gap-3 p-3 rounded-xl border ${item.checked ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-white'} transition-colors">
        <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="window.app.toggleChecklistItem('${item.id}')" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
        <div class="flex-1">
          <label class="text-xs font-bold ${item.checked ? 'text-slate-800' : 'text-slate-700'} cursor-pointer">${item.label}</label>
          <p class="text-[11px] text-slate-500 mt-0.5">${item.note}</p>
        </div>
        <span class="text-[10px] font-semibold px-2 py-0.5 rounded ${item.checked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}">
          ${item.checked ? 'Documented' : 'Pending'}
        </span>
      </div>
    `).join("");
  }

  toggleChecklistItem(itemId) {
    const item = this.state.gapChecklist.find(i => i.id === itemId);
    if (item) {
      item.checked = !item.checked;
      this.saveState();
      this.renderGapDocumentation();
      this.showToast(`Checklist updated: ${item.label}`, "info");
    }
  }

  generateCareerGapDraft() {
    const reason = document.getElementById("gap-reason-select").value;
    const format = document.getElementById("gap-format-select").value;
    const tone = document.getElementById("gap-tone-select").value;
    const outputEl = document.getElementById("gap-generated-output");

    if (!outputEl) return;

    outputEl.innerHTML = `<div class="flex items-center gap-2 text-indigo-600 py-6 justify-center text-xs font-semibold"><span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span> Generating candidate-controlled evidence narrative...</div>`;

    setTimeout(() => {
      let draftText = "";
      if (format === "pitch") {
        draftText = `\"I took an intentional 3-year career break for ${reason.toLowerCase()}. While stepping away from corporate duties to manage family responsibilities, I remained deeply committed to my professional craft. Over the past 6 months, I methodically refreshed my 4 years of software development experience: completing modern Java 17 and SQL query benchmarks on SkillBridge with a 90%+ verification score, building an asynchronous Order Processing microservice, and upgrading my Spring Boot competencies. I am returning with mature problem-solving abilities, high emotional resilience, and current, hands-on production code evidence ready for day one.\"`;
      } else if (format === "cover") {
        draftText = `\"Following a successful 4-year tenure as a Java Backend Developer, I undertook a planned 3-year career hiatus dedicated to ${reason.toLowerCase()}. Today, I am actively re-entering the tech workforce with refreshed, job-specific technical evidence. Rather than asking employers to rely solely on my historical experience, I have validated my current technical capabilities through SkillBridge's evidence layer: achieving 18/20 tests passed in Java 17 concurrency, benchmarking complex PostgreSQL queries (9/10), and deploying a RESTful order management microservice. I look forward to contributing my renewed technical focus and seasoned engineering discipline to your engineering team.\"`;
      } else {
        draftText = `\"Senior Software Engineer (Java & Backend) returning after a 3-year career break dedicated to ${reason.toLowerCase()}.\n\nProven foundational background in Java, Spring, SQL, and RESTful architectures. Recently refreshed with modern Java 17, Spring Boot 3.x, and containerized microservice workflows, supported by transparent, verifiable benchmark scores in my SkillBridge Skill Freshness Passport.\n\nOpen to high-impact Java Backend Developer roles, Returnships, and technical fellowships.\"`;
      }

      outputEl.innerHTML = `
        <div class="relative group">
          <textarea id="gap-draft-textarea" rows="6" class="w-full text-xs font-normal text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3.5 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed">${draftText}</textarea>
          <div class="mt-2 flex items-center justify-between">
            <span class="text-[11px] text-slate-400">Tone: <strong class="text-slate-600">${tone}</strong> • Ready to copy</span>
            <button onclick="window.app.copyGapDraft()" class="px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1">
              <i data-lucide="copy" class="w-3.5 h-3.5"></i> Copy Narrative
            </button>
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      this.showToast("Career Gap Narrative Draft generated!", "success");
    }, 600);
  }

  copyGapDraft() {
    const textarea = document.getElementById("gap-draft-textarea");
    if (textarea) {
      navigator.clipboard.writeText(textarea.value);
      this.showToast("Draft narrative copied to clipboard!", "success");
    }
  }

  // ================= 8. AI CAREER ROADMAP =================
  renderRoadmap() {
    const container = document.getElementById("roadmap-phases-container");
    if (!container) return;

    const { roadmapSteps } = this.state;

    // calculate total completed tasks
    let totalTasks = 0;
    let doneTasks = 0;
    roadmapSteps.forEach(phase => {
      phase.tasks.forEach(t => {
        totalTasks++;
        if (t.done) doneTasks++;
      });
    });

    const percent = Math.round((doneTasks / totalTasks) * 100);
    const overallBar = document.getElementById("roadmap-overall-bar");
    const overallPercent = document.getElementById("roadmap-overall-percent");
    if (overallBar) overallBar.style.width = `${percent}%`;
    if (overallPercent) overallPercent.textContent = `${percent}% Completed`;

    container.innerHTML = roadmapSteps.map((phase, pIdx) => {
      const allPhaseTasksDone = phase.tasks.every(t => t.done);
      return `
        <div class="relative pl-8 pb-8 last:pb-2">
          <!-- Timeline Vertical Line -->
          ${pIdx < roadmapSteps.length - 1 ? '<div class="absolute left-3.5 top-5 bottom-0 w-0.5 bg-slate-200"></div>' : ''}
          
          <!-- Timeline Circle Indicator -->
          <div class="absolute left-1.5 top-1.5 w-5 h-5 rounded-full border-2 ${allPhaseTasksDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white border-indigo-600 text-indigo-600'} flex items-center justify-center text-[10px] font-bold">
            ${allPhaseTasksDone ? '✓' : pIdx + 1}
          </div>

          <div class="saas-card p-5">
            <div class="flex items-center justify-between mb-3">
              <h4 class="font-bold text-slate-900 text-sm">${phase.phase}</h4>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full ${allPhaseTasksDone ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}">
                ${allPhaseTasksDone ? 'Completed' : 'Active Phase'}
              </span>
            </div>

            <div class="space-y-2">
              ${phase.tasks.map((task, tIdx) => `
                <div class="flex items-center gap-2.5 text-xs text-slate-700">
                  <input type="checkbox" ${task.done ? 'checked' : ''} onchange="window.app.toggleRoadmapTask(${pIdx}, ${tIdx})" class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer">
                  <span class="${task.done ? 'line-through text-slate-400' : 'font-medium'}">${task.label}</span>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  toggleRoadmapTask(pIdx, tIdx) {
    const task = this.state.roadmapSteps[pIdx].tasks[tIdx];
    if (task) {
      task.done = !task.done;
      this.state.roadmapSteps[pIdx].completed = this.state.roadmapSteps[pIdx].tasks.every(t => t.done);
      this.saveState();
      this.renderRoadmap();
      this.showToast("Roadmap progress updated!", "info");
    }
  }

  // ================= 9. INTERVIEW PREPARATION =================
  renderInterviewPrep() {
    const select = document.getElementById("interview-question-select");
    if (!select) return;

    const { interviewQuestions } = this.state;
    select.innerHTML = interviewQuestions.map((q, idx) => `
      <option value="${q.id}">[${q.category}] ${q.title}</option>
    `).join("");

    select.onchange = () => this.loadInterviewQuestion(select.value);

    // Initial load first question
    if (interviewQuestions.length > 0) {
      this.loadInterviewQuestion(interviewQuestions[0].id);
    }
  }

  loadInterviewQuestion(qId) {
    const q = this.state.interviewQuestions.find(item => item.id === qId);
    if (!q) return;

    document.getElementById("interview-q-category").textContent = q.category;
    document.getElementById("interview-q-difficulty").textContent = q.difficulty;
    document.getElementById("interview-q-title").textContent = q.title;
    document.getElementById("interview-q-text").textContent = q.question;
    
    const criteriaList = document.getElementById("interview-q-criteria");
    if (criteriaList) {
      criteriaList.innerHTML = q.criteria.map(c => `<li>• ${c}</li>`).join("");
    }

    document.getElementById("interview-user-answer").value = "";
    document.getElementById("interview-feedback-result").classList.add("hidden");
  }

  loadSampleAnswer() {
    const select = document.getElementById("interview-question-select");
    const q = this.state.interviewQuestions.find(item => item.id === select.value);
    if (q) {
      document.getElementById("interview-user-answer").value = q.sampleAnswer;
      this.showToast("Sample candidate answer loaded for demonstration!", "info");
    }
  }

  submitInterviewAnswer() {
    const answer = document.getElementById("interview-user-answer").value.trim();
    if (!answer) {
      this.showToast("Please write or load an answer to evaluate.", "warning");
      return;
    }

    const resultBox = document.getElementById("interview-feedback-result");
    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `
      <div class="flex items-center justify-center py-6 gap-2 text-indigo-600 text-xs font-semibold">
        <span class="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
        Evaluating technical depth, terminology, and clarity with AI Rubric...
      </div>
    `;

    setTimeout(() => {
      resultBox.innerHTML = `
        <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="p-1.5 bg-emerald-600 text-white rounded-lg"><i data-lucide="check" class="w-4 h-4"></i></span>
              <span class="font-bold text-slate-900 text-sm">AI Evaluation Completed</span>
            </div>
            <div class="text-right">
              <span class="text-xs text-slate-500 block">SIMULATED SCORE</span>
              <span class="text-base font-extrabold text-emerald-700">9.3 / 10</span>
            </div>
          </div>

          <div class="text-xs text-slate-700 leading-relaxed">
            <strong class="text-slate-900 block mb-1">Key Strengths Identified:</strong>
            • Precise technical articulation of lifecycle phases and memory footprint.<br>
            • Accurately highlighted Spring Boot 3 / Java 17 upgrades (Jakarta migration & GraalVM AOT).<br>
            • Confident, professional tone demonstrating production experience.
          </div>

          <div class="text-xs text-slate-600 bg-white/70 p-2.5 rounded-lg border border-emerald-100">
            <strong class="text-slate-800">Coach Suggestion for College Presentation:</strong>
            Highlighting both the historical engineering background and current proof points immediately answers the recruiter's doubt regarding skill freshness.
          </div>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      this.showToast("Answer evaluated successfully! Score: 9.3/10", "success");
    }, 700);
  }

  // ================= 10. APPLICATION TRACKER =================
  renderApplications() {
    const container = document.getElementById("applications-table-body");
    if (!container) return;

    const filter = document.getElementById("app-status-filter")?.value || "all";
    let list = this.state.applications;

    if (filter !== "all") {
      list = list.filter(a => a.status.toLowerCase().includes(filter.toLowerCase()));
    }

    container.innerHTML = list.map(app => {
      const statusOptions = ["Applied", "Under Review", "Assessment Pending", "Interview", "Selected"];
      
      let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
      if (app.status === "Interview") badgeColor = "bg-purple-100 text-purple-800 border-purple-200";
      if (app.status === "Selected") badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
      if (app.status === "Assessment Pending") badgeColor = "bg-amber-100 text-amber-800 border-amber-200";
      if (app.status === "Under Review") badgeColor = "bg-blue-100 text-blue-800 border-blue-200";

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
          <td class="py-3.5 px-4">
            <div class="font-bold text-slate-900 text-sm">${app.role}</div>
            <div class="text-xs text-slate-500 font-medium">${app.company} • ${app.location}</div>
          </td>
          <td class="py-3.5 px-4 text-xs text-slate-600 font-medium">${app.appliedDate}</td>
          <td class="py-3.5 px-4">
            <select onchange="window.app.updateAppStatus('${app.id}', this.value)" class="text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeColor} cursor-pointer focus:outline-none focus:ring-1 focus:ring-indigo-500">
              ${statusOptions.map(opt => `<option value="${opt}" ${app.status === opt ? 'selected' : ''}>${opt}</option>`).join("")}
            </select>
          </td>
          <td class="py-3.5 px-4 text-xs text-slate-600 max-w-xs truncate">${app.notes}</td>
          <td class="py-3.5 px-4 text-right">
            <button onclick="window.app.deleteApplication('${app.id}')" class="text-slate-400 hover:text-rose-600 transition-colors p-1" title="Delete application">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    if (window.lucide) window.lucide.createIcons();
  }

  updateAppStatus(appId, newStatus) {
    const app = this.state.applications.find(a => a.id === appId);
    if (app) {
      app.status = newStatus;
      this.saveState();
      this.renderApplications();
      this.renderDashboard();
      this.showToast(`Application for ${app.company} changed to: ${newStatus}`, "success");
    }
  }

  deleteApplication(appId) {
    if (confirm("Remove this application record?")) {
      this.state.applications = this.state.applications.filter(a => a.id !== appId);
      this.saveState();
      this.renderApplications();
      this.renderDashboard();
      this.showToast("Application removed.", "info");
    }
  }

  openAddAppModal() {
    const modal = document.getElementById("modal-add-application");
    if (modal) modal.classList.remove("hidden");
  }

  saveNewApplication() {
    const company = document.getElementById("new-app-company").value.trim();
    const role = document.getElementById("new-app-role").value.trim();
    const location = document.getElementById("new-app-location").value.trim() || "Remote";
    const status = document.getElementById("new-app-status").value;
    const notes = document.getElementById("new-app-notes").value.trim() || "Applied via SkillBridge";

    if (!company || !role) {
      this.showToast("Please provide company name and role title.", "warning");
      return;
    }

    const newApp = {
      id: "app-" + Date.now(),
      company,
      role,
      appliedDate: "30 Oct 2026",
      status,
      location,
      notes,
      matchScore: 88
    };

    this.state.applications.unshift(newApp);
    this.saveState();
    
    // reset form
    document.getElementById("new-app-company").value = "";
    document.getElementById("new-app-role").value = "";
    document.getElementById("new-app-notes").value = "";
    document.getElementById("modal-add-application").classList.add("hidden");

    this.renderApplications();
    this.renderDashboard();
    this.showToast(`Application for ${company} added successfully!`, "success");
  }
}

// Global initialization
window.addEventListener("DOMContentLoaded", () => {
  window.app = new SkillBridgeApp();
  window.app.initUI();
});
