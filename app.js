const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const routes = require('./routes');

// 환경 변수 설정
require('dotenv').config();

// 앱 초기화
const app = express();

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공
app.use(express.static(path.join(__dirname, 'client')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 업로드 디렉토리 생성
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB 연결
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/theological_seminary';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// API 라우트
app.use('/api', routes);

// 클라이언트 라우팅을 위한 폴백
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'client', 'index.html'));
});

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: '서버 오류가 발생했습니다',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 초기 관리자 계정 생성 함수
async function createAdminUser() {
  try {
    const User = require('./models/User');
    
    // 이미 관리자가 있는지 확인
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      const admin = new User({
        username: 'admin',
        password: hashedPassword,
        name: '관리자',
        role: 'admin'
      });
      
      await admin.save();
      console.log('관리자 계정이 생성되었습니다. (아이디: admin, 비밀번호: admin123)');
    }
  } catch (error) {
    console.error('관리자 계정 생성 중 오류:', error);
  }
}

// 서버 시작
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`서버 실행 중: http://localhost:${PORT}`);
  await createAdminUser();
});