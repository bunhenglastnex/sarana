# 🎭 Actors & Roles (Single Restaurant System)

ប្រព័ន្ធសម្រាប់ហាងតែមួយ (Single Restaurant) ដែលមានជម្រើសកុម្ម៉ង់ដឹកដល់ផ្ទះ (Delivery) និងទៅយកផ្ទាល់ (Pickup)៖

```
🏪 RESTAURANT / ADMIN (ម្ចាស់ហាង / បុគ្គលិក)
    │
    ├── គ្រប់គ្រងមុខម្ហូប និងតម្លៃលើ Website (Menu & Pricing)
    ├── ទទួលការកុម្ម៉ង់ (Accept / Reject Order)
    ├── រៀបចំធ្វើម្ហូប (Food Preparation)
    ├── ដោះស្រាយការមកយកផ្ទាល់ (Handover for Pickup Orders)
    └── រៀបចំម្ហូបរួចរាល់សម្រាប់អ្នកដឹក (Ready for Delivery Staff)

👤 CUSTOMER (អតិថិជន)
    │
    ├── ចូលមើល Website និងរើសមុខម្ហូប (Browse Menu & Add to Cart)
    ├── ជ្រើសរើសជម្រើសទទួល (Choose Delivery ឬ Pickup)
    ├── ទូទាត់ប្រាក់ (Pay via KHQR ឬ Cash on Delivery / Pay at Store)
    ├── តាមដានស្ថានភាពម្ហូប (Track Order Status)
    └── ទទួលម្ហូប (Receive Food)

🚚 DELIVERY STAFF (អ្នកដឹកជញ្ជូនផ្ទៃក្នុងរបស់ហាង)
    │
    ├── ឆែកមើលតែ Order ណាដែលភ្ញៀវរើស Delivery (Check Delivery Orders)
    ├── ទទួលយកម្ហូបពីរោងបាយ (Pickup Food from Kitchen)
    ├── ដឹកជញ្ជូនទៅដល់ទីតាំងអតិថិជន (Deliver to Customer)
    ├── ប្រមូលលុយ (ករណីភ្ញៀវបង់លុយសុទ្ធ COD)
    └── Update ក្នុងប្រព័ន្ធថា «Customer បានទទួលអីវ៉ាន់រួចរាល់» (Confirm Delivered)
```