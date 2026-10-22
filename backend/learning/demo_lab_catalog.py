"""
Synthetic demonstration labs for the Software Engineering (RCS 305) unit.

These 14 labs (weeks 2-15) back the demo student's "14/15 completed" history.
The SDLC lab (week 1) is the 15th required lab and is NOT part of this list.
All content is original, prototype-quality demonstration material.
"""

# (title, description, notes_markdown, [(prompt, correct, [wrong, ...], explanation), ...])
DEMO_LABS = [
    (
        "Software Development Models — Waterfall, Agile, Spiral and V-Model",
        "Compare the main software process models and when each is appropriate.",
        "## Process models\n- **Waterfall**: linear phases, heavy documentation, suits stable requirements.\n- **Agile**: iterative sprints, continuous feedback, suits changing requirements.\n- **Spiral**: repeated cycles centred on risk analysis.\n- **V-Model**: each development phase is paired with a testing phase.",
        [
            ("Which model repeats cycles with explicit risk analysis in each loop?", "Spiral", ["Waterfall", "V-Model", "Big Bang"], "The Spiral model is risk-driven and iterates through planning, risk analysis, engineering and evaluation."),
            ("In the V-Model, requirements analysis is paired with which testing phase?", "Acceptance testing", ["Unit testing", "Integration testing", "Regression testing"], "The V-Model maps each design phase to a verification phase; requirements map to acceptance testing."),
        ],
    ),
    (
        "Requirements Engineering",
        "Elicit, analyse, specify and validate software requirements.",
        "## Requirements engineering\n1. Elicitation (interviews, workshops, observation)\n2. Analysis and negotiation\n3. Specification\n4. Validation and management\n\nFunctional requirements describe behaviour; non-functional requirements describe qualities such as performance and security.",
        [
            ("Which is a NON-functional requirement?", "The system must respond within 2 seconds", ["The system shall let students register", "The system shall email receipts", "The system shall export reports"], "Response time is a quality attribute, not a behaviour."),
            ("Interviewing stakeholders is part of which activity?", "Requirements elicitation", ["Regression testing", "Deployment", "Code review"], "Elicitation gathers requirements from stakeholders."),
        ],
    ),
    (
        "Software Requirements Specification (SRS)",
        "Structure and quality attributes of a good SRS document.",
        "## SRS qualities\nA good SRS is **correct, unambiguous, complete, consistent, verifiable and traceable**. It typically contains an introduction, overall description, specific requirements and appendices.",
        [
            ("Which quality means every requirement can be tested?", "Verifiability", ["Portability", "Brevity", "Elegance"], "A verifiable requirement can be checked by a finite, cost-effective process."),
            ("An SRS statement like 'the system should be fast' fails which quality?", "Unambiguity", ["Traceability", "Modularity", "Reusability"], "'Fast' is vague; it needs a measurable target."),
        ],
    ),
    (
        "System Analysis and Design",
        "Move from analysed needs to a structured system design.",
        "## Analysis vs design\n- **Analysis** answers *what* the system must do.\n- **Design** answers *how* it will do it.\nTools include data-flow diagrams, ER diagrams and structure charts.",
        [
            ("Analysis primarily answers which question?", "What must the system do?", ["How will it be coded?", "Who will deploy it?", "Which server is cheapest?"], "Analysis defines the problem; design defines the solution."),
            ("Which diagram models data stores and processes?", "Data-flow diagram", ["Gantt chart", "Burn-down chart", "Pie chart"], "DFDs show processes, data flows, stores and external entities."),
        ],
    ),
    (
        "Unified Modeling Language (UML)",
        "Use UML diagrams to describe structure and behaviour.",
        "## UML families\n- **Structural**: class, component, deployment diagrams.\n- **Behavioural**: use case, sequence, activity, state machine diagrams.",
        [
            ("Which UML diagram shows object interactions over time?", "Sequence diagram", ["Class diagram", "Deployment diagram", "Package diagram"], "Sequence diagrams order messages between objects."),
            ("A class diagram is which kind of UML diagram?", "Structural", ["Behavioural", "Temporal", "Statistical"], "Class diagrams describe static structure."),
        ],
    ),
    (
        "Software Architecture and Design Patterns",
        "Architectural styles and common design patterns.",
        "## Patterns\n- **Singleton**: one instance with global access.\n- **Observer**: subscribers are notified of state changes.\n- **Factory**: creation logic hidden behind an interface.\nArchitectural styles include layered, client-server and microservices.",
        [
            ("Which pattern notifies dependents when state changes?", "Observer", ["Singleton", "Adapter", "Decorator"], "Observer decouples publishers from subscribers."),
            ("A layered architecture mainly improves...", "Separation of concerns", ["Network speed", "Disk space", "Screen resolution"], "Layers isolate responsibilities and ease maintenance."),
        ],
    ),
    (
        "Object-Oriented Software Engineering",
        "Core object-oriented principles applied to software design.",
        "## OO principles\nEncapsulation, abstraction, inheritance and polymorphism. SOLID principles guide maintainable class design.",
        [
            ("Hiding internal state behind methods is called...", "Encapsulation", ["Inheritance", "Polymorphism", "Aggregation"], "Encapsulation protects internal state."),
            ("Treating subclasses through a common interface is...", "Polymorphism", ["Encapsulation", "Normalisation", "Compilation"], "Polymorphism allows one interface, many implementations."),
        ],
    ),
    (
        "Software Testing and Quality Assurance",
        "Testing levels and quality assurance practices.",
        "## Testing levels\nUnit -> Integration -> System -> User Acceptance. QA is a process-wide activity; testing is one product-focused part of it.",
        [
            ("Which level tests a single function in isolation?", "Unit testing", ["System testing", "UAT", "Load testing"], "Unit tests target the smallest testable parts."),
            ("Final validation by the client is...", "User acceptance testing", ["Unit testing", "Static analysis", "Smoke testing"], "UAT confirms the system meets business needs."),
        ],
    ),
    (
        "Software Verification and Validation",
        "Distinguish building the product right from building the right product.",
        "## V&V\n- **Verification**: are we building the product right? (reviews, inspections, static analysis)\n- **Validation**: are we building the right product? (testing against user needs)",
        [
            ("'Are we building the right product?' describes...", "Validation", ["Verification", "Refactoring", "Versioning"], "Validation checks against user needs."),
            ("A code inspection is an example of...", "Verification", ["Validation", "Deployment", "Maintenance"], "Inspections check conformance to specification."),
        ],
    ),
    (
        "Software Maintenance and Evolution",
        "Types of maintenance and managing software change.",
        "## Maintenance types\n**Corrective** (fix bugs), **adaptive** (new environment), **perfective** (improve features), **preventive** (reduce future problems).",
        [
            ("Updating software for a new operating system is...", "Adaptive maintenance", ["Corrective maintenance", "Perfective maintenance", "Preventive maintenance"], "Adaptive maintenance responds to environment changes."),
            ("Fixing a discovered defect is...", "Corrective maintenance", ["Adaptive maintenance", "Perfective maintenance", "Preventive maintenance"], "Corrective maintenance repairs faults."),
        ],
    ),
    (
        "Software Project Management",
        "Planning, scheduling and controlling software projects.",
        "## Project management\nKey activities: scoping, scheduling (Gantt, critical path), resource allocation, monitoring and communication. The project triangle balances scope, time and cost.",
        [
            ("The sequence of tasks that determines minimum project duration is the...", "Critical path", ["Backlog", "Baseline", "Milestone"], "Delay on the critical path delays the whole project."),
            ("The project triangle balances scope, cost and...", "Time", ["Colour", "Font", "Language"], "Scope, time and cost constrain every project."),
        ],
    ),
    (
        "Software Cost Estimation",
        "Techniques for estimating effort, time and cost.",
        "## Estimation\nTechniques: expert judgement, analogy, function points and COCOMO. Estimates improve as requirements become clearer (cone of uncertainty).",
        [
            ("COCOMO is used to estimate...", "Effort and schedule", ["Bandwidth", "Code coverage", "Disk usage"], "COCOMO derives effort from size and cost drivers."),
            ("Estimating by comparison with past projects is...", "Analogy", ["Interpolation", "Compilation", "Inheritance"], "Analogy-based estimation reuses historical data."),
        ],
    ),
    (
        "Risk Management in Software Projects",
        "Identify, assess and mitigate project risks.",
        "## Risk management\n1. Identify risks\n2. Analyse probability and impact\n3. Plan mitigation\n4. Monitor continuously\nRisk exposure = probability x impact.",
        [
            ("Risk exposure is calculated as...", "Probability x impact", ["Cost + time", "Scope / effort", "Impact - probability"], "Exposure ranks risks by expected loss."),
            ("Preparing an action plan to reduce a risk is...", "Mitigation", ["Elicitation", "Refactoring", "Verification"], "Mitigation reduces probability or impact."),
        ],
    ),
    (
        "Version Control Systems — Git and GitHub",
        "Track changes, branch and collaborate using Git and GitHub.",
        "## Git basics\n`git commit` records a snapshot, `git branch` creates a line of development, `git merge` combines work, and GitHub hosts remotes for collaboration via pull requests.",
        [
            ("Which command records a snapshot of staged changes?", "git commit", ["git clone", "git fetch", "git remote"], "Commit stores staged changes in history."),
            ("Proposing changes for review on GitHub uses a...", "Pull request", ["Fork bomb", "Stash", "Tag"], "Pull requests enable review before merging."),
        ],
    ),
]

# Varied synthetic scores (percent) for the 14 demo history attempts.
DEMO_SCORE_PERCENTS = [85, 90, 80, 95, 75, 90, 85, 80, 95, 90, 75, 85, 80, 95]
