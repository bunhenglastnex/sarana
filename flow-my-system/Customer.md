# 👤 Customer Flow & Tracking (Cash-Only Model)

Customer អាចតាមដានស្ថានភាព (Real-time Status Tracking) លើ Website ទៅតាមជម្រើសដែលខ្លួនបានជ្រើសរើស ដោយទូទាត់ជាសាច់ប្រាក់សុទ្ធ៖

---

### ១. ករណីរើសយក "ដឹកជញ្ជូនដល់ផ្ទះ" (Delivery Tracking)

Customer នឹងឃើញ Progress Bar ដូចខាងក្រោម៖

```
Order #1001 (Delivery - Cash on Delivery: $12.00)

[✓] Order Placed          (បានបញ្ជាទិញរួចរាល់)
[✓] Restaurant Accepted   (ហាងបានទទួល Order)
[✓] Food Preparing        (កំពុងធ្វើម្ហូបក្នុងផ្ទះបាយ)
[✓] Food Ready            (ម្ហូបរួចរាល់)
[●] On the Way            (អ្នកដឹកកំពុងធ្វើដំណើរយកមកជូន)
[○] Delivered             (បានប្រគល់ជូនរួចរាល់)
```

**ពេលអ្នកដឹកមកដល់៖**
```
Driver មកដល់មុខផ្ទះ
       │
       ▼
Customer ហុចលុយសុទ្ធ ($12.00) ទៅឱ្យ Driver
       │
       ▼
Driver ហុចម្ហូបជូន និងចុច "Confirm Delivered" លើទូរស័ព្ទរបស់គាត់
       │
       ▼
Website របស់ Customer លោតផ្ទាំង: "Order Completed! Enjoy your meal 🎉"
```

---

### ២. ករណីរើសយក "ទៅយកផ្ទាល់នៅហាង" (Pickup Tracking)

```
Order #1002 (Pickup - Pay at Counter: $10.00)

[✓] Order Placed          (បានបញ្ជាទិញរួចរាល់)
[✓] Restaurant Accepted   (ហាងបានទទួល Order)
[✓] Food Preparing        (កំពុងធ្វើម្ហូប)
[●] Ready for Pickup      (ម្ហូបរួចរាល់ សូមអញ្ជើញមកយកនៅហាង)
[○] Picked Up             (បានទទួលរួចរាល់)
```

**ពេលមកយកនៅហាង៖**
```
Customer មកដល់បញ្ជរបេឡាហាង បង្ហាញលេខ Order #1002
       │
       ▼
Customer បង់លុយសុទ្ធ ($10.00) នៅបញ្ជរបេឡា
       │
       ▼
បុគ្គលិកហាងប្រគល់ម្ហូបជូន & ចុច Complete លើប្រព័ន្ធ
       │
       ▼
Website បង្ហាញថា "Order Completed! 🎉"
```