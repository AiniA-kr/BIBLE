const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

// JWT 비밀키
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * @route   POST /api/users/register
 * @desc    사용자 등록
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, name } = req.body;
    
    // 필수 필드 확인
    if (!username || !password) {
      return res.status(400).json({ message: '아이디와 비밀번호를 입력해주세요' });
    }
    
    // 사용자 존재 여부 확인
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다' });
    }
    
    // 비밀번호 암호화
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 새 사용자 생성
    const user = new User({
      username,
      password: hashedPassword,
      name
    });
    
    await user.save();
    
    res.status(201).json({ message: '회원가입이 완료되었습니다' });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    사용자 로그인 및 토큰 발급
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 사용자 찾기
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다' });
    }
    
    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: '아이디 또는 비밀번호가 일치하지 않습니다' });
    }
    
    // JWT 토큰 생성
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

/**
 * @route   GET /api/users/me
 * @desc    현재 로그인한 사용자 정보 조회
 * @access  Private
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

/**
 * @route   GET /api/users
 * @desc    모든 사용자 목록 조회 (관리자 전용)
 * @access  Private/Admin
 */
router.get('/', authenticate, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('사용자 목록 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    사용자 정보 수정 (관리자 전용)
 * @access  Private/Admin
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    // 관리자 권한 확인 또는 본인 확인
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    
    const { name, role } = req.body;
    
    // 관리자가 아닌 경우 role 필드 변경 불가
    if (req.user.role !== 'admin' && role) {
      return res.status(403).json({ message: '역할을 변경할 권한이 없습니다' });
    }
    
    // 사용자 찾기
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }
    
    // 필드 업데이트
    if (name) user.name = name;
    if (role && req.user.role === 'admin') user.role = role;
    
    await user.save();
    
    res.json({
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('사용자 정보 수정 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

/**
 * @route   DELETE /api/users/:id
 * @desc    사용자 삭제 (관리자 전용)
 * @access  Private/Admin
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // 관리자 권한 확인
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '권한이 없습니다' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다' });
    }
    
    await user.remove();
    
    res.json({ message: '사용자가 삭제되었습니다' });
  } catch (error) {
    console.error('사용자 삭제 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다' });
  }
});

module.exports = router;