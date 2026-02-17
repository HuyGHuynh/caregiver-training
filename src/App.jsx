import { useState } from 'react'
import { MainLayout, HomePage, CoursePage, CoursesPage, LessonPage, ProgressDashboard, LoginPage, UserProfile, RegisterPage } from './components'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login', 'register', 'home', 'course', 'lesson', 'progress', 'profile'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'demo@eduplatform.com',
    phone: '+1 (555) 123-4567',
    streak: 7,
    completedLessons: 24,
    points: 1250
  });

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setCurrentPage('course');
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    setCurrentPage('lesson');
  };

  const handleLoginSuccess = () => {
    setCurrentPage('home');
  };

  const handleNavigateToRegister = () => {
    setCurrentPage('register');
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
    setCurrentPage('home');
  };

  const handleBackToLogin = () => {
    setCurrentPage('login');
  };

  return (
    <div className="App">
      {currentPage === 'login' ? (
        <LoginPage 
          onLoginSuccess={handleLoginSuccess}
          onNavigateToRegister={handleNavigateToRegister}
        />
      ) : currentPage === 'register' ? (
        <RegisterPage 
          onRegisterSuccess={handleRegisterSuccess}
          onBackToLogin={handleBackToLogin}
        />
      ) : currentPage === 'profile' ? (
        <UserProfile user={user} onBack={() => setCurrentPage('home')} />
      ) : (
        <MainLayout 
          user={user} 
          currentPage={currentPage} 
          onNavigate={setCurrentPage}
        >
          <main className="app-main">
            {currentPage === 'home' && <HomePage user={user} onCourseSelect={handleCourseSelect} />}
            {currentPage === 'courses' && <CoursesPage onCourseSelect={handleCourseSelect} />}
            {currentPage === 'course' && <CoursePage selectedCourse={selectedCourse} onStartLesson={handleLessonSelect} />}
            {currentPage === 'lesson' && <LessonPage lesson={selectedLesson} />}
            {currentPage === 'progress' && <ProgressDashboard user={user} />}
          </main>
        </MainLayout>
      )}
    </div>
  )
}

export default App
