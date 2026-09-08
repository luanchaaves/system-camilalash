# 💎 Camila Rodrigues Beauty Studio — Sistema Completo de Gestão

> Sistema web executivo, premium e responsivo desenvolvido sob medida para a gestão operacional, financeira, agendamentos e clientes do **Camila Rodrigues Beauty Studio**.

---

## 📸 Identidade Visual & Design System Premium

O sistema foi concebido com uma estética refinada e moderna no universo *Lash & Beauty de Alto Padrão*:
- **Paleta de Cores**: Dourado Champagne (`#C5A880`, `#A08050`, `#D4AF37`), Tons Quentes de Bege/Pérola e Modo Escuro (*Obsidian & Gold*).
- **Tipografia**: Cormorant Garamond (títulos e valores) combinada com Montserrat (textos de leitura rápida e interfaces densas).
- **Feedback Visual Instantâneo**: Notificações com Sonner Toaster, Modais responsivos e busca global rápida (`Cmd+K` / `Ctrl+K`).

---

## 🚀 Principais Módulos do Sistema

### 1. 📊 Dashboard Executivo (Painel Principal)
- **8 Cards de KPIs em Tempo Real**: Faturamento do Mês Atual, Faturamento do Mês Anterior, Crescimento Percentual, Total de Despesas, Lucro Líquido Realizado, Quantidade de Atendimentos Concluídos, Ticket Médio e Contas a Receber Pendentes.
- **Gráfico Histórico de 6 Meses**: Análise de faturamento x despesas x lucro via Recharts com curvas suaves e gradientes dourados.
- **Gráfico Donut**: Distribuição de faturamento por procedimento (Volume Cristal, Esmeralda, Jade, Rubi, Pérola VIP).
- **Agenda de Hoje & Ações Rápidas**: Próximos atendimentos do dia com botão direto para "Concluir Atendimento" e atalhos com 1 clique para WhatsApp da cliente.
- **Painel de Notificações Ativas**: Alertas automáticos para atendimentos nas próximas 2 horas e contas a vencer/vencidas hoje.

### 2. 📅 Agenda Inteligente & Gestão de Horários
- **Visualizações Múltiplas**: Modos Diário, Semanal e Mensal.
- **Detecção em Tempo Real de Conflitos**: Algoritmo de colisão de intervalos temporais (`conflictDetector.ts`) que alerta visualmente se um novo agendamento se sobrepõe a outro horário existente.
- **Cadastro Rápido de Cliente Integrado**: Permite cadastrar uma nova cliente sem sair do fluxo de agendamento.
- **Sinal e Pagamento Flexível**: Cálculo automático do valor restante (`Valor Total - Sinal`).
- **Automação Financeira**: Ao marcar um agendamento como **Concluído**, o sistema gera automaticamente o lançamento no módulo Financeiro.
- **Cancelamento com Motivo**: Registro do motivo do cancelamento e liberação imediata do horário.

### 3. 👥 Clientes & Histórico Completo (LTV)
- **Listagem com Busca Instantânea**: Filtro por nome, telefone e status (Ativa/Inativa).
- **Métricas Individuais Calculadas**: Total Investido (*Lifetime Value* / LTV), Quantidade de Visitas, Última Visita e Próxima Visita Agendada.
- **Gaveta de Perfil da Cliente**:
  - Dados cadastrais e canal direto para WhatsApp com mensagem pré-formatada.
  - Histórico completo cronológico de atendimentos realizados, valores e observações técnicas.
- **Exportação de Base de Clientes**: Exportação com 1 clique para **CSV** e **PDF** estruturado.

### 4. 👁️ Catálogo de Serviços & Procedimentos
- **Procedimentos Oficiais do Studio**:
  - **Volume Cristal**: Aplicação R$ 120,00 | Manutenção R$ 75,00
  - **Volume Esmeralda**: Aplicação R$ 125,00 | Manutenção R$ 80,00
  - **Volume Jade**: Aplicação R$ 135,00 | Manutenção R$ 85,00
  - **Volume Rubi**: Aplicação R$ 145,00 | Manutenção R$ 90,00
  - **Volume Pérola (VIP)**: Aplicação R$ 150,00 | Manutenção R$ 95,00
  - Categorias de Sobrancelhas, Cursos e Mentorias.
- **CRUD Completo**: Adicione, edite preços, durações em minutos de aplicação e manutenção e pause serviços no catálogo com 1 clique.

