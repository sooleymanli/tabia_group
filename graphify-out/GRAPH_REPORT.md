# Graph Report - tabia_group  (2026-10-22)

## Corpus Check
- 140 files · ~65,524 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 2, .example 1, .css 1)

## Summary
- 759 nodes · 2255 edges · 26 communities (25 shown, 1 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 56 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Access, Admin Portal & UI Kit
- Guest App Screens & i18n Hooks
- Food Orders & Hotel Order Board
- Presentation Shell & Slides
- i18n Core, Phone Frame & DB Tests
- Slide Feedback & Comment Pins
- Supabase API Client & Admin Data
- Project Rules & Access Policy
- Guest Home Scenario (Slide 1)
- shadcn Components Config
- Package & Lint Setup
- Dev Dependencies
- Runtime Dependencies
- Feedback Backend Design (README)
- Demo Engine Design (README)
- Demo Player & Autoplay
- npm Scripts
- Sales Sections & Feature Scope
- Guest MVP Modules & Mocks
- Product, Roles & Design Direction
- Prettier Config
- Hotel Operations Flows
- jsconfig Path Aliases
- Deck Structure & Tours
- Vite Build Config
- Decisions & Open Questions

## God Nodes (most connected - your core abstractions)
1. `useT()` - 53 edges
2. `Button()` - 43 edges
3. `react` - 42 edges
4. `Pressable()` - 41 edges
5. `useScenarioDispatch()` - 35 edges
6. `lucide-react` - 31 edges
7. `useScenarioState()` - 30 edges
8. `useLocalized()` - 27 edges
9. `motion` - 24 edges
10. `DeckPresentation()` - 23 edges

## Surprising Connections (you probably didn't know these)
- `Developer Team (vendor)` --references--> `Tabia Group Brand Logo (ornamental emblem + TABIA wordmark + GROUP)`  [INFERRED]
  .github/copilot-instructions.md → public/logo.svg
- `Tabia Favicon (emblem on dark-teal rounded square)` --shares_data_with--> `Theme Color #0f3d3e (brand dark teal)`  [INFERRED]
  public/favicon.svg → index.html
- `index.html SPA Entry (lang=az, title Tabia Guest)` --references--> `Tabia Favicon (emblem on dark-teal rounded square)`  [EXTRACTED]
  index.html → public/favicon.svg
- `index.html SPA Entry (lang=az, title Tabia Guest)` --implements--> `Tabia Guest (product)`  [INFERRED]
  index.html → .github/copilot-instructions.md
- `GuestKitPreview()` --indirect_call--> `createDemoSession()`  [INFERRED]
  src/dev/GuestKitPreview.jsx → src/demo/demoSession.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Server-enforced presentation access security** — readme_pin_access, readme_anonymous_auth_session, readme_pin_hmac_pepper, readme_pin_rate_limit, readme_rls_safe_projection, readme_supabase_backend [EXTRACTED 1.00]
- **Real feedback and analytics system (separate from demo store)** — readme_slide_feedback, readme_feedback_visibility, readme_comment_anchors, readme_comment_replies, readme_slide_tracking, readme_admin_portal [EXTRACTED 1.00]
- **Linked guest/admin demo scenes via shared store and actions** — readme_demo_engine, readme_demo_store, readme_service_orders_store, readme_food_order_demo, readme_hotel_admin_demo [EXTRACTED 1.00]
- **Presentation Access & Data Security Model** — _github_copilot_instructions_pin_access, _github_copilot_instructions_vendor_admin_auth, _github_copilot_instructions_server_side_enforcement, _github_copilot_instructions_feedback_visibility, _github_copilot_instructions_secret_handling [EXTRACTED 1.00]
- **Tabia Brand Identity Assets** — public_logo, public_favicon, public_logo_emblem, index_theme_color [INFERRED 0.85]
- **Demo Simulation vs Real Supabase Data Split** — _github_copilot_instructions_local_demo_simulation, _github_copilot_instructions_supabase_real_data, _github_copilot_instructions_feedback_demo_separation, _github_copilot_instructions_shared_demo_actions [EXTRACTED 1.00]

## Communities (26 total, 1 thin omitted)

### Community 0 - "Access, Admin Portal & UI Kit"
Cohesion: 0.06
Nodes (95): class-variance-authority, cn, input-otp, radix-ui, react, react-dom, react-router, AccessGate() (+87 more)

### Community 1 - "Guest App Screens & i18n Hooks"
Cohesion: 0.09
Nodes (85): lucide-react, motion, useScenarioDispatch(), useScenarioState(), useScenarioStoreApi(), SAMPLE_SCENARIO, SamplePhone(), TABS (+77 more)

### Community 2 - "Food Orders & Hotel Order Board"
Cohesion: 0.07
Nodes (50): zustand, createDemoSession(), createScenarioStore(), getScenario(), SCENARIOS, formatMoney(), hotelAdminSteps, hotelAdminScenario (+42 more)

### Community 3 - "Presentation Shell & Slides"
Cohesion: 0.08
Nodes (51): HotelAdminFrame(), buttonVariants, Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader() (+43 more)

### Community 4 - "i18n Core, Phone Frame & DB Tests"
Cohesion: 0.06
Nodes (22): @electric-sql/pglite, vitest, PhoneFrame(), StatusBar(), useFitScale(), DICTIONARIES, FALLBACK_CHAIN, getLocale() (+14 more)

### Community 5 - "Slide Feedback & Comment Pins"
Cohesion: 0.10
Nodes (36): canRestore(), captureDemoContext(), currentDemoView(), pinMatchesView(), scenario, NO_STORE, useDemoView(), CommentLayer() (+28 more)

### Community 6 - "Supabase API Client & Admin Data"
Cohesion: 0.10
Nodes (36): @supabase/supabase-js, createAccessStore(), check(), anon, failWith(), fakeApi(), serverSession, staff (+28 more)

### Community 7 - "Project Rules & Access Policy"
Cohesion: 0.07
Nodes (24): /admin Real Tabia Vendor Panel, Developer Team (vendor), Feedback Visibility (public vs vendor-only comments), Five Deck Cards (MVP/Demo, Execution Plan & Integration, Extra Proposals, Portfolio, Pricing), frontend-design skill, graphify Query-First Workflow, Guest Phone App Style (README 5.4: dark mode, super-app density, i18n dictionary, motion, local licensed photos), In-Slide Hotel Admin/CRM/Reporting Demo (+16 more)

### Community 8 - "Guest Home Scenario (Slide 1)"
Cohesion: 0.11
Nodes (26): createInitialState(), guestHomeModel, HOME_TABS, reduce(), run(), viewKey(), closeNote(), guestHomeSteps (+18 more)

### Community 9 - "shadcn Components Config"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Package & Lint Setup"
Cohesion: 0.11
Nodes (20): name, private, type, version, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+12 more)

