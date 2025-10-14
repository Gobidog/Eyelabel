# V.E.R.I.F.Y. Wave-Based Execution Details

## 🌊 WAVE SYSTEM WITH ARCHON INTEGRATION

### 🚨 CRITICAL: CONTINUOUS EXECUTION UNTIL COMPLETION

**MANDATORY BEHAVIOR**: Execute ALL waves without stopping until project is FULLY COMPLETED and VERIFIED. Do NOT wait for user input between waves.

### Wave 1: Analysis (ALWAYS FIRST - SOLO)
```python
# Get or create analysis task in Archon
archon:manage_task(
    action="create",
    title="Analyze requirements for [feature]",
    task_order=10
)

# Launch problem-insight agent
Task(subagent_type="problem-insight", prompt="Analyze and create EXECUTION_PLAN.md")
```
↓ IMMEDIATELY continue to Wave 2 ↓

### Wave 2: SEQUENTIAL Implementation (CRITICAL CHANGE - NO PARALLEL!)
```python
# 🚨 V7.0 COORDINATION: SEQUENTIAL EXECUTION REQUIRED 🚨
# Based on catastrophic failures from parallel execution, these MUST run sequentially

# Step 1: Check agent coordinator
coordinator_status = Bash("python /home/marsh/.claude/scripts/agent_coordinator.py status")
print(f"Coordinator status: {coordinator_status}")

# Step 2: Clean up any conflicts
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py cleanup")

# Step 3: Database FIRST (blocks everything else)
archon:manage_task(action="create", title="Database setup", feature="Database")
Task(subagent_type="database-ops", prompt="Set up database schema")
# WAIT FOR COMPLETION before next agent

# Step 4: Backend SECOND (needs database ready)
archon:manage_task(action="create", title="Backend implementation", feature="Backend")
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py start --agent backend-architect")
Task(subagent_type="backend-architect", prompt="Implement backend APIs")
# WAIT FOR COMPLETION before next agent
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py complete --agent backend-architect")

# Step 5: Frontend LAST (needs backend APIs)
archon:manage_task(action="create", title="UI implementation", feature="UI")
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py start --agent frontend-developer")
Task(subagent_type="frontend-developer", prompt="Implement frontend")
# WAIT FOR COMPLETION
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py complete --agent frontend-developer")

# ❌ NEVER spawn these agents simultaneously - causes:
# - Port conflicts (multiple servers on 3000)
# - Build corruption (.next directory conflicts)
# - Database race conditions
# - Import path mismatches
```
↓ IMMEDIATELY continue to Wave 3 ↓

### Wave 3: Testing & Verification (CONTROLLED SEQUENTIAL)
```python
# 🚨 V7.0: Verification needs stable server - run sequentially!

# Create verification task in Archon
archon:manage_task(action="create", title="System verification", feature="Testing")

# Step 1: Ensure server is stable and owned by verification
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py cleanup")
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py start --agent system-verification")

# Step 2: System verification FIRST (needs exclusive server access)
Task(subagent_type="system-verification", prompt="Comprehensive system testing with browser")
# WAIT FOR COMPLETION

# Step 3: Release server lock
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py complete --agent system-verification")

# Step 4: Other testing (can run in parallel - no server restart)
Task(subagent_type="test-runner", prompt="Run unit tests")
Task(subagent_type="security-scanner", prompt="Scan for vulnerabilities")

# Step 5: UAT testing LAST (needs everything stable)
Bash("python /home/marsh/.claude/scripts/agent_coordinator.py start --agent uat-tester")
Task(subagent_type="uat-tester", prompt="""
    MANDATORY USER EXPERIENCE VERIFICATION:
    1. Navigate to the application using mcp__playwright__browser_navigate
    2. Take screenshots of ALL UI states using mcp__playwright__browser_take_screenshot
    3. Test user workflows: Click buttons, enter data, verify results
    4. Check responsive design at 320px, 768px, 1024px, 1920px widths
    5. Verify visual quality: No squashed elements, proper spacing, readable text
    6. Test accessibility: Keyboard navigation, screen reader compatibility
    7. Document any UI issues found with screenshots
    8. FAIL the test if UI is unusable or visually broken
""")
```
↓ IF tests pass AND UI is usable: continue to Wave 4. IF ANY fail: return to Wave 2 ↓

