# E-Commerce Backend

Node.js + Express backend for an e-commerce store with:

- JWT authentication
- User roles (`customer`, `admin`)
- Categories and products
- Shopping cart
- Order creation
- Product filtering, search, sorting, and pagination

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create your environment file:

```bash
copy .env.example .env
```

3. Update `.env` with your MongoDB connection string and JWT secret.

4. Start the server:

```bash
npm run dev
```

## API Base URL

`/api`

## Main Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/categories`
- `POST /api/categories`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `GET /api/cart`
- `POST /api/cart`
- `POST /api/orders`
- `GET /api/orders/my-orders`

## Notes

- Protected routes require `Authorization: Bearer <token>`.
- Admin routes require a user with role `admin`.

## Seed Sample Products

Run `npm run seed` to create 5 demo products and an admin user (`admin@example.com` / `admin123`).
