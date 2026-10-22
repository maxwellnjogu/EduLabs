"""
SDLC Source Material Content Pool
Curated strictly from Software Development Life Cycle lecture notes,
diagram phases, and comprehensive software engineering syllabi.
"""

SDLC_WEEK1_OVERVIEW = {
    "week_number": 1,
    "title": "Software Development Life Cycle (SDLC) Fundamentals & Agile Methodologies",
    "description": (
        "Core foundational concepts of software engineering: SDLC phases (Requirement Analysis, "
        "Design, Implementation, Testing, Evolution), environments (Dev, QA, Prod), Predictive vs "
        "Adaptive paradigms, Waterfall, and the Scrum Framework."
    ),
    "youtube_url": "https://youtu.be/Fi3_BjVzpqk?si=0Rtpz8UHEO0ehmFl",
    "youtube_title": "Software Development Life Cycle (SDLC) Explained",
    "youtube_description": (
        "Comprehensive visual walkthrough of SDLC phases, comparing traditional linear lifecycle "
        "models with modern iterative methodologies and sprint-based development cycles."
    ),
    "notes_markdown": """# Week 1: Software Development Life Cycle (SDLC) Fundamentals

## 1. What SDLC Means and Why It Is Used
The **Software Development Life Cycle (SDLC)** is a systematic, structured process used by software engineering teams to design, develop, test, deploy, and maintain high-quality software. 

Building modern software is complex and involves many stakeholders. Without an SDLC framework, development projects frequently suffer from:
- **Scope Creep**: Features being added randomly without budget or schedule adjustments.
- **Cost and Schedule Overruns**: Missed deadlines and depleted budgets.
- **Poor Quality and High Defect Rates**: Bugs slipping into production because testing was skipped or rushed.
- **Miscommunication**: Misalignment between client expectations and what developers build.

SDLC provides a clear roadmap, predictable milestones, defined responsibilities, and repeatable engineering standards from initial concept to system retirement.

---

## 2. Planning: Project Goals, Scope, Resources, Cost, Risks & Timeline
The **Planning phase** establishes the business foundation of the project:
- **Project Goals**: Clearly stating what problem the software will solve and the expected business value.
- **Scope**: Outlining boundaries—explicitly defining what will be built and what is out-of-scope.
- **Resources & Cost Estimation**: Calculating budget, hardware, cloud infrastructure, and staffing needs.
- **Timeline & Milestones**: Creating realistic schedules, delivery sprints, and target release dates.
- **Risk Assessment**: Identifying potential technical, organizational, or compliance risks early (such as data privacy laws or third-party API dependencies) with contingency plans.

---

## 3. Analysis: Requirements Gathering, User Needs & System Requirements
During the **Analysis phase**, engineers and business analysts work directly with end-users and stakeholders:
- **Requirements Gathering**: Conducting interviews, focus groups, surveys, and observational studies.
- **User Needs**: Documenting user stories and workflows from the user's perspective.
- **Software Requirements Specification (SRS)**: Formalizing requirements into two categories:
  - *Functional Requirements*: What features the software must perform (e.g., "Students can search for books by author and checkout up to 3 titles").
  - *Non-Functional Requirements*: Quality attributes including performance (response under 200ms), security (role-based encryption), and 99.9% uptime.

---

## 4. Design: System Architecture, Database Design, Interfaces & Workflows
The **Design phase** creates the technical blueprints based on the SRS:
- **System Architecture**: Choosing architectural patterns (e.g., client-server, microservices, layered monolith) and technology stacks.
- **Database Design**: Defining data models, Entity-Relationship Diagrams (ERDs), relational schemas, and indexing strategies.
- **User Interface (UI) & User Experience (UX)**: Developing wireframes, responsive screen mockups, and intuitive navigation flows.
- **Component & API Specifications**: Specifying endpoints, data contracts (JSON schemas), and communication protocols between front-end and back-end services.

---

## 5. Implementation: Coding and Code Review
The **Implementation phase** translates architectural designs into functional computer programs:
- **Modular Programming**: Writing clean, readable code according to established style guides and architectural boundaries.
- **Separation of Concerns**: Dividing logic cleanly between presentation layers (front-end interfaces), business services (back-end logic), and persistence layers (database queries).
- **Code Reviews**: Teammates inspect pull requests to spot edge cases, optimize performance, and verify adherence to security best practices.
- **Version Control**: Managing source code changes using Git branches and automated build validation.

---

## 6. Testing: Finding Defects and Checking Requirements
The **Testing phase** verifies that the system works as intended and is free of critical defects:
- **Unit Testing**: Verifying individual functions and classes in isolation.
- **Integration Testing**: Checking that modules, databases, and APIs work together correctly.
- **System Testing**: Evaluating the complete, integrated application against functional specifications.
- **User Acceptance Testing (UAT)**: Stakeholders and actual users test real-world scenarios to confirm the software meets operational requirements before launch.

---

## 7. Deployment: Releasing the System to Users
The **Deployment phase** delivers the validated software to live environments:
- **Staged Environments**: Promoting releases across controlled stages:
  1. *Development Environment*: Sandbox where engineers build and experiment.
  2. *Quality Assurance / Staging*: Replica of production for automated testing and client validation.
  3. *Production Environment*: Live, hardened servers accessed by actual users and real business data.
- **Automated Pipelines**: Using Continuous Integration and Continuous Deployment (CI/CD) to deploy without manual downtime.

---

## 8. Maintenance: Fixing Defects, Security Updates & Improvements
The **Maintenance phase** begins immediately after launch and typically represents the longest and most costly part of the software life cycle:
- **Corrective Maintenance**: Fixing bugs reported by users in production.
- **Adaptive Maintenance**: Modifying software to work with new operating systems, browser updates, or hardware.
- **Perfective Maintenance**: Adding user-requested enhancements, performance optimizations, and UI refinements.
- **Preventive Maintenance**: Applying security patches, upgrading dependencies, and refactoring code to prevent future vulnerabilities.

---

## 9. A Simple Real-World Example: University Library Borrowing System
Let's see how all phases connect in a tangible project:
1. **Planning**: The university allocates $15,000 and 4 months to replace paper book logbooks with a digital borrowing system.
2. **Analysis**: The development team meets with the head librarian to document loan rules (14-day checkout, 3-book limit, overdue fine calculation).
3. **Design**: Engineers design database tables for `Students`, `Books`, and `Loans`, plus UI wireframes for catalog searching and barcode scanning.
4. **Implementation**: Programmers develop Django REST endpoints for checkout and React interfaces for student catalog search.
5. **Testing**: QA engineers test barcode scanning edge cases, verify that fines calculate accurately on overdue books, and librarians conduct UAT.
6. **Deployment**: The system is deployed to campus servers over the weekend, and library staff receive accounts and training.
7. **Maintenance**: After launch, the team adds email reminder notifications 2 days before return dates and patches operating system libraries.

---

## 10. Why Documentation, Feedback, Testing and Security Matter
Throughout development, four pillars protect the software:
- **Documentation**: Code without documentation becomes unmaintainable when original developers leave. Clear SRS, architectural diagrams, and API docs ensure long-term sustainability.
- **User Feedback**: Regular reviews with actual users prevent engineering teams from building features nobody wants or interfaces that are confusing.
- **Testing**: Finding a defect during analysis or coding costs 10x to 30x less than fixing the same defect after it causes an outage in live production.
- **Security**: Security cannot be an afterthought bolted on at the end. Principles like least-privilege, input validation, and prompt injection defense must be woven through design, implementation, and continuous monitoring.

---

## Varying Approaches: Waterfall vs. Agile
Real-world engineering projects do not follow one universal formula:
- **Predictive (Waterfall) Approach**: Organizes work sequentially. Each phase is completed and formally signed off before the next begins. Ideal when requirements are fully understood, stable, and strictly regulated.
- **Adaptive (Agile) Approach**: Delivers software in small, iterative increments (sprints) lasting 1 to 4 weeks. Welcomes changing requirements, emphasizes cross-functional teamwork, and relies on frequent feedback from working software.
""",
}

# ==============================================================================
# PREPARED SDLC LAB 1 ACTIVITIES (STATIC, LOCAL, NO GEMINI / PAID API CALLS)
# ==============================================================================

