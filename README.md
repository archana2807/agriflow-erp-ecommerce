================================================================================
                    AGRIFLOW ERP - INTERVIEW PREPARATION
                         Project Architecture & Flow
================================================================================

Company: Ambika Krishi Yantra (Farm Equipment Manufacturer & Retailer)
Location: Barnagar, Madhya Pradesh, India
Domain: Agricultural E-Commerce ERP (B2B + B2C)

================================================================================
1. PROJECT OVERVIEW
================================================================================

AgriFlow ERP is a full-stack agricultural e-commerce ERP system that supports:
  - Walk-in (POS/Counter) sales for retail customers
  - Full online storefront with shopping cart, checkout, and payment
  - Admin panel for managing products, orders, invoices, payments, customers
  - Multi-tenant architecture (supports multiple businesses on one codebase)

================================================================================
2. TECH STACK
================================================================================

FRONTEND (agriflow-client/):
  Framework:    React 19 (Vite 8, ES Modules)
  Styling:      Tailwind CSS 4
  Routing:      React Router v7 (nested routes)
  Server State: TanStack React Query v8 (caching, mutations, invalidation)
  Client State: Redux Toolkit (cart only)
  Auth State:   React Context (admin + customer - separate contexts)
  Forms:        React Hook Form + Zod (client-side validation)
  UI Library:   Radix UI primitives (Dialog, Dropdown, Tabs, Select, etc.)
  Tables:       TanStack React Table v8
  Charts:       Recharts v3
  Icons:        Lucide React
  Toasts:       Sonner

BACKEND (agriflow-server/):
  Runtime:      Node.js (ES Modules)
  Framework:    Express 5
  Database:     MongoDB (Mongoose 9)
  Auth:         JWT (jsonwebtoken) + Bcrypt (10 salt rounds)
  Payments:     Razorpay SDK
  Validation:   Zod v4 (server-side)
  Security:     Helmet, CORS, cookie-parser, express-rate-limit
  Compression:  gzip responses
  Logging:      Morgan (combined format)

================================================================================
3. PROJECT STRUCTURE
================================================================================

agriflow-erp/
├── agriflow-client/              # React frontend
│   ├── src/
│   │   ├── App.jsx               # Root component, all routing
│   │   ├── main.jsx              # Entry point
│   │   ├── components/
│   │   │   ├── ui/               # Radix-based primitives (Button, Card, etc.)
│   │   │   └── layout/           # AdminLayout, CustomerLayout, Navbar, Footer
│   │   ├── pages/
│   │   │   ├── admin/            # 12 admin pages
│   │   │   ├── customer/         # 8 storefront pages
│   │   │   └── auth/             # Login/Register pages
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx           # Admin/ERP auth
│   │   │   └── CustomerAuthContext.jsx   # Customer auth
│   │   ├── hooks/
│   │   │   └── useQueries.js     # 47+ React Query hooks
│   │   ├── services/
│   │   │   ├── api.js            # Low-level fetch wrapper
│   │   │   ├── auth.service.js   # Admin auth API
│   │   │   ├── customer-auth.service.js # Customer auth API
│   │   │   ├── admin.service.js  # Admin CRUD API
│   │   │   └── shop.service.js   # Shop + cart + wishlist API
│   │   ├── store/
│   │   │   └── slices/cartSlice.js  # Redux cart (async thunks)
│   │   ├── constants/api.js      # All API endpoint constants
│   │   └── middleware/ProtectedRoute.jsx  # 4 route guards
│   └── package.json
│
├── agriflow-server/              # Express backend
│   ├── src/
│   │   ├── server.js             # Entry: loads dotenv, connects DB, starts server
│   │   ├── app.js                # Express app setup, CORS, route mounting
│   │   ├── config/db.js          # MongoDB connection
│   │   ├── models/               # 14 Mongoose models
│   │   ├── controllers/          # 19 controllers
│   │   ├── routes/               # 20 route modules
│   │   ├── services/             # 5 service classes (business logic)
│   │   ├── middlewares/          # 8 middleware files
│   │   ├── validations/          # 13 Zod validation schemas
│   │   └── utils/                # Token generation, phone normalization
│   └── package.json
│
└── DESCRIPTION.md                # Detailed project documentation

================================================================================
4. DATABASE MODELS (14 Collections)
================================================================================

USER (Admin/ERP accounts):
  Fields: name, email, password (select:false), role, tenantId, isActive
  Roles: ADMIN, SALES, ACCOUNTANT, TECHNICIAN, CUSTOMER
  Password: Bcrypt hashed (pre-save hook)

CUSTOMER:
  Fields: name, email (optional), password (optional), phone (required),
          isWalkIn, tenantId, isActive, isDeleted
  Note: Walk-in customers supported (no email/password needed)
  Phone: Normalized (strips non-digits, India country code)

