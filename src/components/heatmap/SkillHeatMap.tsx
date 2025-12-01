'use client';

import { useMemo, useState } from 'react';
import type { CategoryTopicData } from './matrixBuilder';
import { HEIGHTS } from '@/define/heightDefines';

interface SkillHeatMapProps {
  data: CategoryTopicData[];
}

// 토픽명을 축약형으로 변환 (kebab-case → 앞글자 조합)
function abbreviateTopic(topic: string): string {
  const parts = topic.split('-');
  if (parts.length === 1) {
    return topic.slice(0, 4).toUpperCase();
  }
  // 각 파트의 첫 글자를 대문자로 조합
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

// 카테고리명을 표시용으로 변환
function formatCategoryName(category: string): string {
  return category.split('-').join(' ');
}

// 값에 따른 색상 강도 계산 (초록색 그라데이션)
function getIntensityColor(value: number, max: number): string {
  if (value === 0) {
    return '#ebedf0'; // 미학습 (연한 회색)
  }
  const intensity = Math.min(value / Math.max(max, 1), 1);

  // GitHub contribution 스타일 초록색 그라데이션
  if (intensity <= 0.25) return '#9be9a8';
  if (intensity <= 0.5) return '#40c463';
  if (intensity <= 0.75) return '#30a14e';
  return '#216e39';
}

// 값에 따른 텍스트 색상
function getTextColor(value: number, max: number): string {
  if (value === 0) return '#9ca3af'; // neutral-400
  const intensity = value / Math.max(max, 1);
  return intensity > 0.5 ? '#ffffff' : '#1f2328';
}

export default function SkillHeatMap({ data }: SkillHeatMapProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>('javascript');

  // 선택된 카테고리의 데이터
  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return data.find((d) => d.category === selectedCategory) ?? null;
  }, [data, selectedCategory]);

  // 선택된 카테고리의 최대값 (색상 계산용)
  const maxValue = useMemo(() => {
    if (!selectedCategoryData) return 1;
    return Math.max(...selectedCategoryData.topics.map((t) => t.value), 1);
  }, [selectedCategoryData]);

  // 전체 카테고리 중 최대 total (카테고리 바 표시용)
  const maxCategoryTotal = useMemo(() => {
    return Math.max(...data.map((d) => d.totalValue), 1);
  }, [data]);

  const totalLength = data.map((v) => v.totalValue).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col lg:flex-row gap-6" style={{ marginTop: HEIGHTS.GNB_HEIGHT }}>
      {/* 카테고리 목록 */}
      <div className="lg:w-64 shrink-0">
        <div className={'w-full flex justify-between mb-3'}>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide">
            Categories
          </h3>

          <h3 className={'text-sm font-semibold text-neutral-400'}>{totalLength}</h3>
        </div>
        <div className="space-y-1">
          {data.map((cat) => {
            const isSelected = selectedCategory === cat.category;
            const barWidth = (cat.totalValue / maxCategoryTotal) * 100;

            return (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200
                  relative overflow-hidden group cursor-pointer
                  ${
                    isSelected
                      ? 'bg-[#1f2328] text-white shadow-md'
                      : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700'
                  }
                `}
              >
                {/* 진행률 바 배경 */}
                {!isSelected && (
                  <div
                    className="absolute left-0 top-0 h-full bg-neutral-200 transition-all duration-300"
                    style={{ width: `${barWidth}%` }}
                  />
                )}

                <div className="relative flex items-center justify-between">
                  <span className="font-medium text-sm">{formatCategoryName(cat.category)}</span>
                  <span
                    className={`text-xs font-mono ${isSelected ? 'text-neutral-400' : 'text-neutral-500'}`}
                  >
                    {cat.totalValue > 0 ? cat.totalValue : '-'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 토픽 그리드 영역 */}
      <div className="flex-1 overflow-hidden">
        {!selectedCategory ? (
          <div className="flex items-center justify-center h-64 bg-neutral-50 rounded-xl border-2 border-dashed border-neutral-200">
            <div className="text-center">
              <div className="text-4xl mb-3 text-neutral-300">←</div>
              <p className="text-neutral-500 text-sm">
                카테고리를 선택하면
                <br />
                상세 토픽을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        ) : selectedCategoryData ? (
          <div>
            <div className="flex flex-col gap-2 justify-between mb-4 sm:flex-row sm:items-center">
              <h3 className="text-lg font-semibold text-[#1f2328]">
                {formatCategoryName(selectedCategory)}
              </h3>
              <div className="flex items-center gap-4 text-xs text-neutral-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ebedf0' }} />
                  <span>TODO</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#9be9a8' }} />
                  <span>IN PROGRESS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#216e39' }} />
                  <span>DONE</span>
                </div>
              </div>
            </div>

            {/* 토픽 그리드 */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2">
              {selectedCategoryData.topics.map((topic) => (
                <div key={topic.name} className="group relative" title={topic.name}>
                  <div
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center
                      transition-all duration-200 cursor-default
                      border border-neutral-200/50
                      hover:scale-105 hover:shadow-lg hover:z-10
                    `}
                    style={{
                      backgroundColor: getIntensityColor(topic.value, maxValue),
                      color: getTextColor(topic.value, maxValue),
                    }}
                  >
                    <span className="text-xs font-bold tracking-tight">
                      {abbreviateTopic(topic.name)}
                    </span>
                    {topic.value > 0 && (
                      <span className="text-[10px] opacity-80 mt-0.5">{topic.value}</span>
                    )}
                  </div>

                  {/* 툴팁 */}
                  <div
                    className={`
                      absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2
                      px-2.5 py-1.5 rounded-md shadow-lg
                      bg-[#1f2328] text-white text-xs whitespace-nowrap
                      opacity-0 invisible group-hover:opacity-100 group-hover:visible
                      transition-all duration-200 pointer-events-none
                    `}
                  >
                    <div className="font-medium">{topic.name}</div>
                    <div className="text-neutral-400 text-[10px] mt-0.5">
                      {topic.value === 0 ? 'TODO' : `Point: ${topic.value}`}
                    </div>
                    {/* 툴팁 화살표 */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1f2328]" />
                  </div>
                </div>
              ))}
            </div>

            {/* 카테고리 요약 */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#1f2328]">
                    {selectedCategoryData.topics.length}
                  </div>
                  <div className="text-xs text-neutral-500">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: '#216e39' }}>
                    {selectedCategoryData.topics.filter((t) => t.value > 0).length}
                  </div>
                  <div className="text-xs text-neutral-500">Done</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-neutral-400">
                    {selectedCategoryData.topics.filter((t) => t.value === 0).length}
                  </div>
                  <div className="text-xs text-neutral-500">Todo</div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
