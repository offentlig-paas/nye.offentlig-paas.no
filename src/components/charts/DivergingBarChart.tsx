'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import type { AggregatedOption } from '@/lib/surveys/aggregation'

interface DivergingBarChartProps {
  title: string
  description?: string
  options: AggregatedOption[]
  responseCount: number
}

const NEGATIVE_COLORS = ['#ef4444', '#f97316', '#fbbf24']
const NEUTRAL_COLOR = '#a1a1aa'
const POSITIVE_COLORS = ['#86efac', '#14b8a6']

function buildDivergingData(
  options: AggregatedOption[],
  responseCount: number
) {
  if (responseCount === 0 || options.length === 0) return []

  const hasNeutral = options.length % 2 === 1
  const splitIdx = Math.floor(options.length / 2)

  return [
    {
      name: '',
      ...Object.fromEntries(
        options.map((opt, i) => [
          opt.value,
          i < splitIdx || (!hasNeutral && i < splitIdx)
            ? -(opt.count / responseCount) * 100
            : (opt.count / responseCount) * 100,
        ])
      ),
    },
  ]
}

function getBarColor(index: number, total: number): string {
  const hasNeutral = total % 2 === 1
  const splitIdx = Math.floor(total / 2)

  if (hasNeutral && index === splitIdx) return NEUTRAL_COLOR

  if (index < splitIdx) {
    const negIdx = splitIdx - 1 - index
    return NEGATIVE_COLORS[Math.min(negIdx, NEGATIVE_COLORS.length - 1)]!
  }

  const posStart = hasNeutral ? splitIdx + 1 : splitIdx
  const posIdx = index - posStart
  return POSITIVE_COLORS[Math.min(posIdx, POSITIVE_COLORS.length - 1)]!
}

export function DivergingBarChart({
  title,
  description,
  options,
  responseCount,
}: DivergingBarChartProps) {
  const data = buildDivergingData(options, responseCount)

  return (
    <div className="space-y-2">
      <div>
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {title}
        </h4>
        {description && (
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
        {responseCount > 0 && (
          <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            N = {responseCount}
          </p>
        )}
      </div>

      {data.length > 0 && (
        <ResponsiveContainer width="100%" height={80}>
          <BarChart
            data={data}
            layout="vertical"
            stackOffset="sign"
            margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
          >
            <XAxis
              type="number"
              domain={[-100, 100]}
              tickFormatter={v => `${Math.abs(v as number)}%`}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-zinc-400 dark:text-zinc-500"
            />
            <YAxis type="category" hide />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.06)' }}
              formatter={(value, name) => {
                const opt = options.find(o => o.value === name)
                return [
                  `${Math.abs(Math.round(value as number))}% (${opt?.count ?? 0})`,
                  opt?.label ?? name,
                ]
              }}
              contentStyle={{
                backgroundColor: 'var(--color-zinc-800, #27272a)',
                border: 'none',
                borderRadius: '8px',
                color: '#e4e4e7',
                fontSize: '12px',
              }}
            />
            <ReferenceLine x={0} stroke="#71717a" />
            {options.map((opt, i) => (
              <Bar
                key={opt.value}
                dataKey={opt.value}
                stackId="stack"
                barSize={28}
              >
                <Cell fill={getBarColor(i, options.length)} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {options.map((opt, i) => (
          <div key={opt.value} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: getBarColor(i, options.length) }}
            />
            <span className="text-zinc-600 dark:text-zinc-400">
              {opt.label} ({opt.count})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
