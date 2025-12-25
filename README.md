# 중앙성서신학원 웹사이트

성경 강의를 제공하는 중앙성서신학원 웹사이트입니다. 사용자 인증, 강의 목록 조회, 강의 상세 보기, 관리자 기능을 포함합니다.

## 기능

- **사용자 인증**: 회원가입, 로그인, 로그아웃
- **강의 목록**: 카테고리별 강의 조회, 정렬, 페이지네이션
- **강의 상세**: 강의 정보, 유튜브/드라이브 영상 연동, 강의 자료 다운로드
- **관리자 기능**: 강의 등록, 수정, 삭제, 사용자 관리

## 시작하기

### 필수 조건

- Node.js 14.x 이상
- MongoDB (로컬 또는 MongoDB Atlas)

### 설치

1. 저장소 복제

```bash
git clone <저장소-URL>
cd theological-seminary
```

2. 의존성 설치

```bash
npm install
```

3. 환경 변수 설정

`.env.example` 파일을 `.env`로 복사하고 필요한 값을 설정합니다.

```bash
cp .env.example .env
```

4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

5. 접속

브라우저에서 `http://localhost:5000`으로 접속합니다.

## 프로젝트 구조

```
theological-seminary/
├── client/                 # 프론트엔드 파일
│   ├── index.html          # 메인 HTML 파일
│   └── main.js             # 메인 JavaScript 파일
├── middleware/             # 미들웨어
│   └── auth.js             # 인증 미들웨어
├── models/                 # 데이터 모델
│   ├── User.js             # 사용자 모델
│   └── Lecture.js          # 강의 모델
├── routes/                 # API 라우트
│   ├── index.js            # 라우트 통합
│   ├── userRoutes.js       # 사용자 관련 라우트
│   └── lectureRoutes.js    # 강의 관련 라우트
├── uploads/                # 업로드 파일 저장 디렉토리
├── app.js                  # 메인 서버 파일
├── package.json            # 프로젝트 설정
└── .env                    # 환경 변수
```

## API 엔드포인트

### 사용자 API

- `POST /api/users/register` - 사용자 등록
- `POST /api/users/login` - 사용자 로그인
- `GET /api/users/me` - 현재 사용자 정보 조회
- `GET /api/users` - 사용자 목록 조회 (관리자용)
- `PUT /api/users/:id` - 사용자 정보 수정
- `DELETE /api/users/:id` - 사용자 삭제 (관리자용)

### 강의 API

- `GET /api/lectures` - 강의 목록 조회
- `GET /api/lectures/:id` - 특정 강의 상세 조회
- `POST /api/lectures` - 강의 등록 (관리자용)
- `PUT /api/lectures/:id` - 강의 수정 (관리자용)
- `DELETE /api/lectures/:id` - 강의 삭제 (관리자용)

## 배포

### Google Cloud

1. Google Cloud 프로젝트 생성
2. App Engine 또는 Compute Engine 설정
3. 환경 변수 설정 (Cloud Secret Manager 또는 app.yaml)
4. MongoDB Atlas 연결 (또는 Cloud SQL)
5. 배포 명령어 실행:

```bash
gcloud app deploy
```

## 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.