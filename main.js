// API 기본 URL 설정
const API_URL = '/api';

// 현재 페이지 상태
let currentPage = 1;
let currentCategory = 'all';
let currentSortBy = '등록일순';

// 토큰 관리
function getToken() {
    return localStorage.getItem('token');
}

function isAuthenticated() {
    return !!getToken();
}

function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
}

// API 요청 헤더
function getHeaders(includeAuth = true) {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (includeAuth) {
        const token = getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    return headers;
}

// 로딩 표시 함수
function showLoading(isLoading) {
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = isLoading ? 'flex' : 'none';
    }
}

// 알림 메시지 표시 함수
function showAlert(message, type = 'success') {
    const alertElement = document.getElementById('alert-message');
    const alertTextElement = document.getElementById('alert-text');
    
    if (alertElement && alertTextElement) {
        alertElement.className = `alert alert-${type}`;
        alertTextElement.textContent = message;
        alertElement.style.display = 'block';
        
        // 5초 후 자동 닫기
        setTimeout(() => {
            alertElement.style.display = 'none';
        }, 5000);
    }
}

// 회원가입 모달 관련
function openRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.style.display = 'none';
        // 폼 초기화
        document.getElementById('register-form').reset();
        // 알림 메시지 숨기기
        document.getElementById('register-alert').style.display = 'none';
    }
}

