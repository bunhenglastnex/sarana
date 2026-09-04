# 💵 Cash Flow & COD Management (ការគ្រប់គ្រងលុយសុទ្ធ និង COD)

នៅក្នុងប្រព័ន្ធ Cash-Only នេះ ការគ្រប់គ្រងលំហូរសាច់ប្រាក់ (Cash Flow) ត្រូវបានបែងចែកជា ២ ផ្នែកច្បាស់លាស់៖

---

### ១. លំហូរលុយ COD របស់អ្នកដឹក (Delivery Staff Cash Handling)

នៅពេលភ្ញៀវជ្រើសរើសបង់លុយសុទ្ធពេលដឹកដល់ (Cash on Delivery):

```
1. ភ្ញៀវប្រគល់លុយសុទ្ធ (ឧ. $12.00) ទៅឱ្យ Delivery Staff
       │
       ▼
2. Delivery Staff ពិនិត្យលុយគ្រប់ចំនួន និងចុច [ Confirm Delivered ] លើប្រព័ន្ធ
       │
       ▼
3. ប្រព័ន្ធនឹងកត់ត្រាចូលក្នុងគណនីរបស់ Driver នោះថា "Cash In Hand: +$12.00"
       │
       ▼
4. [ចុងវេន / End of Shift] Driver យកលុយសុទ្ធសរុបមកទូទាត់ (Settlement) ជាមួយបេឡាហាង
       │
       ▼
5. ហាងផ្ទៀងផ្ទាត់ជាមួយចំនួន Order ដែលបានដឹកជោគជ័យ និងចុច [ Confirm Settlement ]
       │
       ▼
6. បញ្ជី "Cash In Hand" របស់ Driver ត្រឡប់មក $0.00 វិញ
```

---

### ២. ការបង់លុយផ្ទាល់នៅហាង (Pay at Counter for Pickup)

- សម្រាប់ភ្ញៀវដែលមកយកម្ហូបផ្ទាល់ (Pickup)៖
  - ភ្ញៀវបង់ប្រាក់សុទ្ធនៅបញ្ជរបេឡា (Cashier Counter)
  - បេឡាពិនិត្យប្រាក់ និងចុច Confirm Payment / Order Completed រួចទើបប្រគល់ម្ហូបជូន។
  - លុយចូលក្នុងថតបេឡាហាងផ្ទាល់ភ្លាមៗ។

---

### ៣. អត្ថប្រយោជន៍ និងការគ្រប់គ្រង
- **គ្មានបញ្ហា System Error ធនាគារ:** មិនបារម្ភរឿង KHQR scan មិនចូល ឬ Transaction យឺតយ៉ាវ។
- **មានតម្លាភាព (Transparency):** ប្រព័ន្ធដឹងច្បាស់ថា Driver ម្នាក់ៗកំពុងកាន់លុយសុទ្ធរបស់ហាងប៉ុន្មាន តាមរយៈប្រព័ន្ធកត់ត្រា `orders.payment_method = 'cash_on_delivery'` និង `status = 'completed'`។
