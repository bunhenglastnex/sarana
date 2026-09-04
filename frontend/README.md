# 🍔 Restaurant Frontend (Next.js 14 + React)

ផ្ទាំង User Interface ទំនើបសម្រាប់ **Customer (កុម្ម៉ង់ម្ហូប)**, **Restaurant (ផ្ទះបាយ)**, និង **Delivery Staff (អ្នកដឹកជញ្ជូន)** គាំទ្រការបង់លុយសុទ្ធ (Cash Only) និងជម្រើស Delivery / Pickup។

---

### 🚀 របៀបដំណើរការ (How to Run)

នៅលើកុំព្យូទ័រណាដែលមាន **Node.js**:

```bash
# ១. ចូលទៅកាន់ folder frontend
cd frontend

# ២. ដំឡើង Dependencies
npm install

# ៣. ចាប់ផ្ដើម Development Server
npm run dev
```

បើក Browser ចូលទៅកាន់: **`http://localhost:3000`** 🎉

---

### 📱 ទំព័រនីមួយៗ (App Pages)

1. **`http://localhost:3000/` (Customer Menu & Cart)**:
   - ចូលមើល Menu អាហារ
   - ជ្រើសរើស **🚚 ដឹកដល់ផ្ទះ (Delivery)** ឬ **🛍️ ទៅយកផ្ទាល់ (Pickup)**
   - Checkout ជាមួយ Cash Only (បង់លុយសុទ្ធពេលដឹកដល់ ឬ បង់នៅបញ្ជរ)

2. **`http://localhost:3000/admin` (Kitchen / Restaurant Dashboard)**:
   - ផ្ទាំងទទួល Order របស់ហាង
   - ប៊ូតុង Accept ➔ Preparing ➔ Ready for Pickup / Ready for Delivery

3. **`http://localhost:3000/delivery` (Delivery Staff Portal)**:
   - បុគ្គលិកដឹកឆែកមើលតែ Order ណាដែលត្រូវដឹក
   - ប៊ូតុង Pickup ពីផ្ទះបាយ ➔ ចេញដឹក
   - **ប៊ូតុង Confirm Delivered & Cash Collected** (ប្រមូលលុយសុទ្ធពីភ្ញៀវ និងប្រាប់ System ថាដឹកដល់)
   - មើលរបាយការណ៍ Cash in Hand

4. **`http://localhost:3000/track` (Live Order Tracking)**:
   - ភ្ញៀវវាយលេខ Order ដើម្បីមើល Progress Bar ស្ថានភាពម្ហូប Real-time
