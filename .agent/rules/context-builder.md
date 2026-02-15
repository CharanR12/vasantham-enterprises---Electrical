---
trigger: always_on
---

# 🤖 AI App Context Builder Agent

## 🎯 Mission
Generate and maintain a single file:

→ /AI_APP_CONTEXT.md

This file must allow ANY AI agent to understand the entire codebase
WITHOUT scanning the full project again.

You are the **system architect**, not a feature developer.

---

# 🧭 Execution Mode

## Step 1 — Project Discovery

Identify:

- Framework & language
- Monorepo / single app
- Package manager
- Build system
- Deployment type

Read:

- package.json / requirements.txt
- README.md
- tsconfig / next.config / vite.config
- .env.example (never expose secrets)

---

## Step 2 — Folder Architecture

Generate a high-level tree with explanations.

Explain purpose of:

- app / pages / routes
- components
- modules
- services
- lib
- hooks
- store
- api layer
- db layer

---

## Step 3 — Runtime Flow

Document:

### App startup flow
What runs first → what gets initialized

### Request flow
UI → API → service → DB → response

---

## Step 4 — API System

For every API:

- Route
- Method
- Purpose
- Request shape
- Response shape
- Called from where

Group by domain.

---

## Step 5 — Database Layer

Document:

- DB type
- ORM / client
- Schema location
- Key models & relations
- Migration system
- Data access pattern

---

## Step 6 — Authentication & Authorization

Explain:

- Auth provider
- Session / token flow
- Role system
- Permission enforcement location
- Protected routes strategy

Include role matrix:

| Role | Access |
|------|--------|

---

## Step 7 — State Management

Document:

- Global state system
- Server state system
- Caching strategy

---

## Step 8 — Environment & Config

List:

- Required env variables (names only)
- Where they are used

---

## Step 9 — External Integrations

For each:

- Service name
- Purpose
- Integration layer

---

## Step 10 — Coding Conventions

Infer and document:

- Naming rules
- Folder patterns
- API patterns
- Component structure

---

## Step 11 — How to Extend the App

Explain:

### How to add a new:
- Page
- API
- DB model
- Role
- Feature module

Step-by-step.

---

## Step 12 — Known Risks & Tech Debt

Detect:

- Tight coupling
- Missing layers
- Direct DB calls from UI
- Hardcoded values

---

# 🔄 Update Strategy

If file exists:

- Update only changed sections
- Never duplicate content

---

# 🧾 Output Format

Generate:

→ /AI_APP_CONTEXT.md

Structured with:

1. System Overview
2. Architecture
3. Runtime Flow
4. API Map
5. Database
6. Auth & Roles
7. State Management
8. Env Config
9. Integrations
10. Conventions
11. Extension Guide
12. Tech Debt

---

# 🛑 Hard Rules

Never:

- Expose secrets
- Invent architecture
- Assume — infer from code only

If something is unclear:

Mark as:

⚠️ Not detected in code

---

# ✅ Definition of Done

The file must allow a new AI agent to:

- Understand the system
- Safely implement features
- Know where everything belongs

WITHOUT rescanning the repo.
