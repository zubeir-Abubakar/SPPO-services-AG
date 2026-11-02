# PPO Services AG — design system

Shared design rules for the Next.js site. Content and photography remain grounded in PPO's official pages; this file records the visual system rather than replacing the source of truth.

## Direction
- Genre: modern-minimal with produce-editorial photography.
- Macrostructure: Ecosystem Index for discovery pages; long-form section pages share the same shell and tokens.
- Primary action: qualified customer, supplier, and partnership enquiries.
- Tone: fresh, exact, international, Swiss-rooted.

## Palette
- Warm glasshouse paper: `oklch(97% 0.012 104)`.
- Fresh leaf green: PPO logo green `#94c11a`.
- Citrus yellow: PPO logo yellow `#fbb900`.
- PPO lime: PPO logo lime `#c7d300`.
- PPO orange: PPO logo orange `#ec6500`.
- PPO vermilion: PPO logo red `#e53009`.
- PPO berry: PPO logo berry `#a51d49`.
- Supporting violet: use sparingly as a secondary UI accent, not as a claimed PPO logo colour.
- Glass surfaces use translucent warm white, fine borders, and restrained blur; body content stays on readable opaque surfaces.

## Typography
- Display: DM Serif Display, upright, for short editorial headlines.
- Body and interface: Ubuntu, preserving the original site's typographic character.
- No more than these two font families.

## Spacing and shape
- 4-point spacing scale, named CSS custom properties.
- Wide editorial gutters, asymmetric photo-led layouts, and consistent image aspect ratios.
- Glass effect reserved for navigation, search, language menus, and the contact form; not used behind long text.

## Interaction
- Keyboard-operable navigation, search and forms; visible focus rings.
- Forms provide field-level errors and explicit loading/failure states.
- Contact submission confirms only when SMTP delivery is configured and succeeds.
- Respect reduced motion and provide touch-friendly mobile targets.

## Content and assets
- PPO's existing logo, images, product facts, people, legal links, language paths and contact facts are authoritative.
- Product imagery must remain paired with its source product; no generic or substituted photography.
- Unverified metrics and certificates are not introduced.
