const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    return null;
  }
}

function setSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

function logout() {
  clearSession();
  window.location.href = '/login';
}

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const res = await fetch(API_BASE + path, Object.assign({}, options, { headers }));
  let data = {};
  try {
    data = await res.json();
  } catch (e) {

  }

  if (!res.ok) {
    const err = new Error(data.message || data.error || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function requireAuth(role) {
  const user = getUser();
  const token = getToken();
  if (!user || !token) {
    window.location.href = '/login';
    return null;
  }
  if (role && user.role !== role) {
    window.location.href = '/';
    return null;
  }
  return user;
}

function fmtDate(d) {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function fmtDateTime(d) {
  if (!d) return '-';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function fmtMoney(n) {
  if (n === undefined || n === null || n === '') return '-';
  return '₹' + Number(n).toLocaleString('en-IN');
}

function showMsg(el, msg, isError) {
  if (!el) return;
  el.textContent = msg;
  el.className = 'msg ' + (isError ? 'error' : 'success');
  el.style.display = 'block';
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function badgeClassForStatus(status) {
  const s = (status || '').toLowerCase();
  if (['placed', 'offer', 'approved', 'shortlisted'].includes(s)) return 'badge badge-success';
  if (['rejected'].includes(s)) return 'badge badge-error';
  if (['pending', 'applied', 'test'].includes(s)) return 'badge badge-warning';
  if (['interview', 'open'].includes(s)) return 'badge badge-primary';
  return 'badge';
}

function initNav() {
  const user = getUser();
  document.querySelectorAll('[data-nav]').forEach((el) => {
    const scope = el.getAttribute('data-nav');
    let show = false;
    if (scope === 'guest') show = !user;
    else if (scope === 'auth') show = !!user;
    else show = user && user.role === scope;
    el.classList.toggle('hidden', !show);
  });
  const nameEl = document.getElementById('navUserName');
  if (nameEl && user) nameEl.textContent = user.name + ' (' + user.role + ')';
  const logoutBtn = document.getElementById('navLogoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
}

document.addEventListener('DOMContentLoaded', initNav);
