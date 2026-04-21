import React, { useState } from 'react';
import { QuizResult, User, storage } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Eye, FileText, Check, X, Trash2 } from 'lucide-react';

interface PastResultsTableProps {
    results: QuizResult[];
    users: User[];
}

export default function PastResultsTable({ results, users }: PastResultsTableProps) {
    const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);

    const getUserName = (userId: string) => {
        return users.find(u => u.id === userId)?.name || 'Unknown User';
    };

    const getUserEmail = (userId: string) => {
        return users.find(u => u.id === userId)?.username || '';
    }

    const sortedResults = [...results].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>
                    Historical record of all completed quizzes with detailed results.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {sortedResults.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                        No completed assessments found yet.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Candidate</TableHead>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Score</TableHead>
                                <TableHead>Attention Avg</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedResults.map((result) => {
                                const start = result.startTime ? new Date(result.startTime).getTime() : 0;
                                const end = result.endTime ? new Date(result.endTime).getTime() : 0;
                                const durationSec = start && end ? Math.floor((end - start) / 1000) : 0;
                                const formatDuration = (secs: number) => {
                                    const m = Math.floor(secs / 60);
                                    const s = secs % 60;
                                    return `${m}m ${s}s`;
                                };

                                return (
                                    <TableRow key={result.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{getUserName(result.userId)}</p>
                                                <p className="text-xs text-gray-500">{getUserEmail(result.userId)}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <p>{new Date(result.timestamp).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={result.score >= 3 ? 'default' : 'destructive'}>
                                                {result.score} / {result.totalQuestions} ({Math.round((result.score / result.totalQuestions) * 100)}%)
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`${result.attentionScore >= 80 ? 'text-green-600 border-green-200 bg-green-50' : 'text-yellow-600 border-yellow-200 bg-yellow-50'}`}>
                                                    {result.attentionScore}%
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {formatDuration(durationSec)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm" onClick={() => setSelectedResult(result)}>
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        View Details
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                                                    <DialogHeader>
                                                        <DialogTitle>Assessment Details</DialogTitle>
                                                        <DialogDescription>Detailed view of quiz results.</DialogDescription>
                                                    </DialogHeader>
                                                    <div className="flex-1 overflow-y-auto pr-2">
                                                        {selectedResult && (
                                                            <div className="space-y-6">
                                                                {/* Summary Header */}
                                                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                                    <div>
                                                                        <p className="text-sm text-gray-500">Candidate</p>
                                                                        <p className="font-bold text-lg">{getUserName(selectedResult.userId)}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="text-sm text-gray-500">Total Score</p>
                                                                        <div className="flex items-baseline gap-1 justify-end">
                                                                            <span className="text-2xl font-bold text-blue-600">{selectedResult.score}</span>
                                                                            <span className="text-gray-500">/ {selectedResult.totalQuestions}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Questions Breakdown */}
                                                                <div>
                                                                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                        <FileText className="w-5 h-5 text-gray-500" />
                                                                        Answer Breakdown
                                                                    </h3>
                                                                    <div className="space-y-3">
                                                                        {selectedResult.answers.map((ans, index) => (
                                                                            <div key={index} className={`p-4 rounded-lg border ${ans.correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                                                                <div className="flex justify-between items-start mb-2">
                                                                                    <span className="font-medium text-sm text-gray-700">Question {index + 1}</span>
                                                                                    {ans.correct ? (
                                                                                        <Badge className="bg-green-600 hover:bg-green-700">Correct</Badge>
                                                                                    ) : (
                                                                                        <Badge variant="destructive">Incorrect</Badge>
                                                                                    )}
                                                                                </div>
                                                                                {/* Note: We don't store the question text in answers right now, only ID. 
                                                                        Ideally we should display question text. 
                                                                        For now, showing the answer provided. */}
                                                                                <div className="grid grid-cols-1 gap-2 text-sm">
                                                                                    <div>
                                                                                        <span className="text-gray-500">Selected Answer: </span>
                                                                                        <span className="font-medium text-gray-900">{ans.answer}</span>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    );
}
