'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { adminApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2, Plus, Edit, Trash2, Code2, LogOut, 
  Filter, CheckCircle, AlertCircle
} from 'lucide-react';

interface Question {
  id: number;
  pattern: string;
  question_text: string;
  difficulty: string;
  expected_keywords: string[];
  max_marks: number;
  is_active: boolean;
}

export default function AdminPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [patterns, setPatterns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPattern, setFilterPattern] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    pattern: '',
    question_text: '',
    difficulty: 'medium',
    expected_keywords: '',
    max_marks: 10,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (!authLoading && user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user, filterPattern, filterDifficulty]);

  const loadData = async () => {
    setLoading(true);
    
    const [questionsResponse, patternsResponse] = await Promise.all([
      adminApi.getQuestions(filterPattern, filterDifficulty),
      adminApi.getPatterns(),
    ]);

    if (questionsResponse.data) {
      setQuestions(questionsResponse.data);
    }
    if (patternsResponse.data) {
      setPatterns(patternsResponse.data);
    }
    
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const keywords = formData.expected_keywords
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    const data = {
      ...formData,
      expected_keywords: keywords,
    };

    let response;
    if (editingQuestion) {
      response = await adminApi.updateQuestion(editingQuestion.id, data);
    } else {
      response = await adminApi.createQuestion(data);
    }

    if (response.data) {
      setSuccess(editingQuestion ? 'Question updated!' : 'Question created!');
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } else {
      setError(response.error || 'Operation failed');
    }
  };

  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    setFormData({
      pattern: question.pattern,
      question_text: question.question_text,
      difficulty: question.difficulty,
      expected_keywords: question.expected_keywords.join(', '),
      max_marks: question.max_marks,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const response = await adminApi.deleteQuestion(id);
    if (response.data || response.data === undefined) {
      setSuccess('Question deleted!');
      loadData();
    } else {
      setError(response.error || 'Delete failed');
    }
  };

  const resetForm = () => {
    setFormData({
      pattern: '',
      question_text: '',
      difficulty: 'medium',
      expected_keywords: '',
      max_marks: 10,
    });
    setEditingQuestion(null);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
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
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Question Bank Management</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Success/Error Messages */}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters and Actions */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle>Question Bank</CardTitle>
            <CardDescription>Manage interview questions for code evaluation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <Label>Filter by Pattern</Label>
                <Select value={filterPattern} onValueChange={setFilterPattern}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Patterns" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Patterns</SelectItem>
                    {patterns.map((pattern) => (
                      <SelectItem key={pattern} value={pattern}>
                        {pattern}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 min-w-[200px]">
                <Label>Filter by Difficulty</Label>
                <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Edit Question' : 'Create New Question'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingQuestion ? 'Update the question details below' : 'Fill in the question details below'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="pattern">Pattern</Label>
                      <Input
                        id="pattern"
                        value={formData.pattern}
                        onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                        placeholder="e.g., Sorting, Searching, Dynamic Programming"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="question_text">Question Text</Label>
                      <Textarea
                        id="question_text"
                        value={formData.question_text}
                        onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                        placeholder="Enter the interview question..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="difficulty">Difficulty</Label>
                        <Select
                          value={formData.difficulty}
                          onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                        >
                          <SelectTrigger id="difficulty">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="max_marks">Max Marks</Label>
                        <Input
                          id="max_marks"
                          type="number"
                          min="1"
                          max="50"
                          value={formData.max_marks}
                          onChange={(e) => setFormData({ ...formData, max_marks: parseInt(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="keywords">Expected Keywords (comma-separated)</Label>
                      <Input
                        id="keywords"
                        value={formData.expected_keywords}
                        onChange={(e) => setFormData({ ...formData, expected_keywords: e.target.value })}
                        placeholder="e.g., time complexity, O(n log n), merge sort"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" className="flex-1">
                        {editingQuestion ? 'Update Question' : 'Create Question'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No questions found</p>
              </CardContent>
            </Card>
          ) : (
            questions.map((question) => (
              <Card key={question.id} className="shadow hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.pattern}</Badge>
                        <Badge className={`${getDifficultyColor(question.difficulty)} text-white`}>
                          {question.difficulty.toUpperCase()}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {question.max_marks} marks
                        </span>
                      </div>
                      
                      <p className="text-lg font-medium text-gray-900 mb-3">
                        {question.question_text}
                      </p>
                      
                      <div className="flex flex-wrap gap-1">
                        {question.expected_keywords.map((keyword, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(question)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(question.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
