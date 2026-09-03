---
applyTo: "**"
---

This is a static html, css and JavaScript landing page for the Game Dev Arena project, showcasing the community, mission, and founders. It includes a live reload development server for easy updates during development.

# Game Dev Arena Website Instructions

This document defines coding standards, best practices, and a utility class reference for all HTML, CSS, and JavaScript code in this project. Follow these guidelines to ensure code quality, maintainability, and consistency.

# Coding Standards and Best Practices

## HTML

- Use semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`, etc.) for structure and accessibility.
- Always provide `alt` attributes for images.
- Use `aria-*` attributes and roles for accessibility where needed.
- Prefer external CSS and JS over inline styles/scripts.
- Use descriptive, lowercase, hyphen-separated class names.
- Keep markup clean and readable; indent consistently.
- Use `<button>` for actions, `<a>` for navigation.
- Use custom elements (Web Components) for reusable UI blocks.

## CSS

- Use CSS custom properties (variables) for colors, spacing, and typography.
- Prefer utility classes for layout, spacing, and color.
- Use BEM or utility-first naming for custom classes.
- Group related styles and use comments for sections.
- Use responsive units (`rem`, `%`, `vw`, `vh`) and media queries for layout.
- Avoid `!important` unless absolutely necessary.
- Use `:root` for global variables and theming.
- Leverage the provided utility classes for rapid prototyping and consistency.

## JavaScript

- Use ES6+ features (let/const, arrow functions, modules, etc.).
- Prefer `const` for values that do not change.
- Use strict mode and avoid global variables.
- Organize code in modules; use custom elements for UI components.
- Use event delegation and unobtrusive JS.
- Document functions and components with JSDoc or comments.
- Handle errors gracefully and validate user input.
- Keep code DRY (Don't Repeat Yourself) and modular.

# CSS Utility Classes (from `design.css`)

## Spacing Utilities

- Margin: `.m-0`, `.m-xs`, `.m-sm`, `.m-md`, `.m-lg`, `.m-xl`, `.m-2xl`, `.m-3xl`, `.m-4xl`, and directional variants (`.mt-`, `.mb-`, `.ml-`, `.mr-`, `.mx-`, `.my-`)
- Padding: `.p-0`, `.p-xs`, `.p-sm`, `.p-md`, `.p-lg`, `.p-xl`, `.p-2xl`, `.p-3xl`, `.p-4xl`, and directional variants (`.pt-`, `.pb-`, `.pl-`, `.pr-`, `.px-`, `.py-`)
- Gap: `.gap-0`, `.gap-xs`, `.gap-sm`, `.gap-md`, `.gap-lg`, `.gap-xl`, `.gap-2xl`, `.gap-3xl`, `.gap-4xl`

## Color Utilities

- Background: `.bg-primary`, `.bg-secondary`, `.bg-tertiary`, `.bg-accent`, `.bg-white`, `.bg-light`, `.bg-gray-100` ... `.bg-black`
- Text: `.text-primary`, `.text-secondary`, `.text-tertiary`, `.text-accent`, `.text-muted`, `.text-white`, `.text-light`, `.text-gray-100` ... `.text-black`
- Border: `.border-color-white`, `.border-color-light`, `.border-color-gray-100` ... `.border-color-black`

## Border Radius

- `.radius-sm`, `.radius-md`, `.radius-lg`, `.radius-xl`, `.radius-2xl`, `.radius-full`

## Shadow Utilities

- `.shadow-sm`, `.shadow-md`, `.shadow-lg`

## Flex & Grid Utilities

- `.flex`, `.inline-flex`, `.flex-row`, `.flex-col`, `.flex-wrap`, `.flex-nowrap`, `.items-start`, `.items-center`, `.items-end`, `.justify-start`, `.justify-center`, `.justify-end`, `.justify-between`, `.justify-around`, `.justify-evenly`, `.self-start`, `.self-center`, `.self-end`, `.flex-grow-0`, `.flex-grow-1`, `.flex-shrink-0`, `.flex-shrink-1`
- `.grid`, `.inline-grid`, `.place-items-center`, `.place-items-start`, `.place-items-end`, `.place-content-center`, `.place-content-start`, `.place-content-end`, `.justify-items-start`, `.justify-items-center`, `.justify-items-end`, `.align-items-start`, `.align-items-center`, `.align-items-end`

## Width & Height Utilities

- Width: `.w-1/12` ... `.w-12/12`, `.w-full`, `.w-auto`
- Height: `.h-1/12` ... `.h-12/12`, `.h-full`, `.h-auto`

## Typography Utilities

- `.text-left`, `.text-center`, `.text-right`, `.text-justify`, `.text-uppercase`, `.text-lowercase`, `.text-capitalize`, `.text-decoration-none`, `.text-decoration-underline`, `.text-decoration-line-through`
- Font weight: `.font-weight-normal`, `.font-weight-bold`, `.font-weight-bolder`, `.font-weight-light`

## Component Classes

- Buttons: `.button`, `.button-primary`, `.button-secondary`, `.button-tertiary`
- Cards: `.card`
- Navbar: `.navbar`

## Accessibility

- Use `.visually-hidden` to hide content visually but keep it accessible to screen readers.

## Responsive Utilities

- Media queries for `md` (≥768px), `lg` (≥1024px), `xl` (≥1280px) are available for responsive design.

## Usage Examples

```html
<!-- Margin and padding -->
<div class="m-md p-lg">Content</div>
<!-- Flex utilities -->
<div class="flex flex-row items-center justify-between">...</div>
<!-- Color utilities -->
<span class="text-primary bg-accent">Text</span>
<!-- Button -->
<button class="button button-primary">Click me</button>
<!-- Card -->
<div class="card radius-lg shadow-md">...</div>
<!-- Responsive width -->
<div class="w-full lg:w-6/12">...</div>
```

---

For more, see `src/css/design.css` and follow these standards for all HTML, CSS, and JS contributions.
