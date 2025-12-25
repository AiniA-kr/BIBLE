const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const lectureRoutes = require('./lectureRoutes');

// 사용자 관련 라우트
router.use('/users', userRoutes);

// 강의 관련 라우트
router.use('/lectures', lectureRoutes);

module.exports = router;
