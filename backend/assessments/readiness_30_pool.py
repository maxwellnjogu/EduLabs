"""
Authoritative 30-Question Readiness Exam Pool for Software Engineering.
Each question:
- 1.0 mark (Total marks: 30.0)
- 30-second timer
- Multiple choice with 4 options and 1 correct answer
- Instructive explanations
- Topics mapped to the 4 Most Challenging Areas:
  1. Software Development Life Cycle (SDLC)
  2. Software Project Management
  3. System Analysis and Design
  4. Verification and Validation
"""

READINESS_30_QUESTIONS = [
    # =========================================================================
    # 1. SOFTWARE DEVELOPMENT LIFE CYCLE (SDLC) (8 Questions)
    # =========================================================================
    {
        "prompt": "Which sequence correctly represents the standard five-phase software lifecycle model?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The standard engineering lifecycle progresses from Requirement Analysis to System Design, Implementation, Testing, and Evolution/Maintenance.",
        "options": [
            {"text": "Requirement Analysis → Design → Implementation → Testing → Evolution", "is_correct": True},
            {"text": "Coding → Testing → Requirement Analysis → Deployment → Evolution", "is_correct": False},
            {"text": "Design → Implementation → Planning → Maintenance → Decommission", "is_correct": False},
            {"text": "Feasibility → Deployment → Unit Testing → Design → Release", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary operational difference between the traditional Waterfall model and Agile methodologies?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Waterfall relies on sequential gates where requirements are fixed upfront, whereas Agile delivers working increments through adaptive, iterative sprint cycles.",
        "options": [
            {"text": "Waterfall uses predictive sequential phases; Agile uses adaptive iterative cycles", "is_correct": True},
            {"text": "Waterfall does not perform testing; Agile tests only after release", "is_correct": False},
            {"text": "Waterfall requires daily standup meetings; Agile forbids documentation", "is_correct": False},
            {"text": "Waterfall is only for mobile apps; Agile is strictly for databases", "is_correct": False},
        ],
    },
    {
        "prompt": "Why are software deployment environments strictly segregated into Development, Staging (QA), and Production?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Segregation protects live user data and service uptime by ensuring experimental code and testing activities cannot corrupt the production environment.",
        "options": [
            {"text": "To prevent untested code and testing artifacts from affecting live production data and uptime", "is_correct": True},
            {"text": "To allow junior developers direct unmonitored write access to live customer credit cards", "is_correct": False},
            {"text": "Because cloud infrastructure providers prohibit running databases in production", "is_correct": False},
            {"text": "To eliminate the need for version control branching systems like Git", "is_correct": False},
        ],
    },
    {
        "prompt": "Modifying a production system to comply with new government data privacy regulations (e.g., GDPR) is categorized under which type of software maintenance?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Adaptive maintenance modifies software to keep pace with changing business, regulatory, hardware, or external platform environments.",
        "options": [
            {"text": "Adaptive Maintenance", "is_correct": True},
            {"text": "Corrective Maintenance", "is_correct": False},
            {"text": "Emergency Bug-Patching", "is_correct": False},
            {"text": "Preventive Refactoring", "is_correct": False},
        ],
    },
    {
        "prompt": "During project initiation, which feasibility dimension examines whether the team possesses the required programming languages, cloud skills, and infrastructure?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Technical feasibility evaluates technical resources, hardware, network capability, and engineering expertise required to construct the system.",
        "options": [
            {"text": "Technical Feasibility", "is_correct": True},
            {"text": "Economic Feasibility", "is_correct": False},
            {"text": "Schedule Feasibility", "is_correct": False},
            {"text": "Legal and Regulatory Feasibility", "is_correct": False},
        ],
    },
    {
        "prompt": "Which statement reflects a core value explicitly articulated in the Agile Manifesto?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The Agile Manifesto values working software over comprehensive documentation while recognizing value in both.",
        "options": [
            {"text": "Working software over comprehensive documentation", "is_correct": True},
            {"text": "Following a fixed contract over customer collaboration", "is_correct": False},
            {"text": "Strict adherence to a predetermined plan over responding to change", "is_correct": False},
            {"text": "Complex processes and automated tools over individuals and interactions", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary purpose of the Sprint Retrospective ceremony in the Scrum framework?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The Sprint Retrospective provides an opportunity for the Scrum team to inspect itself and plan improvements in process, tooling, and team dynamics for future sprints.",
        "options": [
            {"text": "To inspect team performance, relationships, and processes to identify concrete improvements", "is_correct": True},
            {"text": "To demo finished features to end-user stakeholders for commercial billing", "is_correct": False},
            {"text": "To conduct individual performance appraisals and salary adjustments", "is_correct": False},
            {"text": "To write user stories and estimate backlog tasks for the entire annual roadmap", "is_correct": False},
        ],
    },
    {
        "prompt": "What key characteristic distinguishes Boehm's Spiral Model from other lifecycle methodologies?",
        "topic_tag": "Software Development Life Cycle (SDLC)",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The Spiral Model explicitly emphasizes risk assessment and management at every cycle through iterative prototyping.",
        "options": [
            {"text": "Explicit risk analysis and risk management at each iterative spiral iteration", "is_correct": True},
            {"text": "Elimination of design documentation in favor of instantaneous deployment", "is_correct": False},
            {"text": "Prohibition of customer feedback until system retirement", "is_correct": False},
            {"text": "Strict adherence to a single non-repeating linear waterfall progression", "is_correct": False},
        ],
    },

    # =========================================================================
    # 2. SOFTWARE PROJECT MANAGEMENT (7 Questions)
    # =========================================================================
    {
        "prompt": "In Critical Path Method (CPM) project scheduling, what defines an activity that lies on the critical path?",
        "topic_tag": "Software Project Management",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Activities on the critical path have zero total slack (float); any delay directly postpones overall project completion.",
        "options": [
            {"text": "Zero float (slack) time, meaning any delay delays the entire project", "is_correct": True},
            {"text": "Maximum financial expenditure among all planned deliverables", "is_correct": False},
            {"text": "Activities that can be deferred indefinitely without schedule impact", "is_correct": False},
            {"text": "Tasks assigned exclusively to external offshore vendors", "is_correct": False},
        ],
    },
    {
        "prompt": "In the Program Evaluation and Review Technique (PERT), what is the formula for calculating Expected Task Duration (TE)?",
        "topic_tag": "Software Project Management",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "PERT uses a weighted beta distribution: TE = (Optimistic + 4*Most Likely + Pessimistic) / 6.",
        "options": [
            {"text": "TE = (Optimistic + 4 × Most Likely + Pessimistic) / 6", "is_correct": True},
            {"text": "TE = (Optimistic + Most Likely + Pessimistic) / 3", "is_correct": False},
            {"text": "TE = (2 × Optimistic + Most Likely + 2 × Pessimistic) / 5", "is_correct": False},
            {"text": "TE = (Optimistic × Pessimistic) / Most Likely", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the most effective engineering governance practice for mitigating unbudgeted scope creep in software projects?",
        "topic_tag": "Software Project Management",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "A formal Change Control Board (CCB) reviews, assesses schedule and cost impacts, and formally approves or rejects all requested baseline modifications.",
        "options": [
            {"text": "Instituting a formal Change Control Board (CCB) with impact analysis before approval", "is_correct": True},
            {"text": "Permitting developers to add client-requested features verbally without documentation", "is_correct": False},
            {"text": "Halting all communication with stakeholders until initial delivery", "is_correct": False},
            {"text": "Overestimating task deadlines by 500% to conceal feature expansion", "is_correct": False},
        ],
    },
    {
        "prompt": "What core principle is stated by Brooks's Law in software project management?",
        "topic_tag": "Software Project Management",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Brooks's Law states: 'Adding manpower to a late software project makes it later,' due to communication overhead and ramp-up time.",
        "options": [
            {"text": "Adding manpower to a late software project makes it later", "is_correct": True},
            {"text": "Software defects decrease linearly with the number of hours worked per day", "is_correct": False},
            {"text": "Hardware costs double every eighteen months while software efficiency halves", "is_correct": False},
            {"text": "Every software project must allocate exactly 80% of its budget to testing", "is_correct": False},
        ],
    },
    {
        "prompt": "According to the 100% rule of the Work Breakdown Structure (WBS), which condition must be met?",
        "topic_tag": "Software Project Management",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The 100% rule states that the WBS must encompass 100% of the work defined by the project scope and capture all deliverables without omission.",
        "options": [
            {"text": "The WBS must capture 100% of the project scope and all internal/external deliverables", "is_correct": True},
            {"text": "All developers must be allocated to 100% of scheduled tasks simultaneously", "is_correct": False},
            {"text": "100% of the budget must be expended before the architectural design phase begins", "is_correct": False},
            {"text": "Every task in the WBS must take exactly 100 developer hours to complete", "is_correct": False},
        ],
    },
    {
        "prompt": "Purchasing commercial cloud cyber-insurance to handle potential security breach liabilities represents which risk management strategy?",
        "topic_tag": "Software Project Management",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Risk Transference shifts the financial or operational consequence of a risk to a third party (such as an insurer or cloud vendor).",
        "options": [
            {"text": "Risk Transference", "is_correct": True},
            {"text": "Risk Avoidance", "is_correct": False},
            {"text": "Risk Mitigation", "is_correct": False},
            {"text": "Risk Acceptance", "is_correct": False},
        ],
    },
    {
        "prompt": "Why do Agile teams use modified Fibonacci sequence values (1, 2, 3, 5, 8, 13, 21...) for Planning Poker story point estimation?",
        "topic_tag": "Software Project Management",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The non-linear spacing reflects that uncertainty and estimation variance grow exponentially as user story size and complexity increase.",
        "options": [
            {"text": "Exponential growth reflects increasing uncertainty and complexity as task size grows", "is_correct": True},
            {"text": "Because computer processors can only calculate Fibonacci integers efficiently", "is_correct": False},
            {"text": "To prevent project managers from converting story points into actual sprint days", "is_correct": False},
            {"text": "Because government procurement contracts legally mandate Fibonacci series values", "is_correct": False},
        ],
    },

    # =========================================================================
    # 3. SYSTEM ANALYSIS AND DESIGN (8 Questions)
    # =========================================================================
    {
        "prompt": "Which of the following statements represents a Non-Functional Requirement (NFR)?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Response time, throughput, security, and availability are non-functional quality attributes, whereas specific user operations are functional requirements.",
        "options": [
            {"text": "The portal must process checkout transactions in under 200 milliseconds under a 1,000-user load", "is_correct": True},
            {"text": "A student can search for course modules by title or department code", "is_correct": False},
            {"text": "The system shall send a password reset email when the user submits their registered email", "is_correct": False},
            {"text": "Lecturers can upload PDF lecture slides to the weekly curriculum repository", "is_correct": False},
        ],
    },
    {
        "prompt": "In a UML Class Diagram, what does a solid filled black diamond at the relationship end indicate?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "A filled black diamond denotes Composition (strong containment) where the child part cannot exist independently of the parent lifecycle.",
        "options": [
            {"text": "Composition: a strong relationship where the part cannot exist without the whole", "is_correct": True},
            {"text": "Aggregation: a weak reference where parts retain independent existence", "is_correct": False},
            {"text": "Generalization / Inheritance: subclass inheriting attributes from a superclass", "is_correct": False},
            {"text": "Dependency: temporary reference through a method argument parameter", "is_correct": False},
        ],
    },
    {
        "prompt": "In a UML Sequence Diagram, what is represented by a vertical dashed line extending downward from an object box?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The vertical dashed line is an Object Lifeline, showing the chronological existence of that participant during interaction.",
        "options": [
            {"text": "Object Lifeline representing the participant's chronological existence over time", "is_correct": True},
            {"text": "An unhandled exception terminating the database connection pool", "is_correct": False},
            {"text": "A synchronous RPC call waiting for a response timeout", "is_correct": False},
            {"text": "An inheritance boundary between superclass and subclass", "is_correct": False},
        ],
    },
    {
        "prompt": "Which Gang of Four (GoF) creational design pattern ensures a class has only one instance and provides a single global access point?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The Singleton pattern restricts class instantiation to a single object and provides a synchronized global accessor.",
        "options": [
            {"text": "Singleton Pattern", "is_correct": True},
            {"text": "Abstract Factory Pattern", "is_correct": False},
            {"text": "Builder Pattern", "is_correct": False},
            {"text": "Prototype Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "Which behavioral design pattern defines a family of algorithms, encapsulates each one into separate classes, and makes them interchangeable at runtime?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The Strategy pattern enables selecting different algorithmic implementations (such as payment or compression strategies) dynamically without client modifications.",
        "options": [
            {"text": "Strategy Pattern", "is_correct": True},
            {"text": "Decorator Pattern", "is_correct": False},
            {"text": "Observer Pattern", "is_correct": False},
            {"text": "Facade Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary architectural goal of using Layered (N-Tier) Architecture in software engineering?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Layered architecture enforces separation of concerns: UI/presentation, business logic, and database persistence operate in decoupled tiers.",
        "options": [
            {"text": "Separation of concerns so each tier can be modified or tested independently", "is_correct": True},
            {"text": "Elimination of relational database schema constraints and foreign keys", "is_correct": False},
            {"text": "Ensuring every component is written in identical assembly language routines", "is_correct": False},
            {"text": "Forcing all web API traffic through a single monolithic global function", "is_correct": False},
        ],
    },
    {
        "prompt": "In modular software design, what ideal structural relationship between cohesion and coupling should engineers strive for?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "High cohesion ensures modules focus on single well-defined duties; loose coupling minimizes interdependent links between separate modules.",
        "options": [
            {"text": "High Cohesion within modules and Loose Coupling between modules", "is_correct": True},
            {"text": "Low Cohesion within modules and High Coupling between modules", "is_correct": False},
            {"text": "Low Cohesion with zero encapsulation across all classes", "is_correct": False},
            {"text": "Complete absence of both cohesion and coupling in functional systems", "is_correct": False},
        ],
    },
    {
        "prompt": "In the Model-View-Controller (MVC) architectural pattern, what is the responsibility of the Controller component?",
        "topic_tag": "System Analysis and Design",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "The Controller intercepts user input, processes commands, communicates with model entities, and chooses which view to render.",
        "options": [
            {"text": "Accepts incoming user input, delegates business logic, and updates model/view states", "is_correct": True},
            {"text": "Directly renders visual HTML styling and rasterizes bitmap graphics", "is_correct": False},
            {"text": "Physically persists data records into relational disk storage partitions", "is_correct": False},
            {"text": "Manages network routing between physical TCP/IP backbone routers", "is_correct": False},
        ],
    },

    # =========================================================================
    # 4. VERIFICATION AND VALIDATION (7 Questions)
    # =========================================================================
    {
        "prompt": "According to software engineering standards, how is 'Verification' distinguished from 'Validation'?",
        "topic_tag": "Verification and Validation",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Verification asks: 'Are we building the product right?' (conforming to specifications). Validation asks: 'Are we building the right product?' (meeting user needs).",
        "options": [
            {"text": "Verification checks specification conformance; Validation checks if user expectations are fulfilled", "is_correct": True},
            {"text": "Verification is executed by customers; Validation is performed solely by IDE compilers", "is_correct": False},
            {"text": "Verification only applies to hardware; Validation only applies to web documentation", "is_correct": False},
            {"text": "Verification and Validation are identical synonyms with zero distinction", "is_correct": False},
        ],
    },
    {
        "prompt": "If a software input field accepts age integer values between 18 and 65 (inclusive), which test inputs represent Boundary Value Analysis (BVA)?",
        "topic_tag": "Verification and Validation",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "BVA examines the exact boundary limits and their immediate outer neighbors: 17, 18, 19 and 64, 65, 66.",
        "options": [
            {"text": "17, 18, 19 and 64, 65, 66", "is_correct": True},
            {"text": "25, 30, 40, and 50", "is_correct": False},
            {"text": "-100, 0, and 1000", "is_correct": False},
            {"text": "18.5, 35.2, and 64.9", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the core objective of Equivalence Partitioning in black-box test design?",
        "topic_tag": "Verification and Validation",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Equivalence partitioning divides the input domain into classes where all values in a class are presumed to trigger the same system behavior, reducing redundant tests.",
        "options": [
            {"text": "Partitioning inputs into classes where any representative value reveals the same behavior", "is_correct": True},
            {"text": "Executing every branch in the source code exactly once during compile time", "is_correct": False},
            {"text": "Generating infinite random inputs to stress test memory leaks", "is_correct": False},
            {"text": "Converting all variable identifiers into lowercase equivalent ASCII codes", "is_correct": False},
        ],
    },
    {
        "prompt": "Given a control flow graph with 10 edges (E), 7 nodes (N), and 1 connected component (P=1), what is its McCabe Cyclomatic Complexity V(G)?",
        "topic_tag": "Verification and Validation",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "McCabe's formula is V(G) = E - N + 2P. Here: 10 - 7 + 2(1) = 5 linearly independent execution paths.",
        "options": [
            {"text": "5 (Calculated as 10 - 7 + 2 = 5 basis paths)", "is_correct": True},
            {"text": "3 (Calculated as 10 - 7 = 3 basis paths)", "is_correct": False},
            {"text": "19 (Calculated as 10 + 7 + 2 = 19 basis paths)", "is_correct": False},
            {"text": "14 (Calculated as 2 × 7 = 14 basis paths)", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary rationale for running an automated Regression Test Suite after committing a minor bug fix?",
        "topic_tag": "Verification and Validation",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Regression testing confirms that newly introduced code changes, fixes, or optimizations have not inadvertently broken previously working functionality.",
        "options": [
            {"text": "To confirm that the fix has not inadvertently introduced new defects into existing working features", "is_correct": True},
            {"text": "To benchmark the physical clock frequency of developer workstations", "is_correct": False},
            {"text": "To erase previous test history and reset code coverage statistics to zero", "is_correct": False},
            {"text": "To automatically convert SQL queries into NoSQL JSON document collections", "is_correct": False},
        ],
    },
    {
        "prompt": "Which defect-detection technique enables identifying security vulnerabilities, resource leaks, and style violations without executing the code?",
        "topic_tag": "Verification and Validation",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Static Code Analysis and peer code reviews analyze source code syntactically and semantically without executing the program.",
        "options": [
            {"text": "Static Code Analysis and Peer Code Reviews", "is_correct": True},
            {"text": "Stress and Volume Performance Testing", "is_correct": False},
            {"text": "Dynamic Fuzz Testing with Random Memory Injection", "is_correct": False},
            {"text": "User Acceptance Testing (UAT) in Staging", "is_correct": False},
        ],
    },
    {
        "prompt": "How does Black-Box testing differ fundamentally from White-Box testing?",
        "topic_tag": "Verification and Validation",
        "marks": 1.0,
        "timer_seconds": 30,
        "explanation": "Black-Box testing evaluates external behavior against functional requirements without internal code visibility; White-Box testing leverages internal logic and path structure.",
        "options": [
            {"text": "Black-Box tests external requirements without code visibility; White-Box tests internal paths and structures", "is_correct": True},
            {"text": "Black-Box is performed solely in dark mode IDEs; White-Box is run on high-contrast monitors", "is_correct": False},
            {"text": "Black-Box testing is executed exclusively after software deprecation; White-Box is run before planning", "is_correct": False},
            {"text": "Black-Box testing requires compiling source code; White-Box operates strictly on compiled binaries", "is_correct": False},
        ],
    },
]
