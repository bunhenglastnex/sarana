# 👤 Customer Flow & Tracking

Customer អាចតាមដានស្ថានភាព (Real-time Status Tracking) លើ Website ទៅតាមជម្រើសដែលខ្លួនបានជ្រើសរើស៖

---

### ១. ករណីរើសយក "ដឹកជញ្ជូនដល់ផ្ទះ" (Delivery Tracking)

Customer នឹងឃើញ Progress Bar ដូចខាងក្រោម៖

```
Order #1001 (Delivery)

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
Customer ទទួលយកម្ហូប (និងបង់លុយ ប្រសិនបង់សាច់ប្រាក់ COD)
       │
       ▼
Driver ចុច "Confirm Delivered" លើទូរស័ព្ទរបស់គាត់
       │
       ▼
Website របស់ Customer លោតផ្ទាំង: "Order Completed! Enjoy your meal 🎉"
```

---

### ២. ករណីរើសយក "ទៅយកផ្ទាល់នៅហាង" (Pickup Tracking)

```
Order #1002 (Pickup)

[✓] Order Placed          (បានបញ្ជាទិញរួចរាល់)
[✓] Restaurant Accepted   (ហាងបានទទួល Order)
[✓] Food Preparing        (កំពុងធ្វើម្ហូប)
[●] Ready for Pickup      (ម្ហូបរួចរាល់ សូមអញ្ជើញមកយកនៅហាង)
[○] Picked Up             (បានទទួលរួចរាល់)
```

**ពេលមកយកនៅហាង៖**
```
Customer មកដល់បញ្ជរហាង បង្ហាញលេខ Order #1002
       │
       ▼
បុគ្គលិកហាងប្រគល់ម្ហូបជូន
       │
       ▼
បុគ្គលិកហាងចុច Complete លើប្រព័ន្ធ
       │
       ▼
Website បង្ហាញថា "Order Completed! 🎉"
```