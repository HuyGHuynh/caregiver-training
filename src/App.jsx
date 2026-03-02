import { useState } from 'react'
import { useAuth } from './contexts/AuthContext'
import { FontSizeProvider } from './contexts/FontSizeContext'
import { MainLayout, HomePage, CoursePage, CoursesPage, LessonPage, ProgressDashboard, UserProfile } from './components'
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showLogin, setShowLogin] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  
  const { currentUser, logout } = useAuth();

  const [user, setUser] = useState({
    name: currentUser?.displayName || 'User',
    email: currentUser?.email || '',
    streak: 0,
    completedLessons: 0,
    points: 0,
    joinDate: new Date().toISOString().split('T')[0]
  });

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentPage('course');
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentPage('lesson');
  };

  const handleRegisterSuccess = (userData) => {
    // Update user data with registration info
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
      joinDate: new Date().toISOString().split('T')[0],
      streak: 0,
      completedLessons: 0,
      points: 0
    }));
    // After successful registration, user is auto-logged in by Firebase
    setShowLogin(true);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('home');
      console.log('✅ Logged out');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!currentUser) {
    return (
      <FontSizeProvider>
        {showLogin ? (
          <LoginPage 
            onLoginSuccess={() => console.log('Logged in')}
            onNavigateToRegister={() => setShowLogin(false)}
          />
        ) : (
          <RegisterPage
            onRegisterSuccess={handleRegisterSuccess}
            onBackToLogin={() => setShowLogin(true)}
          />
        )}
      </FontSizeProvider>
    );
  }
  
  return (
    <FontSizeProvider>
      <div className="App">
        {currentPage === 'profile' ? (
          <UserProfile user={user} onBack={() => setCurrentPage('home')} />
        ) : (
          <MainLayout 
            user={user} 
            currentPage={currentPage} 
            onNavigate={setCurrentPage}
            onSignOut={handleLogout}
          >
            <main className="app-main">
              {currentPage === 'home' && <HomePage user={user} onCourseSelect={handleCourseSelect} />}
              {currentPage === 'courses' && <CoursesPage onCourseSelect={handleCourseSelect} />}
              {currentPage === 'course' && <CoursePage selectedCourse={selectedCourse} onStartLesson={handleLessonSelect} user={user} />}
              {currentPage === 'lesson' && <LessonPage lesson={selectedLesson} />}
              {currentPage === 'progress' && <ProgressDashboard user={user} />}
            </main>
          </MainLayout>
        )}
      </div>
    </FontSizeProvider>
  )
}

export default App
