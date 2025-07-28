# 🚀 Ultimate TypeScript Full Stack Starter

## 🌟 Overview

Welcome to the Ultimate TypeScript Full Stack Starter! This comprehensive toolkit provides a robust foundation for building scalable, feature-rich applications using the MERN (MySQL, Express, React, Node.js) stack with TypeScript.

### 🎯 Why Choose This Starter?

- **Full Stack**: Covers both backend (Express.js) and frontend (Next.js) development
- **TypeScript**: Enjoy the benefits of static typing and improved developer experience
- **Batteries Included**: Packed with essential features and best practices
- **Scalable**: Designed to grow with your project needs
- **Modern**: Utilizes the latest technologies and patterns

## 🛠 Tech Stack

- **Database**: MySQL with Prisma ORM
- **Backend**: Express.js
- **Frontend**: Next.js (Server-side rendering, Static site generation, Client-side rendering)
- **Language**: TypeScript
- **Containerization**: Docker

## 🔑 Key Features

### 🖥 Backend

- **Authentication**: Secure bearer sessions and OAuth (Google, Facebook, Twitter, GitHub) via Passport.js
- **Authorization**: Fine-grained access control with CASL
- **Validation**: Request validation using Zod
- **Error Handling**: Comprehensive error management system
- **Logging**: Advanced logging with Pino and log rotation
- **File Management**: S3 integration for file and video uploads
- **Video Processing**: Conversion to browser-compatible formats with FFmpeg
- **Caching**: Redis integration for improved performance
- **Rate Limiting**: API protection with express-rate-limit
- **Background Processing**: Efficient task handling with BullMQ and node-cron
- **Internationalization**: Multi-language support with i18n
- **API Documentation**: Swagger integration
- **Events**: Powerful event handling with EventEmitter2

### 🎨 Frontend

- **UI Framework**: React with Next.js
- **Styling**: Tailwind CSS
- **State Management**: zustand
- **Form Handling**: React Hook Form

### 🔒 Security

- CORS protection
- Secure authentication
- Request validation
- Rate limiting

### ⚡ Performance

- `esbuild` bundling for faster builds
- Hot-reload for rapid development
- Redis caching
- Optimized architecture

### 💻 Developer Experience

- Docker support for easy setup and deployment
- Code formatting with `Prettier`
- Linting with `ESLint`

## 🚀 Getting Started

1. **Clone the repository**

   ```
   git clone https://github.com/ghostlexly/ultimate-typescript-starter-kit.git
   cd ultimate-typescript-starter-kit
   ```

2. **Set up environment variables**
   Copy `.env.template` to `.env` and fill in your values

3. **Install dependencies**

   ```
   cd backend
   npm install

   cd ../frontend
   npm install
   ```

4. **Start the development environment**

   ```
   docker compose up
   ```

5. **Access the application**
   - Frontend: http://localhost
   - Backend: http://localhost/api/
   - Swagger Docs: http://localhost/api/swagger

## 📚 Documentation

For detailed documentation on each feature and how to use this starter kit, please refer to our [Wiki](https://github.com/ghostlexly/ultimate-typescript-starter-kit/wiki).

## 🤝 Contributing

We welcome contributions!

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 🙏 Acknowledgements

- See backend [README](./backend/README.md) for more details.
- See frontend [README](./frontend/README.md) for more details.

## 📞 Support

If you have any questions or need help, please [open an issue](https://github.com/ghostlexly/ultimate-typescript-starter-kit/issues) or contact our team at contact@lunisoft.fr.

---

Happy coding! 🎉 Don't forget to star ⭐ this repo if you find it useful!
