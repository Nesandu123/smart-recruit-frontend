'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

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

interface InterviewMonitorProps {
  candidate: Candidate;
}

export default function InterviewMonitor({ candidate }: InterviewMonitorProps) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [attentionData, setAttentionData] = useState<number[]>([]); // Changed initial state
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Timer Logic
    if (candidate.interviewStatus === 'completed') {
      // If completed, show total duration
      setElapsedTime(candidate.duration);
      return;
    }

    // For ongoing, initial elapsed time estimate
    if (candidate.startTime && candidate.startTime !== '-') {
      // Estimate seconds based on duration (which is minutes)
      setElapsedTime(candidate.duration);
    }

    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [candidate.duration, candidate.startTime, candidate.interviewStatus]); // Added candidate.interviewStatus to dependencies

  useEffect(() => {
    // Update Attention Graph from History
    if (candidate.attentionHistory && candidate.attentionHistory.length > 0) {
      // Show last 20 points
      setAttentionData(candidate.attentionHistory.slice(-20));
    } else {
      // If no history yet, just show current level if live
      setAttentionData([candidate.attentionLevel]);
    }
  }, [candidate.attentionHistory, candidate.attentionLevel]); // Updated dependencies

  useEffect(() => {
    // Generate alerts based on metrics
    const newAlerts: string[] = [];
    if (candidate.interviewStatus === 'ongoing') { // Added condition for ongoing status
      if (!candidate.cameraActive) {
        newAlerts.push('Camera is inactive');
      }
      if (!candidate.faceFocused) {
        newAlerts.push('Face is out of focus');
      }
      if (candidate.attentionLevel < 50) {
        newAlerts.push('Low attention level detected');
      }
    }
    setAlerts(newAlerts);
  }, [candidate]); // Updated dependencies

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAttentionTrend = () => {
    if (attentionData.length < 2) return 'stable';
    const recent = attentionData.slice(-5);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const end = recent[recent.length - 1]; // Changed logic for trend calculation
    const start = recent[0]; // Changed logic for trend calculation
    if (end > start + 5) return 'increasing';
    if (end < start - 5) return 'decreasing';
    return 'stable';
  };

  return (
    <div className="space-y-4">
      {/* Session Header */} {/* Changed comment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex justify-between items-center">
            <span>{candidate.interviewStatus === 'completed' ? 'Session Summary' : (candidate.interviewStatus === 'scheduled' ? 'Scheduled Session' : 'Live Session')}</span>
            <Badge variant={candidate.interviewStatus === 'ongoing' ? 'default' : 'secondary'}>
              {candidate.interviewStatus.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                {candidate.interviewStatus === 'completed' ? 'Total Duration' : (candidate.interviewStatus === 'scheduled' ? 'Estimated Time' : 'Elapsed Time')}
              </p>
              <p className="text-3xl font-bold text-gray-900 font-mono mt-1">
                {candidate.interviewStatus === 'scheduled' ? '--:--' : (candidate.interviewStatus === 'completed' ? formatTime(candidate.duration) : formatTime(elapsedTime))}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 font-medium">Status</p>
              {candidate.interviewStatus === 'ongoing' && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-bold text-green-700">Live</span>
                </div>
              )}
              {candidate.interviewStatus === 'scheduled' && (
                <span className="font-bold text-blue-600 mt-1 block">Scheduled</span>
              )}
              {candidate.interviewStatus === 'completed' && (
                <span className="font-bold text-gray-700 mt-1 block">Completed</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Performance Metrics</CardTitle> {/* Changed title */}
          <CardDescription>
            {candidate.interviewStatus === 'completed' ? 'Final metrics recorded' : 'Current metrics'} {/* Changed description */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Attention Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Attention Score</span> {/* Changed label */}
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${candidate.attentionLevel >= 80
                  ? 'text-green-600'
                  : candidate.attentionLevel >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600'
                  }`}>
                  {candidate.attentionLevel}%
                </span>
                {candidate.interviewStatus === 'ongoing' && (
                  <span className="text-xs text-gray-500">
                    {getAttentionTrend() === 'increasing' && '↑'}
                    {getAttentionTrend() === 'decreasing' && '↓'}
                    {getAttentionTrend() === 'stable' && '→'}
                  </span>
                )}
              </div>
            </div>
            <Progress value={candidate.attentionLevel} className="h-3" />
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className={`p-3 rounded-lg border ${candidate.cameraActive || candidate.interviewStatus === 'completed'
              ? 'bg-gray-50 border-gray-200'
              : 'bg-red-50 border-red-200'
              }`}>
              <p className="text-xs text-gray-600 mb-1">Camera Status</p>
              <p className="text-sm font-bold text-gray-800">
                {candidate.cameraActive ? 'Active' : (candidate.interviewStatus === 'completed' ? 'Off' : 'Inactive')}
              </p>
            </div>

            <div className={`p-3 rounded-lg border ${candidate.faceFocused
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
              }`}>
              <p className="text-xs text-gray-600 mb-1">Attention Check</p>
              <p className={`text-sm font-bold ${candidate.faceFocused ? 'text-green-600' : 'text-yellow-600'
                }`}>
                {candidate.faceFocused ? 'Focused' : 'Distracted'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attention Graph */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attention Timeline</CardTitle>
          <CardDescription>
            {candidate.interviewStatus === 'completed' ? 'Session history' : 'Live trend (Last 20 updates)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {attentionData.length > 0 ? (
              <div className="flex items-end gap-1 h-32 bg-gray-50 p-4 rounded-lg">
                {attentionData.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 bg-blue-500 rounded-t opacity-75 hover:opacity-100 transition-opacity"
                    style={{
                      height: `${Math.max(10, (value / 100) * 100)}%`,
                    }}
                    title={`${Math.round(value)}%`}
                  ></div>
                ))}
              </div>
            ) : (
              <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
            {candidate.interviewStatus === 'ongoing' && (
              <p className="text-xs text-gray-500 text-center">Updates live</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {alerts.length > 0 && candidate.interviewStatus === 'ongoing' && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-white rounded border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-700">{alert}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Alerts */}
      {alerts.length === 0 && candidate.interviewStatus === 'ongoing' && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">Interview Proceeding Normally</p>
                <p className="text-xs text-green-700">All metrics are within acceptable ranges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