PREPARED_SDLC_TRIVIA = [
    {
        "prompt": "What does SDLC stand for?",
        "topic_tag": "SDLC Fundamentals",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "SDLC stands for Software Development Life Cycle, the structured methodology for building high quality software.",
        "options": [
            {"text": "Software Development Life Cycle", "is_correct": True},
            {"text": "System Design and Logic Control", "is_correct": False},
            {"text": "Software Data Link Connection", "is_correct": False},
            {"text": "System Development Learning Course", "is_correct": False},
        ],
    },
    {
        "prompt": "Which SDLC phase identifies what the user needs?",
        "topic_tag": "Requirements Analysis",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "The Analysis phase gathers requirements and identifies what users need from the system.",
        "options": [
            {"text": "Coding", "is_correct": False},
            {"text": "Analysis", "is_correct": True},
            {"text": "Deployment", "is_correct": False},
            {"text": "Maintenance", "is_correct": False},
        ],
    },
    {
        "prompt": "What happens during the design phase?",
        "topic_tag": "System Design",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "During the design phase, architects and engineers plan the system structure, database schemas, and workflows.",
        "options": [
            {"text": "The system structure is planned", "is_correct": True},
            {"text": "The software is deleted", "is_correct": False},
            {"text": "Users stop testing", "is_correct": False},
            {"text": "The system is retired", "is_correct": False},
        ],
    },
    {
        "prompt": "Which phase involves writing program code?",
        "topic_tag": "Implementation",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Implementation (also called coding or development) is when engineers write executable source code.",
        "options": [
            {"text": "Planning", "is_correct": False},
            {"text": "Implementation", "is_correct": True},
            {"text": "Analysis", "is_correct": False},
            {"text": "Maintenance", "is_correct": False},
        ],
    },
    {
        "prompt": "Why is software testing important?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Testing validates that the application works as intended and catches bugs before deployment to users.",
        "options": [
            {"text": "To find defects and check functionality", "is_correct": True},
            {"text": "To choose the project name", "is_correct": False},
            {"text": "To write requirements only", "is_correct": False},
            {"text": "To skip deployment", "is_correct": False},
        ],
    },
]

PREPARED_SDLC_FLASHCARDS = [
    {
        "prompt": "What is the purpose of the planning phase?",
        "topic_tag": "Planning",
        "marks": 0.0,
        "timer_seconds": 10,
        "explanation": "Define project goals, scope, cost and timeline.",
    },
    {
        "prompt": "What happens during the testing phase?",
        "topic_tag": "Testing",
        "marks": 0.0,
        "timer_seconds": 10,
        "explanation": "Software is checked for bugs and correct behavior.",
    },
    {
        "prompt": "What is the purpose of maintenance?",
        "topic_tag": "Maintenance",
        "marks": 0.0,
        "timer_seconds": 10,
        "explanation": "Fix issues and update software after release.",
    },
]

PREPARED_SDLC_SCENARIO = {
    "prompt": "A university wants a system that allows students to borrow books and check return dates. Before coding starts, the development team meets the librarian to understand the requirements.\n\nWhich SDLC phase is the team performing, and why?",
    "topic_tag": "What Would You Do? Scenario",
    "marks": 2.0,
    "timer_seconds": 25,
    "marking_rubric": "Expected answer: Analysis or requirements gathering. The team is identifying user needs before development begins.",
    "explanation": "Analysis or requirements gathering. The team is identifying user needs before development begins.",
}

PREPARED_SDLC_DRAG_DROP = {
    "prompt": "Arrange these six phases in the correct order:\nPlanning, Analysis, Design, Implementation, Testing, Maintenance",
    "topic_tag": "Drag & Drop: Order the SDLC Phases",
    "marks": 3.0,
    "timer_seconds": 20,
    "matching_pairs": [
        {"phase": "Planning", "order": 1},
        {"phase": "Analysis", "order": 2},
        {"phase": "Design", "order": 3},
        {"phase": "Implementation", "order": 4},
        {"phase": "Testing", "order": 5},
        {"phase": "Maintenance", "order": 6},
    ],
    "explanation": "Correct sequence: Planning → Analysis → Design → Implementation → Testing → Maintenance",
}

PREPARED_SDLC_MATCHING = {
    "prompt": "Match each phase to its purpose:",
    "topic_tag": "Matching Exercise",
    "marks": 6.0,
    "timer_seconds": 30,
    "matching_pairs": [
        {"term": "Planning", "definition": "Define goals, scope, cost and timeline."},
        {"term": "Analysis", "definition": "Gather and document user requirements."},
        {"term": "Design", "definition": "Plan the system structure and solution."},
        {"term": "Implementation", "definition": "Write the program code."},
        {"term": "Testing", "definition": "Check the software for defects."},
        {"term": "Maintenance", "definition": "Fix issues and improve the released system."},
    ],
    "explanation": "Planning defines goals; Analysis gathers user requirements; Design plans structure; Implementation writes code; Testing checks for defects; Maintenance improves released system.",
}

def get_prepared_sdlc_activities(selected_modes=None):
    """
    Returns the prepared SDLC activities matching the lecturer's selected modes.
    Modes available:
    - 'Matching Exercise' / 'matching'
    - 'Drag & Drop' / 'drag_drop'
    - 'Flashcards' / 'flashcard'
    - 'What Would You Do? Scenario' / 'scenario' / 'written'
    - 'Trivia Exercise' / 'trivia' / 'mcq'
    - 'Group Work' / 'group_work'
    """
    if not selected_modes:
        selected_modes = [
            "Matching Exercise",
            "Drag & Drop",
            "Flashcards",
            "What Would You Do? Scenario",
            "Trivia Exercise",
        ]

    normalized = set()
    for m in selected_modes:
        low = str(m).strip().lower()
        if "trivi" in low or "mcq" in low:
            normalized.add("trivia")
        elif "flash" in low:
            normalized.add("flashcards")
        elif "scenario" in low or "what would" in low or "written" in low:
            normalized.add("scenario")
        elif "drag" in low or "drop" in low or "order" in low:
            normalized.add("drag_drop")
        elif "match" in low:
            normalized.add("matching")
        elif "group" in low:
            normalized.add("group_work")

    return {
        "mcqs": PREPARED_SDLC_TRIVIA if "trivia" in normalized else [],
        "flashcards": PREPARED_SDLC_FLASHCARDS if "flashcards" in normalized else [],
        "scenario": PREPARED_SDLC_SCENARIO if "scenario" in normalized else None,
        "drag_drop": PREPARED_SDLC_DRAG_DROP if "drag_drop" in normalized else None,
        "matching": PREPARED_SDLC_MATCHING if "matching" in normalized else None,
        "group_work_selected": "group_work" in normalized,
    }

