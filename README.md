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

### 3. Rodar em ambiente de desenvolvimento

```bash
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

