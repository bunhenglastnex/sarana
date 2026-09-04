# 🚚 Delivery Flow (In-House Delivery Staff)

Role Delivery នេះ គឺជាបុគ្គលិកដឹកជញ្ជូនផ្ទៃក្នុងរបស់ហាង ដែលមានភារកិច្ចឆែក Order និងដឹកជូនអតិថិជនដល់ផ្ទះ។

---

### ១. ផ្ទាំងមើលការងារដឹកជញ្ជូន (Delivery Dashboard)

បុគ្គលិកដឹក Login ចូលប្រព័ន្ធ នឹងឃើញតែ Order ណាដែលជាប្រភេទ **Delivery** និងមាន Status = `Ready for Delivery`៖

```
🚚 Order Ready for Delivery

Order #1001
Customer: Dara
Phone: 012 345 678
Address: St 210, Toul Kork, Phnom Penh
Items: Burger x2, Coke x1
Payment: Paid (KHQR)  [ ឬ To Collect COD: $12.00 ]

[ 📦 Pickup & Start Delivery ]
```

---

### ២. ដំណាក់កាលការងាររបស់ Delivery Staff (Delivery Workflow)

```
1. ឆែកមើល Order ដែលត្រូវដឹក (Check Delivery Orders)
       │
       ▼
2. យកម្ហូបពីផ្ទះបាយរបស់ហាង (Pickup from Kitchen)
       │
       ▼
3. ចុច "Start Delivery" ➔ System update ទៅជា [On the Way / Out for Delivery]
       │
       ▼
4. ធ្វើដំណើរទៅដល់ផ្ទះ Customer (Go to Customer Address)
       │
       ▼
5. ប្រគល់ម្ហូបជូន Customer (+ ប្រមូលលុយ បើជា Cash COD)
       │
       ▼
6. បុគ្គលិកដឹកចុចប៊ូតុង "[ Confirm Delivered ]" ក្នុង System
       │
       ▼
7. ប្រព័ន្ធប្រកាសថា "Order Completed" ✅ (ទាំង Customer & ហាង ទទួលបានដំណឹងជោគជ័យ)
```