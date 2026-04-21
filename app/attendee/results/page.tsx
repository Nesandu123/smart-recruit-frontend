'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface QuizData {
  quizSessionId: number;
  score: number;
  totalQuestions: number;
  attentionScore: number;
  answers: Array<{
    questionId: number;
    answer: string;
    correct: boolean;
  }>;
}

export default function AttendeeResults() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = () => {
      const storedUser = localStorage.getItem('currentUser');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);

      // Get latest result for this user from centralized storage
      const allResults = JSON.parse(localStorage.getItem('app_results') || '[]');
      const userResults = allResults.filter((r: any) => r.userId === user.id);

      if (userResults.length > 0) {
        // Sort by timestamp desc
        userResults.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setQuizData(userResults[0]);
      }
    };
    fetchResults();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-600">Loading results...</p>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl text-gray-600 mb-4">No quiz data found</p>
          <Link href="/attendee">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const percentage = (quizData.score / quizData.totalQuestions) * 100;
  const getResultColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResultBg = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-50';
    if (percentage >= 60) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Results Header */}
        <div className={`rounded-lg shadow-lg p-8 mb-8 text-center ${getResultBg(percentage)}`}>
          <h1 className="text-4xl font-bold mb-4">Quiz Complete! 🎉</h1>

          {/* Score */}
          <div className="mb-8">
            <p className={`text-6xl font-bold ${getResultColor(percentage)}`}>
              {quizData.score}/{quizData.totalQuestions}
            </p>
            <p className="text-2xl text-gray-600 mt-2">
              {Math.round(percentage)}%
            </p>
          </div>

          {/* Performance Message */}
          <div className="text-lg font-semibold text-gray-700 mb-4">
            {percentage >= 80 && "Excellent! Outstanding performance! 🌟"}
            {percentage >= 60 && percentage < 80 && "Good! You did well. Keep practicing! 👍"}
            {percentage < 60 && "You can do better. Practice more! 💪"}
          </div>
        </div>

        {/* Attention Metrics */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Attention Analysis
          </h2>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {quizData.attentionScore}%
              </div>
              <p className="text-gray-600 font-semibold">
                Attention Score
              </p>
              <div className="mt-4 w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{
                    width: `${quizData.attentionScore}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Answer Summary
          </h2>
          <div className="space-y-4">
            {quizData.answers.map((q, index) => {
              const isCorrect = q.correct;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                    }`}
                >
                  <p className="font-semibold text-gray-800">
                    Question {index + 1}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    <span className="font-semibold">Your Answer:</span>{' '}
                    {q.answer || 'Not answered'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-gray-600">
                      {/* Note: correct answer is not stored in answers array in storage.ts, so we can't show it easily here without fetching mcqs.json again. 
                          For now, I'll just show status. Or I can update storage.ts to include it. 
                          Wait, let me check storage.ts again. 
                          User's storage.ts interface says: { questionId: number; answer: string; correct: boolean }
                          So 'correct' exists.
                       */}
                      {/* Hiding expected answer for now as it's not in the saved result object */}
                    </p>
                  )}
                  <p className="text-sm font-semibold mt-2">
                    {isCorrect ? '✅ Correct' : '❌ Incorrect'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Link href="/attendee">
            <button className="bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-700">
              Back to Home
            </button>
          </Link>
          <Link href="/attendee/quiz">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700">
              Retake Quiz
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
