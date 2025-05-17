
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProcessingStats as StatsType } from "@/types";

interface DashboardStatsProps {
  stats: StatsType;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-gray-500">Συνολικά Παραστατικά</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{stats.total}</div>
          <Progress value={(stats.processed / stats.total) * 100 || 0} className="h-2 mt-2" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-gray-500">Επιτυχής Επεξεργασία</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-green-500">{stats.success}</div>
            <div className="ml-2 text-sm text-muted-foreground">
              από {stats.total}
            </div>
          </div>
          <Progress value={(stats.success / stats.total) * 100 || 0} className="h-2 mt-2 bg-gray-100" indicatorClassName="bg-green-500" />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium text-gray-500">Σφάλματα</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-3xl font-bold text-red-500">{stats.error}</div>
            <div className="ml-2 text-sm text-muted-foreground">
              από {stats.total}
            </div>
          </div>
          <Progress value={(stats.error / stats.total) * 100 || 0} className="h-2 mt-2 bg-gray-100" indicatorClassName="bg-red-500" />
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