PRODUCT:
  Fields: name, sku, price, gstPercent (0-28%), stock, categoryId, brandId,
          slug, description, images[], mrp, sellingPrice, discount,
          featured, bestSeller, newArrival, tenantId
  Note: GST-inclusive pricing, multiple images, product flagging

CATEGORY: name, slug, image, description, tenantId
BRAND: name, logo, description, tenantId

CART:
  Fields: customerId, tenantId, items[](productId, quantity, price, total),
          subtotal, gstAmount, discount, grandTotal
  Note: One cart per customer

ORDER:
  Fields: orderNo (auto: ORD-{timestamp}), customerId, addressId,
          items[](productId, name, quantity, price, gstPercent),
          totalAmount, status, orderType, paymentMethod, paymentStatus,
          tenantId, createdBy
  Status Flow: PENDING -> CONFIRMED -> PROCESSING -> PACKED -> SHIPPED
               -> DELIVERED / CANCELLED
  Order Types: WALKIN (POS) or ONLINE (storefront)

INVOICE:
  Fields: invoiceNo (auto: INV-{timestamp}), orderId, customerId,
          items[], subtotal, gstAmount, totalAmount, status, tenantId
  Note: Auto-generated on every order

PAYMENT:
  Fields: invoiceId, customerId, amountPaid, paymentMethod,
          remainingAmount, status, tenantId, createdBy
  Note: Supports PARTIAL payments (multiple payments per invoice)

COUPON: code, discountType (PERCENTAGE/FLAT), discountValue, minimumOrder,
        maximumDiscount, expiryDate, usageLimit, tenantId
BANNER: title, subtitle, image, buttonText, displayOrder, tenantId
ADDRESS: customerId, fullName, phone, addressLine1, city, state, pincode
WISHLIST: customerId, productId, tenantId
REVIEW: customerId, productId, rating (1-5), review, isApproved

================================================================================
5. AUTHENTICATION FLOW
================================================================================

TWO SEPARATE AUTH SYSTEMS (completely isolated):

ADMIN/ERP AUTH:
  Cookie: "token" (HTTP-only, 7 days)
  JWT Payload: { user: _id, role, tenantId, name, email }
  Middleware: auth.middleware.js -> protect(), optionalAuth()
  Frontend: AuthContext.jsx bootstraps via GET /api/auth/me
  Protected Route: AdminProtectedRoute checks role against ERP_ROLES

CUSTOMER AUTH:
  Cookie: "customerToken" (HTTP-only, 7 days)
  JWT Payload: { customerId: _id, tenantId, email }
  Middleware: customerAuth.middleware.js -> protectCustomer()
  Frontend: CustomerAuthContext.jsx bootstraps via GET /api/customer/me
  Protected Route: CustomerProtectedRoute checks useCustomerAuth()

TOKEN DELIVERY:
  - HTTP-only cookies (not accessible to JavaScript)
  - Fallback: Authorization: Bearer <token> header
  - credentials: "include" on all fetch calls
  - secure: true in production

PAGE LOAD FLOW:
  1. Browser refresh -> React mounts
  2. AuthProvider useEffect -> calls GET /api/auth/me (with cookie)
  3. Backend verifies JWT -> returns user data or 401
  4. Frontend sets user in context (or null)
  5. loading = false -> Routes render
  6. AdminProtectedRoute checks user + role -> allows or redirects

================================================================================
6. API ROUTES (20 Groups)
================================================================================

PUBLIC (no auth):
  GET  /api/shop/products         # Product catalog
  GET  /api/shop/products/:slug   # Single product
  GET  /api/shop/categories       # Categories list
  GET  /api/shop/brands           # Brands list
  GET  /api/shop/search           # Search products
  GET  /api/shop/featured         # Featured products
  GET  /api/shop/new-arrivals     # New arrivals
  GET  /api/shop/best-sellers     # Best sellers

AUTH (admin):
  POST /api/auth/login            # Admin login
  POST /api/auth/register         # Admin register
  POST /api/auth/logout           # Admin logout
  GET  /api/auth/me               # Bootstrap (session restore)
  GET  /api/auth/profile          # Full profile
  PUT  /api/auth/profile          # Update profile
  PUT  /api/auth/change-password  # Change password

AUTH (customer):
  POST /api/customer/login        # Customer login
  POST /api/customer/register     # Customer register
  POST /api/customer/logout       # Customer logout
  GET  /api/customer/me           # Bootstrap (session restore)
  GET  /api/customer/profile      # Full profile
  PUT  /api/customer/profile      # Update profile
  PUT  /api/customer/change-password

