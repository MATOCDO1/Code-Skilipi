// --- server/index.js ---
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const { Vonage } = require('@vonage/server-sdk');
const { db } = require('./firebase');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());


// --- Vonage Init ---
const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

// --- Nodemailer Setup ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// --- API gửi mã xác thực ---
app.post('/CreateNewAccessCode', async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ message: 'Thiếu số điện thoại' });

  const code = generateOTP();
  try {
    await db.collection('accessCodes').doc(phoneNumber).set({ code, createdAt: new Date() });
    await vonage.sms.send({ to: phoneNumber, from: "Vonage APIs", text: `Mã xác thực của bạn là: ${code}` });
    res.status(200).json({ code });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Không thể gửi mã' });
  }
});

// --- API xác thực mã ---
app.post('/ValidateAccessCode', async (req, res) => {
  const { accessCode, phoneNumber } = req.body;
  if (!accessCode || !phoneNumber) return res.status(400).json({ success: false });

  try {
    const docRef = db.collection('accessCodes').doc(phoneNumber);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ success: false });

    const data = doc.data();
    const createdAt = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
    if ((new Date() - createdAt) > 5 * 60 * 1000) return res.status(400).json({ success: false, message: 'Mã hết hạn' });

    if (data.code === accessCode) {
      await docRef.delete();
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Mã sai' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// --- API Nhân viên ---
app.get('/GetEmployees', async (req, res) => {
  try {
    const snapshot = await db.collection('employees').get();
    const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json({ employees });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy dữ liệu' });
  }
});

app.post('/AddEmployee', async (req, res) => {
  const { name, phone, email, role, schedule } = req.body;
  if (!name || !phone || !email || !role || !schedule) {
    return res.status(400).json({ message: 'Thiếu thông tin nhân viên' });
  }

  try {
    const newEmpRef = await db.collection('employees').add({ name, phone, email, role, schedule });
    res.status(201).json({ id: newEmpRef.id });
  } catch (err) {
    console.error('❌ Lỗi Firestore:', err);
    res.status(500).json({ message: 'Lỗi thêm nhân viên', error: err.message });
  }
});

app.delete('/DeleteEmployee/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.collection('employees').doc(id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi xoá nhân viên' });
  }
});

app.put('/UpdateEmployee/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    await db.collection('employees').doc(id).update(updates);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi cập nhật nhân viên' });
  }
});

// --- Serve React app (nếu build production) ---


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server chạy tại http://localhost:${PORT}`));
