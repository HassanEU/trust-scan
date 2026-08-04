import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeAPI } from '../api/client';
import LoadingSpinner from '../components/LoadingSpinner';

const SAMPLE_URLS = [
  { label: 'Amazon', url: 'https://www.amazon.com/dp/B08N5WRWNW' },
  { label: 'Flipkart', url: 'https://www.flipkart.com/sample-product/p/itm123' },
  { label: 'eBay', url: 'https://www.ebay.com/itm/123456789' },
  { label: 'Shopify', url: 'https://demo-store.myshopify.com/products/wireless-headphones' },
];

export default function Home() {
  const [productUrl, setProductUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!productUrl.trim()) {
      setError('Please enter a product URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await analyzeAPI.analyze(productUrl.trim());
      navigate('/results', { state: { result: data.data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 px-4 py-20 text-white sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Shop with Confidence
          </h1>
          <p className="mt-4 text-lg text-brand-100">
            Paste any product URL and TrustScan will analyze the seller, reviews, and pricing
            to estimate whether the product is genuine or suspicious.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-4 -mt-10 sm:px-6">
        <form onSubmit={handleAnalyze} className="card shadow-lg">
          <label htmlFor="productUrl" className="block text-sm font-semibold text-slate-700">
            Product URL
          </label>
          <input
            id="productUrl"
            type="url"
            className="input-field mt-2"
            placeholder="https://www.amazon.com/dp/..."
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            disabled={loading}
          />

          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>
          )}

          <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <LoadingSpinner size="sm" />
                Analyzing...
              </span>
            ) : (
              'Analyze Product'
            )}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-xs font-medium text-slate-500">Try a sample URL</p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {SAMPLE_URLS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setProductUrl(sample.url)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-brand-500 hover:text-brand-600"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-bold text-slate-900">How It Works</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: '1', title: 'Paste URL', desc: 'Enter a product link from any supported marketplace' },
            { step: '2', title: 'AI Analysis', desc: 'We analyze seller reputation, reviews, and pricing' },
            { step: '3', title: 'Trust Score', desc: 'Get a 0-100 trust score with detailed risk factors' },
            { step: '4', title: 'Decision', desc: 'Receive a clear recommendation before you buy' },
          ].map((item) => (
            <div key={item.step} className="card text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {item.step}
              </div>
              <h3 className="mt-3 font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
