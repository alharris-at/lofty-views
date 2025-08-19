# 🏔️ Lofty Views API

A modern REST API for managing scenic view collections built with Express.js and TypeScript.

## 🌟 Introduction

Lofty Views API is a backend service for managing and sharing scenic view collections. Users can create, browse, and interact with view entries that represent beautiful locations with images, descriptions, and community engagement through "hearts".

## 💡 What It Does

This API enables:

- 🏞️ **View Management**: Create and manage scenic view entries with rich metadata
- 👥 **User System**: Full user lifecycle management with secure authentication patterns
- ❤️ **Community Features**: Heart/like system for popular views
- 📍 **Location Data**: Geographic information for each view
- 🔍 **Discovery**: Browse and search through view collections

## 🚀 Features

### Core API Endpoints

- **Views Management**
  - `GET /lofty-views` - List all scenic views
  - `GET /lofty-views/:id` - Get specific view details
  - `POST /lofty-views` - Create new view entries
- **User Management**
  - `GET /users` - List users
  - `GET /users/:id` - Get user details
  - `POST /users` - Create new users
  - `DELETE /users/:id` - Remove users

### Technical Features

- 🏗️ **Clean Architecture**: Feature-based organization with layered design
- 🔒 **Security First**: Helmet, CORS, and rate limiting built-in
- ✅ **Type Safety**: Full TypeScript with Zod validation
- 📊 **Observability**: Structured logging with Pino
- 🧪 **Testing**: Comprehensive test suite with Vitest
- 📝 **Documentation**: Interactive API docs with Swagger UI
- 🐳 **Containerized**: Docker-ready for easy deployment

## 🛠️ Getting Started

### Step-by-Step Guide

#### Step 1: 🚀 Initial Setup

- Clone the repository
- Navigate to project directory
- Install dependencies: `pnpm install`

#### Step 2: ⚙️ Environment Configuration

- Create `.env`: Copy `.env.template` to `.env`
- Update `.env`: Fill in necessary environment variables

#### Step 3: 🏃‍♂️ Running the Project

- Development Mode: `pnpm start:dev`
- Building: `pnpm build`
- Production Mode: Set `NODE_ENV="production"` in `.env` then `pnpm build && pnpm start:prod`

## 🗺️ API Overview

The Lofty Views API follows RESTful principles with a focus on scenic view management:

### View Model

```typescript
{
  id: number;
  name: string;
  description: string;
  location: string;
  imageUrl: string;
  hearts: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Response Format

All endpoints return standardized responses:

```typescript
{
  success: boolean;
  message: string;
  responseObject: T | null;
  statusCode: number;
}
```

## 🎯 Development Status

This project demonstrates modern API development practices and is actively being developed with:

- ✅ User management system (complete)
- 🚧 Lofty views CRUD operations (in progress)
- 📋 Community features (planned)

## 🏗️ Architecture

```
src/
├── api/                    # Feature-based API modules
│   ├── healthCheck/        # Health check endpoints
│   ├── user/              # User management (complete)
│   └── lofty-views/       # View management (planned)
├── api-docs/              # OpenAPI/Swagger documentation
├── common/                # Shared utilities and middleware
└── server.ts              # Express server configuration
```

Built with Express.js, TypeScript, Zod validation, and comprehensive testing.
