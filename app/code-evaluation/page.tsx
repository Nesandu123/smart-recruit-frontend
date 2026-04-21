'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Loader2,
  Github,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Code2,
  Target,
  Award,
  MessageSquare,
  TrendingUp,
  Brain,
  FileCode,
  Zap
} from 'lucide-react'

// API Configuration
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

// TypeScript Interfaces
interface DetectedPattern {
  name: string
  present: boolean
  confidence: number
  evidence?: any
}

interface AlgorithmPrediction {
  label: string
  confidence: number
  detected_by: string
}

interface QualityMetrics {
  cyclomatic_complexity: number
  lines_of_code: number
  comment_ratio: number
  avg_function_length: number
  functions_count: number
}

interface QualityScore {
  score: number
  grade: string
  metrics: QualityMetrics
}

interface InterviewQuestion {
  id: string
  pattern: string
  question: string
  difficulty: string
  expected_keywords: string[]
  max_marks: number
}

interface AnalysisData {
  repo_url: string
  status: string
  files_analyzed: number
  patterns: DetectedPattern[]
  algorithm: AlgorithmPrediction
  quality: QualityScore
  questions: InterviewQuestion[]
}

interface AnswerScore {
  question_id: string
  question_text: string
  similarity: number
  marks_obtained: number
  max_marks: number
  feedback: string
}

interface ComponentScores {
  code_quality: number
  algorithm_correctness: number
  answer_evaluation: number
}

interface FinalResults {
  answer_scores: AnswerScore[]
  component_scores: ComponentScores
  final_score: number
  grade: string
  feedback: string[]
  strengths: string[]
  improvements: string[]
}

