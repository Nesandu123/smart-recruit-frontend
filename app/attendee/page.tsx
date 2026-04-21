'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage, User, QuizResult } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { LogOut, History, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AttendeeHome() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pastResults, setPastResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    storage.init();
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      router.push('/attendee/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    // Fetch past results
    const allResults = storage.getResults();
    const userResults = allResults
      .filter(r => r.userId === parsedUser.id && r.status === 'completed')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    setPastResults(userResults);

  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/attendee/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-500">Technical Interview Assessment</p>
          </div>
          <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Start Quiz */}
          <div className="md:col-span-1">
            <Card className="h-full border-blue-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800">New Assessment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Quiz Details:</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li>✓ 5 Questions</li>
                    <li>✓ Live Monitoring</li>
                    <li>✓ Instant Results</li>
                  </ul>
                </div>
                {pastResults.length > 0 ? (
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-semibold">Assessment Completed</p>
                    <p className="text-sm text-green-600 mt-1">You have already taken this quiz.</p>
                  </div>
                ) : (
                  <Link href="/attendee/quiz" className="block">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                      Start Quiz
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: History */}
          <div className="md:col-span-2">
            <Card className="h-full shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-500" />
                  Past Attempts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pastResults.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                      No past attempts found. Start your first quiz!
                    </div>
                  ) : (
                    pastResults.map((result) => (
                      <div key={result.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:border-blue-300 transition-colors">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">Assessment</span>
                            <Badge variant={result.score >= 3 ? "default" : "destructive"}>
                              {Math.round((result.score / result.totalQuestions) * 100)}%
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleDateString()} at {new Date(result.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Attention</p>
                            <p className={`font-bold ${result.attentionScore >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                              {result.attentionScore}%
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