### Wave 4: Documentation & Deployment
```python
# Update all Archon tasks to "done" or "review"
# Record everything in Pinecone
# Final wave based on test results
Task(subagent_type="documentation", prompt="...")
Task(subagent_type="deployment", prompt="...")
```
↓ IMMEDIATELY continue to Wave 5 ↓

### Wave 5: Project Cleanup & Finalization
```python
# Create cleanup task in Archon
archon:manage_task(action="create", title="Project cleanup and finalization", feature="Cleanup")

# Clean up test artifacts and temporary files
print("🧹 Cleaning up project directory...")

# Remove test screenshots (keep only final documentation screenshots)
Bash("find . -name '*test*.png' -o -name '*test*.jpg' -o -name 'screenshot-*.png' | grep -v docs | xargs rm -f")

# Remove temporary test files
Bash("find . -name '*.tmp' -o -name '*.temp' -o -name '*.bak' -o -name '*.swp' | xargs rm -f")

# Remove test logs (keep only essential logs)
Bash("find . -name '*test*.log' -o -name '*debug*.log' | xargs rm -f")

# Remove node_modules test artifacts if present
Bash("find . -path '*/node_modules/*test*' -type f | xargs rm -f 2>/dev/null || true")

# Clean up Python cache if present
Bash("find . -name '__pycache__' -type d | xargs rm -rf 2>/dev/null || true")
Bash("find . -name '*.pyc' -o -name '*.pyo' | xargs rm -f 2>/dev/null || true")

# Remove coverage reports (keep only final report)
Bash("rm -rf coverage/ .coverage .nyc_output/ 2>/dev/null || true")

# Create final project structure documentation
Bash("tree -I 'node_modules|__pycache__|.git' > project-structure.txt")

# Update all Archon tasks to completed
archon:manage_task(action="update", task_id="...", update_fields={"status": "done"})

# Final Pinecone update with project completion
mcp__pinecone__upsert-records(
    name="coder",
    namespace=f"proj-{project_name}",
    records=[{
        "id": f"project-complete-{timestamp}",
        "content": "Project completed, tested, deployed, and cleaned",
        "task_type": "completion",
        "success": True,
        "final_structure": "[tree output]",
        "artifacts_removed": ["test files", "temp files", "debug logs"]
    }]
)
```
↓ ONLY STOP when project is cleaned and finalized ↓

## 🎯 PROJECT COMPLETION CRITERIA

**DO NOT STOP until ALL criteria are met:**

✅ **Features Complete**
- All requested functionality implemented
- All Archon tasks marked "done" or "review" WITH VERIFIED DELIVERABLES
- User can actually USE the features (not just started)
- Each task has required artifacts (test files for tests, docs for documentation, etc.)

✅ **Testing Passed**
- All tests pass (unit, integration, e2e)
- Security scan shows no critical vulnerabilities
- Performance meets requirements
- User acceptance testing completed WITH SCREENSHOTS
- Browser testing validates ACTUAL USER EXPERIENCE

✅ **User Experience Verified**
- UI is visually appealing (not squashed/broken)
- Layout is properly spaced and aligned
- Interactive elements are easily clickable
- Responsive design works on all screen sizes
- Accessibility standards met (keyboard navigation, screen reader compatible)
- Screenshots prove visual quality

✅ **Quality Verified**
- Code follows project standards
- Documentation is complete
- No broken functionality
- Error handling implemented
- Visual regression tests pass

✅ **Deployment Ready**
- Build succeeds without errors
- All dependencies resolved
- Configuration correct
- Ready for production use
- User can successfully complete all intended workflows

✅ **Project Cleaned**
- Test artifacts removed (test screenshots, temp files)
- Debug logs cleaned up
- Cache files removed (__pycache__, *.pyc, etc.)
- Coverage reports archived
- Project structure documented
- Only production files remain

