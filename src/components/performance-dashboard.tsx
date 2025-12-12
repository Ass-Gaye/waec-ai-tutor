'use client';

import { QuizPerformance } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { useMemo } from "react";
import { Award } from "lucide-react";
import { ChartTooltipContent } from "./ui/chart";

interface PerformanceDashboardProps {
    history: QuizPerformance[];
}

export function PerformanceDashboard({ history }: PerformanceDashboardProps) {

    const chartData = useMemo(() => {
        const subjectData: { [key: string]: { totalScore: number, totalQuizzes: number, entries: number } } = {};
        
        history.forEach(item => {
            if (!subjectData[item.subject]) {
                subjectData[item.subject] = { totalScore: 0, totalQuizzes: 0, entries: 0 };
            }
            subjectData[item.subject].totalScore += (item.score / item.totalQuestions) * 100;
            subjectData[item.subject].entries += 1;
        });

        return Object.entries(subjectData).map(([subject, data]) => ({
            subject,
            averageScore: Math.round(data.totalScore / data.entries),
        }));

    }, [history]);
    
    const overallAverage = useMemo(() => {
        if (history.length === 0) return 0;
        const totalPercentage = history.reduce((acc, item) => acc + (item.score / item.totalQuestions) * 100, 0);
        return Math.round(totalPercentage / history.length);
    }, [history]);

    return (
        <Card className="animate-in fade-in-50 duration-500">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Award className="text-primary" />
                    Your Performance
                </CardTitle>
                <CardDescription>
                    Here's a summary of your quiz performance. Keep practicing!
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-sm text-muted-foreground">Overall Average Score</p>
                    <p className="text-4xl font-bold">{overallAverage}%</p>
                </div>
                <div>
                    <h3 className="text-center font-semibold mb-4 text-muted-foreground">Average Score by Subject</h3>
                    {chartData.length > 0 ? (
                        <div className="w-full h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                    <YAxis unit="%" allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))' }}
                                        content={<ChartTooltipContent indicator="dot" />}
                                    />
                                    <Bar dataKey="averageScore" name="Avg. Score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground">No data yet. Take a quiz to see your progress!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