### Community 11 - "Dev Dependencies"
Cohesion: 0.11
Nodes (18): devDependencies, @electric-sql/pglite, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, prettier (+10 more)

### Community 12 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, class-variance-authority, cn, @fontsource-variable/geist, @fontsource-variable/unbounded, input-otp, lucide-react, motion (+8 more)

### Community 13 - "Feedback Backend Design (README)"
Cohesion: 0.22
Nodes (8): /admin Developer Team panel, Admin preview (excluded from stats), Supabase anonymous auth + server PIN validation, Admin comment replies and resolution status, 4-digit PIN presentation access, Slide feedback: reactions, comments, suggestions, questions, Slide view and active-time tracking, Supabase backend (tables, RPCs, migrations)

### Community 14 - "Demo Engine Design (README)"
Cohesion: 0.16
Nodes (11): Comment anchors (Isharele, anchor_context), Copilot work rules and .github/copilot-instructions.md, Execution phases 0-12 (section 17), Family, social groups and child live video, Food order demo (first full demo), Hotel admin panel demo (in-slide), Hotel Services module, Package installation plan (17.1) (+3 more)

### Community 15 - "Demo Player & Autoplay"
Cohesion: 0.24
Nodes (10): createDemoPlayer(), clear(), schedule(), setStatus(), tick(), PLAYER_STATUS, setup(), steps (+2 more)

### Community 16 - "npm Scripts"
Cohesion: 0.17
Nodes (12): scripts, build, db:certs, db:link, db:login, db:push, dev, format (+4 more)

