
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
    <div class="stats-grid admin-stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-value" id="statUsers">-</div>
        <div class="stat-label">Utenti Registrati</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🍕</div>
        <div class="stat-value" id="statPizzas">-</div>
        <div class="stat-label">Serate Pizza</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📖</div>
        <div class="stat-value" id="statRecipes">-</div>
        <div class="stat-label">Ricette Totali</div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="content-card">
      <h2 class="mb-6 flex items-center gap-2">
        <span>📜</span> Lista Utenti
      </h2>
      
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Nome / Business</th>
              <th>Email</th>
              <th>Ruolo</th>
              <th>Data Registrazione</th>
              <th>Ultimo Login</th>
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
          <tr>
            <td>
              <div class="user-name">${u.name}</div>
              ${u.businessName ? `<div class="user-business">${u.businessName}</div>` : ''}
            </td>
            <td>${u.email}</td>
            <td>
              <div class="user-role-container">
                <span class="role-badge ${u.role === 'admin' ? 'admin' : ''}">
                  ${u.role || 'user'}
                </span>
                
                ${u.id !== user.id ? `
                  <button 
                    class="btn btn-ghost btn-sm btn-icon" 
                    onclick="toggleUserRole('${u.id}', '${u.role}')"
                    title="Cambia ruolo"
                  >
                    🔄
                  </button>
                  ${u.role !== 'admin' ? `
                    <button 
                      class="btn btn-ghost btn-sm btn-icon text-error" 
                      onclick="deleteUser('${u.id}', '${u.name}')"
                      title="Elimina utente e dati"
                    >
                      🗑️
                    </button>
                  ` : ''}
                ` : ''}
              </div>
            </td>
            <td class="user-date">
              ${new Date(u.createdAt).toLocaleDateString()}
            </td>
            <td class="user-date">
              ${u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '-'}
            </td>
          </tr>
        `).join('');
      })
      .catch(err => console.error('Failed to load users', err));

    window.toggleUserRole = async (userId, currentRole) => {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const confirmMsg = `Sei sicuro di voler cambiare il ruolo a ${newRole}?`;

      if (!confirm(confirmMsg)) return;

      const token = getToken();
      console.log(`🌐 [ADMIN] Toggling role for ${userId}: ${currentRole} -> ${newRole}`);
      console.log(`📡 URL: /api/admin/users/${userId}/role`);

      try {
        const res = await fetch(`/api/admin/users/${userId}/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role: newRole })
        });

        console.log(`📥 Response status: ${res.status}`);

        if (res.ok) {
          renderAdminDashboard();
        } else {
          const err = await res.json().catch(() => ({}));
          console.error('❌ Role toggle failed:', err);
          const errText = JSON.stringify(err) === '{}' ? 'Errore 403 (Accesso Negato o Sessione Scaduta)' : (err.error || 'Operazione fallita');
          alert(`Errore: ${errText}`);
        }
      } catch (error) {
        console.error('❌ Toggle role network error:', error);
        alert(`Errore di rete: ${error.message}`);
      }
    };

    window.deleteUser = async (userId, userName) => {
      const confirmMsg = `⚠️ ATTENZIONE: Sei sicuro di voler eliminare l'utente "${userName}" e TUTTI i suoi dati (ricette, serate, ospiti, ecc..)?\n\nQuesta azione è IRREVERSIBILE.`;

      if (!confirm(confirmMsg)) return;

      const token = getToken();
      console.log(`🗑️ [ADMIN] Deleting user ${userId} (${userName})`);

      try {
        const res = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          alert(`Utente "${userName}" eliminato con successo.`);
          renderAdminDashboard();
        } else {
          const err = await res.json().catch(() => ({}));
          console.error('❌ User deletion failed:', err);
          alert(`Errore nell'eliminazione: ${err.error || 'Operazione fallita'}`);
        }
      } catch (error) {
        console.error('❌ Delete user network error:', error);
        alert(`Errore di rete: ${error.message}`);
      }
    };

  } catch (error) {
    console.error('Dashboard error:', error);
  }
}
