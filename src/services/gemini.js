const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

if (!GEMINI_API_KEY) {
    console.warn('Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.');
}

export const askGemini = async (questionContext) => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
    }

    const prompt = `You are a certified caregiver training coach.

The learner is currently answering this question:

[QUESTION_CONTEXT]
Question: ${questionContext.question}
Options: ${questionContext.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`).join('\n')}
${questionContext.correctAnswer ? `Correct Answer: ${questionContext.correctAnswer}` : ''}
${questionContext.explanation ? `Explanation: ${questionContext.explanation}` : ''}
${questionContext.userQuestion ? `\nUser's specific question: ${questionContext.userQuestion}` : ''}

Your job:
1. Identify what competency or safety principle this question is testing.
2. Explain the clinical reasoning behind the correct concept.
3. Clarify why the other possible misunderstandings would be incorrect.
4. Provide one safety-focused takeaway for real caregiving situations.

Tone:
- Professional but supportive
- Clear and structured
- Focused on patient safety and best practices

Do not provide unrelated medical details.
Keep the response at most 2 sentences.
If the user ask unrelevant questions, response with cannot answer in supportive manner.
Do not give any markdown styling or formatting in the response.
Keep the explanation aligned strictly with the concept in the question.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Invalid response format from Gemini API');
        }
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
};

export const generateMindfulnessActivity = async (context = {}) => {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key is not configured');
    }

    const prompt = `You are a calm and encouraging caregiver wellbeing coach.

Create one short mindfulness activity for a dementia caregiver who has just finished a lesson.

Context:
- Course: ${context.courseTitle || 'Dementia caregiving training'}
- Lesson: ${context.lessonTitle || 'Lesson completed'}
- Focus: ${context.lessonFocus || 'caregiver recovery, calm, and emotional reset'}

Output rules:
- Return only the activity text.
- Write exactly one complete sentence.
- Keep it between 10 and 18 words.
- Start with a strong action verb like Take, Breathe, Pause, Sit, or Notice.
- Make it easy to do in 1 to 3 minutes.
- Use warm, practical language that feels supportive and real.
- Avoid lists, headings, quotes, emojis, markdown, and explanations.
- Avoid clinical jargon, therapy language, and anything that needs special equipment.

Style example only, do not copy exactly:
Take three slow breaths and notice one sound, one sight, and one place your body feels supported.`;

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 800
                }
            })
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API Error: ${response.status} - ${error}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
            throw new Error('Invalid response format from Gemini API');
        }

        const cleanedText = rawText
            .replace(/^[-*•\s]+/, '')
            .replace(/^"|"$/g, '')
            .trim();

        if (!cleanedText) {
            throw new Error('Invalid mindfulness activity format');
        }

        if (cleanedText.toLowerCase() === 'gently') {
            throw new Error('Invalid mindfulness activity format');
        }

        return cleanedText;
    } catch (error) {
        console.error('Error generating mindfulness activity:', error);
        throw error;
    }
};