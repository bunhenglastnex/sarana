# 💰 Money Flow (Single Restaurant - Cash Only Model)

ប្រព័ន្ធនេះដំណើរការដោយ **សាច់ប្រាក់សុទ្ធ ១០០% (Cash Only)** ដោយមិនប្រើប្រាស់ប្រព័ន្ធធនាគារ ABA ឬ KHQR នោះឡើយ៖
- ករណី **Delivery**៖ បង់លុយសុទ្ធពេលម្ហូបដឹកទៅដល់ដៃ (Cash on Delivery / Pay with Delivery)
- ករណី **Pickup**៖ បង់លុយសុទ្ធនៅបញ្ជរបេឡារបស់ហាង (Pay at Store Counter)

---

### ១. លំហូរប្រាក់កុម្ម៉ង់ (Cash Payment Distribution)

#### ករណី Delivery (ឧទាហរណ៍ សរុប $12.00):
```
                       CUSTOMER
                          │
                          │ បង់លុយសុទ្ធ $12.00 ពេលដឹកដល់ (Cash on Delivery)
                          ▼
                    DELIVERY STAFF (អ្នកដឹក)
                          │
                          │ [ចុងវេន / End of Shift] យកលុយមកប្រគល់ជូន
                          ▼
                    RESTAURANT CASHIER
                          │
            ┌─────────────┴─────────────┐
            ▼                           ▼
       Food Amount                Delivery Fee
         $10.00                      $2.00
            │                           │
            ▼                           ▼
      ចំណូលរបស់ហាង               ចំណូលរបស់ហាង
                                 (សម្រាប់បើកប្រាក់ខែ/ថ្លៃសាំង Delivery)
```

#### ករណី Pickup (ឧទាហរណ៍ សរុប $10.00):
```
                       CUSTOMER
                          │
                          │ បង់លុយសុទ្ធ $10.00 នៅបញ្ជរហាង (Pay at Counter)
                          ▼
                  ចំណូលរបស់ហាង ១០០% ($10.00)
```

---

### ២. អត្ថប្រយោជន៍នៃ Cash Only ក្នុងប្រព័ន្ធ
1. **សាមញ្ញ និងឆាប់រហ័ស:** មិនបាច់ភ្ជាប់ API ធនាគារ (No ABA / No KHQR Gateway) មិនបាច់មាន Merchant Account។
2. **ចំណូល ១០០% បានទៅហាង:** គ្មានការកាត់កម្រៃជើងសារ (Zero 3rd-party Commission)។
3. **ការគ្រប់គ្រងងាយស្រួល:** ផ្ទៀងផ្ទាត់តែបញ្ជី Cash in Hand របស់អ្នកដឹកនៅចុងវេន។