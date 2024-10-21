# NestJS Backend for Parking Booking System

This is the backend server for the Parking Booking System, built with NestJS and PostgreSQL. It provides RESTful APIs for managing parking bookings and related data.

## Table of Contents
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Database](#database)
- [Validation](#validation)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Deployment](#deployment)

## Technologies Used

- [NestJS](https://nestjs.com/) - A progressive Node.js framework for building efficient and scalable server-side applications
- [PostgreSQL](https://www.postgresql.org/) - Open source relational database
- [TypeORM](https://typeorm.io/) - ORM for TypeScript and JavaScript
- [typeorm-extensions](https://github.com/typeorm-extensions/typeorm-extensions) - Additional features for TypeORM, including seeding
- [class-validator](https://github.com/typestack/class-validator) - Decorator-based property validation for classes
- [Day.js](https://day.js.org/) - Lightweight JavaScript date library
- [Sentry](https://sentry.io/) - Error tracking and performance monitoring
- [Docker](https://www.docker.com/) - Containerization platform
- [GitHub Actions](https://github.com/features/actions) - CI/CD platform

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or later)
- npm (v6 or later) or Yarn
- Docker and Docker Compose
- PostgreSQL (for local development)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/your-username/parking-booking-backend.git
   cd parking-booking-backend
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the necessary environment variables.

4. Run the development server:
   ```
   npm run start:dev
   # or
   yarn start:dev
   ```

The server will be running at `http://localhost:3000`.

## Project Structure

```
parking-booking-backend/
├── .github/
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/
├── .vscode/
├── coverage/
├── dist/
├── node_modules/
├── src/
│   ├── auth/
│   ├── booking/
│   ├── database/
│   ├── decorators/
│   ├── factories/
│   ├── image/
│   ├── mail/
│   ├── migrations/
│   ├── parkingLocation/
│   ├── parkingService/
│   ├── parkingSlot/
│   ├── parkingSlotType/
│   ├── partner/
│   ├── partnerType/
│   ├── payment/
│   ├── paymentMethod/
│   ├── paymentRecord/
│   ├── pricingOption/
│   ├── role/
│   ├── seeds/
│   ├── statistics/
│   ├── user/
│   ├── utils/
│   ├── app.controller.spec.ts
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── Dockerfile
├── docker-compose.yml
├── .env
├── nest-cli.json
├── package.json
└── README.md
```

## Database

This project uses PostgreSQL as the database, hosted on [Aiven](https://aiven.io/). TypeORM is used as the ORM, with migrations for managing database schema changes.

To run migrations:

```
npm run migration:run
# or
yarn migration:run
```

To create a new migration:

```
npm run migration:create -- -n MigrationName
# or
yarn migration:create -n MigrationName
```

## Validation

DTO (Data Transfer Object) validation is performed using `class-validator`. Decorators are used to define validation rules on DTO classes.

## Error Handling

[Sentry](https://sentry.io/) is integrated for error tracking and performance monitoring. Errors are automatically captured and sent to Sentry for analysis.

## Testing

To run tests:

```
npm run test
# or
yarn test
```

For e2e tests:

```
npm run test:e2e
# or
yarn test:e2e
```

## Deployment

This project is deployed using Docker and GitHub Actions. The backend is hosted on [Render](https://render.com/).

1. The `Dockerfile` in the root directory defines the container configuration.
2. `docker-compose.yml` is used for local development and testing.
3. GitHub Actions workflows in `.github/workflows/` automate the CI/CD process:
   - Run tests
   - Build Docker image
   - Push to container registry
   - Deploy to Render

To deploy manually:

1. Build the Docker image:
   ```
   docker build -t parking-booking-backend .
   ```

2. Push the image to your container registry.

3. Update the deployment on Render with the new image.

For more detailed instructions on deploying to Render, refer to the [Render Documentation](https://render.com/docs).