import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function signIn(userEmail, userPassword) {
    setError('');
    setLoading(true);
    try {
      const user = await login(userEmail, userPassword);
      navigate(user.role === 'FACULTY' ? '/faculty' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    signIn(email, password);
  }

  return (
    <main className="login-screen">
      <div className="login-decoration login-decoration-top" /><div className="login-decoration login-decoration-bottom" />
      <section className="login-story">
        <a className="brand-lockup login-brand" href="/login"><span className="brand-mark">E</span><span>Edu<span className="brand-accent">Sync</span></span></a>
        <div className="story-content"><span className="eyebrow">A LITTLE MORE IN SYNC</span><h1>Your progress has a place to grow.</h1><p>Bring attendance, academic progress, and the next small step into focus.</p><div className="story-preview"><div className="preview-top"><span>YOUR LEARNING, IN FOCUS</span><span className="preview-dots">•••</span></div><div className="preview-greeting">A great week starts here <span>✦</span></div><div className="preview-bars"><span style={{ height: '44%' }} /><span style={{ height: '73%' }} /><span style={{ height: '58%' }} /><span style={{ height: '86%' }} /><span style={{ height: '68%' }} /><span style={{ height: '100%' }} /><span style={{ height: '78%' }} /></div><div className="preview-bottom"><span>Attendance overview</span><strong>82% <i>↑ 6%</i></strong></div></div></div>
        <div className="story-footer"><span>Designed for better learning, together.</span><span>REVA HACKATHON · 2026</span></div>
      </section>

      <section className="login-side">
        <div className="login-form-wrap">
          <div className="login-mobile-brand"><span className="brand-mark">E</span><strong>Edu<span className="brand-accent">Sync</span></strong></div>
          <span className="eyebrow">WELCOME TO EDUSYNC</span><h2>Good to see you.</h2><p className="login-subtitle">Sign in to your learning space.</p>
          {error && <div className="login-error" role="alert"><span>!</span>{error}</div>}
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="email">Email address</label>
            <div className="login-input-wrap"><span>✉</span><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="username" placeholder="you@university.edu" /></div>
            <div className="password-label-row"><label htmlFor="password">Password</label></div>
            <div className="login-input-wrap"><span>⌑</span><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" placeholder="Enter your password" /></div>
            <button type="submit" disabled={loading} className="login-submit">{loading ? 'Signing you in…' : 'Sign in'} <span>→</span></button>
          </form>
          <div className="demo-divider"><span /> <small>QUICK DEMO ACCESS</small> <span /></div>
          <div className="demo-access">
            <button type="button" onClick={() => { setEmail('faculty@demo.com'); setPassword('Password@123'); signIn('faculty@demo.com', 'Password@123'); }} disabled={loading}><span className="demo-avatar demo-faculty">F</span><span><strong>Faculty demo</strong><small>Explore teaching tools</small></span><b>→</b></button>
            <button type="button" onClick={() => { setEmail('student1@demo.com'); setPassword('Password@123'); signIn('student1@demo.com', 'Password@123'); }} disabled={loading}><span className="demo-avatar demo-student">S</span><span><strong>Student demo</strong><small>Explore the student view</small></span><b>→</b></button>
          </div>
          <p className="login-note"><span>✦</span> Your academic data stays within your learning space.</p>
        </div>
        <footer className="login-mobile-footer">Designed for better learning, together.</footer>
      </section>
    </main>
  );
};