// 회원가입 처리
async function registerUser(e) {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;
    const name = document.getElementById('register-name').value;
    
    // 비밀번호 확인
    if (password !== passwordConfirm) {
        showRegisterAlert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/users/register`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ username, password, name })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '회원가입에 실패했습니다.');
        }
        
        // 성공 메시지 표시
        showAlert('회원가입이 완료되었습니다. 로그인해주세요.', 'success');
        closeRegisterModal();
    } catch (error) {
        console.error('회원가입 오류:', error);
        showRegisterAlert(error.message);
    } finally {
        showLoading(false);
    }
}

// 회원가입 알림 표시
function showRegisterAlert(message) {
    const alertElement = document.getElementById('register-alert');
    const alertMessageElement = document.getElementById('register-alert-message');
    
    if (alertElement && alertMessageElement) {
        alertMessageElement.textContent = message;
        alertElement.style.display = 'block';
    }
}

// 로그인 처리
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        showAlert('아이디와 비밀번호를 입력해주세요.', 'danger');
        return;
    }
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/users/login`, {
            method: 'POST',
            headers: getHeaders(false),
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '로그인에 실패했습니다.');
        }
        
        // 토큰 및 사용자 정보 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 로그인 상태 업데이트
        updateAuthUI();
        
        // 성공 메시지 표시
        showAlert('로그인되었습니다.', 'success');
        
        // 최근 수강 강의 로드
        loadRecentViewedLectures();
    } catch (error) {
        console.error('로그인 오류:', error);
        showAlert(error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

// 로그아웃 처리
function logout() {
    // 토큰 및 사용자 정보 삭제
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 로그인 상태 업데이트
    updateAuthUI();
    
    // 알림 메시지 표시
    showAlert('로그아웃되었습니다.', 'success');
    
    // 관리자 전용 페이지에 있는 경우 메인 페이지로 이동
    if (document.getElementById('admin-content').style.display !== 'none') {
        showPage('main');
    }
    
    // 최근 수강 강의 섹션 업데이트
    document.getElementById('recent-viewed-lectures').innerHTML = `
        <div class="lecture-row">
            <div class="lecture-row-title">로그인 후 이용 가능합니다</div>
            <div class="lecture-row-date"></div>
        </div>
    `;
}

// 인증 상태에 따른 UI 업데이트
function updateAuthUI() {
    const loginBox = document.getElementById('login-box');
    const userMenu = document.getElementById('user-menu');
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (isAuthenticated()) {
        // 사용자 로그인 상태
        loginBox.style.display = 'none';
        userMenu.style.display = 'flex';
        
        // 사용자 이름 표시
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        document.getElementById('user-display-name').textContent = user.name || user.username;
        
        // 관리자 권한 확인
        if (isAdmin()) {
            adminElements.forEach(el => el.style.display = 'block');
        } else {
            adminElements.forEach(el => el.style.display = 'none');
        }
    } else {
        // 로그아웃 상태
        loginBox.style.display = 'flex';
        userMenu.style.display = 'none';
        adminElements.forEach(el => el.style.display = 'none');
    }
}

// 강의 목록 가져오기
async function fetchLectures(category = currentCategory, page = currentPage, sortBy = currentSortBy) {
    try {
        showLoading(true);
        
        let url = `${API_URL}/lectures?page=${page}&pageSize=5`;
        
        if (category && category !== 'all') {
            url += `&category=${encodeURIComponent(category)}`;
        }
        
        if (sortBy) {
            url += `&sortBy=${encodeURIComponent(sortBy)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('강의 목록을 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        
        // 상태 업데이트
        currentPage = page;
        currentCategory = category;
        currentSortBy = sortBy;
        
        return data;
    } catch (error) {
        console.error('강의 목록 조회 오류:', error);
        showAlert(error.message, 'danger');
        return { lectures: [], pagination: { currentPage: 1, totalPages: 1 } };
    } finally {
        showLoading(false);
    }
}

// 강의 목록 표시
function displayLectures(lectures, containerId = 'lectures-list') {
    const lecturesList = document.getElementById(containerId);
    if (!lecturesList) return;
    
    lecturesList.innerHTML = '';
    
    if (!lectures || lectures.length === 0) {
        lecturesList.innerHTML = '<div class="no-lectures" style="padding: 20px; text-align: center;">등록된 강의가 없습니다.</div>';
        return;
    }
    
    lectures.forEach(lecture => {
        const lectureItem = document.createElement('div');
        lectureItem.className = 'board-item';
        lectureItem.onclick = () => openLectureDetail(lecture._id);
        
        // 날짜 포맷팅
        const registerDate = new Date(lecture.registerDate);
        const formattedDate = `${registerDate.getFullYear()}.${String(registerDate.getMonth() + 1).padStart(2, '0')}.${String(registerDate.getDate()).padStart(2, '0')}`;
        
        lectureItem.innerHTML = `
            <div class="title">&lt;${lecture.series}&gt; ${lecture.number}</div>
            <div class="info">
                <div>강사: ${lecture.instructor}</div>
                <div>등록일: ${formattedDate}</div>
                <div>카테고리: ${lecture.category}</div>
            </div>
            <div class="links">
                <button class="view-button" onclick="openLectureDetail('${lecture._id}'); event.stopPropagation();">강의보기</button>
            </div>
        `;
        
        lecturesList.appendChild(lectureItem);
    });
}

// 페이지네이션 업데이트
function updatePagination(pagination, containerId = 'pagination') {
    const paginationContainer = document.getElementById(containerId);
    if (!paginationContainer) return;
    
    paginationContainer.innerHTML = '';
    
    // 페이지네이션 데이터가 없는 경우 숨기기
    if (!pagination || pagination.totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    } else {
        paginationContainer.style.display = 'flex';
    }
    
    // 이전 페이지 버튼
    const prevButton = document.createElement('a');
    prevButton.href = '#';
    prevButton.className = 'arrow';
    prevButton.innerHTML = '&laquo;';
    prevButton.onclick = (e) => {
        e.preventDefault();
        if (pagination.currentPage > 1) {
            loadLecturesForCategory(pagination.category, pagination.currentPage - 1, containerId === 'pagination' ? 'lectures-list' : 'evangelist-lectures-list');
        }
    };
    
    // 페이지 번호 버튼들
    const pageButtons = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
        const pageButton = document.createElement('a');
        pageButton.href = '#';
        pageButton.textContent = i;
        if (i === pagination.currentPage) {
            pageButton.className = 'active';
        }
        pageButton.onclick = (e) => {
            e.preventDefault();
            loadLecturesForCategory(pagination.category, i, containerId === 'pagination' ? 'lectures-list' : 'evangelist-lectures-list');
        };
        pageButtons.push(pageButton);
    }
    
    // 다음 페이지 버튼
    const nextButton = document.createElement('a');
    nextButton.href = '#';
    nextButton.className = 'arrow';
    nextButton.innerHTML = '&raquo;';
    nextButton.onclick = (e) => {
        e.preventDefault();
        if (pagination.currentPage < pagination.totalPages) {
            loadLecturesForCategory(pagination.category, pagination.currentPage + 1, containerId === 'pagination' ? 'lectures-list' : 'evangelist-lectures-list');
        }
    };
    
    // 페이지네이션에 버튼들 추가
    paginationContainer.appendChild(prevButton);
    pageButtons.forEach(button => paginationContainer.appendChild(button));
    paginationContainer.appendChild(nextButton);
}

// 특정 카테고리의 강의 로드
async function loadLecturesForCategory(category, page = 1, containerId = 'lectures-list', paginationId = 'pagination') {
    const data = await fetchLectures(category, page, currentSortBy);
    displayLectures(data.lectures, containerId);
    updatePagination(data.pagination, paginationId);
}

// 메인 페이지용 최근 강의 로드
async function loadRecentLectures() {
    try {
        const response = await fetch(`${API_URL}/lectures?page=1&pageSize=4`);
        
        if (!response.ok) {
            throw new Error('최근 강의를 가져오는데 실패했습니다.');
        }
        
        const data = await response.json();
        displayMainPageLectures(data.lectures, 'recent-lectures');
    } catch (error) {
        console.error('최근 강의 로드 오류:', error);
        document.getElementById('recent-lectures').innerHTML = `
            <div class="lecture-row">
                <div class="lecture-row-title">강의 데이터를 불러올 수 없습니다</div>
                <div class="lecture-row-date"></div>
            </div>
        `;
    }
}

// 메인 페이지용 추천 강의 로드 (임시 데이터)
function loadRecommendedLectures() {
    const recommendedLectures = [
        { title: '미대륙을 향해 (1) - 존 칼빈의 생애', instructor: '조창현 목사' },
        { title: '성경 해석의 원칙 2', instructor: '신용철 목사' },
        { title: '요한복음의 전체적 이해', instructor: '이상민 목사' },
        { title: '성경적 제자훈련의 원리', instructor: '변인교 목사' }
    ];
    
    const container = document.getElementById('recommended-lectures');
    container.innerHTML = '';
    
    recommendedLectures.forEach(lecture => {
        container.innerHTML += `
            <div class="lecture-row">
                <div class="lecture-row-title">${lecture.title}</div>
                <div class="lecture-row-date">${lecture.instructor}</div>
            </div>
        `;
    });
}

// 메인 페이지용 인기 강의 로드 (임시 데이터)
function loadPopularLectures() {
    const popularLectures = [
        { title: '바울의 전도 전략', instructor: '조성현 목사' },
        { title: '성령의 인도하심', instructor: '김재선 목사' },
        { title: '하나님의 뜻을 분별하는 법', instructor: '이정훈 목사' },
        { title: '성경적 리더십', instructor: '박성준 목사' }
    ];
    
    const container = document.getElementById('popular-lectures');
    container.innerHTML = '';
    
    popularLectures.forEach(lecture => {
        container.innerHTML += `
            <div class="lecture-row">
                <div class="lecture-row-title">${lecture.title}</div>
                <div class="lecture-row-date">${lecture.instructor}</div>
            </div>
        `;
    });
}

// 메인 페이지용 최근 수강 강의 로드
async function loadRecentViewedLectures() {
    // 인증 상태 확인
    if (!isAuthenticated()) {
        document.getElementById('recent-viewed-lectures').innerHTML = `
            <div class="lecture-row">
                <div class="lecture-row-title">로그인 후 이용 가능합니다</div>
                <div class="lecture-row-date"></div>
            </div>
        `;
        return;
    }
    
    // 실제 백엔드에서는 사용자별 수강 기록을 가져와야 함
    // 여기서는 임시 데이터 사용
    const recentViewedLectures = [
        { title: '역대하 개요 및 서론', date: '2025.03.19' },
        { title: '요한복음 4: 두 가지 중요한 질문', date: '2025.03.18' },
        { title: '레위기 3: 하나님 백성의 거룩한 삶', date: '2025.03.15' },
        { title: '주제별성경연구2: 자기 유익을 구지 아니하며', date: '2025.03.10' }
    ];
    
    const container = document.getElementById('recent-viewed-lectures');
    container.innerHTML = '';
    
    recentViewedLectures.forEach(lecture => {
        container.innerHTML += `
            <div class="lecture-row">
                <div class="lecture-row-title">${lecture.title}</div>
                <div class="lecture-row-date">${lecture.date}</div>
            </div>
        `;
    });
}

// 메인 페이지용 강의 목록 표시
function displayMainPageLectures(lectures, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!lectures || lectures.length === 0) {
        container.innerHTML = `
            <div class="lecture-row">
                <div class="lecture-row-title">등록된 강의가 없습니다</div>
                <div class="lecture-row-date"></div>
            </div>
        `;
        return;
    }
    
    lectures.forEach(lecture => {
        // 날짜 포맷팅
        const registerDate = new Date(lecture.registerDate);
        const formattedDate = `${registerDate.getFullYear()}.${String(registerDate.getMonth() + 1).padStart(2, '0')}.${String(registerDate.getDate()).padStart(2, '0')}`;
        
        container.innerHTML += `
            <div class="lecture-row" onclick="openLectureDetail('${lecture._id}')">
                <div class="lecture-row-title">${lecture.number}</div>
                <div class="lecture-row-date">${formattedDate}</div>
            </div>
        `;
    });
}

// 강의 상세 정보 가져오기
async function fetchLectureDetail(lectureId) {
    try {
        showLoading(true);
        
        const response = await fetch(`${API_URL}/lectures/${lectureId}`);
        
        if (!response.ok) {
            throw new Error('강의 정보를 가져오는데 실패했습니다.');
        }
        
        return await response.json();
    } catch (error) {
        console.error('강의 상세 정보 조회 오류:', error);
        showAlert(error.message, 'danger');
        return null;
    } finally {
        showLoading(false);
    }
}

// 강의 상세 페이지 열기
async function openLectureDetail(lectureId) {
    const lecture = await fetchLectureDetail(lectureId);
    
    if (!lecture) {
        showAlert('강의 정보를 찾을 수 없습니다.', 'danger');
        return;
    }
    
    // 템플릿 복제 및 수정
    const detailTemplate = document.getElementById('lecture-detail-template');
    const detailElement = detailTemplate.cloneNode(true);
    detailElement.id = `lecture-detail-${lectureId}`;
    
    // 날짜 포맷팅
    const registerDate = new Date(lecture.registerDate);
    const formattedDate = `${registerDate.getFullYear()}.${String(registerDate.getMonth() + 1).padStart(2, '0')}.${String(registerDate.getDate()).padStart(2, '0')}`;
    
    // 강의 정보 채우기
    detailElement.querySelector('#lecture-detail-title').textContent = `<${lecture.series}> ${lecture.number}`;
    detailElement.querySelector('#lecture-detail-info').textContent = `강사: ${lecture.instructor} | 등록일: ${formattedDate} | 재생시간: ${lecture.duration || '00:00:00'}`;
    
    // 비디오 소스 설정
    if (lecture.youtubeEmbedLink) {
        detailElement.querySelector('#youtube-iframe').src = lecture.youtubeEmbedLink;
    }
    
    if (lecture.driveEmbedLink) {
        detailElement.querySelector('#drive-iframe').src = lecture.driveEmbedLink;
    }
    
    // 설명 설정
    detailElement.querySelector('#lecture-detail-description').textContent = lecture.description || '강의 설명이 없습니다.';
    
    // 자료 목록 설정
    const materialsList = detailElement.querySelector('#lecture-materials-list');
    materialsList.innerHTML = '';
    
    if (lecture.materials && lecture.materials.length > 0) {
        lecture.materials.forEach(material => {
            const li = document.createElement('li');
            li.innerHTML = `<a href="${material.url}" target="_blank"><span class="icon">${getIconForFileType(material.type)}</span> ${material.name}</a>`;
            materialsList.appendChild(li);
        });
    } else {
        materialsList.innerHTML = '<li>추가 자료가 없습니다.</li>';
    }
    
    // 비디오 탭 이벤트 핸들러 설정
    const videoTabs = detailElement.querySelectorAll('.video-tab');
    videoTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 모든 탭 비활성화
            videoTabs.forEach(t => t.classList.remove('active'));
            
            // 모든 비디오 컨텐츠 숨기기
            const videoContainers = detailElement.querySelectorAll('.lecture-video');
            videoContainers.forEach(vc => vc.style.display = 'none');
            
            // 선택한 탭 활성화
            this.classList.add('active');
            
            // 선택한 비디오 컨텐츠 표시
            const targetId = this.getAttribute('data-target');
            detailElement.querySelector(`#${targetId}`).style.display = 'block';
        });
    });
    
    // 닫기 버튼 이벤트 핸들러 설정
    detailElement.querySelector('.close-button').onclick = () => closeLectureDetail(lectureId);
    
    // 페이지 표시
    document.body.appendChild(detailElement);
    detailElement.style.display = 'block';
    
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
}

