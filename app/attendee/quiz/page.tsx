'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage, User, QuizResult } from '@/lib/storage';
import questionsData from '@/lib/mcqs.json';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
}

export default function AttendeeQuiz() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [quizStartTime] = useState(new Date().toISOString());

  // -- Attention Monitoring States --
  const [attentionStatus, setAttentionStatus] = useState('');
  const [attentionCount, setAttentionCount] = useState(0);
  const [notAttentionCount, setNotAttentionCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [showAttentionWarning, setShowAttentionWarning] = useState(false);
  const [videoFrame, setVideoFrame] = useState<string>('');
  const eventSourceRef = useRef<EventSource | null>(null);

  // 1. Initialize User & Questions
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.push('/attendee/login');
      return;
    }
    const user = JSON.parse(storedUser);
    setCurrentUser(user);

    const shuffled = [...questionsData].sort(() => 0.10 - Math.random());
    setQuestions(shuffled.slice(0,5));
    setLoading(false);
  }, [router]);

  // 2. Attention Monitoring Implementation
  useEffect(() => {
    let errorOccurred = false;
    // Connect to Python backend
    eventSourceRef.current = new EventSource('http://127.0.0.1:5001/video');

    eventSourceRef.current.onmessage = function (event) {
      if (!errorOccurred) {
        try {
          const data = JSON.parse(event.data);
          setAttentionStatus(data.Prediction || '');
          setTotalCount((prev) => prev + 1);

          if (data.frame) {
            setVideoFrame(data.frame);
          }

          if (
            data.Prediction === 'attention' ||
            data.Prediction === 'Attention'
          ) {
            setAttentionCount((prev) => prev + 1);
            setNotAttentionCount(0);
          } else {
            setNotAttentionCount((prev) => prev + 1);
          }

          // Warning if distracted for ~1 second (assuming 30fps, 30 frames)
          if (notAttentionCount >= 30) {
            setShowAttentionWarning(true);
          }
        } catch (e) {
          console.error('Error parsing event data:', e);
        }
      }
    };

    eventSourceRef.current.onerror = function () {
      errorOccurred = true;
      setAttentionStatus('Error connecting to attention monitor');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [notAttentionCount]); 

  // 3. Sync Live Data
  useEffect(() => {
    if (!currentUser || questions.length === 0) return;

    const attentionPercentage = totalCount > 0 ? Math.round((attentionCount / totalCount) * 100) : 100;

    const saveProgress = () => {
      // Fetch existing result to get history
      const existing = storage.getResults().find(r => r.id === `${currentUser.id}-${quizStartTime}`);
      const currentHistory = existing?.attentionHistory || [];

      const newHistory = [...currentHistory, attentionPercentage];

      const currentResult: QuizResult = {
        id: `${currentUser.id}-${quizStartTime}`,
        userId: currentUser.id,
        score: 0,
        totalQuestions: questions.length,
        timestamp: quizStartTime,
        startTime: quizStartTime,
        endTime: new Date().toISOString(), 
        attentionScore: attentionPercentage,
        attentionHistory: newHistory,
        status: 'ongoing',
        answers: Object.entries(answers).map(([qId, ans]) => {
          const q = questions.find(q => q.id === parseInt(qId));
          return {
            questionId: parseInt(qId),
            answer: ans,
            correct: q ? q.correctAnswer === ans : false
          };
        })
      };
      storage.saveResult(currentResult);
    };

    // Save periodically or on change
    const debounceSave = setTimeout(saveProgress, 500);
    return () => clearTimeout(debounceSave);

  }, [answers, currentQuestionIndex, currentUser, questions, quizStartTime, attentionCount, totalCount]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) {
      alert('Please select an answer');
      return;
    }

    const currentQ = questions[currentQuestionIndex];
    setAnswers({ ...answers, [currentQ.id]: selectedAnswer });

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
    } else {
      submitQuiz({ ...answers, [currentQ.id]: selectedAnswer });
    }
  };

  const submitQuiz = (finalAnswers: Record<number, string>) => {
    if (!currentUser) return;
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    let score = 0;
    const finalAnswersList = questions.map(q => {
      const ans = finalAnswers[q.id];
      const isCorrect = ans === q.correctAnswer;
      if (isCorrect) score++;
      return {
        questionId: q.id,
        answer: ans,
        correct: isCorrect
      };
    });

    const attentionPercentage = totalCount > 0 ? Math.round((attentionCount / totalCount) * 100) : 100;

    // Get final history
    const existing = storage.getResults().find(r => r.id === `${currentUser.id}-${quizStartTime}`);
    const finalHistory = existing?.attentionHistory || [];

    const result: QuizResult = {
      id: `${currentUser.id}-${quizStartTime}`,
      userId: currentUser.id,
      score: score,
      totalQuestions: questions.length,
      timestamp: quizStartTime,
      startTime: quizStartTime,
      endTime: new Date().toISOString(),
      attentionScore: attentionPercentage,
      attentionHistory: finalHistory,
      status: 'completed',
      answers: finalAnswersList
    };

    storage.saveResult(result);
    router.push('/attendee/results');
  };

  if (loading || !currentUser) return <div className="p-8 text-center">Loading Quiz...</div>;

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* LEFT COLUMN: Quiz Content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Question {currentQuestionIndex + 1}/{questions.length}
              </h1>
              <span className="text-sm text-gray-500">
                User: {currentUser.name}
              </span>
            </div>
            <Progress value={((currentQuestionIndex) / questions.length) * 100} className="h-2" />
          </div>

          <Card className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {currentQuestion.question}
            </h2>

            <div className="space-y-4">
              {currentQuestion.options.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAnswer === option
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <input
                    type="radio"
                    name="answer"
                    value={option}
                    checked={selectedAnswer === option}
                    onChange={() => handleAnswerSelect(option)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-4 text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleNextQuestion}
              size="lg"
              className="w-full sm:w-auto"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN: Camera & Attention */}
        <div className="md:col-span-1 space-y-6">
          {/* Camera Feed */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-center">Live Monitor</h3>
            {videoFrame ? (
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img
                  src={`data:image/jpeg;base64,${videoFrame}`}
                  alt="Live camera"
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${attentionStatus === 'Attention' || attentionStatus === 'attention'
                  ? 'bg-green-500 text-white'
                  : 'bg-red-500 text-white'
                  }`}>
                  {attentionStatus || 'Scanning...'}
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                Connecting to Camera...
              </div>
            )}
          </div>

          {/* Attention Warning */}
          {showAttentionWarning && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded animate-pulse">
              <h3 className="font-bold text-red-700 text-sm">⚠️ Attention Required</h3>
              <p className="text-red-600 text-xs">
                Please focus on the screen.
              </p>
            </div>
          )}

          {/* Real-time Stats */}
          <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500">Attention Score</p>
              <p className={`text-3xl font-bold ${(totalCount > 0 ? (attentionCount / totalCount) * 100 : 100) > 80
                ? 'text-green-600'
                : 'text-red-500'
                }`}>
                {totalCount > 0 ? Math.round((attentionCount / totalCount) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
