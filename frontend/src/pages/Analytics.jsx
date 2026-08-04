import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { api } from '../api';
import { Card, PageHeader, Loading, EmptyState } from '../components/UI';
import './Analytics.css';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const studyChart = data.studyTrend.map((d) => ({
    name: d.date.slice(5),
    minutes: d.minutes,
  }));

  const taskChart = data.taskTrend.map((d) => ({
    name: d.date.slice(5),
    completed: d.completed,
    total: d.total,
  }));

  const focusChart = data.focusTrend.map((d) => ({
    name: d.date.slice(5),
    sessions: d.sessions,
  }));

  return (
    <div className="analytics-page">
      <PageHeader title="Performance Analysis" subtitle="Track your improvement over time" />

      <div className="grid-3 analytics-summary">
        <Card className="analytics-stat">
          <div className="a-stat-value">{Math.round(data.summary.weekStudyMinutes / 60 * 10) / 10}h</div>
          <div className="a-stat-label">Study This Week</div>
        </Card>
        <Card className="analytics-stat">
          <div className="a-stat-value">{data.summary.weekTasksCompleted}</div>
          <div className="a-stat-label">Tasks Completed</div>
        </Card>
        <Card className="analytics-stat">
          <div className="a-stat-value">{data.summary.weekFocusSessions}</div>
          <div className="a-stat-label">Focus Sessions</div>
        </Card>
      </div>

      <div className="analytics-charts">
        <Card>
          <h3>Study Trend (7 days)</h3>
          {studyChart.every((d) => d.minutes === 0) ? (
            <EmptyState icon="📈" title="No study data" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={studyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`${v} min`, 'Study']} />
                <Line type="monotone" dataKey="minutes" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3>Tasks Completed (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={taskChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <h3>Focus Sessions (7 days)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={focusChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sessions" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {data.subjectBreakdown.length > 0 && (
        <Card className="weak-areas">
          <h3>Subject Breakdown (30 days)</h3>
          <div className="subject-bars">
            {data.subjectBreakdown
              .sort((a, b) => b.minutes - a.minutes)
              .map((s) => {
                const max = data.subjectBreakdown[0]?.minutes || 1;
                const pct = Math.round((s.minutes / max) * 100);
                return (
                  <div key={s.name} className="subject-bar-row">
                    <span className="sb-name">{s.name}</span>
                    <div className="sb-track">
                      <div className="sb-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="sb-val">{s.minutes}m</span>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      <Card className="suggestions-card">
        <h3><Lightbulb size={18} /> Suggestions to Improve</h3>
        <ul className="suggestions-list">
          {data.suggestions.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </Card>

      {data.habitConsistency.length > 0 && (
        <Card>
          <h3>Habit Consistency (This Week)</h3>
          <div className="habit-consistency">
            {data.habitConsistency.map((h) => (
              <div key={h.name} className="hc-item">
                <span>{h.icon} {h.name}</span>
                <div className="hc-dots">
                  {[...Array(7)].map((_, i) => (
                    <span key={i} className={`hc-dot ${i < h.weekDone ? 'filled' : ''}`} />
                  ))}
                </div>
                <span className="hc-streak">🔥 {h.streak}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
