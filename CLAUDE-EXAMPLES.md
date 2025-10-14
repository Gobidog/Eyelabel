# Code Examples and Protocols

## 📋 MANDATORY SESSION PROTOCOL

### SESSION START (ALWAYS DO THIS FIRST)
```python
# Step 1: Check Archon for current tasks
archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")

# Step 2: Check Pinecone for project context
mcp__pinecone__search-records(
    name="coder",
    namespace="proj-[project_name]",
    query={"inputs": {"text": "project status history"}, "topK": 5}
)

# Step 3: Get global patterns from Pinecone
mcp__pinecone__search-records(
    name="coder", 
    namespace="global_knowledge_base",
    query={"inputs": {"text": "relevant patterns"}, "topK": 3}
)
```

### BEFORE EVERY TASK
```python
# 1. Get task details from Archon
current_task = archon:manage_task(action="get", task_id="...")

# 2. Update status to in-progress
archon:manage_task(
    action="update",
    task_id="...",
    update_fields={"status": "doing"}
)

# 3. Search for patterns in BOTH systems
# Archon for code examples
archon:search_code_examples(query="[task description]", match_count=3)

# Pinecone for past solutions
mcp__pinecone__search-records(
    name="coder",
    namespace="global_knowledge_base", 
    query={"inputs": {"text": "[task description]"}, "topK": 3}
)

# 4. Research with Archon RAG
archon:perform_rag_query(query="[technical query]", match_count=5)
```

### AFTER TASK COMPLETION
```python
# 1. Update Archon task status
archon:manage_task(
    action="update",
    task_id="...",
    update_fields={"status": "review"}
)

# 2. Record in Pinecone for future reference
mcp__pinecone__upsert-records(
    name="coder",
    namespace="proj-[project_name]",
    records=[{
        "id": f"task-{task_id}-{timestamp}",
        "content": "Description of what was done",
        "task_type": "feature|bugfix|architecture",
        "archon_task_id": task_id,
        "success": True,
        "key_learnings": ["learning1", "learning2"],
        "artifacts_created": ["file1", "file2"]
    }]
)
```

### SESSION END
```python
# 1. Get final task status from Archon
final_status = archon:manage_task(
    action="list",
    filter_by="project",
    filter_value="[project_id]"
)

# 2. Update Pinecone with session summary
mcp__pinecone__upsert-records(
    name="coder",
    namespace="proj-[project_name]",
    records=[{
        "id": f"session-{session_id}",
        "content": "Session summary",
        "tasks_completed": [/* task ids */],
        "next_steps": "What to do next session",
        "blockers": "Any issues encountered"
    }]
)

# 3. Add valuable patterns to global KB
if new_patterns_discovered:
    mcp__pinecone__upsert-records(
        name="coder",
        namespace="global_knowledge_base",
        records=[/* reusable patterns */]
    )
```

## 🔄 ARCHON TASK WORKFLOW

### Project Initialization

#### Scenario 1: New Project with Archon
```python
# Create project container
archon:manage_project(
    action="create",
    title="Descriptive Project Name",
    github_repo="github.com/user/repo-name"
)

# Research → Plan → Create Tasks
```

#### Scenario 2: Existing Project - Adding Archon
```python
# First analyze codebase, then:
archon:manage_project(action="create", title="Existing Project Name")

# Research current tech stack and create tasks for remaining work
```

#### Scenario 3: Continuing Archon Project
```python
# Check existing project status
archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")

# Continue with standard development iteration workflow
```

### Task Creation Protocol
```python
# Research first
archon:perform_rag_query(query="architecture patterns", match_count=5)
archon:search_code_examples(query="implementation examples", match_count=3)

# Check Pinecone for similar past work
mcp__pinecone__search-records(
    name="coder",
    namespace="global_knowledge_base",
    query={"inputs": {"text": "similar feature"}, "topK": 3}
)

# Then create atomic tasks (1-4 hours each)
archon:manage_task(
    action="create",
    project_id="...",
    title="Specific task description",
    feature="Feature category",
    task_order=priority_number  # Higher = more important
)
```

## 🧠 SELF-IMPROVEMENT & CONTINUOUS LEARNING

### Learning Triggers

#### BEFORE Any Task:
```python
# 1. Check what we've learned before
past_solutions = mcp__pinecone__search-records(
    name="coder",
    namespace="global_knowledge_base",
    query={"inputs": {"text": "[task description]"}, "topK": 5}
)

# 2. Search for working examples
examples = archon:search_code_examples(query="[task type]", match_count=5)

# 3. Get latest best practices
library_docs = mcp__context7__get-library-docs(context7CompatibleLibraryID="...")
```

#### AFTER Task Completion:
```python
# 1. Record what worked
if task_successful:
    mcp__pinecone__upsert-records(
        name="coder",
        namespace="global_knowledge_base",
        records=[{
            "content": "Pattern that worked: [description]",
            "code_example": "[actual code]",
            "context": "[when to use this]"
        }]
    )

# 2. Record what failed (equally important!)
if task_failed:
    mcp__pinecone__upsert-records(
        name="coder",
        namespace="agent_failure_patterns",
        records=[{
            "content": "What didn't work: [description]",
            "root_cause": "[why it failed]",
            "avoid_by": "[how to prevent this]"
        }]
    )
```

