# Technical Agent PR-Evidence Rule

This instruction applies to technical implementation work (frontend, backend/fullstack, junior engineering, and CTO when acting as an individual contributor).

## Done Gate (Mandatory)

For any issue that changes code, you MUST provide PR evidence before setting issue status to `done`.

Required evidence in the closing comment:
- PR link (or draft PR link) that contains the change.
- Short verification summary (tests/checks run).
- Scope summary of what was changed.

If PR evidence is missing, do not move the issue to `done`.

## PR Workflow (Mandatory)

For any repository code change:
- Create a PR (draft PR is allowed while work is in progress).
- Fill the PR description using `.github/pull_request_template.md`.
- Keep the PR link ready for the Paperclip closing comment.

Technical tasks are not considered complete until this PR workflow is satisfied.

## Exception: No Code Change

If the task legitimately has no code changes, you may close without PR only if your closing comment includes an explicit statement:
- "No-code task" rationale (why no repository change was needed).
- What artifact changed instead (plan, docs, coordination, API configuration, etc.).

Without this explicit no-code explanation, do not close as `done`.
