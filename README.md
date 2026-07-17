## Agenda Barber - Setup do Projeto

Aplicação de agendamento online para barbearia, construída com Next.js (App Router) e Airtable como backend de dados. Inclui fluxo de marcação para o cliente, painel admin e notificações via WhatsApp usando a API Uazapi.

### Requisitos

- **Node.js** 18 ou superior
- **npm** (ou yarn/pnpm/bun, mas o projeto usa `package-lock.json`)
- Conta no **Airtable** (para usar dados reais)
- Instância configurada na **Uazapi** (WhatsApp)

### 1. Clonar o repositório e instalar dependências

```bash
git clone <seu-repo>.git
cd agenda-barber
npm install
```

### 2. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto com as chaves abaixo. Exemplo mínimo:

```bash
# Airtable
AIRTABLE_API_TOKEN=seu_token_airtable
AIRTABLE_BASE_ID=appXXXXXXXXXXXX

# Notificações WhatsApp (Uazapi)
UAZAPI_BASE_URL=https://free.uazapi.com
UAZAPI_INSTANCE_TOKEN=seu_token_da_instancia

# Google Calendar (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_OAUTH_REDIRECT_URI=
GOOGLE_CALENDAR_ID=primary

# Next.js / Evolução futura
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Airtable

- `AIRTABLE_API_TOKEN`: token de API gerado no painel do Airtable.
- `AIRTABLE_BASE_ID`: ID da base que contém as tabelas:
  - `Tenants`
  - `Appointments`
  - `Services`
  - `Settings`
  - `DayOffs`

A aplicação já sabe trabalhar com a estrutura dessas tabelas conforme definido em `src/lib/airtable.ts` e nas actions em `src/app/actions`.

#### Uazapi (WhatsApp)

- `UAZAPI_BASE_URL`: URL base da sua API Uazapi (por exemplo, `https://free.uazapi.com` ou `https://seusubdominio.uazapi.com`).
- `UAZAPI_INSTANCE_TOKEN`: token da instância conectada ao WhatsApp.

O cliente HTTP da Uazapi está em `src/lib/uazapi.ts` e é usado por `src/lib/notifications.ts` para:

- Enviar confirmação de agendamento ao cliente.
- Notificar o barbeiro sobre novos agendamentos.
- Avisar o cliente sobre cancelamentos.

Se as variáveis de ambiente da Uazapi não estiverem configuradas, o sistema entra em **modo simulação** e apenas loga as mensagens no servidor (sem disparar no WhatsApp).

#### Google Calendar (integração com a agenda do barbeiro)

A integração adiciona **automaticamente** cada novo agendamento à agenda Google do barbeiro, com um lembrete popup (notificação). É **write-only**: o app só cria eventos, nunca lê a agenda do barbeiro.

Enquanto `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` não estiverem preenchidos, a integração fica em **modo simulação** (apenas loga `[Google] ...` no servidor) e o botão "Conectar" aparece desabilitado. Assim que as chaves forem preenchidas, tudo passa a funcionar sem mudança de código.

