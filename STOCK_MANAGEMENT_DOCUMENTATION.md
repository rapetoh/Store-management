# Stock Management System - Complete Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture & Technology Stack](#architecture--technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Core Business Logic](#core-business-logic)
7. [User Interface Components](#user-interface-components)
8. [External Integrations](#external-integrations)
9. [Configuration & Settings](#configuration--settings)
10. [Deployment & Environment](#deployment--environment)

---

## Project Overview

This is a comprehensive stock management system built with Next.js 14, designed for retail businesses to manage inventory, sales, customers, and financial operations. The system provides a complete point-of-sale (POS) solution with advanced inventory tracking, reporting, and user management capabilities.

### Key Features
- **Inventory Management**: Real-time stock tracking, low stock alerts, expiration management
- **Point of Sale**: Quick sales, barcode scanning, multiple payment methods
- **Customer Management**: Customer database with loyalty tracking
- **Financial Reporting**: Sales analytics, profit margins, category performance
- **User Management**: Role-based access control (Admin/Cashier)
- **Cash Register**: Session management with opening/closing procedures
- **Multi-language Support**: French interface with FCFA currency

---

## Architecture & Technology Stack

### Frontend
- **Framework**: Next.js 14.0.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Processing**: Built-in Node.js modules

### Development Tools
- **Package Manager**: npm
- **Database Client**: Prisma Studio
- **Type Checking**: TypeScript
- **Code Formatting**: Prettier (implied)

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main application page
│   └── login/             # Login page
├── components/            # React components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility libraries
├── prisma/                # Database schema and migrations
├── scripts/               # Utility scripts
└── middleware.ts          # Next.js middleware
```

---

## Database Schema

The system uses Prisma ORM with SQLite database. Here's the complete schema:

### Core Models

#### User
```typescript
model User {
  id          String   @id @default(cuid())
  username    String   @unique
  email       String   @unique
  password    String
  firstName   String
  lastName    String
  role        Role     @default(cashier)
  isActive    Boolean  @default(true)
  lastLogin   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Product
```typescript
model Product {
  id                  String    @id @default(cuid())
  name                String
  description         String?
  price               Float
  costPrice           Float?
  stock               Int       @default(0)
  minStock            Int       @default(0)
  barcode             String?   @unique
  sku                 String?   @unique
  image               String?
  isActive            Boolean   @default(true)
  lastInventoryDate   DateTime?
  lastInventoryStatus String?
  categoryId          String?
  supplierId          String?
  taxRateId           String?
  category            Category? @relation(fields: [categoryId], references: [id])
  supplier            Supplier? @relation(fields: [supplierId], references: [id])
  taxRate             TaxRate?  @relation(fields: [taxRateId], references: [id])
  saleItems           SaleItem[]
  inventoryMovements  InventoryMovement[]
  replenishments      Replenishment[]
  expirationAlerts    ExpirationAlert[]
}
```

#### Sale
```typescript
model Sale {
  id             String     @id @default(cuid())
  customerId     String?
  totalAmount    Float
  discountAmount Float      @default(0)
  taxAmount      Float      @default(0)
  finalAmount    Float
  paymentMethod  String
  paymentStatus  String     @default("completed")
  saleDate       DateTime   @default(now())
  notes          String?
  cashierId      String?
  customer       Customer?  @relation(fields: [customerId], references: [id])
  cashier        User?      @relation(fields: [cashierId], references: [id])
  items          SaleItem[]
}
```

#### Customer
```typescript
model Customer {
  id           String   @id @default(cuid())
  name         String
  email        String?
  phone        String?
  address      String?
  loyaltyCard  String?  @unique
  totalSpent   Float    @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  sales        Sale[]
}
```

#### Inventory Movement
```typescript
model InventoryMovement {
  id             String   @id @default(cuid())
  productId      String
  type           String   // 'sale', 'adjustment', 'replenishment', 'return'
  quantity       Int
  previousStock  Int
  newStock       Int
  reason         String?
  reference      String?
  notes          String?
  userId         String?
  financialImpact Float?
  product        Product  @relation(fields: [productId], references: [id])
  user           User?    @relation(fields: [userId], references: [id])
  createdAt      DateTime @default(now())
}
```

#### Cash Session
```typescript
model CashSession {
  id               String    @id @default(cuid())
  sessionDate      DateTime  @default(now())
  startTime        DateTime
  endTime          DateTime?
  openingAmount    Float
  closingAmount    Float?
  expectedAmount   Float?
  actualAmount     Float?
  difference       Float?
  totalSales       Float     @default(0)
  totalTransactions Int      @default(0)
  cashierId        String?
  cashierName      String?
  status           String    @default("open")
  cashier          User?     @relation(fields: [cashierId], references: [id])
}
```

#### Category
```typescript
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  prefix      String?   // For SKU generation
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]
}
```

#### Supplier
```typescript
model Supplier {
  id          String    @id @default(cuid())
  name        String
  contactName String?
  email       String?
  phone       String?
  address     String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]
  replenishments Replenishment[]
}
```

#### Tax Rate
```typescript
model TaxRate {
  id          String    @id @default(cuid())
  name        String
  rate        Float
  isDefault   Boolean   @default(false)
  isActive    Boolean   @default(true)
  description String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]
}
```

#### Promo Code
```typescript
model PromoCode {
  id          String    @id @default(cuid())
  code        String    @unique
  type        String    // 'percentage' or 'fixed'
  value       Float
  minAmount   Float     @default(0)
  maxUses     Int?
  usedCount   Int       @default(0)
  validFrom   DateTime  @default(now())
  validUntil  DateTime
  description String?
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### Activity Log
```typescript
model ActivityLog {
  id             String   @id @default(cuid())
  action         String
  details        String
  user           String
  financialImpact Float?
  category       String
  timestamp      DateTime @default(now())
  metadata       Json?
}
```

#### Replenishment
```typescript
model Replenishment {
  id             String    @id @default(cuid())
  productId      String
  supplierId     String
  quantity       Int
  unitPrice      Float
  deliveryCost   Float     @default(0)
  totalPrice     Float
  receiptNumber  String?
  expirationDate DateTime?
  notes          String?
  userId         String?
  product        Product   @relation(fields: [productId], references: [id])
  supplier       Supplier  @relation(fields: [supplierId], references: [id])
  user           User?     @relation(fields: [userId], references: [id])
  createdAt      DateTime  @default(now())
  expirationAlerts ExpirationAlert[]
}
```

#### Expiration Alert
```typescript
model ExpirationAlert {
  id               String        @id @default(cuid())
  replenishmentId  String
  productId        String
  supplierId       String
  expirationDate   DateTime
  originalQuantity Int
  currentQuantity  Int
  isActive         Boolean       @default(true)
  replenishment    Replenishment @relation(fields: [replenishmentId], references: [id])
  product          Product       @relation(fields: [productId], references: [id])
  supplier         Supplier      @relation(fields: [supplierId], references: [id])
  createdAt        DateTime      @default(now())
}
```

#### Notification
```typescript
model Notification {
  id        String   @id @default(cuid())
  title     String
  message   String
  type      String   // 'info', 'warning', 'error', 'success'
  isRead    Boolean  @default(false)
  userId    String?
  createdAt DateTime @default(now())
}
```

#### User Settings
```typescript
model UserSettings {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
**Purpose**: User authentication
**Request Body**:
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": "boolean"
}
```
**Response**:
```json
{
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "admin" | "cashier"
  },
  "token": "string"
}
```

#### POST /api/auth/logout
**Purpose**: User logout
**Headers**: `Authorization: Bearer <token>`

#### GET /api/auth/me
**Purpose**: Get current user information
**Headers**: `Authorization: Bearer <token>`

#### POST /api/auth/register
**Purpose**: User registration (admin only)
**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "password": "string",
  "role": "admin" | "cashier"
}
```

#### PUT /api/auth/profile
**Purpose**: Update user profile
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string"
}
```

### Product Management Endpoints

#### GET /api/products
**Purpose**: Get products with filtering and pagination
**Query Parameters**:
- `page`: number (default: 1)
- `limit`: number (default: 10)
- `search`: string
- `categoryId`: string
- `isActive`: boolean
- `lowStock`: boolean
- `outOfStock`: boolean

#### POST /api/products
**Purpose**: Create new product
**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "price": "number",
  "costPrice": "number",
  "stock": "number",
  "minStock": "number",
  "barcode": "string",
  "sku": "string",
  "categoryId": "string",
  "supplierId": "string",
  "taxRateId": "string"
}
```

#### GET /api/products/[id]
**Purpose**: Get product by ID

#### PUT /api/products/[id]
**Purpose**: Update product

#### DELETE /api/products/[id]
**Purpose**: Delete product (soft delete)

#### POST /api/products/adjust-stock
**Purpose**: Adjust product stock
**Request Body**:
```json
{
  "productId": "string",
  "quantity": "number",
  "reason": "string",
  "notes": "string"
}
```

#### GET /api/products/barcode
**Purpose**: Get product by barcode
**Query Parameters**:
- `barcode`: string

#### POST /api/products/bulk
**Purpose**: Bulk operations (import/export)
**Query Parameters**:
- `format`: "csv" | "json"

### Sales Management Endpoints

#### GET /api/sales
**Purpose**: Get sales with filtering
**Query Parameters**:
- `customerId`: string
- `startDate`: string (ISO date)
- `endDate`: string (ISO date)

#### POST /api/sales
**Purpose**: Create new sale
**Request Body**:
```json
{
  "customerId": "string",
  "items": [
    {
      "productId": "string",
      "quantity": "number",
      "unitPrice": "number",
      "discount": "number"
    }
  ],
  "discountAmount": "number",
  "paymentMethod": "string",
  "notes": "string"
}
```

#### GET /api/sales/[id]
**Purpose**: Get sale by ID

#### PUT /api/sales/[id]
**Purpose**: Update sale

#### DELETE /api/sales/[id]
**Purpose**: Delete sale

### Customer Management Endpoints

#### GET /api/customers
**Purpose**: Get all customers

#### POST /api/customers
**Purpose**: Create new customer
**Request Body**:
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

#### GET /api/customers/[id]
**Purpose**: Get customer by ID

#### PUT /api/customers/[id]
**Purpose**: Update customer

#### DELETE /api/customers/[id]
**Purpose**: Delete customer

#### GET /api/customers/search
**Purpose**: Search customers
**Query Parameters**:
- `q`: string (search term)

#### GET /api/customers/next-loyalty-card
**Purpose**: Get next loyalty card number

### Inventory Management Endpoints

#### GET /api/inventory/products
**Purpose**: Get inventory overview

#### GET /api/inventory/movements
**Purpose**: Get inventory movements
**Query Parameters**:
- `search`: string
- `type`: string
- `startDate`: string
- `endDate`: string
- `reason`: string
- `financialImpact`: boolean

#### POST /api/inventory/adjust
**Purpose**: Adjust inventory

#### GET /api/inventory/replenishments
**Purpose**: Get replenishments

#### POST /api/inventory/replenishments
**Purpose**: Create replenishment

#### GET /api/inventory/expiration-alerts
**Purpose**: Get expiration alerts

#### POST /api/inventory/mark-ok
**Purpose**: Mark product as OK after inventory

### Cash Management Endpoints

#### GET /api/cash
**Purpose**: Get current cash session and history

#### POST /api/cash
**Purpose**: Cash session operations
**Request Body**:
```json
{
  "action": "open" | "close" | "count" | "recalculate",
  "openingAmount": "number",
  "closingAmount": "number"
}
```

### Category Management Endpoints

#### GET /api/categories
**Purpose**: Get all categories
**Query Parameters**:
- `name`: string (get by name)

#### POST /api/categories
**Purpose**: Create category
**Request Body**:
```json
{
  "name": "string",
  "description": "string",
  "prefix": "string"
}
```

#### GET /api/categories/[id]
**Purpose**: Get category by ID

#### PUT /api/categories/[id]
**Purpose**: Update category

#### DELETE /api/categories/[id]
**Purpose**: Delete category

### Supplier Management Endpoints

#### GET /api/suppliers
**Purpose**: Get all suppliers
**Query Parameters**:
- `search`: string
- `name`: string (get by name)

#### POST /api/suppliers
**Purpose**: Create supplier
**Request Body**:
```json
{
  "name": "string",
  "contactName": "string",
  "email": "string",
  "phone": "string",
  "address": "string"
}
```

#### GET /api/suppliers/[id]
**Purpose**: Get supplier by ID

#### PUT /api/suppliers/[id]
**Purpose**: Update supplier

#### DELETE /api/suppliers/[id]
**Purpose**: Delete supplier

### Tax Rate Management Endpoints

#### GET /api/tax-rates
**Purpose**: Get all tax rates

#### POST /api/tax-rates
**Purpose**: Create tax rate
**Request Body**:
```json
{
  "name": "string",
  "rate": "number",
  "isDefault": "boolean",
  "description": "string"
}
```

#### PUT /api/tax-rates
**Purpose**: Update tax rate

#### DELETE /api/tax-rates
**Purpose**: Delete tax rate
**Query Parameters**:
- `id`: string

### User Management Endpoints

#### GET /api/users
**Purpose**: Get all users (admin only)
**Headers**: `Authorization: Bearer <token>`

#### POST /api/users
**Purpose**: Create user (admin only)
**Headers**: `Authorization: Bearer <token>`
**Request Body**:
```json
{
  "username": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "password": "string",
  "role": "admin" | "cashier"
}
```

#### GET /api/users/[id]
**Purpose**: Get user by ID

#### PUT /api/users/[id]
**Purpose**: Update user

#### DELETE /api/users/[id]
**Purpose**: Delete user

### Promo Code Management Endpoints

#### GET /api/promocodes
**Purpose**: Get all promo codes

#### POST /api/promocodes
**Purpose**: Create promo code
**Request Body**:
```json
{
  "code": "string",
  "type": "percentage" | "fixed",
  "value": "number",
  "minAmount": "number",
  "maxUses": "number",
  "validFrom": "string",
  "validUntil": "string",
  "description": "string"
}
```

#### POST /api/promocodes?action=validate
**Purpose**: Validate promo code
**Request Body**:
```json
{
  "code": "string",
  "amount": "number"
}
```

#### GET /api/promocodes/[id]
**Purpose**: Get promo code by ID

#### PUT /api/promocodes/[id]
**Purpose**: Update promo code

#### DELETE /api/promocodes/[id]
**Purpose**: Delete promo code

### Settings Endpoints

#### GET /api/settings
**Purpose**: Get all settings

#### POST /api/settings
**Purpose**: Update settings
**Request Body**:
```json
{
  "key": "value"
}
```

### Company Information Endpoints

#### GET /api/company
**Purpose**: Get company information

#### PUT /api/company
**Purpose**: Update company information
**Request Body**:
```json
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "siret": "string",
  "vatNumber": "string"
}
```

### Dashboard Endpoints

#### GET /api/dashboard/stats
**Purpose**: Get dashboard statistics

#### GET /api/dashboard/chart-data
**Purpose**: Get chart data for dashboard

#### GET /api/dashboard/category-profit
**Purpose**: Get category profit data

#### GET /api/dashboard/recent-activities
**Purpose**: Get recent activities

### Reports Endpoints

#### GET /api/reports/sales
**Purpose**: Get sales report data
**Query Parameters**:
- `startDate`: string
- `endDate`: string

#### GET /api/reports/products
**Purpose**: Get products report data

#### GET /api/reports/customers
**Purpose**: Get customers report data

#### GET /api/reports/inventory
**Purpose**: Get inventory report data

### Logging Endpoints

#### GET /api/logs
**Purpose**: Get activity logs

#### POST /api/logs
**Purpose**: Create activity log
**Request Body**:
```json
{
  "action": "string",
  "details": "string",
  "user": "string",
  "financialImpact": "number",
  "category": "string"
}
```

### Notification Endpoints

#### GET /api/notifications
**Purpose**: Get notifications

#### GET /api/notifications/count
**Purpose**: Get notification count

#### POST /api/notifications/mark-read
**Purpose**: Mark notifications as read

#### DELETE /api/notifications/delete
**Purpose**: Delete notifications

---

## Authentication & Authorization

### JWT Implementation

The system uses JSON Web Tokens for authentication with the following structure:

```typescript
interface TokenPayload {
  userId: string
  username: string
  role: 'admin' | 'cashier'
  iat: number
  exp: number
}
```

### Token Generation

- **Regular Token**: 24-hour expiry
- **Remember Me Token**: 30-day expiry
- **Secret**: Stored in environment variable `JWT_SECRET`

### Role-Based Access Control

#### Admin Role
- Full access to all features
- User management
- System settings
- Advanced reports
- All inventory operations

#### Cashier Role
- Sales operations
- Basic inventory viewing
- Customer management
- Limited reporting

### Authentication Flow

1. User submits credentials via `/api/auth/login`
2. System validates credentials against database
3. JWT token is generated and returned
4. Token is stored in localStorage/sessionStorage
5. Token is included in subsequent API requests
6. Middleware validates token on protected routes

### Password Security

- Passwords are hashed using bcryptjs with salt rounds of 12
- Password comparison uses bcrypt.compare()
- No plain text passwords are stored

---

## Core Business Logic

### Inventory Management

#### Stock Tracking
- Real-time stock updates on sales
- Automatic stock reduction on sale completion
- Stock adjustment capabilities with reason tracking
- Low stock alerts based on minimum stock levels

#### Inventory Movements
Every stock change is tracked with:
- Movement type (sale, adjustment, replenishment, return)
- Previous and new stock quantities
- Reason and reference information
- Financial impact calculation
- User who performed the action

#### Expiration Management
- Track product expiration dates per replenishment batch
- Alert system for approaching expiration dates
- Quantity management per expiration lot
- Automatic deactivation of expired products

### Sales Management

#### Sale Processing
1. **Product Selection**: Search by name, barcode, or SKU
2. **Quantity Entry**: Manual input or barcode scanning
3. **Price Calculation**: Automatic calculation with tax and discounts
4. **Payment Processing**: Multiple payment methods supported
5. **Receipt Generation**: Printable receipts with company branding

#### Payment Methods
- Cash
- Card
- Check
- Transfer

#### Discount System
- Product-level discounts
- Promo code system with validation
- Percentage and fixed amount discounts
- Minimum purchase requirements

### Customer Management

#### Customer Database
- Complete customer information storage
- Loyalty card number generation
- Purchase history tracking
- Customer segmentation for reporting

#### Loyalty System
- Automatic loyalty card number generation
- Purchase tracking per customer
- Customer spending analytics

### Cash Register Management

#### Session Management
- Opening cash session with starting amount
- Real-time sales tracking
- Closing session with count verification
- Difference calculation and reporting

#### Cash Flow Tracking
- Daily sales totals
- Transaction counts
- Cash vs. other payment methods
- Session history and audit trail

### Reporting System

#### Dashboard Analytics
- Real-time sales metrics
- Inventory status overview
- Customer activity summary
- Financial performance indicators

#### Advanced Reports
- Sales reports by date range
- Product performance analysis
- Customer segmentation reports
- Inventory valuation reports
- Category profit analysis

### Barcode Integration

#### Barcode Scanning
- Support for various barcode formats
- Product lookup by barcode
- Automatic quantity entry
- Error handling for invalid barcodes

#### Barcode Generation
- Automatic SKU generation based on category
- Unique identifier management
- Barcode validation

---

## User Interface Components

### Main Application Structure

#### Layout Component (`app/layout.tsx`)
- Root layout with global providers
- Authentication context
- Receipt settings context
- Toast notifications
- Universal logging initialization

#### Main Page (`app/page.tsx`)
- Navigation system with role-based access
- Dynamic content rendering based on active section
- Modal management
- URL parameter handling
- Cash register status checking

### Core Components

#### Dashboard (`components/Dashboard.tsx`)
- Key performance indicators
- Sales trend charts
- Category profit distribution
- Recent activities feed
- Quick action buttons

#### Products Management (`components/Products.tsx`)
- Product listing with pagination
- Search and filtering capabilities
- Add/Edit/Delete operations
- Stock status indicators
- Import/Export functionality

#### Sales Management (`components/Orders.tsx`)
- Sales history with filtering
- Quick sale modal integration
- Sale details and editing
- Receipt generation
- Payment method tracking

#### Inventory Management (`components/Inventory.tsx`)
- Multi-tab interface (Overview, Movements, Replenishment, Expirations)
- Stock adjustment capabilities
- Replenishment management
- Expiration alert handling
- Barcode scanning integration

#### Customer Management (`components/Customers.tsx`)
- Customer database with search
- Add/Edit customer information
- Loyalty card management
- Customer activity tracking

#### Reports (`components/Reports.tsx`)
- Comprehensive reporting interface
- Multiple chart types (Line, Bar, Pie)
- Date range filtering
- Export capabilities
- Customer segmentation analysis

#### Settings (`components/Settings.tsx`)
- Multi-tab settings interface
- Company information management
- Tax rate configuration
- Receipt settings
- User management (admin only)
- Promo code management

### Modal Components

#### Quick Sale Modal (`components/QuickSaleModal.tsx`)
- Product search and selection
- Quantity input with barcode scanning
- Price calculation with discounts
- Payment method selection
- Customer selection

#### Product Modals
- **Add Product Modal**: Complete product creation form
- **Edit Product Modal**: Product modification interface
- **Import Modal**: Bulk product import functionality

#### Inventory Modals
- **Inventory Modal**: Stock adjustment interface
- **Replenishment Modal**: Purchase order creation
- **Expiration Modal**: Expiration date management

#### Customer Modals
- **Add Customer Modal**: Customer creation form
- **Edit Customer Modal**: Customer modification interface

#### System Modals
- **Cash Register Modal**: Cash session management
- **Receipt Modal**: Receipt preview and printing
- **Notifications Modal**: System notifications display
- **User Profile Modal**: User profile management

### Context Providers

#### Authentication Context (`contexts/AuthContext.tsx`)
- User state management
- Login/logout functionality
- Token management
- Session persistence
- Profile updates

#### Receipt Settings Context (`contexts/ReceiptSettingsContext.tsx`)
- Receipt configuration management
- Company information storage
- Settings persistence
- Real-time updates

### Custom Hooks

#### Barcode Scanner Hook (`hooks/useBarcodeScanner.ts`)
- Barcode scanning functionality
- Product lookup integration
- Error handling
- Scanner state management

#### Company Info Hook (`hooks/useCompanyInfo.ts`)
- Company information fetching
- Settings management
- Real-time updates

#### Notification Count Hook (`hooks/useNotificationCount.ts`)
- Notification count tracking
- Real-time updates
- Badge display management

---

## External Integrations

### Barcode Scanning
- **Technology**: Web-based barcode scanning
- **Implementation**: Custom hook with camera access
- **Supported Formats**: Various barcode formats
- **Error Handling**: Invalid barcode detection and user feedback

### Receipt Printing
- **Technology**: Browser print functionality
- **Features**: 
  - Company branding
  - Configurable receipt layout
  - Automatic printing option
  - Duplicate printing support

### File Import/Export
- **CSV Import**: Product bulk import
- **CSV Export**: Data export for reporting
- **File Processing**: Client-side file handling
- **Validation**: Data validation before import

### Notification System
- **Real-time Updates**: Activity-based notifications
- **Types**: Info, warning, error, success
- **Persistence**: Database storage
- **User-specific**: Targeted notifications

---

## Configuration & Settings

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Configuration
- **Provider**: SQLite
- **Location**: `prisma/dev.db`
- **Migrations**: Prisma migration system
- **Seeding**: Initial data population scripts

### Application Settings
- **Company Information**: Configurable via settings
- **Receipt Settings**: Customizable receipt layout
- **Tax Rates**: Multiple tax rate support
- **User Preferences**: Individual user settings

### Security Configuration
- **JWT Secret**: Environment variable
- **Password Hashing**: bcryptjs with salt rounds
- **CORS**: Configured for development
- **Session Management**: Token-based authentication

---

## Deployment & Environment

### Development Setup
1. **Prerequisites**:
   - Node.js 18+
   - npm or yarn
   - SQLite database

2. **Installation**:
   ```bash
   npm install
   npx prisma generate
   npx prisma db push
   npm run db:seed
   ```

3. **Running**:
   ```bash
   npm run dev
   ```

### Database Management
- **Schema Updates**: `npx prisma db push`
- **Data Seeding**: `npm run db:seed`
- **Admin User**: `npm run db:create-admin`
- **Database Studio**: `npm run db:studio`

### Production Considerations
- **Database**: Consider PostgreSQL for production
- **Environment Variables**: Secure configuration
- **HTTPS**: SSL certificate implementation
- **Backup Strategy**: Regular database backups
- **Monitoring**: Application performance monitoring

### Scripts Available
- `db:push`: Push schema changes to database
- `db:seed`: Populate database with initial data
- `db:create-admin`: Create admin user
- `db:studio`: Open Prisma Studio
- `db:init-payment-methods`: Initialize payment methods

---

## Key Implementation Details

### State Management
- **React Context**: Global state management
- **Local State**: Component-level state
- **Persistence**: localStorage/sessionStorage for tokens
- **Real-time Updates**: Context-based state updates

### Error Handling
- **API Errors**: Centralized error handling
- **User Feedback**: Toast notifications
- **Validation**: Client and server-side validation
- **Logging**: Comprehensive activity logging

### Performance Optimizations
- **Pagination**: Large dataset handling
- **Debouncing**: Search input optimization
- **Lazy Loading**: Component-based loading
- **Caching**: Context-based data caching

### Security Features
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive validation
- **SQL Injection**: Prisma ORM protection
- **XSS Protection**: React's built-in protection

This documentation provides a comprehensive overview of the stock management system, covering all technical aspects needed to understand and replicate the system using Java and Spring Boot. The modular architecture and clear separation of concerns make it suitable for conversion to other technology stacks while maintaining the same functionality and user experience.