export default function Home() {
  // State Management
  const [repoUrl, setRepoUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [evaluating, setEvaluating] = useState(false)
  const [error, setError] = useState('')
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [finalResults, setFinalResults] = useState<FinalResults | null>(null)

  // Handler: Analyze Repository
  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a valid GitHub repository URL')
      return
    }

    // Validate GitHub URL format
    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/
    if (!githubUrlPattern.test(repoUrl.trim())) {
      setError('Please enter a valid GitHub repository URL (e.g., https://github.com/username/repo)')
      return
    }

    setAnalyzing(true)
    setError('')
    setAnalysisData(null)
    setFinalResults(null)
    setAnswers({})

    try {
      const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_url: repoUrl.trim() })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to analyze repository')
      }

      const data: AnalysisData = await response.json()
      setAnalysisData(data)

      // Initialize empty answers
      const initialAnswers: Record<string, string> = {}
      data.questions.forEach(q => {
        initialAnswers[q.id] = ''
      })
      setAnswers(initialAnswers)

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis')
      console.error('Analysis error:', err)
    } finally {
      setAnalyzing(false)
    }
  }

  // Handler: Submit Answers for Evaluation
  const handleSubmitAnswers = async () => {
    if (!analysisData) return

    // Validate at least one answer is provided
    const hasAnswers = Object.values(answers).some(a => a.trim().length > 0)
    if (!hasAnswers) {
      setError('Please provide at least one answer before submitting')
      return
    }

    setEvaluating(true)
    setError('')

    try {
      const answerItems = Object.entries(answers).map(([qid, text]) => ({
        question_id: qid,
        answer_text: text.trim()
      }))

      const response = await fetch(`${API_BASE}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repo_url: analysisData.repo_url,
          algorithm_label: analysisData.algorithm.label,
          algorithm_confidence: analysisData.algorithm.confidence,
          quality_score: analysisData.quality.score,
          questions: analysisData.questions,
          answers: answerItems
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to evaluate answers')
      }

      const data: FinalResults = await response.json()
      setFinalResults(data)

      // Scroll to results
      setTimeout(() => {
        document.getElementById('final-results')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during evaluation')
      console.error('Evaluation error:', err)
    } finally {
      setEvaluating(false)
    }
  }

  // Handler: Reset All
  const handleReset = () => {
    setRepoUrl('')
    setAnalysisData(null)
    setFinalResults(null)
    setAnswers({})
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Helper: Get difficulty badge color
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'bg-green-500 hover:bg-green-600'
      case 'medium': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'hard': return 'bg-red-500 hover:bg-red-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  // Helper: Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200'
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'F': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  // Helper: Get similarity color
  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.75) return 'bg-green-500'
    if (similarity >= 0.5) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-400 hover:text-indigo-600 transition-colors mr-1 flex items-center gap-1">
              ← Home
            </Link>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI Code Evaluation Platform
              </h1>
              <p className="text-sm text-gray-600">Intelligent code analysis & interview system</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Step 1: Repository Input */}
        <Card className="mb-8 shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Github className="w-5 h-5" />
                  Enter GitHub Repository
                </CardTitle>
                <CardDescription>
                  Paste the URL of a Python algorithm repository to analyze
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="repo-url" className="text-base font-medium">
                  Repository URL
                </Label>
                <Input
                  id="repo-url"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={analyzing}
                  className="text-base h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !analyzing) {
                      handleAnalyze()
                    }
                  }}
                />
                <p className="text-sm text-gray-500">
                  Example: https://github.com/TheAlgorithms/Python
                </p>
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={analyzing || !repoUrl.trim()}
                className="w-full h-12 text-base font-medium"
                size="lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing Repository...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-5 w-5" />
                    Analyze Code
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-8 shadow-lg">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-base">{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 2: Analysis Results */}
        {analysisData && !finalResults && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Success Banner */}
            <Alert className="bg-green-50 border-green-200 shadow-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertTitle className="text-green-800">Analysis Complete!</AlertTitle>
              <AlertDescription className="text-green-700">
                Successfully analyzed {analysisData.files_analyzed} Python files from your repository
              </AlertDescription>
            </Alert>

            {/* Detected Patterns */}
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5" />
                  Detected Patterns ({analysisData.patterns.filter(p => p.present).length}/12)
                </CardTitle>
                <CardDescription>
                  Algorithmic and structural patterns identified in your code
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {analysisData.patterns.map((pattern) => (
                    <div
                      key={pattern.name}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${pattern.present
                          ? 'bg-green-50 border-green-300 hover:border-green-400 shadow-sm'
                          : 'bg-gray-50 border-gray-200'
                        }`}
                    >
                      {pattern.present ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${pattern.present ? 'text-green-900' : 'text-gray-500'
                          }`}>
                          {pattern.name}
                        </p>
                        {pattern.present && pattern.confidence > 0 && (
                          <p className="text-xs text-green-600">
                            {(pattern.confidence * 100).toFixed(0)}% confidence
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Algorithm & Quality Split */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Algorithm Classification */}
              <Card className="shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Algorithm Classification
                  </CardTitle>
                  <CardDescription>
                    AI-detected algorithm using hybrid analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Detected Algorithm</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                      {analysisData.algorithm.label}
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Confidence Score</span>
                      <span className="font-bold text-blue-600">
                        {(analysisData.algorithm.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={analysisData.algorithm.confidence * 100}
                      className="h-3"
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Detection Method</span>
                    <Badge variant="secondary" className="font-medium">
                      {analysisData.algorithm.detected_by}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Code Quality */}
              <Card className="shadow-lg border-2">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Code Quality Score
                  </CardTitle>
                  <CardDescription>
                    Automated quality assessment based on metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-bold text-emerald-600">
                      {analysisData.quality.score}
                    </span>
                    <span className="text-2xl text-gray-400 mb-2">/10</span>
                    <div className={`ml-auto px-4 py-2 rounded-lg border-2 font-bold text-xl ${getGradeColor(analysisData.quality.grade)
                      }`}>
                      {analysisData.quality.grade}
                    </div>
                  </div>

                  <Progress
                    value={analysisData.quality.score * 10}
                    className="h-3"
                  />

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">Complexity</p>
                      <p className="font-bold text-lg">
                        {analysisData.quality.metrics.cyclomatic_complexity.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">Lines of Code</p>
                      <p className="font-bold text-lg">
                        {analysisData.quality.metrics.lines_of_code}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">Functions</p>
                      <p className="font-bold text-lg">
                        {analysisData.quality.metrics.functions_count}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-600 mb-1">Comments</p>
                      <p className="font-bold text-lg">
                        {(analysisData.quality.metrics.comment_ratio * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interview Questions */}
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Interview Questions ({analysisData.questions.length})
                    </CardTitle>
                    <CardDescription>
                      Answer questions to demonstrate your understanding
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <div className="space-y-6">
                  {analysisData.questions.map((question, idx) => (
                    <div
                      key={question.id}
                      className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {idx + 1}
                        </div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className="font-medium">
                              <FileCode className="w-3 h-3 mr-1" />
                              {question.pattern}
                            </Badge>
                            <Badge className={`${getDifficultyColor(question.difficulty)} text-white`}>
                              {question.difficulty.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-500 ml-auto">
                              {question.max_marks} {question.max_marks === 1 ? 'mark' : 'marks'}
                            </span>
                          </div>

                          <p className="text-lg font-medium text-gray-900 mb-4">
                            {question.question}
                          </p>

                          <Textarea
                            placeholder="Type your answer here... Be specific and include relevant technical details."
                            value={answers[question.id] || ''}
                            onChange={(e) => setAnswers({
                              ...answers,
                              [question.id]: e.target.value
                            })}
                            rows={5}
                            className="w-full text-base resize-none"
                          />

                          <p className="text-xs text-gray-500 mt-2">
                            💡 Tip: Include keywords like: {question.expected_keywords.slice(0, 3).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                <Button
                  onClick={handleSubmitAnswers}
                  disabled={evaluating}
                  className="w-full h-14 text-lg font-medium"
                  size="lg"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Evaluating Your Answers...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-6 w-6" />
                      Submit & Get Final Score
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Final Results */}
        {finalResults && (
          <div id="final-results" className="space-y-8 animate-in fade-in duration-500">
            {/* Final Score Banner */}
            <Card className="shadow-2xl border-4 border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 text-white">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
                    <Award className="w-12 h-12" />
                  </div>
                  <h2 className="text-3xl font-bold mb-2">Final Evaluation Results</h2>
                  <p className="text-blue-100 text-lg">
                    Complete analysis of your repository and answers
                  </p>

                  <div className="flex items-center justify-center gap-6 my-8">
                    <div className="text-8xl font-black">
                      {finalResults.final_score.toFixed(1)}
                    </div>
                    <div className="text-left">
                      <p className="text-3xl opacity-80">/10</p>
                      <div className="mt-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-3xl shadow-lg">
                        {finalResults.grade}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-sm opacity-90 mb-1">Code Quality</p>
                      <p className="text-3xl font-bold">
                        {finalResults.component_scores.code_quality.toFixed(1)}
                      </p>
                      <p className="text-xs opacity-75 mt-1">40% weight</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-sm opacity-90 mb-1">Algorithm</p>
                      <p className="text-3xl font-bold">
                        {finalResults.component_scores.algorithm_correctness.toFixed(1)}
                      </p>
                      <p className="text-xs opacity-75 mt-1">30% weight</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <p className="text-sm opacity-90 mb-1">Answers</p>
                      <p className="text-3xl font-bold">
                        {finalResults.component_scores.answer_evaluation.toFixed(1)}
                      </p>
                      <p className="text-xs opacity-75 mt-1">30% weight</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Answer Breakdown */}
            <Card className="shadow-lg border-2">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Answer Evaluation Breakdown
                </CardTitle>
                <CardDescription>
                  Detailed scoring for each interview question
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {finalResults.answer_scores.map((score, idx) => (
                    <div
                      key={score.question_id}
                      className="border-2 rounded-xl p-5 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                            {idx + 1}
                          </div>
                          <p className="font-medium text-gray-900 flex-1">
                            {score.question_text}
                          </p>
                        </div>
                        <Badge
                          variant={score.marks_obtained >= score.max_marks * 0.75 ? 'default' : 'secondary'}
                          className="text-base px-3 py-1"
                        >
                          {score.marks_obtained.toFixed(1)} / {score.max_marks}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 font-medium">Semantic Similarity</span>
                          <span className="font-bold">
                            {(score.similarity * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-3 rounded-full transition-all duration-500 ${getSimilarityColor(score.similarity)}`}
                              style={{ width: `${score.similarity * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <p className="text-sm text-gray-700 italic">
                          💬 {score.feedback}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Feedback Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="shadow-lg border-2 border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-700 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    Strengths ({finalResults.strengths.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {finalResults.strengths.length > 0 ? (
                    <ul className="space-y-3">
                      {finalResults.strengths.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-green-50 p-3 rounded-lg border border-green-200">
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No specific strengths identified</p>
                  )}
                </CardContent>
              </Card>

              {/* Improvements */}
              <Card className="shadow-lg border-2 border-orange-200">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="text-orange-700 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Areas for Improvement ({finalResults.improvements.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {finalResults.improvements.length > 0 ? (
                    <ul className="space-y-3">
                      {finalResults.improvements.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-orange-50 p-3 rounded-lg border border-orange-200">
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-800">{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No specific improvements needed</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* General Feedback */}
            {finalResults.feedback.length > 0 && (
              <Card className="shadow-lg border-2">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Additional Feedback
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    {finalResults.feedback.map((item, idx) => (
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
                onClick={handleReset}
                variant="outline"
                className="flex-1 h-12 text-base"
                size="lg"
              >
                Evaluate Another Repository
              </Button>
              <Button
                onClick={() => window.print()}
                variant="secondary"
                className="h-12 px-8 text-base"
                size="lg"
              >
                Print Report
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <Link href="/" className="font-semibold text-indigo-600 hover:underline">← SmartHire Platform</Link>
          <p>© 2026 AI Code Evaluation Platform · Research Project 25-26J-413</p>
        </div>
      </footer>
    </div>
  )
}
