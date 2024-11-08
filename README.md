# MyWasteWatch - Waste Management Information System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Node.js Version](https://img.shields.io/badge/node-v22.0_LTS-green)
![MongoDB Version](https://img.shields.io/badge/mongodb-v4.4-green)

MyWasteWatch is a comprehensive web-based waste management system designed to streamline waste collection operations, optimize routes, and provide real-time analytics for better decision-making.

## 🚀 Features

- User authentication and role-based access control
- Real-time waste collection scheduling
- Route optimization for waste collectors
- Interactive analytics dashboard
- Mobile-responsive design
- RESTful API architecture

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Docker & Docker Compose
- Git
- Node.js 22.0 LTS (for local development)
- MongoDB 4.4 (for local development)

## 🛠 Installation

### Using Docker (Recommended)

1. Clone the repository
```bash
git clone https://github.com/AllanMusinguzi/mwwmsdb.git
cd mwwmsdb
```

2. Create environment file
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
```env
PORT=3000
MONGODB_URI=mongodb://mongo:27017/mwwmsdb
SECRET_KEY=your_secret_key
NODE_ENV=development
```

4. Build and run with Docker Compose
```bash
docker-compose up --build -d
```

### Manual Installation

1. Clone the repository
```bash
git clone https://github.com/AllanMusinguzi/mwwmsdb.git
cd mwwmsdb
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the application
```bash
npm run dev  # For development
npm start    # For production
```

## 🌐 API Documentation

The API documentation is available at `/api/docs` when running the application. Key endpoints include:

```
POST   /api/auth/register    - User registration
POST   /api/auth/login       - User authentication
GET    /api/collections      - List waste collections
POST   /api/collections      - Schedule new collection
GET    /api/routes          - Get optimized routes
GET    /api/analytics       - Get system analytics
```

## 📦 Project Structure

```
mwwmsdb/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── models/        # Database models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   ├── utils/         # Utility functions
│   └── app.js         # Application entry point
├── docker/            # Docker configuration files
├── tests/            # Test files
├── .env.example      # Example environment variables
├── docker-compose.yml # Docker compose configuration
└── package.json      # Project dependencies
```

## 🚀 Deployment

### Production Deployment

1. Transfer files to your production server:
```bash
scp -r mwwmsdb user@server_ip:/path/to/destination
```

2. SSH into your server:
```bash
ssh user@server_ip
```

3. Navigate to project directory and start:
```bash
cd /path/to/destination/mwwmsdb
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Configuration

Configure the following environment variables for production:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://mongo:27017/mwwmsdb
SECRET_KEY=your_secure_secret_key
```

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Auth Tests"

# Generate coverage report
npm run test:coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🔍 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB container is running: `docker ps`
   - Verify MongoDB URI in `.env`
   - Check network connectivity between containers

2. **Application Not Starting**
   - Verify all required environment variables are set
   - Check application logs: `docker-compose logs app`
   - Ensure ports are not already in use

3. **Docker Build Failed**
   - Clear Docker cache: `docker system prune`
   - Check Dockerfile syntax
   - Verify all required files are present

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- MongoDB team for excellent database solution
- Docker team for containerization platform
- Express.js team for the web framework
- All contributors who have helped with the project

## 📞 Contact

Allan Musinguzi - [@AllanMusinguzi](https://twitter.com/AllanMusinguzi)

Project Link: [https://github.com/AllanMusinguzi/mwwmsdb](https://github.com/AllanMusinguzi/mwwmsdb)