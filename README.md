# Orderker - Full-Stack E-Commerce Platform

<div align="center">

![Orderker](https://img.shields.io/badge/E--Commerce-Full--Stack-blue?style=for-the-badge)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61dafb?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-Vite-646cff?style=for-the-badge&logo=react)

A modern, feature-rich e-commerce platform with a mobile app, admin dashboard, and robust REST API. Built with cutting-edge technologies and production-ready infrastructure.

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Project Structure](#project-structure) • [Documentation](#documentation)

</div>

---

## ✨ Features

### Mobile App (React Native + Expo)
- ✅ **Fully Functional E-Commerce Mobile App** with intuitive UI/UX
- 🔐 **Secure Authentication** with Clerk (Google & Apple sign-in support)
- 🛒 **Complete Shopping Flow** - Browse, Search, Cart, Checkout, Orders
- ❤️ **Wishlist/Favorites** - Save products for later
- 💳 **Stripe Payment Integration** - Secure, PCI-compliant payments
- 📍 **Address Management** - Multiple delivery addresses
- 📦 **Order Tracking** - Real-time order status updates
- ⭐ **Product Reviews & Ratings** - User feedback system
- 🔔 **Push Notifications** - Order and promotion alerts
- 📱 **Responsive Design** - Optimized for all screen sizes

### Admin Dashboard (React + Vite)
- 📊 **Live Analytics Dashboard** - Real-time KPIs and insights
- 📈 **Advanced Analytics** with charts and data visualization
- 👥 **Customer Management** - View, segment, and analyze customers
- 🏆 **RFM Segmentation** - Champions, Loyal, At Risk, New customers
- 📦 **Product Management** - CRUD operations with image handling
- 🛍️ **Order Management** - Track, update, and manage orders
- 📊 **Sales Reports** - Monthly revenue trends and insights
- 🏷️ **Inventory Management** - Monitor stock levels
- 👨‍💼 **Admin-Only Routes** - Role-based access control
- 🎨 **Modern UI** - DaisyUI components with TailwindCSS
- 📱 **Responsive Design** - Works on desktop and tablet

### REST API (Node.js + Express)
- 🔐 **Complete Authentication System** - JWT + Clerk integration
- 🛡️ **Role-Based Access Control** - Admin & User roles
- 📦 **Full CRUD Operations** for Products, Orders, Users
- 🔄 **Advanced Filtering & Pagination** - Efficient data retrieval
- 💾 **Database Integration** - Scalable data management
- 🖼️ **Image Processing** - Cloudinary integration
- 🔔 **Background Jobs** - Inngest for async operations
- ⚙️ **Email Notifications** - Order confirmations, alerts
- 📊 **Advanced Analytics Endpoints** - KPIs, trends, customer insights
- 🚀 **Production-Ready** - Error handling, validation, security

### Developer Experience
- 🔍 **Error Tracking** - Sentry integration for monitoring
- 🌐 **Git Workflow** - Branches, commits, PRs, code reviews
- 🤖 **Code Analysis** - CodeRabbit PR analysis for quality
- 📦 **Modern Stack** - Latest libraries and best practices
- 🎯 **TypeScript-Ready** - Type-safe development
- 🧪 **Scalable Architecture** - Ready for growth

---

## 🛠️ Tech Stack

### Frontend & Mobile
| Technology | Purpose |
|-----------|---------|
| **React** | Web UI framework |
| **React Native + Expo** | Mobile app development |
| **Vite** | Ultra-fast build tool |
| **TailwindCSS** | Utility-first styling |
| **DaisyUI** | Component library |
| **TanStack Query** | Data fetching & caching |
| **Zustand** | State management (optional) |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM library |
| **JWT** | Authentication |
| **Clerk** | Auth0 alternative |

### Third-Party Services
| Service | Purpose |
|---------|---------|
| **Stripe** | Payment processing |
| **Cloudinary** | Image storage & optimization |
| **Clerk** | Authentication & user management |
| **Inngest** | Background jobs & workflows |
| **Sentry** | Error tracking & monitoring |

### DevOps & Deployment
| Tool | Purpose |
|------|---------|
| **Sevalla** | API & Admin hosting |
| **GitHub** | Version control & CI/CD |
| **CodeRabbit** | Automated code reviews |

---

## 🚀 Quick Start

### Prerequisites

Ensure you have the following installed:
- **Node.js** >= 20.0.0
- **npm** or **yarn**
- **Git**
- **Expo CLI** (for mobile development)

### 1. Clone the Repository

```bash
git clone https://github.com/MohammadAli-14/Orderker.git
cd Orderker
```

### 2. Environment Setup

Create `.env` files in each directory with the required credentials.

#### Backend (`.env` in `/backend`)

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_URL=mongodb://your-mongodb-connection-string

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Inngest Background Jobs
INNGEST_SIGNING_KEY=your_inngest_signing_key

# Cloudinary Image Management
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name

# Stripe Payment Processing
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Admin Configuration
ADMIN_EMAIL=admin@example.com

# Client URLs
CLIENT_URL=http://localhost:5173
```

#### Admin Dashboard (`.env` in `/admin`)

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API Configuration
VITE_API_URL=http://localhost:3000/api

# Sentry Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn
```

#### Mobile App (`.env` in `/mobile`)

```env
# Clerk Authentication
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# Stripe Payment
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Sentry Error Tracking
SENTRY_AUTH_TOKEN=your_sentry_auth_token
```

### 3. Install Dependencies

```bash
# Backend
cd backend
npm install

# Admin Dashboard
cd ../admin
npm install

# Mobile App
cd ../mobile
npm install
```

### 4. Run Development Servers

#### Start Backend API (Terminal 1)
```bash
cd backend
npm run dev
# API will run on http://localhost:3000
```

#### Start Admin Dashboard (Terminal 2)
```bash
cd admin
npm run dev
# Admin will run on http://localhost:5173
```

#### Start Mobile App (Terminal 3)
```bash
cd mobile
npm install
npx expo start
# Scan the QR code from your phone with Expo Go app
```

---

## 📁 Project Structure

```
Orderker/
├── backend/                    # Node.js + Express API
│   ├── src/
│   │   ├── models/            # MongoDB schemas
│   │   ├── routes/            # API endpoints
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, validation, error handling
│   │   ├── services/          # External integrations
│   │   └── config/            # Configuration files
│   ├── .env                   # Environment variables
│   └── package.json
│
├── admin/                     # React + Vite Admin Dashboard
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Dashboard pages
│   │   ├── services/         # API calls
│   │   ├── hooks/            # Custom React hooks
│   │   ├── context/          # Context providers
│   │   └── styles/           # Styling files
│   ├── .env                  # Environment variables
│   └── package.json
│
├── mobile/                   # React Native + Expo Mobile App
│   ├── app/                  # App navigation & screens
│   ├── components/           # Reusable components
│   ├── services/             # API & services
│   ├── hooks/                # Custom hooks
│   ├── context/              # Context providers
│   ├── assets/               # Images, fonts, etc.
│   ├── .env                  # Environment variables
│   └── package.json
│
└── README.md                 # This file
```

---

## 🔑 Key Features Explained

### Authentication Flow
- Users can sign up/login via Clerk with Google or Apple sign-in
- JWT tokens are issued and stored securely
- Admin users have elevated permissions for dashboard access
- Mobile app maintains session across app restarts

### Payment System
- Integrated Stripe for secure credit card processing
- Webhook handling for payment status updates
- Order confirmation emails after successful payment
- Support for multiple payment methods

### Product Management
- Admin can create, update, and delete products
- Image uploads with Cloudinary optimization
- SKU and inventory tracking
- Pricing and discount management

### Order Management
- Complete order lifecycle tracking
- Multiple address support for delivery
- Order status updates (Pending, Processing, Shipped, Delivered)
- Order history and reorder functionality

### Analytics & Insights
- Real-time KPI metrics (Total Customers, Revenue, etc.)
- Customer RFM Segmentation for targeted marketing
- Product performance analysis
- Monthly revenue trends
- Rating and review analytics

### Background Jobs
- Order confirmation emails via Inngest
- Inventory updates
- Customer notification workflows
- Scheduled maintenance tasks

---

## 🔐 Security Features

- ✅ **Authentication** - Clerk + JWT
- ✅ **Authorization** - Role-based access control
- ✅ **Data Encryption** - Secure password hashing
- ✅ **HTTPS** - All communications encrypted
- ✅ **Input Validation** - Server-side validation
- ✅ **Rate Limiting** - API rate limiting
- ✅ **CORS** - Configured cross-origin access
- ✅ **Error Monitoring** - Sentry for security insights

---

## 📊 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile

### Product Endpoints
- `GET /api/products` - Get all products (paginated)
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status (admin only)

### Analytics Endpoints
- `GET /api/analytics` - Get dashboard analytics (admin only)
- `GET /api/analytics/revenue` - Revenue data
- `GET /api/analytics/customers` - Customer insights

---

## 🚀 Deployment

### Deploy Backend API
```bash
# Using Sevalla or any Node.js hosting
npm run build
npm start
```

### Deploy Admin Dashboard
```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting
```

### Deploy Mobile App
```bash
# Build APK for Android
eas build --platform android

# Build IPA for iOS
eas build --platform ios
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

---

## 🐛 Monitoring & Debugging

- **Sentry** - Monitor errors in real-time
- **Browser DevTools** - Debug frontend issues
- **Network Tab** - Inspect API calls
- **Console** - Check for JavaScript errors
- **Server Logs** - Monitor backend activity

---

## 📚 Documentation

### API Documentation
- Postman Collection: [Link to your Postman collection]
- Swagger/OpenAPI: [If available]

### Developer Guides
- [Backend Setup Guide](./backend/README.md)
- [Admin Dashboard Guide](./admin/README.md)
- [Mobile App Guide](./mobile/README.md)

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 Git Workflow

This project follows a professional Git workflow:
- **Main** branch - Production-ready code
- **Develop** branch - Integration branch
- **Feature branches** - For new features
- **Pull Requests** - Code review before merge
- **CodeRabbit** - Automated PR analysis

---

## 📄 License

This project is licensed under the **ISC License**. See the LICENSE file for details.

---

## 👥 Authors

- **Mohammad Ali** - Lead Developer
- GitHub: [@MohammadAli-14](https://github.com/MohammadAli-14)

---

## 🙏 Acknowledgments

- Clerk for authentication infrastructure
- Stripe for payment processing
- Cloudinary for image management
- Inngest for background jobs
- Sentry for error tracking
- The open-source community

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/MohammadAli-14/Orderker/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MohammadAli-14/Orderker/discussions)
- **Email**: Contact via GitHub profile

---

## 🗺️ Roadmap

- [ ] Payment gateway additions (PayPal, Apple Pay)
- [ ] Advanced inventory management
- [ ] Multi-language support
- [ ] Enhanced mobile app features
- [ ] AI-powered recommendations
- [ ] Progressive Web App (PWA) version
- [ ] Subscription products
- [ ] Seller dashboard

---

<div align="center">

**Made with ❤️ by Mohammad Ali**

⭐ If you find this project helpful, please give it a star!

[⬆ Back to top](#orderker---full-stack-e-commerce-platform)

</div>