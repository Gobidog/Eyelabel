# Project Configuration - V17.0 DIRECT IMPLEMENTATION WITH MANDATORY MEMORY

## 🔴 CRITICAL: MANDATORY MEMORY-FIRST PROTOCOL 🔴

### BEFORE ANY WORK (INCLUDING TODOWRITE):

```python
# 1. CHECK MEMORY MCP (PRIMARY - EFFICIENT LIMITS)
recent = mcp__memory__memory_latest(limit=5)
patterns = mcp__memory__memory_query(
    query="past issues failures solutions patterns",
    top_k=3,
    mode="hybrid",
    alpha=0.7
)

# 2. CHECK ARCHON TASKS (MANDATORY - NEVER SKIP)
archon_tasks = mcp__archon__list_tasks(filter_by="status", filter_value="todo")
if archon_tasks and len(archon_tasks.get("tasks", [])) > 0:
    print(f"🚨 FOUND {len(archon_tasks['tasks'])} PENDING ARCHON TASKS")
    print("MUST address these before starting new work!")

# 3. CHECK MEMORY-TASKMANAGER FOR CONTEXT (SECONDARY)
context = mcp__memory-taskmanager__search_memory(
    query="recent work current context",
    domain="general"  # or specific: frontend/backend/testing
)

# 4. CHECK SQLITE CACHE FOR RECENT OPERATIONS
cached = mcp__sqlite__query(
    sql="SELECT * FROM cache WHERE timestamp > datetime('now', '-1 day') ORDER BY timestamp DESC",
    values=[]
)

# 5. USE SEQUENTIAL THINKING (MINIMUM 15 THOUGHTS)
analysis = mcp__sequential-thinking__sequential_thinking(
    problem="[current task description]",
    constraints=["memory findings", "past failures"],
    goals=["successful implementation", "avoid past mistakes"]
)

# 6. CREATE TODOWRITE BASED ON FINDINGS
TodoWrite(todos=[
    # Tasks informed by memory and thinking
])

# 7. CREATE ACTUAL ARCHON TASKS FROM PLAN (MANDATORY)
for task in planned_tasks:
    mcp__archon__create_task(
        project_id="current_project_id",
        title=task["title"],
        description=task["description"],
        assignee="AI IDE Agent",
        task_order=task.get("priority", 0),
        feature=task.get("feature", "general")
    )
```

### IF YOU SKIP MEMORY CHECKS:
- **No Memory MCP** = You'll repeat past failures (92% destruction rate)
- **No Archon tasks check** = BLOCKED VIOLATION - ignores existing work
- **No memory-taskmanager** = Missing critical context
- **No SQLite cache** = Redo expensive operations
- **No sequential thinking** = Poor decision making
- **TodoWrite first** = VIOLATION - must check memory FIRST

## 🧠 SEQUENTIAL THINKING REQUIREMENTS

### MINIMUM THOUGHTS BY TASK TYPE:
- **Complex implementation**: 15-20 thoughts
- **Bug fixing**: 15 thoughts minimum
- **Verification tasks**: 20-25 thoughts
- **Simple tasks**: 10 thoughts minimum

### WHAT TO THINK ABOUT:
1. What did memory reveal about past attempts?
2. What patterns should I follow/avoid?
3. What cascade effects might occur?
4. What could break if I change this?
5. How will I verify this actually works?
6. What edge cases am I missing?
7. What would production reveal?
8. Am I repeating a past failure?
9. What's the user's actual experience?
10. How do I prove this works without lying?

## 🛠️ COMPREHENSIVE MCP TOOLS GUIDE

### 🧠 Memory & Intelligence (PRIORITY 1)
- **Memory MCP** (PRIMARY): `memory_append`, `memory_query`, `memory_latest`
  - When: ALL sessions for learning storage and retrieval
  - Usage: `memory_query(query="patterns", top_k=3, alpha=0.7)`
- **Sequential Thinking**: `sequential_thinking`, `problem_breakdown`, `analyze_problem`
  - When: Complex decisions, root cause analysis (15+ thoughts minimum)
  - Usage: `sequential_thinking(problem="task", constraints=[], goals=[])`
- **Archon** (MANDATORY): `create_project`, `list_tasks`, `create_task`, `perform_rag_query`
  - When: ALL project work - task management and knowledge base
  - Usage: `list_tasks(filter_by="status", filter_value="todo")`

### 🔍 Research & Documentation
- **Context7**: `resolve_library_id`, `get_library_docs`
  - When: Need current library/framework documentation
  - Usage: `resolve_library_id(libraryName="react")` → `get_library_docs`

### 🔧 Development Tools
- **GitHub**: `create_repository`, `push_files`, `create_pull_request`, `search_code`
  - When: Repository operations, PR management, code search
  - Usage: `push_files(owner="user", repo="name", files=[{"path": "...", "content": "..."}])`
- **ESLint**: `lint_files`
  - When: JavaScript/TypeScript linting (MANDATORY before claiming "working")
  - Usage: `lint_files(filePaths=["/absolute/path/to/file.js"])`
