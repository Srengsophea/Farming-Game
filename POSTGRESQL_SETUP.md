# PostgreSQL Installation Guide for Windows

## Option 1: Download & Install PostgreSQL (Recommended)

### Step 1: Download PostgreSQL Installer
1. Go to: https://www.postgresql.org/download/windows/
2. Click **"Download the installer"**
3. Select version **PostgreSQL 15** or **16** (latest stable)

### Step 2: Run Installer
1. Double-click the downloaded `.exe` file
2. Follow installation wizard:
   - **Installation Directory**: `C:\Program Files\PostgreSQL\16` (default)
   - **Port**: `5432` (default)
   - **Locale**: English (default)
3. When prompted for **password**, enter and remember it (e.g., `postgres`)
4. Complete installation

### Step 3: Add PostgreSQL to PATH

After installation, add PostgreSQL bin directory to Windows PATH:

**Method A: Automatic (Windows 11/10)**
1. Press `Win + X` → **System**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Under "System variables", click **New**
5. Variable name: `PGBIN`
6. Variable value: `C:\Program Files\PostgreSQL\16\bin`
7. Click **OK** three times
8. **Close and reopen PowerShell**

**Method B: Manual PATH (If Method A doesn't work)**
1. Right-click **This PC** → **Properties**
2. Click **Advanced system settings**
3. Click **Environment Variables**
4. Select **Path** under System variables → **Edit**
5. Click **New** and add: `C:\Program Files\PostgreSQL\16\bin`
6. Click **OK** three times
7. **Restart your computer**

### Step 4: Verify Installation
```bash
psql --version
```

Should show: `psql (PostgreSQL) 16.x`

---

## Option 2: Use Windows Subsystem for Linux (WSL)

If you have WSL installed, PostgreSQL is easier:

```bash
wsl
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
psql --version
```

---

## Option 3: Use Docker (Advanced)

If you have Docker installed:

```bash
docker run --name farming_game_db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=farming_game -p 5432:5432 -d postgres:16
```

Then verify:
```bash
psql -h localhost -U postgres -d farming_game
```

---

## If PostgreSQL is Already Installed

Try with full path:

```bash
"C:\Program Files\PostgreSQL\16\bin\psql" --version
```

If this works, add the bin folder to PATH as shown in Step 3.

---

## Next: Create Database

Once PostgreSQL is installed and `psql` works:

```bash
# Create the farming_game database
psql -U postgres -c "CREATE DATABASE farming_game;"

# You'll be prompted for password - enter what you set during installation
```

Then continue with the game setup:
```bash
npm run db:migrate
npm run db:seed
npm run dev
```

---

## Troubleshooting

**"psql is not recognized"**
- PostgreSQL not installed OR
- Not added to PATH
- Solution: Restart terminal after adding to PATH

**"FATAL: role 'postgres' does not exist"**
- PostgreSQL installation corrupted
- Solution: Uninstall and reinstall PostgreSQL

**"could not translate host name 'localhost' to address"**
- PostgreSQL service not running
- Windows: Press `Win + R`, type `services.msc`, find "postgresql-x64-16", right-click → **Start**

**Connection refused on port 5432**
- PostgreSQL service not running
- Solution: Start the PostgreSQL service (see above)

---

## After Installation

Once `psql` works, run:

```bash
cd "C:\Users\Asus\Desktop\Farming Game Online Web\farming-game"

# Create database
psql -U postgres -c "CREATE DATABASE farming_game;"

# Initialize schema
npm run db:migrate

# Add sample data
npm run db:seed

# Start the game
npm run dev
```

Then open: **http://localhost:5173**
