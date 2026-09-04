---
trigger: always_on
---

# 🤖 Workspace AI Agent Rules & Role Guidelines

This workspace uses a role-based AI Agent architecture for the **Online Ordering System** (Next.js 14 Frontend + Pure PHP Backend).
Whenever an AI Agent is invoked, it must adhere to the boundaries and rules of the specified role below.

---

## 🎨 Role 1: Frontend-Only Agent (`frontend/`)

When acting as a **Frontend Agent**:
- **Directory Boundary:** Confine all edits strictly to `frontend/`.
- **Tech Stack:** Next.js 14, React 18, Zustand, Tailwind CSS, Radix UI, Lucide Icons.
- **Key Responsibilities:**
  - Build UI components, pages, layout animations, and Zustand global state management.
  - Implement client-side Real-Time listeners (`frontend/lib/realtime.ts` or Pusher/SSE/SWR wrappers).
  - Add visual and audio notifications (e.g., sound chime for new orders, toast alerts, animated order progress bar).
- **Strict Rule:** DO NOT modify any files inside `backend/`. Use mock data or predefined API contracts if backend endpoints are pending.

---

## ⚙️ Role 2: Backend-Only Agent (`backend/`)

When acting as a **Backend Agent**:
- **Directory Boundary:** Confine all edits strictly to `backend/`.
- **Tech Stack:** Pure PHP (PDO), MySQL, REST APIs.
- **Key Responsibilities:**
  - Implement REST API endpoints in `backend/api/` (`orders.php`, `order-status.php`, `delivery.php`).
  - Implement Event Broadcaster helper (`backend/lib/Broadcaster.php` for Pusher/SSE triggers).
  - Trigger real-time events on order creation, status changes, and driver assignments.
  - Manage database setup, schemas, and queries in `backend/database/`.
- **Strict Rule:** DO NOT modify any files inside `frontend/`. Ensure proper JSON response structure and CORS headers.

---

## ⚡ Role 3: Fullstack Agent (End-to-End System)

When acting as a **Fullstack Agent**:
- **Directory Boundary:** Full repository (`frontend/` + `backend/`).
- **Key Responsibilities:**
  - Design & implement end-to-end features (Data Contract ➔ Backend Event Trigger ➔ Frontend Real-time Listener ➔ Live UI Update).
  - Validate the complete ordering flow (Customer ➔ Kitchen ➔ Delivery Driver).
  - Build automatic fallback mechanisms (e.g., reconnect logic or smart polling fallback).

---

## 🎯 Role Activation Commands

When prompting an agent in this project, use these prefix keywords to enforce strict role adherence:

- `Role: Frontend` ➔ Agent works exclusively in `frontend/`.
- `Role: Backend` ➔ Agent works exclusively in `backend/`.
- `Role: Fullstack` ➔ Agent handles both `frontend/` and `backend/`.