// 강의 상세 페이지 닫기
function closeLectureDetail(lectureId) {
    const detailElement = document.getElementById(`lecture-detail-${lectureId}`);
    if (detailElement) {
        // iframe src 초기화 (메모리 누수 방지)
        const iframes = detailElement.querySelectorAll('iframe');
        iframes.forEach(iframe => {
            iframe.src = '';
        });
        
        // 요소 제거
        detailElement.remove();
    }
    
    // 스크롤 다시 활성화
    document.body.style.overflow = 'auto';
}

// 파일 타입에 따른 아이콘 반환
function getIconForFileType(fileType) {
    switch (fileType) {
        case 'pdf': return '📄';
        case 'doc': case 'docx': return '📝';
        case 'ppt': case 'pptx': return '📊';
        case 'xls': case 'xlsx': return '📈';
        case 'zip': case 'rar': return '📦';
        case 'mp3': case 'wav': return '🔊';
        case 'mp4': case 'avi': case 'mov': return '🎬';
        default: return '📎';
    }
}

// 페이지 전환 함수
function showPage(pageId) {
    // 모든 페이지 콘텐츠 숨기기
    const pageContents = document.querySelectorAll('.page-content');
    pageContents.forEach(page => {
        page.style.display = 'none';
    });
    
    // 선택된 페이지 표시 및 데이터 로드
    if (pageId === 'main') {
        // 메인 화면 표시
        document.getElementById('main-content').style.display = 'block';
        
        // 사이드바 내용 변경 (메인용)
        updateSidebar('수강 가이드', [
            '• 초급과정 안내',
            '• 중급과정 안내',
            '• 고급과정 안내',
            '• 수강 신청 방법',
            '• 학습 진행 방법',
            '• 자주 묻는 질문'
        ]);
        
        // 메인 페이지 데이터 로드
        loadRecentLectures();
        loadRecommendedLectures();
        loadPopularLectures();
        loadRecentViewedLectures();
    } else if (pageId === 'evangelist') {
        document.getElementById('evangelist-content').style.display = 'block';
        
        // 사이드바 내용 변경 (전도인용)
        updateSidebar('전도인과정', [
            '• 신규강의목록',
            '• 인기강의목록',
            '• 필수강의',
            '• 전도인수련회',
            '• 특별강좌',
            '• 전도자료실'
        ]);
        
        // 전도인 강의 목록 가져오기
        loadLecturesForCategory('전도인과정', 1, 'evangelist-lectures-list', 'evangelist-pagination');
    } else if (pageId === 'admin') {
        // 관리자 권한 확인
        if (!isAdmin()) {
            showAlert('관리자 권한이 필요합니다. 로그인 해주세요.', 'danger');
            showPage('main');
            return;
        }
        
        // 관리자 페이지 표시
        document.getElementById('admin-content').style.display = 'block';
        
        // 사이드바 내용 변경 (관리자용)
        updateSidebar('관리자 메뉴', [
            '• 강의 등록',
            '• 강의 관리',
            '• 사용자 관리',
            '• 카테고리 관리',
            '• 통계/분석',
            '• 설정'
        ]);
    } else if (pageId === 'research') {
        // 연구과정 페이지 표시
        document.getElementById('research-content').style.display = 'block';
        
        // 사이드바 내용 변경 (연구과정용)
        updateSidebar('연구과정', [
            '• 강좌전체목록',
            '• 강의전체목록',
            '• 전문강의 강좌',
            '• 강사별 강좌',
            '• 등록연도별 강좌',
            '• 전도인수련회 강좌'
        ]);
        
        // 연구과정 강의 목록 가져오기
        loadLecturesForCategory('성서/성서배경');
    } else if (pageId === 'theology') {
        // 신학과정 페이지 표시
        document.getElementById('research-content').style.display = 'block';
        document.querySelector('.lectures-title').textContent = '신학과정 강의목록';
        
        // 사이드바 내용 변경 (신학과정용)
        updateSidebar('신학과정', [
            '• 성서신학',
            '• 조직신학',
            '• 역사신학',
            '• 실천신학',
            '• 선교학',
            '• 특별강좌'
        ]);
        
        // 신학과정 강의 목록 가져오기
        loadLecturesForCategory('신학과정');
    } else if (pageId === 'regular') {
        // 정규과정 페이지 표시
        document.getElementById('research-content').style.display = 'block';
        document.querySelector('.lectures-title').textContent = '정규과정 강의목록';
        
        // 사이드바 내용 변경 (정규과정용)
        updateSidebar('정규과정', [
            '• 1학년 과정',
            '• 2학년 과정',
            '• 3학년 과정',
            '• 4학년 과정',
            '• 졸업논문',
            '• 특별과정'
        ]);
        
        // 정규과정 강의 목록 가져오기
        loadLecturesForCategory('정규과정');
    } else {
        // 그 외 페이지는 메인 화면 표시
        document.getElementById('main-content').style.display = 'block';
        
        // 기본 강의 목록 가져오기
        loadRecentLectures();
        loadRecommendedLectures();
        loadPopularLectures();
        loadRecentViewedLectures();
    }
    
    // 네비게이션 메뉴 활성화 표시
    const navItems = document.querySelectorAll('.nav li a');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 선택된 메뉴 활성화
    if (event && event.target) {
        event.target.classList.add('active');
    } else if (pageId === 'main') {
        // 메인 메뉴(로고)를 클릭했을 때는 아무 메뉴도 활성화하지 않음
    } else {
        // 초기 로드 시 해당 메뉴 활성화
        const menuItem = document.querySelector(`.nav li a[onclick="showPage('${pageId}')"]`);
        if (menuItem) {
            menuItem.classList.add('active');
        }
    }
}

