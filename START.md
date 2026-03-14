# 🚀 How to Run Lumis

## Quick Start (3 Steps)

### 1️⃣ Install Dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### 2️⃣ Create Environment Files

```bash
# Frontend
cd frontend
cp .env.example .env
# Edit frontend/.env with your values

# Backend
cd ../backend
cp .env.example .env
# Edit backend/.env with your values

cd ..
```

### 3️⃣ Start Development Servers

```bash
npm run dev
```

This will start:
- ✅ Frontend on http://localhost:3000
- ✅ Backend on http://localhost:3001

### 3️⃣ Open Browser

Go to: **http://localhost:3000**

---

## That's It! 🎉

You should see the Lumis landing page with the design system loaded.

---

## Alternative: Run Separately

### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## Next Steps

1. ✅ **Servers running** - You're here!
2. 📖 Read `QUICKSTART.md` for environment setup
3. 🎨 Check `IMPLEMENTATION_GUIDE.md` for full development plan
4. 🚀 Start building features

---

## Troubleshooting

### "Port already in use"
```bash
# Kill port 3000
lsof -ti:3000 | xargs kill -9

# Kill port 3001
lsof -ti:3001 | xargs kill -9
```

### "Module not found"
```bash
# Reinstall everything
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install
cd ../backend && npm install
```

---

**Need help?** Check `QUICKSTART.md` for detailed setup!
