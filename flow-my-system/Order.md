# 🛒 Order Flow & Calculation (Cash Only)

### ១. ឧទាហរណ៍នៃការគណនាតម្លៃ (Pricing Calculation)

#### ករណីទី ១៖ ដឹកជញ្ជូនដល់ផ្ទះ (Delivery)
```
Food price:        $10.00
Delivery fee:       $2.00
-------------------------
Customer pays:     $12.00  (បង់លុយសុទ្ធជាមួយអ្នកដឹកពេលម្ហូបទៅដល់ - COD)
```

#### ករណីទី ២៖ ទៅយកផ្ទាល់នៅហាង (Pickup / Takeaway)
```
Food price:        $10.00
Delivery fee:       $0.00  (មិនគិតថ្លៃដឹក)
-------------------------
Customer pays:     $10.00  (បង់លុយសុទ្ធនៅបញ្ជរបេឡាហាងផ្ទាល់)
```

---

### ២. ដំណាក់កាលកុម្ម៉ង់ (Customer Ordering Steps)

```
Customer
   │
   ▼
ចូល Website មើល Menu
   │
   ▼
ជ្រើសរើសមុខម្ហូប (Add to Cart)
   │
   ▼
ចូល Cart & ចុច Checkout
   │
   ▼
ជ្រើសរើសវិធីទទួលម្ហូប (Fulfillment Option):
   │
   ├── [1] 🛍️ Pickup (ទៅយកផ្ទាល់) ───> ដាក់ឈ្មោះ + លេខទូរស័ព្ទ + ម៉ោងមកយក
   │       └── វិធីបង់ប្រាក់៖ [ បង់លុយសុទ្ធនៅហាង - Cash at Counter ]
   │
   └── [2] 🚚 Delivery (ដឹកដល់ផ្ទះ) ──> ដាក់ឈ្មោះ + លេខទូរស័ព្ទ + អាសយដ្ឋាន/Pin ផែនទី
           └── វិធីបង់ប្រាក់៖ [ បង់លុយសុទ្ធពេលដឹកដល់ - Cash on Delivery ]
   │
   ▼
Order Created (#1001)
```

---

### ៣. ការបញ្ជូនព័ត៌មានក្រោយពេល Order Created

```
                         ORDER CREATED (#1001)
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
                 ▼                                   ▼
        [បើជា PICKUP]                         [បើជា DELIVERY]
          │        │                            │        │         │
          ▼        ▼                            ▼        ▼         ▼
     Restaurant  Customer                  Restaurant Delivery Customer
   (រៀបចំម្ហូប) (តាមដាន Status)            (រៀបចំម្ហូប) (ត្រៀមដឹក) (តាមដាន)
```
