
import { getUser, getToken } from '../modules/auth.js';

export async function renderAdminDashboard() {
  const user = getUser();
  if (!user || user.role !== 'admin') {
    document.getElementById('app').innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <h1>⛔ Accesso Negato</h1>
        <p>Non hai i permessi per visualizzare questa pagina.</p>
        <button class="btn btn-primary" onclick="window.location.href='/'">Torna alla Home</button>
      </div>
    `;
    return;
  }

  const view = document.getElementById('admin-view');
  if (!view) return;

  view.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">👑 Dashboard Super User</h1>
      <p class="page-description">Benvenuto, ${user.name}. Ecco lo stato del sistema.</p>
    </div>

    <!-- Stats Grid -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      <div class="stat-card" style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 1rem; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">👥</div>
        <div style="font-size: 2rem; font-weight: bold; color: var(--color-primary-light);" id="statUsers">-</div>
        <div style="color: var(--color-gray-400);">Utenti Registrati</div>
      </div>
      <div class="stat-card" style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 1rem; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🍕</div>
        <div style="font-size: 2rem; font-weight: bold; color: var(--color-accent-light);" id="statPizzas">-</div>
        <div style="color: var(--color-gray-400);">Serate Pizza</div>
      </div>
      <div class="stat-card" style="background: rgba(255, 255, 255, 0.05); padding: 1.5rem; border-radius: 1rem; text-align: center;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">📖</div>
        <div style="font-size: 2rem; font-weight: bold; color: var(--color-success);" id="statRecipes">-</div>
        <div style="color: var(--color-gray-400);">Ricette Totali</div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="content-card">
      <h2 style="margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
        <span>📜</span> Lista Utenti
      </h2>
      
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 2px solid rgba(255, 255, 255, 0.1);">
              <th style="padding: 1rem; color: var(--color-gray-400);">Nome / Business</th>
              <th style="padding: 1rem; color: var(--color-gray-400);">Email</th>
              <th style="padding: 1rem; color: var(--color-gray-400);">Ruolo</th>
              <th style="padding: 1rem; color: var(--color-gray-400);">Data Registrazione</th>
              <th style="padding: 1rem; color: var(--color-gray-400);">Ultimo Login</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr><td colspan="5" style="padding: 2rem; text-align: center;">Caricamento utenti...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Fetch Data
  try {
    const token = getToken();
    const headers = { 'Authorization': `Bearer ${token}` };

    // Fetch Stats
    fetch('/api/admin/stats', { headers })
      .then(res => res.json())
      .then(stats => {
        document.getElementById('statUsers').textContent = stats.users;
        document.getElementById('statPizzas').textContent = stats.pizzaNights;
        document.getElementById('statRecipes').textContent = stats.recipes;
      })
      .catch(err => console.error('Failed to load stats', err));

    // Fetch Users
    fetch('/api/admin/users', { headers })
      .then(async res => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(users => {
        if (!Array.isArray(users)) {
          console.error('Expected array of users, got:', users);
          return;
        }
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = users.map(u => `
          <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
            <td style="padding: 1rem;">
              <div style="font-weight: 600;">${u.name}</div>
              ${u.businessName ? `<div style="font-size: 0.8rem; color: var(--color-gray-500);">${u.businessName}</div>` : ''}
            </td>
            <td style="padding: 1rem;">${u.email}</td>
            <td style="padding: 1rem;">
              <span style="
                padding: 0.25rem 0.5rem; 
                border-radius: 4px; 
                font-size: 0.75rem; 
                background: ${u.role === 'admin' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)'};
                color: ${u.role === 'admin' ? '#fff' : 'var(--color-text)'};
              ">
                ${u.role || 'user'}
              </span>
            </td>
            <td style="padding: 1rem; font-family: monospace; color: var(--color-gray-400);">
              ${new Date(u.createdAt).toLocaleDateString()}
            </td>
            <td style="padding: 1rem; font-family: monospace; color: var(--color-gray-400);">
              ${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}
            </td>
          </tr>
        `).join('');
      })
      .catch(err => console.error('Failed to load users', err));

  } catch (error) {
    console.error('Dashboard error:', error);
  }
}
