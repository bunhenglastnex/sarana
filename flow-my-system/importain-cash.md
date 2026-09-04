# 💵 Cash Flow & COD Management (ការគ្រប់គ្រងលុយសុទ្ធ)

ការគ្រប់គ្រងលុយសុទ្ធ (Cash Management) មានសារៈសំខាន់ខ្លាំង ជាពិសេសនៅពេលមានសេវា **Cash on Delivery (COD)** និងការបង់ប្រាក់ផ្ទាល់នៅហាង។

---

### ១. លំហូរលុយ COD របស់អ្នកដឹក (Delivery Staff Cash Handling)

នៅពេលភ្ញៀវជ្រើសរើសបង់លុយសុទ្ធពេលដឹកដល់ (Cash on Delivery):

```
1. ភ្ញៀវប្រគល់លុយសុទ្ធ ($12) ទៅឱ្យ Delivery Staff
       │
       ▼
2. Delivery Staff ពិនិត្យលុយគ្រប់ចំនួន និងចុច [ Confirm Delivered ]
       │
       ▼
3. ប្រព័ន្ធនឹងកត់ត្រាចូលក្នុងគណនីរបស់ Driver នោះថា "Cash In Hand: +$12.00"
       │
       ▼
4. [ចុងវេន / End of Shift] Driver យកលុយសុទ្ធសរុបមកទូទាត់ (Settlement) ជាមួយគិតលុយហាង
       │
       ▼
5. ហាងចុច [ Confirm Received Cash from Driver ] ➔ "Cash In Hand" របស់ Driver ក្លាយជា $0.00
```

---

### ២. ការបង់លុយផ្ទាល់នៅហាង (Pay at Counter for Pickup)

- សម្រាប់ភ្ញៀវដែលមកយកម្ហូបផ្ទាល់ (Pickup) ហើយជ្រើសរើសបង់នៅហាង៖
  - ភ្ញៀវបង់ប្រាក់នៅបញ្ជរ Cashier
  - Cashier ចុច Confirm Payment រួចទើបប្រគល់ម្ហូបជូន។

---

### ៣. ការបង់តាម Online (KHQR / Bakong)

- លុយនឹងរត់ចូលគណនីធនាគាររបស់ហាងផ្ទាល់ភ្លាមៗ (Direct to Restaurant Bank Account)។
- គ្មានហានិភ័យបាត់បង់លុយ ឬត្រូវការ Settlement ចុងថ្ងៃជាមួយ Driver នោះទេ។
