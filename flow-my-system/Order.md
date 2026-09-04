```ex
Food price       $10.00
Tax / Service     $1.00
Delivery fee      $2.00
-----------------------
Customer pays    $13.00
```
```flow
Customer
   ↓
Select Restaurant
   ↓
Select Food
   ↓
Cart
   ↓
Checkout
   ↓
Calculate Total
   ↓
Payment
   ↓
Order Created

```
```after Payment
                  ORDER
                    │
          ┌─────────┼─────────┐
          ▼         ▼         ▼
      Restaurant  Delivery  Customer
```