**ENFORCEMENT**: If ANY criteria fails, continue waves until fixed.

## 📝 TASK COMPLETION INTEGRITY RULES

**CRITICAL**: Tasks can ONLY be marked "done" when deliverables exist:

**Testing Tasks** require:
- ✅ Test files (*.test.*, *.spec.*, etc.)
- ✅ Passing test results
- ✅ Test coverage reports
- ✅ Browser testing for UI components

**Documentation Tasks** require:
- ✅ Documentation files (*.md, README, etc.)
- ✅ API documentation if applicable
- ✅ User guides if applicable
- ✅ Code comments where necessary

**UI/Frontend Tasks** require:
- ✅ Implementation files (components, styles)
- ✅ Screenshots of all UI states
- ✅ Browser testing validation
- ✅ Responsive design verification
- ✅ Visual quality check (no squashed/broken layouts)

**Implementation Tasks** require:
- ✅ Working code files
- ✅ Integration with existing code
- ✅ Error handling
- ✅ Performance acceptable

**VIOLATION**: Marking tasks "done" without deliverables breaks Archon integrity.

## 🎨 VISUAL QUALITY GATES

**MANDATORY**: ALL UI deliverables must pass visual quality checks:

**Layout Quality**:
- ❌ FAIL: Squashed or overlapping elements
- ❌ FAIL: Broken responsive design
- ❌ FAIL: Unreadable text (too small, poor contrast)
- ❌ FAIL: Misaligned components
- ✅ PASS: Proper spacing, alignment, readable at all sizes

**User Experience Quality**:
- ❌ FAIL: Buttons too small to click easily
- ❌ FAIL: Forms difficult to fill out
- ❌ FAIL: Navigation confusing or broken
- ❌ FAIL: Key features hidden or hard to find
- ✅ PASS: Intuitive, easy to use, clear user flow

**Visual Evidence Required**:
- Screenshots at multiple screen sizes (mobile, tablet, desktop)
- Before/after comparisons for bug fixes
- User journey screenshots (start → action → result)
- Error state screenshots
- Loading state screenshots

**Browser Testing Protocol**:
```python
# MANDATORY for all UI tasks
mcp__playwright__browser_navigate(url="[app_url]")
mcp__playwright__browser_resize(width=320, height=568)  # Mobile
mcp__playwright__browser_take_screenshot(filename="mobile-view.png")
mcp__playwright__browser_resize(width=768, height=1024)  # Tablet
mcp__playwright__browser_take_screenshot(filename="tablet-view.png")
mcp__playwright__browser_resize(width=1920, height=1080)  # Desktop
mcp__playwright__browser_take_screenshot(filename="desktop-view.png")

# Test user interactions
mcp__playwright__browser_click(element="button", ref="[button_ref]")
mcp__playwright__browser_type(element="input", text="test data")
mcp__playwright__browser_take_screenshot(filename="after-interaction.png")
```

**ENFORCEMENT**: UI tasks cannot be marked "done" without passing visual quality gates.

## 🧹 PROJECT CLEANUP ARTIFACTS

**MANDATORY Wave 5 Cleanup - Remove These Files:**

**Test Artifacts**:
- `*test*.png`, `*test*.jpg` - Test screenshots
- `screenshot-*.png` - Temporary screenshots (keep docs/ screenshots)
- `*.test.js`, `*.spec.js` - Keep in test/ directory, remove if scattered
- `test-results/`, `test-output/` - Temporary test output directories

**Temporary Files**:
- `*.tmp`, `*.temp` - Temporary files
- `*.bak`, `*.backup` - Backup files
- `*.swp`, `.*.swp` - Editor swap files
- `*.orig` - Git merge artifacts
- `.DS_Store` - macOS artifacts

**Debug/Development Files**:
- `*debug*.log`, `*test*.log` - Debug logs
- `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*`
- `lerna-debug.log*`
- `.npm/`, `.yarn/` - Package manager caches

