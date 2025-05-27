# nepCscore - Nepal Cricket Ecosystem Platform

A comprehensive grassroots cricket web platform designed specifically for Nepal, serving Fans, Organizers, Players, and Admins with role-based dashboards, live scoring, and community engagement features.

## 🏏 About nepCscore

nepCscore is a modern cricket ecosystem platform built to promote and organize cricket at the grassroots level in Nepal. The platform enables seamless interaction between different cricket stakeholders through specialized dashboards and features.

### Key Features

- **Multi-Role Support**: Dedicated interfaces for Fans, Organizers, Players, and Admins
- **Live Match Scoring**: Real-time score updates with ball-by-ball commentary
- **Team Management**: Complete team creation, player management, and approval systems
- **Player Statistics**: Comprehensive performance tracking and analytics
- **Tournament Organization**: End-to-end tournament management capabilities
- **Community Features**: Team applications, notifications, and social interactions

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **Real-time**: WebSocket support for live features
- **Build Tools**: Vite, ESBuild
- **State Management**: TanStack Query (React Query)

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed on your Linux system:

- **Node.js**: Version 18.x or higher
- **npm**: Version 8.x or higher
- **PostgreSQL**: Version 13.x or higher
- **Git**: Latest version

### Installing Prerequisites on Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Git (if not already installed)
sudo apt install git

# Verify installations
node --version
npm --version
psql --version
git --version
```

### Installing Prerequisites on CentOS/RHEL/Fedora

```bash
# Install Node.js and npm
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install nodejs npm

# Install PostgreSQL
sudo dnf install postgresql postgresql-server postgresql-contrib

# Initialize PostgreSQL
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Install Git
sudo dnf install git
```

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/nepcscore.git

# Navigate to the project directory
cd nepcscore

# Check the current status
git status
```

### 2. Install Dependencies

```bash
# Install all project dependencies
npm install

# Verify installation
npm list --depth=0
```

### 3. Database Setup

#### Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE nepcscore;
CREATE USER nepcscore_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nepcscore TO nepcscore_user;
ALTER USER nepcscore_user CREATEDB;

# Exit PostgreSQL
\q
```

#### Environment Variables

Create a `.env` file in the root directory:

```bash
# Create environment file
touch .env

# Edit the file with your preferred editor
nano .env
```

Add the following environment variables:

```env
# Database Configuration
DATABASE_URL="postgresql://nepcscore_user:your_secure_password@localhost:5432/nepcscore"
PGHOST=localhost
PGPORT=5432
PGDATABASE=nepcscore
PGUSER=nepcscore_user
PGPASSWORD=your_secure_password

# Application Configuration
NODE_ENV=development
PORT=5000
SESSION_SECRET=your_very_long_random_session_secret_key_here

# Frontend Configuration
VITE_API_URL=http://localhost:5000
```

#### Database Schema Migration

```bash
# Push database schema
npm run db:push

# Verify database connection
npm run db:check
```

### 4. Development Server

```bash
# Start the development server (both frontend and backend)
npm run dev

# The application will be available at:
# Frontend: http://localhost:5000
# Backend API: http://localhost:5000/api
```

### 5. Alternative: Start Services Separately

```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend development server
npm run client

# Terminal 3: Watch for database changes
npm run db:studio
```

## 🗄️ Database Management

### Essential Database Commands

```bash
# Push schema changes to database
npm run db:push

# Generate database migrations
npm run db:generate

# View database in browser (optional)
npm run db:studio

# Reset database (WARNING: This will delete all data)
npm run db:reset

# Backup database
pg_dump -h localhost -U nepcscore_user nepcscore > backup.sql

# Restore database
psql -h localhost -U nepcscore_user nepcscore < backup.sql
```

### Database Connection Troubleshooting

```bash
# Check PostgreSQL service status
sudo systemctl status postgresql

# Start PostgreSQL service
sudo systemctl start postgresql

# Enable PostgreSQL to start on boot
sudo systemctl enable postgresql

# Check if PostgreSQL is listening on port 5432
sudo netstat -tunlp | grep 5432

