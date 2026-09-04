# 🍔 Sarana - Single Restaurant Online Ordering System (Cash Only)

ប្រព័ន្ធគ្រប់គ្រងការកុម្ម៉ង់អាហារសម្រាប់ហាងមួយ (Single Restaurant) ដែលគាំទ្រការដឹកជញ្ជូនដល់ផ្ទះ (Delivery) និងទៅយកផ្ទាល់នៅហាង (Pickup) ដោយទូទាត់ប្រាក់ជាសាច់ប្រាក់សុទ្ធ (Cash Only)។

---

## 📁 រចនាសម្ព័ន្ធគម្រោង (Project Structure)

```
sarana/
  ├── flow-my-system/        # ឯកសារវិភាគ និងគំនូសប្លង់ Flow នៃប្រព័ន្ធទាំងមូល
  │     ├── Actors.md        # តួអង្គ៖ ហាង, ភ្ញៀវ, អ្នកដឹក
  │     ├── Order.md         # លំហូរកុម្ម៉ង់ និងរបៀបគិតលុយ (Delivery vs Pickup)
  │     ├── Restaurant.md    # វដ្តរៀបចំម្ហូបរបស់ហាង
  │     ├── Delivery.md      # ដំណើរការដឹក និងបញ្ជាក់ការដឹកដល់
  │     ├── Customer.md      # ការតាមដានស្ថានភាព (Live Tracking)
  │     ├── Money.md         # លំហូរចំណូល ១០០% ចូលហាង
  │     └── importain-cash.md# របៀបគ្រប់គ្រងលុយសុទ្ធ COD និងការទូទាត់ចុងវេន
  │
  ├── backend/               # PHP REST API (រត់តាមរយៈ: php -S localhost:8000)
  │     ├── database/
  │     │     └── setup.php  # File បង្កើត Tables & Seed Dummy Data ក្នុង MySQL
  │     ├── config/          # DB & CORS configuration
  │     └── api/             # Endpoints: foods.php, orders.php, delivery.php, order-status.php
  │
  └── frontend/              # Next.js 14 + React Frontend (រត់តាមរយៈ: npm run dev)
        ├── app/page.jsx     # ទំព័រ Customer កុម្ម៉ង់ម្ហូប & Checkout
        ├── app/admin/       # ផ្ទាំង Restaurant Kitchen គ្រប់គ្រង Order
        ├── app/delivery/    # ផ្ទាំង Delivery Staff (Confirm Delivered & ប្រមូលលុយ)
        └── app/track/       # ផ្ទាំងតាមដាន Status Order Real-time
```

---

## 🚀 របៀបដំណើរការ (Getting Started on a Dev Machine)

### ១. Backend (PHP + MySQL)
1. បើក XAMPP Start តែ **MySQL** មួយគត់ (Port 3306)។
2. បើក Terminal ចូល folder `backend/`:
   ```bash
   cd backend
   # បង្កើត Table និងចាក់ទិន្នន័យគំរូ (ធ្វើតែម្ដងគត់)
   php database/setup.php

   # ចាប់ផ្ដើម PHP Server
   php -S localhost:8000
   ```

### ២. Frontend (Next.js)
បើក Terminal មួយទៀត ចូល folder `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
ចូលមើល Website តាមរយៈ Browser: **`http://localhost:3000`** 🎉
