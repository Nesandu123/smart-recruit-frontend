'use client';

import React, { useState, useEffect } from 'react';
import { storage, User, QuizResult } from '@/lib/storage';
import CandidateCard from '@/components/admin/CandidateCard';
import InterviewMonitor from '@/components/admin/InterviewMonitor';
import UserManagement from '@/components/admin/UserManagement';
import PastResultsTable from '@/components/admin/PastResultsTable'; // Import new component
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LogOut, Activity, History, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  interviewStatus: 'ongoing' | 'completed' | 'scheduled';
  attentionLevel: number;
  cameraActive: boolean;
  startTime: string;
  duration: number;
  faceFocused: boolean;
  eyeContact: number;
  facialExpression: string;
  attentionHistory?: number[]; 
}

export default function AdminDashboard() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // New raw state for History view
  const [rawUsers, setRawUsers] = useState<User[]>([]);
  const [rawResults, setRawResults] = useState<QuizResult[]>([]);

  const [loading, setLoading] = useState(true);

  // Poll for updates
  useEffect(() => {
    storage.init();

    const fetchData = () => {
      const users = storage.getUsers().filter(u => u.role !== 'admin');
      const results = storage.getResults();

      setRawUsers(users);
      setRawResults(results);

      // Transform Users + Results to Candidates 
      const mappedCandidates: Candidate[] = users.map(user => {
        // Find latest ongoing or most recent result
        const userResults = results.filter(r => r.userId === user.id);
        const activeResult = userResults.find(r => r.status === 'ongoing') ||
          userResults.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];

        // Calculate duration
        let duration = 0;
        if (activeResult?.startTime) {
          const start = new Date(activeResult.startTime).getTime();
          const end = activeResult.endTime ? new Date(activeResult.endTime).getTime() : Date.now();
          duration = Math.floor((end - start) / 1000); // in seconds
        }

        return {
          id: user.id,
          name: user.name,
          email: user.username,
          position: 'Candidate',
          interviewStatus: activeResult ? activeResult.status as any : 'scheduled',
          attentionLevel: activeResult ? activeResult.attentionScore : 0,
          cameraActive: activeResult?.status === 'ongoing',
          startTime: activeResult?.startTime ? new Date(activeResult.startTime).toLocaleTimeString() : '-',
          duration: duration,
          attentionHistory: activeResult?.attentionHistory || [], // Pass history
          faceFocused: (activeResult?.attentionScore || 0) > 60,
          eyeContact: activeResult?.attentionScore || 0,
          facialExpression: (activeResult?.attentionScore || 0) > 80 ? 'focused' : 'distracted',
        };
      });

      setCandidates(mappedCandidates);

      // Update selected candidate if exists
      if (selectedCandidate) {
        const updated = mappedCandidates.find(c => c.id === selectedCandidate.id);
        if (updated) setSelectedCandidate(updated);
      }

      setLoading(false);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []); 

  const getAttentionColor = (level: number) => {
    if (level >= 80) return 'bg-green-500';
    if (level >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'default';
      case 'completed':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Filter for tabs
  const liveCandidates = candidates.filter(c => c.interviewStatus === 'ongoing' || c.interviewStatus === 'scheduled');

  const ongoingCount = candidates.filter(c => c.interviewStatus === 'ongoing').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">manage users, monitor live interviews, and review results.</p>
          </div>
        </div>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="mb-6 grid w-full grid-cols-3 max-w-xl">
            <TabsTrigger value="live" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Live Monitor
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History & Results
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Manage Users
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: LIVE DASHBOARD */}
          <TabsContent value="live">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Active Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{ongoingCount}</div>
                  <p className="text-xs text-gray-500 mt-1">Currently taking quiz</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Scheduled/Idle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-600">
                    {liveCandidates.filter(c => c.interviewStatus === 'scheduled').length}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Waiting to start</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Live Attention Avg</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {ongoingCount > 0 ? Math.round(
                      candidates.filter(c => c.interviewStatus === 'ongoing').reduce((acc, c) => acc + c.attentionLevel, 0) /
                      ongoingCount
                    ) : '-'}
                    {ongoingCount > 0 && '%'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Real-time metric</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Active Candidate List */}
              <div className="lg:col-span-1">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Live Candidates</CardTitle>
                    <CardDescription>Select a candidate to monitor active session</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {liveCandidates.length === 0 && <p className="text-gray-500 text-sm p-4 text-center">No active sessions.</p>}
                      {liveCandidates.map(candidate => (
                        <div
                          key={candidate.id}
                          onClick={() => setSelectedCandidate(candidate)}
                          className={`p-3 rounded-lg cursor-pointer transition-all ${selectedCandidate?.id === candidate.id
                            ? 'bg-blue-50 border-2 border-blue-500'
                            : 'bg-white border border-gray-200 hover:border-blue-300'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-sm">{candidate.name}</p>
                              <p className="text-xs text-gray-500">{candidate.position}</p>
                            </div>
                            <Badge variant={getStatusBadgeVariant(candidate.interviewStatus)}>
                              {candidate.interviewStatus === 'ongoing' && (
                                <span className="flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                  Live
                                </span>
                              )}
                              {candidate.interviewStatus === 'scheduled' && 'Pending'}
                            </Badge>
                          </div>
                          {candidate.interviewStatus === 'ongoing' && (
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">Current Attention:</span>
                              <span className={`text-xs font-bold ${getAttentionColor(candidate.attentionLevel)}`}>
                                {candidate.attentionLevel}%
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Detailed Monitoring */}
              <div className="lg:col-span-2">
                {selectedCandidate && (selectedCandidate.interviewStatus === 'ongoing' || selectedCandidate.interviewStatus === 'scheduled') ? (
                  <Tabs defaultValue="monitoring" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
                      <TabsTrigger value="details">Candidate Details</TabsTrigger>
                    </TabsList>

                    <TabsContent value="monitoring" className="space-y-4">
                      <InterviewMonitor candidate={selectedCandidate} />
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4">
                      <CandidateCard candidate={selectedCandidate} />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-96">
                      <p className="text-gray-500">Select a live candidate to view real-time data</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: HISTORY */}
          <TabsContent value="history">
            <PastResultsTable results={rawResults.filter(r => r.status === 'completed')} users={rawUsers} />
          </TabsContent>

          {/* TAB 3: USERS */}
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