# Test database connection
psql -h localhost -U nepcscore_user -d nepcscore -c "SELECT version();"
```

## 🎯 User Roles & Features

### 🏆 Organizers
- **Dashboard**: Real-time match statistics and tournament overview
- **Team Management**: Create teams, manage players, approval workflows
- **Match Organization**: Schedule matches, manage tournaments
- **Live Scoring**: Real-time score updates and commentary
- **Analytics**: Performance metrics and detailed statistics
- **Player Management**: Bulk import, approval system, CSV functionality

### 🏏 Players
- **Personal Dashboard**: Individual statistics and performance tracking
- **Team Applications**: Browse and apply to cricket teams
- **Match History**: Detailed performance analytics with visualizations
- **Profile Management**: Complete cricket resume with document uploads
- **Settings**: Notification preferences and account security
- **Live Participation**: Join live match sessions and input stats

### 👥 Fans
- **Match Viewing**: Live scores, commentary, and match updates
- **Team Following**: Follow favorite teams and players
- **Statistics**: Access to comprehensive cricket analytics
- **Community**: Engage with cricket community features

### 🔧 Administrators
- **Platform Management**: User approval and platform oversight
- **Content Moderation**: Manage platform content and user behavior
- **System Analytics**: Platform usage and performance metrics

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start full development environment
npm run server       # Start backend server only
npm run client       # Start frontend development server

# Database
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate new migrations
npm run db:studio    # Open database browser interface
npm run db:reset     # Reset database (WARNING: Deletes all data)

# Building
npm run build        # Build for production
npm run preview      # Preview production build
npm run start        # Start production server

# Code Quality
npm run type-check   # TypeScript type checking
npm run lint         # Run linting
npm run format       # Format code with Prettier

# Testing
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate test coverage report
```

## 🌐 Git Workflow & Deployment

### Initial Git Setup

```bash
# Initialize git repository (if cloning from scratch)
git init

# Add all files to staging
git add .

# Create initial commit
git commit -m "Initial commit: Nepal Cricket Ecosystem Platform"

# Add remote origin (replace with your repository URL)
git remote add origin https://github.com/yourusername/nepcscore.git

# Push to GitHub
git push -u origin main
```

### Development Workflow

```bash
# Create a new feature branch
git checkout -b feature/player-dashboard

# Make your changes and commit
git add .
git commit -m "feat: implement player dashboard with statistics"

# Push feature branch
git push origin feature/player-dashboard

# Create pull request (use GitHub interface)

# After merge, update main branch
git checkout main
git pull origin main

# Delete feature branch
git branch -d feature/player-dashboard
git push origin --delete feature/player-dashboard
```

### Production Deployment

```bash
# Build the application
npm run build

# Set production environment
export NODE_ENV=production

# Start production server
npm run start

# Using PM2 for process management (recommended)
npm install -g pm2
pm2 start npm --name "nepcscore" -- start
pm2 save
pm2 startup
```

### Environment-Specific Configuration

```bash
# Development environment
cp .env.example .env.development

# Production environment
cp .env.example .env.production

# Staging environment
cp .env.example .env.staging
```

## 🔒 Security Configuration

### Session Security

```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add the generated secret to your `.env` file:

```env
SESSION_SECRET=your_generated_secure_session_secret_here
```

### Database Security

```bash
# Create a dedicated database user with limited privileges
sudo -u postgres psql

CREATE USER nepcscore_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE nepcscore TO nepcscore_readonly;
GRANT USAGE ON SCHEMA public TO nepcscore_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO nepcscore_readonly;
```

### Firewall Configuration

```bash
# Allow HTTP and HTTPS traffic
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000

# Allow PostgreSQL (only if accessing remotely)
sudo ufw allow 5432

# Enable firewall
sudo ufw enable
```

## 📊 Performance Monitoring

### Application Monitoring

```bash
# Install monitoring tools
npm install -g clinic

# Profile your application
clinic doctor -- node server/index.js
clinic bubbleprof -- node server/index.js
clinic flame -- node server/index.js
```

### Database Performance

```bash
# Monitor PostgreSQL performance
sudo -u postgres psql nepcscore

# Show running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

# Show database size
SELECT pg_size_pretty(pg_database_size('nepcscore'));
```

## 🐛 Troubleshooting

### Common Issues

**Port 5000 already in use:**
```bash
# Find process using port 5000
sudo lsof -i :5000

# Kill the process
sudo kill -9 <PID>

# Or use a different port
export PORT=3000
npm run dev
```

**Database connection errors:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check database exists
sudo -u postgres psql -l | grep nepcscore
```

**Permission denied errors:**
```bash
# Fix node_modules permissions
sudo chown -R $USER:$USER node_modules/
sudo chown -R $USER:$USER ~/.npm

# Clear npm cache
npm cache clean --force
```

**Build failures:**
```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Write tests for new features
- Update documentation for API changes
- Ensure responsive design for all screen sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

For support and questions:

- **Email**: support@nepcscore.com
- **Documentation**: [https://docs.nepcscore.com](https://docs.nepcscore.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/nepcscore/issues)
- **Discord**: [Nepal Cricket Community](https://discord.gg/nepal-cricket)

## 🙏 Acknowledgments

- Nepal Cricket Association for guidance and support
- Local cricket communities across Nepal
- Open source contributors and maintainers
- Cricket enthusiasts who provided feedback and testing

---

**Built with ❤️ for Nepal Cricket Community**

*Promoting grassroots cricket development across Nepal through technology*