// API 통신을 위한 기본 URL
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// 토큰 가져오기
const getToken = () => localStorage.getItem('token');

// 기본 fetch 옵션
const getHeaders = (includeAuth = true) => {
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
};

// API 요청 함수들
const api = {
  // 사용자 인증 관련 API
  auth: {
    // 로그인
    login: async (username, password) => {
      try {
        const response = await fetch(`${API_URL}/users/login`, {
          method: 'POST',
          headers: getHeaders(false),
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '로그인에 실패했습니다');
        }
        
        // 토큰 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        return data;
      } catch (error) {
        console.error('로그인 오류:', error);
        throw error;
      }
    },
    
    // 회원가입
    register: async (userData) => {
      try {
        const response = await fetch(`${API_URL}/users/register`, {
          method: 'POST',
          headers: getHeaders(false),
          body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '회원가입에 실패했습니다');
        }
        
        return data;
      } catch (error) {
        console.error('회원가입 오류:', error);
        throw error;
      }
    },
    
    // 로그아웃
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    // 현재 사용자 정보 가져오기
    getCurrentUser: async () => {
      try {
        const response = await fetch(`${API_URL}/users/me`, {
          method: 'GET',
          headers: getHeaders()
        });
        
        if (response.status === 401) {
          // 인증 오류 시 로그아웃 처리
          api.auth.logout();
          throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        }
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '사용자 정보를 가져오는데 실패했습니다');
        }
        
        return data;
      } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        throw error;
      }
    },
    
    // 로그인 상태 확인
    isAuthenticated: () => {
      return !!getToken();
    },
    
    // 관리자 권한 확인
    isAdmin: () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.role === 'admin';
    }
  },
  
  // 강의 관련 API
  lectures: {
    // 강의 목록 가져오기
    getLectures: async (category = 'all', page = 1, pageSize = 5, sortBy = null) => {
      try {
        let url = `${API_URL}/lectures?page=${page}&pageSize=${pageSize}`;
        
        if (category !== 'all') {
          url += `&category=${encodeURIComponent(category)}`;
        }
        
        if (sortBy) {
          url += `&sortBy=${encodeURIComponent(sortBy)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '강의 목록을 가져오는데 실패했습니다');
        }
        
        return data;
      } catch (error) {
        console.error('강의 목록 조회 오류:', error);
        throw error;
      }
    },
    
    // 강의 상세 정보 가져오기
    getLectureById: async (id) => {
      try {
        const response = await fetch(`${API_URL}/lectures/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '강의 정보를 가져오는데 실패했습니다');
        }
        
        return data;
      } catch (error) {
        console.error('강의 상세 조회 오류:', error);
        throw error;
      }
    },
    
    // 강의 등록 (관리자 전용)
    addLecture: async (lectureData) => {
      try {
        // FormData 사용 (파일 업로드를 위해)
        const formData = new FormData();
        
        // JSON 데이터를 FormData에 추가
        Object.keys(lectureData).forEach(key => {
          if (key !== 'materials') {
            formData.append(key, lectureData[key]);
          }
        });
        
        // 파일 추가
        if (lectureData.materials && lectureData.materials.length > 0) {
          lectureData.materials.forEach(file => {
            formData.append('materials', file);
          });
        }
        
        const response = await fetch(`${API_URL}/lectures`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getToken()}`
            // Content-Type은 생략 (FormData에서 자동으로 설정)
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '강의 등록에 실패했습니다');
        }
        
        return data;
      } catch (error) {
        console.error('강의 등록 오류:', error);
        throw error;
      }
    },
    
    // 강의 수정 (관리자 전용)
    updateLecture: async (id, lectureData) => {
      try {
        // FormData 사용 (파일 업로드를 위해)
        const formData = new FormData();
        
        // JSON 데이터를 FormData에 추가
        Object.keys(lectureData).forEach(key => {
          if (key !== 'materials') {
            formData.append(key, lectureData[key]);
          }
        });
        
        // 파일 추가 (새로 추가된 파일만)
        if (lectureData.newMaterials && lectureData.newMaterials.length > 0) {
          lectureData.newMaterials.forEach(file => {
            formData.append('materials', file);
          });
        }
        
        const response = await fetch(`${API_URL}/lectures/${id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${getToken()}`
            // Content-Type은 생략 (FormData에서 자동으로 설정)
          },
          body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '강의 수정에 실패했습니다');
        }
        
        return data;
      } catch (error) {
        console.error('강의 수정 오류:', error);
        throw error;
      }
    },
    
    // 강의 삭제 (관리자 전용)
    deleteLecture: async (id) => {
      try {
        const response = await fetch(`${API_URL}/lectures/${id}`, {
          method: 'DELETE',
          headers: getHeaders()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '강의 삭제에 실패했습니다');
        }
        
        return data;
      } catch (error) {
        console.error('강의 삭제 오류:', error);
        throw error;
      }
    }
  }
};

// 모듈 내보내기
export default api;