
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, FinancialAdvice, Level, Quiz } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SOURCE_MATERIAL: Record<string, string> = {
  'money-basics': `
    1.1 Income & Expenses
    Section A: Understanding Income (Money Coming In)
    Income is any money you receive. It doesn’t matter how it comes — what matters is how regular and reliable it is.
    Main Types of Income: Active income (salary, wages), Business income (profits), Passive income (interest, rent).
    Gross vs Take-Home: Always plan expenses using take-home income (after tax/deductions), not gross.
    Fixed vs Variable Income: Fixed is easier to manage; Variable needs buffer.
    Section B: Understanding Expenses
    Needs (Essentials: food, rent) vs Wants (Comforts: eating out). Confusing wants as needs is a major mistake.
    Fixed vs Variable Expenses.
    Expense Leakage: Small daily expenses (Latte factor) add up. If you don’t track expenses, money disappears.

    1.2 Budgeting & Cash Flow
    Section A: Budgeting
    A budget is a plan for money before spending it. Income - Planned Expenses - Planned Savings = Control.
    Rules: Spend less than earned. Save fixed amount monthly. Keep lifestyle checks.
    Structure: Needs / Wants / Savings.
    Section B: Cash Flow
    Cash flow is timing. You can earn well but be broke if income comes once but expenses are daily.
    Positive Cash Flow: Money in before money out. Negative Cash Flow: Relying on debt/credit.
    
    1.3 Inflation & Value of Money
    Section A: Inflation
    Prices increase over time. ₹100 today buys less next year. Ignoring inflation is dangerous.
    Section B: Saving isn't Enough
    Idle money loses value due to inflation. Saving protects money; Growth (Investing) protects value.
  `,
  'banking': `
    2.1 Bank Accounts
    Section A: Types
    Savings (Daily use, small interest), Salary (Zero balance, tied to job), Current (Business, no interest).
    Section B: Maintenance
    Minimum Balance penalties. Bank statements show money flow and hidden charges. Reading statements is mandatory.

    2.2 How Banks Earn
    Section A: Spread
    Banks take deposits (pay low interest) and lend loans (charge high interest). The difference is their profit.
    Section B: Fees
    Interest on loans, maintenance charges, late penalties, ATM fees. Small fees ignored become big losses.

    2.3 Everyday Operations
    Section A: Tools
    ATM, Cheques, Net Banking. Digital is easy but needs care.
    Section B: Safety
    KYC (Know Your Customer), PAN. Never share OTP/PIN. Safety is user responsibility.
  `,
  'digital-payments': `
    3.1 How UPI Works
    Section A: Basics
    Unified Payments Interface. Instant bank-to-bank. Apps don't hold money; banks do. Connects Bank + Mobile + UPI ID.
    Section B: Apps & Limits
    Apps (GPay, PhonePe) are interfaces. Limits exist for security (Per transaction / Daily).

    3.2 Transfers & Payments
    Section A: Methods
    UPI (Small/Daily/Fast), IMPS (Instant), NEFT (Batches), RTGS (Large amounts).
    Section B: QR Codes
    Static (Small shops) vs Dynamic (Auto-amount). Always verify name/amount. Never scan to RECEIVE money.

    3.3 Failed Payments
    Section A: Failure
    Network/Server issues. Money isn't lost; auto-reverses.
    Section B: Refunds
    Wait for auto-refund. Raise complaint with Transaction ID.
  `,
  'saving-investing': `
    4.1 Saving Options
    Section A: Priority
    Saving creates stability and mental peace. Habit > Amount.
    Section B: Tools
    Savings Account (Liquidity), Fixed Deposit (Lock-in, higher interest), Recurring Deposit (Discipline).

    4.2 Returns & Compounding
    Section A: Returns
    Profit generated. Depends on Time, Rate, Consistency. High return = High risk.
    Section B: Compounding
    Earning interest on interest. Time is the multiplier. Start early.

    4.3 Risk Basics
    Section A: Types
    Low, Medium, High. No option is risk-free.
    Section B: Balance
    Inflation risk vs Market risk. Short term = Low risk. Long term = Controlled risk.
  `,
  'loans-credit': `
    5.1 Types of Loans
    Section A: Definition
    Borrowed money returned with interest. Tool vs Trap.
    Section B: Types
    Personal (Unsecured, High Interest), Home (Secured, Long term), Education (Skill investment), Vehicle (Depreciating asset).

    5.2 EMIs & Interest
    Section A: EMI
    Principal + Interest. Early EMIs are mostly interest.
    Section B: Calculation
    Flat rate (Expensive) vs Reducing Balance (Cheaper). Compare total repayment amount.

    5.3 Credit Cards & Score
    Section A: Cards
    Short term borrowing. Pay full = No interest. Pay minimum = Debt trap.
    Section B: CIBIL/Score
    Repayment history. Good score = Cheaper loans. Bad score = Rejection. Privilege, not income.
  `,
  'safety-protection': `
    6.1 Digital Safety
    Section A: Fraud
    Social engineering (Greed/Panic). Fake refunds, OTP scams, Phishing.
    Section B: Action
    Block card/account immediately. Report to bank. Speed limits damage.

    6.2 Tax Basics
    Section A: Purpose
    Funds public services. Mandatory.
    Section B: Terms
    PAN (Tracking), Income Tax (On earnings), Form 16 (Salary proof).

    6.3 Insurance
    Section A: Purpose
    Protection, not investment. Covers shocks.
    Section B: Essentials
    Health (Hospital bills), Term Life (Dependents). Nominee details are crucial.
  `
};

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
  categoryId: string, 
  difficulty: string, 
  topics: { level1: string, level2: string, level3: string },
  language: string = 'en',
  userRank: string = 'Beginner I'
): Promise<Level[]> => {
  const langMap: Record<string, string> = {
    en: 'English', te: 'Telugu', kn: 'Kannada', ml: 'Malayalam', ta: 'Tamil', hi: 'Hindi'
  };
  const targetLang = langMap[language] || 'English';

  // Fallback to money-basics if ID not found, mostly for safety
  const sourceText = SOURCE_MATERIAL[categoryId] || SOURCE_MATERIAL['money-basics'];

  const prompt = `
    Create a highly structured financial learning roadmap for the category ID: "${categoryId}".
    Target Language: ${targetLang}.
    Current User Rank: ${userRank}.
    
    SOURCE MATERIAL (GROUND TRUTH):
    ${sourceText}

    INSTRUCTIONS:
    1. Base all lesson content on the SOURCE MATERIAL provided above.
    2. CRITICAL: ADJUST COMPLEXITY BASED ON RANK ("${userRank}"):
       - **Beginner (I, II, III)**: Simplify the source material. Focus on "What" and "Why". Use simple analogies. Keep it foundational.
       - **Intermediate (I, II, III)**: Use the source material as a base but EXPAND on "How". Discuss optimization, nuances, and common mistakes mentioned in the text.
       - **Expert/Grandmaster**: The source material is just a starting point. EXPAND SIGNIFICANTLY with advanced strategies, leverage, risk/reward ratios, and macro-economic implications related to these topics. Make it challenging.
    
    3. Structure:
       - Create exactly 3 Levels.
       - Level 1 covers: ${topics.level1}
       - Level 2 covers: ${topics.level2}
       - Level 3 covers: ${topics.level3}
       - Each Level must have exactly 2 Lessons.
    
    4. Quiz Rules:
       - For Beginner: Direct questions from the text.
       - For Expert: Scenario-based questions that require application of the concept.

    5. Resources: Provide 2 real-world resource titles (Articles/Tools) for each lesson.
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
    - Beginner Ranks: Focus on definitions and basic rules.
    - Intermediate Ranks: Focus on calculation logic and situational choices.
    - Expert Ranks: Focus on complex scenarios, tax implications, and portfolio strategy.
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
