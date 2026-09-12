// ========================================================================
// SISTEMA DE GESTÃO — CAMILA RODRIGUES BEAUTY STUDIO
// Backend Server & Persistent Database Engine: server/index.js
// ========================================================================

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const DIST_DIR = path.join(process.cwd(), 'dist');

// Garante que o diretório de dados persistentes exista no disco do host
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Dados iniciais padrão (apenas serviços e configurações oficiais)
const defaultInitialData = {
  profile: {
    id: 'usr_camila_01',
    email: 'contato@camilarodriguesbeauty.com.br',
    full_name: 'Camila Rodrigues',
    role: 'admin',
    avatar_url: '',
    created_at: '2026-01-01T00:00:00.000Z',
  },
  settings: {
    id: 'stg_01',
    user_id: 'usr_camila_01',
    studio_name: 'Camila Rodrigues Beauty Studio',
    address: 'Rua Cristiano Angeli, 1514 A — Bairro Assunção, São Bernardo do Campo - SP',
    phone: '(11) 94107-0247',
    whatsapp: '11941070247',
    email: 'contato@camilarodriguesbeauty.com.br',
    instagram: '@lashcamilarodrigues',
    website: 'https://camilarodriguesbeauty.netlify.app/',
    business_hours: {
      mon: { isOpen: true, open: '09:00', close: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      tue: { isOpen: true, open: '09:00', close: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      wed: { isOpen: true, open: '09:00', close: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      thu: { isOpen: true, open: '09:00', close: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      fri: { isOpen: true, open: '09:00', close: '19:00', lunchStart: '12:00', lunchEnd: '13:00' },
      sat: { isOpen: true, open: '09:00', close: '17:00', lunchStart: '12:00', lunchEnd: '13:00' },
      sun: { isOpen: false, open: '09:00', close: '18:00' },
    },
    cancellation_policy: 'Cancelamentos e reagendamentos devem ser solicitados com pelo menos 24h de antecedência.',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
  categories: [
    { id: 'cat_lash', name: 'Extensão de Cílios', description: 'Técnicas exclusivas de visagismo', is_active: true },
    { id: 'cat_brows', name: 'Sobrancelhas & Visagismo', description: 'Design personalizado e Brow Lamination', is_active: true },
    { id: 'cat_course', name: 'Cursos & Mentorias', description: 'Capacitação profissional VIP', is_active: true },
  ],
  services: [
    {
      id: 'srv_cristal',
      category_id: 'cat_lash',
      name: 'Volume Cristal',
      description: 'Efeito clássico, sutil e elegante.',
      price: 120.0,
      duration_minutes: 120,
      maintenance_price: 75.0,
      maintenance_duration_minutes: 90,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_esmeralda',
      category_id: 'cat_lash',
      name: 'Volume Esmeralda',
      description: 'Volume leve e refinado para o dia a dia.',
      price: 125.0,
      duration_minutes: 120,
      maintenance_price: 80.0,
      maintenance_duration_minutes: 90,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_jade',
      category_id: 'cat_lash',
      name: 'Volume Jade',
      description: 'Volume intermediário com preenchimento harmonioso.',
      price: 135.0,
      duration_minutes: 130,
      maintenance_price: 85.0,
      maintenance_duration_minutes: 90,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_rubi',
      category_id: 'cat_lash',
      name: 'Volume Rubi',
      description: 'Volume marcante e denso com fios ultrafinos.',
      price: 145.0,
      duration_minutes: 140,
      maintenance_price: 90.0,
      maintenance_duration_minutes: 100,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
    {
      id: 'srv_perola_vip',
      category_id: 'cat_lash',
      name: 'Volume Pérola VIP',
      description: 'Design de alta densidade e glamour supremo.',
      price: 150.0,
      duration_minutes: 150,
      maintenance_price: 95.0,
      maintenance_duration_minutes: 100,
      is_active: true,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    },
  ],
  paymentMethods: [
    { id: 'pm_pix', name: 'Pix', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'pm_credito', name: 'Cartão de Crédito', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'pm_debito', name: 'Cartão de Débito', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'pm_dinheiro', name: 'Dinheiro em Espécie', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
  ],
  expenseCategories: [
    { id: 'ec_rent', name: 'Aluguel do Espaço', cost_type: 'fixed', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'ec_utilities', name: 'Água, Luz e Internet', cost_type: 'fixed', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'ec_lashes_stock', name: 'Fios e Cola de Extensão', cost_type: 'variable', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'ec_disposables', name: 'Descartáveis e Higienização', cost_type: 'variable', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
    { id: 'ec_marketing', name: 'Marketing & Tráfego Pago', cost_type: 'variable', is_active: true, created_at: '2026-01-01T00:00:00.000Z' },
  ],
  clients: [],
  appointments: [],
  entries: [],
  expenses: [],
  notifications: [],
  auditLogs: [],
  googleCalendar: {
    id: 'gcal_01',
    user_id: 'usr_camila_01',
    is_connected: true,
    google_account_email: 'contato@camilarodriguesbeauty.com.br',
    last_sync_at: new Date().toISOString(),
    sync_status: 'success',
    sync_message: 'Sincronizado automaticamente.',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  },
};

// Funções de leitura e escrita atômica segura no disco
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return { ...defaultInitialData, ...parsed };
    }
  } catch (err) {
    console.error('[DATABASE] Erro ao ler database.json, inicializando padrão:', err);
  }

  writeDatabase(defaultInitialData);
  return defaultInitialData;
}

function writeDatabase(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('[DATABASE] Erro ao persistir dados no disco:', err);
  }
}

// Memória do banco
let db = readDatabase();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Middleware de log simples
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// --- ROTAS DA API ---

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Camila Rodrigues Beauty Studio',
    database_file: DB_FILE,
    timestamp: new Date().toISOString(),
  });
});

