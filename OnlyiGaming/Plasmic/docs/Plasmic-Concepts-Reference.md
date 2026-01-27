# Plasmic Concepts Reference

**Purpose**: Quick reference for Plasmic design system concepts
**Source**: Summarized from Plasmic documentation (docs.plasmic.app)
**Created**: 2026-01-25

---

## Style Tokens

**Documentation**: https://docs.plasmic.app/learn/tokens/

### What They Are
Style tokens are reusable design values that maintain consistency across your design system. They are the atomic building blocks of your design — individual values for colors, spacing, typography, etc.

### Key Features

| Feature | Description |
|---------|-------------|
| **CSS Variables** | Tokens are defined as CSS variables using naming convention `--plasmic-token-[name]` |
| **Hierarchical Organization** | Organize tokens by type (e.g., `--plasmic-token-sand-1` through `--plasmic-token-sand-12`) |
| **Theme Support** | Create both light and dark theme variations |
| **Token References** | Tokens can reference other tokens |
| **Responsive Tokens** | Viewport-aware token adjustments |

### Token Types Supported in Plasmic
- Colors
- Font sizes
- Line height
- Opacity
- Spacing (paddings, margins, dimensions)
- Font family

### Best Practices
1. Organize tokens by type with semantic naming conventions
2. Provide both light and dark theme variations
3. Use consistent numbering systems (1-12 scale recommended)
4. Create token families for related values (comprehensive color palettes)

---

## Style Presets

**Documentation**: https://docs.plasmic.app/learn/style-presets/

### What They Are
Style presets are **collections of properties** that work together — pre-defined design configurations that encapsulate multiple styling properties into cohesive design patterns.

### Tokens vs Presets

| Tokens | Presets |
|--------|---------|
| Individual values (colors, spacing, sizes) | Collections of properties bundled together |
| Atomic building blocks | Combinations of tokens into unified styles |
| Example: `color-primary: #3B82F6` | Example: "heading-style" combining font, size, weight, color |

### Best Practices
1. **Semantic naming**: Use purpose-driven names (e.g., "body-paragraph" not "text-1")
2. **Granular organization**: Create presets for distinct design roles (typography levels, shadow depths, layout patterns)
3. **Documentation**: Clearly communicate what each preset includes and when to use it
4. **Consistency**: Leverage presets to enforce unified branding across all projects

---

## Variants

**Documentation**: https://docs.plasmic.app/learn/variants/

### What They Are
Variants allow you to create different versions of a component with different styles, content, or behavior. They enable conditional rendering and state-based design.

### Types of Variants
- **State variants**: Hover, active, focus, disabled states
- **Content variants**: Different content configurations
- **Interactive variants**: User-triggered state changes

### Use Cases
- Button states (default, hover, pressed, disabled)
- Card layouts (compact, expanded)
- Form field states (empty, filled, error, success)

---

## Global Variants

**Documentation**: https://docs.plasmic.app/learn/global-variants/

### What They Are
Global variants are design system controls that apply **across your entire project**, providing centralized control over design patterns and behaviors.

### Global vs Component Variants

| Component Variants | Global Variants |
|-------------------|-----------------|
| Scoped to specific components | Apply across entire project |
| Control individual element behavior | Affect all components simultaneously |
| Defined per-component | Defined at project level |

### Primary Use Case: Theming
Global variants enable you to switch between:
- Light and dark modes
- Brand color schemes
- Seasonal themes
- Accessibility modes (high contrast)

### Implementation
Global variants are configured through Plasmic's design system settings, allowing variant options to propagate throughout projects without redundant per-component configuration.

---

## Element Variants

**Documentation**: https://docs.plasmic.app/learn/element-variants/

*Note: Detailed documentation requires manual review at the link above.*

### Overview
Element variants provide styling variations for individual elements within components, allowing fine-grained control over element appearance based on context or state.

---

## Responsive Design

**Documentation**: https://docs.plasmic.app/learn/responsive-design/

### Screen Variants & Breakpoints
Plasmic enables responsive layouts through **screen variants** that create different versions of components for various device sizes.

### Creating Responsive Layouts
1. **Define variants for different breakpoints** — specify how components appear at various screen sizes
2. **Adjust styling properties** — dimensions, spacing, typography per breakpoint
3. **Control visibility** — show/hide elements conditionally based on screen size
4. **Use flexible layouts** — flexbox and grid for content reflow

### Responsive Tokens
- Maintain consistent styling rules across breakpoints
- Update multiple components simultaneously through token changes
- Apply spacing, sizing, and color tokens responsively
- Create maintainable design systems with centralized token management

### Best Practices
1. Plan breakpoints around actual user devices and content needs
2. Test layouts across all defined breakpoints
3. Use relative sizing and flexible spacing rather than fixed dimensions
4. Prioritize mobile-first approaches when appropriate
5. Leverage variants to avoid code duplication

---

## Components

**Documentation**: https://docs.plasmic.app/learn/components/

*Note: Detailed documentation requires manual review at the link above.*

### Overview
Components are reusable UI building blocks that can be composed together to create complex interfaces. They support:

- **Slots**: Designated areas where content can be inserted
- **Props**: Configurable properties passed to components
- **Variants**: Different visual/behavioral states
- **Composition**: Nesting components within components

---

## Quick Reference Links

| Concept | Documentation Link |
|---------|-------------------|
| Style Tokens | https://docs.plasmic.app/learn/tokens/ |
| Style Presets | https://docs.plasmic.app/learn/style-presets/ |
| Variants | https://docs.plasmic.app/learn/variants/ |
| Global Variants | https://docs.plasmic.app/learn/global-variants/ |
| Element Variants | https://docs.plasmic.app/learn/element-variants/ |
| Responsive Design | https://docs.plasmic.app/learn/responsive-design/ |
| Components | https://docs.plasmic.app/learn/components/ |

---

## Applying to OnlyiGaming Design System

### Recommended Token Structure (from Figma)

| Token Category | Examples |
|----------------|----------|
| **Colors** | Brand primary, secondary, accent; Semantic (success, warning, error); Neutrals (grays) |
| **Font Sizes** | xs, sm, base, lg, xl, 2xl, 3xl (typography scale) |
| **Line Heights** | tight, normal, relaxed |
| **Opacity** | 0, 25, 50, 75, 100 |
| **Spacing** | 0, 1, 2, 4, 6, 8, 12, 16, 24, 32, 48, 64 |
| **Font Families** | Sans, serif, mono |

### Recommended Presets

| Preset Category | Examples |
|-----------------|----------|
| **Typography** | heading-1, heading-2, heading-3, body, caption, label |
| **Buttons** | btn-primary, btn-secondary, btn-ghost, btn-link |
| **Cards** | card-default, card-elevated, card-bordered |
| **Inputs** | input-default, input-error, input-disabled |

---

*Document maintained by: Development Team*
*Last Updated: 2026-01-25*
