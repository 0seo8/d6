"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator, Clock, TrendingUp, Target } from "lucide-react";

interface StreamingGoal {
  platform: string;
  current: number;
  goal: number;
  timeLeft: number; // hours
}

export default function CalculatorPage() {
  const [goals, setGoals] = useState<StreamingGoal[]>([
    { platform: "멜론", current: 0, goal: 1000, timeLeft: 24 },
    { platform: "지니", current: 0, goal: 500, timeLeft: 24 },
    { platform: "벅스", current: 0, goal: 300, timeLeft: 24 },
    { platform: "바이브", current: 0, goal: 200, timeLeft: 24 },
    { platform: "플로", current: 0, goal: 150, timeLeft: 24 },
  ]);

  const updateGoal = (
    index: number,
    field: keyof StreamingGoal,
    value: number
  ) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setGoals(newGoals);
  };

  const calculateStreamsNeeded = (goal: StreamingGoal) => {
    const remaining = goal.goal - goal.current;
    if (remaining <= 0) return { needed: 0, perHour: 0 };

    const perHour = Math.ceil(remaining / goal.timeLeft);
    return { needed: remaining, perHour };
  };

  const getTotalProgress = () => {
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.current, 0);
    const totalGoal = goals.reduce((sum, goal) => sum + goal.goal, 0);
    return Math.round((totalCurrent / totalGoal) * 100);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-lg md:text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-blue-600" />
          스트리밍 계산기
        </h1>
        <p className="text-xs md:text-sm text-gray-500">
          목표 달성을 위한 시간당 스트리밍 횟수를 계산해보세요
        </p>
      </div>

      {/* 전체 진행률 */}
      <Card className="p-4">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              전체 진행률
            </h2>
            <span className="text-2xl font-bold text-green-600">
              {getTotalProgress()}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getTotalProgress()}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 플랫폼별 계산기 */}
      <div className="space-y-4">
        {goals.map((goal, index) => {
          const calc = calculateStreamsNeeded(goal);
          const progress = Math.min((goal.current / goal.goal) * 100, 100);
          const isCompleted = goal.current >= goal.goal;

          return (
            <Card key={goal.platform} className="p-4">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    {goal.platform}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {goal.timeLeft}시간 남음
                  </div>
                </div>

                {/* 입력 필드들 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      현재 스트리밍
                    </label>
                    <input
                      type="number"
                      value={goal.current}
                      onChange={(e) =>
                        updateGoal(
                          index,
                          "current",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      목표
                    </label>
                    <input
                      type="number"
                      value={goal.goal}
                      onChange={(e) =>
                        updateGoal(index, "goal", parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1000"
                    />
                  </div>
                </div>

                {/* 진행률 바 */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>진행률</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted ? "bg-green-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* 계산 결과 */}
                {!isCompleted ? (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-900">
                        달성 가이드
                      </span>
                    </div>
                    <div className="text-sm text-blue-800">
                      <p className="mb-1">
                        <span className="font-semibold">
                          {calc.needed.toLocaleString()}회
                        </span>{" "}
                        더 스트리밍 필요
                      </p>
                      <p>
                        시간당{" "}
                        <span className="font-semibold text-blue-600">
                          {calc.perHour.toLocaleString()}회
                        </span>{" "}
                        스트리밍하면 달성!
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-green-600 font-semibold">
                      🎉 목표 달성!
                    </div>
                    <div className="text-sm text-green-700 mt-1">
                      축하합니다! 목표를 달성했습니다.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
