# Accessibility checklist (Sprint 1)

Use this as a minimum baseline for every frontend PR.

## Required checks

- Keyboard access:
  - All interactive controls are reachable with Tab/Shift+Tab.
  - Focus is always visible.
- Semantics:
  - Use semantic elements (`main`, `nav`, `header`, `footer`, lists, buttons).
  - Headings follow an ordered hierarchy.
- Forms:
  - Inputs have visible labels.
  - Validation and errors are announced in text and not only color.
- Media:
  - Images have useful `alt` text.
  - Decorative images use empty `alt=""`.
- Contrast:
  - Text and UI controls maintain readable contrast.
  - Important state is not conveyed by color alone.

## Suggested quick verification flow

1. Test one desktop viewport and one mobile viewport.
2. Navigate key pages using keyboard only.
3. Run Lighthouse accessibility audit for:
   - `/`
   - `/discover`
   - one detail page