// 사이드바 업데이트 함수
function updateSidebar(title, items) {
    const sidebarTitle = document.querySelector('.sidebar h3');
    const sidebarItems = document.getElementById('sidebar-menu');
    
    // 제목 변경
    sidebarTitle.textContent = title;
    
    // 항목 변경
    sidebarItems.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        sidebarItems.appendChild(li);
    });
}

// 강의 등록 함수
async function registerLecture(e) {
    e.preventDefault();
    
    // 로그인 및 관리자 권한 확인
    if (!isAuthenticated() || !isAdmin()) {
        showAlert('관리자 권한이 필요합니다.', 'danger');
        return;
    }
    
    try {
        showLoading(true);
        
        // FormData 객체 생성
        const formData = new FormData();
        
        // 폼 데이터 수집
        formData.append('category', document.getElementById('lecture-category').value);
        formData.append('series', document.getElementById('lecture-series').value);
        formData.append('number', document.getElementById('lecture-number').value);
        formData.append('instructor', document.getElementById('lecture-instructor').value);
        formData.append('description', document.getElementById('lecture-description').value);
        formData.append('youtubeLink', document.getElementById('youtube-link').value);
        formData.append('driveLink', document.getElementById('drive-link').value);
        
        // 강의 파일 추가
        const lectureFile = document.getElementById('lecture-file').files[0];
        if (lectureFile) {
            formData.append('lectureFile', lectureFile);
        }
        
        // 자료 파일들 추가
        const materialFiles = document.getElementById('material-files').files;
        for (let i = 0; i < materialFiles.length; i++) {
            formData.append('materials', materialFiles[i]);
        }
        
        // API 요청
        const response = await fetch(`${API_URL}/lectures`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
                // Content-Type은 FormData에서 자동으로 설정됨
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || '강의 등록에 실패했습니다.');
        }
        
        // 성공 메시지 표시
        showAlert('강의가 성공적으로 등록되었습니다!', 'success');
        
        // 폼 초기화
        document.getElementById('lecture-form').reset();
        
        // 연구과정 페이지로 이동
        showPage('research');
    } catch (error) {
        console.error('강의 등록 오류:', error);
        showAlert(error.message, 'danger');
    } finally {
        showLoading(false);
    }
}

