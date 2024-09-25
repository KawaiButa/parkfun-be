# PARKFUN - NestJS Parking Lot Booking Server

PARKFUN is a robust NestJS server application designed to help drivers easily search for and book parking lots. This README provides essential information for setting up, running, and contributing to the project.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)

## Features

- User authentication and authorization
- Search for nearby parking lots based on location
- Real-time parking lot availability
- Booking and reservation system
- Payment integration
- User reviews and ratings for parking lots
- Admin panel for parking lot management

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14.x or later)
- npm (v6.x or later)
- PostgreSQL (v12.x or later)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/parkfun.git
   cd parkfun
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Configuration

1. Create a `.env` file in the root directory based on the `.env.example` file.
2. Update the environment variables with your specific configuration:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/parkfun
   JWT_SECRET=your_jwt_secret_key
   PORT=3000
   ```

## Running the App

To start the server in development mode:

```
npm run start:dev
```

For production:

```
npm run build
npm run start:prod
```

The server will be running at `http://localhost:3000` (or the port you specified in the `.env` file).

## API Documentation

API documentation is generated using Swagger. After starting the server, you can access the Swagger UI at:

```
http://localhost:3000/api-docs
```