**Coverage/Build Artifacts**:
- `coverage/`, `.coverage` - Coverage reports (archive first)
- `.nyc_output/` - NYC coverage data
- `htmlcov/` - HTML coverage reports
- `dist-test/`, `build-test/` - Test builds

**Language-Specific**:
- Python: `__pycache__/`, `*.pyc`, `*.pyo`, `.pytest_cache/`
- JavaScript: `.eslintcache`, `.babel-cache`
- Java: `*.class`, `target/test-classes/`
- Go: `*.test`, `*.out`

**Keep These**:
- ✅ Production build files
- ✅ Documentation and README
- ✅ Configuration files
- ✅ Source code
- ✅ Final screenshots in docs/
- ✅ Essential logs only

## 🤖 MANDATORY SUBAGENT PROMPT TEMPLATE

**CRITICAL**: ALL Task() calls MUST include this Archon workflow context:

```
Task(
    subagent_type="[agent-type]",
    prompt="""
    🚨 ARCHON-FIRST RULE: You MUST follow this workflow:

    1. BEFORE ANY WORK: Check your assigned Archon task
       archon:manage_task(action="get", task_id="[task_id_from_main_claude]")

    2. UPDATE STATUS: Mark task as in-progress
       archon:manage_task(action="update", task_id="[task_id]", update_fields={"status": "doing"})

    3. RESEARCH FIRST: Use Archon knowledge base
       archon:search_code_examples(query="[relevant_search]", match_count=3)
       archon:perform_rag_query(query="[technical_query]", match_count=5)

    4. CHECK PINECONE: Search for past solutions
       mcp__pinecone__search-records(name="coder", namespace="global_knowledge_base", query={"inputs": {"text": "[task_context]"}, "topK": 3})

    5. IMPLEMENT: Based on research findings

    6. UPDATE COMPLETION: Mark task as review/done
       archon:manage_task(action="update", task_id="[task_id]", update_fields={"status": "review"})

    7. RECORD LEARNINGS: Update Pinecone with results

    YOUR SPECIFIC TASK: [actual_task_description]

    CONTEXT FROM MAIN CLAUDE: [relevant_context_and_findings]
    """
)
```

**VIOLATION**: Any Task() call without this Archon workflow template violates the ARCHON-FIRST RULE.

## KEY WAVE RULES

1. **NEVER STOP between waves - execute continuously**
2. **Every wave starts with Archon task check/creation**
3. **Wave 1 is ALWAYS problem-insight alone**
4. **Read EXECUTION_PLAN.md before Wave 2**
5. **Spawn all agents in a wave with ONE message**
6. **Update Archon after each wave completes**
7. **Record results in Pinecone for memory**
8. **ONLY STOP when completion criteria met**
9. **MANDATORY: Include Archon workflow in ALL subagent prompts**
10. **Wave 5 MUST clean up all test artifacts**

## 🔴 CRITICAL: After Problem-Insight Completes

When problem-insight agent finishes and creates EXECUTION_PLAN.md, YOU MUST:

### 1. Update Archon with Plan
```python
# Create subtasks based on plan
archon:manage_task(
    action="create",
    project_id="...",
    title="[Subtask from plan]",
    parent_task_id="[main_task_id]"
)
```

### 2. Spawn Agents Based on Plan - THE CRITICAL PART

**⚠️ CRITICAL: For parallel execution, you MUST spawn ALL agents for a wave in a SINGLE message!**

**WRONG WAY (Sequential):**
```
# DON'T DO THIS - Creates sequential execution
Task(subagent_type="ui-designer", prompt="...")
# wait for result
Task(subagent_type="frontend-developer", prompt="...")
# wait for result
Task(subagent_type="backend-architect", prompt="...")
```

**RIGHT WAY (Parallel):**
```
# DO THIS - Single message with multiple Task calls
# All agents will execute simultaneously (same timestamp in logs)
print("Spawning 3 agents in parallel for Wave 2...")
# Then use multiple Task() invocations in ONE response
```