# Charging Station Management System

A full-stack web application for managing and monitoring electric vehicle (EV) charging stations. Built with React frontend, .NET 8.0 Web API backend, and PostgreSQL database.

## 🛠 Technology Stack

- **Frontend**: React 19.2.3, Tailwind CSS, Axios
- **Backend**: .NET 8.0 Web API, Entity Framework Core
- **Database**: PostgreSQL

## 📦 Prerequisites

Install the following software before proceeding:

- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **.NET 8.0 SDK** ([Download](https://dotnet.microsoft.com/download/dotnet/8.0))
- **Node.js** 14+ LTS ([Download](https://nodejs.org/))

## 🚀 Quick Start

### Step 1: Install and Setup PostgreSQL

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Windows
1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Remember the password you set for the `postgres` user

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Configure PostgreSQL Port

The application uses port **5433** (instead of default 5432). Update `postgresql.conf`:

**macOS/Linux**: `/opt/homebrew/var/postgresql@15/postgresql.conf` or `/etc/postgresql/[version]/main/postgresql.conf`  
**Windows**: `C:\Program Files\PostgreSQL\[version]\data\postgresql.conf`

Change: `port = 5433` then restart PostgreSQL.

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres -p 5433

# Run these SQL commands:
CREATE DATABASE "ChargingStationDB";
ALTER USER postgres WITH PASSWORD '1234';
\q
```

**Note**: If you prefer port 5432, update the connection string in `ChargingStationAPI/appsettings.json`.

### Step 2: Setup Backend

```bash
# Navigate to backend directory
cd ChargingStationAPI

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Verify database connection string in appsettings.json:
# Host=localhost;Port=5433;Database=ChargingStationDB;Username=postgres;Password=1234
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend directory
cd charging-station-ui

# Install dependencies
npm install
```

## ▶️ Running the Application

### 1. Start PostgreSQL

**macOS**: `brew services start postgresql@15`  
**Windows**: Service should start automatically  
**Linux**: `sudo systemctl start postgresql`

### 2. Start Backend API

Open a terminal:

```bash
cd ChargingStationAPI
dotnet run
```

Backend will run on `http://localhost:5000`  
Swagger UI: `http://localhost:5000/swagger`

### 3. Start Frontend

Open a **new** terminal:

```bash
cd charging-station-ui
npm start
```

Frontend will open at `http://localhost:3000`

## ✅ Verification

- **Backend**: Visit [http://localhost:5000/swagger](http://localhost:5000/swagger) - should show API documentation
- **Frontend**: Visit [http://localhost:3000](http://localhost:3000) - should show the dashboard
- **Database**: Check backend terminal for "Database initialized successfully" message

## ⚙️ Configuration

### Database Connection

Edit `ChargingStationAPI/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=ChargingStationDB;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

### API Proxy

Frontend proxies to backend via `charging-station-ui/package.json`:

```json
{
  "proxy": "http://localhost:5000"
}
```

## 🔧 Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Verify port
lsof -i :5433  # macOS/Linux
netstat -an | findstr 5433  # Windows
```

### Backend Issues

- **Database connection error**: Verify PostgreSQL is running and connection string is correct
- **Port 5000 in use**: Change port in `Properties/launchSettings.json`
- **Missing .NET SDK**: Verify with `dotnet --version` (should be 8.0+)

### Frontend Issues

- **Port 3000 in use**: Use `PORT=3001 npm start`
- **API calls failing**: Ensure backend is running on port 5000
- **Module errors**: Delete `node_modules` and run `npm install` again

### General

- **Database tables not created**: Check backend logs - tables are auto-created on first run
- **Changes not reflecting**: Restart both frontend and backend, clear browser cache

## 📁 Project Structure

```
charging-station-app/
├── ChargingStationAPI/          # Backend (.NET 8.0)
│   ├── Controllers/             # API endpoints
│   ├── Data/                    # Database context
│   ├── Models/                  # Data models
│   └── appsettings.json         # Configuration
│
└── charging-station-ui/         # Frontend (React)
    ├── src/
    │   ├── components/          # React components
    │   ├── pages/               # Page components
    │   └── services/            # API service
    └── package.json             # Dependencies
```

## 📝 Notes

- Database schema is automatically created on first backend run
- Admin mode can be toggled in the frontend UI
- API documentation available at `/swagger` endpoint
- All data persists in PostgreSQL between restarts