# Charging Station Management System

A full-stack web application for managing and monitoring electric vehicle (EV) charging stations. This project consists of a React frontend and a .NET 8.0 Web API backend with PostgreSQL database.

## 📋 Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
  - [Step 1: Install PostgreSQL](#step-1-install-postgresql)
  - [Step 2: Setup PostgreSQL Database](#step-2-setup-postgresql-database)
  - [Step 3: Install .NET SDK](#step-3-install-net-sdk)
  - [Step 4: Setup Backend (API)](#step-4-setup-backend-api)
  - [Step 5: Install Node.js](#step-5-install-nodejs)
  - [Step 6: Setup Frontend (React)](#step-6-setup-frontend-react)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This application provides:
- **Real-time Dashboard**: Live monitoring of charging stations with statistics and visualizations
- **Station Management**: Complete CRUD operations for charging stations
- **Advanced Filtering**: Search and filter stations by various criteria
- **Data Visualization**: Interactive charts showing station status and trends
- **Responsive Design**: Works on desktop, tablet, and mobile devices

---

## 🛠 Technology Stack

### Frontend
- **React** 19.2.3
- **Tailwind CSS** 3.4.19
- **Axios** 1.13.2
- **Node.js** & npm

### Backend
- **.NET 8.0** Web API
- **Entity Framework Core**
- **PostgreSQL** Database
- **Swagger/OpenAPI** Documentation

---

## 📦 Prerequisites

Before starting, ensure you have administrative access to your machine and can install software.

**Required Software:**
- PostgreSQL 12+ (or latest version)
- .NET 8.0 SDK
- Node.js 14.0.0+ (LTS version recommended)
- npm (comes with Node.js) or yarn
- Git (optional, for cloning repository)

---

## 🚀 Installation Guide

Follow these steps in order to set up the complete application on your local machine.

---

### Step 1: Install PostgreSQL

#### For macOS:

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15
```

**Option B: Using PostgreSQL.app**
1. Download PostgreSQL.app from [https://postgresapp.com/](https://postgresapp.com/)
2. Install and launch the application
3. Click "Initialize" to create a new server

**Option C: Using Official Installer**
1. Download PostgreSQL from [https://www.postgresql.org/download/macosx/](https://www.postgresql.org/download/macosx/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

#### For Windows:

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer
3. During installation:
   - Choose installation directory (default is fine)
   - Select components (keep defaults)
   - Set data directory (default is fine)
   - **Set password for `postgres` superuser** (remember this password!)
   - Set port (default is 5432, but this project uses 5433)
   - Choose locale (default is fine)
4. Complete the installation

**Note:** The project uses port **5433** instead of the default 5432. You'll need to configure this.

#### For Linux (Ubuntu/Debian):

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### Verify PostgreSQL Installation:

```bash
# Check PostgreSQL version
psql --version

# For macOS/Linux, try to connect
psql -U postgres

# For Windows, use pgAdmin or command prompt
```

---

### Step 2: Setup PostgreSQL Database

#### 2.1. Configure PostgreSQL Port (if needed)

The application uses port **5433** instead of the default **5432**. You need to configure PostgreSQL to listen on this port.

**For macOS/Linux:**

1. Find PostgreSQL configuration file:
   ```bash
   # macOS with Homebrew
   /opt/homebrew/var/postgresql@15/postgresql.conf
   # or
   /usr/local/var/postgresql@15/postgresql.conf
   
   # Linux
   /etc/postgresql/[version]/main/postgresql.conf
   ```

2. Edit `postgresql.conf`:
   ```bash
   sudo nano /path/to/postgresql.conf
   ```

3. Find and change the port:
   ```
   port = 5433
   ```

4. Restart PostgreSQL:
   ```bash
   # macOS with Homebrew
   brew services restart postgresql@15
   
   # Linux
   sudo systemctl restart postgresql
   ```

**For Windows:**

1. Open `postgresql.conf` (usually in `C:\Program Files\PostgreSQL\[version]\data\`)
2. Find `port = 5432` and change to `port = 5433`
3. Restart PostgreSQL service from Services (services.msc) or:
   ```cmd
   # Run as Administrator
   net stop postgresql-x64-[version]
   net start postgresql-x64-[version]
   ```

**Alternative:** If you prefer to use the default port 5432, you can update the connection string in the backend configuration files (see Configuration section).

#### 2.2. Create Database and User

**For macOS/Linux:**

```bash
# Connect to PostgreSQL
psql -U postgres -p 5433

# If connection fails, try:
sudo -u postgres psql -p 5433
```

**For Windows:**

Open Command Prompt or PowerShell and run:
```cmd
psql -U postgres -p 5433
```

**Once connected, run these SQL commands:**

```sql
-- Create database
CREATE DATABASE "ChargingStationDB";

-- Set password for postgres user (if not already set)
ALTER USER postgres WITH PASSWORD '1234';

-- Verify database was created
\l

-- Connect to the new database
\c ChargingStationDB

-- Exit psql
\q
```

**Note:** The default password in the configuration is `1234`. For production, use a stronger password and update the connection string accordingly.

#### 2.3. Verify Database Connection

Test the connection:
```bash
psql -U postgres -p 5433 -d ChargingStationDB
```

If successful, you should see:
```
ChargingStationDB=#
```

Type `\q` to exit.

---

### Step 3: Install .NET SDK

#### For macOS:

**Option A: Using Homebrew (Recommended)**
```bash
brew install --cask dotnet-sdk
```

**Option B: Using Official Installer**
1. Download .NET 8.0 SDK from [https://dotnet.microsoft.com/download/dotnet/8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
2. Run the installer (.pkg file)
3. Follow the installation wizard

#### For Windows:

1. Download .NET 8.0 SDK from [https://dotnet.microsoft.com/download/dotnet/8.0](https://dotnet.microsoft.com/download/dotnet/8.0)
2. Run the installer (.exe file)
3. Follow the installation wizard
4. Restart your computer if prompted

#### For Linux (Ubuntu/Debian):

```bash
# Add Microsoft package repository
wget https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb -O packages-microsoft-prod.deb
sudo dpkg -i packages-microsoft-prod.deb
rm packages-microsoft-prod.deb

# Install .NET SDK
sudo apt-get update
sudo apt-get install -y dotnet-sdk-8.0
```

#### Verify .NET Installation:

```bash
# Check .NET version
dotnet --version

# Should output: 8.0.x or higher

# Check installed SDKs
dotnet --list-sdks
```

---

### Step 4: Setup Backend (API)

#### 4.1. Navigate to Backend Directory

```bash
cd ChargingStationAPI
```

#### 4.2. Restore Dependencies

```bash
dotnet restore
```

This will download all NuGet packages required by the project.

#### 4.3. Verify Database Connection String

Check the connection string in `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=ChargingStationDB;Username=postgres;Password=1234"
  }
}
```

**If your PostgreSQL setup differs, update:**
- `Host`: Your PostgreSQL host (usually `localhost`)
- `Port`: Your PostgreSQL port (default is 5432, this project uses 5433)
- `Database`: Database name (should be `ChargingStationDB`)
- `Username`: PostgreSQL username (usually `postgres`)
- `Password`: Your PostgreSQL password

#### 4.4. Build the Project

```bash
dotnet build
```

You should see:
```
Build succeeded.
    0 Warning(s)
    0 Error(s)
```

#### 4.5. Run Database Migrations (Optional)

The application uses `EnsureCreated()` which automatically creates the database schema on first run. However, if you want to use migrations:

```bash
# Create a migration
dotnet ef migrations add InitialCreate

# Apply migration to database
dotnet ef database update
```

**Note:** If you get an error about `dotnet ef`, install the EF Core tools:
```bash
dotnet tool install --global dotnet-ef
```

#### 4.6. Test Backend (Optional)

Run the backend to verify it works:

```bash
dotnet run
```

You should see output like:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

**Verify:**
- Open browser and go to: [http://localhost:5000/swagger](http://localhost:5000/swagger)
- You should see the Swagger UI with API endpoints
- Stop the server (Ctrl+C)

---

### Step 5: Install Node.js

#### For macOS:

**Option A: Using Homebrew (Recommended)**
```bash
brew install node
```

**Option B: Using Official Installer**
1. Download Node.js LTS from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer (.pkg file)
3. Follow the installation wizard

#### For Windows:

1. Download Node.js LTS from [https://nodejs.org/](https://nodejs.org/)
2. Run the installer (.msi file)
3. Follow the installation wizard
4. Restart your computer if prompted

#### For Linux (Ubuntu/Debian):

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Verify Node.js Installation:

```bash
# Check Node.js version
node --version
# Should output: v14.x.x or higher

# Check npm version
npm --version
# Should output: 6.x.x or higher
```

---

### Step 6: Setup Frontend (React)

#### 6.1. Navigate to Frontend Directory

```bash
cd charging-station-ui
```

#### 6.2. Install Dependencies

```bash
npm install
```

This will download all npm packages. It may take a few minutes.

**If you encounter errors:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

#### 6.3. Verify Frontend Configuration

Check `package.json` to ensure the proxy is set correctly:

```json
{
  "proxy": "http://localhost:5000"
}
```

This tells the React app to proxy API requests to the backend running on port 5000.

#### 6.4. Test Frontend Build (Optional)

```bash
npm run build
```

This creates a production build. You can skip this for now if you just want to run in development mode.

---

## 🏃 Running the Application

Now that everything is installed, follow these steps to run the complete application:

### Step 1: Start PostgreSQL

**macOS (Homebrew):**
```bash
brew services start postgresql@15
```

**macOS (PostgreSQL.app):**
- Launch PostgreSQL.app from Applications

**Windows:**
- PostgreSQL service should start automatically
- Or start from Services (services.msc)

**Linux:**
```bash
sudo systemctl start postgresql
```

### Step 2: Start Backend API

Open a terminal/command prompt:

```bash
# Navigate to backend directory
cd ChargingStationAPI

# Run the API
dotnet run
```

You should see:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

**Keep this terminal open!** The backend must be running for the frontend to work.

### Step 3: Start Frontend

Open a **new** terminal/command prompt:

```bash
# Navigate to frontend directory
cd charging-station-ui

# Start the React development server
npm start
```

The browser should automatically open to [http://localhost:3000](http://localhost:3000)

If it doesn't open automatically, manually navigate to: [http://localhost:3000](http://localhost:3000)

---

## ✅ Verification

### Verify Backend is Running:

1. Open browser: [http://localhost:5000/swagger](http://localhost:5000/swagger)
2. You should see Swagger UI with API endpoints
3. Try the `GET /api/getAllChargingStations` endpoint - it should return an empty array `[]` initially

### Verify Frontend is Running:

1. Open browser: [http://localhost:3000](http://localhost:3000)
2. You should see the Charging Station Dashboard
3. The page should load without errors
4. Statistics should show (may be zeros initially)

### Verify Database Connection:

1. Check backend terminal - should show: `Database initialized successfully`
2. If you see database errors, verify PostgreSQL is running and connection string is correct

---

## ⚙️ Configuration

### Backend Configuration

**File:** `ChargingStationAPI/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5433;Database=ChargingStationDB;Username=postgres;Password=YOUR_PASSWORD"
  }
}
```

**File:** `ChargingStationAPI/appsettings.Development.json`

Same connection string for development environment.

### Frontend Configuration

**File:** `charging-station-ui/package.json`

```json
{
  "proxy": "http://localhost:5000"
}
```

**To change backend URL for production:**

Edit `charging-station-ui/src/services/stationApi.js` and update the base URL.

### Port Configuration

- **Frontend:** Port 3000 (React default)
- **Backend:** Port 5000 (configured in `launchSettings.json`)
- **PostgreSQL:** Port 5433 (configured in `postgresql.conf`)

To change ports:
- **Frontend:** Set `PORT=3001` in `.env` file or use `npm start -- --port 3001`
- **Backend:** Edit `Properties/launchSettings.json`
- **PostgreSQL:** Edit `postgresql.conf` and restart service

---

## 🔧 Troubleshooting

### PostgreSQL Issues

**Problem: Connection refused**
```bash
# Check if PostgreSQL is running
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services (services.msc) for postgresql service
```

**Problem: Authentication failed**
- Verify username and password in connection string
- Reset postgres password:
  ```sql
  ALTER USER postgres WITH PASSWORD '1234';
  ```

**Problem: Database does not exist**
```sql
CREATE DATABASE "ChargingStationDB";
```

**Problem: Port 5433 not working**
- Verify PostgreSQL is listening on port 5433:
  ```bash
  # macOS/Linux
  lsof -i :5433
  
  # Windows
  netstat -an | findstr 5433
  ```
- Or change connection string to use port 5432 (default)

### Backend Issues

**Problem: `dotnet` command not found**
- Verify .NET SDK is installed: `dotnet --version`
- Restart terminal/command prompt
- Add .NET to PATH if needed

**Problem: Database connection error**
- Verify PostgreSQL is running
- Check connection string in `appsettings.json`
- Verify database exists: `psql -U postgres -p 5433 -l`

**Problem: Port 5000 already in use**
- Change port in `Properties/launchSettings.json`
- Or stop the application using port 5000

**Problem: NuGet package restore fails**
```bash
dotnet nuget locals all --clear
dotnet restore
```

### Frontend Issues

**Problem: `npm` command not found**
- Verify Node.js is installed: `node --version`
- Restart terminal/command prompt
- Reinstall Node.js if needed

**Problem: Port 3000 already in use**
```bash
# Use different port
PORT=3001 npm start
```

**Problem: API calls failing (CORS errors)**
- Verify backend is running on port 5000
- Check proxy in `package.json`
- Verify CORS is enabled in backend (should be in `Program.cs`)

**Problem: Module not found errors**
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem: Build errors**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### General Issues

**Problem: Changes not reflecting**
- Restart both frontend and backend
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Check browser console for errors

**Problem: Database tables not created**
- Check backend logs for errors
- Verify database connection string
- The app uses `EnsureCreated()` which creates tables on first run
- Check PostgreSQL logs for errors

---

## 📝 Additional Notes

- **Development Mode:** Both frontend and backend run in development mode with hot-reload enabled
- **Database:** The database schema is automatically created on first run using `EnsureCreated()`
- **Admin Mode:** Toggle admin mode in the frontend to enable create/edit/delete operations
- **Swagger UI:** Access API documentation at [http://localhost:5000/swagger](http://localhost:5000/swagger)
- **Data Persistence:** All data is stored in PostgreSQL and persists between restarts

---

## 🎉 Success!

If you've reached this point and everything is working, congratulations! You have successfully set up the Charging Station Management System.

**Next Steps:**
1. Explore the Swagger UI to see available API endpoints
2. Use the frontend to create, view, edit, and delete charging stations
3. Check out the real-time charts and statistics
4. Try the filtering and search features

---

## 📚 Project Structure

```
charging-station-app/
├── ChargingStationAPI/          # Backend (.NET 8.0 Web API)
│   ├── Controllers/             # API controllers
│   ├── Data/                    # Database context
│   ├── Models/                  # Data models
│   ├── Program.cs               # Application entry point
│   └── appsettings.json         # Configuration
│
└── charging-station-ui/         # Frontend (React)
    ├── public/                  # Static files
    ├── src/
    │   ├── components/          # React components
    │   ├── pages/               # Page components
    │   ├── services/            # API service layer
    │   └── App.js               # Root component
    └── package.json             # Dependencies
```

---

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review backend logs in the terminal
3. Check browser console for frontend errors
4. Verify all services are running (PostgreSQL, Backend, Frontend)

---

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

**Last Updated:** 2024  
**Version:** 1.0.0

