import { useState, useEffect } from 'react';

// 해시 함수 (프로토타입용 클라이언트 인증)
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; } return h; }
const HASH_U = -1063142531; // muhayu
const HASH_P = 1851790850;  // muhayu2026!

export default function LoginGate({ children, title }) {
  const [authed, setAuthed] = useState(false);
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('auth') === '1') setAuthed(true);
  }, []);

  const check = () => {
    if (hash(id) === HASH_U && hash(pw) === HASH_P) {
      sessionStorage.setItem('auth', '1');
      setAuthed(true);
    } else {
      setErr(true);
    }
  };

  const handleKeyDown = (e, field) => {
    if (e.key === 'Enter') {
      if (field === 'id') document.getElementById('login-pw')?.focus();
      else check();
    }
  };

  if (authed) return children;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f3f4f6' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.1)', width: 340, textAlign: 'center' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1f2937', margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 24px' }}>ログインしてください / 로그인하세요</p>
        <input value={id} onChange={e => setId(e.target.value)} onKeyDown={e => handleKeyDown(e, 'id')} type="text" placeholder="ID" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: 10, outline: 'none' }} />
        <input id="login-pw" value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => handleKeyDown(e, 'pw')} type="password" placeholder="Password" style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d1d5db', borderRadius: 8, fontSize: 14, marginBottom: 16, outline: 'none' }} />
        {err && <p style={{ fontSize: 12, color: '#ef4444', margin: '0 0 12px' }}>ID / Password error</p>}
        <button onClick={check} style={{ width: '100%', padding: 12, background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Login</button>
      </div>
    </div>
  );
}
