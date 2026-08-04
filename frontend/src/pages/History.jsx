import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

function ScoreBadge({ score }) {
  let color = 'bg-red-100 text-red-700';
  if (score >= 80) color = 'bg-green-100 text-green-700';
  else if (score >= 50) color = 'bg-amber-100 text-amber-700';

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      {score}
    </span>
  );
}

export default function History() {
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    userAPI
      .getHistory()
      .then(({ data }) => setChecks(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    try {
      await userAPI.deleteCheck(id);
      setChecks((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const viewResult = (check) => ({
    productName: check.productName,
    brand: check.brand,
    sellerName: check.sellerName,
    sellerRating: check.sellerRating,
    marketplace: check.marketplace,
    price: check.price,
    trustScore: check.trustScore,
    riskLevel: check.riskLevel,
    reasons: check.reasons,
    recommendation: check.recommendation,
    analysisDetails: check.analysisDetails,
    productUrl: check.productUrl,
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Analysis History</h1>
      <p className="mt-1 text-sm text-slate-500">Your previously checked products</p>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {checks.length === 0 ? (
        <div className="card mt-8 text-center">
          <p className="text-slate-500">No product checks yet.</p>
          <Link to="/" className="btn-primary mt-4 inline-flex">Analyze a Product</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {checks.map((check) => (
            <div key={check._id} className="card flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <ScoreBadge score={check.trustScore} />
                  <span className="text-xs font-medium capitalize text-slate-500">{check.marketplace}</span>
                </div>
                <h3 className="mt-1 truncate font-semibold text-slate-900">{check.productName}</h3>
                <p className="text-xs text-slate-500">
                  {check.sellerName} &middot; {new Date(check.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Link
                  to="/results"
                  state={{ result: viewResult(check) }}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(check._id)}
                  className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
