# Error Logging Platform

> A production-ready, full-stack error logging and monitoring platform for tracking, analyzing, and resolving application errors in real time.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://python.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com/)

---

## 🚀 Overview

Error Logging Platform is a comprehensive observability solution designed for engineering teams that need to catch, categorize, and resolve application errors before they impact users. Built with a modular microservices architecture, it combines a Node.js/Express API, a Python/FastAPI analytics engine, and a React dashboard — all orchestrated with Docker Compose.

### Core Capabilities

| Feature | Description |
|---------|-------------|
| 📊 **Real-time error tracking** | Capture errors with full stack traces, request context, and metadata |
| 🎯 **Severity categorization** | Classify errors as critical, high, medium, low, or info |
| 📈 **Analytics dashboard** | Visualize error trends, severity distributions, and route health |
| 🏗️ **Multi-project support** | Isolate errors by project with independent API keys |
| 🔐 **Auth & RBAC** | JWT authentication with admin/developer/viewer roles |
| 🔔 **Notifications** | Email, Slack, and webhook alerts for critical errors |
| 🔍 **Duplicate detection** | Fingerprint-based deduplication with occurrence counting |
| ⚡ **Spike detection** | Statistical anomaly detection for error rate spikes |
| 🐳 **Docker-ready** | One-command deployment with Docker Compose |

---

## 🏗️ Architecture

```
Error-Logging-Platform/
├── backend/           # Express.js API server (Node.js)
├── analytics/         # Analytics & spike detection (Python/FastAPI)
├── frontend/          # React.js dashboard application
├── database/          # MySQL schema, seed data, and archive procedures
├── tests/             # Integration tests
├── docker-compose.yml # Multi-service orchestration
└── README.md
```

**Service endpoints:**
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000/api`
- Analytics API: `http://localhost:8000/api/analytics`

---

## 🛠️ Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/Error-Logging-Platform.git
cd Error-Logging-Platform

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Start all services
docker-compose up -d

# Access the application
# Frontend:  http://localhost:8080
# Backend:   http://localhost:3000
# Analytics: http://localhost:8000
```

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

#### Analytics Service
```bash
cd analytics
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📚 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `GET` | `/api/auth/me` | Get current user profile |
| `POST` | `/api/auth/refresh` | Refresh access token |

### Error Logs
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/error-logs` | List errors with filtering & pagination |
| `POST` | `/api/error-logs` | Create a new error log |
| `GET` | `/api/error-logs/:id` | Get error details |
| `PATCH` | `/api/error-logs/:id/status` | Update error status |
| `DELETE` | `/api/error-logs/:id` | Delete an error (admin) |
| `POST` | `/api/error-logs/:id/comments` | Add a comment |
| `GET` | `/api/error-logs/:id/comments` | Get comments for an error |
| `GET` | `/api/error-logs/summary` | Get error statistics |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/analytics/hourly` | Hourly error distribution |
| `GET` | `/api/analytics/daily` | Daily error distribution |
| `GET` | `/api/analytics/routes` | Errors by route |
| `GET` | `/api/analytics/severity` | Severity breakdown |
| `GET` | `/api/analytics/spikes` | Error rate spike detection |
| `GET` | `/api/analytics/top-routes` | Top failing routes |
| `GET` | `/api/analytics/summary` | Overall statistics |
| `GET` | `/api/analytics/comparison` | Period-over-period comparison |

---

## ⚙️ Configuration

Copy `.env.example` to `.env` and adjust the values:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development` |
| `APP_PORT` | Backend server port | `3000` |
| `JWT_SECRET` | Secret for signing JWT tokens | *(required)* |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | *(required)* |
| `DB_NAME` | Database name | `error_logging_platform` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `ANALYTICS_PORT` | Analytics service port | `8000` |
| `SMTP_HOST` | SMTP server for email alerts | *(optional)* |

---

## 🗄️ Database Schema

The platform uses MySQL 8.0 with the following core tables:

- **users** — Authentication and role-based access control
- **projects** — Multi-project isolation with API keys
- **error_logs** — Error records with fingerprints for deduplication
- **error_events** — Occurrence tracking for repeated errors
- **comments** — Team collaboration on error resolution
- **notifications** — Alert configuration per user
- **audit_logs** — Immutable action history

Indexes are optimized for high-volume writes and analytical queries. Stored procedures in `database/archive.sql` handle archiving old resolved errors.

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Analytics tests
cd analytics
pytest
```

---

## 📦 Deployment

### Docker Compose (Production)
```bash
docker-compose -f docker-compose.yml up -d --build
```

### Environment Variables for Production
Set these in your deployment environment:
- `NODE_ENV=production`
- `JWT_SECRET` — strong, randomly generated secret
- `DB_PASSWORD` — strong database password
- `SMTP_*` — email notification credentials

---

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code passes linting and tests before submitting.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

Built with:
- [Express.js](https://expressjs.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://reactjs.org/)
- [Chart.js](https://www.chartjs.org/)
- [MySQL](https://www.mysql.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)

---

> **Maintained by** [Your Name](https://github.com/YOUR_USERNAME) •  
> **Stars**: ⭐ Star this repo if you find it useful! •  
> **Issues**: 🐛 Report bugs via GitHub Issues