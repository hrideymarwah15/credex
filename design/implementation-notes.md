# Implementation Notes — Light-Mode-First Redesign

## Files Changed

| File | Change |
|------|--------|
| `app/globals.css` | Complete rewrite — new design tokens (shadow scale, accent-hover, accent-bg, ring), light-mode-first CSS variables, dark mode overrides, `card-shadow`/`shadow-xs` utility classes, `animate-pulse-dot` keyframes, improved focus-visible (2px solid + offset), `prefers-reduced-motion` fallbacks |
| `app/layout.tsx` | Updated themeColor meta to `#ffffff`, light/dark gradient overlay |
| `components/providers/ThemeProvider.tsx` | `defaultTheme` changed from `"dark"` to `"light"` |
| `lib/audit/severity.ts` | All severity classes now include light-mode base + `dark:` variants |
| `components/ui/Button.tsx` | Added `danger` variant, `border` on primary, `dark:` variants on secondary/ghost, `focus-visible:ring-2`, rounded-xl, `transition-all` |
| `components/ui/Input.tsx` | Light-mode-first base styles (`border-slate-200`, `bg-white`), `dark:` variants, `shadow-xs`, `focus:ring-2`, rounded-xl, updated Label with `font-semibold` |
| `components/ui/Badge.tsx` | Redesigned SeverityBadge (rounded-full, font-semibold, tracking-wide), added new `StatusBadge` component |
| `components/ui/Card.tsx` | Added `surface` variant, `CardHeader`/`CardBody` sub-components, `card-shadow` class, `dark:` variants, `pointer-events-none` on overlays |
| `components/ui/ThemeToggle.tsx` | Now uses `motion.button` with `whileTap`, rounded-xl, border on hover, `dark:` variants |
| `components/layout/PageShell.tsx` | Complete redesign — sticky nav bar with logo, live pricing indicator, hero section with animated badge/headline/trust strip, professional footer |
| `components/AuditForm.tsx` | Restructured into Step 1/Step 2 card sections, `card-shadow`, `layout` animations, removed `whileHover` scale on tool cards, added cost preview with `motion.div`, new submit copy + trust line |
| `components/Results.tsx` | Removed `ReferralCode` import, redesigned savings hero (light gradient bg, badge pills, refined typography), `motion.article` for findings, `card-shadow` on all cards, `dark:` variants throughout |
| `components/LeadCapture.tsx` | Professional layout with icon header, success state with gradient bg, `ShieldCheck` icon, `card-shadow`, `dark:` variants |
| `components/Benchmark.tsx` | Light-mode bar colors (`bg-emerald-200`, `bg-amber-200`), larger marker (w-4 h-4), `card-shadow`, `dark:` variants, updated rating labels |
| `components/SpendBar.tsx` | Fixed hook call order (useReducedMotion before early return), light-mode bar bg (`bg-slate-200`), percentage label styled with emerald |
| `components/ShareButtons.tsx` | Rounded-xl, light-mode borders, `shadow-xs`, `font-semibold`, `dark:` variants |

## New Dependencies

None.

## Known Deferrals

| Item | Reason |
|------|--------|
| `ReferralCode.tsx` uses `variant="outline"` on Button | Pre-existing bug — `outline` variant never existed. Component is no longer imported from Results but still exists in codebase. Not touched since it's outside the redesign scope. |
| Pre-existing lint errors (3 `set-state-in-effect` + 1 unused import) | These exist in `AuditForm`, `AnimatedCounter`, `ThemeToggle`, and `ReferralCode` respectively. They predate this redesign and are not regressions. Fixing them would change component behavior/logic, which is out of scope for a styling redesign. |
| PDF download template styling | `components/pdf/DownloadButton.tsx` was not in scope — its rendered PDF may not match the new light-mode palette. |
| `embed` page | `/app/embed/page.tsx` was not in scope and may still use dark-first styling. |

## Commands to Verify

```bash
cd /Users/hridey/Credex/credex

# Build (should pass cleanly)
npm run build

# Lint (3 pre-existing errors, 0 new)
npm run lint

# Dev server
npm run dev
# → Open http://localhost:3000
# → Verify light mode is default
# → Toggle dark mode via moon icon in nav
# → Test at 320px viewport width
# → Test form submission flow
# → Verify focus rings (Tab through form)
```
