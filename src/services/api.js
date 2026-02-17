const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Fetch questions with fallback to mock data
export const fetchQuestions = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/api/questions?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    if (result.success) {
      // Transform API data to match frontend format
      return result.data.map(q => ({
        id: q._id,
        question: q.content?.text || q.question,
        options: q.choices?.map(c => c.text) || q.options || [],
        answer: q.correctAnswer || q.answer,
        explanation: q.explanation,
        hint: q.hint
      }));
    } else {
      throw new Error(result.error || 'Failed to fetch questions');
    }
  } catch (error) {
    console.warn('API Error, using mock data:', error.message);
    return getMockQuestions(filters);
  }
};

// Mock data fallback
const getMockQuestions = (filters) => {
  const mockQuestions = [
    {
      id: "mock-1",
      question: "Dementia is best defined as:",
      options: [
        "A normal part of aging",
        "A disease caused only by stress",
        "A group of symptoms that affect thinking and daily functioning",
        "A type of depression"
      ],
      answer: "C",
      subsection: "1.1",
      explanation: null
    },
    {
      id: "mock-2",
      question: "Alzheimer's disease is:",
      options: [
        "The same thing as dementia",
        "A type/cause of dementia and the most common one",
        "A temporary memory problem",
        "Only caused by lack of sleep"
      ],
      answer: "B",
      subsection: "1.1",
      explanation: null
    },
    {
      id: "mock-3",
      question: "Which statement about \"stages\" of dementia is most accurate?",
      options: [
        "Stages predict the exact timeline for everyone",
        "Stages are general guides; symptoms and speed vary by person",
        "Stages are the same as test scores",
        "Stages only matter for research, not caregiving"
      ],
      answer: "B",
      subsection: "1.1",
      explanation: null
    },
    {
      id: "mock-4",
      question: "Which example suggests more than normal aging and may indicate dementia?",
      options: [
        "Occasionally forgetting a name but remembering later",
        "Misplacing keys sometimes",
        "Getting lost in a familiar place",
        "Taking longer to learn a new app"
      ],
      answer: "C",
      subsection: "1.1",
      explanation: null
    }
  ];

  // Apply filters
  let filtered = mockQuestions;
  
  if (filters.subsection) {
    filtered = filtered.filter(q => q.subsection === filters.subsection);
  }
  
  return filtered;
};