- **Semgrep**: `scan_directory`, `create_rule`, `analyze_results`
  - When: Security analysis, custom rule creation, vulnerability scanning
  - Usage: `scan_directory(path="/absolute/path", config="auto")`

### 🎨 Design & UI
- **Superdesign**: `superdesign_generate`, `superdesign_iterate`, `superdesign_gallery`
  - When: UI design generation, wireframes, components, logos
  - Usage: `superdesign_generate(prompt="dashboard UI", design_type="ui", framework="react")`
- **Blockbench**: `create_model`, `convert_model`, `launch_blockbench`
  - When: 3D modeling for games/Minecraft, model conversion
  - Usage: `create_model(name="model", format="java_block", filepath="/path")`

### 🧪 Testing & Verification (MANDATORY)
- **Playwright**: `browser_navigate`, `browser_take_screenshot`, `browser_snapshot`
  - When: ALL UI verification (REQUIRED for "working" claims)
  - Usage: `browser_navigate(url="http://localhost:3000")` → `browser_take_screenshot()`
- **Sentry**: `search_issues`, `get_issue_details`, `analyze_issue_with_seer`
  - When: Error tracking, production issue analysis, root cause analysis
  - Usage: `search_issues(organizationSlug="org", naturalLanguageQuery="errors")`

### 💾 Data & Storage
- **SQLite**: `query`, `create_record`, `read_records`, `list_tables`
  - When: Local data storage, caching expensive operations
  - Usage: `query(sql="SELECT * FROM table WHERE condition")`
- **Memory Taskmanager**: `store_memory`, `search_memory`, `request_planning`
  - When: Secondary context storage, task planning (backup to primary Memory MCP)
  - Usage: `store_memory(content="info", domain="backend", importance=8)`

### 🤖 AI Assistance
- **Codex**: `codex_execute`, `codex_review`
  - When: Complex code generation, comprehensive code reviews
  - Usage: `codex_review("files", "/path", "src/auth.py", "Focus on security")`

### 📁 File Operations (Core Tools)
- **File Ops**: `Read`, `Write`, `Edit`, `MultiEdit`, `Glob`, `Grep`
  - When: ALL file manipulation (ALWAYS Read before Edit)
  - Usage: `Read(file_path="/absolute/path")` → `Edit` or `MultiEdit`
- **Execution**: `Bash`, `TodoWrite`, `ExitPlanMode`
  - When: System commands, session task tracking
  - Usage: `Bash(command="npm test", description="Run tests")`

## 🎯 MCP TOOL SELECTION PATTERNS

### For New Features
1. **Memory** → Check past patterns
2. **Archon** → List pending tasks, create new tasks
3. **Sequential Thinking** → Analyze requirements (15+ thoughts)
4. **Context7** → Get library docs
5. **File Ops** → Read → Edit → MultiEdit
6. **Playwright** → Verify UI works
7. **ESLint** → Lint code
8. **Memory** → Store learnings

### For Bug Fixes
1. **Memory** → Query similar issues
2. **Sentry** → Analyze error patterns (if available)
3. **Semgrep** → Security/vulnerability scan
4. **Sequential Thinking** → Root cause analysis
5. **File Ops** → Fix implementation
6. **Playwright** → Verify fix works
7. **Memory** → Document solution

### For Code Review
1. **Codex** → Comprehensive review (`codex_review`)
2. **ESLint** → Linting validation
3. **Semgrep** → Security analysis
4. **Playwright** → UI testing
5. **Memory** → Store review findings

### For Research
1. **Archon** → RAG query project knowledge (`perform_rag_query`)
2. **Context7** → Library documentation
3. **GitHub** → Search existing code patterns
4. **Memory** → Store research findings

## ⚠️ CRITICAL MCP USAGE RULES

1. **ALWAYS use Memory MCP first** - Check patterns before starting
2. **MANDATORY Archon integration** - All work must have Archon tasks
3. **Playwright required for UI claims** - Never say "working" without screenshots
4. **ESLint before completion** - No unlinted code
5. **Sequential thinking for complexity** - 15+ thoughts minimum
6. **Read before Edit** - Always read files first
7. **Batch tool calls** - Use multiple tools in single message when possible

## 📋 MANDATORY WORKFLOW

### 1. START EVERY SESSION:
```python
# Check memory (ALL namespaces)
# Use sequential thinking
# Create TodoWrite based on findings
# Check existing work with Read/Grep
# Plan approach informed by memory
```

### 2. BEFORE IMPLEMENTATION:
```python
# Research with Archon RAG
# Get current docs with Context7
# Check Serena for existing patterns
# Review memory for what to avoid
```

### 3. DURING IMPLEMENTATION:
```python
# Read files before editing
# Use MultiEdit for multiple changes
# Cache expensive operations in SQLite
# Store context in memory-taskmanager
```

### 4. VERIFICATION (MANDATORY):
```python
# Navigate with Playwright
# Take screenshots for evidence
# Check for console errors
# Verify actual functionality
# NEVER claim "working" without screenshot
```

