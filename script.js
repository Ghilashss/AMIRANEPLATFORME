// Adaptation dynamique du rôle (titre + branding)
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");

  const roleTitle = document.getElementById("login-role-title");
  const brandingText = document.getElementById("branding-text");
  const formTitle = document.getElementById("form-title");

  if (role === "admin") {
    roleTitle.textContent = "Espace Admin";
    brandingText.textContent = "Connexion sécurisée pour les administrateurs.";
    formTitle.textContent = "Connexion Admin";
  } else if (role === "agence") {
    roleTitle.textContent = "Espace Agence";
    brandingText.textContent = "Connexion sécurisée pour les agences.";
    formTitle.textContent = "Connexion Agence";
  } else if (role === "agent") {
    roleTitle.textContent = "Espace Agent du bureau";
    brandingText.textContent = "Connexion sécurisée pour les agents de bureau.";
    formTitle.textContent = "Connexion Agent";
  }
});

// Fonction login
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const params = new URLSearchParams(window.location.search);
  const role = params.get("role");

  if (email === "" || password === "") {
    alert("Veuillez remplir tous les champs !");
    return false;
  }

  // Ici tu pourrais mettre une vraie vérification (API, base de données...)
  // Pour la démo, on accepte tout
  if (role === "admin") {
    window.location.href = "dashboards/admin/admin-dashboard.html";
  } else if (role === "agence") {
    window.location.href = "dashboards/agence/agence-dashboard.html";
  } else if (role === "agent") {
    window.location.href = "dashboards/agent/agent-dashboard.html";
  } else {
    alert("Rôle inconnu !");
  }

  return false;
}
function selectRole(role) {
  // Ici tu peux rediriger vers la page login correspondante
  window.location.href = `login.html?role=${role}`;
}
/* ===== Contenu Dashboard & Wilayas — script à coller à la fin de ton script.js ===== */
(function(){
  // état initial (exemples) — tu peux remplacer ou charger depuis ton backend plus tard
  const state = {
    wilayas: ['Alger','Oran','Constantine','Annaba','Blida'],
    shipments: [
      {id:1,ref:'FDV-1001',receiver:'Sarah B.',wilaya:'Alger',weight:'1.2kg',amount:'1200 DA',status:'En livraison'},
      {id:2,ref:'FDV-1002',receiver:'Ali M.',wilaya:'Oran',weight:'0.6kg',amount:'850 DA',status:'Livré'},
      {id:3,ref:'FDV-1003',receiver:'Nadia K.',wilaya:'Constantine',weight:'2.5kg',amount:'2400 DA',status:'Retour'},
      {id:4,ref:'FDV-1004',receiver:'Yassine D.',wilaya:'Blida',weight:'0.9kg',amount:'650 DA',status:'Pris en charge'}
    ]
  };

  /* ---------- Renderers ---------- */
  function renderKPIs(){
    const inTransit = state.shipments.filter(s => s.status !== 'Livré' && s.status !== 'Retour').length;
    const delivered = state.shipments.filter(s => s.status === 'Livré').length;
    const returns = state.shipments.filter(s => s.status === 'Retour').length;
    const cash = state.shipments.reduce((sum,s)=> {
      const n = parseInt((s.amount||'0').toString().replace(/[^\d]/g,''))||0;
      return sum + n;
    },0);
    const fmt = new Intl.NumberFormat('fr-FR').format;
    const elIn = document.getElementById('kpiInTransit');
    const elDel = document.getElementById('kpiDelivered');
    const elRet = document.getElementById('kpiReturns');
    const elCash = document.getElementById('kpiCash');
    if(elIn) elIn.textContent = inTransit;
    if(elDel) elDel.textContent = delivered;
    if(elRet) elRet.textContent = returns;
    if(elCash) elCash.textContent = fmt(cash) + ' DA';
  }

  function renderRecentShipments(){
    const tbody = document.getElementById('recentShipmentsBody');
    if(!tbody) return;
    tbody.innerHTML = state.shipments.slice().reverse().map(s=>`
      <tr>
        <td>${s.id}</td>
        <td>${s.ref}</td>
        <td>${s.receiver}</td>
        <td>${s.wilaya}</td>
        <td>${s.weight}</td>
        <td>${s.amount||'0 DA'}</td>
        <td><span class="status ${s.status==='Livré'?'delivered':s.status==='Retour'?'return':'pending'}">${s.status}</span></td>
        <td>
          <button class="btn-edit" onclick="editShipment(${s.id})">✏️</button>
          <button class="btn-delete" onclick="deleteShipment(${s.id})">🗑️</button>
          <button class="btn ghost" onclick="viewShipment('${s.ref}')">Voir</button>
        </td>
      </tr>
    `).join('');
  }

  function renderWilayas(){
    const body = document.getElementById('wilayaBody');
    if(!body) return;
    body.innerHTML = state.wilayas.map((w,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${w}</td>
        <td>
          <button class="btn-edit" onclick="openWilayaModal(${i})">✏️</button>
          <button class="btn-delete" onclick="deleteWilaya(${i})">🗑️</button>
        </td>
      </tr>
    `).join('');
  }

  /* ---------- Actions Wilayas ---------- */
  window.addWilaya = function(){
    const input = document.getElementById('wilayaInput');
    if(!input) return;
    const name = input.value.trim();
    if(!name){ alert('Veuillez entrer le nom de la wilaya'); return; }
    state.wilayas.push(name);
    input.value = '';
    renderWilayas();
  };

  window.searchWilaya = function(){
    const q = (document.getElementById('searchInput')||{value:''}).value.toLowerCase();
    document.querySelectorAll('#wilayaBody tr').forEach(tr=>{
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  window.deleteWilaya = function(index){
    if(!confirm('Supprimer cette wilaya ?')) return;
    state.wilayas.splice(index,1);
    renderWilayas();
  };

  // modal edit
  let editingWilayaIndex = null;
  window.openWilayaModal = function(index){
    editingWilayaIndex = index;
    document.getElementById('wilayaEditInput').value = state.wilayas[index];
    document.getElementById('wilayaModal').style.display = 'block';
  };
  window.closeWilayaModal = function(){
    editingWilayaIndex = null;
    document.getElementById('wilayaModal').style.display = 'none';
  };
  window.saveWilayaEdit = function(){
    const v = document.getElementById('wilayaEditInput').value.trim();
    if(!v){ alert('Nom requis'); return; }
    state.wilayas[editingWilayaIndex] = v;
    closeWilayaModal();
    renderWilayas();
  };

  window.exportWilayasCSV = function(){
    const rows = [['index','wilaya'], ...state.wilayas.map((w,i)=>[i+1,w])];
    const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download='wilayas.csv'; a.click(); URL.revokeObjectURL(url);
  };

  /* ---------- Shipments actions ---------- */
  window.editShipment = function(id){
    const s = state.shipments.find(x=>x.id===id);
    if(!s) return;
    const dest = prompt('Modifier destinataire', s.receiver);
    if(dest!==null){ s.receiver = dest; renderRecentShipments(); renderKPIs(); }
  };

  window.deleteShipment = function(id){
    if(!confirm('Supprimer ce colis ?')) return;
    state.shipments = state.shipments.filter(x=>x.id!==id);
    renderRecentShipments(); renderKPIs();
  };

  window.viewShipment = function(ref){
    // simulate "voir" : show alert + detail in console — you can open a modal like in video
    const s = state.shipments.find(x=>x.ref===ref);
    if(!s){ alert('Référence introuvable'); return; }
    alert(`Réf: ${s.ref}\nDestinataire: ${s.receiver}\nWilaya: ${s.wilaya}\nStatut: ${s.status}`);
  };

  /* ---------- Filters for Recent ---------- */
  window.filterRecent = function(){
    const q = (document.getElementById('recentFilter')||{value:''}).value.toLowerCase();
    const status = (document.getElementById('statusFilter')||{value:''}).value;
    document.querySelectorAll('#recentShipmentsBody tr').forEach(tr=>{
      const text = tr.textContent.toLowerCase();
      const matchesQ = q === '' || text.includes(q);
      const matchesStatus = !status || tr.querySelector('.status').textContent.trim() === status;
      tr.style.display = (matchesQ && matchesStatus) ? '' : 'none';
    });
  };

  /* ---------- auto-render when page visible ---------- */
  function onPageShow(id){
    if(id==='dashboard'){ renderKPIs(); renderRecentShipments(); }
    if(id==='wilayas'){ renderWilayas(); }
  }

  // observe class changes on pages (works without modifying your showPage function)
  const pages = document.querySelectorAll('.page');
  const mo = new MutationObserver(muts=>{
    muts.forEach(m=>{
      const el = m.target;
      if(el.classList.contains('active')) onPageShow(el.id);
    });
  });
  pages.forEach(p=>mo.observe(p,{attributes:true,attributeFilter:['class']}));
  // initial render for current visible page
  document.addEventListener('DOMContentLoaded', function(){
    onPageShow(document.querySelector('.page.active')?.id || 'dashboard');
  });

  // initial render immediate (if script placed after DOM)
  onPageShow(document.querySelector('.page.active')?.id || 'dashboard');

})();
function openWilayaModal() {
  document.getElementById("wilayaModal").style.display = "flex";
}

function closeWilayaModal() {
  document.getElementById("wilayaModal").style.display = "none";
}

function saveWilaya() {
  const name = document.getElementById("wilayaName").value.trim();
  const region = document.getElementById("wilayaRegion").value;
  if(!name) return alert("Veuillez entrer un nom");

  const tbody = document.getElementById("wilayaBody");
  const rowCount = tbody.rows.length + 1;

  const row = tbody.insertRow();
  row.innerHTML = `
    <td>${rowCount}</td>
    <td>${name}</td>
    <td>${region}</td>
    <td>0</td>
    <td>
      <button class="btn-edit">✏️</button>
      <button class="btn-delete">🗑️</button>
    </td>
  `;

  closeWilayaModal();
}
