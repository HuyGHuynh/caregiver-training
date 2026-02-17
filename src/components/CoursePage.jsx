import React, { useState } from 'react';
import './CoursePage.css';

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

const CoursePage = ({ selectedCourse, onStartLesson = () => {} }) => {
  const [activeModule, setActiveModule] = useState(1);

  // Determine course content based on selected course
  const isIntermediateCourse = selectedCourse?.id === 2;
  
  // Mock data - replace with real data
  const mockCourse = {
    id: selectedCourse?.id || 1,
    title: isIntermediateCourse ? 'Intermediate Dementia Caregiving Knowledge' : 'Basic Best Practices of Dementia Caregiving',
    category: 'Healthcare & Caregiving',
    description: isIntermediateCourse 
      ? 'Advanced dementia caregiving strategies focusing on behavioral management, complex coordination, and specialized interventions for challenging situations.'
      : 'Comprehensive training in dementia caregiving from foundational knowledge through advanced care strategies and specialized interventions.',
    icon: isIntermediateCourse ? '🧠' : '🏥',
    color: isIntermediateCourse ? '#00AF54' : '#1181b2',
    totalLessons: isIntermediateCourse ? 13 : 11,
    estimatedTime: isIntermediateCourse ? '10-14 weeks' : '8-12 weeks',
    level: 'All Levels',
    ...selectedCourse
  };

  const mockProgress = {
    percentage: isIntermediateCourse ? 25 : 45,
    completed: isIntermediateCourse ? 3 : 5,
    remaining: isIntermediateCourse ? 10 : 6,
    pointsEarned: isIntermediateCourse ? 275 : 425,
    currentLesson: isIntermediateCourse ? 4 : 7
  };

  const mockModules = isIntermediateCourse ? [
    {
      id: 1,
      title: 'Foundational Adjustments (Easy)',
      totalLessons: 3,
      completedLessons: 3
    },
    {
      id: 2,
      title: 'Active Behavioral Management (Intermediate)',
      totalLessons: 5,
      completedLessons: 0
    },
    {
      id: 3,
      title: 'Complex Coordination & Risk (Advanced)',
      totalLessons: 5,
      completedLessons: 0
    }
  ] : [
    {
      id: 1,
      title: 'Foundational Knowledge and Early-Stage Care (Basic)',
      totalLessons: 4,
      completedLessons: 3
    },
    {
      id: 2,
      title: 'Intermediate Care Strategies: Daily Routines and Safety (Intermediate)',
      totalLessons: 4,
      completedLessons: 2
    },
    {
      id: 3,
      title: 'Advanced Care and Specialized Interventions (Advanced)',
      totalLessons: 3,
      completedLessons: 0
    }
  ];

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
      completed: true,
      isAvailable: true,
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
      completed: true,
      isAvailable: true,
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
      completed: true,
      isAvailable: true,
      skills: ['Sundowning Management', 'Behavioral Patterns', 'Environmental Modifications']
    },
    // Module 2: Active Behavioral Management (Intermediate)
    {
      id: 4,
      number: 4,
      moduleId: 2,
      title: '5.1. BPSD "Trigger → Behavior → Response" Framework',
      description: 'Understanding behavioral triggers and implementing appropriate response strategies.',
      type: 'Framework Training',
      duration: 40,
      points: 150,
      completed: false,
      isAvailable: true,
      skills: ['BPSD Framework', 'Trigger Identification', 'Response Planning']
    },
    {
      id: 5,
      number: 5,
      moduleId: 2,
      title: '5.2. Resistance to Care (Bathing, Dressing, Hygiene)',
      description: 'Strategies for managing resistance to personal care activities.',
      type: 'Practical Training',
      duration: 45,
      points: 175,
      completed: false,
      isAvailable: true,
      skills: ['Care Resistance', 'Personal Care', 'Dignity Preservation']
    },
    {
      id: 6,
      number: 6,
      moduleId: 2,
      title: '5.3. Wandering, Elopement Risk, and "Safe Freedom"',
      description: 'Managing wandering behaviors while maintaining autonomy and safety.',
      type: 'Safety Training',
      duration: 35,
      points: 125,
      completed: false,
      isAvailable: false,
      skills: ['Wandering Management', 'Safety Planning', 'Environmental Safety']
    },
    {
      id: 7,
      number: 7,
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
      id: 8,
      number: 8,
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
    // Module 3: Complex Coordination & Risk (Advanced)
    {
      id: 9,
      number: 9,
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
      id: 10,
      number: 10,
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
      id: 11,
      number: 11,
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
      id: 12,
      number: 12,
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
      id: 13,
      number: 13,
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
  ] : [
    // Module 1: Foundational Knowledge and Early-Stage Care (Basic)
    {
      id: 1,
      number: 1,
      moduleId: 1,
      title: '1.1. Understanding Dementia and Disease Progression',
      description: 'Identifying dementia and Alzheimer\'s, recognizing that stages are general guides, and understanding that symptoms vary by person.',
      duration: 25,
      points: 75,
      completed: true,
      isAvailable: true,
      quiz: [
        {
          question: "Dementia is best defined as:",
          options: [
            "A normal part of aging",
            "A disease caused only by stress",
            "A group of symptoms that affect thinking and daily functioning",
            "A type of depression"
          ],
          answer: "C"
        },
        {
          question: "Alzheimer's disease is:",
          options: [
            "The same thing as dementia",
            "A type/cause of dementia and the most common one",
            "A temporary memory problem",
            "Only caused by lack of sleep"
          ],
          answer: "B"
        },
        {
          question: "Which statement about \"stages\" of dementia is most accurate?",
          options: [
            "Stages predict the exact timeline for everyone",
            "Stages are general guides; symptoms and speed vary by person",
            "Stages are the same as test scores",
            "Stages only matter for research, not caregiving"
          ],
          answer: "B"
        },
        {
          question: "Which example suggests more than normal aging and may indicate dementia?",
          options: [
            "Occasionally forgetting a name but remembering later",
            "Misplacing keys sometimes",
            "Getting lost in a familiar place",
            "Taking longer to learn a new app"
          ],
          answer: "C"
        }
      ]
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
      completed: true,
      isAvailable: true,
      skills: ['Self-Care', 'Support Systems', 'Stress Management']
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
      completed: true,
      isAvailable: true,
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
      completed: false,
      isAvailable: true,
      skills: ['Care Planning', 'Independence', 'Future Planning']
    },
    // Module 2: Intermediate Care Strategies: Daily Routines and Safety (Intermediate)
    {
      id: 5,
      number: 5,
      moduleId: 2,
      title: '2.1. Structuring Daily Activities and Consistency',
      description: 'Creating routine and structure to support daily functioning.',
      type: 'Interactive Lesson',
      duration: 25,
      points: 75,
      completed: true,
      isAvailable: true,
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
      completed: true,
      isAvailable: true,
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
      completed: false,
      isAvailable: true,
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
      completed: false,
      isAvailable: true,
      skills: ['BPSD', 'Behavioral Management', 'Intervention Strategies']
    },
    // Module 3: Advanced Care and Specialized Interventions (Advanced)
    {
      id: 9,
      number: 9,
      moduleId: 3,
      title: '3.1. Complex Physical Care Needs',
      description: 'Managing advanced physical care requirements and medical complexities.',
      type: 'Expert Training',
      duration: 50,
      points: 200,
      completed: false,
      isAvailable: false,
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
      <CourseHeader course={mockCourse} progress={mockProgress} />
      
      <div className="course-content">
        <div className="course-sidebar">
          <CourseNavigation 
            modules={mockModules} 
            activeModule={activeModule}
            onModuleChange={setActiveModule}
          />
        </div>
        
        <div className="course-lessons">
          <div className="lessons-header">
            <h2>
              {mockModules.find(m => m.id === activeModule)?.title || 'Lessons'}
            </h2>
            <div className="lessons-actions">
              <button className="btn btn-secondary btn-small">
                Download Materials
              </button>
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
      </div>
    </div>
  );
};

export default CoursePage;