ADMIN (requires ERP role):
  GET/POST    /api/customers      # Customer management
  GET/PUT/DEL /api/customers/:id
  GET/POST    /api/admin/categories
  GET/POST    /api/admin/brands
  GET/POST    /api/admin/banners
  GET/POST    /api/admin/coupons
  GET/POST    /api/products       # Product CRUD
  GET/PUT/DEL /api/products/:id
  GET/POST    /api/orders         # Order management
  PUT         /api/orders/:id/status
  GET         /api/invoices       # Invoice listing
  GET         /api/invoices/order/:orderId
  GET/POST    /api/payments       # Payment management
  GET         /api/payments/invoice/:invoiceId
  GET         /api/dashboard      # Dashboard stats

CUSTOMER (requires login):
  GET/POST/PUT/DEL /api/cart     # Cart management
  POST/DELETE      /api/wishlist # Wishlist toggle
  GET/POST/PUT/DEL /api/addresses
  POST             /api/checkout # Place order (transactional)
  GET              /api/my-orders # Order history

RAZORPAY:
  POST /api/razorpay/create-order
  POST /api/razorpay/verify

================================================================================
7. CHECKOUT FLOW (Critical - Often Asked)
================================================================================

STEP-BY-STEP FLOW:

1. Customer clicks "Place Order" on checkout page
2. Frontend sends POST /api/checkout with { addressId, paymentMethod }
3. Backend CheckoutService uses MongoDB TRANSACTION:
   a. Read cart items
   b. Validate stock availability
   c. Create Order (with stock deduction)
   d. Create Invoice (auto-calculated subtotal + GST)
   e. Create Payment record (tracks partial/full payment)
   f. Clear cart
4. If any step fails -> ROLLBACK everything
5. Success -> Order confirmed, stock deducted, invoice created

KEY POINTS:
  - MongoDB transactions ensure atomicity (all-or-nothing)
  - Stock is deducted during order creation
  - Invoice is auto-generated on every order
  - Partial payments supported (useful for walk-in credit sales)
  - Order number: ORD-{timestamp}
  - Invoice number: INV-{timestamp}

WALK-IN (POS) ORDER FLOW:
  1. Admin creates order from Orders page
  2. Selects walk-in customer (no account needed)
  3. Adds products, sets quantities
  4. Can record immediate payment (CASH/CARD/UPI/BANK_TRANSFER)
  5. Invoice auto-generated with payment status

================================================================================
8. MULTI-TENANCY
================================================================================

PATTERN: Shared database, tenant-id field on every collection

HOW IT WORKS:
  - Every model has a "tenantId" string field
  - Compound unique indexes prevent cross-tenant duplicates
    Example: Customer (tenantId + phone) must be unique
  - tenantMiddleware extracts tenantId from authenticated user
  - All queries filter by tenantId
  - Rate limiting is per-tenant (100 req/15 min)

UNIQUE INDEXES (per tenant):
  Customer: (tenantId, phone)
  Product:  (tenantId, sku)
  Category: (tenantId, slug)
  Brand:    (tenantId, name)
  Coupon:   (tenantId, code)

================================================================================
9. STATE MANAGEMENT STRATEGY
================================================================================

| State Type      | Library              | What                        |
|-----------------|----------------------|-----------------------------|
| Server/API data | React Query          | Products, orders, invoices, |
|                 |                      | payments, wishlist, etc.    |
| Client state    | Redux Toolkit        | Shopping cart only          |
| Auth UI state   | React Context        | isAuthenticated, user,      |
|                 |                      | loading, login(), logout()  |

WHY THIS MIX?
  - React Query: Automatic caching, background refetching, optimistic updates
  - Redux: Synchronous cross-component access (cart count in navbar + page)
  - Context: Layout-level conditional rendering (show/hide nav items)

================================================================================
10. KEY BUSINESS LOGIC
================================================================================

GST-INCLUSIVE PRICING:
  - All product prices include GST
  - GST % stored per product (0-28%)
  - Calculated at order/invoice time
  - Formula: gstAmount = totalAmount * (gstPercent / (100 + gstPercent))

PARTIAL PAYMENTS:
  - Multiple payments can be recorded against one invoice
  - Each payment updates: Payment status, Invoice status, Order paymentStatus
  - Cascade: payment -> invoice -> order all update to PAID when fully paid

ORDER STATUS FLOW:
  PENDING -> CONFIRMED -> PROCESSING -> PACKED -> SHIPPED -> DELIVERED
  Any status -> CANCELLED (restores stock)

STOCK MANAGEMENT:
  - Deducted on order creation
  - Restored on order deletion
  - Validated during checkout (prevents overselling)

RAZORPAY INTEGRATION:
  1. Create order: POST /api/razorpay/create-order -> Razorpay API
  2. Customer pays on Razorpay checkout
  3. Verify: POST /api/razorpay/verify -> HMAC-SHA256 signature check
  4. On success: Update order status to CONFIRMED

