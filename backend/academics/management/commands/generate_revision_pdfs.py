import os
import re

PDF_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "revision_pdfs"))
os.makedirs(PDF_DIR, exist_ok=True)

TOPICS = [
    {
        "filename": "01_sdlc_fundamentals.pdf",
        "title": "Software Development Life Cycle (SDLC)",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Introduction & Overview", 
             "The Software Development Life Cycle (SDLC) is a structured framework that guides the conception, specification, development, verification, deployment, and operational maintenance of reliable software systems. By enforcing defined milestones and quality gates between phases, SDLC disciplines prevent runaway defect costs and align engineering outputs with institutional and stakeholder requirements."),
            ("2. Core Architectural Phases",
             "A standard software engineering lifecycle comprises five core stages:\n"
             "• Requirement Analysis: Eliciting user needs, evaluating operational constraints, and drafting unambiguous Functional & Non-Functional Specifications.\n"
             "• Architectural Design: Structuring multi-tier architectures, data schemas, module cohesion, interface contracts, and component decoupling.\n"
             "• Implementation: Coding clean, documented, and modular routines adhering to established language guidelines and peer review standards.\n"
             "• Verification & Testing: Subjecting software to unit, integration, system, and user acceptance test suites to detect regressions before release.\n"
             "• Evolution & Maintenance: Addressing post-deployment defects, adapting to updated operational runtime environments, and enhancing capabilities."),
            ("3. The Defect Amplification Model (Boehm's Law)",
             "Empirical studies demonstrate that defect remediation costs increase exponentially across successive SDLC phases. A requirement ambiguity resolved during initial analysis costs approximately 1x to fix. The same defect discovered during coding costs 5x, during integration testing costs 10x, and post-deployment in production exceeds 30x to 100x. Systematic upstream verification is therefore essential."),
            ("4. Multi-Tier Operational Environments",
             "Enterprise deployment mandates strict physical or logical separation between operational environments:\n"
             "• Development (Dev): Dynamic, unstable staging environment for rapid prototyping and unit testing.\n"
             "• Quality Assurance (QA): Isolated replica of production infrastructure executing automated regression suites, load testing, and UAT sign-offs.\n"
             "• Production (Prod): Live, monitored environment delivering services to authenticated end users under rigorous change control."),
        ]
    },
    {
        "filename": "02_software_process_models.pdf",
        "title": "Software Development Models — Waterfall, Agile, Spiral & V-Model",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Comparative Paradigm Analysis",
             "Software engineering methodologies span a continuum from predictive (plan-driven) to adaptive (change-driven) frameworks. Selection depends on requirements stability, safety criticality, project duration, and stakeholder availability."),
            ("2. Predictive Models: Waterfall & V-Model",
             "• Waterfall: Linear-sequential progression where each phase must complete and receive formal sign-off before subsequent phases begin. Best suited for high-assurance firmware, medical devices, and aerospace systems with immutable specifications.\n"
             "• V-Model (Verification & Validation): Maps each development phase directly to a corresponding testing tier. Requirements correspond to User Acceptance Testing (UAT); System Design corresponds to System Testing; Detailed Design corresponds to Integration Testing; Coding corresponds to Unit Testing."),
            ("3. Iterative & Risk-Driven: Spiral Model",
             "Proposed by Barry Boehm, the Spiral Model organizes development into repeating cycles across four quadrants: Objective Setting, Risk Assessment & Resolution, Development & Verification, and Review/Planning. Each cycle produces a refined prototype, making it optimal for complex, high-uncertainty R&D projects."),
            ("4. Adaptive Frameworks: Agile & Scrum",
             "Agile prioritizes individuals and interactions, working software, customer collaboration, and responsiveness to change. Scrum operationalizes Agile through time-boxed Sprints (1 to 4 weeks), continuous backlog grooming, daily stand-up ceremonies, and sprint retrospectives."),
        ]
    },
    {
        "filename": "03_requirements_engineering.pdf",
        "title": "Requirements Engineering Principles & Practices",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Foundational Objectives",
             "Requirements Engineering (RE) is the systematic discipline of discovering, documenting, analyzing, and maintaining software requirements throughout system evolution. Poor requirements analysis accounts for over 60% of critical project failures."),
            ("2. The Requirements Engineering Process",
             "The RE lifecycle comprises four intertwined activities:\n"
             "• Inception & Elicitation: Engaging stakeholders through structured interviews, workshops, ethnography, and domain analysis.\n"
             "• Analysis & Negotiation: Resolving conflicting stakeholder goals, assessing technical feasibility, and establishing boundary scopes.\n"
             "• Specification: Drafting structured specifications adhering to standard schemas.\n"
             "• Validation: Reviewing documents with users to guarantee correctness, consistency, and completeness."),
            ("3. Functional vs. Non-Functional Requirements",
             "• Functional Requirements (FR): Explicitly define system behavior, calculations, data transformations, and business rules (e.g., 'The platform shall authenticate students via JWT bearer tokens').\n"
             "• Non-Functional Requirements (NFR): Constrain operational qualities, including latency, throughput, availability (99.9% uptime), data encryption standards (AES-256), and WCAG 2.1 accessibility."),
        ]
    },
    {
        "filename": "04_srs_documentation.pdf",
        "title": "Software Requirements Specification (SRS) Standards",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Purpose & Stakeholder Audience",
             "An SRS serves as the authoritative legal and engineering contract between customers, development teams, quality assurance testers, and project managers. It establishes the verifiable baseline against which all final deliverables are evaluated."),
            ("2. IEEE 830 / ISO/IEC/IEEE 29148 Standard Structure",
             "Standard SRS templates partition documentation into three principal divisions:\n"
             "• 1. Introduction: Purpose, document conventions, intended audience, project scope, and authoritative references.\n"
             "• 2. Overall Description: Product perspective, user classes and characteristics, operating environment, design constraints, and assumptions.\n"
             "• 3. Specific System Requirements: Detailed functional requirements, external interface specifications (UI, hardware, software, communications), and performance requirements."),
            ("3. Quality Attributes of Exemplary Specifications",
             "Every SRS requirement statement must exhibit six essential characteristics: Unambiguous (single interpretation), Complete (all scenarios addressed), Consistent (no mutually conflicting requirements), Verifiable (demonstrable through test cases), Modifiable (structured for change), and Traceable (linked from business need to source code)."),
        ]
    },
    {
        "filename": "05_system_analysis_and_design.pdf",
        "title": "System Analysis & Architectural Design",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Transitioning from Problem to Solution Space",
             "System Analysis investigates 'what' the business domain requires. Architectural Design determines 'how' the computing system will fulfill those requirements through structured components, databases, and network interfaces."),
            ("2. Structured Analysis Artifacts",
             "• Data Flow Diagrams (DFD): Represent information flow through processes, external entities, data stores, and data flows without implementation assumptions.\n"
             "• Entity-Relationship Diagrams (ERD): Model persistent relational or document structures, foreign key constraints, and cardinality ratios (1:1, 1:N, M:N).\n"
             "• State Transition Diagrams (STD): Track reactive system behavior across discrete lifecycle events."),
            ("3. Fundamental Design Principles",
             "High Cohesion: A module should focus on a single, well-defined operational responsibility.\n"
             "Loose Coupling: Modules should minimize direct knowledge and inter-dependencies on other modules, interacting via stable interfaces."),
        ]
    },
    {
        "filename": "06_uml_modeling.pdf",
        "title": "Unified Modeling Language (UML) Reference",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. UML Taxonomies",
             "The Unified Modeling Language provides standardized graphical notations across two primary categories: Structural Diagrams (static composition) and Behavioral Diagrams (dynamic execution)."),
            ("2. Structural Diagrams",
             "• Class Diagrams: Detail classes, attributes, operations, visibility (+public, -private, #protected), and relationships (association, aggregation, composition, generalization/inheritance).\n"
             "• Component & Deployment Diagrams: Map compiled software packages to physical hardware nodes, network topologies, and container runtimes."),
            ("3. Behavioral & Interaction Diagrams",
             "• Use Case Diagrams: Capture functional boundaries, actors, <<include>> dependencies (mandatory sub-flows), and <<extend>> conditions (optional extensions).\n"
             "• Sequence Diagrams: Model chronologically ordered message passing between object lifelines, asynchronous calls, and activation bars.\n"
             "• Activity Diagrams: Visualize parallel workflows, decision diamonds, and fork/join concurrency controls."),
        ]
    },
    {
        "filename": "07_software_architecture_patterns.pdf",
        "title": "Software Architecture Styles & Design Patterns",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Architectural Styles",
             "• Layered (N-Tier): Segregates Presentation, Business Logic, and Data Persistence layers. Changes in one layer do not propagate if interfaces remain constant.\n"
             "• Microservices: Decomposes monolithic applications into independently deployable, loosely coupled services communicating via HTTP/REST or message queues.\n"
             "• Event-Driven: Decouples event producers from consumers via pub/sub brokers (e.g., Kafka, RabbitMQ) for massive horizontal scalability."),
            ("2. Gang of Four (GoF) Design Patterns",
             "• Creational — Singleton: Guarantees a class has only one instance with a global access point.\n"
             "• Creational — Factory Method: Encapsulates object instantiation behind an interface, letting subclasses decide which class to instantiate.\n"
             "• Structural — Adapter: Converts the interface of a class into another interface clients expect.\n"
             "• Behavioral — Observer: Defines a one-to-many dependency so that when one object changes state, all dependents are notified automatically."),
        ]
    },
    {
        "filename": "08_oose_solid_principles.pdf",
        "title": "Object-Oriented Software Engineering & SOLID Principles",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Core Object-Oriented Pillars",
             "• Encapsulation: Restricting direct access to object state and coupling data with mutating operations.\n"
             "• Abstraction: Presenting simplified, high-level interfaces while concealing implementation complexities.\n"
             "• Inheritance: Mechanism where child classes derive properties and behavior from generalized parent classes.\n"
             "• Polymorphism: Ability of different objects to respond to the same message with customized behavior."),
            ("2. The SOLID Principles for Maintainable Code",
             "• S — Single Responsibility Principle (SRP): A class should have one, and only one, reason to change.\n"
             "• O — Open/Closed Principle (OCP): Software entities should be open for extension, but closed for modification.\n"
             "• L — Liskov Substitution Principle (LSP): Subtypes must be substitutable for their base types without altering system correctness.\n"
             "• I — Interface Segregation Principle (ISP): Clients should not be forced to depend on interfaces they do not use.\n"
             "• D — Dependency Inversion Principle (DIP): Depend upon abstractions, not concretions. High-level modules should not depend upon low-level modules."),
        ]
    },
    {
        "filename": "09_testing_quality_assurance.pdf",
        "title": "Software Testing Strategies & Quality Assurance",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. QA vs. Testing",
             "Quality Assurance (QA) is process-oriented, focusing on defect prevention across all engineering workflows. Testing is product-oriented, focusing on defect identification through dynamic execution."),
            ("2. The Modern Test Pyramid",
             "• Unit Tests (Base): High volume, fast execution, isolated tests exercising individual functions or classes with test doubles (mocks/stubs).\n"
             "• Integration Tests (Middle): Verifies database transactions, API contract boundaries, and inter-service messaging.\n"
             "• System / End-to-End Tests (Peak): Simulates authentic user workflows through browser UI or API gateway under realistic network conditions."),
            ("3. Black-Box vs. White-Box Methodologies",
             "• Black-Box Testing: Evaluates external functionality without visibility into internal source code (Equivalence Partitioning, Boundary Value Analysis, State Transition testing).\n"
             "• White-Box Testing: Employs code structure knowledge to achieve Statement, Branch, and Condition Coverage benchmarks."),
        ]
    },
    {
        "filename": "10_verification_and_validation.pdf",
        "title": "Software Verification & Validation (V&V)",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. The Foundational Duality (Boehm)",
             "• Verification: 'Are we building the product right?' Confirms that software artifacts comply with specifications established in preceding development phases.\n"
             "• Validation: 'Are we building the right product?' Confirms that the realized software satisfies actual user needs and business requirements."),
            ("2. Static vs. Dynamic Techniques",
             "• Static Verification (Non-executable): Formal inspections, peer code reviews, walkthroughs, linters, and formal mathematical proofs of correctness.\n"
             "• Dynamic Validation (Executable): Running test suites against compiled binaries with concrete input vectors to observe actual runtime responses."),
            ("3. Formal Technical Reviews (FTR)",
             "Structured meetings conducted by independent peers to detect functional errors, logic discrepancies, and standards violations before artifact sign-off."),
        ]
    },
    {
        "filename": "11_maintenance_and_evolution.pdf",
        "title": "Software Maintenance, Refactoring & Evolution",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. The Four Categories of Software Maintenance (ISO/IEC 14764)",
             "Maintenance represents 60% to 80% of total lifecycle software expenditure. It comprises:\n"
             "• Corrective Maintenance: Reactive fixes resolving reactive bugs, security patches, and runtime crashes (approx. 20% of effort).\n"
             "• Adaptive Maintenance: Modifying software to function across evolving operating systems, cloud runtimes, or hardware changes (approx. 25% of effort).\n"
             "• Perfective Maintenance: Proactively implementing requested feature enhancements, performance optimizations, and user interface improvements (approx. 50% of effort).\n"
             "• Preventive Maintenance: Restructuring, updating dependencies, and refactoring to prevent future failure modes (approx. 5% of effort)."),
            ("2. Lehman's Laws of Software Evolution",
             "• Continuing Change: A system must continually adapt to its operational environment or become progressively less satisfactory.\n"
             "• Increasing Complexity: As a system evolves, its complexity increases unless work is done to maintain or simplify structure."),
            ("3. Code Refactoring & Technical Debt",
             "Refactoring alters internal structure without changing external observable behavior, clearing technical debt and restoring architectural cohesion."),
        ]
    },
    {
        "filename": "12_project_management.pdf",
        "title": "Software Project Management & Governance",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. The Triple Constraint Triangle",
             "Software project governance balances three interdependent constraints: Scope, Time, and Cost, centered around Quality. Altering one dimension inexorably impacts the others."),
            ("2. Work Breakdown Structures (WBS) & Scheduling",
             "• Work Breakdown Structure (WBS): Hierarchical decomposition of total project scope into manageable, assignable work packages.\n"
             "• Gantt Charts: Temporal visualizations of task sequences, dependencies, milestones, and concurrent allocations.\n"
             "• Critical Path Method (CPM): Calculates the longest sequence of dependent activities having zero float (slack). Any delay on the critical path directly postpones project completion."),
            ("3. Team Roles & Governance",
             "Effective management coordinates Product Owners, Project Managers, Lead Architects, Developers, and QA engineers through transparent communication channels."),
        ]
    },
    {
        "filename": "13_cost_estimation.pdf",
        "title": "Software Cost & Effort Estimation Methodologies",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. The Estimation Challenge & Cone of Uncertainty",
             "Early in the lifecycle, software cost estimates have high variance (+/- 400%). As requirements solidify through detailed design, the Cone of Uncertainty narrows toward exact projections."),
            ("2. Algorithmic Modeling: COCOMO II",
             "Barry Boehm's Constructive Cost Model (COCOMO) estimates Person-Months (PM) based on project size in Kilo Source Lines of Code (KSLOC):\n"
             "Effort (PM) = A * (Size)^E * Product(Cost_Drivers)\n"
             "Where Cost Drivers evaluate team capability, software complexity, database size, and tool maturity across Organic, Semidetached, and Embedded modes."),
            ("3. Non-Algorithmic Estimation",
             "• Function Point Analysis (FPA): Measures functionality delivered based on External Inputs, Outputs, Inquiries, Internal Files, and External Interfaces.\n"
             "• Expert Judgment & Planning Poker: Delphi and collaborative consensus techniques widely leveraged in Agile story pointing."),
        ]
    },
    {
        "filename": "14_risk_management.pdf",
        "title": "Risk Management in Software Engineering",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Proactive vs. Reactive Risk Strategies",
             "Proactive risk management identifies potential failure modes before project inception, formalizing mitigation plans. Reactive strategies ('fire fighting') address crises only after damage has materialized."),
            ("2. The Systematic Risk Management Cycle",
             "• 1. Identification: Cataloging risks across technical, personnel, project, and environmental categories.\n"
             "• 2. Analysis & Exposure Calculation: Determining Probability (P) and Impact (I). Risk Exposure (RE) = Probability x Impact.\n"
             "• 3. Prioritization: Matrix ranking (Critical, High, Medium, Low) to allocate defensive resources.\n"
             "• 4. Mitigation, Monitoring & Management (RMMM Plan): Drafting contingency protocols and tracking leading indicators throughout execution."),
            ("3. Common Software Risk Categories",
             "Requirements volatility, key personnel turnover, technology obsolescence, third-party vendor default, and schedule compression."),
        ]
    },
    {
        "filename": "15_version_control_git.pdf",
        "title": "Version Control Systems — Git & Collaborative Workflows",
        "unit": "RCS 305 — Software Engineering",
        "sections": [
            ("1. Centralized vs. Distributed Version Control",
             "Centralized VCS (e.g., SVN) relies on a single central server, creating a single point of failure and requiring continuous network connectivity. Distributed VCS (Git) grants every developer a complete repository clone with local history, branching, and cryptographic commit verification."),
            ("2. Core Git Mechanics & Data Objects",
             "• Directed Acyclic Graph (DAG): Git represents project history as an immutable graph of commit nodes.\n"
             "• The Three Trees: Working Directory (local files), Staging Area / Index (staged changes ready for commit), and Repository / HEAD (recorded commits).\n"
             "• SHA-1 / SHA-256 Hashes: Every object (blob, tree, commit, tag) is addressed by its cryptographic digest, guaranteeing data integrity."),
            ("3. Enterprise Branching & Release Workflows",
             "• Feature Branching: Developers isolate new features in dedicated branches (`feature/login-jwt`), merging via peer-reviewed Pull Requests (PRs).\n"
             "• GitFlow: Structured release paradigm utilizing `main` (production-ready), `develop` (integration), `feature/*`, `release/*`, and `hotfix/*` branches.\n"
             "• Merge Strategies: Fast-Forward, Three-Way Merge commit, and Rebase for linear history preservation."),
        ]
    },
]


