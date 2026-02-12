# Soul Backend - Developer Documentation

> **Last Updated:** 2026-02-01
> **Version:** 0.3.0
> **API Version:** v0

This document provides a comprehensive guide to the Soul Backend codebase for developers and AI assistants.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture Overview](#architecture-overview)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Data Models](#data-models)
6. [Request Flow](#request-flow)
7. [Authentication](#authentication)
8. [API Endpoints](#api-endpoints)
9. [Configuration](#configuration)
10. [External Integrations](#external-integrations)
11. [Development Guide](#development-guide)

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8.0+
- Yarn package manager

### Setup
```bash
# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your database and mail credentials

# Generate Prisma client and run migrations
yarn db:migrate

# Start development server
yarn dev
```

### Default Credentials
- Default OTP code: `333333` (created on first startup)
- API Base: `http://localhost:3000/v0`
- Docs: `http://localhost:3000/docs`

---

## Architecture Overview

### Technology Stack
- **Framework:** Fastify 5.3.3 (high-performance Node.js framework)
- **Language:** TypeScript 5.8.3
- **Database:** Prisma 6.17.1 + MySQL
- **Message Queue:** Kafka.js 2.2.4 (configured but optional)
- **Cache:** Redis 5.5.6 (initialized but not actively used)
- **Email:** Nodemailer 7.0.9
- **Authentication:** JWT (@fastify/jwt)

### Design Patterns

**Layered Architecture:**
```
HTTP Request → Routes → Services → Controllers → Database
                  ↓
            Middleware (Auth, CORS, Helmet)
```

**Factory Pattern:**
- `ControllerFactory<T>` - Generic CRUD database operations
- `ServiceFactory<T>` - Generic business logic layer

**Singleton Pattern:**
- Server instance
- Kafka worker
- Redis service

---

## Project Structure

```
src/
├── index.ts                 # Application entry point
├── controllers/             # Data access layer (Prisma operations)
│   ├── code.ts             # Code CRUD + login method
│   ├── product.ts          # Product CRUD operations
│   ├── order.ts            # Order CRUD + linkProducts
│   └── index.ts
├── services/               # Business logic layer
│   ├── code.ts             # Code validation and auth
│   ├── product.ts          # Product business logic
│   ├── order.ts            # Order processing + email generation
│   └── index.ts
├── routes/                 # HTTP endpoint definitions
│   ├── code.ts             # /v0/code endpoints
│   ├── product.ts          # /v0/product endpoints
│   ├── order.ts            # /v0/order endpoints
│   └── index.ts
├── schemas/                # Request/response validation (Fastify schemas)
│   ├── code.ts
│   ├── product.ts
│   ├── order.ts
│   └── index.ts
├── types/                  # TypeScript type definitions
│   └── order.ts
├── helpers/                # Factory classes and core utilities
│   ├── server.ts           # Fastify server configuration
│   ├── service.ts          # ServiceFactory base class
│   ├── controller.ts       # ControllerFactory base class
│   ├── kafka.ts            # KafkaWorker
│   ├── redis.ts            # RedisService
│   ├── env.ts              # Environment configuration
│   └── generator.ts        # Code generation CLI
├── utils/                  # Utility functions
│   ├── auth.ts             # JWT middleware
│   ├── mail.ts             # Email sending
│   ├── default.ts          # Default data seeding
│   └── index.ts
├── db/                     # Database configuration
│   └── index.ts            # Prisma client singleton
├── messages/               # Localized console messages
│   ├── server.ts
│   ├── auth.ts
│   ├── database.ts
│   └── kafka.ts
├── locales/                # i18n translations
│   ├── en-US/              # English
│   └── fr-FR/              # French
└── logs/                   # Application logs
    ├── error.log
    ├── server.log
    └── warnings.log
```

---

## Core Components

### Server (src/helpers/server.ts)

**Responsibilities:**
- Configure Fastify with logging, security, CORS
- Register JWT authentication
- Set up Swagger/OpenAPI documentation
- Register all routes with version prefix
- Initialize Kafka and Redis (if configured)
- Handle graceful shutdown

**Key Features:**
- Multi-transport logging (console + files)
- Security headers via Helmet
- CORS with configurable origins
- Multipart file upload support
- Error handling with proper status codes

### ControllerFactory (src/helpers/controller.ts)

**Generic CRUD Operations:**
```typescript
class ControllerFactory<T> {
  create(data: T): Promise<T>
  getAll(options?): Promise<T[]>
  getById(id: number, options?): Promise<T | null>
  find(where: Partial<T>): Promise<T | null>
  search(where: Partial<T>, options?): Promise<T[]>
  paginatedSearch(where, page, size, searchFields): Promise<PaginatedResult<T>>
  count(where: Partial<T>): Promise<number>
  update(id: number, data: Partial<T>): Promise<T | null>
  updateMany(where, data): Promise<number>
  delete(id: number): Promise<T | null>
  deleteMany(where): Promise<number>

  // Export methods
  exportAsCsv(where, reply, fields?): Promise<void>
  exportAsXlsx(where, reply, fields?): Promise<void>
  exportAsPdf(where, reply, fields?): Promise<void>
  exportAsJson(where, reply, fields?): Promise<void>
  export(format, reply, where?, fields?): Promise<void>
}
```

**Usage:**
```typescript
import { Code as Build } from '@prisma/client';
import { ControllerFactory } from '../helpers';

class Controller extends ControllerFactory<Build> {
  constructor() {
    super('code'); // Prisma model name
  }

  // Custom methods
  async login(code: string) {
    const result = await this.find({ code });
    if (!result) throw new Error('Code not found');
    return result;
  }
}
```

### ServiceFactory (src/helpers/service.ts)

**Generic Business Logic:**
```typescript
class ServiceFactory<T> {
  constructor(protected controller: ControllerFactory<T>)

  create(data: T): Promise<T>
  getAll(orderBy?): Promise<T[]>
  getById(id: number, options?): Promise<T | null>
  find(where): Promise<T | null>
  search(where, options?): Promise<T[]>
  paginatedSearch(where, page, size, searchFields): Promise<PaginatedResult<T>>
  count(where): Promise<number>
  update(id, data): Promise<T | null>
  updateMany(where, data): Promise<number>
  delete(id): Promise<T | null>
  deleteMany(where): Promise<number>
  export(format, reply, where?): Promise<void>
}
```

**Error Handling:**
- All methods wrap controller calls in try-catch
- Assigns appropriate HTTP status codes (400, 404, 500)
- Throws errors with statusCode property

---

## Data Models

### Product
```typescript
{
  id: number (UUID)
  title: string
  price: number
  rating: number (default: 0)
  genre: string
  category: string
  image: string (URL)
  description: string (Text)
  support: string (default: "PC")
  createdAt: DateTime
  updatedAt: DateTime
  orderedProducts: OrderedProducts[]
}
```

### Code
```typescript
{
  id: number (UUID)
  code: string
  discount: number
  assignedTo: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Default Code:** `333333` (discount: 0, assignedTo: "Admin")

### Order
```typescript
{
  id: number (UUID)
  name: string
  email: string
  cardNumber: string
  expiry: string
  cvv: string
  phoneNumber: string
  paymentMethod: string
  code: string
  total: number
  assignedTo: string
  items: OrderedProducts[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

### OrderedProducts
```typescript
{
  id: number (UUID)
  orderId: string (FK)
  productId: string (FK)
  quantity: number
  order: Order
  product: Product
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Request Flow

### Example: Order Creation

```
POST /v0/order
  ↓
[1] Auth Middleware (utils/auth.ts)
    - Verify JWT token
    - Extract user.id from token
    - Return 401 if invalid
  ↓
[2] Route Handler (routes/order.ts)
    - Parse request body
    - Retrieve Code from user.id
    - Return 401 if code not found
  ↓
[3] Order Service.createOrder()
    - Calculate total from cart
    - Create Order record
    - Link products via OrderedProducts
    - Generate customer email (HTML)
    - Generate shop notification email (HTML)
    - Send emails asynchronously
    - Return order with items
  ↓
[4] Response
    - Status: 200 OK
    - Body: { data: order }
```

---

## Authentication

### JWT Flow

**Login:**
```
POST /v0/code/login
Body: { code: "333333" }

→ Service validates code exists
→ Controller returns code record
→ Route generates JWT with code.id
→ Response: { data: { token: "jwt_string" } }
```

**Protected Endpoints:**
```
GET /v0/product
Header: Authorization: Bearer {jwt_token}

→ Auth middleware verifies token
→ Extracts user = { id: code.id }
→ Route handler proceeds
→ Response: { data: products[] }
```

**Disable Authentication:**
Set `AUTH_ENABLED=0` in .env (not recommended for production)

---

## API Endpoints

### Standard CRUD Pattern

All resources (code, product, order) follow this pattern:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/v0/{resource}` | Yes | Create new record |
| GET | `/v0/{resource}` | Yes | Get all records |
| GET | `/v0/{resource}/search` | Yes | Search with filters |
| GET | `/v0/{resource}/find` | Yes | Find single record |
| GET | `/v0/{resource}/export/:format` | Yes | Export (csv/json/xlsx/pdf) |
| GET | `/v0/{resource}/:id` | Yes | Get by ID |
| PUT | `/v0/{resource}/:id` | Yes | Update by ID |
| DELETE | `/v0/{resource}/:id` | Yes | Delete by ID |

### Special Endpoints

**Authentication:**
```
POST /v0/code/login
Body: { code: string }
Response: { data: { token: string } }
```

**Export Formats:**
```
GET /v0/product/export/csv
GET /v0/product/export/json
GET /v0/product/export/xlsx
GET /v0/product/export/pdf
```

### Frontend Contract (CONTRACTS.md)

The frontend expects these specific endpoints:

1. **Login:** `POST /v0/code/login`
   - Request: `{ code: string }`
   - Response: `{ token: string, message?: string }`

2. **Products:** `GET /v0/product`
   - Response: `{ data: Product[] }`

3. **Orders:** `POST /v0/order`
   - Request: `{ customerName, customerEmail, items[], totalAmount }`
   - Response: `{ success: boolean, orderId: string, message?: string }`

**⚠️ Current Implementation Mismatch:**
- Order request body uses different field names (name vs customerName)
- Order response format differs (returns full order object vs success flag)
- Product IDs are UUIDs (string) but contract expects numbers

---

## Configuration

### Environment Variables

**Core Server:**
```bash
APP_HOST=0.0.0.0           # Server bind address
APP_PORT=3000              # Server port
AUTH_ENABLED=1             # 1=enabled, 0=disabled
CORS_ORIGIN=*              # CORS allowed origins
LANGUAGE=en-US             # en-US | fr-FR
```

**Database:**
```bash
DATABASE_URL=mysql://user:pass@host:port/database
```

**Authentication:**
```bash
JWT_SECRET=your_secret_key
```

**Email (Required for orders):**
```bash
MAIL_HOST=smtp.domain.com
MAIL_PORT=587
MAIL_USER=user@domain.com
MAIL_PASSWORD=password
MAIL_SECURE=0              # 1=TLS, 0=no TLS
SHOP_EMAIL=shop@domain.com # Receives order notifications
```

**Kafka (Optional):**
```bash
KAFKA_BROKER=localhost:9092
KAFKA_CLIENT_ID=soul-backend
KAFKA_GROUP_ID=soul-group
KAFKA_ROLE=none            # producer | consumer | both | none
KAFKA_TOPICS=orders,products
```

**Redis (Optional):**
```bash
REDIS_URL=redis://localhost:6379
```

### API Versioning

Version is auto-extracted from `package.json`:
```json
{
  "version": "0.3.0"
}
```
→ API version: `v0` (major version only)

All routes prefixed with `/v0`

---

## External Integrations

### Email (Nodemailer)

**Configuration:** src/utils/mail.ts

**Usage:**
```typescript
import { sendMail } from '../utils';

sendMail(
  'customer@example.com',
  'Order Confirmation',
  'Plain text fallback',
  '<html>Rich HTML email</html>'
);
```

**Order Emails:**
- Customer receives: Order confirmation with items, total, order ID
- Shop receives: New order notification with customer info, payment method, items
- Language: French
- Async sending (non-blocking)

### Kafka

**Configuration:** src/helpers/kafka.ts

**Producer Mode:**
```typescript
import { kafka } from '../helpers';

kafka.send({ orderId: '123', total: 59.99 }, 'orders');
```

**Consumer Mode:**
```typescript
kafka.consume((topic, message) => {
  console.log(`Received from ${topic}:`, message);
});
```

**Status:** Configured but not actively used in business logic

### Redis

**Configuration:** src/helpers/redis.ts

**Usage:**
```typescript
import { redis } from '../helpers';

await redis.set('key', 'value');
const value = await redis.get('key');
await redis.del('key');
```

**Status:** Initialized but not integrated into request flow

---

## Development Guide

### Adding a New Resource

Use the generator:
```bash
npm run create
# Follow prompts to generate resource files
```

Or manually:

1. **Define Prisma Model** (prisma/schema.prisma)
```prisma
model Example {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

2. **Run Migration**
```bash
yarn db:migrate
```

3. **Create Controller** (src/controllers/example.ts)
```typescript
import { Example as Build } from '@prisma/client';
import { ControllerFactory } from '../helpers';

class Controller extends ControllerFactory<Build> {
  constructor() {
    super('example');
  }
}

export default new Controller();
```

4. **Create Service** (src/services/example.ts)
```typescript
import { Example as Build } from '@prisma/client';
import { Example as Controller } from '../controllers';
import { ServiceFactory } from '../helpers';

class Service extends ServiceFactory<Build> {}

export default new Service(Controller);
```

5. **Create Schema** (src/schemas/example.ts)
```typescript
export const create = {
  tags: ['Example'],
  body: {
    type: 'object',
    properties: {
      name: { type: 'string' }
    },
    required: ['name']
  }
};

// Add search, find, getOrDelete, update schemas...
```

6. **Create Routes** (src/routes/example.ts)
```typescript
import { FastifyPluginCallback } from 'fastify';
import { Example as Service } from '../services';
import { Example as Schema } from '../schemas';
import { auth } from '../utils';

const routes: FastifyPluginCallback = server => {
  server.route({
    method: 'POST',
    url: '/',
    schema: Schema.create,
    preHandler: auth,
    handler: async (request, reply) => {
      const result = await Service.create(request.body);
      reply.send({ data: result });
    }
  });

  // Add other routes...
};

export default routes;
```

7. **Register Routes** (src/routes/index.ts)
```typescript
import example from './example';

export default function (server: FastifyInstance) {
  server.register(example, { prefix: '/example' });
}
```

### Running Tests

```bash
yarn test              # Run tests in watch mode
yarn test -- --coverage # Run with coverage report
```

### Database Management

```bash
yarn db:gen            # Generate Prisma client
yarn db:migrate        # Create and apply migration
yarn db:deploy         # Deploy migrations (production)
yarn db:reset          # Reset database and re-seed
```

### Viewing Logs

Logs are written to:
- Console (color-coded)
- `src/logs/error.log` (errors only)
- `src/logs/server.log` (info level)
- `src/logs/warnings.log` (warnings only)

### API Documentation

Access Swagger UI at `http://localhost:3000/docs`

Auto-generated from route schemas.

---

## Known Issues & TODOs

### Security Concerns
- [ ] Card numbers and CVV stored in plaintext (should encrypt)
- [ ] AUTH_ENABLED can disable authentication entirely (remove for production)
- [ ] CORS_ORIGIN default is `*` (should restrict to specific origins)

### Contract Mismatches (see CONTRACTS.md)
- [ ] Login response format differs from frontend expectation
- [ ] Order request/response format differs from frontend expectation
- [ ] Product IDs are UUIDs (string) but frontend expects numbers
- [ ] Order validation incomplete (missing totalAmount verification)

### Code Quality
- [ ] Email branding shows "Edengo" instead of "Soul Shop"
- [ ] Console.log() mixed with structured logging
- [ ] Redis initialized but unused (remove or integrate)
- [ ] Kafka configured but not used in business logic

### Testing
- [ ] Add comprehensive unit tests
- [ ] Add integration tests for API endpoints
- [ ] Add E2E tests for complete flows

---

## Useful Commands

```bash
# Development
yarn dev                    # Start dev server with hot reload
yarn build                  # Compile TypeScript
yarn start                  # Run compiled code

# Database
yarn db:gen                 # Generate Prisma client
yarn db:migrate             # Create and apply migration
yarn db:deploy              # Deploy migrations
yarn db:reset               # Reset database

# Code generation
yarn create                 # Generate new resource

# Testing
yarn test                   # Run tests
yarn test -- --coverage     # Run with coverage
```

---

## Support & Documentation

- **API Docs:** http://localhost:3000/docs
- **Frontend Contract:** See CONTRACTS.md
- **Prisma Docs:** https://www.prisma.io/docs
- **Fastify Docs:** https://fastify.dev

---

**For AI Assistants:** This codebase uses a factory pattern for CRUD operations. When adding new features, follow the established patterns in controllers/, services/, and routes/. Always update schemas/ for request validation. The main complexity is in the Order service which handles email generation and product linking.
