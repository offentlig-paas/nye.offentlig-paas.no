'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { AggregatedOption } from '@/lib/surveys/aggregation'

interface HorizontalBarChartProps {
  title: string
  description?: string
  options: AggregatedOption[]
  responseCount: number
}

const BAR_COLOR = '#14b8a6'

export function HorizontalBarChart({
  title,
  description,
  options,
  responseCount,
}: HorizontalBarChartProps) {
  const visibleOptions = options.filter(o => o.count > 0)
  const longestLabel = Math.max(...visibleOptions.map(o => o.label.length), 0)
  const yAxisWidth = Math.min(Math.max(longestLabel * 6.5, 120), 280)
  const barHeight = 36
  const chartHeight = Math.max(visibleOptions.length * barHeight + 40, 120)

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
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={visibleOptions}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 0, bottom: 0 }}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            width={yAxisWidth}
            tick={{ fontSize: 12, fill: 'currentColor' }}
            tickLine={false}
            axisLine={false}
            className="text-zinc-600 dark:text-zinc-400"
          />
          <Tooltip
            cursor={{ fill: 'rgba(255,255,255,0.06)' }}
            formatter={(value, _name, props) => [
              `${value} (${(props.payload as AggregatedOption).percentage}%)`,
              'Antall',
            ]}
            contentStyle={{
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: '8px',
              color: '#e4e4e7',
              fontSize: '12px',
            }}
          />
          <Bar
            dataKey="count"
            radius={[0, 4, 4, 0]}
            barSize={20}
            label={<BarLabel />}
          >
            {visibleOptions.map((_, i) => (
              <Cell
                key={i}
                className="fill-teal-500 dark:fill-teal-400"
                fill={BAR_COLOR}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarLabel(props: Record<string, unknown>) {
  const { x, y, width, height } = props as {
    x: number
    y: number
    width: number
    height: number
  }
  const payload = props.payload as AggregatedOption | undefined
  if (!payload?.count) return null

  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dominantBaseline="middle"
      className="fill-zinc-600 dark:fill-zinc-400"
      fontSize={12}
    >
      {payload.count} ({payload.percentage}%)
    </text>
  )
}