================================================================================
11. COMMON INTERVIEW QUESTIONS & ANSWERS
================================================================================

Q: Why two separate auth systems (admin + customer)?
A: Complete isolation. Admin uses role-based access (ADMIN/SALES/ACCOUNTANT),
   customer uses simple login. Separate cookies, middleware, contexts, models.
   Prevents customer from accessing ERP and vice versa.

Q: Why use React Query + Redux + Context (3 state managers)?
A: Each serves a different purpose:
   - React Query: Server state (automatic caching, refetching, invalidation)
   - Redux: Client state needing synchronous cross-component access (cart)
   - Auth state: Layout-level rendering decisions (show/hide UI elements)

Q: How does multi-tenancy work?
A: Shared database with tenantId field on every collection. Compound unique
   indexes prevent cross-tenant duplicates. Middleware extracts tenantId from
   JWT and attaches to request. All queries filter by tenantId.

Q: How does checkout ensure data consistency?
A: MongoDB transactions. The CheckoutService wraps order creation, stock
   deduction, invoice generation, and cart clearing in a single transaction.
   If any step fails, everything rolls back.

Q: How are walk-in customers handled?
A: Customer model has isWalkIn flag. Walk-in customers can be created without
   email/password (phone only). Admin creates orders for them at POS counter.
   Supports immediate payment recording (CASH/CARD/UPI).

Q: How does partial payment work?
A: Multiple payments can be recorded against one invoice. Each payment updates
   remainingAmount. When remainingAmount = 0, payment status becomes FULL,
   invoice becomes PAID, order paymentStatus becomes PAID.

Q: How is password security handled?
A: Bcrypt with 10 salt rounds. Pre-save hook hashes password before saving.
   Password field has select:false (never returned in queries by default).
   matchPassword() instance method for verification.

Q: What is the role hierarchy?
A: ADMIN(4) > ACCOUNTANT(3) > SALES(2) > TECHNICIAN(1).
   Higher roles can access lower role routes.
   authorize() middleware checks role permissions.

Q: How does the frontend handle page refresh auth?
A: 1. Browser refresh -> React mounts
   2. AuthProvider useEffect -> calls GET /api/auth/me (sends cookie)
   3. Backend verifies JWT -> returns user or 401
   4. Frontend sets user in context
   5. loading = false -> Routes render
   6. ProtectedRoute checks user -> allows or redirects

Q: Why use HTTP-only cookies instead of localStorage?
A: Security. HTTP-only cookies cannot be accessed by JavaScript (XSS protection).
   localStorage is accessible to any script. Cookies are automatically sent
   with requests. More secure for JWT storage.

================================================================================
12. KEY FILES TO REMEMBER
================================================================================

FRONTEND:
  App.jsx                    - All routing structure
  contexts/AuthContext.jsx   - Admin auth (getMe on mount)
  contexts/CustomerAuthContext.jsx - Customer auth
  middleware/ProtectedRoute.jsx - Route guards with role checking
  constants/api.js           - All API endpoints
  services/api.js            - Fetch wrapper with credentials
  hooks/useQueries.js        - 47+ React Query hooks
  store/slices/cartSlice.js  - Redux cart with async thunks

BACKEND:
  app.js                     - Route mounting, middleware setup
  middlewares/auth.middleware.js      - Admin JWT verification
  middlewares/customerAuth.middleware.js - Customer JWT verification
  middlewares/role.middleware.js      - Role-based access control
  middlewares/tenant.middleware.js    - Multi-tenancy
  services/checkout.service.js       - Transactional checkout
  services/order.service.js          - Order + stock management
  controllers/auth.controller.js     - Admin auth handlers
  controllers/customerAuth.controller.js - Customer auth handlers

================================================================================
13. DEPLOYMENT NOTES
================================================================================

ENVIRONMENT VARIABLES (backend):
  MONGODB_URI         - MongoDB connection string
  JWT_SECRET          - Secret for admin JWT signing
  RAZORPAY_KEY_ID     - Razorpay API key
  RAZORPAY_KEY_SECRET - Razorpay API secret
  PORT                - Server port (default: 5000)
  CLIENT_URL          - Frontend URL for CORS

MIDDLEWARE STACK (in order):
  1. Helmet (security headers)
  2. Compression (gzip)
  3. Morgan (logging)
  4. CORS (cross-origin)
  5. express.json (body parsing, 10MB limit)
  6. cookie-parser (cookie parsing)
  7. tenantRateLimiter (100 req/15 min per tenant)
  8. errorHandler (global error handler)

================================================================================
                              END OF INTERVIEW PREP
================================================================================
