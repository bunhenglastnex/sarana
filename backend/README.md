# 🍔 Restaurant Backend REST API (Pure PHP + MySQL)

ប្រព័ន្ធ REST API សរសេរដោយសុទ្ធសាធជាភាសា **PHP (PDO)** ភ្ជាប់ទៅកាន់ **MySQL** ដោយមិនចាំបាច់មាន Framework ឬដាក់ក្នុង `C:/xampp/htdocs` ឡើយ។

---

### 🚀 របៀបដំណើរការ (How to Run)

#### ជំហានទី ១៖ បើក MySQL
- បើក **XAMPP Control Panel** រួចចុច **Start តែ MySQL** មួយគត់ (Port 3306)។

#### ជំហានទី ២៖ បង្កើត Tables & Seed Data (Run តែម្ដងគត់ដំបូង)
បើក Terminal ក្នុង Folder `backend/` រួចវាយ៖
```bash
php database/setup.php
```
*(ឬបើក Browser វាយ: `http://localhost:8000/database/setup.php`)*

#### ជំហានទី ៣៖ ចាប់ផ្ដើម PHP Server
វាយពាក្យបញ្ជានេះក្នុង Terminal៖
```bash
php -S localhost:8000
```
API របស់អ្នកនឹងដំណើរការនៅ: **`http://localhost:8000`** 🎉

---

### 📡 បញ្ជី API Endpoints

| Method | Endpoint | មុខងារ (Description) |
| :--- | :--- | :--- |
| `GET` | `/database/setup.php` | បង្កើត Database, Tables និង Seed Dummy Data |
| `GET` | `/api/foods.php` | ទាញយកបញ្ជីម្ហូបទាំងអស់ និង Categories |
| `POST` | `/api/foods.php` | បន្ថែមមុខម្ហូបថ្មី (Admin) |
| `GET` | `/api/orders.php` | មើលបញ្ជី Orders (អាច filter តាម `status`, `fulfillment_type`) |
| `POST` | `/api/orders.php` | Customer កុម្ម៉ង់ម្ហូប (គាំទ្រ Delivery / Pickup + Cash Only) |
| `PATCH` | `/api/order-status.php` | ហាងកែប្រែ Status (`accepted`, `preparing`, `ready_for_pickup`, `ready_for_delivery`, `completed`) |
| `GET` | `/api/delivery.php` | បញ្ជី Order ដែលអ្នកដឹកត្រូវទៅយក + របាយការណ៍ Cash in Hand |
| `POST` | `/api/delivery.php` | អ្នកដឹកចុច `pickup_from_kitchen` ឬ `confirm_delivered` |
