
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { feedbackService } from "@/services/FeedbackService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MethodPerformance {
  averageRating: number;
  totalRatings: number;
  commonIssues: string[];
  lastUpdated: string;
}

const ExtractionPerformanceCard: React.FC = () => {
  const [performance, setPerformance] = useState<Record<string, MethodPerformance>>({});
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    // Load performance data
    const data = feedbackService.getExtractionPerformance();
    setPerformance(data);
  }, []);

  const methodNames: Record<string, string> = {
    "gpt": "GPT (AI)",
    "documentAi": "Document AI",
    "pattern": "Pattern Matching"
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "gpt": return "bg-blue-100 text-blue-800";
      case "documentAi": return "bg-green-100 text-green-800";
      case "pattern": return "bg-amber-100 text-amber-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    } catch (e) {
      return "Invalid date";
    }
  };

  // Calculate overall stats
  const overallStats = Object.values(performance).reduce(
    (acc, curr) => {
      acc.totalFeedback += curr.totalRatings;
      acc.sumRatings += curr.averageRating * curr.totalRatings;
      return acc;
    },
    { totalFeedback: 0, sumRatings: 0 }
  );

  const overallRating = overallStats.totalFeedback
    ? (overallStats.sumRatings / overallStats.totalFeedback).toFixed(2)
    : "N/A";

  const getRatingStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>Απόδοση Εξαγωγής Δεδομένων</span>
          <Badge className="h-6" variant="outline">
            {overallStats.totalFeedback} αναφορές
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="summary"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Συνοπτικά</TabsTrigger>
            <TabsTrigger value="methods">Ανά Μέθοδο</TabsTrigger>
            <TabsTrigger value="issues">Κοινά Ζητήματα</TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="space-y-4 mt-4">
              <div className="text-center">
                <div className="text-4xl font-bold">{overallRating}</div>
                <div className="text-xl my-2">
                  {getRatingStars(Number(overallRating))}
                </div>
                <div className="text-gray-500">Μέση βαθμολογία</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-medium">Συνολικές Αναπληροφορήσεις</div>
                  <div className="text-2xl font-bold mt-1">
                    {overallStats.totalFeedback}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="font-medium">Μέθοδοι</div>
                  <div className="text-2xl font-bold mt-1">
                    {Object.keys(performance).length}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="methods">
            <div className="space-y-4 mt-4">
              {Object.keys(performance).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Δεν υπάρχουν διαθέσιμα δεδομένα απόδοσης
                </div>
              ) : (
                Object.entries(performance).map(([method, data]) => (
                  <div
                    key={method}
                    className="bg-gray-50 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <Badge className={getMethodColor(method)}>
                        {methodNames[method] || method}
                      </Badge>
                      <div className="mt-2 font-semibold">
                        {getRatingStars(Math.round(data.averageRating))}
                        <span className="ml-2">({data.averageRating})</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {data.totalRatings} αναφορές
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Τελευταία ενημέρωση: {formatDate(data.lastUpdated)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="issues">
            <div className="space-y-4 mt-4">
              {Object.keys(performance).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Δεν υπάρχουν διαθέσιμα δεδομένα για κοινά ζητήματα
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(performance).map(([method, data]) => (
                    <div key={method} className="space-y-2">
                      <h4 className="font-medium flex items-center">
                        <Badge className={getMethodColor(method)}>
                          {methodNames[method] || method}
                        </Badge>
                      </h4>
                      {data.commonIssues.length > 0 ? (
                        <ul className="ml-6 list-disc space-y-1">
                          {data.commonIssues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-gray-700">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500 ml-6">
                          Δεν έχουν αναφερθεί κοινά ζητήματα
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ExtractionPerformanceCard;
