# 📚 Minhaj Digital Library

A full-stack digital library application built with **React Native CLI** (TypeScript) for mobile and **Core PHP/MySQL** for the backend REST API.

## ✨ Features

### Reader
- 🔐 Secure login with token-based authentication
- 📖 Browse books with dynamic categories
- 🔍 Title search with debounce
- 📋 Detailed book view (cover, author, description)
- 📄 Online PDF reading with loading/error states
- 🔄 Pull-to-refresh for live data

### Admin
- 📂 Create and manage categories
- ➕ Add new books with cover image upload
- ✏️ Edit book details
- 🗑️ Delete books with confirmation
- 🖼️ Cover image upload (JPEG, PNG, WebP)
- 👁️ Browse library as reader

### Security
- 🔒 Password hashing (bcrypt)
- 🎫 Secure bearer tokens (SHA-256 hashed, server-side expiry)
- 🛡️ Server-side role enforcement (reader cannot mutate data)
- 🚫 SQL injection prevention (MySQLi prepared statements)
- 📁 Secure file uploads (MIME sniffing, random filenames)

---

## 📂 Project Structure

```
MinhajLiberary/
├── android/                  # Android native project
├── ios/                      # iOS native project
├── src/                      # React Native TypeScript source
│   ├── api/                  # API client & service layer
│   ├── components/           # Reusable UI components
│   ├── context/              # AuthContext (session management)
│   ├── navigation/           # React Navigation (Auth/Reader/Admin)
│   ├── screens/              # All app screens
│   │   ├── auth/             # LoginScreen
│   │   ├── reader/           # Library, BookDetails, PdfReader
│   │   └── admin/            # AdminHome, ManageBooks, BookForm, ManageCategories
│   ├── theme/                # Colors, spacing, typography
│   ├── types/                # TypeScript interfaces
│   └── utils/                # Validation helpers
├── backend/                  # PHP REST API
│   ├── public/               # Document root (index.php, .htaccess, uploads/)
│   ├── config/               # Bootstrap, database connection
│   ├── controllers/          # Auth, Book, Category, Upload controllers
│   ├── middleware/            # Auth middleware
│   ├── helpers/               # Response, Request, Validator helpers
│   └── scripts/              # User seeder
├── database/                 # SQL files
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Sample data
└── docs/                     # Documentation
    ├── API.md                # API documentation
    ├── TESTING.md            # Testing guide
    └── DEMO.md               # Demo walkthrough
```

---

## 🚀 Prerequisites

- **Node.js** >= 22.11.0
- **React Native CLI** (RN 0.88.0)
- **Android Studio** with Android SDK
- **JDK 17**
- **XAMPP/WAMP** (Apache + MySQL/MariaDB)
- **PHP** >= 8.2

---

## 🔧 Backend Setup

### 1. Database Setup

```bash
# Open MySQL CLI or phpMyAdmin
# Import the schema
mysql -u root < database/schema.sql

# Import seed data (categories and sample books)
mysql -u root minhaj_library < database/seed.sql
```

### 2. Configure Environment

```bash
# Copy the example env file
cp backend/.env.example backend/.env

# Edit backend/.env with your database credentials
```

**`.env` configuration:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=minhaj_library
DB_USER=root
DB_PASS=
APP_URL=http://localhost/MinhajLiberary/backend/public
APP_ENV=development
```

### 3. Apache Configuration (XAMPP)

**Option A: Symlink/Alias**
- Place the entire project in XAMPP's `htdocs` directory, or
- Create an Apache alias pointing to the project

**Option B: Virtual Host** (recommended)
Add to `httpd-vhosts.conf`:
```apache
<VirtualHost *:80>
    DocumentRoot "D:/react-native/MinhajLiberary/backend/public"
    ServerName minhajlibrary.local
    <Directory "D:/react-native/MinhajLiberary/backend/public">
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 4. Create Test Users

```bash
php backend/scripts/seed_users.php --admin-password=Admin123 --reader-password=Reader123
```

### 5. Verify API

```bash
curl http://localhost/MinhajLiberary/backend/public/api/health
```

---

## 📱 Mobile Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Base URL

Edit `src/api/client.ts`:
```typescript
// For Android emulator
const API_BASE_URL = 'http://10.0.2.2/MinhajLiberary/backend/public';

// For physical device (replace with your PC's LAN IP)
const API_BASE_URL = 'http://192.168.x.x/MinhajLiberary/backend/public';
```

### 3. Run on Android

```bash
# Start Metro bundler
npm start

# In another terminal
npm run android
```

---

## 🔑 Test Accounts

| Role   | Email                     | Password  |
|--------|---------------------------|-----------|
| Admin  | admin@minhajlibrary.com   | Admin123  |
| Reader | reader@minhajlibrary.com  | Reader123 |

> ⚠️ These are example passwords for development. Set strong passwords for production.

---

## 📖 API Documentation

See [docs/API.md](docs/API.md) for complete API documentation with request/response examples.

## 🧪 Testing

See [docs/TESTING.md](docs/TESTING.md) for backend and mobile testing procedures.

## 🎬 Demo

See [docs/DEMO.md](docs/DEMO.md) for step-by-step demo walkthrough.

---

## 🛠️ Tech Stack

| Layer    | Technology |
|----------|-----------|
| Mobile   | React Native 0.88 + TypeScript |
| Backend  | Core PHP 8.2+ |
| Database | MySQL/MariaDB (MySQLi) |
| Auth     | Bearer tokens (SHA-256) |
| PDF      | WebView + Google Docs Viewer |
| Navigation | React Navigation 7 |
| HTTP     | Axios |

---

## ⚠️ Known Issues

1. **PDF Rendering:** Uses Google Docs Viewer via WebView. PDFs on private URLs may not render.
2. **Cleartext Traffic:** Development mode uses HTTP. Production must use HTTPS.
3. **Image Picker:** Requires `react-native-image-picker` permissions in AndroidManifest.

---

## 📄 License

This project is part of the Minhaj Digital Library technical assessment.
