'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { testsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Loader2, Award, CheckCircle2, AlertCircle, Code2, 
  TrendingUp, MessageSquare, Home, Search, GitBranch, 
  BarChart3, FileCode, CheckCircle, X, Target
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Answer {
  question_id: number;
  question_text: string;
  pattern: string;
  difficulty: string;
  answer_text: string;
  similarity_score: number;
  marks_obtained: number;
  max_marks: number;
  feedback: string;
  is_skipped: boolean;
}

interface Pattern {
  name: string;
  present: boolean;
  confidence: number;
  evidence?: any;
}

interface Test {
  id: number;
  repo_url: string;
  status?: string;
  files_analyzed?: number;
  patterns_detected?: Pattern[];
  algorithms_detected?: {
    label: string;
    confidence: number;
  };
  code_quality_score?: number;
  code_quality_grade?: string;
  code_metrics?: any;
  final_score?: number;
  final_grade?: string;
  component_scores?: {
    code_quality: number;
    algorithm_correctness: number;
    answer_evaluation: number;
    weighted_code_quality?: number;
    weighted_algorithm?: number;
    weighted_answers?: number;
  };
  feedback?: {
    feedback: string[];
    strengths: string[];
    improvements: string[];
  };
}

export default function ResultsPage() {
  const params = useParams();
  const testId = parseInt(params.id as string);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [test, setTest] = useState<Test | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && testId) {
      loadTest();
    }
  }, [user, testId]);

  const loadTest = async () => {
    setLoading(true);
    
    const response = await testsApi.getById(testId);
    if (response.data) {
      const testData = response.data as Test;
      if (testData.status !== 'completed') {
        router.push(`/test/${testId}`);
        return;
      }
      setTest(testData);
      
      // Fetch answers
      const answersResponse = await fetch(`${API_BASE}/api/tests/${testId}/answers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (answersResponse.ok) {
        const answersData = await answersResponse.json();
        setAnswers(answersData);
      }
    }
    
    setLoading(false);
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'text-green-600 bg-green-50 border-green-200',
      B: 'text-blue-600 bg-blue-50 border-blue-200',
      C: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      D: 'text-orange-600 bg-orange-50 border-orange-200',
      F: 'text-red-600 bg-red-50 border-red-200',
    };
    return colors[grade] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-600">Test not found</p>
            <Button onClick={() => router.push('/dashboard')} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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
                <h1 className="text-xl font-bold text-gray-900">Test Results</h1>
                <p className="text-sm text-gray-600 truncate max-w-md">{test.repo_url}</p>
              </div>
            </div>
            <Button onClick={() => router.push('/dashboard')}>
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Final Score Banner */}
        <Card className="shadow-2xl border-4 border-blue-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                <Award className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Final Evaluation Results</h2>
              <p className="text-blue-100 text-lg mb-6">
                Complete analysis of your repository and answers
              </p>
              
              <div className="flex items-center justify-center gap-6 my-8">
                <div className="text-8xl font-black">
                  {test.final_score?.toFixed(1) || '0.0'}
                </div>
                <div className="text-left">
                  <p className="text-3xl opacity-80">/10</p>
                  <div className="mt-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-3xl shadow-lg">
                    {test.final_grade || 'N/A'}
                  </div>
                </div>
              </div>
              
              {test.component_scores && (
                <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-sm opacity-90 mb-1">Code Quality</p>
                    <p className="text-3xl font-bold">
                      {test.component_scores.code_quality.toFixed(1)}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      60% weight = {(test.component_scores.weighted_code_quality || test.component_scores.code_quality * 0.6).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <p className="text-sm opacity-90 mb-1">Answers</p>
                    <p className="text-3xl font-bold">
                      {test.component_scores.answer_evaluation.toFixed(1)}
                    </p>
                    <p className="text-xs opacity-75 mt-1">
                      40% weight = {(test.component_scores.weighted_answers || test.component_scores.answer_evaluation * 0.4).toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-sm text-white/90">
                  <strong>Note:</strong> Algorithm and pattern detection are used for intelligent question selection. 
                  Final score = Code Quality (60%) + Answers (40%)
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Question-by-Question Breakdown */}
        {answers.length > 0 && (
          <Card className="shadow-lg border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Question-by-Question Performance
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your answers and scores
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 text-center">
                  <p className="text-sm text-blue-700 mb-1">Total Questions</p>
                  <p className="text-3xl font-bold text-blue-900">{answers.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 text-center">
                  <p className="text-sm text-green-700 mb-1">Marks Obtained</p>
                  <p className="text-3xl font-bold text-green-900">
                    {answers.reduce((sum, a) => sum + a.marks_obtained, 0).toFixed(1)}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200 text-center">
                  <p className="text-sm text-purple-700 mb-1">Max Marks</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {answers.reduce((sum, a) => sum + a.max_marks, 0).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Individual Questions */}
              <div className="space-y-4">
                {answers.map((answer, idx) => {
                  const percentage = (answer.marks_obtained / answer.max_marks) * 100;
                  const scoreColor = percentage >= 75 ? 'text-green-600' :
                                   percentage >= 50 ? 'text-yellow-600' : 'text-red-600';
                  const bgColor = percentage >= 75 ? 'bg-green-50 border-green-200' :
                                 percentage >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200';
                  
                  return (
                    <div key={idx} className={`border-2 rounded-lg overflow-hidden ${bgColor}`}>
                      <div className="p-5">
                        {/* Question Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="font-semibold">
                                Q{idx + 1}: {answer.pattern}
                              </Badge>
                              <Badge className={`${
                                answer.difficulty === 'hard' ? 'bg-red-500' :
                                answer.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                              } text-white`}>
                                {answer.difficulty.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="font-medium text-gray-900">{answer.question_text}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className={`text-4xl font-black ${scoreColor}`}>
                              {answer.marks_obtained.toFixed(1)}
                            </p>
                            <p className="text-sm text-gray-600">/ {answer.max_marks}</p>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Similarity Score</span>
                            <span className="text-xs font-bold text-gray-900">
                              {(answer.similarity_score * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Progress value={answer.similarity_score * 100} className="h-2" />
                        </div>

                        {/* Feedback */}
                        {answer.is_skipped ? (
                          <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                            <p className="text-sm text-gray-700">
                              <strong>Status:</strong> Question Skipped
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="bg-white rounded-lg p-3 border border-gray-300 mb-3">
                              <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                              <p className="text-sm text-gray-900 line-clamp-3">{answer.answer_text}</p>
                            </div>
                            <div className={`rounded-lg p-3 ${
                              percentage >= 75 ? 'bg-green-100 border-green-300' :
                              percentage >= 50 ? 'bg-yellow-100 border-yellow-300' : 'bg-red-100 border-red-300'
                            } border`}>
                              <p className="text-sm font-semibold text-gray-700 mb-1">Feedback:</p>
                              <p className="text-sm text-gray-900">{answer.feedback}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Repository Analysis Overview */}
        <Card className="shadow-lg border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <FileCode className="w-5 h-5" />
              Repository Analysis Overview
            </CardTitle>
            <CardDescription>
              Comprehensive analysis of your code repository
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Files Analyzed</p>
                <p className="text-3xl font-bold text-blue-900">{test.files_analyzed || 0}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                <p className="text-sm text-purple-700 font-medium mb-1">Patterns Detected</p>
                <p className="text-3xl font-bold text-purple-900">
                  {test.patterns_detected?.filter(p => p.present).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pattern Detection Analysis */}
        {test.patterns_detected && test.patterns_detected.length > 0 && (
          <Card className="shadow-lg border-2 border-indigo-200">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50">
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Pattern Detection Analysis
              </CardTitle>
              <CardDescription>
                Identified patterns used to generate relevant interview questions
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {test.patterns_detected.map((pattern, idx) => (
                  <div key={idx} className="border-2 rounded-lg overflow-hidden">
                    <div className={`flex items-center justify-between p-4 ${
                      pattern.present ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3 flex-1">
                        {pattern.present ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                        ) : (
                          <X className="w-6 h-6 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg ${
                            pattern.present ? 'text-green-900' : 'text-gray-500'
                          }`}>
                            {pattern.name}
                          </h4>
                          {pattern.evidence && (
                            <p className="text-sm text-gray-600 mt-1">
                              Source: {pattern.evidence.source || 'Code Analysis'}
                            </p>
                          )}
                        </div>
                      </div>
                      {pattern.present && (
                        <div className="text-right ml-4">
                          <div className={`text-2xl font-bold ${
                            pattern.confidence >= 0.8 ? 'text-green-600' :
                            pattern.confidence >= 0.6 ? 'text-yellow-600' : 'text-orange-600'
                          }`}>
                            {(pattern.confidence * 100).toFixed(0)}%
                          </div>
                          <div className="w-32 mt-2">
                            <Progress value={pattern.confidence * 100} className="h-2" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Purpose:</strong> Detected patterns help select personalized questions tailored to your code. 
                  Higher confidence patterns indicate stronger matches and may generate more specific questions. 
                  Patterns are not directly scored - they guide question selection.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Algorithm Detection */}
        {test.algorithms_detected && (
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="w-5 h-5" />
                Algorithm Detection
              </CardTitle>
              <CardDescription>
                Used for intelligent question selection based on your code patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-blue-100 text-sm mb-2">Primary Algorithm Detected</p>
                    <h3 className="text-3xl font-bold mb-2">
                      {test.algorithms_detected.label.replace('_', ' ').toUpperCase()}
                    </h3>
                    <p className="text-blue-100 text-sm">
                      Identified using CodeBERT ML Classifier
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black opacity-90">
                      {(test.algorithms_detected.confidence * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-blue-100 mt-1">Detection Confidence</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Progress 
                    value={test.algorithms_detected.confidence * 100} 
                    className="h-3 bg-white/20" 
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Purpose:</strong> This algorithm detection helps generate relevant, personalized 
                  interview questions based on your code. It is NOT used in final score calculation. 
                  Your final score depends only on code quality (60%) and answer quality (40%).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Code Quality Analysis */}
        {test.code_quality_score !== undefined && (
          <Card className="shadow-lg border-2 border-emerald-200">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Code Quality Analysis
              </CardTitle>
              <CardDescription>
                Detailed breakdown of your code quality metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Overall Quality Score
                    </h3>
                    <p className="text-sm text-gray-600">Based on multiple metrics</p>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-black text-emerald-600">
                      {test.code_quality_score.toFixed(1)}
                    </div>
                    <Badge className="mt-2 text-lg px-4 py-1">
                      Grade {test.code_quality_grade}
                    </Badge>
                  </div>
                </div>
                <Progress value={test.code_quality_score * 10} className="h-4" />
              </div>

              {test.code_metrics && (
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  {test.code_metrics.avg_complexity !== undefined && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-sm text-blue-700 font-medium mb-1">Avg Complexity</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {test.code_metrics.avg_complexity.toFixed(2)}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">Lower is better</p>
                    </div>
                  )}
                  
                  {test.code_metrics.avg_maintainability !== undefined && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <p className="text-sm text-green-700 font-medium mb-1">Maintainability</p>
                      <p className="text-2xl font-bold text-green-900">
                        {test.code_metrics.avg_maintainability.toFixed(1)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">Higher is better</p>
                    </div>
                  )}
                  
                  {test.code_metrics.total_functions !== undefined && (
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                      <p className="text-sm text-purple-700 font-medium mb-1">Total Functions</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {test.code_metrics.total_functions}
                      </p>
                      <p className="text-xs text-purple-600 mt-1">Functions analyzed</p>
                    </div>
                  )}
                  
                  {test.code_metrics.total_classes !== undefined && (
                    <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                      <p className="text-sm text-orange-700 font-medium mb-1">Total Classes</p>
                      <p className="text-2xl font-bold text-orange-900">
                        {test.code_metrics.total_classes}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">Classes found</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                <h4 className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Quality Metrics Explanation
                </h4>
                <ul className="text-sm text-emerald-800 space-y-1">
                  <li>• <strong>Complexity:</strong> Cyclomatic complexity - fewer branches mean simpler code</li>
                  <li>• <strong>Maintainability:</strong> How easy it is to understand and modify the code</li>
                  <li>• <strong>Functions/Classes:</strong> Code structure and organization</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Feedback Grid */}
        {test.feedback && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            {test.feedback.strengths && test.feedback.strengths.length > 0 && (
              <Card className="shadow-lg border-2 border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Strengths ({test.feedback.strengths.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {test.feedback.strengths.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Improvements */}
            {test.feedback.improvements && test.feedback.improvements.length > 0 && (
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Areas for Improvement ({test.feedback.improvements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-3">
                    {test.feedback.improvements.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-800">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* General Feedback */}
        {test.feedback?.feedback && test.feedback.feedback.length > 0 && (
          <Card className="shadow-lg border-2">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Additional Feedback
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-2">
                {test.feedback.feedback.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="text-blue-600 font-bold mt-0.5">→</span>
                    <span className="text-gray-800">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/dashboard')}
            className="flex-1 h-12"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button
            onClick={() => window.print()}
            variant="secondary"
            className="h-12 px-8"
          >
            Print Report
          </Button>
        </div>
      </main>
    </div>
  );
}
