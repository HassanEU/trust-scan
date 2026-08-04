import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import TrustScoreCircle from '../components/TrustScoreCircle';

function MarketplaceBadge({ marketplace }) {
  const colors = {
    amazon: 'bg-orange-100 text-orange-700',
    flipkart: 'bg-blue-100 text-blue-700',
    ebay: 'bg-yellow-100 text-yellow-700',
    shopify: 'bg-green-100 text-green-700',
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${colors[marketplace] || 'bg-slate-100 text-slate-700'}`}>
      {marketplace}
    </span>
  );
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  useEffect(() => {
    if (!result) navigate('/', { replace: true });
  }, [result, navigate]);

  if (!result) return null;

  const positiveReasons = result.reasons?.filter((r) => r.startsWith('✓')) || [];
  const warningReasons = result.reasons?.filter((r) => r.startsWith('⚠')) || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          &larr; Analyze another product
        </Link>
      </div>

      <div className="card">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <TrustScoreCircle score={result.trustScore} riskLevel={result.riskLevel} />
          <div className="flex-1 text-center sm:text-left">
            <MarketplaceBadge marketplace={result.marketplace} />
            <h1 className="mt-2 text-2xl font-bold text-slate-900">{result.productName}</h1>
            <p className="mt-1 text-sm text-slate-500">Brand: {result.brand}</p>
            <p className="mt-1 text-lg font-semibold text-slate-800">{result.price}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Seller Information</h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs font-medium text-slate-500">Seller Name</dt>
              <dd className="text-sm font-medium text-slate-900">{result.sellerName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Seller Rating</dt>
              <dd className="text-sm font-medium text-slate-900">{result.sellerRating} / 5</dd>
            </div>
            <div>
              <dt className="text-xs font-medium text-slate-500">Marketplace</dt>
              <dd className="text-sm font-medium capitalize text-slate-900">{result.marketplace}</dd>
            </div>
          </dl>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-slate-900">Recommendation</h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-700">{result.recommendation}</p>
          {result.analysisDetails && (
            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                Fake Review Score: {result.analysisDetails.fakeReviewScore}/100
              </p>
              <p className="text-xs text-slate-500">
                Sentiment: {result.analysisDetails.sentiment} ({Math.round(result.analysisDetails.sentimentScore * 100)}%)
              </p>
              <p className="text-xs text-slate-500">
                Reviews Analyzed: {result.analysisDetails.reviewCount}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {positiveReasons.length > 0 && (
          <div className="card border-green-200 bg-green-50/50">
            <h2 className="text-lg font-semibold text-green-800">Trust Indicators</h2>
            <ul className="mt-3 space-y-2">
              {positiveReasons.map((reason, i) => (
                <li key={i} className="text-sm text-green-700">{reason}</li>
              ))}
            </ul>
          </div>
        )}

        {warningReasons.length > 0 && (
          <div className="card border-amber-200 bg-amber-50/50">
            <h2 className="text-lg font-semibold text-amber-800">Risk Factors</h2>
            <ul className="mt-3 space-y-2">
              {warningReasons.map((reason, i) => (
                <li key={i} className="text-sm text-amber-700">{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {result.analysisDetails?.sellerAnalysis && (
        <div className="card mt-6">
          <h2 className="text-lg font-semibold text-slate-900">AI Analysis Summary</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {result.analysisDetails.sellerAnalysis}
          </p>
        </div>
      )}
    </div>
  );
}
