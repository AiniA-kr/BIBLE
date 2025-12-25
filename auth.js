// 로그인 폼 처리
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
  
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        // 로딩 표시
        showLoading(true);
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // API 요청
        const response = await fetch('/api/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '로그인에 실패했습니다.');
        }
        
        // 토큰 저장
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 성공 메시지 표시
        showAlert('로그인되었습니다.');
        
        // UI 업데이트
        updateUserInterface();
      } catch (error) {
        console.error('로그인 오류:', error);
        showAlert(error.message, 'error');
      } finally {
        showLoading(false);
      }
    });
  }
  
  // 회원가입 폼 처리
  function setupRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (!registerForm) return;
  
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        // 로딩 표시
        showLoading(true);
        
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        const name = document.getElementById('register-name').value;
        
        // 입력값 검증
        if (password !== confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }
        
        // API 요청
        const response = await fetch('/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password, name })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || '회원가입에 실패했습니다.');
        }
        
        // 성공 메시지 표시
        showAlert('회원가입이 완료되었습니다. 로그인해주세요.');
        
        // 모달 닫기
        closeModal('register-modal');
        
        // 폼 초기화
        registerForm.reset();
      } catch (error) {
        console.error('회원가입 오류:', error);
        showAlert(error.message, 'error');
      } finally {
        showLoading(false);
      }
    });
  }
  
  // 로그아웃 처리
  function setupLogout() {
    const logoutButton = document.getElementById('logout-button');
    if (!logoutButton) return;
  
    logoutButton.addEventListener('click', function() {
      // 토큰 삭제
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // 성공 메시지 표시
      showAlert('로그아웃되었습니다.');
      
      // UI 업데이트
      updateUserInterface();
    });
  }
  
  // 사용자 인터페이스 업데이트
  function updateUserInterface() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // 로그인 상태에 따라 UI 변경
    const loginForm = document.getElementById('login-form');
    const userInfo = document.getElementById('user-info');
    const adminMenu = document.getElementById('admin-menu');
    
    if (token) {
      // 로그인 상태
      if (loginForm) loginForm.style.display = 'none';
      if (userInfo) {
        userInfo.style.display = 'block';
        userInfo.querySelector('.username').textContent = user.name || user.username;
      }
      
      // 관리자 메뉴 표시 여부
      if (adminMenu) {
        adminMenu.style.display = user.role === 'admin' ? 'block' : 'none';
      }
    } else {
      // 로그아웃 상태
      if (loginForm) loginForm.style.display = 'block';
      if (userInfo) userInfo.style.display = 'none';
      if (adminMenu) adminMenu.style.display = 'none';
    }
  }
  
  // 초기화 함수
  function initAuth() {
    setupLoginForm();
    setupRegisterForm();
    setupLogout();
    updateUserInterface();
  }
  
  // DOM 로드 시 초기화
  document.addEventListener('DOMContentLoaded', initAuth);