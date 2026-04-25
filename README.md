# 🚗 GT7 Tuning Assistant

A full-stack application to explore Gran Turismo 7 cars and assist with tuning decisions using structured data and (future) AI-based analysis.

---

## 📦 Tech Stack

### Backend
- Node.js
- Express
- TypeScript
- MongoDB (Mongoose)

### Data Processing
- Python (scraping + normalization)
- BeautifulSoup
- Requests

### Frontend
- Angular (standalone components)
- Angular Material
- Signals / RxJS

---

## 🚀 Features

### ✅ Implemented

- Scraping GT7 car data from Fandom
- Data normalization (power, weight, drivetrain, etc.)
- MongoDB storage
- REST API
  - `GET /cars`
  - `GET /cars/:id`
  - `GET /cars/search?q=...`
  - `GET /cars/manufacturer/:manufacturer`
- Angular frontend
  - Car list (table view)
  - Car detail page
- Modern Angular patterns (signals, standalone components)

---

## 🧠 Data Model

Each car includes:

- Basic info (name, manufacturer, image)
- Raw specs (from scraping)
- Normalized data:
  - Power (HP)
  - Weight (kg)
  - PP
  - Drivetrain (FWD / RWD / AWD)
  - Engine type (NA, Turbo, Electric, etc.)
  - Category (road / race / concept)
  - Metrics (power-to-weight, etc.)

---

## 📁 Project Structure
/backend
/src
/routes
/controllers
/services
/models

/scripts
scrape_gt7_fandom.py
normalize_gt7_cars.py

/frontend (Angular)
/src/app
/pages
car-list
car-detail
/services
/models


---

## ⚙️ Setup

### 1. Backend

```bash
cd api
npm install
npm run dev
```

mongodb://localhost:27017/gt7_tuning

```bash
cd front/gt7-tuning-front
npm install
ng serve
```

http://localhost:4200

3. Data scripts (optional)

Scrape data:
```bash
python scrape_gt7_fandom.py
```

Normalize data:
```bash
python normalize_gt7_cars.py
```

🔮 Roadmap
Advanced filtering (category, drivetrain, engine type)
Live search
Car comparison
Tuning recommendation engine
AI-based setup assistant
Track-specific tuning suggestions

💡 Vision

The goal is to build an intelligent system capable of:

Understanding car behavior (understeer, oversteer, balance)
Suggesting optimal tuning setups
Helping players make better decisions about upgrades and parts

👤 Author

Eric Harkat