### Community 17 - "Sales Sections & Feature Scope"
Cohesion: 0.22
Nodes (11): Appendix C: previously researched ideas, Additional Offers section (voting), Execution plan and Integration section, Appendix B: handover checklist, Integration dependencies (section 20), Landing page with 5 cards, Appendix A: 95 features (65 MVP / 30 later), Opera PMS integration (future dependency) (+3 more)

### Community 18 - "Guest MVP Modules & Mocks"
Cohesion: 0.25
Nodes (9): Architecture components table (PresentationShell, PhoneFrame, DemoController...), Checkout and payment flow, Loyalty module, Microblink BlinkID (candidate OCR SDK), MockServices (MyGov, OCR, payment, video, PMS), MyGov FIN-based data retrieval (simulated), Passport OCR/MRZ with manual fallback, Onboarding module (+1 more)

### Community 19 - "Product, Roles & Design Direction"
Cohesion: 0.22
Nodes (9): Developer Team (vendor), Global hotel app references (Marriott, Hilton, Four Seasons, Hyatt, Disney), Phone guest app UI/UX (5.4), 15-language i18n with RTL and fallback, Interactive sales presentation, Tabia (client company), Tabia design system tokens (petrol, mint, Unbounded/Geist), Tabia Guest (hotel guest app product) (+1 more)

### Community 20 - "Prettier Config"
Cohesion: 0.33
Nodes (5): plugins, semi, singleQuote, tailwindFunctions, tailwindStylesheet

### Community 21 - "Hotel Operations Flows"
Cohesion: 0.33
Nodes (6): Chatbot and translated live chat, CRM unified guest card, Reporting (MVP reports), Service order flow (12.2), Demo guest Ramila at Shamakhi Palace, room 412, Recommended status model

### Community 22 - "jsconfig Path Aliases"
Cohesion: 0.40
Nodes (4): compilerOptions, baseUrl, paths, include

### Community 23 - "Deck Structure & Tours"
Cohesion: 0.40
Nodes (4): Full tour and short tour, MVP/Demo section, Presentation controls (keyboard, fullscreen, tour), Proposed 18-slide deck with intro pages

### Community 24 - "Vite Build Config"
Cohesion: 0.40
Nodes (3): @tailwindcss/vite, vite, @vitejs/plugin-react

## Knowledge Gaps
- **32 isolated node(s):** `@fontsource-variable/geist`, `@fontsource-variable/unbounded`, `tw-animate-css`, `@types/react`, `@types/react-dom` (+27 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 186 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Access, Admin Portal & UI Kit` to `Guest App Screens & i18n Hooks`, `Food Orders & Hotel Order Board`, `Presentation Shell & Slides`, `i18n Core, Phone Frame & DB Tests`, `Slide Feedback & Comment Pins`, `Supabase API Client & Admin Data`, `Package & Lint Setup`, `Demo Player & Autoplay`?**
  _High betweenness centrality (0.111) - this node is a cross-community bridge._
- **What connects `@fontsource-variable/geist`, `@fontsource-variable/unbounded`, `tw-animate-css` to the rest of the system?**
  _32 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Access, Admin Portal & UI Kit` be split into smaller, more focused modules?**
  _Cohesion score 0.05547960811118706 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Guest App Screens & i18n Hooks` to `Access, Admin Portal & UI Kit`, `Food Orders & Hotel Order Board`, `Presentation Shell & Slides`, `i18n Core, Phone Frame & DB Tests`, `Guest Home Scenario (Slide 1)`, `Package & Lint Setup`, `Demo Player & Autoplay`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Should `Guest App Screens & i18n Hooks` be split into smaller, more focused modules?**
  _Cohesion score 0.0860159224645206 - nodes in this community are weakly interconnected._
- **Why does `vitest` connect `i18n Core, Phone Frame & DB Tests` to `Access, Admin Portal & UI Kit`, `Guest App Screens & i18n Hooks`, `Food Orders & Hotel Order Board`, `Slide Feedback & Comment Pins`, `Supabase API Client & Admin Data`, `Guest Home Scenario (Slide 1)`, `Package & Lint Setup`, `Demo Player & Autoplay`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Should `Food Orders & Hotel Order Board` be split into smaller, more focused modules?**
  _Cohesion score 0.06993006993006994 - nodes in this community are weakly interconnected._