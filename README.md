# ♻️ Eco-Collect

## "Smart Waste Management for Sustainable Communities"

Eco-Collect is a unified platform connecting Municipal Collection Points (MCPs) with waste pickup partners to optimize recycling workflows and reduce landfill waste.

<img width="1470" alt="Screenshot 2025-03-28 at 3 22 29 PM" src="https://github.com/user-attachments/assets/f8c681d2-bcaf-48dc-8116-f8970eb1f7fa" />

<img width="1470" alt="Screenshot 2025-03-28 at 3 23 00 PM" src="https://github.com/user-attachments/assets/1613305f-81b7-43c6-aa18-17c4a50fcfa0" />


---

## 🔑 Key Features

- **Role-based access** (MCP Admin + Pickup Partner)
- **Real-time order tracking** with GPS integration
- **Wallet system** for transparent financial transactions
- **Automated notifications** for pickup assignments

---

## 🚀 Setup Guide

### Prerequisites
- **Node.js** v18+
- **MongoDB** 6.0+ (local instance)
- **browswer** (for testing)

### Installation

Clone the repository:
```bash
git clone https://github.com/ashwinsdk/Eco-Collect.git
cd Eco-Collect
```

Configure environment variables (`.env`):
```env
MONGODB_URI=mongodb://localhost:27017/eco-collect
JWT_SECRET=your_secure_key_here
GOOGLE_MAPS_API_KEY=your_api_key
```

Install dependencies:
```bash
npm install
```

Start the server:
```bash
npm start
```

---

## 🖥️ Application Modules

### For MCP Admins
- **Partner Management**: Onboard/remove pickup partners with KYC verification
- **Dynamic Dispatch**: Auto-assign pickups based on partner proximity
- **Financial Oversight**:
  - Preload funds to partner wallets
  - Generate recycling impact reports (CSV/PDF)

### For Pickup Partners
- **Order Workflow**:
  - Accept/reject pickups with reason logging
  - Scan waste QR codes for verification
- **Earnings Dashboard**:
  - Real-time balance updates
  - Withdrawal requests via UPI/Bank Transfer

---

## 🛠️ Technical Stack

| Component      | Technology Used       |
|--------------|--------------------|
| Backend      | Node.js, Express    |
| Database     | MongoDB (local)     |
| Authentication | JWT, Bcrypt       |

---

## 📜 License
MIT License © 2025 - Ashwin S

---

## 🏆 Key Differentiators
✅ **Offline-first design** – Works in low-connectivity areas  
✅ **Transparent ledger** – All transactions recorded on-chain  
✅ **Scalable architecture** – Ready for municipal deployments  

---

