# 🤖 AI Agent Task Division & Workflow Guide

ឯកសារនេះកំណត់ពីការបែងចែកភារកិច្ច (Task Breakdown) សម្រាប់ **AI Agent** នៅពេលដែលលោកអ្នកប្រគល់ការងារអភិវឌ្ឍន៍ប្រព័ន្ធ (ដោយផ្តោតលើ Real-Time Order System) តាមជំនាញនីមួយៗ៖

---

## 🔘 Quick Mode Selection (ជ្រើសរើស Agent Role)

> សូមចុច Tick Box ខាងក្រោម ដើម្បីជ្រើសរើស Role ដែលត្រូវឱ្យ Agent ធ្វើការ៖

- [ ] **[SELECT] 🎨 Frontend-Only Agent** *(ធ្វើតែ Frontend `frontend/` - Next.js, UI, Zustand, Realtime Client)*
- [ ] **[SELECT] ⚙️ Backend-Only Agent** *(ធ្វើតែ Backend `backend/` - Pure PHP, REST APIs, Event Broadcaster)*
- [ ] **[SELECT] ⚡ Fullstack Agent** *(ធ្វើទាំងពីរ `frontend/` + `backend/` - End-to-End Realtime Setup)*

---

## 🎨 1. Frontend-Only Agent (Next.js 14 + React + Zustand)

**កាលណាប្រគល់ងារឱ្យ Agent ทำតែ Frontend ៖** Agent នឹងធ្វើការតែលើ Folder `frontend/` ប៉ុណ្ណោះ ដោយផ្អែកលើ API Contracts ដែល Backend មានស្រាប់ ឬ Mock Data។

### 📋 ភារកិច្ចចម្បង (Select / Check Tasks):
- [ ] **Real-Time Client Setup:** ដំឡើង និងរៀបចំ Client Library សម្រាប់ Real-Time (ឧទាហរណ៍៖ `pusher-js`, Native `EventSource` សម្រាប់ SSE, ឬ SWR Hook សម្រាប់ Smart Polling) ក្នុង `frontend/lib/realtime.ts`។
- [ ] **Live UI Updates & Component State:** ភ្ជាប់ Listener ទៅកាន់ **Zustand Store** (`frontend/store/`) ដើម្បី Update ស្ថានភាព Order ដោយស្វ័យប្រវត្តិ ពេលមាន Real-Time Event ចូលមក។
- [ ] **Order Tracker Bar Component:** បង្កើត ឬ Update **Progress Bar** ( Customer Tracking Page) ឱ្យរអិល Animation តាម Status (`pending` ➔ `accepted` ➔ `preparing` ➔ `ready` ➔ `completed`)។
- [ ] **Kitchen / Admin Notification UI:** បន្ថែម **Sound Chime Alert** និង **Popup Banner** នៅពេលមាន Order ថ្មីធ្លាក់មកក្នុង Kitchen Dashboard។
- [ ] **Delivery Staff Dashboard UI:** បង្កើត Real-Time Order List សម្រាប់ Driver ចុច «Pickup from Kitchen» ឬ «Confirm Delivered» ដោយមិនបាច់ Refresh ទំព័រ។

### 📁 Files សម្រាប់ Frontend Agent:
- [ ] `frontend/lib/` (WebSocket/Pusher Client Wrappers)
- [ ] `frontend/store/` (Zustand Global State Management)
- [ ] `frontend/components/` (Progress Bars, Status Badges, Audio Alerts, Dialogs)
- [ ] `frontend/app/` (Pages: Customer Tracking, Kitchen Dashboard, Driver App)

---

## ⚙️ 2. Backend-Only Agent (Pure PHP + PDO + MySQL)

**កាលណាប្រគល់ងារឱ្យ Agent ทำតែ Backend ៖** Agent នឹងធ្វើការតែលើ Folder `backend/` ប៉ុណ្ណោះ ដោយផ្តល់នូវ REST APIs & Real-Time Event Triggers។

