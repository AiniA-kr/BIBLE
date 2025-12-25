const mongoose = require('mongoose');

/**
 * 사용자 스키마
 */
const userSchema = new mongoose.Schema({
  // 사용자 아이디
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  
  // 비밀번호 (암호화 저장)
  password: { 
    type: String, 
    required: true 
  },
  
  // 사용자 이름
  name: {
    type: String,
    trim: true
  },
  
  // 사용자 역할 (일반/관리자)
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  
  // 이메일 (선택)
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, '올바른 이메일 형식이 아닙니다']
  },
  
  // 최근 로그인 시간
  lastLogin: {
    type: Date
  },
  
  // 계정 생성 시간
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  
  // 계정 활성화 여부
  active: {
    type: Boolean,
    default: true
  }
});

// 모델 생성 및 내보내기
const User = mongoose.model('User', userSchema);

module.exports = User;