## 🎯 MANDATORY PARALLEL EXECUTION

### For ANY Development Request:
```python
# STEP 0: Check Archon Tasks & Pinecone Memory (ALWAYS FIRST!)
print("Checking Archon for current tasks...")
current_tasks = archon:manage_task(action="list", filter_by="project", filter_value="[project_id]")

print("Checking project memory...")
project_name = "[PROJECT_NAME]".lower()
# Query project memory
project_memory = mcp__pinecone__search-records(
    name="coder",  # ALWAYS use "coder" index
    namespace=f"proj-{project_name}",
    query={"inputs": {"text": "project status"}, "topK": 10}
)
# Query global patterns
global_patterns = mcp__pinecone__search-records(
    name="coder",  # ALWAYS use "coder" index
    namespace="global_knowledge_base",
    query={"inputs": {"text": "relevant patterns"}, "topK": 5}
)

# STEP 1: Initialize task accumulator
print("Initializing Wave 1 parallel tasks...")
wave1_tasks = []

# STEP 2-N: Add tasks (DO NOT EXECUTE)
print("Adding agents to task queue...")
wave1_tasks.append(Task(...))
wave1_tasks.append(Task(...))
wave1_tasks.append(Task(...))

# FINAL STEP: Execute all tasks
print("Executing all tasks in parallel...")
wait_for_completion(wave1_tasks)

# AFTER COMPLETION: Update Both Systems
print("Updating Archon task status...")
archon:manage_task(action="update", task_id="...", update_fields={"status": "review"})

print("Updating project memory...")
mcp__pinecone__upsert-records(
    name="coder",  # ALWAYS use "coder" index
    namespace=f"proj-{project_name}",
    records=[{
        "id": f"session-{timestamp}-{task_id}",
        "content": "Description of work completed",
        "task_type": "feature|bugfix|architecture",
        "archon_task_id": current_task_id,
        "success": True,
        "key_learnings": ["learning1", "learning2"],
        "artifacts_created": ["file1", "file2"]
    }]
)
```

## MCP Tool Enforcement Examples

```python
# MANDATORY before ANY conclusion:
mcp__sequential-thinking__sequentialthinking(
    thought="Is this really broken or am I missing something?",
    totalThoughts=5
)

# MANDATORY before code changes:
mcp__serena__find_symbol(symbol="actual_function_name")
mcp__serena__search_for_pattern(pattern="actual_code_pattern")

# MANDATORY for library implementation:
mcp__context7__resolve-library-id(libraryName="library-name")
mcp__context7__get-library-docs(context7CompatibleLibraryID="/org/project")

# MANDATORY before declarations:
mcp__pinecone__search-records(
    name="coder",
    namespace="proj-{project}",
    query={"inputs": {"text": "previous working implementation"}}
)
```

## Root Cause Analysis Pattern

```python
# MANDATORY before any fix:
mcp__sequential-thinking__sequentialthinking(
    thought='''Root cause analysis:
    1. WHERE exactly does it fail?
    2. WHY does it fail there?
    3. WHAT depends on this?
    4. HOW does user see this?
    5. WHEN did it last work?''',
    totalThoughts=5
)
```

## MANDATORY POST-FIX PROTOCOL

After fixing ANY issue, MUST use sequential-thinking:
```python
mcp__sequential-thinking__sequentialthinking(
  thought="Fixed [describe fix]. What else could be broken?",
  totalThoughts=5,
  # Must think through:
  # - What depends on this working?
  # - What silent failures might exist?
  # - What would break if this "works" incorrectly?
  # - How would user know this is REALLY fixed?
)
```

## Pinecone Record Format

```json
{
  "id": "unique-identifier",
  "content": "Detailed description of work done",
  "task_type": "feature|bugfix|architecture|integration",
  "archon_task_id": "task-id-from-archon",
  "success": true/false,
  "key_learnings": ["learning1", "learning2"],
  "artifacts_created": ["file1", "file2"],
  "related_files": ["path1", "path2"],
  "timestamp": "ISO-8601",
  "session_id": "session-identifier",
  "agent": "agent-name"
}
```

## 🚨 CRITICAL: Pinecone Index Configuration

**ALL project namespaces are in the "coder" index!**

- ✅ CORRECT: `name="coder", namespace="proj-calculator"`
- ❌ WRONG: `name="proj-calculator", namespace="proj-calculator"`
- ❌ WRONG: `name="calculator", namespace="proj-calculator"`

The "coder" index contains ALL namespaces:
- `proj-{project_name}` - Project-specific memories
- `global_knowledge_base` - Shared patterns
- `agent_failure_patterns` - Troubleshooting data

NEVER use the project name as the index name!