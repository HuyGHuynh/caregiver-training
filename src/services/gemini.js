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