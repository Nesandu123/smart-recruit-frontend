'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { testsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, CheckCircle2, Code2, Target, Award, 
  MessageSquare, ArrowRight, SkipForward, AlertCircle, Terminal
} from 'lucide-react';

interface Question {
  id: number;
  pattern: string;
  question_text: string;
  difficulty: string;
  question_type: string;  // "text" or "code"
  max_marks: number;
  test_cases?: any[];  // For code questions
}

interface Test {
  id: number;
  repo_url: string;
  status: string;
  files_analyzed?: number;
  patterns_detected?: any[];
  algorithms_detected?: any;
  code_quality_score?: number;
  code_quality_grade?: string;
  selected_questions?: any[];
  current_question_index?: number;
}

export default function TestPage() {
  const params = useParams();
  const testId = parseInt(params.id as string);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [testReady, setTestReady] = useState(false); // New: explicit ready state
  const [testStarted, setTestStarted] = useState(false); // New: track if user clicked start
  
  const loadingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const loadTest = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const testResponse = await testsApi.getById(testId);
      if (testResponse.data) {
        const testData = testResponse.data as Test;
        setTest(testData);
        
        if (testData.status === 'analyzing') {
          // Poll again after 3 seconds
          timeoutRef.current = setTimeout(() => {
            loadingRef.current = false;
            loadTest();
          }, 3000);
          return;
        }
        
        if (['ready', 'in_progress', 'completed'].includes(testData.status)) {
          const questionsResponse = await testsApi.getQuestions(testId);
          if (questionsResponse.data) {
            const questionData = questionsResponse.data as Question[];
            setQuestions(questionData);
            setCurrentQuestionIndex(testData.current_question_index || 0);
            
            // If status is 'ready', show the "Start Test" button
            if (testData.status === 'ready') {
              setTestReady(true);
              setLoading(false);
              return;
            }
            
            // If already in_progress, mark as started
            if (testData.status === 'in_progress') {
              setTestStarted(true);
            }
            
            if (testData.status === 'completed') {
              router.push(`/test/${testId}/results`);
              return;
            }
          }
        }
      } else {
        setError(testResponse.error || 'Failed to load test');
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [testId, router]);

  useEffect(() => {
    if (user && testId) {
      loadTest();
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user, testId, loadTest]);

  const handleStartTest = async () => {
    setLoading(true);
    const response = await testsApi.start(testId);
    if (response.data) {
      const testData = response.data as Test;
      setTestReady(false);
      setTestStarted(true);
      setTest(testData);
    } else {
      setError('Failed to start test');
    }
    setLoading(false);
  };

  const handleSubmitAnswer = async (skip: boolean = false) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setSubmitting(true);
    setError('');

    const response = await testsApi.submitAnswer(testId, {
      question_id: currentQuestion.id,
      answer_text: skip ? '' : answer,
      is_skipped: skip,
    });

    if (response.data) {
      if (currentQuestionIndex + 1 >= questions.length) {
        const completeResponse = await testsApi.complete(testId);
        if (completeResponse.data) {
          router.push(`/test/${testId}/results`);
        } else {
          setError('Failed to complete test');
        }
      } else {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setAnswer('');
      }
    } else {
      setError(response.error || 'Failed to submit answer');
    }

    setSubmitting(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500',
      medium: 'bg-yellow-500',
      hard: 'bg-red-500',
    };
    return colors[difficulty.toLowerCase()] || 'bg-gray-500';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">
            {test?.status === 'analyzing' ? 'Analyzing your repository...' : 'Loading test...'}
          </p>
        </div>
      </div>
    );
  }

  // Animated analyzing screen
  if (test?.status === 'analyzing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Card className="max-w-2xl w-full mx-4 shadow-2xl border-2 border-blue-200">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Code2 className="w-12 h-12 text-white animate-bounce" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Analyzing Your Code
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Our AI is examining your repository...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Progress Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-green-900">Repository Cloned</p>
                  <p className="text-sm text-green-700">Successfully fetched your code</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 animate-pulse">
                <Loader2 className="w-6 h-6 text-blue-600 flex-shrink-0 animate-spin" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">Analyzing Patterns</p>
                  <p className="text-sm text-blue-700">Detecting algorithms and code structures</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Quality Assessment</p>
                  <p className="text-sm text-gray-600">Evaluating code metrics and best practices</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-700">Generating Questions</p>
                  <p className="text-sm text-gray-600">Creating personalized interview questions</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-center text-blue-800">
                <strong>Pro Tip:</strong> This analysis uses advanced ML models including CodeBERT for accurate algorithm detection.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ready state - Show "Start Test" button
  if (testReady && !testStarted && questions.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code2 className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Analysis Complete!</h1>
                  <p className="text-sm text-gray-600 truncate max-w-md">{test?.repo_url}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="shadow-2xl border-2 border-green-200">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <CardTitle className="text-center text-3xl">
                Repository Analysis Complete!
              </CardTitle>
              <CardDescription className="text-center text-base mt-2">
                Your repository has been analyzed. Review the summary before starting the test.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <Code2 className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-blue-600 text-center">{test?.files_analyzed || 0}</p>
                  <p className="text-sm text-gray-600 text-center">Files Analyzed</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <Target className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-purple-600 text-center">
                    {test?.patterns_detected?.filter((p: any) => p.present).length || 0}
                  </p>
                  <p className="text-sm text-gray-600 text-center">Patterns Found</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <Award className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-600 text-center">
                    {test?.code_quality_score?.toFixed(1) || '0.0'}/10
                  </p>
                  <p className="text-sm text-gray-600 text-center">Quality: Grade {test?.code_quality_grade || 'N/A'}</p>
                </div>
              </div>

              <Separator />

              {/* Detected Patterns */}
              {test?.patterns_detected && test.patterns_detected.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Detected Patterns
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {test.patterns_detected
                      .filter((p: any) => p.present)
                      .map((pattern: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="font-medium text-green-900 flex-1">{pattern.name}</span>
                          <Badge className="bg-green-600 text-white">
                            {(pattern.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Detected Algorithm */}
              {test?.algorithms_detected && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Primary Algorithm Identified
                  </h3>
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-3xl font-bold">
                          {test.algorithms_detected.label?.replace('_', ' ').toUpperCase()}
                        </p>
                        <p className="text-blue-100 text-sm mt-1">Detected by {test.algorithms_detected.detected_by} Analysis</p>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-black">{(test.algorithms_detected.confidence * 100).toFixed(0)}%</p>
                        <p className="text-blue-100 text-xs">Confidence</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertTitle className="text-yellow-900">Ready to Start</AlertTitle>
                <AlertDescription className="text-yellow-800">
                  You'll be asked {questions.length} question{questions.length !== 1 ? 's' : ''} based on the detected patterns. 
                  Answer to the best of your ability or skip if unsure.
                </AlertDescription>
              </Alert>

              <Button 
                onClick={handleStartTest}
                className="w-full h-14 text-lg font-bold"
                size="lg"
              >
                <ArrowRight className="w-6 h-6 mr-2" />
                Start Test Now
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!test || test.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Test Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || 'The test analysis failed. Please try again with a different repository.'}
            </p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  // Don't render test UI until test is started
  if (!testStarted || questions.length === 0) {
    return null; // Already handled by ready state above
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Code2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Code Evaluation Test</h1>
                <p className="text-sm text-gray-600 truncate max-w-md">{test.repo_url}</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Exit Test
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <Card className="mb-6 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-blue-600">
                {progress.toFixed(0)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Current Question */}
        {currentQuestion && (
          <Card className="shadow-xl border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="font-medium">
                      {currentQuestion.pattern}
                    </Badge>
                    <Badge className={`${getDifficultyColor(currentQuestion.difficulty)} text-white`}>
                      {currentQuestion.difficulty.toUpperCase()}
                    </Badge>
                    {currentQuestion.question_type === 'code' && (
                      <Badge className="bg-purple-600 text-white">
                        <Terminal className="w-3 h-3 mr-1" />
                        CODE
                      </Badge>
                    )}
                    <span className="text-sm text-gray-600 ml-auto">
                      {currentQuestion.max_marks} marks
                    </span>
                  </div>
                  <CardTitle className="text-xl">{currentQuestion.question_text}</CardTitle>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-6">
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                {currentQuestion.question_type === 'code' ? (
                  // Code Editor
                  <>
                    <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Write your Python code below:</span>
                      </div>
                      <Textarea
                        placeholder="def your_function_name(params):
    # Write your code here
    pass"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        rows={12}
                        className="text-sm font-mono resize-none bg-white"
                        disabled={submitting}
                      />
                    </div>
                    
                    {currentQuestion.test_cases && currentQuestion.test_cases.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Test Cases:</h4>
                        <div className="space-y-2 text-sm">
                          {currentQuestion.test_cases.slice(0, 3).map((tc: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-blue-800">
                              <span className="font-mono bg-white px-2 py-1 rounded border border-blue-300">
                                Input: {JSON.stringify(tc.input)}
                              </span>
                              <ArrowRight className="w-3 h-3" />
                              <span className="font-mono bg-white px-2 py-1 rounded border border-blue-300">
                                Output: {JSON.stringify(tc.expected_output)}
                              </span>
                            </div>
                          ))}
                          {currentQuestion.test_cases.length > 3 && (
                            <p className="text-xs text-blue-700 italic">
                              + {currentQuestion.test_cases.length - 3} more test cases will be used for evaluation
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Regular Text Answer
                  <Textarea
                    placeholder="Type your answer here... Be specific and include relevant technical details."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    rows={8}
                    className="text-base resize-none"
                    disabled={submitting}
                  />
                )}
                
                <Separator />
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSubmitAnswer(true)}
                    variant="outline"
                    disabled={submitting}
                    className="flex-1"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip Question
                  </Button>
                  
                  <Button
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={submitting || !answer.trim()}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : currentQuestionIndex + 1 >= questions.length ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Finish Test
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Next Question
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