# 20 MCQs for SDLC Lab 1 (1.0 mark each)
WEEK1_LAB_MCQS = [
    {
        "prompt": "Which phase of the Software Development Life Cycle focuses on gathering stakeholder needs and defining functional specifications?",
        "topic_tag": "Requirement Analysis",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Requirement Analysis is the initial phase where business analysts and engineers gather expectations from clients, users, and SMEs.",
        "options": [
            {"text": "Requirement Analysis", "is_correct": True},
            {"text": "Implementation", "is_correct": False},
            {"text": "Quality Assurance", "is_correct": False},
            {"text": "Evolution", "is_correct": False},
        ],
    },
    {
        "prompt": "In the standard deployment pipeline, which environment is reserved exclusively for live end-users to interact with the finished software?",
        "topic_tag": "Deployment Environments",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "The Production Environment is the live deployment where real users access real data and operational services.",
        "options": [
            {"text": "Development Environment", "is_correct": False},
            {"text": "Quality Assurance (QA) Environment", "is_correct": False},
            {"text": "Staging Sandbox", "is_correct": False},
            {"text": "Production Environment", "is_correct": True},
        ],
    },
    {
        "prompt": "What primary characteristic distinguishes a Predictive (Waterfall) model from an Adaptive (Agile) model?",
        "topic_tag": "Methodologies",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Waterfall is sequential and requires each phase to be completed before moving forward, whereas Agile is iterative and embraces evolving requirements.",
        "options": [
            {"text": "Waterfall completes phases sequentially, while Agile develops iteratively in increments", "is_correct": True},
            {"text": "Waterfall does not require testing, while Agile requires continuous testing", "is_correct": False},
            {"text": "Waterfall uses daily scrums, while Agile uses rigid milestone sign-offs", "is_correct": False},
            {"text": "Waterfall is only for mobile applications, while Agile is for web services", "is_correct": False},
        ],
    },
    {
        "prompt": "Which testing tier focuses specifically on verifying individual functions, methods, or procedures in isolation?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Unit testing verifies small, isolated building blocks of code to catch logic flaws before components are joined.",
        "options": [
            {"text": "Unit Testing", "is_correct": True},
            {"text": "Integration Testing", "is_correct": False},
            {"text": "System Testing", "is_correct": False},
            {"text": "User Acceptance Testing (UAT)", "is_correct": False},
        ],
    },
    {
        "prompt": "In the Scrum framework, what is the 'Product Backlog'?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "The Product Backlog is a prioritized list of all desired functional features, enhancements, and bug fixes for the product.",
        "options": [
            {"text": "A list of software bugs identified during production release", "is_correct": False},
            {"text": "A prioritized master list of all features and requirements for the product", "is_correct": True},
            {"text": "A timesheet documenting daily team hours spent on coding", "is_correct": False},
            {"text": "The archived code repository from completed development cycles", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the typical time-boxed duration of a Daily Scrum meeting?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "The Daily Scrum is a brief 15-minute standup meeting designed to synchronize the development team and surface blockers.",
        "options": [
            {"text": "15 minutes", "is_correct": True},
            {"text": "60 minutes", "is_correct": False},
            {"text": "45 minutes", "is_correct": False},
            {"text": "90 minutes", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary role of front-end coding in software implementation?",
        "topic_tag": "Implementation",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Front-end coding focuses on client-side presentation, interactive user interface controls, and user experience.",
        "options": [
            {"text": "Building user-facing presentation, UI controls, and visual interfaces", "is_correct": True},
            {"text": "Managing database tables, indexes, and SQL migrations", "is_correct": False},
            {"text": "Configuring bare-metal network switches and firewalls", "is_correct": False},
            {"text": "Performing physical hardware burn-in diagnostics", "is_correct": False},
        ],
    },
    {
        "prompt": "What phase immediately follows Implementation in the supplied 5-phase SDLC diagram (Requirement Analysis -> Design -> Implementation -> Testing -> Evolution)?",
        "topic_tag": "SDLC Phases",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "According to the architectural blueprint, Testing immediately follows Implementation to validate code before Evolution.",
        "options": [
            {"text": "Testing", "is_correct": True},
            {"text": "Requirement Analysis", "is_correct": False},
            {"text": "Evolution", "is_correct": False},
            {"text": "Design", "is_correct": False},
        ],
    },
    {
        "prompt": "What does UAT stand for in software quality assurance?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "UAT stands for User Acceptance Testing, where actual users validate that the system fulfills their operational needs.",
        "options": [
            {"text": "User Acceptance Testing", "is_correct": True},
            {"text": "Unified Automated Testing", "is_correct": False},
            {"text": "Universal Application Tuning", "is_correct": False},
            {"text": "Unit Architecture Testing", "is_correct": False},
        ],
    },
    {
        "prompt": "In software evolution and maintenance, what is the term used for modifying an application to keep it operational in an updated environment (e.g. new OS or database)?",
        "topic_tag": "Evolution",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Adaptive maintenance modifies the software to interface properly with changing external environments, platforms, or operating systems.",
        "options": [
            {"text": "Adaptive Maintenance", "is_correct": True},
            {"text": "Corrective Maintenance", "is_correct": False},
            {"text": "Reflective Maintenance", "is_correct": False},
            {"text": "Emergency Patching", "is_correct": False},
        ],
    },
    {
        "prompt": "During which SDLC phase are Entity Relationship Diagrams (ERDs) and architectural blueprints typically authored?",
        "topic_tag": "Design",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "ERDs and architectural blueprints are created during the Design phase to guide implementation.",
        "options": [
            {"text": "Design", "is_correct": True},
            {"text": "Testing", "is_correct": False},
            {"text": "Requirement Analysis", "is_correct": False},
            {"text": "Evolution", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary risk of skipping the Quality Assurance (QA) staging environment before production?",
        "topic_tag": "Deployment Environments",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Skipping QA exposes live users to untested defects, data corruption, and catastrophic downtime.",
        "options": [
            {"text": "Releasing unverified defects and security vulnerabilities directly to live users", "is_correct": True},
            {"text": "Increasing developer hourly billing rates", "is_correct": False},
            {"text": "Preventing Git branches from merging", "is_correct": False},
            {"text": "Making unit tests run slower", "is_correct": False},
        ],
    },
    {
        "prompt": "Which Scrum role is responsible for maximizing the business value of the product and prioritizing user stories?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "The Product Owner owns the vision, manages the backlog, and prioritizes stories based on business value.",
        "options": [
            {"text": "Product Owner", "is_correct": True},
            {"text": "Scrum Master", "is_correct": False},
            {"text": "Lead Architect", "is_correct": False},
            {"text": "Database Administrator", "is_correct": False},
        ],
    },
    {
        "prompt": "Which type of software maintenance repairs bugs and defects discovered after production release?",
        "topic_tag": "Evolution",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Corrective maintenance is reactive work that fixes faults, crashes, or incorrect logic in production.",
        "options": [
            {"text": "Corrective Maintenance", "is_correct": True},
            {"text": "Perfective Maintenance", "is_correct": False},
            {"text": "Preventive Maintenance", "is_correct": False},
            {"text": "Adaptive Maintenance", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the purpose of a Sprint Retrospective meeting in Scrum?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "The retrospective allows the team to inspect its processes, celebrate wins, and agree on continuous process improvements.",
        "options": [
            {"text": "To inspect team performance and identify process improvements for the next sprint", "is_correct": True},
            {"text": "To demonstrate working software to stakeholders and clients", "is_correct": False},
            {"text": "To review individual timesheets and calculate bonuses", "is_correct": False},
            {"text": "To deploy release candidates to the production cluster", "is_correct": False},
        ],
    },
    {
        "prompt": "What software testing tier verifies that separate modules (such as the API gateway and database service) communicate properly?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Integration testing verifies interface communication and data exchange between interrelated modules.",
        "options": [
            {"text": "Integration Testing", "is_correct": True},
            {"text": "Unit Testing", "is_correct": False},
            {"text": "Alpha Testing", "is_correct": False},
            {"text": "Static Analysis", "is_correct": False},
        ],
    },
    {
        "prompt": "In Agile software engineering, what is an 'Epic'?",
        "topic_tag": "Methodologies",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "An Epic is a large body of work or feature that can be broken down into smaller, actionable user stories.",
        "options": [
            {"text": "A large user story that spans multiple sprints and contains several smaller stories", "is_correct": True},
            {"text": "A critical severity defect causing immediate application outage", "is_correct": False},
            {"text": "An external audit conducted by government regulators", "is_correct": False},
            {"text": "A code review meeting lasting more than four hours", "is_correct": False},
        ],
    },
    {
        "prompt": "What is meant by 'Defensive Programming' during the Implementation phase?",
        "topic_tag": "Implementation",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Defensive programming involves anticipating edge cases, validating inputs, and handling exceptions to prevent crashes.",
        "options": [
            {"text": "Writing code that validates inputs, anticipates edge cases, and fails safely", "is_correct": True},
            {"text": "Encrypting source code on developer laptops with BitLocker", "is_correct": False},
            {"text": "Only allowing senior engineers to write unit tests", "is_correct": False},
            {"text": "Deploying web application firewalls around the staging cluster", "is_correct": False},
        ],
    },
    {
        "prompt": "Which phase of the SDLC establishes non-functional requirements such as latency, security, and scalability benchmarks?",
        "topic_tag": "Requirement Analysis",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "Requirement Analysis defines both functional capabilities and non-functional quality constraints.",
        "options": [
            {"text": "Requirement Analysis", "is_correct": True},
            {"text": "Coding", "is_correct": False},
            {"text": "Unit Testing", "is_correct": False},
            {"text": "Maintenance", "is_correct": False},
        ],
    },
    {
        "prompt": "What artifact defines the sprint goal and list of tasks committed to by developers for a 2-week cycle?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 15,
        "explanation": "The Sprint Backlog contains the selected user stories and technical tasks committed for the active sprint.",
        "options": [
            {"text": "Sprint Backlog", "is_correct": True},
            {"text": "Product Vision Statement", "is_correct": False},
            {"text": "Service Level Agreement", "is_correct": False},
            {"text": "Database Schema Diagram", "is_correct": False},
        ],
    },
]

# 5 Flashcards for SDLC Lab 1 (1.0 mark each)
WEEK1_LAB_FLASHCARDS = [
    {
        "prompt": "What is the SDLC?",
        "topic_tag": "SDLC Fundamentals",
        "marks": 1.0,
        "timer_seconds": 10,
        "explanation": (
            "Software Development Life Cycle: The formal structured process of planning, "
            "analyzing, designing, coding, testing, and maintaining software applications to "
            "ensure high quality within budget and schedule."
        ),
    },
    {
        "prompt": "What is a Sprint in Scrum?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 10,
        "explanation": (
            "A repeatable time-boxed iteration (commonly 1 to 4 weeks) during which a "
            "development team creates a usable, releasable increment of the product."
        ),
    },
    {
        "prompt": "What is Integration Testing?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 10,
        "explanation": (
            "A testing level where software modules are combined and tested as a group to "
            "expose defects in interfaces and interactions between connected components."
        ),
    },
    {
        "prompt": "What are the three environments in a modern software delivery lifecycle?",
        "topic_tag": "Deployment Environments",
        "marks": 1.0,
        "timer_seconds": 10,
        "explanation": (
            "1. Development Environment (for active coding), 2. Quality Assurance (QA) "
            "Environment (for validation and staging), 3. Production Environment (live for real users)."
        ),
    },
    {
        "prompt": "What are the three questions answered in a Daily Scrum meeting?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 10,
        "explanation": (
            "1. What did I complete yesterday? 2. What will I work on today? 3. Are there any "
            "blockers or impediments hindering my progress?"
        ),
    },
]

# 4 Written-response questions with rubrics (1.0 mark each)
WEEK1_LAB_WRITTEN = [
    {
        "prompt": (
            "Explain the difference between front-end coding and back-end coding. "
            "Provide one example of a technology associated with each."
        ),
        "topic_tag": "Implementation",
        "marks": 1.0,
        "timer_seconds": 45,
        "marking_rubric": (
            "Full marks (1.0): Clearly distinguishes client-side UI/presentation (front-end) from server/database "
            "logic (back-end), and cites valid technologies (e.g. React/HTML for front-end; Django/PostgreSQL for back-end). "
            "Partial marks (0.5): Distinguishes roles but omits technology examples or vice versa."
        ),
        "explanation": (
            "Front-end involves client-side UI development (HTML, CSS, React, Vue) that users directly interact with. "
            "Back-end involves server-side logic, database interactions, authentication, and APIs (Python, Django, Node, PostgreSQL)."
        ),
    },
    {
        "prompt": (
            "Compare the Waterfall model with the Agile model. Under what project conditions would a team prefer "
            "the Waterfall model over Agile?"
        ),
        "topic_tag": "Methodologies",
        "marks": 1.0,
        "timer_seconds": 45,
        "marking_rubric": (
            "Full marks (1.0): Identifies Waterfall as linear/sequential and Agile as iterative. Mentions that Waterfall "
            "is preferred when requirements are clear, well-understood, heavily regulated, or unlikely to change. "
            "Partial marks (0.5): Defines the models but gives vague or incorrect scenario suitability."
        ),
        "explanation": (
            "Waterfall proceeds sequentially through fixed phases with upfront planning. Agile delivers working software in short, "
            "iterative sprints with continuous customer collaboration. Waterfall is preferred when requirements are strictly fixed, "
            "well-documented, and compliance-driven (e.g., aerospace, medical devices, defense systems)."
        ),
    },
    {
        "prompt": (
            "What is User Acceptance Testing (UAT), and why is it conducted after System Testing rather than before?"
        ),
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 45,
        "marking_rubric": (
            "Full marks (1.0): Explains that UAT is validation by actual clients/end-users against real-world business scenarios, "
            "and must come after System Testing because internal technical and functional defects must be resolved before presenting to users. "
            "Partial marks (0.5): Incomplete definition or missing rationale for sequence."
        ),
        "explanation": (
            "UAT is the final pre-release validation conducted by end-users or clients. It occurs after System Testing to guarantee "
            "that all critical technical bugs, integration errors, and system faults have been resolved by developers and QA first."
        ),
    },
    {
        "prompt": (
            "Analyze why maintaining strict segregation between Development, QA, and Production environments is critical. "
            "Cite two distinct hazards of deploying directly from local workstations to live production."
        ),
        "topic_tag": "Deployment Environments",
        "marks": 1.0,
        "timer_seconds": 45,
        "marking_rubric": (
            "Full marks (1.0): Explains environment isolation and cites two hazards such as data corruption, unvetted bugs, "
            "credential leakage, or production downtime. Partial marks (0.5): Lists only one hazard or vague rationale."
        ),
        "explanation": (
            "Environment segregation ensures unverified code cannot destabilize live operations. Hazards of bypassing QA include: "
            "1. Undetected runtime regressions causing outages, 2. Database corruption and accidental leakage of sensitive customer data."
        ),
    },
]

# 1 Matching activity for SDLC Lab 1 (1.0 mark total)
WEEK1_MATCHING_PAIRS = [
    {"term": "Waterfall Model", "definition": "Sequential lifecycle where each phase must finish before the next begins"},
    {"term": "Sprint Backlog", "definition": "The subset of product backlog items selected for the current iteration"},
    {"term": "Unit Testing", "definition": "Verifying individual software components or functions in isolation"},
    {"term": "Production Environment", "definition": "The live server deployment accessed by actual end users"},
    {"term": "Evolution", "definition": "The post-deployment phase involving ongoing maintenance and enhancements"},
]

WEEK1_PRACTICE_QUESTIONS = [
    {
        "prompt": "What is the primary role of a Scrum Master in an Agile team?",
        "topic": "Scrum Framework",
        "answer": (
            "A Scrum Master acts as a servant leader and coach who removes blockers and impediments, "
            "facilitates daily standups, and ensures the team adheres to Scrum principles."
        ),
    },
    {
        "prompt": "Why are development environments isolated from production environments?",
        "topic": "Deployment Environments",
        "answer": (
            "Isolation prevents untested, experimental, or buggy code from compromising live systems, "
            "leaking sensitive production data, or disrupting active user operations."
        ),
    },
    {
        "prompt": "What is the difference between corrective and perfective maintenance?",
        "topic": "Evolution",
        "answer": (
            "Corrective maintenance fixes discovered defects or bugs. Perfective maintenance enhances "
            "performance, user experience, or adds new capabilities requested by users."
        ),
    },
]

# 60 Questions for Final Exam Readiness Assessment (45 MCQs + 15 Written, pass threshold 35/60)
FINAL_READINESS_QUESTIONS = [
    # --- 45 MCQs (1.0 mark each, 60s timer) ---
    {
        "prompt": "In UML class diagrams, which notation represents a strong form of aggregation where parts cannot exist without the whole?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Composition is represented by a filled (solid) black diamond at the whole end, denoting that parts share the lifecycle of the whole.",
        "options": [
            {"text": "Filled (solid) black diamond (Composition)", "is_correct": True},
            {"text": "Hollow white diamond (Aggregation)", "is_correct": False},
            {"text": "Dashed line with open arrowhead (Dependency)", "is_correct": False},
            {"text": "Solid line with closed triangular arrowhead (Generalization)", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML sequence diagrams, what does a dashed horizontal arrow with an open arrowhead typically signify?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "In sequence diagrams, a dashed arrow with an open arrowhead represents an asynchronous or return reply message.",
        "options": [
            {"text": "A return reply message from a previously invoked operation", "is_correct": True},
            {"text": "A synchronous blocking call to a remote procedure", "is_correct": False},
            {"text": "The creation of a brand new object instance", "is_correct": False},
            {"text": "An unhandled exception terminating the execution lifeline", "is_correct": False},
        ],
    },
    {
        "prompt": "Which design pattern ensures a class has only one instance and provides a global access point to it?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Singleton pattern restricts class instantiation to a single object and provides a synchronized global accessor.",
        "options": [
            {"text": "Singleton Pattern", "is_correct": True},
            {"text": "Factory Method Pattern", "is_correct": False},
            {"text": "Prototype Pattern", "is_correct": False},
            {"text": "Observer Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "Which Gang of Four (GoF) design pattern defines a family of algorithms, encapsulates each one, and makes them interchangeable at runtime?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Strategy pattern enables selecting different algorithmic implementations (e.g., sorting or payment algorithms) dynamically.",
        "options": [
            {"text": "Strategy Pattern", "is_correct": True},
            {"text": "Decorator Pattern", "is_correct": False},
            {"text": "Command Pattern", "is_correct": False},
            {"text": "Template Method Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "In software testing, what is the core purpose of Boundary Value Analysis (BVA)?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Empirical studies prove errors cluster at domain boundaries (minimum, just below, just above, maximum values).",
        "options": [
            {"text": "Testing inputs at the extreme boundaries and immediate neighbors of input partitions", "is_correct": True},
            {"text": "Measuring the execution speed of CPU registers under peak thermal load", "is_correct": False},
            {"text": "Verifying that CSS flexbox elements do not overflow the viewport boundary", "is_correct": False},
            {"text": "Randomly selecting values from arbitrary equivalence classes", "is_correct": False},
        ],
    },
    {
        "prompt": "Which UML diagram is best suited for modeling concurrent processes and workflows involving decision branching and forks/joins?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Activity diagrams model business workflows and algorithms, supporting parallel swimlanes, forks, and joins.",
        "options": [
            {"text": "Activity Diagram", "is_correct": True},
            {"text": "Component Diagram", "is_correct": False},
            {"text": "Deployment Diagram", "is_correct": False},
            {"text": "Package Diagram", "is_correct": False},
        ],
    },
    {
        "prompt": "What design pattern attaches additional responsibilities to an object dynamically without subclassing?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Decorator pattern wraps an object to augment its behavior while preserving the original interface.",
        "options": [
            {"text": "Decorator Pattern", "is_correct": True},
            {"text": "Composite Pattern", "is_correct": False},
            {"text": "Proxy Pattern", "is_correct": False},
            {"text": "Facade Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "In the Software Development Life Cycle diagram, which phase precedes Evolution?",
        "topic_tag": "SDLC Phases",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The five phases are Requirement Analysis, Design, Implementation, Testing, Evolution.",
        "options": [
            {"text": "Testing", "is_correct": True},
            {"text": "Design", "is_correct": False},
            {"text": "Implementation", "is_correct": False},
            {"text": "Planning", "is_correct": False},
        ],
    },
    {
        "prompt": "Which phase defines database schemas, UI wireframes, and module delineations?",
        "topic_tag": "Design",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Design phase architects the blueprints for both front-end UI and back-end database schemas.",
        "options": [
            {"text": "Design", "is_correct": True},
            {"text": "Evolution", "is_correct": False},
            {"text": "Requirement Analysis", "is_correct": False},
            {"text": "Deployment", "is_correct": False},
        ],
    },
    {
        "prompt": "In Scrum, who is responsible for prioritizing items in the Product Backlog?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Product Owner is solely responsible for backlog prioritization according to business value.",
        "options": [
            {"text": "Product Owner", "is_correct": True},
            {"text": "Scrum Master", "is_correct": False},
            {"text": "QA Lead", "is_correct": False},
            {"text": "Lead Architect", "is_correct": False},
        ],
    },
    {
        "prompt": "What does Equivalence Partitioning achieve in test case design?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Equivalence partitioning divides inputs into classes where any representative value will expose the same behavior.",
        "options": [
            {"text": "Divides input data into valid and invalid partitions to reduce redundant test cases", "is_correct": True},
            {"text": "Ensures all microservices consume exactly equal amounts of RAM", "is_correct": False},
            {"text": "Splits database rows equally among storage shards", "is_correct": False},
            {"text": "Distributes sprint story points evenly across all developers", "is_correct": False},
        ],
    },
    {
        "prompt": "In a UML use case diagram, what does an '«extend»' relationship signify between Use Case B and Use Case A?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "«extend» indicates optional or conditional behavior that only executes under specific extension point conditions.",
        "options": [
            {"text": "Use Case B optionally inserts additional behavior into Use Case A under specific conditions", "is_correct": True},
            {"text": "Use Case A unconditionally executes Use Case B on every invocation", "is_correct": False},
            {"text": "Use Case B is the parent class of Use Case A in an inheritance hierarchy", "is_correct": False},
            {"text": "Use Case B cannot be accessed by external human actors", "is_correct": False},
        ],
    },
    {
        "prompt": "Which architectural pattern divides an interactive application into Model, View, and Controller components?",
        "topic_tag": "Architecture",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "MVC isolates data logic (Model) from presentation (View) and user input routing (Controller).",
        "options": [
            {"text": "Model-View-Controller (MVC)", "is_correct": True},
            {"text": "Pipes and Filters Architecture", "is_correct": False},
            {"text": "Blackboard Pattern", "is_correct": False},
            {"text": "Microkernel Architecture", "is_correct": False},
        ],
    },
    {
        "prompt": "What design pattern converts the interface of a class into another interface clients expect?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Adapter pattern lets classes work together that couldn't otherwise because of incompatible interfaces.",
        "options": [
            {"text": "Adapter Pattern", "is_correct": True},
            {"text": "Bridge Pattern", "is_correct": False},
            {"text": "Flyweight Pattern", "is_correct": False},
            {"text": "Interpreter Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "Which maintenance type addresses vulnerabilities or bugs discovered after the software has entered production?",
        "topic_tag": "Evolution",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Corrective maintenance specifically repairs faults and defects found in active software.",
        "options": [
            {"text": "Corrective Maintenance", "is_correct": True},
            {"text": "Adaptive Maintenance", "is_correct": False},
            {"text": "Preventive Maintenance", "is_correct": False},
            {"text": "Perfective Maintenance", "is_correct": False},
        ],
    },
    {
        "prompt": "What document or artifact represents the items chosen from the product backlog for immediate implementation?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Sprint Backlog contains the specific items the team commits to deliver in the current sprint.",
        "options": [
            {"text": "Sprint Backlog", "is_correct": True},
            {"text": "System Architecture Document", "is_correct": False},
            {"text": "Release Manifest", "is_correct": False},
            {"text": "UAT Sign-off Sheet", "is_correct": False},
        ],
    },
    {
        "prompt": "Why are Subject Matter Experts (SMEs) critical during the Requirement Analysis phase?",
        "topic_tag": "Requirement Analysis",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "SMEs understand the specialized operational and business domain requirements needed for correct system design.",
        "options": [
            {"text": "They provide authoritative domain knowledge and validate operational workflows", "is_correct": True},
            {"text": "They write the automated integration test scripts", "is_correct": False},
            {"text": "They manage PostgreSQL database indexing and hardware scaling", "is_correct": False},
            {"text": "They approve developer payroll and budget allocations", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary consequence of bypassing the Design phase and jumping directly into Coding?",
        "topic_tag": "Design",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Omitting design leads to architectural misalignment, redundant code, uncoordinated team efforts, and severe technical debt.",
        "options": [
            {"text": "Architectural incoherence, duplicate effort, and costly refactoring later", "is_correct": True},
            {"text": "Immediate compiler syntax errors", "is_correct": False},
            {"text": "Inability to install Python virtual environments", "is_correct": False},
            {"text": "Faster deployment with guaranteed zero security defects", "is_correct": False},
        ],
    },
    {
        "prompt": "What does a Key Performance Indicator (KPI) measure in a software development project?",
        "topic_tag": "SDLC Fundamentals",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "KPIs quantify progress, quality, velocity, and delivery effectiveness against agreed business targets.",
        "options": [
            {"text": "Measurable values showing how effectively the team is achieving business goals", "is_correct": True},
            {"text": "The encrypted key used for JWT session authentication", "is_correct": False},
            {"text": "The hardware processor clock speed of the development workstation", "is_correct": False},
            {"text": "The maximum count of lines of code permitted per Python module", "is_correct": False},
        ],
    },
    {
        "prompt": "Which activity occurs at the conclusion of a Sprint to reflect on team processes and identify improvements for the next iteration?",
        "topic_tag": "Scrum Framework",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Sprint Retrospective is dedicated to reviewing team collaboration, processes, and identifying action items for continuous improvement.",
        "options": [
            {"text": "Sprint Retrospective", "is_correct": True},
            {"text": "Daily Standup", "is_correct": False},
            {"text": "Backlog Grooming", "is_correct": False},
            {"text": "Kickoff Ceremony", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML state machine diagrams, what represents a change from one state to another triggered by an event?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "A transition arrow represents the movement between discrete states caused by a trigger event or guard condition.",
        "options": [
            {"text": "Transition", "is_correct": True},
            {"text": "Generalization", "is_correct": False},
            {"text": "Fork", "is_correct": False},
            {"text": "Lifeline", "is_correct": False},
        ],
    },
    {
        "prompt": "Which Gang of Four pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Observer pattern maintains a subscriber list and dispatches event updates automatically to registered observers.",
        "options": [
            {"text": "Observer Pattern", "is_correct": True},
            {"text": "Mediator Pattern", "is_correct": False},
            {"text": "Memento Pattern", "is_correct": False},
            {"text": "Visitor Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary objective of Regression Testing following a bug fix or code change?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Regression testing verifies that recent code edits have not inadvertently broken existing working features.",
        "options": [
            {"text": "Ensuring that recent modifications have not broken previously functioning capabilities", "is_correct": True},
            {"text": "Measuring application throughput under 100,000 simulated users", "is_correct": False},
            {"text": "Verifying database encryption keys against hardware security modules", "is_correct": False},
            {"text": "Calculating the total cyclomatic complexity of newly written modules", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML class modeling, what is the default visibility symbol for private member variables in standard notation?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "In standard UML notation, '-' denotes private, '+' denotes public, and '#' denotes protected.",
        "options": [
            {"text": "- (hyphen / minus sign)", "is_correct": True},
            {"text": "+ (plus sign)", "is_correct": False},
            {"text": "# (hash / pound sign)", "is_correct": False},
            {"text": "~ (tilde)", "is_correct": False},
        ],
    },
    {
        "prompt": "Which design pattern provides an interface for creating families of related or dependent objects without specifying their concrete classes?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Abstract Factory provides an interface for producing families of related objects (e.g. cross-platform GUI widgets).",
        "options": [
            {"text": "Abstract Factory Pattern", "is_correct": True},
            {"text": "Builder Pattern", "is_correct": False},
            {"text": "Facade Pattern", "is_correct": False},
            {"text": "Flyweight Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "What testing technique derives test cases directly from the internal structural logic, branches, and statements of source code?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "White-Box (glass-box/structural) testing examines code statements, branch coverage, and decision paths directly.",
        "options": [
            {"text": "White-Box Testing (Structural)", "is_correct": True},
            {"text": "Black-Box Testing (Behavioral)", "is_correct": False},
            {"text": "Exploratory Testing", "is_correct": False},
            {"text": "Monkey Testing", "is_correct": False},
        ],
    },
    {
        "prompt": "In software architecture, what principle does the 'D' in SOLID represent?",
        "topic_tag": "Architecture",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Dependency Inversion Principle states high-level modules should depend upon abstractions rather than concrete details.",
        "options": [
            {"text": "Dependency Inversion Principle", "is_correct": True},
            {"text": "Dynamic Typing Principle", "is_correct": False},
            {"text": "Domain Driven Design Principle", "is_correct": False},
            {"text": "Database Independence Principle", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML component diagrams, what symbol represents a 'provided interface' (port offering services to external components)?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "A complete circle (lollipop notation) indicates an interface provided by the component.",
        "options": [
            {"text": "Lollipop notation (complete circle on a stick)", "is_correct": True},
            {"text": "Socket notation (half circle or cup)", "is_correct": False},
            {"text": "Diamond notation", "is_correct": False},
            {"text": "Lightning bolt symbol", "is_correct": False},
        ],
    },
    {
        "prompt": "Which design pattern provides a unified interface to a set of interfaces in a subsystem, making the subsystem easier to use?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Facade pattern defines a higher-level interface that simplifies interactions with complex internal subsystem libraries.",
        "options": [
            {"text": "Facade Pattern", "is_correct": True},
            {"text": "Proxy Pattern", "is_correct": False},
            {"text": "Composite Pattern", "is_correct": False},
            {"text": "Bridge Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "What metric measures the degree of interdependence and coupling between different software modules?",
        "topic_tag": "Architecture",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Coupling measures module interdependence (desirable: loose coupling); cohesion measures internal focus (desirable: high cohesion).",
        "options": [
            {"text": "Coupling (low coupling is optimal)", "is_correct": True},
            {"text": "Cohesion (low cohesion is optimal)", "is_correct": False},
            {"text": "Latency", "is_correct": False},
            {"text": "Cyclomatic Breadth", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the key principle of the 'Single Responsibility Principle' (SRP) in object-oriented design?",
        "topic_tag": "Architecture",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "SRP dictates that a class or module should have only one reason to change, handling a single focused concern.",
        "options": [
            {"text": "A class should have one, and only one, reason to change", "is_correct": True},
            {"text": "A developer should work on only one Git pull request at a time", "is_correct": False},
            {"text": "Every database must have only one primary key table", "is_correct": False},
            {"text": "All functions in a project must be located in a single master module", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML deployment diagrams, what does a three-dimensional box represent?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "In deployment diagrams, a 3D box (cube) represents a computational physical node, server, or hardware execution platform.",
        "options": [
            {"text": "A physical execution Node (hardware server or cloud VM)", "is_correct": True},
            {"text": "A relational database table row", "is_correct": False},
            {"text": "An ephemeral background thread", "is_correct": False},
            {"text": "A software package directory", "is_correct": False},
        ],
    },
    {
        "prompt": "Which design pattern is best suited for implementing undo/redo capabilities by capturing and externalizing an object's internal state?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Memento pattern captures an object's internal state so it can be restored later without violating encapsulation.",
        "options": [
            {"text": "Memento Pattern", "is_correct": True},
            {"text": "Command Pattern", "is_correct": False},
            {"text": "State Pattern", "is_correct": False},
            {"text": "Template Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "What is Cyclomatic Complexity in code quality analysis?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Cyclomatic complexity measures the number of linearly independent paths through program source code.",
        "options": [
            {"text": "A quantitative measure of the number of linearly independent execution paths in source code", "is_correct": True},
            {"text": "The memory overhead of recursive call stacks in production", "is_correct": False},
            {"text": "The count of microservices connected to the primary relational database", "is_correct": False},
            {"text": "The time required to compile the application from scratch", "is_correct": False},
        ],
    },
    {
        "prompt": "In requirements engineering, what does the acronym MoSCoW stand for?",
        "topic_tag": "Requirement Analysis",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "MoSCoW prioritizes requirements into: Must have, Should have, Could have, and Won't have.",
        "options": [
            {"text": "Must have, Should have, Could have, Won't have", "is_correct": True},
            {"text": "Modular, Scalable, Concurrent, Object-oriented, Web-ready", "is_correct": False},
            {"text": "Model, Schema, Controller, Operations, Workflow", "is_correct": False},
            {"text": "Monitor, Standardize, Code, Output, Warranty", "is_correct": False},
        ],
    },
    {
        "prompt": "What type of testing evaluates whether software functions reliably when subjected to extreme traffic, load, or stress beyond normal capacity?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Stress testing tests application behavior under extreme workloads beyond maximum expected capacity to evaluate resilience.",
        "options": [
            {"text": "Stress Testing", "is_correct": True},
            {"text": "Unit Testing", "is_correct": False},
            {"text": "Smoke Testing", "is_correct": False},
            {"text": "Sanity Testing", "is_correct": False},
        ],
    },
    {
        "prompt": "Which design pattern separates an abstraction from its implementation so that the two can vary independently?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Bridge pattern decouples an abstraction from its platform-specific implementation via composition.",
        "options": [
            {"text": "Bridge Pattern", "is_correct": True},
            {"text": "Adapter Pattern", "is_correct": False},
            {"text": "Proxy Pattern", "is_correct": False},
            {"text": "Flyweight Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary distinction between Verification and Validation in software engineering?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Verification asks 'Are we building the product right?' (conformance to specs); Validation asks 'Are we building the right product?' (meeting customer needs).",
        "options": [
            {"text": "Verification checks conformance to specifications; Validation checks that the product satisfies user needs", "is_correct": True},
            {"text": "Verification is executed by clients; Validation is executed by compiler syntax checkers", "is_correct": False},
            {"text": "Verification is only for mobile apps; Validation is only for relational databases", "is_correct": False},
            {"text": "Verification is done in production; Validation is done in local development", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML class diagrams, what relationship is modeled by an open dashed arrow between two classes?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "A dashed line with an open arrow indicates dependency: a change in the target class may affect the source class.",
        "options": [
            {"text": "Dependency relationship", "is_correct": True},
            {"text": "Inheritance / Generalization relationship", "is_correct": False},
            {"text": "Realization of an interface", "is_correct": False},
            {"text": "Bidirectional association", "is_correct": False},
        ],
    },
    {
        "prompt": "What is the primary function of Continuous Integration (CI) in modern DevOps and Agile engineering?",
        "topic_tag": "Evolution",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "CI automatically merges developer code into a shared repository, triggering automated builds and test suites.",
        "options": [
            {"text": "Automatically building, merging, and running automated test suites whenever code is committed", "is_correct": True},
            {"text": "Writing customer user stories using AI natural language generators", "is_correct": False},
            {"text": "Eliminating the need for software design and architecture documentation", "is_correct": False},
            {"text": "Deploying code immediately to production without quality gate evaluations", "is_correct": False},
        ],
    },
    {
        "prompt": "Which design pattern encapsulates a request as an object, thereby letting you parameterize clients with different requests, queue or log requests, and support undoable operations?",
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Command pattern wraps operations in command objects, enabling queuing, logging, and undo/redo.",
        "options": [
            {"text": "Command Pattern", "is_correct": True},
            {"text": "Strategy Pattern", "is_correct": False},
            {"text": "Chain of Responsibility Pattern", "is_correct": False},
            {"text": "State Pattern", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML sequence diagrams, what is represented by a vertical rectangle along an object's lifeline?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The vertical bar along a lifeline is the activation bar or execution specification, indicating active method execution.",
        "options": [
            {"text": "Activation Bar (period of active execution or message handling)", "is_correct": True},
            {"text": "Garbage collection suspension event", "is_correct": False},
            {"text": "Physical hardware core allocation", "is_correct": False},
            {"text": "Permanent deletion of the object instance from RAM", "is_correct": False},
        ],
    },
    {
        "prompt": "What testing practice involves writing automated unit tests before writing the implementation source code?",
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "Test-Driven Development (TDD) follows the Red-Green-Refactor cycle: test first, implement second, refactor third.",
        "options": [
            {"text": "Test-Driven Development (TDD)", "is_correct": True},
            {"text": "Behavioral Acceptance Benchmarking", "is_correct": False},
            {"text": "Model-Driven Architecture", "is_correct": False},
            {"text": "Post-Mortem Verification", "is_correct": False},
        ],
    },
    {
        "prompt": "Which SOLID principle states that software entities should be open for extension, but closed for modification?",
        "topic_tag": "Architecture",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "The Open/Closed Principle (OCP) ensures that class behavior can be extended via polymorphism without editing existing code.",
        "options": [
            {"text": "Open/Closed Principle (OCP)", "is_correct": True},
            {"text": "Liskov Substitution Principle (LSP)", "is_correct": False},
            {"text": "Interface Segregation Principle (ISP)", "is_correct": False},
            {"text": "Single Responsibility Principle (SRP)", "is_correct": False},
        ],
    },
    {
        "prompt": "In UML use case modeling, what relationship is used when Use Case A unconditionally invokes common functionality in Use Case B?",
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 60,
        "question_type": "mcq",
        "explanation": "«include» denotes mandatory inclusion of sub-behavior across one or more base use cases.",
        "options": [
            {"text": "«include» relationship", "is_correct": True},
            {"text": "«extend» relationship", "is_correct": False},
            {"text": "«inherits» relationship", "is_correct": False},
            {"text": "«subsumes» relationship", "is_correct": False},
        ],
    },

    # --- 15 Written Scenario Questions with Rubrics (1.0 mark each, 120s timer) ---
    {
        "prompt": (
            "Scenario: An e-commerce platform needs to support multiple payment processors (PayPal, Stripe, M-Pesa, and Direct Bank Transfer). "
            "The system must allow adding new payment providers in the future without modifying checkout business logic. "
            "Which GoF design pattern should be applied? Explain how the classes interact and justify your architectural choice."
        ),
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Identifies the Strategy pattern (or Factory + Strategy). Defines a common PaymentStrategy interface, "
            "concrete strategy classes (PayPalStrategy, StripeStrategy, MPesaStrategy), and a CheckoutContext that delegates execution. "
            "Mentions compliance with the Open/Closed Principle. Partial (0.5): Names pattern without explaining interface/delegation."
        ),
        "explanation": (
            "The Strategy Pattern should be applied. A common IPaymentStrategy interface defines the executePayment() method. "
            "Concrete classes (StripeStrategy, MPesaStrategy, PayPalStrategy) implement the interface. The CheckoutService receives a strategy "
            "instance at runtime via dependency injection. This adheres to the Open/Closed Principle because new providers can be added "
            "without touching existing checkout code."
        ),
    },
    {
        "prompt": (
            "Describe the key structural components of a UML Class Diagram. Differentiate between Generalization, Aggregation, and Composition "
            "with respect to object lifecycle coupling and visual notation."
        ),
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Explains Generalization (inheritance, hollow triangle), Aggregation (weak 'has-a', hollow diamond, parts survive whole), "
            "and Composition (strong 'has-a', filled diamond, parts die with whole). Partial (0.5): Missing notations or lifecycle distinctions."
        ),
        "explanation": (
            "A UML class diagram contains classes with attributes and operations. Generalization models inheritance (solid line, hollow triangle). "
            "Aggregation models a loose 'has-a' relationship where child objects can exist independently (hollow diamond). "
            "Composition models strong ownership where child lifecycles are strictly bound to the parent's lifecycle (filled black diamond)."
        ),
    },
    {
        "prompt": (
            "Explain Boundary Value Analysis (BVA) and Equivalence Partitioning. For an input field accepting student exam percentages (integers 0 to 100), "
            "define the valid/invalid equivalence classes and the specific boundary test values."
        ),
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Defines valid partition [0..100] and invalid partitions (<0, >100). Identifies exact boundary values: "
            "-1, 0, 1 (lower) and 99, 100, 101 (upper). Partial (0.5): Missing invalid partitions or adjacent boundary values."
        ),
        "explanation": (
            "Equivalence partitioning splits inputs into classes treated identically by the system: Valid [0 to 100], Invalid Low (<0), Invalid High (>100). "
            "BVA tests extreme boundaries where faults concentrate. Boundary values are: -1 (invalid), 0 (valid min), 1 (valid min+1), "
            "99 (valid max-1), 100 (valid max), and 101 (invalid max+1)."
        ),
    },
    {
        "prompt": (
            "In UML Sequence Diagrams, describe the purpose of Lifelines, Activation Bars, Synchronous Messages, Asynchronous Messages, "
            "and Reply Messages. Provide a concrete scenario demonstrating an asynchronous order processing interaction."
        ),
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Accurately defines lifelines, activation boxes, synchronous (solid arrowhead) vs asynchronous (open arrowhead) calls, "
            "and dashed reply messages, with a clear scenario (e.g. order placed, background message queue dispatched). Partial (0.5): Incomplete definitions."
        ),
        "explanation": (
            "Lifelines represent participant instances over time. Activation bars denote active thread execution. Synchronous calls (solid arrow) "
            "block until a response arrives; asynchronous calls (open arrow) dispatch without waiting, enabling background processing. "
            "For example, an OrderController sends an async message to an EmailNotificationQueue and immediately returns HTTP 202 to the user."
        ),
    },
    {
        "prompt": (
            "Evaluate the Singleton design pattern. When is it beneficial, what anti-patterns does it risk introducing, "
            "and how can dependency injection be used as a superior alternative?"
        ),
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Cites legitimate uses (thread pools, hardware drivers, logging coordinators), risks (global mutable state, tight coupling, "
            "testing/mocking difficulty), and explains DI injecting singleton-scoped dependencies cleanly. Partial (0.5): Missing risks or DI explanation."
        ),
        "explanation": (
            "Singleton provides centralized access to a unique shared resource (e.g. database pool, logging engine). However, it introduces "
            "hidden dependencies, global mutable state, and makes unit testing difficult because state persists across tests. "
            "Modern frameworks use Dependency Injection containers to register classes with Singleton lifecycle scope, achieving centralized instances without hardcoded statics."
        ),
    },
    {
        "prompt": (
            "Contrast Integration Testing with System Testing. What types of defects does Integration Testing reveal that Unit Testing cannot, "
            "and what tools or techniques are used to isolate modules during testing?"
        ),
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Clearly differentiates Integration testing (module interaction, API contracts) from System testing (complete end-to-end against requirements). "
            "Identifies stubs, mocks, and contract testing tools (WireMock, Pact, Mockito). Partial (0.5): Vague definitions or missing stub/mock details."
        ),
        "explanation": (
            "Integration testing verifies interactions and data flow between integrated components (e.g. API to DB schema mismatch, network serialization errors). "
            "Unit testing cannot detect these because units are tested in isolation. Test doubles, stubs, and mocks simulate missing downstream services "
            "so integration issues can be isolated systematically."
        ),
    },
    {
        "prompt": (
            "Explain the Model-View-Controller (MVC) architectural pattern. Detail the flow of data when a student clicks 'Submit Lab Assessment' "
            "in a modern web application."
        ),
        "topic_tag": "Architecture",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Defines Model (business state & DB), View (presentation/UI), Controller (input/HTTP handler). "
            "Traces flow: View emits HTTP POST -> Controller validates & invokes Model -> Model updates DB & evaluates score -> Controller returns response to View. "
            "Partial (0.5): Missing component definitions or incomplete data flow."
        ),
        "explanation": (
            "Model manages data, business rules, and DB persistence. View renders presentation. Controller handles user input and routes requests. "
            "On 'Submit Lab': View dispatches HTTP POST payload; Controller parses answers, verifies authentication, and calls assessment scoring logic in Model; "
            "Model calculates score and saves attempt in PostgreSQL; Controller serializes result JSON and View updates the UI with the final mark."
        ),
    },
    {
        "prompt": (
            "Analyze the Observer design pattern. Describe the Subject and Observer interfaces, how event registration works, "
            "and provide an example where a student assessment submission notifies both an audit logger and a leaderboard service."
        ),
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Details Subject (register, unregister, notify) and Observer (update/handle) interfaces. "
            "Explains the decoupling where AssessmentService notifies AuditObserver and LeaderboardObserver without knowing their implementation details. "
            "Partial (0.5): Omits interface methods or scenario explanation."
        ),
        "explanation": (
            "The Subject interface defines attach(Observer), detach(Observer), and notify(). The Observer interface defines update(Event). "
            "When a student submits an attempt, AssessmentSubject calls notify(attemptData). Both AuditLogObserver and LeaderboardObserver "
            "receive the event independently. The subject remains loosely coupled because it does not depend on the specific observer implementations."
        ),
    },
    {
        "prompt": (
            "In UML State Machine Diagrams, explain Initial State, Final State, Composite States, Guard Conditions, and Transition Actions. "
            "Provide a diagrammatic state flow for an Assessment Attempt (e.g., Unstarted -> InProgress -> Submitted -> Graded -> Approved)."
        ),
        "topic_tag": "UML Diagrams",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Explains elements (filled circle initial state, bullseye final state, [guards], actions on transitions) "
            "and outlines the clear lifecycle of an assessment attempt including pass/fail conditions. Partial (0.5): Missing guard conditions or lifecycle states."
        ),
        "explanation": (
            "Initial state is a solid circle; Final state is a circled dot. Guard conditions [boolean] allow transitions only if satisfied. "
            "Transition actions /action execute during state changes. Lifecycle: [Unstarted] --(start_test)--> [In_Progress] "
            "--(submit_answers)--> [Submitted] --(auto_score)--> [Graded] --(score >= 35 [faculty_signoff])--> [Approved]."
        ),
    },
    {
        "prompt": (
            "What is Cyclomatic Complexity? Given a function with four nested 'if-else' statements and one 'while' loop, "
            "estimate its complexity and explain why high cyclomatic complexity increases maintenance risk."
        ),
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Explains formula M = E - N + 2P or count of decision points + 1. Calculates complexity (4 if + 1 while + 1 base = ~6). "
            "Explains maintenance risks: exponentially harder to test, high bug density, difficult to refactor. Partial (0.5): Incorrect estimation or vague risks."
        ),
        "explanation": (
            "Cyclomatic complexity measures the number of independent execution paths. Formula is Decision Points + 1. "
            "With 4 if-conditions and 1 loop, complexity is 4 + 1 + 1 = 6. High complexity (>10) indicates tightly tangled logic, "
            "requires many test cases for full path coverage, and carries high risk of regression bugs when modified."
        ),
    },
    {
        "prompt": (
            "Compare the Factory Method pattern with the Abstract Factory pattern. In what scenario would you upgrade from "
            "Factory Method to an Abstract Factory?"
        ),
        "topic_tag": "Design Patterns",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Distinguishes single product creation (Factory Method via inheritance) from families of related products (Abstract Factory via composition). "
            "Gives a concrete upgrade scenario (e.g. adding UI themes: Light vs Dark buttons, checkboxes, dialogs). Partial (0.5): Superficial comparison."
        ),
        "explanation": (
            "Factory Method uses inheritance and relies on a method to create a single product. Abstract Factory is an object that provides "
            "an interface for producing families of related or interdependent products. You upgrade to Abstract Factory when your application needs "
            "to support multiple cohesive product families (e.g., Linux vs Windows vs MacOS UI widget suites)."
        ),
    },
    {
        "prompt": (
            "What is Regression Testing? Describe two strategies (e.g. Test Suite Minimization vs. Risk-Based Selection) "
            "for executing regression suites efficiently within a continuous delivery pipeline."
        ),
        "topic_tag": "Software Testing",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Defines regression testing (verifying unchanged code continues to work). Details two strategies: "
            "1. Risk-based prioritization (testing critical/changed paths first), 2. Test suite minimization/impact analysis (running tests mapped to modified modules). "
            "Partial (0.5): Defines regression but gives vague execution strategies."
        ),
        "explanation": (
            "Regression testing ensures bug fixes or enhancements have not disrupted existing features. Running thousands of tests on every commit is slow. "
            "Strategies include: 1. Impact Analysis / Test Minimization (identifying tests mapped directly to altered classes), and "
            "2. Risk-Based Selection (running high-priority customer journey tests first, scheduling full comprehensive suites nightly)."
        ),
    },
    {
        "prompt": (
            "Analyze the Liskov Substitution Principle (LSP). Provide a classic code violation example (such as Rectangle vs Square) "
            "and demonstrate how to refactor the design to satisfy LSP."
        ),
        "topic_tag": "Architecture",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): States LSP (subtypes must be substitutable for base types without breaking program correctness). "
            "Explains Rectangle/Square violation (Square modifying both width and height breaks Rectangle contract assumptions). "
            "Refactors via a shared Shape interface or composition. Partial (0.5): Explains LSP but omits refactoring."
        ),
        "explanation": (
            "LSP states that objects of a superclass should be replaceable with objects of its subclasses without breaking application behavior. "
            "In Rectangle vs Square: if Square inherits Rectangle and overrides setWidth() to also change height, code expecting a Rectangle breaks. "
            "The refactored design creates a common Shape interface with getArea(), keeping Rectangle and Square separate without subclassing one into the other."
        ),
    },
    {
        "prompt": (
            "In software requirements engineering, distinguish between Functional Requirements and Non-Functional Requirements (NFRs). "
            "State three critical NFR categories for an online university examination portal."
        ),
        "topic_tag": "Requirement Analysis",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Distinguishes functional (what the system does) from non-functional (how the system behaves/qualities). "
            "Cites three NFR categories with concrete exam context: Security (preventing exam tampering/leakage), Reliability/Availability (zero downtime during active exams), "
            "and Performance/Scalability (sub-second response under concurrent test submission). Partial (0.5): Missing clear NFR examples."
        ),
        "explanation": (
            "Functional requirements describe features and behavior (e.g., student can submit assessment, lecturer can review scores). "
            "Non-functional requirements specify quality constraints and operational benchmarks. For an examination portal: "
            "1. Security (tamper-proof question delivery and RBAC audit logs), 2. Availability (99.99% uptime during exam windows), "
            "and 3. Performance (sub-500ms latency under 1,000 concurrent submissions)."
        ),
    },
    {
        "prompt": (
            "Analyze why maintaining a strict separation between Development, Quality Assurance (QA), and Production "
            "environments is vital for both software reliability and application security. Provide two concrete risks "
            "that occur if a team deploys untested code directly to production."
        ),
        "topic_tag": "Deployment Environments",
        "marks": 1.0,
        "timer_seconds": 120,
        "question_type": "written",
        "marking_rubric": (
            "Full mark (1.0): Thoroughly explains the purpose of the 3-tier environment model (isolation, testing parity, "
            "production stability) and provides two concrete risks (e.g. data corruption/loss, security vulnerabilities, service downtime, "
            "exposing private student records). Partial (0.5): Mentions environments but gives superficial risks."
        ),
        "explanation": (
            "Separating Dev, QA, and Prod ensures that unstable features and experiments are isolated from live user traffic. "
            "Deploying untested code directly to production causes severe risks: 1. Service outages and application crashes resulting in downtime, "
            "2. Critical security vulnerabilities and data leaks that compromise user privacy and system integrity."
        ),
    },
]
