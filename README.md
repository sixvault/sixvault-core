# 🔐 SixVault

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21+-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.9+-purple.svg)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue.svg)](https://www.docker.com/)

*A secure, role-based academic transcript management system with multi-cryptographic protection*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation) • [Security](#-security)

</div>

---

## 📋 Overview

**SixVault** is a comprehensive academic transcript management system designed to protect the confidentiality, integrity, and authenticity of student data through advanced cryptographic techniques. The system implements a multi-layered security approach combining **AES encryption**, **RSA digital signatures**, and **Shamir's Secret Sharing** to ensure data protection in collaborative educational environments.

## ✨ Features

### 🔒 Security Features
- **Multi-Cryptographic Protection**: AES-256 encryption, RSA digital signatures, and Shamir's Secret Sharing
- **Role-Based Access Control**: Granular permissions for different user types (students, faculty, admin)
- **JWT Authentication**: Secure token-based authentication system
- **Digital Signatures**: RSA-based document signing and verification
- **Secret Sharing**: Distributed key management using Shamir's algorithm

### 📚 Academic Management
- **Student Transcript Management**: Complete academic record handling
- **Course Management**: Comprehensive course and subject administration
- **Grade Management**: Secure grade recording and transcript generation
- **User Management**: Multi-role user system with proper authorization
- **PDF Generation**: LaTeX-based transcript document generation

### 🛠 System Features
- **RESTful API**: Well-documented API endpoints with OpenAPI/Swagger
- **Cloud Storage**: Cloudflare R2 integration for secure file storage
- **Database ORM**: Prisma-based database management with migrations
- **Docker Support**: Containerized deployment with Docker Compose
- **File Upload**: Secure multi-part file upload handling

## 🚀 Tech Stack

### Backend & Runtime
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Prisma** - Modern database ORM and toolkit

### Security & Cryptography
- **Custom AES Implementation** - Advanced Encryption Standard
- **Custom RSA Implementation** - Public-key cryptography for digital signatures
- **Shamir's Secret Sharing** - Threshold cryptography for key management
- **JWT (jsonwebtoken)** - JSON Web Token authentication
- **bcrypt/crypto** - Password hashing and cryptographic operations

### Storage & File Management
- **Cloudflare R2** - S3-compatible object storage
- **AWS SDK S3** - Cloud storage client library
- **Multer** - Multipart/form-data handling for file uploads

### Documentation & Development
- **Swagger/OpenAPI** - API documentation and testing interface
- **LaTeX (node-latex)** - Document generation for transcripts
- **Docker & Docker Compose** - Containerization and orchestration
- **Nodemon** - Development auto-restart utility

### Database
- **Prisma Client** - Type-safe database client
- **Database Migrations** - Version-controlled schema management

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Docker & Docker Compose (optional)
- Database (PostgreSQL/MySQL/SQLite)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/sixvault/sixvault-core.git
cd sixvault-core
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Database Setup**
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy
```

5. **Start the development server**
```bash
npm run dev
```

### Docker Deployment

1. **Using Docker Compose**
```bash
docker-compose up -d
```

2. **Build and run manually**
```bash
docker build -t sixvault .
docker run -p 8080:8080 sixvault
```

## 🎯 Usage

### Development Commands

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Run Prisma Studio (Database GUI)
npm run studio

# Run both development server and Prisma Studio
npm run dev:all
```

### API Access

- **Main API**: `http://localhost:8080`
- **API Documentation**: `http://localhost:8080/api-docs`
- **Prisma Studio**: `http://localhost:5555`

## 📖 API Documentation

The application provides comprehensive API documentation through Swagger/OpenAPI:

- **Interactive Documentation**: Available at `/api-docs` endpoint
- **OpenAPI Specification**: See `openapi.yaml` for complete API specs
- **Authentication**: JWT-based authentication required for protected endpoints

### Key API Endpoints

```
POST   /auth/login          # User authentication
GET    /transcripts         # List user transcripts
POST   /transcripts         # Generate new transcript
GET    /students/:id        # Get student information
POST   /upload              # File upload endpoint
```

## 🔐 Security

### Cryptographic Implementation

SixVault implements multiple layers of cryptographic protection:

#### 1. AES Encryption (app/utils/crypto/AES.js)
- **Algorithm**: AES-128/256 with custom implementation
- **Usage**: Data encryption at rest and in transit
- **Key Management**: Integrated with Shamir's Secret Sharing

#### 2. RSA Digital Signatures (app/utils/crypto/RSA.js)
- **Key Size**: 1024/2048-bit RSA keys
- **Usage**: Document signing and verification
- **Features**: Deterministic key generation from seeds

#### 3. Shamir's Secret Sharing (app/utils/crypto/Shamir.js)
- **Threshold**: Configurable (n,k) threshold scheme
- **Usage**: Distributed key management
- **Integration**: AES key reconstruction and distribution

### Security Best Practices

- **JWT Token Management**: Secure token generation and validation
- **Role-Based Access**: Granular permission system
- **Input Validation**: Comprehensive request validation
- **Secure Headers**: Security middleware implementation
- **Environment Variables**: Sensitive data protection

## 🗄 Database Schema

The application uses Prisma ORM with the following key entities:

- **Users**: Authentication and authorization
- **Students**: Student information and academic records
- **Transcripts**: Academic transcript data
- **Courses**: Course and subject management
- **Grades**: Academic performance records
- **Signatures**: Digital signature verification

## 🐳 Deployment

### Production Deployment

1. **Environment Setup**
```bash
# Set production environment variables
export NODE_ENV=production
export DATABASE_URL="your-database-url"
export JWT_SECRET="your-jwt-secret"
```

2. **Database Preparation**
```bash
npx prisma migrate deploy
npx prisma generate
```

3. **Start Production Server**
```bash
npm start
```

### Docker Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**Sixvault Developers** - [dev@sixvault.xyz](mailto:dev@sixvault.xyz)

## 🙏 Acknowledgments

- Thanks to the cryptography community for security best practices
- Academic institutions for requirements and feedback
- Open source contributors and maintainers

---

<div align="center">

**Built with ❤️ for secure academic data management**

[⬆ Back to Top](#-sixvault)

</div>
