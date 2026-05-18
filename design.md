SECTION 1: VISUAL IDENTITY & UI FRAMEWORK
1.1 Design Principles

    Aesthetic: "Enterprise-Grade Minimalist." High data density without visual noise. Focus on clarity, predictability, and professional trust.

    Design System: Built exclusively on Shadcn/ui (utilizing Radix UI primitives and Tailwind CSS).

    Color Palette:

        Primary: Zinc or Slate scales (Neutral, sophisticated gray tones).

        Accent: Indigo-600 for primary calls to action.

        Status Colors: Emerald-500 (Active/Success), Amber-500 (Draft/Pending), Rose-500 (Error/Deprecated).

    Typography:

        UI/Interface: Geist Sans (modern, optimized for legibility).

        Data/Code/YAML: Geist Mono (fixed-width for technical accuracy).

1.2 Layout Architecture

The interface follows a persistent three-pane structure:

    Navigation Sidebar (280px):

        Vertical stepper representing the ODCS lifecycle: Import, Fundamentals, Schema (Dataset), Stakeholders.

        Section status indicators (Checkmark for "Complete", Blue Dot for "Current", Gray for "Empty").

    Top Navigation & Status Bar:

        Contract Name & ID breadcrumbs.

        Lifecycle Badge: High-visibility badge indicating Draft, Active, or Deprecated.

        Version Control: Major/Minor toggle and version display (e.g., v2.1.0).

        Global Actions: "Save as Draft" and "Publish/Activate" (Primary action).

    Main Content Area:

        Center Stage: Clean form layouts with a max-width of 1024px.

        Dual View Toggle: Ability to switch between "Builder View" (Forms) and "Documentation View" (Clean table-based summary).

1.3 Key Component Specifications (Shadcn/ui)

    Data Table: High-density rows for the Schema section. Must include hover states for quick edits and clear icons for data types.

    Drawers (Sheets): Used for advanced field configuration (e.g., adding specific tags or metadata to a column) without losing the context of the full schema.

    Modals: Reserved for destructive actions (e.g., "Deleting a Draft") or the initial "Import DDL" paste area.

    Empty States: Large dashed-border dropzones for the first-time user experience to encourage DDL pasting.

1.4 UX Writing & Language Logic

    User-Centric Labels: Translate technical ODCS keys into business-friendly terms.

        Logical Name → Business Label

        Physical Type → Technical Format

        Quantum Name → Entity Name

    Interaction Feedback:

        Read-Only State: When a contract is Active, all inputs are disabled. A banner must appear: "This contract is Active and Locked. To make changes, please create a New Version."

        Validation: Real-time inline validation (e.g., "ID cannot contain spaces" or "Version must follow SemVer").


SECTION 2: DATA ENGINE & ODCS MAPPING
2.1 Standard Compliance

    Target Specification: Open Data Contract Standard (ODCS) v3.1.0.

    Output Format: Valid YAML file following the official Bitol schema.

2.2 DDL Parsing Logic (The Entry Point)

The MVP must include a SQL-to-ODCS parser. The UI will provide a text area for CREATE TABLE statements.

    Extraction Rules:

        TABLE_NAME → Maps to quantumName (and a slugified version for id).

        COLUMN_NAME → Maps to dataset[].columns[].physicalName and defaults to logicalName.

        DATA_TYPE → Maps to dataset[].columns[].physicalType.

        NOT NULL / PRIMARY KEY → Maps to dataset[].columns[].required.

2.3 Technical-to-Logical Type Mapping

To help non-technical users, the UI must translate SQL types into user-friendly categories:
SQL Type (Physical)	UI Label (User Friendly)	ODCS Logical Type (Suggested)
VARCHAR, TEXT, CHAR	Text	string
INT, BIGINT, SMALLINT	Whole Number	integer
DECIMAL, FLOAT, DOUBLE	Decimal Number	number
TIMESTAMP, DATE, DATETIME	Date & Time	timestamp / date
BOOLEAN, BIT	Yes/No	boolean
2.4 Data Structure (Internal State)

The application state should mirror the ODCS structure to ensure what the user sees is what the dev gets.

    Fundamentals Section:

        dataContractSpecification: Fixed at 3.1.0.

        id: Unique string (auto-generated from name).

        version: Semantic versioning (e.g., 1.0.0).

    Dataset Section:

        domain: Business area (Marketing, Finance, etc.).

        columns: Array of objects containing name, type, description, and tags.

2.5 Validation Rules

The UI must prevent "broken" contracts before they reach Git:

    Duplicate Names: Ensure no two columns have the same physicalName.

    Missing Fundamentals: id, version, and owner are mandatory to enable the "Activate" button.

    Type Safety: If a DDL type is unknown, default to string and flag the field for manual review.


Parfait. Voici le Block 3 pour ton design.md. Ce volet est crucial car il définit la "logique métier" du cycle de vie des données, ce qui permet aux développeurs de coder les règles de gestion (permissions, verrous, incrémentation) de manière cohérente.
SECTION 3: LIFECYCLE, VERSIONING & GIT WORKFLOW
3.1 Contract Lifecycle States

The application must strictly manage three states to ensure data governance:

    Draft: * Behavior: Full CRUD (Create, Update, Delete) permissions on all fields.

        Visuals: Amber status badge. "Publish" button is enabled only if mandatory ODCS fields are filled.

    Active (Published):

        Behavior: Immutable state. All form inputs are set to read-only. No modifications allowed to the schema or fundamentals.

        Visuals: Emerald status badge. A "Create New Version" button replaces the "Save" button.

    Deprecated:

        Behavior: Read-only. Indicates the contract is no longer recommended for new data products.

        Visuals: Rose/Gray status badge with a warning banner.

3.2 Versioning Logic (SemVer)

The versioning follows a simplified Semantic Versioning approach within the version field of the ODCS YAML:

    Minor Bump (0.x.0): Used for non-breaking changes (e.g., adding an optional column, updating a description).

    Major Bump (x.0.0): Used for breaking changes (e.g., deleting a column, changing a data type, renaming the quantum).

    UI Implementation: A "Bump Version" modal appears when the user clicks "Create New Version" from an Active contract, forcing the choice between Major and Minor before opening a new Draft.

3.3 Git Integration Workflow (Storage)

The "Source of Truth" for contracts is a Git repository. The MVP simulates/implements this flow:

    Save as Draft: Persists the current state to a temporary storage or a "Draft" folder/branch in Git.

    Publish (Activate): * Triggers a commit to the main branch.

        File naming convention: {contract_id}_{version}.yaml.

        The system should automatically generate a commit message based on the version bump (e.g., feat: publish data contract {id} v1.2.0).

3.4 User Flow Mapping (The MVP Sequence)

    Auth: User logs in via platform integration.

    Import: User lands on an empty state and pastes a DDL.

    Generation: System parses DDL → populates the dataset section → switches to Draft mode.

    Edition: User updates "Business Labels" and "Stakeholders" via Shadcn forms.

    Activation: User clicks "Publish". The UI locks, the YAML is finalized and pushed to Git.

    Evolution: User returns later, views the Active contract, and clicks "New Version" to start a new Draft cycle.


