// Obter todo o banco de dados
app.get('/api/db', (req, res) => {
  db = readDatabase();
  res.json(db);
});

// Sincronizar / salvar dados no banco persistente
app.post('/api/db/sync', (req, res) => {
  const updates = req.body;
  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Formato inválido de dados' });
  }

  db = {
    ...db,
    ...updates,
  };

  writeDatabase(db);
  res.json({ success: true, message: 'Dados persistidos com sucesso no disco do Proxmox.' });
});

// Clientes CRUD
app.get('/api/clients', (req, res) => {
  db = readDatabase();
  res.json(db.clients || []);
});

app.post('/api/clients', (req, res) => {
  const client = req.body;
  db.clients = [client, ...(db.clients || [])];
  writeDatabase(db);
  res.status(201).json(client);
});

app.put('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  db.clients = (db.clients || []).map(c => (c.id === id ? { ...c, ...updates } : c));
  writeDatabase(db);
  res.json({ success: true });
});

app.delete('/api/clients/:id', (req, res) => {
  const { id } = req.params;
  db.clients = (db.clients || []).filter(c => c.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// Agendamentos CRUD
app.get('/api/appointments', (req, res) => {
  db = readDatabase();
  res.json(db.appointments || []);
});

app.post('/api/appointments', (req, res) => {
  const appItem = req.body;
  db.appointments = [appItem, ...(db.appointments || [])];
  writeDatabase(db);
  res.status(201).json(appItem);
});

app.put('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  db.appointments = (db.appointments || []).map(a => (a.id === id ? { ...a, ...updates } : a));
  writeDatabase(db);
  res.json({ success: true });
});

app.delete('/api/appointments/:id', (req, res) => {
  const { id } = req.params;
  db.appointments = (db.appointments || []).filter(a => a.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// Entradas Financeiras CRUD
app.get('/api/financial-entries', (req, res) => {
  db = readDatabase();
  res.json(db.entries || []);
});

app.post('/api/financial-entries', (req, res) => {
  const entry = req.body;
  db.entries = [entry, ...(db.entries || [])];
  writeDatabase(db);
  res.status(201).json(entry);
});

app.put('/api/financial-entries/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  db.entries = (db.entries || []).map(e => (e.id === id ? { ...e, ...updates } : e));
  writeDatabase(db);
  res.json({ success: true });
});

app.delete('/api/financial-entries/:id', (req, res) => {
  const { id } = req.params;
  db.entries = (db.entries || []).filter(e => e.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// Despesas Financeiras CRUD
app.get('/api/financial-expenses', (req, res) => {
  db = readDatabase();
  res.json(db.expenses || []);
});

app.post('/api/financial-expenses', (req, res) => {
  const expense = req.body;
  db.expenses = [expense, ...(db.expenses || [])];
  writeDatabase(db);
  res.status(201).json(expense);
});

app.put('/api/financial-expenses/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  db.expenses = (db.expenses || []).map(e => (e.id === id ? { ...e, ...updates } : e));
  writeDatabase(db);
  res.json({ success: true });
});

app.delete('/api/financial-expenses/:id', (req, res) => {
  const { id } = req.params;
  db.expenses = (db.expenses || []).filter(e => e.id !== id);
  writeDatabase(db);
  res.json({ success: true });
});

// Servir frontend estático compilado (SPA)
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint não encontrado' });
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================================================`);
  console.log(` ✨ Camila Rodrigues Beauty Studio — Servidor Ativo`);
  console.log(` 🚀 Porta: ${PORT}`);
  console.log(` 💾 Banco Persistente: ${DB_FILE}`);
  console.log(`========================================================================`);
});
