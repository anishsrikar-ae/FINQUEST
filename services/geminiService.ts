
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialAdvice, Level, Quiz } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]): Promise<FinancialAdvice> => {
  const prompt = `
    Analyze the following financial transaction history and provide strategic financial advice.
    Transactions: ${JSON.stringify(transactions)}
    
    Provide a concise summary, a list of actionable recommendations, and a market/personal outlook (Bullish, Bearish, or Neutral).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          outlook: { 
            type: Type.STRING,
            enum: ["Bullish", "Bearish", "Neutral"]
          }
        },
        required: ["summary", "recommendations", "outlook"]
      },
    },
  });

  const jsonStr = response.text?.trim();
  try {
    return JSON.parse(jsonStr || "{}");
  } catch (e) {
    return {
      summary: "Strategic adjustment recommended.",
      recommendations: ["Review monthly subscriptions", "Optimize savings rate"],
      outlook: "Neutral"
    };
  }
};

export const generateCustomRoadmap = async (
  categoryTitle: string, 
  difficulty: string, 
  topics: { level1: string, level2: string, level3: string },
  language: string = 'en',
  userRank: string = 'Beginner I'
): Promise<Level[]> => {
  const langMap: Record<string, string> = {
    en: 'English',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    ta: 'Tamil',
    hi: 'Hindi'
  };
  const targetLang = langMap[language] || 'English';

  const prompt = `
    Create a highly structured financial learning roadmap for the category: "${categoryTitle}".
    Base Difficulty: ${difficulty}.
    Current User Rank: ${userRank}.
    Language: ${targetLang}.
    
    Curriculum structure to follow:
    - Level 1 Topic: ${topics.level1}
    - Level 2 Topic: ${topics.level2}
    - Level 3 Topic: ${topics.level3}

    Guidelines:
    - IMPORTANT: Adjust the complexity of the content based on the User Rank ("${userRank}").
      - If Rank is Beginner (I-III): Keep concepts simple, foundational, and easy to digest. Focus on 'What' and 'Why'.
      - If Rank is Intermediate (I-III): Introduce 'How' in depth, nuance, exceptions, and optimization strategies.
      - If Rank is Expert/Grandmaster: Focus on advanced leverage, complex instruments, tax-loss harvesting, hedging, and wealth preservation at scale.
    - Exactly 3 levels.
    - Each level must have exactly 2 lessons (Lesson A: Concept, Lesson B: Practical Application/Analysis).
    - Each lesson needs a title, content (3-4 sentences), a 4-option quiz with one correct index.
    - IMPORTANT: Include 2 relevant educational resources (Articles, Videos, or Tools) for each lesson.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            title: { type: Type.STRING },
            lessons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  content: { type: Type.STRING },
                  unlocked: { type: Type.BOOLEAN },
                  resources: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['Article', 'Video', 'Tool'] },
                        url: { type: Type.STRING }
                      },
                      required: ['title', 'type', 'url']
                    }
                  },
                  quiz: {
                    type: Type.OBJECT,
                    properties: {
                      question: { type: Type.STRING },
                      options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                      },
                      correct: { type: Type.INTEGER }
                    },
                    required: ["question", "options", "correct"]
                  }
                },
                required: ["id", "title", "content", "quiz", "resources"]
              }
            }
          },
          required: ["id", "title", "lessons"]
        }
      },
    },
  });

  const jsonStr = response.text?.trim();
  try {
    return JSON.parse(jsonStr || "[]");
  } catch (e) {
    console.error("Failed to generate roadmap", e);
    return [];
  }
};

export const generateRankExam = async (currentRank: string, language: string): Promise<Quiz[]> => {
  const langMap: Record<string, string> = {
    en: 'English', 'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam', 'ta': 'Tamil', 'hi': 'Hindi'
  };
  const targetLang = langMap[language] || 'English';

  const prompt = `
    Create a comprehensive 5-question Exam to test if a user is ready to graduate from rank "${currentRank}" in financial literacy.
    Language: ${targetLang}.
    
    The questions should cover a mix of topics: Money Basics, Banking, Digital Payments, Investing, Loans, and Safety.
    
    Guidelines:
    - Questions must be strictly appropriate for the difficulty of "${currentRank}".
    - Return exactly 5 questions.
    - Each question has 4 options and 1 correct index.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            correct: { type: Type.INTEGER }
          },
          required: ["question", "options", "correct"]
        }
      },
    },
  });

  const jsonStr = response.text?.trim();
  try {
    return JSON.parse(jsonStr || "[]");
  } catch (e) {
    return [];
  }
};