def escape_pdf_text(text: str) -> str:
    """Escapes special characters for PDF literal strings."""
    return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def build_pdf(topic_dict: dict) -> bytes:
    """Builds a clean, valid PDF 1.4 document using standard 14 PostScript fonts."""
    title = topic_dict["title"]
    unit = topic_dict["unit"]
    sections = topic_dict["sections"]

    # Wrap sections into lines (approx 85 chars per line)
    stream_lines = []
    stream_lines.append("BT")
    stream_lines.append("/F2 18 Tf")  # Helvetica-Bold
    stream_lines.append("50 760 Td")
    stream_lines.append(f"({escape_pdf_text(title)}) Tj")
    
    stream_lines.append("/F1 10 Tf")  # Helvetica
    stream_lines.append("0 -18 Td")
    stream_lines.append(f"({escape_pdf_text(unit)} | Riara University Revision Resource) Tj")

    # Draw divider line
    stream_lines.append("ET")
    stream_lines.append("0.35 0.15 0.55 RG")  # Brand dark purple
    stream_lines.append("2 w")
    stream_lines.append("50 730 m 550 730 l S")
    
    stream_lines.append("BT")
    y_current = 710
    stream_lines.append("50 705 Td")

    for heading, body in sections:
        stream_lines.append("/F2 12 Tf")  # Heading
        stream_lines.append("0 -24 Td")
        stream_lines.append(f"({escape_pdf_text(heading)}) Tj")
        stream_lines.append("/F1 9 Tf")   # Body
        
        # Word wrap body text
        for para in body.split("\n"):
            para = para.strip()
            if not para:
                continue
            words = para.split(" ")
            curr_line = []
            curr_len = 0
            for w in words:
                if curr_len + len(w) + 1 > 82:
                    stream_lines.append("0 -13 Td")
                    line_str = " ".join(curr_line)
                    stream_lines.append(f"({escape_pdf_text(line_str)}) Tj")
                    curr_line = [w]
                    curr_len = len(w)
                else:
                    curr_line.append(w)
                    curr_len += len(w) + 1
            if curr_line:
                stream_lines.append("0 -13 Td")
                line_str = " ".join(curr_line)
                stream_lines.append(f"({escape_pdf_text(line_str)}) Tj")

    # Footer note
    stream_lines.append("/F1 8 Tf")
    stream_lines.append("0 -30 Td")
    stream_lines.append("(MaxLabs Academic Revision Document -- Copyright Riara University Design Thinking Prototype 2026) Tj")
    stream_lines.append("ET")

    content_data = "\n".join(stream_lines).encode("latin-1", errors="replace")

    objects = []
    # 1 0 obj: Catalog
    objects.append(b"<< /Type /Catalog /Pages 2 0 R >>")
    # 2 0 obj: Pages
    objects.append(b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>")
    # 3 0 obj: Page
    objects.append(b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>")
    # 4 0 obj: Stream content
    stream_def = f"<< /Length {len(content_data)} >>\nstream\n".encode("ascii") + content_data + b"\nendstream"
    objects.append(stream_def)
    # 5 0 obj: Font F1 (Helvetica)
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    # 6 0 obj: Font F2 (Helvetica-Bold)
    objects.append(b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")

    # Output assembly with xref
    out = [b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n"]
    offsets = []
    curr_offset = len(out[0])

    for i, obj in enumerate(objects, 1):
        offsets.append(curr_offset)
        obj_bytes = f"{i} 0 obj\n".encode("ascii") + obj + b"\nendobj\n"
        out.append(obj_bytes)
        curr_offset += len(obj_bytes)

    xref_offset = curr_offset
    xref_lines = [f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n"]
    for off in offsets:
        xref_lines.append(f"{off:010d} 00000 n \n")
    xref_bytes = "".join(xref_lines).encode("ascii")
    out.append(xref_bytes)

    trailer = f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("ascii")
    out.append(trailer)

    return b"".join(out)


if __name__ == "__main__":
    for t in TOPICS:
        path = os.path.join(PDF_DIR, t["filename"])
        pdf_bytes = build_pdf(t)
        with open(path, "wb") as f:
            f.write(pdf_bytes)
        print(f"Generated {t['filename']} ({len(pdf_bytes)} bytes)")