### 5. AFTER WORK:
```python
# Store learnings in Memory MCP
# Update memory-taskmanager context
# Cache results in SQLite
# Document what worked/failed
```

## 🚨 ENFORCEMENT RULES

### VIOLATIONS THAT BLOCK WORK:
- ❌ TodoWrite before memory checks → BLOCKED
- ❌ Edit/Write without Read first → BLOCKED
- ❌ Claiming "working" without screenshot → BLOCKED
- ❌ Skipping sequential thinking → WARNING
- ❌ Not storing learnings → WARNING

### SUCCESS REQUIREMENTS:
- ✅ Memory checked (Memory MCP latest + query)
- ✅ Archon tasks checked and created
- ✅ Sequential thinking completed (15+ thoughts)
- ✅ Files read before editing
- ✅ Screenshot evidence for UI claims
- ✅ Learnings stored after work

## 💡 KEY SUGGESTIONS FOR SUCCESS

### 1. **ALWAYS START WITH MEMORY**
Don't reinvent the wheel - learn from past attempts

### 2. **THINK BEFORE ACTING**
15+ sequential thoughts prevent 90% of failures

### 3. **VERIFY EVERYTHING**
Never trust - always verify with Playwright

### 4. **CACHE AGGRESSIVELY**
Use SQLite to avoid repeating expensive operations

### 5. **DOCUMENT LEARNINGS**
Store in Memory MCP so future work benefits

### 6. **BE HONEST**
If you can't verify, say "I cannot verify this"

### 7. **CHECK CASCADE EFFECTS**
One fix often breaks three other things

### 8. **USE THE RIGHT TOOL**
- Serena for semantic search, not grep
- Playwright for UI verification, not assumptions
- Context7 for current docs, not old examples

## ❌ COMMON FAILURES TO AVOID (FROM MEMORY)

Based on Memory MCP failure patterns:

1. **Claiming success without verification** → Always use Playwright
2. **Skipping memory checks** → Leads to repeated failures
3. **Not using sequential thinking** → Poor decisions
4. **Creating files unnecessarily** → Prefer editing existing
5. **Ignoring cascade effects** → Think about downstream impacts
6. **Not caching API calls** → Wastes time and resources
7. **Forgetting to store learnings** → Repeats mistakes

## 📊 MEMORY STORAGE GUIDE

### Memory MCP Roles
- **note**: General observations and findings
- **decision**: Key decisions made and rationale
- **issue**: Problems encountered and context
- **fix**: Solutions that worked
- **summary**: Session summaries and learnings
- **plan**: Planning and strategy decisions
- **risk**: Identified risks and mitigation

### Storage Categories
- **Project-specific**: Use project context in tags
- **Global patterns**: Use "global", "patterns" tags
- **Failure patterns**: Use "failure", "anti-pattern" tags
- **Success patterns**: Use "success", "solution" tags

## 🔄 CONTINUOUS IMPROVEMENT

After EVERY work session:
```python
# Store what you learned in Memory MCP
mcp__memory__memory_append(
    agent="claude_code",
    role="summary",
    title=f"Session: {task_description}",
    body=f"""
    Task: {what_you_worked_on}
    Solution: {what_worked}
    Failures: {what_didnt_work}
    Patterns: {reusable_patterns_discovered}
    Cascade Effects: {unexpected_impacts}
    Files Modified: {list_of_files}
    """,
    tags=["session", "learnings", project_name],
    importance=8
)

# Update context (secondary)
mcp__memory-taskmanager__store_memory(
    content="Session summary and key learnings",
    domain="general",
    importance=8
)
```

This ensures future work benefits from current learnings!
## Git Worktree Commands (Agent-Based Safe Feature Development)

### 🚨 AGENT-BASED ARCHITECTURE

**Work in worktrees with agent enforcement:**

```bash
# Create isolated worktree for feature development
.claude/scripts/git_worktree_automation.sh create [feature-name]

# Work directly in the worktree directory
cd ../[project]-worktrees/[feature-name]

# After completing work, merge back
.claude/scripts/git_worktree_automation.sh merge [feature-name]
```

### Basic Worktree Commands:
```bash
# Create isolated worktree for feature
.claude/scripts/git_worktree_automation.sh create [feature-name]

# Merge completed feature back to main
.claude/scripts/git_worktree_automation.sh merge [feature-name]

# Clean up after successful merge
.claude/scripts/git_worktree_automation.sh cleanup [feature-name]

# Emergency rollback if needed
.claude/scripts/git_worktree_automation.sh rollback [feature-name]

# List active worktrees
.claude/scripts/git_worktree_automation.sh list
```

### Why Worktree Isolation Still Matters:
- **Without isolation**: Changes affect main branch directly
- **With isolation**: Test features safely before merging
- **Each feature**: Gets own directory at ../[project]-worktrees/[feature-name]/
- **Complete freedom**: npm install, modify files, run tests without affecting main

Agent-based architecture uses worktrees for safe feature development with enforced workflows
