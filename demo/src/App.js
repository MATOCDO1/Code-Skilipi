import React, { useState } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const sendCode = async () => {
    try {
      const res = await fetch('http://localhost:3001/CreateNewAccessCode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber })
      });
      const data = await res.json();

      if (res.ok && data.code) {
        setMessage(`✅ Mã xác thực đã được gửi!`);
        
      } else {
        setMessage(`❌ ${data.message || 'Gửi mã thất bại'}`);
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Gửi mã thất bại');
    }
  };
const verifyCode = async () => {
  try {
    const res = await fetch('http://localhost:3001/ValidateAccessCode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, accessCode })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      setMessage('✅ Xác thực thành công!');
      localStorage.setItem('userPhone', phoneNumber); // lưu số
      navigate('/dashboard'); // chuyển trang
    } else {
      setMessage(`❌ ${data.message || 'Xác thực thất bại'}`);
    }
  } catch (err) {
    console.error(err);
    setMessage('❌ Xác thực thất bại');
  }
};

  return (
    <div className="app">
      <h2>Xác thực số điện thoại</h2>

      <input
        type="text"
        placeholder="Nhập số điện thoại"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <button onClick={sendCode}>📨 Gửi mã</button>

      <input
        type="text"
        placeholder="Nhập mã xác thực"
        value={accessCode}
        onChange={(e) => setAccessCode(e.target.value)}
      />
      <button onClick={verifyCode}>✅ Xác thực</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default App;
