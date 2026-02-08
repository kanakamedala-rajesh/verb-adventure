# 🤖 Coding Agent Guidelines: Verb Adventure

Welcome to **Verb Adventure**! This document provides the essential context, standards, and workflows to ensure you can contribute effectively and idiomatically to this project.

## 🎯 Project Overview

- **Purpose**: An interactive educational game for mastering English irregular verbs.
- **Core Loop**: Practice -> Study -> Progress (Ranks/Stats).
- **Key Features**: Multi-mode quizzes (Quick Play, Challenges), Flashcards, AI-powered "Magic Hints" (via Gemini), Audio support, and PWA capabilities.

## 🛠️ Tech Stack

- **Framework**: Next.js 16+ (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS 4.0+, `clsx`, `tailwind-merge`
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI**: Google Gemini API (Server Actions)
- **Quality Tools**: ESLint, Prettier, Husky, Commitlint

## 📂 Project Structure

- `src/app/`: Next.js pages and layouts.
- `src/components/game/`: Core game UI components (Quiz, Study, Result screens, Modals).
- `src/hooks/`: Custom React hooks (`use-audio`, `use-stats`, `use-user`).
- `src/lib/`: Business logic and utilities:
  - `verbs.ts`: The source of truth for irregular verb data.
  - `gemini.ts`: AI hint generation logic.
  - `logger.ts`: Centralized logging.
- `src/types/`: Global TypeScript definitions.
- `public/`: Static assets (SVG logos, manifest).

## 📏 Coding Standards & Conventions

1. **React Components**:
   - Use functional components with hooks.
   - Keep UI logic and business logic separate (utilize `src/lib` or `src/hooks`).
   - Use `framer-motion` for all transitions and feedback animations (e.g., `whileHover`, `whileTap`, `AnimatePresence`).
2. **Styling**:
   - Strictly use Tailwind CSS classes.
   - Standard class strings are preferred (template literals if dynamic).
3. **Icons & Assets**:
   - Use `lucide-react` for all iconography.
   - SVG assets in `public/` should be handled via standard `img` tags or SVG components.
4. **Data Handling**:
   - Irregular verb data resides in `src/lib/verbs.ts`. Do not hardcode verb lists in components.
5. **AI/Gemini**:
   - AI features must be implemented as Server Actions or in `src/lib/gemini.ts` to protect API keys.
6. **Types**:
   - Avoid `any`. Define interfaces/types in `src/types/` or locally if specific to a component.

## 🔄 Workflow & Git

- **Commits**: Follow [Conventional Commits](https://www.conventionalcommits.org/).
  - Use `npm run commit` (git-cz) to ensure compliance.

  - Format: `<type>(<scope>): <subject>` (e.g., `feat(quiz): add true/false question type`).

- **Validation**: Before finishing a task, ensure the following pass:
  - `npm run lint`

  - `npm run type-check`

  - `npm run build`

- **Local Hooks**: This project uses `gemini-cli` local hooks (configured in `.gemini/settings.json`):
  - `BeforeAgent`: Runs `check-deps.sh` to ensure `node_modules` are installed.

  - `AfterAgent`: Runs `validate.sh` (full `npm run commit:validate`).

  - Agents should monitor the shell output for validation failures.

## 🚀 Common Commands

- `npm run dev`: Start development server.
- `npm run build`: Production build.
- `npm run lint`: Run ESLint.
- `npm run format`: Format code with Prettier.
- `npm run type-check`: Run TypeScript compiler check.

## 🧠 Key Agent Mandates

- **Context First**: Always check `src/lib/verbs.ts` and `src/hooks/` before implementing new verb-related logic or state management.
- **Visuals Matter**: As a game, UI feedback (animations, sound) is critical. Mimic existing patterns in `src/components/game/`.
- **Accessibility**: Maintain PWA standards and responsive design.
