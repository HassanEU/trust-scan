import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, PageHeader, Loading } from '../components/UI';
import './Badges.css';

export default function Badges() {
  const { user } = useAuth();
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard()
      .then((d) => setBadges(d.allBadges || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const earned = badges.filter((b) => b.earned);
  const locked = badges.filter((b) => !b.earned);

  return (
    <div>
      <PageHeader
        title="Achievements"
        subtitle={`${earned.length} of ${badges.length} badges unlocked`}
      />

      <Card className="points-banner">
        <div className="points-big">⭐ {user?.points || 0}</div>
        <div className="points-sub">Total Points · 🔥 {user?.streak || 0} day streak</div>
      </Card>

      <section className="badge-section">
        <h2 className="badge-section-title">🏅 Earned Badges</h2>
        {earned.length === 0 ? (
          <Card className="badge-empty">Complete tasks and study sessions to earn your first badge!</Card>
        ) : (
          <div className="badge-grid">
            {earned.map((b) => (
              <Card key={b.id} className="badge-card earned">
                <div className="badge-icon">{b.icon}</div>
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.description}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="badge-section">
        <h2 className="badge-section-title">🔒 Locked Badges</h2>
        <div className="badge-grid">
          {locked.map((b) => (
            <Card key={b.id} className="badge-card locked">
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.description}</div>
            </Card>
          ))}
        </div>
      </section>

      <Card className="points-guide">
        <h3>How to Earn Points</h3>
        <ul>
          <li>✅ Complete a task — 5 to 15 points (based on priority)</li>
          <li>📚 Log study time — up to 30 points per session</li>
          <li>🧠 Complete a focus session — 20 points</li>
          <li>🔥 Check off a habit — 8 points</li>
          <li>🏅 Unlock a badge — 25 bonus points</li>
        </ul>
      </Card>
    </div>
  );
}