### 5. 💰 Gestão Financeira, DRE & Fluxo de Caixa
- **Aritmética de Alta Precisão (`financialMath.ts`)**: Todos os cálculos são processados internamente em centavos inteiros (`toCents` / `fromCents`) para eliminar imprecisões de arredondamento (*IEEE 754 float bugs*).
- **Sub-abas Especializadas**:
  - **Visão Geral**: Balanço consolidado de faturamento, saídas, lucro e contas a receber.
  - **Entradas / Receitas**: Histórico filtrável por categoria (*service, deposit, product, course*) e forma de pagamento.
  - **Saídas / Despesas**: Controle de custos fixos (*aluguel, água, energia, internet*) e custos variáveis (*fios nagaraku, colas, materiais descartáveis, anúncios*), com suporte a despesas recorrentes mensais.
  - **Contas a Receber**: Valores pendentes com botão "Confirmar Recebimento" que converte a pendência em receita realizada.

### 6. 📈 Relatórios Executivos & DRE
- Filtros por período: Mês Atual, Mês Anterior e Todo o Histórico.
- Resumo com Faturamento Bruto, Despesas Totais, Lucro Líquido Realizado, Margem Operacional % e Ticket Médio.
- Ranking de Procedimentos mais lucrativos e Clientes VIP com maior volume de investimento.
- Métricas de Ocupação da Agenda (Taxa de comparecimento x taxa de cancelamentos).
- **Geração de PDF Oficial**: Relatório formatado com cabeçalho do Studio, tabelas zebradas e resumo financeiro.

### 7. ⚙️ Configurações, Google Calendar & Auditoria
- **Perfil do Studio**: Nome, Endereço (*Rua Cristiano Angeli, 1514 A — Bairro Assunção, São Bernardo do Campo - SP*), WhatsApp comercial, Instagram (*@lashcamilarodrigues*) e mensagem padrão de lembrete.
- **Grade Semanal de Horários**: Definição de horários de abertura e fechamento por dia da semana e dias de folga.
- **Sincronização Google Calendar**: Conexão e sincronização direta de agendamentos.
- **Trilha de Auditoria & Logs**: Histórico seguro de eventos (*CREATE, UPDATE, DELETE, CANCEL*) com operador, data/hora e detalhes de mudanças.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Bundler & Dev Server** | [Vite 5](https://vitejs.dev/) |
| **Estilização** | [Tailwind CSS 3](https://tailwindcss.com/) com fontes customizadas |
| **Roteamento** | [React Router DOM 6](https://reactrouter.com/) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Gráficos** | [Recharts](https://recharts.org/) |
| **Exportação PDF & CSV** | [jsPDF](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Datas & Tempo** | [date-fns](https://date-fns.org/) com locale pt-BR |
| **Banco de Dados (Opcional)** | [Supabase (PostgreSQL 15)](https://supabase.com/) com RLS e triggers |
| **Storage Local Reativo** | Adapter local automático para execução *out-of-the-box* |
| **Testes Automatizados** | [Vitest](https://vitest.dev/) |

---

## 💻 Instruções de Instalação e Execução

### 1. Clonar o Repositório
```bash
git clone https://github.com/luanchaaves/system-camilalash.git
cd system-camilalash
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Rodar Testes Automatizados
```bash
npm test
```

### 4. Iniciar em Modo de Desenvolvimento
```bash
npm run dev
```
O sistema estará rodando em `http://localhost:5173`.

### 5. Compilar para Produção
```bash
npm run build
```

---

## 🗄️ Configuração do Supabase (Opcional)

O sistema funciona **imediatamente com dados realistas pré-carregados no navegador**. Para conectar ao banco de dados PostgreSQL na nuvem via Supabase:

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Execute o script de migração contido em `supabase/migrations/20260908_initial_schema.sql` no **SQL Editor** do Supabase.
3. Execute o script de sementes contido em `supabase/seed.sql` para carregar a tabela de serviços e configurações do Studio.
4. Crie um arquivo `.env` na raiz do projeto com suas credenciais:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon-key-publica
   ```

---

## 🔒 Credenciais de Acesso de Demonstração

- **E-mail**: `camila@camilarodriguesbeauty.com.br` (ou qualquer e-mail)
- **Senha**: `123456`

---

## 📄 Licença e Créditos

Desenvolvido para **Camila Rodrigues Beauty Studio** — São Bernardo do Campo - SP.  
Todos os direitos reservados.
