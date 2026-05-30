# Digital Credit Tracking System MVP

A production-ready, clean-architecture Node.js + TypeScript backend for a **Digital Credit Tracking System** used by small shops. 

This system replaces manual credit notebooks, enabling shops to manage customer credits, track credit lifecycles, and automatically calculate dynamic customer trust/reputation scores.

---

## 🚀 Key Features

- **Multi-Tenant SaaS Architecture:** Multi-tenant per shop. All resources (customers, credits, reviews) are strictly linked to the authenticated shop user (`shop_id`).
- **Dynamic Reputation Scoring (0–100):** Real-time, dynamic scoring calculated based on repayment history and cycles.
- **Credit Lifecycle Management:** Tracks outstanding debts dynamically (Active, Overdue, Closed) without introducing payment complexities.
- **Review and Feedback System:** Stores customer reviews to contribute to the overall trust profile.
- **Strict Clean Architecture:** Strict separation of layers (`Controller → Service → Repository`).
- **Robust Security & Validation:** Password hashing via `bcrypt`, JWT-based authentication, and structural request validation using `Zod`.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js (LTS)
- **Language:** TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Security:** JWT (jsonwebtoken) & bcrypt
- **Input Validation:** Zod

---

## 🗂️ Project Directory Structure

```text
paylog-backend/
├── prisma/
│   └── schema.prisma         # Prisma Schema defining User, Customer, Credit, Review
├── src/
│   ├── @types/
│   │   └── express.d.ts      # Custom Express Typings (User context)
│   ├── config/
│   │   └── prisma.ts         # Prisma Client configuration
│   ├── errors/
│   │   └── app-error.ts      # Custom HTTP errors (AppError, BadRequestError, etc.)
│   ├── middlewares/
│   │   ├── auth.middleware.ts       # JWT Validation Middleware
│   │   ├── error.middleware.ts      # Global Error & Prisma Exception Handler
│   │   └── validation.middleware.ts # Zod DTO schema validation middleware
│   ├── modules/
│   │   ├── auth/             # Auth Module (Register, Login)
│   │   ├── customer/         # Customer Module (Multi-tenant Customers management)
│   │   ├── credit/           # Credit Module (Lifecycle & credit entries tracking)
│   │   ├── reputation/       # Reputation System (Score and Risk mapping core logic)
│   │   └── review/           # Review Module (Rating & Comments)
│   ├── app.ts                # Express App & Middlewares registration
│   ├── routes.ts             # Consolidated API router registry
│   ├── server.ts             # Main Server startup entrypoint
│   └── test-reputation.ts    # Isolated unit tests for Reputation business rules
├── tsconfig.json             # TypeScript Compiler config
├── package.json              # Dependencies and scripts setup
└── README.md                 # Project documentation
```

---

## ⚙️ Setup and Installation

### 1. Prerequisite
Ensure you have Node.js (v18+) and PostgreSQL installed on your machine.

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory (based on `.env.example`):
```env
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/paylog_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
```

### 4. Database Setup & Migration
Generate the Prisma client code and run migrations to create your database tables:
```bash
# Generate Prisma Client
npx prisma generate

# Apply Migrations to database
npx prisma migrate dev --name init
```

### 5. Running the Application

- **Development mode (hot reload):**
  ```bash
  npm run dev
  ```
- **Production build & start:**
  ```bash
  npm run build
  npm start
  ```

---

## 🧪 Running Business Logic Unit Tests

To verify that the complex scoring, risk status, and review rating mathematical algorithms run perfectly, you can execute the unit test suite:
```bash
npx ts-node src/test-reputation.ts
```

---

## 📊 Core Business Logic

### Reputation Scoring Rules
All customers start with an initial score of **100**. The score is recalculated dynamically when requested:
- **Overdue credit:** `-20` points
- **Late closure (closed after due date):** `-10` points
- **Closed on time:** `+5` points
- **On-Time closure streak:** `+10` bonus for every 3 or more good cycles
- **Total score range:** Clamped strictly between `0` and `100`.

