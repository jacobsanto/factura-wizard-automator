
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProcessingStats as StatsType } from "@/types";

interface ProcessingStatsProps {
  stats: StatsType;
}

const ProcessingStats: React.FC<ProcessingStatsProps> = ({ stats }) => {
  const progressPercent = stats.total > 0 
    ? Math.round((stats.processed / stats.total) * 100) 
    : 0;
  
  const successPercent = stats.total > 0 
    ? Math.round((stats.success / stats.total) * 100) 
    : 0;
  
  const errorPercent = stats.total > 0 
    ? Math.round((stats.error / stats.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Συνολική Πρόοδος</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{progressPercent}%</div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-2 text-sm text-gray-500">
            {stats.processed} από {stats.total} αρχεία έχουν επεξεργαστεί
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Επιτυχημένες Επεξεργασίες</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2 text-green-500">{stats.success}</div>
          <Progress value={successPercent} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
          <div className="mt-2 text-sm text-gray-500">
            {successPercent}% ποσοστό επιτυχίας
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500">Σφάλματα</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2 text-red-500">{stats.error}</div>
          <Progress value={errorPercent} className="h-2 bg-gray-100" indicatorClassName="bg-red-500" />
          <div className="mt-2 text-sm text-gray-500">
            {stats.pending} αρχεία σε αναμονή
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingStats;
