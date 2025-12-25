const jwt = require('jsonwebtoken');

// JWT 비밀키
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

/**
 * 인증 미들웨어
 * - 요청 헤더의 Authorization 토큰을 검증하고 사용자 정보를 요청 객체에 추가
 */
exports.authenticate = (req, res, next) => {
  try {
    // 헤더에서 토큰 가져오기
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '인증이 필요합니다' });
    }
    
    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 요청 객체에 사용자 정보 추가
    req.user = decoded;
    next();
  } catch (error) {
    console.error('인증 오류:', error);
    res.status(401).json({ message: '유효하지 않은 토큰입니다' });
  }
};

/**
 * 관리자 권한 확인 미들웨어
 * - authenticate 미들웨어 이후에 사용해야 함
 */
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '관리자 권한이 필요합니다' });
  }
};