### Risk Status Mapping
- **80 – 100:** `LOW RISK`
- **50 – 79:** `MEDIUM RISK`
- **< 50:** `HIGH RISK`

---

## 🔌 API Documentation

All routes (except `/auth`) require a valid JWT passed inside the `Authorization: Bearer <token>` header.

### 1. Auth Module

#### Register Shop User
- **Endpoint:** `POST /api/auth/register`
- **Request Body:**
  ```json
  {
    "name": "Amanu's Corner Shop",
    "phone": "+251912345678",
    "password": "strongpassword123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Shop registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5...",
      "user": {
        "id": "e2646b9c-734d-49fc-9e32-23c21feef014",
        "name": "Amanu's Corner Shop",
        "phone": "+251912345678"
      }
    }
  }
  ```

#### Login Shop User
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "phone": "+251912345678",
    "password": "strongpassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5...",
      "user": {
        "id": "e2646b9c-734d-49fc-9e32-23c21feef014",
        "name": "Amanu's Corner Shop",
        "phone": "+251912345678"
      }
    }
  }
  ```

---

### 2. Customer Module

#### Create Customer (Multi-Tenant)
- **Endpoint:** `POST /api/customers`
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "phone": "+251988888888"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Customer created successfully",
    "data": {
      "id": "a57de700-1123-424a-bd54-d8435882b5fa",
      "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
      "name": "John Doe",
      "phone": "+251988888888",
      "createdAt": "2026-05-30T09:00:00.000Z",
      "reputation": {
        "score": 100,
        "riskStatus": "LOW RISK",
        "metrics": {
          "totalCredits": 0,
          "activeCreditsCount": 0,
          "overdueCreditsCount": 0,
          "onTimeClosedCount": 0,
          "lateClosedCount": 0,
          "totalOutstandingAmount": 0,
          "averageReviewRating": 0,
          "totalReviewsCount": 0
        }
      }
    }
  }
  ```

#### Get All Customers
- **Endpoint:** `GET /api/customers`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "a57de700-1123-424a-bd54-d8435882b5fa",
        "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
        "name": "John Doe",
        "phone": "+251988888888",
        "createdAt": "2026-05-30T09:00:00.000Z",
        "reputation": {
          "score": 100,
          "riskStatus": "LOW RISK",
          "totalOutstandingAmount": 0
        }
      }
    ]
  }
  ```

#### Get Customer By ID (Includes Full Credit & Review History + Reputation Profile)
- **Endpoint:** `GET /api/customers/:id`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "a57de700-1123-424a-bd54-d8435882b5fa",
      "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
      "name": "John Doe",
      "phone": "+251988888888",
      "createdAt": "2026-05-30T09:00:00.000Z",
      "reputation": {
        "score": 85,
        "riskStatus": "LOW RISK",
        "metrics": {
          "totalCredits": 5,
          "activeCreditsCount": 0,
          "overdueCreditsCount": 2,
          "onTimeClosedCount": 3,
          "lateClosedCount": 0,
          "totalOutstandingAmount": 250,
          "averageReviewRating": 4.5,
          "totalReviewsCount": 2
        }
      },
      "credits": [
        {
          "id": "c111...",
          "shopId": "e264...",
          "customerId": "a57d...",
          "amount": 100,
          "dueDate": "2026-05-15T00:00:00.000Z",
          "status": "OVERDUE",
          "createdAt": "2026-05-10T10:00:00.000Z",
          "updatedAt": "2026-05-16T12:00:00.000Z"
        }
      ],
      "reviews": [
        {
          "id": "r999...",
          "shopId": "e264...",
          "customerId": "a57d...",
          "rating": 5,
          "comment": "Good payer in general",
          "createdAt": "2026-05-20T12:00:00.000Z"
        }
      ]
    }
  }
  ```

---

### 3. Credit Module

