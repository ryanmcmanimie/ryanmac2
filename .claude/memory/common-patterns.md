# Common Patterns

<!--
Document patterns specific to this codebase.
Claude reads this to maintain consistency.
Add patterns as they emerge.
-->

## Component Patterns

<!-- How components are structured in this project -->

```tsx
// Example: Standard component structure
// components/ui/Button.tsx

interface ButtonProps {
  // ...
}

export function Button({ ...props }: ButtonProps) {
  // ...
}
```

## Data Fetching Patterns

<!-- How data is fetched in this project -->


## Naming Conventions

<!-- Project-specific naming patterns -->

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile.tsx` |
| Utilities | camelCase | `formatDate.ts` |
| Hooks | use* prefix | `useAuth.ts` |
| API routes | kebab-case | `api/user-profile/route.ts` |

## File Organization

<!-- How files are organized in this project -->


## Testing Patterns

<!-- How tests are written in this project -->