// DOM 로드 완료 시 실행
document.addEventListener('DOMContentLoaded', function() {
    // 인증 상태 초기화
    updateAuthUI();
    
    // 초기 페이지 로드 (메인 페이지)
    showPage('main');
    
    // 로그인 버튼 이벤트 리스너
    document.getElementById('login-button').addEventListener('click', login);
    
    // 로그아웃 버튼 이벤트 리스너
    document.getElementById('logout-button').addEventListener('click', logout);
    
    // 회원가입 버튼 이벤트 리스너
    document.getElementById('register-button').addEventListener('click', openRegisterModal);
    
    // 회원가입 모달 닫기 버튼 이벤트 리스너
    document.querySelector('.register-modal-close').addEventListener('click', closeRegisterModal);
    
    // 회원가입 폼 제출 이벤트 리스너
    document.getElementById('register-form').addEventListener('submit', registerUser);
    
    // 알림 닫기 버튼 이벤트 리스너
    document.querySelectorAll('.alert-close').forEach(button => {
        button.addEventListener('click', function() {
            this.parentElement.style.display = 'none';
        });
    });
    
    // 강의 등록 폼 제출 이벤트 리스너
    document.getElementById('lecture-form').addEventListener('submit', registerLecture);
    
    // 카테고리 탭 클릭 이벤트 리스너
    const categoryTabs = document.querySelectorAll('.category-tabs div');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // 현재 탭 컨테이너 찾기
            const tabContainer = this.closest('.category-tabs');
            
            // 모든 탭 비활성화
            tabContainer.querySelectorAll('div').forEach(t => t.classList.remove('active'));
            
            // 클릭한 탭 활성화
            this.classList.add('active');
            
            // 정렬 기준 가져오기
            const sortBy = this.getAttribute('data-sort');
            if (sortBy) {
                currentSortBy = sortBy;
                
                // 현재 페이지 확인
                if (document.getElementById('evangelist-content').style.display !== 'none') {
                    // 전도인 페이지
                    loadLecturesForCategory('전도인과정', 1, 'evangelist-lectures-list', 'evangelist-pagination');
                } else {
                    // 다른 페이지 (연구과정, 신학과정, 정규과정)
                    loadLecturesForCategory(currentCategory);
                }
            }
        });
    });
    
    // 엔터키로 로그인
    document.getElementById('password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            login();
        }
    });
    
    // 메인 페이지에서 검색 버튼 클릭
    document.getElementById('search-button').addEventListener('click', function() {
        // 검색 기능 구현 (향후 확장)
        const searchType = document.getElementById('search-type').value;
        const searchInput = document.getElementById('search-input').value;
        
        if (searchInput.trim() === '') {
            showAlert('검색어를 입력해주세요.', 'danger');
            return;
        }
        
        showAlert('검색 기능은 아직 구현 중입니다.', 'info');
    });
});