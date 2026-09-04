# 🏪 Restaurant Flow (Cash-Only Model)

### ១. ការទទួលការកុម្ម៉ង់ (Order Notification)

នៅពេលមានការកុម្ម៉ង់ពី Website ផ្ទាំង Admin/Kitchen របស់ហាងនឹងលោត Alert ភ្លាមៗ៖

```
🔔 New Order #1001 ── [ Type: Delivery ឬ Pickup ]

Items:
  - Burger x2
  - Coke x1
Total Amount: $12.00

Customer Info:
  - Name: Dara
  - Phone: 012 345 678
  - Fulfillment: Delivery (អាសយដ្ឋាន: Toul Kork, Phnom Penh)
  - Payment: Cash on Delivery (បង់លុយសុទ្ធពេលដឹកដល់)

[ Accept Order ]     [ Reject Order ]
```

---

### ២. វដ្តនៃការរៀបចំម្ហូប (Preparation Lifecycle)

```
Pending (រង់ចាំហាងទទួល)
   │
   ▼
Accepted (ហាងយល់ព្រមទទួលធ្វើ)
   │
   ▼
Preparing (កំពុងធ្វើម្ហូបក្នុងផ្ទះបាយ)
   │
   ▼
   ├── បើជា [PICKUP]:
   │     │
   │     ▼
   │   Ready for Pickup (ម្ហូបរួចរាល់ ដំណឹងទៅភ្ញៀវឱ្យមកយក)
   │     │
   │     ▼
   │   Customer មកដល់ហាង ➔ បង់លុយសុទ្ធនៅបញ្ជរ ➔ ទទួលម្ហូប
   │     │
   │     ▼
   │   Completed (ហាងចុចបញ្ចប់ Order ✅)
   │
   └── បើជា [DELIVERY]:
         │
         ▼
       Ready for Delivery (ម្ហូបរួចរាល់ រុញដំណឹងទៅ Delivery Staff)
         │
         ▼
       Delivery Staff មកយកម្ហូបពីផ្ទះបាយ ➔ ចាប់ផ្ដើមចេញដឹក
```