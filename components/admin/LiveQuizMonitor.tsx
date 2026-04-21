'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { storage, QuizResult, User } from '@/lib/storage';
import { Badge } from '@/components/ui/badge';

export default function LiveQuizMonitor() {
    const [results, setResults] = useState<(QuizResult & { user?: User })[]>([]);

    useEffect(() => {
        const fetchData = () => {
            const allResults = storage.getResults();
            const allUsers = storage.getUsers();

            const enrichedResults = allResults.map(r => ({
                ...r,
                user: allUsers.find(u => u.id === r.userId)
            }));

            // Sort: Ongoing first, then by timestamp descending
            enrichedResults.sort((a, b) => {
                if (a.status === 'ongoing' && b.status !== 'ongoing') return -1;
                if (a.status !== 'ongoing' && b.status === 'ongoing') return 1;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });

            setResults(enrichedResults);
        };

        fetchData();
        // Poll every 2 seconds for live updates
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Attempts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{results.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Now</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {results.filter(r => r.status === 'ongoing').length}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Avg Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {results.length > 0
                                ? Math.round(results.reduce((acc, r) => acc + (r.score / r.totalQuestions * 100), 0) / results.length)
                                : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Live Quiz Results</CardTitle>
                    <CardDescription>Real-time updates from user sessions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {results.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No activity yet</div>
                        ) : (
                            results.map((result) => (
                                <div key={`${result.userId}-${result.timestamp}`} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2 h-2 rounded-full ${result.status === 'ongoing' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                                        <div>
                                            <h4 className="font-bold text-gray-900">{result.user?.name || 'Unknown User'}</h4>
                                            <p className="text-xs text-gray-500">
                                                Started: {new Date(result.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Status</p>
                                            <Badge variant={result.status === 'ongoing' ? 'default' : 'secondary'}>
                                                {result.status.toUpperCase()}
                                            </Badge>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Score</p>
                                            <span className="font-bold text-lg">
                                                {result.status === 'completed'
                                                    ? `${result.score}/${result.totalQuestions}`
                                                    : '--'}
                                            </span>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Attention</p>
                                            <span className={`font-bold ${result.attentionScore < 50 ? 'text-red-500' : 'text-green-600'}`}>
                                                {result.attentionScore}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
