import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Compass, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [status, setStatus] = useState('processing'); // 'processing' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err) {
      setStatus('error');
      setErrorMsg(err === 'google_oauth_failed' ? 'Google authentication failed.' : 'OAuth authentication failed.');
      return;
    }

    if (token) {
      try {
        const res = await loginWithToken(token);
        if (res?.success) {
          setStatus('success');
          const redirectPath = sessionStorage.getItem('redirectAfterAuth');
          if (redirectPath) {
            sessionStorage.removeItem('redirectAfterAuth');
            setTimeout(() => navigate(redirectPath), 1000);
          } else {
            setTimeout(() => navigate('/my-trips'), 1000);
          }
        } else {
          setStatus('error');
          setErrorMsg('Failed to verify authentication token.');
        }
      } catch (e) {
        setStatus('error');
        setErrorMsg('Authentication service unavailable.');
      }
    } else {
      // Try verifying with cookie credentials
      try {
        const res = await loginWithToken('cookie_token');
        if (res?.success) {
          setStatus('success');
          setTimeout(() => navigate('/my-trips'), 1000);
        } else {
          setStatus('error');
          setErrorMsg('No authentication token received.');
        }
      } catch (e) {
        setStatus('error');
        setErrorMsg('Authentication callback error.');
      }
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-3xl max-w-md w-full text-center space-y-6 text-white shadow-2xl">
        <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        {status === 'processing' && (
          <div className="space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-xl font-black">Authenticating with Provider...</h2>
            <p className="text-xs text-slate-400">Verifying secure OAuth tokens and loading your WanderLust profile.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h2 className="text-xl font-black text-emerald-300">Authentication Successful!</h2>
            <p className="text-xs text-slate-300">Welcome to WanderLust. Redirecting you now...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 animate-fadeIn">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h2 className="text-xl font-black text-rose-400">Authentication Failed</h2>
            <p className="text-xs text-slate-400">{errorMsg || 'Could not complete login process.'}</p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => (window.location.href = '/api/auth/google')}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-all"
              >
                Try Google Login Again
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all"
              >
                Back to Login Page
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
