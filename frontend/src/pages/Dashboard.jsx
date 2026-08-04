import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Brain, BookOpen, ArrowRight } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, ProgressRing, StatCard, Loading, PageHeader } from '../components/UI';
import { PRIORITY_COLORS } from '../utils';
import './Dashboard.css';

export default function Dashboard() {
  const { refreshUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then((d) => { setData(d); refreshUser(); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (!data) return null;

  const { greeting, message, stats, tasks, user } = data;

  return (
    <div className="dashboard">
      <PageHeader title={greeting} subtitle={message} />

      <div className="dashboard-hero card">
        <div className="hero-progress">
          <ProgressRing value={stats.progress} size={100} />
          <div>
            <div className="hero-label">Today's Progress</div>
            <div className="hero-detail">{stats.completed} of {stats.totalTasks} tasks done</div>
          </div>
        </div>
        <div className="hero-focus">
          <div className="focus-score-value">{stats.focusScore}</div>
          <div className="focus-score-label">Focus Score</div>
        </div>
      </div>

      <div className="grid-4 stats-row">
        <StatCard icon="📚" label="Study Hours" value={`${stats.studyHours}h`} color="#6366f1" />
        <StatCard icon="✅" label="Completed" value={stats.completed} color="#10b981" />
        <StatCard icon="⏳" label="Pending" value={stats.pending} color="#f59e0b" />
        <StatCard icon="🧠" label="Focus Sessions" value={stats.focusSessionsToday} color="#8b5cf6" />
      </div>

      <div className="dashboard-grid">
        <Card className="tasks-preview">
          <div className="section-header">
            <h2><CheckCircle2 size={18} /> Today's Tasks</h2>
            <Link to="/planner" className="section-link">View all <ArrowRight size={14} /></Link>
          </div>
          {tasks.length === 0 ? (
            <p className="muted-text">No tasks yet. <Link to="/planner">Add your first task</Link></p>
          ) : (
            <ul className="task-list-mini">
              {tasks.map((t) => (
                <li key={t._id} className={t.completed ? 'done' : ''}>
                  <span className="priority-dot" style={{ background: PRIORITY_COLORS[t.priority] }} />
                  <span className="task-title">{t.title}</span>
                  {t.completed && <CheckCircle2 size={16} className="check-icon" />}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <Link to="/planner" className="action-btn"><Clock size={20} /> Add Task</Link>
            <Link to="/study" className="action-btn"><BookOpen size={20} /> Log Study</Link>
            <Link to="/focus" className="action-btn"><Brain size={20} /> Focus Mode</Link>
            <Link to="/habits" className="action-btn">🔥 Check Habits</Link>
          </div>
        </Card>
      </div>

      <Card className="gamification-bar">
        <div className="gamify-item">
          <span className="gamify-icon">⭐</span>
          <div>
            <div className="gamify-value">{user.points} points</div>
            <div className="gamify-label">Total earned</div>
          </div>
        </div>
        <div className="gamify-item">
          <span className="gamify-icon">🔥</span>
          <div>
            <div className="gamify-value">{user.streak} day streak</div>
            <div className="gamify-label">Keep it going!</div>
          </div>
        </div>
        <div className="gamify-item">
          <span className="gamify-icon">🏅</span>
          <div>
            <div className="gamify-value">{user.badges.length} badges</div>
            <div className="gamify-label"><Link to="/badges">View all</Link></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
