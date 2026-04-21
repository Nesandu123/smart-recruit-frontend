import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalyticsData {
  avgAttention: number;
  bestPerformer: string;
  averageEyeContact: number;
  totalInterviews: number;
  completionRate: number;
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Average Attention */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average Attention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{data.avgAttention}%</div>
              <Badge variant="outline" className="ml-auto">
                {data.avgAttention >= 75 ? 'Excellent' : data.avgAttention >= 60 ? 'Good' : 'Fair'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">Across all interviews</p>
          </CardContent>
        </Card>

        {/* Average Eye Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Eye Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-3xl font-bold">{data.averageEyeContact}%</div>
              <Badge variant="outline" className="ml-auto">
                {data.averageEyeContact >= 70 ? 'Strong' : 'Average'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 mt-2">Consistency indicator</p>
          </CardContent>
        </Card>

        {/* Total Interviews */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalInterviews}</div>
            <p className="text-xs text-gray-500 mt-2">All time</p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.completionRate}%</div>
            <p className="text-xs text-gray-500 mt-2">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Best Performer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🌟 Top Performer</CardTitle>
          <CardDescription>Highest attention level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
            <span className="font-semibold text-lg">{data.bestPerformer}</span>
            <Badge className="bg-yellow-500">⭐ Best</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
