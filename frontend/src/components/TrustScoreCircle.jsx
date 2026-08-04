function getScoreColor(score) {
  if (score >= 80) return { stroke: '#22c55e', bg: 'bg-green-50', text: 'text-green-600' };
  if (score >= 50) return { stroke: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600' };
  return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' };
}

export default function TrustScoreCircle({ score, riskLevel, size = 200 }) {
  const colors = getScoreColor(score);
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative inline-flex flex-col items-center rounded-full ${colors.bg} p-4`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-bold ${colors.text}`}>{score}</span>
        <span className="text-xs font-medium text-slate-500">Trust Score</span>
      </div>
      {riskLevel && (
        <span className={`mt-2 text-sm font-semibold ${colors.text}`}>{riskLevel}</span>
      )}
    </div>
  );
}
