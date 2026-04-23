import React, { useState, useEffect } from 'react';
import { fetchQuestions } from '../services/api';
import './CoursePage.css';

const extractSubsectionNumber = (subsection) => {
  if (!subsection) return '';

  const subsectionText = String(subsection);
  const match = subsectionText.match(/^(\d+\.\d+)/);
  return match ? match[1] : subsectionText;
};

const COURSE_SUBSECTIONS = {
  1: ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '2.4', '3.1', '3.2', '3.3'],
  2: ['4.1', '4.2', '4.3', '4.4', '5.1', '5.2', '5.3', '5.4', '5.5', '6.1', '6.2', '6.3', '6.4', '6.5'],
  3: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7']
};

const getUniqueCompletedEntries = (entries = [], subsections = []) => {
  const uniqueEntries = new Map();

  entries.forEach(entry => {
    if (entry?.completed === false) return;

    const subsection = extractSubsectionNumber(entry?.subsection);
    if (subsections.length > 0 && !subsections.includes(subsection)) return;

    const current = uniqueEntries.get(subsection);
    const currentTime = current ? new Date(current.completedAt || current.createdAt || 0).getTime() : 0;
    const nextTime = new Date(entry.completedAt || entry.createdAt || 0).getTime();

    if (!current || nextTime >= currentTime) {
      uniqueEntries.set(subsection, entry);
    }
  });

  return Array.from(uniqueEntries.values());
};

const buildCourseProgress = (courseId, progressEntries = []) => {
  const subsections = COURSE_SUBSECTIONS[courseId] || [];
  const completedEntries = getUniqueCompletedEntries(progressEntries, subsections);
  const completedSubsections = completedEntries.map(entry => extractSubsectionNumber(entry.subsection));
  const completedCount = completedSubsections.length;
  const totalLessons = subsections.length || 1;

  return {
    completedSubsections,
    progress: Math.min(Math.round((completedCount / totalLessons) * 100), 100),
    isStarted: completedCount > 0,
    isCompleted: completedCount >= totalLessons,
    pointsEarned: completedEntries.reduce((sum, entry) => sum + (entry.xpEarned || 0), 0),
    currentSubsection: subsections.find(subsection => !completedSubsections.includes(subsection)) || subsections[subsections.length - 1] || '1.1'
  };
};

const buildAvailableSubsections = (courseId, progressEntries = []) => {
  const subsections = COURSE_SUBSECTIONS[courseId] || [];
  const completed = new Set(getUniqueCompletedEntries(progressEntries, subsections).map(entry => extractSubsectionNumber(entry.subsection)));

  return subsections.map((subsection, index) => ({
    subsection,
    isCompleted: completed.has(subsection),
    isUnlocked: index === 0 || completed.has(subsections[index - 1])
  }));
};

const LessonItem = ({ lesson, courseProgress, onStartLesson }) => {
  const isCompleted = lesson.completed;
  const isAvailable = lesson.isAvailable;
  const isInProgress = courseProgress?.currentLesson === lesson.id;

  return (
    <div className={`lesson-item ${isCompleted ? 'completed' : ''} ${!isAvailable ? 'locked' : ''} ${isInProgress ? 'current' : ''}`}>
      <div className="lesson-number">
        {isCompleted ? '✓' : lesson.number}
      </div>
      <div className="lesson-content">
        <h3 className="lesson-title">{lesson.title}</h3>
        <p className="lesson-description">{lesson.description}</p>
        <div className="lesson-meta">
          <span className="lesson-duration">{lesson.duration} min</span>
          {lesson.points && <span className="lesson-points">{lesson.points} pts</span>}
        </div>
      </div>
      <div className="lesson-actions">
        {!isAvailable ? (
          <div className="lock-icon">🔒</div>
        ) : (
          <button
            className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => onStartLesson(lesson)}
          >
            {isCompleted ? 'Review' : isInProgress ? 'Continue' : 'Start'}
          </button>
        )}
      </div>
    </div>
  );
};

