---
name: frontend
description: >
  Use this skill for any frontend development task: building React/Vue/Svelte
  components, HTML/CSS layouts, interactive UI, forms, dashboards, animations,
  responsive design, accessibility audits, performance optimizations, or
  refactoring existing frontend code. Triggers on keywords like "component",
  "page", "layout", "UI", "styles", "responsive", "animation", "form", "button",
  "modal", "navbar", "dashboard", "landing page", "refactor CSS", "fix styles".
---
If user doesn't specify stack, default to: semantic HTML + vanilla JS + CSS variables + mobile-first. Ask before adding frameworks.
---

# Frontend Development Skill

This skill guides production-grade frontend development: clean architecture,
accessible markup, maintainable CSS, and polished UI.

---

## Stack Detection

Before writing any code, identify the project's stack:

- Check `package.json` for React, Vue, Svelte, Angular, Next.js, Nuxt, Astro
- Check for TypeScript (`tsconfig.json`, `.ts`/`.tsx` files) — prefer TS if present
- Check for a CSS framework: Tailwind (`tailwind.config.*`), CSS Modules, styled-components, etc.
- Check the existing component style (functional/class, composition API, etc.)

**Always match the existing conventions of the project, never introduce new ones without asking.**

---

### Vanilla / Static JS Fallback
- No build step → use ES modules (`type="module"`), defer/async scripts
- State → `localStorage` + `CustomEvent` or lightweight signals
- Routing → `history.pushState` + `popstate` or static file generation
- Keep DOM manipulation minimal; prefer declarative templates or `<template>` cloning

---

## Component Architecture

### General principles
- One component = one responsibility. Split if a component has >1 concern.
- Keep components small: if it exceeds ~150 lines, consider splitting.
- Co-locate styles, tests, and stories next to the component file.
- Avoid prop drilling beyond 2 levels — use context, store, or composition.

### React
```tsx
// Prefer named exports over default exports for components
export function Button({ label, onClick, variant = 'primary', disabled = false }: ButtonProps) {
  return (
    <button
      className={cn('btn', `btn--${variant}`, { 'btn--disabled': disabled })}
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {label}
    </button>
  );
}

// Define prop types above the component
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}
```

### State management
- Local UI state → `useState` / `useReducer`
- Shared transient state → Context + `useReducer`
- Server/async state → React Query, SWR, or TanStack Query
- Global app state → Zustand or Jotai (avoid Redux unless already in use)

---

## CSS & Styling

### CSS custom properties — always define a design token layer
```css
CSS custom properties — always define a design token layer. 
❌ Do NOT hardcode brand hex values unless explicitly provided.
✅ Extract existing tokens from the project styles, or ask for the design system/brand palette.
:root {
  /* Colors: map to project brand or request palette */
  --color-primary: /* value */;
  --color-surface: /* value */;
  --color-text: /* value */;
  /* Typography, spacing, radius, shadows, transitions: define based on project or use neutral accessible defaults */
}easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Layout patterns
```css
/* Responsive container */
.container {
  width: 100%;
  max-width: 1280px;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

/* Flex row with gap */
.row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

/* CSS Grid — 12-column */
.grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--space-4);
}

/* Auto-fill cards */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
}
```

### Responsive breakpoints (mobile-first)
```css
/* xs  < 480px  — default styles */
/* sm  ≥ 480px */
@media (min-width: 480px) { }
/* md  ≥ 768px */
@media (min-width: 768px) { }
/* lg  ≥ 1024px */
@media (min-width: 1024px) { }
/* xl  ≥ 1280px */
@media (min-width: 1280px) { }
```

---
### Cascade & Specificity Rules
- Prefer `@layer` to manage precedence: `base → components → utilities → overrides`
- Keep selector specificity low: max 2 levels of nesting, avoid ID selectors and deep combinators
- Use `:where()` and `:is()` to reset specificity when composing utilities
- Prefer logical properties (`margin-inline`, `padding-block`, `text-align: start`) for i18n/RTL readiness
- Never use `!important` — restructure cascade or move to a higher `@layer`
- Maintain a documented `z-index` scale in design tokens; never hardcode `z-index: 9999`
---

## Accessibility (a11y)

Every component must meet WCAG 2.1 AA. Checklist:

- [ ] All interactive elements reachable by keyboard (Tab, Enter, Space, Escape, Arrow keys)
- [ ] Focus ring visible — never `outline: none` without a custom replacement
- [ ] Color contrast ≥ 4.5:1 for text, ≥ 3:1 for large text and UI components
- [ ] Images have meaningful `alt` text; decorative images use `alt=""`
- [ ] Form inputs have `<label>` associated via `for`/`id` or `aria-label`
- [ ] Error messages linked to inputs via `aria-describedby`
- [ ] Modals trap focus; return focus on close
- [ ] `aria-live` regions for dynamic content updates
- [ ] Semantic HTML: `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>`, `<article>`, `<button>` (not `<div>` for clickable elements)

```tsx
// Accessible icon button
<button
  aria-label="Close dialog"
  onClick={onClose}
  type="button"
