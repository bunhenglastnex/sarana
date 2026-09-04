# 🚚 Delivery Flow (Cash-Only Model)

Role Delivery នេះ គឺជាបុគ្គលិកដឹកជញ្ជូនផ្ទៃក្នុងរបស់ហាង ដែលមានភារកិច្ចឆែក Order, ដឹកជញ្ជូនដល់ផ្ទះ និង **ប្រមូលលុយសុទ្ធ (Cash on Delivery - COD)** ពីអតិថិជន។

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
💵 Payment: Cash on Delivery (ត្រូវទារលុយ: $12.00)

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
3. ចុច "Start Delivery" ➔ System update ទៅជា [On the Way]
       │
       ▼
4. ធ្វើដំណើរទៅដល់ផ្ទះ Customer (Go to Customer Address)
       │
       ▼
5. ប្រគល់ម្ហូបជូន Customer និងទទួលយកលុយសុទ្ធ ($12.00)
       │
       ▼
6. បុគ្គលិកដឹកចុចប៊ូតុង "[ Confirm Delivered ]" ក្នុង System
       │
       ▼
7. ប្រព័ន្ធប្រកាសថា "Order Completed" ✅ 
   (System កត់ត្រាថា Driver កំពុងកាន់លុយសុទ្ធ Cash in Hand: $12.00)
```