# Technical PR Workflow (Agents + Board)

This runbook prevents technical issues from getting blocked at closure time due to PR metadata or permissions.

## Done Gate (mandatory for technical code tasks)

Do not set an issue to `done` unless the closing comment includes:

- PR link (draft PR is valid while work is in progress)
- Short verification summary (checks/tests run)
- Scope summary (what changed)

If any item is missing, keep the issue open (`in_progress` or `blocked`).

## Standard GitHub auth for local agents

Preferred auth path for local execution:

1. Create or retrieve a short-lived GitHub token with repository PR permissions.
2. Export token in shell:

```bash
export GH_TOKEN="<token>"
```

3. Login CLI non-interactively:

```bash
echo "$GH_TOKEN" | gh auth login --with-token
```

4. Verify active identity and scopes:

```bash
gh auth status
```

Rotation policy:

- Use short-lived/fine-grained tokens when possible.
- Rotate token on role change, suspected leak, or at least every 30 days.
- Revoke old token immediately after rotation.

## PR body/template enforcement

The workflow `.github/workflows/pr-template-enforcement.yml` fails PR checks when:

- required sections are missing
- required checklist items are not checked
- placeholder template text is still present
- PR body is empty

This catches incomplete PR metadata early, before issue closure.

## Board fallback when agent cannot edit PR body

If an agent cannot update PR metadata due to permissions/runtime constraints:

1. Agent leaves a comment in the linked issue explaining the exact blocker.
2. Board owner (or any user with PR edit rights) updates PR body using `.github/pull_request_template.md`.
3. Agent re-runs/verifies checks and posts final closing comment with evidence.

## Required branch/worktree flow (WorkTrunk)

For repository code tasks:

```bash
wt switch --create <branch-name>
# implement in the selected worktree
wt list
```

Before closure, capture `wt list` output in the issue comment for traceability.
