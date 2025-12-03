Design System Summary so far

1. The Core Metaphor:

Your interface isn't static; it tells a story of intelligence.
* The State: The system starts as "organic energy" (spinning, breathing dots)

2. The Color Palette: "Deep Void & Neon"

* Canvas: Not just black, but Deep Void (#050505).
* Lighting: You don't use flat background colors. You use Ambient Spotlights (gradients with high blur) to create depth behind the hero elements.
* Accents: You use a Semantic Spectrum (Purple, Blue, Orange, Red, Yellow) derived from your logo.
    * Rule: Colors are used for Intent (Action types), not decoration.

3. The Material: "Dark Glass (Obsidian)"

We moved away from "Plastic" (Solid White) to "Glass."
* Surface: bg-white/5 + backdrop-blur-md. It feels dense and expensive.
* Borders: Ultra-thin, almost invisible borders (border-white/10) that catch the light.
* Shadows: Colored Glows (shadow-[0_0_15px_currentColor]) instead of black drop shadows. The elements emit light rather than blocking it.

4. Iconography: "Fine-Line Precision"

* Style: Lucide React with strokeWidth={1.5}.
* Treatment: We removed filled shapes. We use Outlines that glow with specific brand colors when hovered.
* Hierarchy:
    * Primary Tools (Map, Planner): Large, Colored Outline.
    * Secondary Services: Small, Grey Outline.

5. Component Signatures

Component	Visual Key
The Avatar	The Neural Core. A 5-color cluster floating in a Dark Glass Orb.
The Pills	Spectrum Pills. Dark capsules with a thin, colored icon inside a glowing circle.
The Sidebar	Mini-Tickets. Visual rows with thumbnail images, not just text links.
The Profile	?
The Menu	Command Center. A unified list where tools are separated by "Vibe" labels (DISCOVER, SERVICES), using uppercase tracking.
6. Typography Rules

* Headings: Thick, tight tracking (font-black tracking-tight) for "Hi, there!"
* Labels: Small, all-caps, wide tracking (text-[10px] uppercase tracking-widest) for "DISCOVER" or "MY GOLF". This mimics premium print design.

Your Design Mantra

"If it looks like a webpage, it's wrong. It should look like an Operating System for Golf."