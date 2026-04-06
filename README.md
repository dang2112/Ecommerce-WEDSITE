# Ecommerce WEDSITE

Ung dung thuong mai dien tu gom:

- Backend: Node.js + Express + MySQL
- Frontend: React + Vite

## 1) Yeu cau moi truong

- Node.js 18+ (khuyen nghi 20+)
- MySQL 8+
- npm

## 2) Cau truc du an

- `backend/`: API server
- `frontend/`: giao dien React
- `ecommerce_schema.sql`: schema + seed data

## 3) Cau hinh backend

Tao file `.env` trong thu muc `backend/` voi noi dung:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
PORT=5000
JWT_SECRET=your_secret_key
```

Luu y:

- `DB_NAME` phai la `ecommerce_db`
- `JWT_SECRET` dat chuoi bat ky de ky token

## 4) Cai dat dependencies

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd ../frontend
npm install
```

## 5) Chay ung dung

Can 2 terminal song song.

### Terminal 1: Chay backend

```bash
cd backend
npm run dev
```

Backend se chay tai: `http://localhost:5000`

Kiem tra nhanh:

- Mo `http://localhost:5000/`
- Neu OK se tra ve JSON: `{"message":"Ecommerce API running"}`

### Terminal 2: Chay frontend

```bash
cd frontend
npm run dev
```

Vite se in ra dia chi local (thuong la `http://localhost:5173`).

## 6) Tai khoan seed de test

Theo du lieu mau trong schema:

- Admin
  - So dien thoai: `0`
  - Mat khau: `admin123`

## 7) Build frontend production

```bash
cd frontend
npm run build
```

Output tai thu muc `frontend/dist`.

## 8) Loi thuong gap

- Loi ket noi DB:
  - Kiem tra lai `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` trong `backend/.env`
  - Kiem tra MySQL dang chay

- Frontend goi API that bai:
  - Kiem tra backend dang chay cong `5000`
  - Frontend dang dung baseURL: `http://localhost:5000/api`

- Port bi trung:
  - Doi `PORT` backend trong `.env`
  - Neu doi backend port, cap nhat lai `frontend/src/api/client.js`

## 9) Scripts nhanh

### Backend

- `npm run dev`: chay backend voi nodemon
- `npm start`: chay backend production mode

### Frontend

- `npm run dev`: chay Vite dev server
- `npm run build`: build production
