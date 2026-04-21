import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Mail, Clock, Briefcase, User } from 'lucide-react';

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

interface CandidateCardProps {
  candidate: Candidate;
}

export default function CandidateCard({ candidate }: CandidateCardProps) {
  const getExpressionColor = (expression: string) => {
    const colors: Record<string, string> = {
      confident: 'text-green-600 bg-green-50',
      engaged: 'text-blue-600 bg-blue-50',
      neutral: 'text-gray-600 bg-gray-50',
      distracted: 'text-yellow-600 bg-yellow-50',
      stressed: 'text-red-600 bg-red-50',
    };
    return colors[expression] || colors.neutral;
  };

  return (
    <div className="space-y-4">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">{candidate.name}</CardTitle>
                <CardDescription className="text-sm">{candidate.position}</CardDescription>
              </div>
            </div>
            <Badge variant={candidate.interviewStatus === 'ongoing' ? 'default' : 'secondary'}>
              {candidate.interviewStatus.charAt(0).toUpperCase() + candidate.interviewStatus.slice(1)}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Contact & Session Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{candidate.email}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Start Time</p>
              <p className="font-medium">{candidate.startTime}</p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <Briefcase className="w-4 h-4 text-gray-600" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Duration</p>
              <p className="font-medium">
                {Math.floor(candidate.duration / 60)}m {candidate.duration % 60}s
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Behavioral Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Behavioral Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Attention Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Attention Level</label>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${candidate.attentionLevel >= 80
                ? 'bg-green-100 text-green-700'
                : candidate.attentionLevel >= 60
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
                }`}>
                {candidate.attentionLevel}%
              </span>
            </div>
            <Progress value={candidate.attentionLevel} className="h-2" />
          </div>

          {/* Camera Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Camera Status</span>
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${candidate.cameraActive ? 'bg-green-500' : 'bg-gray-400'}`}></span>
              <span className="text-sm font-medium">{candidate.cameraActive ? 'Active' : 'Inactive'}</span>
            </span>
          </div>

          {/* Face Focused */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Focus Check</span>
            <span className={`text-sm font-medium ${candidate.faceFocused ? 'text-green-600' : 'text-yellow-600'}`}>
              {candidate.faceFocused ? '✓ Focused' : '✗ Distracted'}
            </span>
          </div>

          {/* Facial Expression */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Facial Expression</span>
            <Badge className={getExpressionColor(candidate.facialExpression)}>
              {candidate.facialExpression.charAt(0).toUpperCase() + candidate.facialExpression.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assessment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between p-2 bg-blue-50 rounded">
              <span>Overall Engagement</span>
              <span className="font-bold">
                {candidate.attentionLevel >= 80 ? 'Excellent' : candidate.attentionLevel >= 60 ? 'Good' : 'Poor'}
              </span>
            </div>
            <div className="flex justify-between p-2 bg-orange-50 rounded">
              <span>Behavorial Status</span>
              <span className="font-bold">{candidate.faceFocused ? 'Attentive' : 'Distracted'}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
