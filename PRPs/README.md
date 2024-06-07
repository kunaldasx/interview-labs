# PRPs — Prompt Requirements Profiles

A PRP is a structured specification document created **before** implementation begins. It gives AI-assisted development full context, validation steps, and anti-patterns so that code is written correctly the first time.

## When to Create a PRP

Create a PRP for any task that involves:

- **New features** — adding a module, page, API endpoint, or integration
- **Multi-file changes** — anything touching 3+ files across backend/frontend
- **Architectural decisions** — new patterns, libraries, or infrastructure changes
- **Complex bug fixes** — where root cause analysis and multi-step fixes are needed

**Skip PRPs for:** single-line fixes, typos, simple config changes, or tasks with very specific instructions already provided.

## How to Use

1. **Copy the template:**
   ```
   cp PRPs/templates/prp_template.md PRPs/YYYY-MM-DD-feature-name.md
   ```

2. **Fill in the sections:**
   - Replace all `[bracketed placeholders]` with task-specific details
   - Keep the pre-filled HireEz context (tech stack, gotchas, commands)
   - Add task-specific references, models, and pseudocode
   - Adjust the task list to match your implementation steps

3. **Review before implementing:**
   - Verify success criteria are measurable
   - Ensure all integration points are identified
   - Confirm validation commands are correct for your changes

4. **Implement following the PRP:**
   - Work through the task list in order
   - Run validation at each level after completing tasks
   - Check off the final validation checklist before marking done

## Directory Structure

```
PRPs/
  README.md                          # This file
  templates/
    prp_template.md                  # Reusable template (don't edit directly)
  YYYY-MM-DD-feature-name.md         # Completed PRPs (one per feature)
```

## Reference

Based on the [PRP v2 template](https://github.com/manojkanur/AI_FullStack_Development_Kit/blob/main/PRPs/templates/prp_base.md) from AI_FullStack_Development_Kit, customized for the HireEz project.
