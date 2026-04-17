// ==================== SUPABASE INITIALIZATION ====================
(function initSupabase() {
  const SUPABASE_URL = 'https://jfnadthiwzguuzvfwbrt.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbmFkdGhpd3pndXV6dmZ3YnJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzMjU5OTUsImV4cCI6MjA5MTkwMTk5NX0.lG9zj5_Klt9i1bT_ZSDJ-hTMoRLPlGn_6HZrnqGeXSI';

  if (typeof window.supabase === 'undefined') {
    console.warn('Supabase SDK not loaded. Retrying in 100ms...');
    setTimeout(initSupabase, 100);
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase client ready at window.supabaseClient');
})();
// ==================== AUTH CHECK ====================
async function checkAuth() {
  // Wait for Supabase client to be ready
  if (!window.supabaseClient) {
    setTimeout(checkAuth, 100);
    return;
  }
  
  const { data: { session } } = await window.supabaseClient.auth.getSession();
  if (!session) {
    // Not logged in, redirect to login page
    window.location.href = 'login.html';
  } else {
    console.log('✅ User authenticated:', session.user.email);
    // Optionally update UI with user info
    const avatarEl = document.querySelector('.avatar');
    if (avatarEl) {
      avatarEl.textContent = session.user.email?.charAt(0).toUpperCase() || 'U';
    }
    const greetingName = document.querySelector('.greeting h1');
    if (greetingName) {
      const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'there';
      greetingName.textContent = `Welcome back, ${name}`;
    }
  }
}

checkAuth();
// ==================== AUTH GUARD ====================
async function checkAuth() {
  // Wait for Supabase client
  if (!window.supabaseClient) {
    setTimeout(checkAuth, 100);
    return;
  }

  const { data: { session } } = await window.supabaseClient.auth.getSession();

  if (!session) {
    // Not logged in → go to login
    window.location.href = 'login.html';
    return;
  }

  // User is logged in → update UI
  console.log('✅ Logged in as', session.user.email);

  // Update avatar and greeting
  const avatarEl = document.querySelector('.avatar');
  if (avatarEl) {
    avatarEl.textContent = session.user.email?.charAt(0).toUpperCase() || 'U';
  }

  const greetingName = document.querySelector('.greeting h1');
  if (greetingName) {
    const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'there';
    greetingName.textContent = `Welcome back, ${name}`;
  }
}

// Start auth check
checkAuth();

// ==================== LOGOUT FUNCTIONALITY ====================
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await window.supabaseClient.auth.signOut();
      window.location.href = 'login.html';
    });
  }
}

// Wait for DOM then setup logout
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLogout);
} else {
  setupLogout();
}
// ==================== APPLICATION LOGIC ====================
(function() {
  "use strict";

  console.log('🚀 Thinksharp app starting...');

  // ==================== THEME TOGGLE ====================
  const themeToggle = document.getElementById('themeToggle');
  const htmlEl = document.documentElement;

  function updateThemeButton() {
    if (!themeToggle) return;
    const isDark = htmlEl.classList.contains('dark');
    themeToggle.textContent = isDark ? '☀️ Light' : '🌙 Dark';
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      htmlEl.classList.toggle('dark');
      updateThemeButton();
      localStorage.setItem('theme', htmlEl.classList.contains('dark') ? 'dark' : 'light');
    });

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      htmlEl.classList.add('dark');
    } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      htmlEl.classList.add('dark');
    }
    updateThemeButton();
  }

  // ==================== VIEW SWITCHING ====================
  const views = {
    dashboard: document.getElementById('view-dashboard'),
    question: document.getElementById('view-question'),
    commitments: document.getElementById('view-commitments'),
    leaderboard: document.getElementById('view-leaderboard'),
    patterns: document.getElementById('view-patterns'),
    music: document.getElementById('view-music')
  };

  const navButtons = document.querySelectorAll('[data-view]');

  function switchView(viewId) {
    Object.values(views).forEach(view => {
      if (view) view.classList.remove('active');
    });
    const activeView = views[viewId];
    if (activeView) activeView.classList.add('active');

    navButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === viewId) {
        btn.classList.add('active');
      }
    });

    // Optional: update page title or header
    const headerH1 = document.querySelector(`#view-${viewId} .header h1`);
    if (!headerH1) {
      const greetingH1 = document.querySelector('.greeting h1');
      if (greetingH1 && viewId === 'dashboard') {
        greetingH1.textContent = 'Welcome back, Vikram';
      }
    }
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  const hash = window.location.hash.slice(1);
  if (hash && views[hash]) {
    switchView(hash);
  } else {
    switchView('dashboard');
  }

  // ==================== TIMER (SYNCED ACROSS VIEWS) ====================
  const timerEls = [
    document.getElementById('timer'),
    document.getElementById('timer2')
  ].filter(el => el !== null);
  const resetButtons = [
    document.getElementById('resetTimer'),
    document.getElementById('resetTimer2')
  ].filter(el => el !== null);
  const doneCheckboxes = [
    document.getElementById('commitmentDone'),
    document.getElementById('commitmentDone2')
  ].filter(el => el !== null);

  let endTime = localStorage.getItem('commitmentEndTime');
  if (!endTime) {
    endTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('commitmentEndTime', endTime);
  } else {
    endTime = parseInt(endTime, 10);
  }

  function updateAllTimers() {
    const now = Date.now();
    const diff = Math.max(0, endTime - now);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const displayStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    timerEls.forEach(el => {
      el.textContent = displayStr;
      el.style.color = diff === 0 ? '#ef4444' : 'var(--primary)';
    });
  }

  updateAllTimers();
  const timerInterval = setInterval(updateAllTimers, 1000);

  resetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      endTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('commitmentEndTime', endTime);
      updateAllTimers();
      doneCheckboxes.forEach(cb => { if (cb) cb.checked = false; });
      timerEls.forEach(el => { if (el) el.style.textDecoration = 'none'; });
    });
  });

  doneCheckboxes.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      timerEls.forEach(el => {
        if (el) el.style.textDecoration = isChecked ? 'line-through' : 'none';
      });
      doneCheckboxes.forEach(otherCb => {
        if (otherCb !== cb) otherCb.checked = isChecked;
      });
    });
  });

  // ==================== MOOD BUTTONS ====================
  document.querySelectorAll('.mood-buttons').forEach(container => {
    const btns = container.querySelectorAll('.mood-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
      });
    });
  });

  // ==================== MUSIC PLAYER TOGGLE ====================
  function setupMusicToggle(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    let isPlaying = false;
    btn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      btn.textContent = isPlaying ? '⏸️' : '▶️';
      const otherBtn = document.getElementById(btnId === 'playPauseMain' ? 'playPause2' : 'playPauseMain');
      if (otherBtn) otherBtn.textContent = isPlaying ? '⏸️' : '▶️';
    });
  }
  setupMusicToggle('playPauseMain');
  setupMusicToggle('playPause2');

  // ==================== CLEANUP ====================
  window.addEventListener('beforeunload', () => {
    clearInterval(timerInterval);
  });

  console.log('✅ Thinksharp UI ready');
})();


const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await window.supabaseClient.auth.signOut();
    window.location.href = 'login.html';
  });
}