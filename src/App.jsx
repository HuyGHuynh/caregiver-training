import { useState } from 'react'
import { MainLayout, HomePage, CoursePage, CoursesPage, LessonPage, ProgressDashboard } from './components'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'course', 'lesson', 'progress'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [user] = useState({
    name: 'Alex Johnson',
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

  return (
    <div className="App">
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
    </div>
  )
}

export default App
