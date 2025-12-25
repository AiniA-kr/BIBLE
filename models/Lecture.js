const mongoose = require('mongoose');

/**
 * 강의 자료 서브 스키마
 */
const materialSchema = new mongoose.Schema({
  // 자료 이름
  name: {
    type: String,
    required: true
  },
  
  // 파일 경로 (URL)
  url: {
    type: String,
    required: true
  },
  
  // 파일 타입 (확장자)
  type: {
    type: String
  },
  
  // 파일 크기 (바이트)
  size: {
    type: Number
  },
  
  // 업로드 시간
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * 강의 스키마
 */
const lectureSchema = new mongoose.Schema({
  // 카테고리 (성서/성서배경, 신학과정, 전도인과정, 정규과정 등)
  category: {
    type: String,
    required: true,
    index: true
  },
  
  // 시리즈명 (요한복음, 레위기, 성경해석 등)
  series: {
    type: String,
    required: true,
    index: true
  },
  
  // 강의 번호 및 제목 (1. 개요 및 서론, 75. 두 가지 중요한 질문 등)
  number: {
    type: String,
    required: true
  },
  
  // 강사
  instructor: {
    type: String,
    required: true,
    index: true
  },
  
  // 강의 설명
  description: {
    type: String
  },
  
  // 유튜브 링크
  youtubeLink: String,
  
  // 유튜브 임베드 링크
  youtubeEmbedLink: String,
  
  // 구글 드라이브 링크
  driveLink: String,
  
  // 구글 드라이브 임베드 링크
  driveEmbedLink: String,
  
  // 재생 시간
  duration: {
    type: String,
    default: '00:00:00'
  },
  
  // 조회수
  views: {
    type: Number,
    default: 0
  },
  
  // 좋아요 수
  likes: {
    type: Number,
    default: 0
  },
  
  // 추가 자료 목록
  materials: [materialSchema],
  
  // 등록일
  registerDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // 공개 여부
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // 추천 강의 여부
  isRecommended: {
    type: Boolean,
    default: false
  },
  
  // 인기 강의 여부
  isPopular: {
    type: Boolean,
    default: false
  },
  
  // 강의 태그
  tags: [{
    type: String
  }]
}, {
  // 가상 필드 활성화
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 강의 전체 제목 가상 필드 (series + number)
lectureSchema.virtual('title').get(function() {
  return `<${this.series}> ${this.number}`;
});

// 조회수 증가 메서드
lectureSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save();
};

// 인기 강의 찾기 정적 메서드
lectureSchema.statics.findPopular = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ views: -1, likes: -1 })
    .limit(limit);
};

// 최근 강의 찾기 정적 메서드
lectureSchema.statics.findRecent = function(limit = 10) {
  return this.find({ isPublic: true })
    .sort({ registerDate: -1 })
    .limit(limit);
};

// 추천 강의 찾기 정적 메서드
lectureSchema.statics.findRecommended = function(limit = 10) {
  return this.find({ isPublic: true, isRecommended: true })
    .sort({ registerDate: -1 })
    .limit(limit);
};

// 모델 생성 및 내보내기
const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;