Passo a passo no [Google Cloud Console](https://console.cloud.google.com/):

1. Crie (ou selecione) um projeto.
2. Em **APIs e Serviços → Biblioteca**, ative a **Google Calendar API**.
3. Em **Tela de permissão OAuth**, configure o app (tipo Externo) e adicione os escopos `https://www.googleapis.com/auth/calendar.events` e `email` (o `email` serve só para exibir qual conta está conectada no painel). Adicione o e-mail do barbeiro como usuário de teste (ou publique o app).
4. Em **Credenciais → Criar credenciais → ID do cliente OAuth → Aplicativo da Web**:
   - **URIs de redirecionamento autorizados**: adicione `http://localhost:3000/api/google/callback` (dev) e `https://SEU_DOMINIO/api/google/callback` (produção).
5. Copie o **Client ID** e **Client Secret** para o `.env.local` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
6. `GOOGLE_OAUTH_REDIRECT_URI` é **opcional** — se vazio, é derivado do host da requisição (`<host>/api/google/callback`). Preencha apenas se o app estiver atrás de proxy e o host detectado não bater com o registrado no Google.
7. `GOOGLE_CALENDAR_ID` é opcional (padrão `primary`, a agenda principal do barbeiro).

Uso pelo barbeiro: no painel `/admin`, aba **Agenda**, clique em **Conectar** acima da lista. Ele autoriza na conta Google e volta para o painel. Também é possível ajustar quantos **minutos antes** o lembrete dispara (padrão 30).

Detalhes técnicos:

- Camada REST pura (OAuth + `events.insert` via `fetch`): `src/lib/google-calendar.ts`.
- Orquestração por tenant (lê a config e cria o evento): `src/lib/google-sync.ts`, disparado em `createAppointment` (`src/app/actions/appointments.ts`) como fire-and-forget — falhas **não** bloqueiam o agendamento.
- O **refresh token** do barbeiro, os minutos do lembrete e o e-mail da conta conectada ficam no registro do tenant na tabela `Tenants` (base do `AIRTABLE_BASE_ID`), nos campos `GoogleRefreshToken` (texto), `GoogleReminderMinutes` (número) e `GoogleAccountEmail` (texto). Crie esses campos na tabela `Tenants`.
- No painel, o barbeiro vê um selo **"Conectada"** e o e-mail da conta quando a conexão está ativa. Se ele conectou antes desta atualização, basta reconectar uma vez para o e-mail aparecer.

#### Acesso ao painel admin (senha por barbeiro)

O painel `/admin` é protegido por uma **senha por tenant**, guardada no campo `AdminPassword` da tabela `Tenants` (mesma base do `AIRTABLE_BASE_ID`). Crie esse campo (tipo texto) e defina a senha de cada barbeiro no registro dele.

Fluxo de uso:

- Na página inicial (`/`) há um **ícone de cadeado discreto no canto superior direito** que leva ao painel.
- Ao entrar em `/admin`, o barbeiro digita a senha do seu cadastro. Só com a senha correta o painel abre.
- Depois de acertar a senha uma vez, o navegador guarda o desbloqueio no **localStorage** (chave `agenda-barber:admin-unlocked`), então **não é preciso digitar de novo** nas próximas visitas. O botão **"Sair"** (ícone no cabeçalho do painel) limpa esse desbloqueio e volta a pedir a senha.

Observações:

- A senha nunca é enviada ao navegador: uma _server action_ (`src/app/actions/auth.ts`) apenas **compara** o que foi digitado e devolve verdadeiro/falso.
- Como o localStorage é isolado por domínio, cada barbeiro (no seu domínio) tem seu próprio desbloqueio — a senha de um não abre o painel de outro.
- Se o Airtable **não** estiver configurado (ambiente de desenvolvimento/marca padrão), o portão fica **aberto** para não travar o dev. Se o tenant existir mas estiver **sem** `AdminPassword`, o painel mostra "acesso não configurado".
- Este é um **bloqueio de conveniência**, não uma barreira de segurança forte: a rota `/admin` continua acessível pela URL direta (o controle vive no navegador, via localStorage, conforme pedido). Para um bloqueio no servidor seria necessário cookie + middleware.

### 3. Rodar em ambiente de desenvolvimento

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000` para o fluxo de agendamento do cliente e `http://localhost:3000/admin` para o painel administrativo.

### 4. Build de produção

```bash
npm run build
npm start
```

Use essa etapa também para validar se o projeto está compilando corretamente antes de fazer deploy (por exemplo, na Vercel).

### 5. Fluxo de agendamento e notificações

- O cliente escolhe serviço, data e horário na página principal (`/`).
- Ao confirmar os dados, o sistema cria um registro em `Appointments` no Airtable.
- Após a criação:
  - Envia mensagem de confirmação para o WhatsApp do cliente.
  - Envia notificação de “novo agendamento” para o WhatsApp do barbeiro (número configurado em `src/config/brand.ts`).
- Ao cancelar um agendamento no painel admin (`/admin`):
  - Atualiza o status para `CANCELLED` no Airtable.
  - Envia mensagem de cancelamento para o cliente.

### 6. Onde ajustar textos e branding

- Branding (nome da barbearia, slogan, logo, cores, contato): `src/config/brand.ts`
- Mensagens de WhatsApp (template de confirmação, aviso ao barbeiro, cancelamento): `src/lib/notifications.ts`

### 7. Problemas comuns

- **Mensagens não chegam no WhatsApp**:
  - Verifique se `UAZAPI_BASE_URL` e `UAZAPI_INSTANCE_TOKEN` estão corretos.
  - Confirme que a instância da Uazapi está **conectada**.
  - Veja os logs do servidor (mensagens `[Uazapi] ...`).
- **Dados não aparecem / agenda vazia**:
  - Confirme `AIRTABLE_API_TOKEN` e `AIRTABLE_BASE_ID`.
  - Verifique se as tabelas e campos esperados existem na base.
- **Horários de atendimento incorretos ou sempre 09:00–20:00**:
  - A tabela `Settings` precisa ter os campos exatos: `StartTime`, `EndTime`, `LunchStart`, `LunchEnd`, `SlotInterval`.
  - Formato de horário: `HH:MM` (ex.: `09:00`, `20:00`).
  - `SlotInterval`: número em minutos (ex.: `30`).