### 📋 ភារកិច្ចចម្បង (Select / Check Tasks):
- [ ] **Broadcaster Service / Event Triggers:** បង្កើត Helper Service (`backend/lib/Broadcaster.php`) សម្រាប់បាញ់ Real-Time Event (ឧទាហរណ៍៖ ប្រើ Pusher PHP SDK ឬបង្កើត Server-Sent Events Endpoint `/api/sse-orders.php`)។
- [ ] **Integrate Trigger: New Order:** នៅពេល Customer បង្កើត Order ថ្មី (`POST /api/orders.php`) ➔ បាញ់ Event `new-order` ទៅ Kitchen Channel។
- [ ] **Integrate Trigger: Status Change:** នៅពេលហាងផ្លាស់ប្តូរ Status (`PATCH /api/order-status.php`) ➔ បាញ់ Event `order-updated` ទៅ Customer Channel។
- [ ] **Integrate Trigger: Driver Dispatch:** នៅពេលម្ហូបរួចរាល់ (`POST /api/delivery.php`) ➔ បាញ់ Event `delivery-dispatch` ទៅ Delivery Staff Channel។
- [ ] **API Contracts & Real-Time Payload Schema:** កំណត់ JSON Response Format ឱ្យច្បាស់លាស់ (Status code, Order ID, Timestamp, Delivery Status) និងដោះស្រាយ CORS Headers។

### 📁 Files សម្រាប់ Backend Agent:
- [ ] `backend/lib/` (Pusher/Broadcaster Helper, Notification Logics)
- [ ] `backend/api/orders.php` (Create Order & Trigger New Order Event)
- [ ] `backend/api/order-status.php` (Update Status & Trigger Status Change Event)
- [ ] `backend/api/delivery.php` (Driver Actions & Trigger Dispatch Event)
- [ ] `backend/database/` (Database schema / tables update for tracking)

---

## ⚡ 3. Fullstack Agent (End-to-End Real-Time System)

**កាលណាប្រគល់ងារឱ្យ Agent ทำទាំង Frontend & Backend ៖** Agent នឹងធ្វើការលើទូទាំង Project ទាំងមូល (`frontend/` + `backend/`) ដើម្បីបង្កើត Feature ពេញលេញពីដើមដល់ចប់។

### 📋 ភារកិច្ចចម្បង (Select / Check Tasks):
- [ ] **1. Design Payload Contracts:** កំណត់ទម្រង់ Data ផ្លាស់ប្តូររវាង PHP Broadcast និង Next.js Event Listener។
- [ ] **2. Backend Implementation:** បន្ថែម Event Broadcaster ក្នុង PHP REST APIs (`orders.php`, `order-status.php`, `delivery.php`)។
- [ ] **3. Frontend Implementation:** បង្កើត Real-Time Listener ក្នុង Next.js + Zustand Store + React UI Components។
- [ ] **4. End-to-End Flow Verification:** ធ្វើការតេស្តសាកល្បងលំហូរទាំងមូល (Customer Place Order ➔ Kitchen Sound Alert ➔ Status Update ➔ Live Progress Bar ➔ Driver Dispatch)។
- [ ] **5. Fallback & Error Handling:** រៀបចំ Fallback (បើសិនជា WebSocket ដាច់ ឱ្យប្រព័ន្ធលោតទៅប្រើ Smart Polling ដោយស្វ័យប្រវត្តិ)។

---

## 🎯 របៀបផ្តល់ Prompt ទៅកាន់ AI Agent (Prompt Select Table)

| Select Role | Role | ឧទាហរណ៍ Prompt (Click & Copy Prompt) |
| :---: | :--- | :--- |
| <input type="checkbox" id="fe_agent" /> | **Frontend Only** | `Focus ONLY on frontend/. Implement a real-time order tracking component using Zustand and Pusher-js (or mock events). Show live progress bar updates when order status changes.` |
| <input type="checkbox" id="be_agent" /> | **Backend Only** | `Focus ONLY on backend/. Update POST /api/orders.php and PATCH /api/order-status.php to broadcast real-time events using Pusher PHP SDK or SSE.` |
| <input type="checkbox" id="fs_agent" /> | **Fullstack** | `Implement the full end-to-end real-time ordering system. Connect backend/api/orders.php triggers to the Next.js frontend kitchen dashboard so new orders pop up with sound instantly.` |