const CourseHeader = ({ course, progress }) => (
  <div className="course-header">
    <div className="course-hero">
      <div className="course-icon" style={{ background: course.color }}>
        {course.icon}
      </div>
      <div className="course-info">
        <div className="course-category">{course.category}</div>
        <h1 className="course-title">{course.title}</h1>
        <p className="course-description">{course.description}</p>
        <div className="course-meta">
          <span className="meta-item">
            <span className="meta-icon">📚</span>
            {course.totalLessons} lessons
          </span>
          <span className="meta-item">
            <span className="meta-icon">⏱️</span>
            {course.estimatedTime}
          </span>
          <span className="meta-item">
            <span className="meta-icon">📈</span>
            {course.level}
          </span>
        </div>
      </div>
    </div>

    <div className="course-progress-section">
      <div className="progress-header">
        <h3>Your Progress</h3>
        <span className="progress-percentage">{progress.percentage}%</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress.percentage}%` }}
        ></div>
      </div>
      <div className="progress-stats">
        <div className="progress-stat">
          <span className="stat-number">{progress.completed}</span>
          <span className="stat-label">Completed</span>
        </div>
        <div className="progress-stat">
          <span className="stat-number">{progress.remaining}</span>
          <span className="stat-label">Remaining</span>
        </div>
        <div className="progress-stat">
          <span className="stat-number">{progress.pointsEarned}</span>
          <span className="stat-label">Points Earned</span>
        </div>
      </div>
    </div>
  </div>
);

const CourseNavigation = ({ modules, activeModule, onModuleChange }) => (
  <div className="course-navigation">
    <h3 className="nav-title">Course Modules</h3>
    <div className="module-list">
      {modules.map(module => (
        <button
          key={module.id}
          className={`module-item ${activeModule === module.id ? 'active' : ''}`}
          onClick={() => onModuleChange(module.id)}
        >
          <div className="module-info">
            <div className="module-title">{module.title}</div>
            <div className="module-progress">
              {module.completedLessons}/{module.totalLessons} lessons
            </div>
          </div>
          <div className="module-status">
            {module.completedLessons === module.totalLessons ? '✓' :
              module.completedLessons > 0 ? '📚' : '○'}
          </div>
        </button>
      ))}
    </div>
  </div>
);

const CoursePage = ({ selectedCourse, onStartLesson = () => { }, progressEntries = [], refreshTrigger = 0 }) => {
  const [activeModule, setActiveModule] = useState(1);
  const [lesson11Questions, setLesson11Questions] = useState([]);
  const [lesson12Questions, setLesson12Questions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState(null);
  const [availableSubsections, setAvailableSubsections] = useState([]);
  const [progressLoading, setProgressLoading] = useState(true);

  // Determine course content based on selected course
  const isIntermediateCourse = selectedCourse?.id === 2;
  const isAdvancedResearchCourse = selectedCourse?.id === 3;
  const totalLessonsCount = isAdvancedResearchCourse ? 7 : isIntermediateCourse ? 14 : 11;

  // Course category for API calls
  const courseCategory = selectedCourse?.category || 'Basic Best Practices of Dementia Caregiving';

  useEffect(() => {
    const courseId = selectedCourse?.id || 1;
    const progress = buildCourseProgress(courseId, progressEntries);
    const subsections = buildAvailableSubsections(courseId, progressEntries);

    setCourseProgress(progress);
    setAvailableSubsections(subsections);
    setProgressLoading(false);
  }, [progressEntries, selectedCourse?.id]);

  // Fetch real quiz questions for basic lessons on mount
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true);
      try {
        const loadQuizQuestions = async (subsection) => {
          const questions = await fetchQuestions({ subsection });
          const shuffledQuestions = questions.sort(() => 0.5 - Math.random());
          return shuffledQuestions.slice(0, 5);
        };

        const [lesson11Quiz, lesson12Quiz] = await Promise.all([
          loadQuizQuestions('1.1'),
          loadQuizQuestions('1.2')
        ]);

        setLesson11Questions(lesson11Quiz);
        setLesson12Questions(lesson12Quiz);
        console.log(`Loaded ${lesson11Quiz.length} questions for 1.1 and ${lesson12Quiz.length} questions for 1.2`);
      } catch (error) {
        console.error('Error loading questions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!isIntermediateCourse && !isAdvancedResearchCourse) {
      loadQuestions();
    }
  }, [isIntermediateCourse, isAdvancedResearchCourse]);

  // Mock data - replace with real data
  const mockCourse = {
    id: selectedCourse?.id || 1,
    title: isAdvancedResearchCourse
      ? 'Advanced Dementia Caregiving Research'
      : isIntermediateCourse
        ? 'Intermediate Dementia Caregiving Knowledge'
        : 'Basic Best Practices of Dementia Caregiving',
    category: 'Healthcare & Caregiving',
    description: isAdvancedResearchCourse
      ? 'Research-oriented dementia caregiving education covering implementation science, AI-supported learning, ethics, and caregiver health literacy.'
      : isIntermediateCourse
        ? 'Advanced dementia caregiving strategies focusing on behavioral management, complex coordination, and specialized interventions for challenging situations.'
        : 'Comprehensive training in dementia caregiving from foundational knowledge through advanced care strategies and specialized interventions.',
    icon: isAdvancedResearchCourse ? '🔬' : isIntermediateCourse ? '🧠' : '🏥',
    color: isAdvancedResearchCourse ? '#7B61FF' : isIntermediateCourse ? '#00AF54' : '#1181b2',
    totalLessons: totalLessonsCount,
    estimatedTime: isAdvancedResearchCourse ? '7-10 weeks' : isIntermediateCourse ? '10-14 weeks' : '8-12 weeks',
    level: isAdvancedResearchCourse ? 'Advanced' : 'All Levels',
    ...selectedCourse
  };

  const mockProgress = {
    percentage: courseProgress ? courseProgress.progress : 0,
    completed: courseProgress ? courseProgress.completedSubsections?.length || 0 : 0,
    remaining: totalLessonsCount - (courseProgress?.completedSubsections?.length || 0),
    pointsEarned: courseProgress ? courseProgress.pointsEarned || 0 : 0,
    currentLesson: courseProgress ? Math.min((courseProgress.completedSubsections?.length || 0) + 1, totalLessonsCount) : 1
  };

  // Calculate module completion based on user progress
  const calculateModuleCompletion = (moduleId, totalLessonsInModule, lessonsInModule) => {
    if (!courseProgress || !courseProgress.completedSubsections) return 0;

    const completedInModule = lessonsInModule.filter(lessonSubsection =>
      courseProgress.completedSubsections.includes(extractSubsectionNumber(lessonSubsection))
    ).length;

    return completedInModule;
  };

  const mockModules = isIntermediateCourse ? [
    {
      id: 1,
      title: 'Foundational Adjustments',
      totalLessons: 3,
      completedLessons: calculateModuleCompletion(1, 3, ['1.1', '1.2', '1.3'])
    },
    {
      id: 2,
      title: 'Active Behavioral Management',
      totalLessons: 5,
      completedLessons: calculateModuleCompletion(2, 5, ['2.1', '2.2', '2.3', '2.4', '2.5'])
    },
    {
      id: 3,
      title: 'Complex Coordination & Risk',
      totalLessons: 5,
      completedLessons: calculateModuleCompletion(3, 5, ['3.1', '3.2', '3.3', '3.4', '3.5'])
    }
  ] : isAdvancedResearchCourse ? [
    {
      id: 1,
      title: 'Research Foundations',
      totalLessons: 3,
      completedLessons: calculateModuleCompletion(1, 3, ['1.1', '1.2', '1.3'])
    },
    {
      id: 2,
      title: 'Technology, Ethics, and Practice',
      totalLessons: 2,
      completedLessons: calculateModuleCompletion(2, 2, ['1.4', '1.5'])
    },
    {
      id: 3,
      title: 'Caregiver Systems & Simulation',
      totalLessons: 2,
      completedLessons: calculateModuleCompletion(3, 2, ['1.6', '1.7'])
    }
  ] : [
    {
      id: 1,
      title: 'Foundational Knowledge and Early-Stage Care',
      totalLessons: 4,
      completedLessons: calculateModuleCompletion(1, 4, ['1.1', '1.2', '1.3', '1.4'])
    },
    {
      id: 2,
      title: 'Daily Routines and Safety',
      totalLessons: 4,
      completedLessons: calculateModuleCompletion(2, 4, ['2.1', '2.2', '2.3', '2.4'])
    },
    {
      id: 3,
      title: 'Specialized Care and Intervention',
      totalLessons: 3,
      completedLessons: calculateModuleCompletion(3, 3, ['3.1', '3.2', '3.3'])
    }
  ];

  // Helper function to determine if a lesson is completed based on user progress
  const isLessonCompleted = (lessonSubsection) => {
    if (!courseProgress || !courseProgress.completedSubsections) return false;
    const subsectionNum = extractSubsectionNumber(lessonSubsection);
    return courseProgress.completedSubsections.includes(subsectionNum);
  };

  // Helper function to determine if a lesson is available
  const isLessonAvailable = (lessonSubsection) => {
    const subsectionNum = extractSubsectionNumber(lessonSubsection);
    const subsectionData = availableSubsections.find(s => s.subsection === subsectionNum);
    if (subsectionData) {
      return subsectionData.isUnlocked;
    }

    return lessonSubsection === '1.1';
  };

  const mockLessons = isIntermediateCourse ? [
    // Module 1: Foundational Adjustments (Easy)
    {
      id: 1,
      number: 1,
      moduleId: 1,
      title: '4.1. Meaningful Activity "Dosing"',
      description: 'Understanding how to provide appropriate levels of meaningful activities based on cognitive abilities.',
      type: 'Interactive Lesson',
      duration: 30,
      points: 100,
      completed: isLessonCompleted('4.1'),
      isAvailable: isLessonAvailable('4.1'),
      subsection: '4.1',
      category: courseCategory,
      section: 'Foundational Adjustments (Easy)',
      skills: ['Activity Planning', 'Cognitive Assessment', 'Engagement Strategies']
    },
    {
      id: 2,
      number: 2,
      moduleId: 1,
      title: '4.2. Communication Upgrades for Middle Stage',
      description: 'Advanced communication techniques specifically for middle-stage dementia.',
      type: 'Video + Practice',
      duration: 35,
      points: 125,
      completed: isLessonCompleted('4.2'),
      isAvailable: isLessonAvailable('4.2'),
      subsection: '4.2',
      category: courseCategory,
      section: 'Foundational Adjustments (Easy)',
      skills: ['Advanced Communication', 'Middle-Stage Care', 'Verbal Techniques']
    },
    {
      id: 3,
      number: 3,
      moduleId: 1,
      title: '4.3. Sundowning and Late-Day Worsening',
      description: 'Managing and preventing sundowning behaviors and late-day confusion.',
      type: 'Case Studies',
      duration: 25,
      points: 75,
      completed: isLessonCompleted('4.3'),
      isAvailable: isLessonAvailable('4.3'),
      subsection: '4.3',
      category: courseCategory,
      section: 'Foundational Adjustments (Easy)',
      skills: ['Sundowning Management', 'Behavioral Patterns', 'Environmental Modifications']
    },
    {
      id: 4,
      number: 4,
      moduleId: 1,
      title: '4.4. Creating a Supportive Environment to Reduce Confusion and Stress',
      description: 'Designing calm, predictable spaces that lower confusion, reduce stress, and support orientation throughout the day.',
      type: 'Environmental Design',
      duration: 30,
      points: 100,
      completed: isLessonCompleted('4.4'),
      isAvailable: isLessonAvailable('4.4'),
      subsection: '4.4',
      category: courseCategory,
      section: 'Foundational Adjustments (Easy)',
      skills: ['Environment Design', 'Stress Reduction', 'Orientation Support']
    },
    // Module 2: Active Behavioral Management
    {
      id: 5,
      number: 5,
      moduleId: 2,
      title: '5.1. BPSD "Trigger → Behavior → Response" Framework',
      description: 'Understanding behavioral triggers and implementing appropriate response strategies.',
      type: 'Framework Training',
      duration: 40,
      points: 150,
      completed: isLessonCompleted('5.1'),
      isAvailable: isLessonAvailable('5.1'),
      subsection: '5.1',
      category: courseCategory,
      section: 'Active Behavioral Management',
      skills: ['BPSD Framework', 'Trigger Identification', 'Response Planning']
    },
    {
      id: 6,
      number: 6,
      moduleId: 2,
      title: '5.2. Resistance to Care (Bathing, Dressing, Hygiene)',
      description: 'Strategies for managing resistance to personal care activities.',
      type: 'Practical Training',
      duration: 45,
      points: 175,
      completed: isLessonCompleted('5.2'),
      isAvailable: isLessonAvailable('5.2'),
      subsection: '5.2',
      category: courseCategory,
      section: 'Active Behavioral Management',
      skills: ['Care Resistance', 'Personal Care', 'Dignity Preservation']
    },
    {
      id: 7,
      number: 7,
      moduleId: 2,
      title: '5.3. Wandering, Elopement Risk, and "Safe Freedom"',
      description: 'Managing wandering behaviors while maintaining autonomy and safety.',
      type: 'Safety Training',
      duration: 35,
      points: 125,
      completed: isLessonCompleted('5.3'),
      isAvailable: isLessonAvailable('5.3'),
      subsection: '5.3',
      category: courseCategory,
      section: 'Active Behavioral Management',
      skills: ['Wandering Management', 'Safety Planning', 'Environmental Safety']
    },
    {
      id: 8,
      number: 8,
      moduleId: 2,
      title: '5.4. Sleep Disruption and Day–Night Reversal',
      description: 'Addressing sleep issues and circadian rhythm disruptions in dementia.',
      type: 'Clinical Training',
      duration: 30,
      points: 100,
      completed: false,
      isAvailable: false,
      skills: ['Sleep Management', 'Circadian Rhythms', 'Behavioral Interventions']
    },
    {
      id: 9,
      number: 9,
      moduleId: 2,
      title: '5.5. Toileting, Incontinence, and Dignity-Preserving Routines',
      description: 'Managing incontinence while preserving dignity and independence.',
      type: 'Practical Training',
      duration: 40,
      points: 150,
      completed: false,
      isAvailable: false,
      skills: ['Incontinence Care', 'Dignity Preservation', 'Routine Management']
    },
    // Module 3: Complex Coordination & Risk
    {
      id: 10,
      number: 10,
      moduleId: 3,
      title: '6.1. Hallucinations, Delusions, and Misidentification (Validate + Redirect)',
      description: 'Managing psychotic symptoms using validation and redirection techniques.',
      type: 'Advanced Training',
      duration: 50,
      points: 200,
      completed: false,
      isAvailable: false,
      skills: ['Psychotic Symptoms', 'Validation Therapy', 'Redirection Techniques']
    },
    {
      id: 11,
      number: 11,
      moduleId: 3,
      title: '6.2. Nutrition, Swallowing Risk, and Hydration',
      description: 'Managing nutritional needs and swallowing difficulties in advanced dementia.',
      type: 'Medical Training',
      duration: 45,
      points: 175,
      completed: false,
      isAvailable: false,
      skills: ['Nutrition Management', 'Swallowing Safety', 'Hydration Monitoring']
    },
    {
      id: 12,
      number: 12,
      moduleId: 3,
      title: '6.3. Caregiver Contingency Planning ("What if I get sick?")',
      description: 'Creating backup care plans and emergency caregiver arrangements.',
      type: 'Planning Workshop',
      duration: 40,
      points: 150,
      completed: false,
      isAvailable: false,
      skills: ['Contingency Planning', 'Emergency Preparedness', 'Care Coordination']
    },
    {
      id: 13,
      number: 13,
      moduleId: 3,
      title: '6.4. Care Transitions and Higher Levels of Care',
      description: 'Planning and managing transitions to higher levels of care.',
      type: 'Transition Planning',
      duration: 45,
      points: 175,
      completed: false,
      isAvailable: false,
      skills: ['Care Transitions', 'Level of Care Assessment', 'Transition Planning']
    },
    {
      id: 14,
      number: 14,
      moduleId: 3,
      title: '6.5. Money Management and Fraud Risk',
      description: 'Protecting against financial exploitation and managing financial affairs.',
      type: 'Legal & Financial',
      duration: 35,
      points: 125,
      completed: false,
      isAvailable: false,
      skills: ['Financial Protection', 'Fraud Prevention', 'Legal Safeguards']
    }
  ] : isAdvancedResearchCourse ? [
    {
      id: 1,
      number: 1,
      moduleId: 1,
      title: 'Neuro-Educational Frameworks for Informal Caregivers',
      description: 'Study cognitive science-informed models for structuring caregiver education and retention.',
      type: 'Research Seminar',
      duration: 35,
      points: 120,
      completed: isLessonCompleted('1.1'),
      isAvailable: isLessonAvailable('1.1'),
      subsection: '1.1',
      category: courseCategory,
      section: 'Research Foundations',
      skills: ['Learning Theory', 'Caregiver Education', 'Neuroscience Basics']
    },
    {
      id: 2,
      number: 2,
      moduleId: 1,
      title: 'Implementation Science in Comprehensive Dementia Care Models',
      description: 'Apply implementation science principles to integrate caregiver interventions into real-world care systems.',
      type: 'Applied Frameworks',
      duration: 40,
      points: 140,
      completed: isLessonCompleted('1.2'),
      isAvailable: isLessonAvailable('1.2'),
      subsection: '1.2',
      category: courseCategory,
      section: 'Research Foundations',
      skills: ['Implementation Science', 'Program Design', 'Care Model Integration']
    },
    {
      id: 3,
      number: 3,
      moduleId: 1,
      title: 'Ethnocultural Personalization of Caregiver Interventions',
      description: 'Design culturally responsive caregiver strategies across diverse family and community settings.',
      type: 'Case-Based Research',
      duration: 35,
      points: 125,
      completed: isLessonCompleted('1.3'),
      isAvailable: isLessonAvailable('1.3'),
      subsection: '1.3',
      category: courseCategory,
      section: 'Research Foundations',
      skills: ['Cultural Responsiveness', 'Intervention Design', 'Family-Centered Care']
    },
    {
      id: 4,
      number: 4,
      moduleId: 2,
      title: 'AI-Driven Adaptive Learning for Caregiver Training',
      description: 'Examine adaptive learning systems and analytics for personalized caregiver training pathways.',
      type: 'Technology Lab',
      duration: 45,
      points: 160,
      completed: isLessonCompleted('1.4'),
      isAvailable: isLessonAvailable('1.4'),
      subsection: '1.4',
      category: courseCategory,
      section: 'Technology, Ethics, and Practice',
      skills: ['AI in Education', 'Adaptive Learning', 'Data-Informed Personalization']
    },
    {
      id: 5,
      number: 5,
      moduleId: 2,
      title: 'Ethical Implications of Assistive "Robotherapy" Training',
      description: 'Evaluate ethical risks and safeguards when deploying assistive robotics in caregiver learning contexts.',
      type: 'Ethics Review',
      duration: 40,
      points: 145,
      completed: isLessonCompleted('1.5'),
      isAvailable: isLessonAvailable('1.5'),
      subsection: '1.5',
      category: courseCategory,
      section: 'Technology, Ethics, and Practice',
      skills: ['AI Ethics', 'Assistive Robotics', 'Risk-Benefit Analysis']
    },
    {
      id: 6,
      number: 6,
      moduleId: 3,
      title: 'Financial and Legal Health Literacy for Family Caregivers',
      description: 'Build practical literacy in legal planning, healthcare finance, and caregiver rights navigation.',
      type: 'Policy & Literacy',
      duration: 35,
      points: 130,
      completed: isLessonCompleted('1.6'),
      isAvailable: isLessonAvailable('1.6'),
      subsection: '1.6',
      category: courseCategory,
      section: 'Caregiver Systems & Simulation',
      skills: ['Health Literacy', 'Caregiver Rights', 'Financial Planning']
    },
    {
      id: 7,
      number: 7,
      moduleId: 3,
      title: 'Virtual Reality (VR) Simulation for Caregiver Scenario Training',
      description: 'Use immersive simulation methods to strengthen decision-making and communication in high-stress care scenarios.',
      type: 'Simulation Lab',
      duration: 50,
      points: 180,
      completed: isLessonCompleted('1.7'),
      isAvailable: isLessonAvailable('1.7'),
      subsection: '1.7',
      category: courseCategory,
      section: 'Caregiver Systems & Simulation',
      skills: ['VR Simulation', 'Decision-Making', 'Scenario-Based Training']
    }
  ] : [
    // Module 1: Foundational Knowledge and Early-Stage Care
    {
      id: 1,
      number: 1,
      moduleId: 1,
      title: '1.1. Understanding Dementia and Disease Progression',
      description: 'Identifying dementia and Alzheimer\'s, recognizing that stages are general guides, and understanding that symptoms vary by person.',
      duration: 25,
      points: 75,
      completed: isLessonCompleted('1.1'),
      isAvailable: isLessonAvailable('1.1'),
      subsection: '1.1',
      category: courseCategory,
      section: 'Foundational Knowledge and Early-Stage Care',
      quiz: lesson11Questions
    },
    {
      id: 2,
      number: 2,
      moduleId: 1,
      title: '1.2. Prioritizing Caregiver Well-being and Support',
      description: 'Understanding the importance of caregiver self-care and building support networks.',
      type: 'Interactive Lesson',
      duration: 20,
      points: 50,
      completed: isLessonCompleted('1.2'),
      isAvailable: isLessonAvailable('1.2'),
      subsection: '1.2',
      category: courseCategory,
      section: 'Foundational Knowledge and Early-Stage Care',
      quiz: lesson12Questions
    },
    {
      id: 3,
      number: 3,
      moduleId: 1,
      title: '1.3. Communication Basics',
      description: 'Fundamental communication strategies for interacting with people with dementia.',
      type: 'Video + Practice',
      duration: 30,
      points: 100,
      completed: isLessonCompleted('1.3'),
      isAvailable: isLessonAvailable('1.3'),
      subsection: '1.3',
      category: courseCategory,
      section: 'Foundational Knowledge and Early-Stage Care',
      skills: ['Communication', 'Verbal Techniques', 'Non-verbal Cues']
    },
    {
      id: 4,
      number: 4,
      moduleId: 1,
      title: '1.4. Early Planning for Independence',
      description: 'Strategies for maintaining independence and planning for future care needs.',
      type: 'Reading + Assessment',
      duration: 35,
      points: 125,
      completed: isLessonCompleted('1.4'),
      isAvailable: isLessonAvailable('1.4'),
      subsection: '1.4',
      category: courseCategory,
      section: 'Foundational Knowledge and Early-Stage Care',
      skills: ['Early Planning', 'Independence', 'Future Care Planning']
    },
    // Module 2: Daily Routines and Safety
    {
      id: 5,
      number: 5,
      moduleId: 2,
      title: '2.1. Structuring Daily Activities and Consistency',
      description: 'Creating routine and structure to support daily functioning.',
      type: 'Interactive Lesson',
      duration: 25,
      points: 75,
      completed: isLessonCompleted('2.1'),
      isAvailable: isLessonAvailable('2.1'),
      subsection: '2.1',
      category: courseCategory,
      section: 'Daily Routines and Safety',
      skills: ['Daily Routines', 'Structure', 'Consistency']
    },
    {
      id: 6,
      number: 6,
      moduleId: 2,
      title: '2.2. Simplifying Activities of Daily Living (ADLs)',
      description: 'Techniques for making everyday tasks more manageable.',
      type: 'Video + Practice',
      duration: 30,
      points: 100,
      completed: isLessonCompleted('2.2'),
      isAvailable: isLessonAvailable('2.2'),
      subsection: '2.2',
      category: courseCategory,
      section: 'Daily Routines and Safety',
      skills: ['ADLs', 'Task Simplification', 'Assistance Techniques']
    },
    {
      id: 7,
      number: 7,
      moduleId: 2,
      title: '2.3. Home Safety and Environmental Modification',
      description: 'Creating a safe and supportive home environment.',
      type: 'Assessment + Checklist',
      duration: 40,
      points: 150,
      completed: isLessonCompleted('2.3'),
      isAvailable: isLessonAvailable('2.3'),
      subsection: '2.3',
      category: courseCategory,
      section: 'Daily Routines and Safety',
      skills: ['Home Safety', 'Environmental Design', 'Risk Assessment']
    },
    {
      id: 8,
      number: 8,
      moduleId: 2,
      title: '2.4. Management of Common Behavioral Changes (BPSD)',
      description: 'Understanding and managing behavioral and psychological symptoms of dementia.',
      type: 'Case Studies',
      duration: 45,
      points: 175,
      completed: isLessonCompleted('2.4'),
      isAvailable: isLessonAvailable('2.4'),
      subsection: '2.4',
      category: courseCategory,
      section: 'Daily Routines and Safety',
      skills: ['BPSD', 'Behavioral Management', 'Intervention Strategies']
    },
    // Module 3: Specialized Care and Intervention
    {
      id: 9,
      number: 9,
      moduleId: 3,
      title: '3.1. Complex Physical Care Needs',
      description: 'Managing advanced physical care requirements and medical complexities.',
      type: 'Expert Training',
      duration: 50,
      points: 200,
      completed: isLessonCompleted('3.1'),
      isAvailable: isLessonAvailable('3.1'),
      subsection: '3.1',
      category: courseCategory,
      section: 'Specialized Care and Intervention',
      skills: ['Physical Care', 'Medical Management', 'Complex Needs']
    },
    {
      id: 10,
      number: 10,
      moduleId: 3,
      title: '3.2. Ethical Decision-Making in Advanced Dementia',
      description: 'Navigating complex ethical decisions and advance directives in dementia care.',
      type: 'Ethics Workshop',
      duration: 45,
      points: 175,
      completed: false,
      isAvailable: false,
      skills: ['Medical Ethics', 'Decision Making', 'Legal Considerations']
    },
    {
      id: 11,
      number: 11,
      moduleId: 3,
      title: '3.3. Navigating End-of-Life Unpreparedness and Support',
      description: 'Providing compassionate end-of-life care and supporting families through the process.',
      type: 'Advanced Case Studies',
      duration: 55,
      points: 225,
      completed: false,
      isAvailable: false,
      skills: ['End-of-Life Care', 'Family Support', 'Palliative Care']
    }
  ];

  const currentModuleLessons = mockLessons.filter(lesson =>
    lesson.moduleId === activeModule
  );

  return (
    <div className="course-page">
      {loading && <div className="loading-indicator">Loading questions...</div>}
      {progressLoading && <div className="progress-indicator">📊 Loading your progress...</div>}
      {refreshTrigger > 0 && (
        <div className="refresh-indicator">
          🔄 Updating progress... Next lesson will be unlocked shortly!
        </div>
      )}

      <section className="course-page-overview-container">
        <CourseHeader
          course={mockCourse}
          progress={courseProgress ? {
            ...mockProgress,
            completedLessons: courseProgress.completedSubsections?.length || 0,
            progressPercentage: courseProgress.progress || 0
          } : mockProgress}
        />
      </section>

      <div className="course-page-content">
        <aside className="course-page-modules-container">
          <CourseNavigation
            modules={mockModules}
            activeModule={activeModule}
            onModuleChange={setActiveModule}
          />
        </aside>

        <section className="course-page-lesson-container">
          <div className="course-lessons">
            <div className="lessons-header">
              <h2>
                {mockModules.find(m => m.id === activeModule)?.title || 'Lessons'}
              </h2>
              <div className="lessons-actions">
                <button className="btn btn-secondary btn-small">
                  Download Materials
                </button>
                {courseProgress && (
                  <span className="progress-text">
                    {courseProgress.completedSubsections?.length || 0} lessons completed
                  </span>
                )}
              </div>
            </div>

            <div className="lessons-list">
              {currentModuleLessons.map(lesson => (
                <LessonItem
                  key={lesson.id}
                  lesson={lesson}
                  courseProgress={mockProgress}
                  onStartLesson={onStartLesson}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CoursePage;