# Souled Store

A full stack e-commerce clothing store built with the MERN stack. Buyers can browse products and pay online; sellers get their own dashboard to list products with multiple images and variants.

## Features

- **Authentication:** register and login with JWT, with a "register as a seller" option
- **Role-based access:** protected routes for logged-in users, and seller-only pages (dashboard, product creation)
- **Seller dashboard:** view and manage your own listed products
- **Product creation:** upload multiple product images, stored on ImageKit's CDN (Multer parses the upload, ImageKit hosts it)
- **Product variants:** add variants to a product, with or without images
- **Product details page:** dynamic route per product (`/product/:id`)
- **Payments:** Razorpay checkout with server-side payment verification (test mode)
- **Responsive UI:** built with Tailwind CSS

## Tech Stack

**Frontend**
- React (Vite)
- Redux Toolkit for state management
- React Router
- Axios
- Tailwind CSS

**Backend**
- Node.js and Express
- MongoDB with Mongoose
- JWT authentication
- Multer for multipart file uploads
- ImageKit for image storage and delivery
- Razorpay for payments

## Getting Started

### Prerequisites

- Node.js v20+
- A MongoDB Atlas cluster (or local MongoDB)
- An ImageKit account
- A Razorpay account (test mode keys are fine)

### Installation

```bash
git clone https://github.com/Deepen09-byte/Souled-Store.git
cd Souled-Store
```

Install dependencies for both apps:

```bash
cd Backend && npm install
cd ../Frontend && npm install
```

### Environment Variables

Create a `.env` file in `Backend/`:

```dotenv
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Never commit `.env`. Make sure it is listed in `.gitignore`.

### Run locally

Start the backend:

```bash
cd Backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd Frontend
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend on port 3000 (configured in `vite.config.js`).

## Troubleshooting

**`querySrv ECONNREFUSED` on Windows with Node v24.13+:** a known Node.js DNS regression that breaks `mongodb+srv://` connections. Add this before `mongoose.connect()`:

```js
import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
```

**ImageKit "invalid value for folder parameter":** folder paths must start with `/` and should avoid spaces, for example `/souled-store`.

## Author

Built by [Deepen](https://github.com/Deepen09-byte).
