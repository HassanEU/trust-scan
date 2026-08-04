import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { Card, PageHeader, Button } from '../components/UI';
import './Focus.css';

const STUDY_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusMode() {
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState('study');
  const [seconds, setSeconds] = useState(STUDY_TIME);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const intervalRef = useRef(null);

  const load = useCallback(() => {
    api.getFocusTodayCount().then((d) => setSessionsToday(d.count)).catch(console.error);
    api.getFocusSessions().then((s) => setTotalSessions(s.length)).catch(console.error);
  }, []);

  useEffect(() => { load(); }, [load]);

  const reset = useCallback((newMode) => {
    setRunning(false);
    setMode(newMode);
    setSeconds(newMode === 'study' ? STUDY_TIME : BREAK_TIME);
  }, []);

  const completeSession = useCallback(async () => {
    setRunning(false);
    if (mode === 'study') {
      await api.createFocusSession({ duration: 25, type: 'study' });
      refreshUser();
      load();
      reset('break');
    } else {
      await api.createFocusSession({ duration: 5, type: 'break' });
      reset('study');
    }
  }, [mode, reset, refreshUser, load]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            completeSession();
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, completeSession]);

  const progress = mode === 'study'
    ? ((STUDY_TIME - seconds) / STUDY_TIME) * 100
    : ((BREAK_TIME - seconds) / BREAK_TIME) * 100;

  return (
    <div className="focus-page">
      <PageHeader
        title="Focus Mode"
        subtitle="Pomodoro timer — 25 min study, 5 min break"
      />

      <div className="focus-container">
        <Card className={`focus-card ${running ? 'active' : ''}`}>
          <div className="focus-mode-badge">
            {mode === 'study' ? '🎯 Study Time' : '☕ Break Time'}
          </div>

          <div className="timer-ring" style={{ '--progress': progress }}>
            <div className="timer-display">{formatTime(seconds)}</div>
          </div>

          <div className="timer-controls">
            <Button
              size="lg"
              onClick={() => setRunning(!running)}
              className="timer-main-btn"
            >
              {running ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Start</>}
            </Button>
            <Button variant="secondary" onClick={() => reset(mode)}>
              <RotateCcw size={18} /> Reset
            </Button>
          </div>

          <div className="mode-switch">
            <button className={mode === 'study' ? 'active' : ''} onClick={() => reset('study')}>
              Study (25m)
            </button>
            <button className={mode === 'break' ? 'active' : ''} onClick={() => reset('break')}>
              <Coffee size={14} /> Break (5m)
            </button>
          </div>
        </Card>

        <div className="focus-stats">
          <Card className="focus-stat">
            <div className="focus-stat-value">{sessionsToday}</div>
            <div className="focus-stat-label">Sessions Today</div>
          </Card>
          <Card className="focus-stat">
            <div className="focus-stat-value">{totalSessions}</div>
            <div className="focus-stat-label">Total Sessions</div>
          </Card>
        </div>

        <Card className="focus-tips">
          <h3>Focus Tips</h3>
          <ul>
            <li>Put your phone on silent or in another room</li>
            <li>Close unnecessary browser tabs</li>
            <li>Take breaks seriously — rest helps you focus better</li>
            <li>Complete 4 sessions for a productive study block</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