>
  <CloseIcon aria-hidden="true" />
</button>

// Accessible form field
<div>
  <label htmlFor="email">Email address</label>
  <input
    id="email"
    type="email"
    aria-describedby={error ? 'email-error' : undefined}
    aria-invalid={!!error}
  />
  {error && <span id="email-error" role="alert">{error}</span>}
</div>
```

---

## Performance

### Images
- Always specify `width` and `height` to prevent layout shift (CLS)
- Use `loading="lazy"` for below-the-fold images
- Prefer `<picture>` with WebP/AVIF sources
- Use `srcset` for responsive images

### Code splitting
```tsx
// Lazy load heavy components
const Chart = lazy(() => import('./Chart'));
const RichEditor = lazy(() => import('./RichEditor'));

// Wrap in Suspense
<Suspense fallback={<Skeleton />}>
  <Chart data={data} />
</Suspense>
```

### Rendering optimization
- Memoize expensive computations with `useMemo`
- Memoize callbacks passed to child components with `useCallback`
- Use `React.memo` on pure presentational components that re-render often
- Virtualize long lists with `react-virtual` or `@tanstack/virtual`
- Avoid anonymous functions in JSX if the component renders frequently

### Core Web Vitals targets
- LCP < 2.5s — largest contentful paint
- FID / INP < 200ms — interaction responsiveness
- CLS < 0.1 — no unexpected layout shifts

---

## Forms

```tsx
// Prefer react-hook-form for non-trivial forms
import { useForm } from 'react-hook-form';

function LoginForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' }
        })}
        aria-invalid={!!errors.email}
      />
      {errors.email && <p role="alert">{errors.email.message}</p>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
```

---

## Animations

Prefer CSS transitions over JS for simple state changes:

```css
/* Smooth hover */
.card {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
  transition: transform var(--duration-normal) var(--easing),
              box-shadow var(--duration-normal) var(--easing);
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.appear { animation: fadeIn var(--duration-slow) var(--easing) both; }
```

Respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Error States & Loading

Always implement three UI states for async data: loading, error, success.

```tsx
function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading } = useUser(userId);

  if (isLoading) return <ProfileSkeleton />;
  if (error)     return <ErrorMessage message="Could not load profile" retry={refetch} />;
  return <Profile user={data} />;
}
```

Skeleton loaders are preferred over spinners for content areas — they reduce perceived load time.

---

## File & Folder Structure

```
src/
├── components/
│   ├── ui/           # Generic primitives: Button, Input, Modal, Badge…
│   └── features/     # Domain components: UserCard, ProductGrid…
├── pages/ (or app/)  # Routes
├── hooks/            # Custom hooks: useDebounce, useLocalStorage…
├── utils/            # Pure functions, formatters, validators
├── stores/           # Global state (Zustand atoms, contexts)
├── services/         # API clients, data fetching functions
├── types/            # Shared TypeScript interfaces
└── styles/           # Global CSS, variables, resets
```

---

## Code Quality

- Run `eslint` and `prettier` before every commit (or set up `lint-staged`)
- Use TypeScript strict mode: `"strict": true` in `tsconfig.json`
- Test interactive components with React Testing Library / Playwright — test behavior, not implementation
- Always cover: happy path, error states, loading/skeleton, keyboard navigation, and focus traps
- Use queries by role, text, or accessible label — never by CSS class or DOM structure
- Mock network requests and timers; never test against real APIs or external services
- Aim for meaningful coverage of user flows, not arbitrary percentage thresholds
- Name booleans with `is`, `has`, `can`, `should`: `isLoading`, `hasError`, `canSubmit`
- Name event handlers with `handle`: `handleSubmit`, `handleClick`, `handleChange`
- Extract reusable logic into custom hooks, not utilities

---

## Common Pitfalls to Avoid

- ❌ `useEffect` for data that can be derived from state
- ❌ Storing derived state in `useState`
- ❌ `key={index}` on lists that can reorder or change
- ❌ Inline styles for anything other than truly dynamic values
- ❌ `!important` in CSS — restructure specificity instead
- ❌ `z-index: 9999` — maintain a z-index scale in tokens
- ❌ Uncaught promise rejections in event handlers
- ❌ `<div onClick>` instead of `<button>` for interactive elements
- ❌ Missing `aria-label` on icon-only buttons
- ❌ Forgetting `key` when rendering lists