#### Create Credit Entry
- **Endpoint:** `POST /api/credits`
- **Request Body:**
  ```json
  {
    "customerId": "a57de700-1123-424a-bd54-d8435882b5fa",
    "amount": 250.75,
    "dueDate": "2026-06-15T23:59:59.000Z"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Credit entry created successfully",
    "data": {
      "id": "e910bd6b-4e63-4410-b964-b25859732159",
      "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
      "customerId": "a57de700-1123-424a-bd54-d8435882b5fa",
      "amount": 250.75,
      "dueDate": "2026-06-15T23:59:59.000Z",
      "status": "ACTIVE",
      "createdAt": "2026-05-30T09:15:00.000Z",
      "updatedAt": "2026-05-30T09:15:00.000Z"
    }
  }
  ```

#### Get All Credits
- **Endpoint:** `GET /api/credits`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e910bd6b-4e63-4410-b964-b25859732159",
        "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
        "customerId": "a57de700-1123-424a-bd54-d8435882b5fa",
        "amount": 250.75,
        "dueDate": "2026-06-15T23:59:59.000Z",
        "status": "ACTIVE",
        "createdAt": "2026-05-30T09:15:00.000Z",
        "updatedAt": "2026-05-30T09:15:00.000Z",
        "customer": {
          "id": "a57de700-1123-424a-bd54-d8435882b5fa",
          "name": "John Doe",
          "phone": "+251988888888"
        }
      }
    ]
  }
  ```

#### Get Credit By ID
- **Endpoint:** `GET /api/credits/:id`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "e910bd6b-4e63-4410-b964-b25859732159",
      "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
      "customerId": "a57de700-1123-424a-bd54-d8435882b5fa",
      "amount": 250.75,
      "dueDate": "2026-06-15T23:59:59.000Z",
      "status": "ACTIVE",
      "createdAt": "2026-05-30T09:15:00.000Z",
      "updatedAt": "2026-05-30T09:15:00.000Z",
      "customer": {
        "id": "a57de700-1123-424a-bd54-d8435882b5fa",
        "name": "John Doe",
        "phone": "+251988888888"
      }
    }
  }
  ```

#### Close Credit Manually / Update Credit Status
- **Endpoint:** `PATCH /api/credits/:id/status`
- **Request Body:**
  ```json
  {
    "status": "CLOSED"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Credit status updated successfully",
    "data": {
      "id": "e910bd6b-4e63-4410-b964-b25859732159",
      "status": "CLOSED",
      "updatedAt": "2026-05-30T09:20:00.000Z"
    }
  }
  ```

---

### 4. Review Module

#### Create Review
- **Endpoint:** `POST /api/reviews`
- **Request Body:**
  ```json
  {
    "customerId": "a57de700-1123-424a-bd54-d8435882b5fa",
    "rating": 5,
    "comment": "Reliable customer, pays on time!"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Review added successfully",
    "data": {
      "id": "8e3bda8b-be1c-4395-88ff-c0e86b0da312",
      "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
      "customerId": "a57de700-1123-424a-bd54-d8435882b5fa",
      "rating": 5,
      "comment": "Reliable customer, pays on time!",
      "createdAt": "2026-05-30T09:25:00.000Z"
    }
  }
  ```

#### Get Reviews For Customer
- **Endpoint:** `GET /api/reviews/:customerId`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "8e3bda8b-be1c-4395-88ff-c0e86b0da312",
        "shopId": "e2646b9c-734d-49fc-9e32-23c21feef014",
        "customerId": "a57de700-1123-424a-bd54-d8435882b5fa",
        "rating": 5,
        "comment": "Reliable customer, pays on time!",
        "createdAt": "2026-05-30T09:25:00.000Z"
      }
    ]
  }
  ```

---

## 🔒 Security Design

1. **Multi-Tenancy Verification:** Every single query to fetch or modify a Customer, Credit or Review verifies that the item belongs to the authenticated user's `shopId`. It prevents cross-shop data leaks.
2. **Password Safety:** Raw passwords are never stored in the database. Instead, passwords are saved as secure hashes using `bcrypt` (10 salt rounds).
3. **Zod Validation Middleware:** All requests are validated against Zod DTO schemas before hitting the business controller.
4. **Invalid Credit State Prevention:** Credits that are already `CLOSED` cannot be modified anymore. Unsettled credits that have already crossed their due date cannot be set back to `ACTIVE` (which prevents manual status bypasses of overdue credit scores).
