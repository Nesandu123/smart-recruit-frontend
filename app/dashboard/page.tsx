'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { testsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, Github, Code2, Plus, Clock, CheckCircle, 
  XCircle, AlertCircle, LogOut, TrendingUp, BarChart 
} from 'lucide-react';

interface Test {
  id: number;
  repo_url: string;
  status: string;
  started_at: string;
  completed_at?: string;
  final_score?: number;
  final_grade?: string;
}

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadTests();
    }
  }, [user]);

  const loadTests = async () => {
    setLoading(true);
    const response = await testsApi.getAll();
    if (response.data) {
      setTests(response.data);
    }
    setLoading(false);
  };

  const handleCreateTest = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    const githubUrlPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubUrlPattern.test(repoUrl.trim())) {
      setError('Please enter a valid GitHub repository URL');
      return;
    }

    setCreating(true);
    setError('');

    const response = await testsApi.create(repoUrl.trim());
    
    if (response.data) {
      router.push(`/test/${response.data.id}`);
    } else {
      setError(response.error || 'Failed to create test');
    }
    
    setCreating(false);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; icon: any }> = {
      analyzing: { color: 'bg-blue-500', icon: Loader2 },
      ready: { color: 'bg-green-500', icon: CheckCircle },
      in_progress: { color: 'bg-yellow-500', icon: Clock },
      completed: { color: 'bg-purple-500', icon: CheckCircle },
      failed: { color: 'bg-red-500', icon: XCircle },
    };

    const variant = variants[status] || variants.analyzing;
    const Icon = variant.icon;

    return (
      <Badge className={`${variant.color} text-white`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const getGradeColor = (grade: string) => {
    const colors: Record<string, string> = {
      A: 'text-green-600',
      B: 'text-blue-600',
      C: 'text-yellow-600',
      D: 'text-orange-600',
      F: 'text-red-600',
    };
    return colors[grade] || 'text-gray-600';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.username}!</p>
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
        {/* Create New Test */}
        <Card className="mb-8 shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Start New Code Evaluation
            </CardTitle>
            <CardDescription>
              Enter a GitHub repository URL to analyze and evaluate your code
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="repo-url">GitHub Repository URL</Label>
                <Input
                  id="repo-url"
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  disabled={creating}
                  className="h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !creating) {
                      handleCreateTest();
                    }
                  }}
                />
              </div>
              
              <Button
                onClick={handleCreateTest}
                disabled={creating}
                className="w-full h-12"
                size="lg"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Test...
                  </>
                ) : (
                  <>
                    <Github className="mr-2 h-5 w-5" />
                    Analyze Repository
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test History */}
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="w-5 h-5" />
              Your Test History
            </CardTitle>
            <CardDescription>
              View and continue your previous code evaluations
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {tests.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No tests yet</p>
                <p className="text-gray-400 text-sm mt-2">Start your first evaluation above!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className="border-2 rounded-lg p-5 hover:border-blue-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/test/${test.id}`)}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Github className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <p className="text-sm text-gray-600 truncate">
                            {test.repo_url}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {getStatusBadge(test.status)}
                          <span className="text-xs text-gray-500">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {new Date(test.started_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {test.status === 'completed' && test.final_score !== undefined && (
                        <div className="text-right flex-shrink-0">
                          <div className="text-3xl font-bold text-blue-600">
                            {test.final_score.toFixed(1)}
                          </div>
                          <div className={`text-xl font-bold ${getGradeColor(test.final_grade || '')}`}>
                            Grade: {test.final_grade}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {test.status === 'ready' && (
                      <Button className="w-full mt-3" variant="outline">
                        Continue Test →
                      </Button>
                    )}
                    
                    {test.status === 'completed' && (
                      <Button className="w-full mt-3" variant="secondary">
                        View Results →
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
