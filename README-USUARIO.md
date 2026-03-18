# Guia do Usuario - Agenda Barber

Este guia foi feito para ensinar, de forma simples, como usar o sistema no dia a dia:

- fluxo do **cliente** (agendamento)
- fluxo do **admin/barbeiro** (gerenciar agenda, servicos e configuracoes)

## Acesso rapido

- **Tela de agendamento (cliente):** `http://localhost:3000/`
- **Painel administrativo:** `http://localhost:3000/admin`

> Hoje nao existe tela de login no `/admin`. Qualquer pessoa com o link consegue acessar o painel.

---

## Fluxo do Cliente (Agendamento)

O cliente passa por 4 etapas:

1. **Servico**
2. **Data e hora**
3. **Dados pessoais**
4. **Confirmacao**

### 1) Escolher o servico

Na tela inicial, o cliente ve os servicos ativos com:

- nome
- descricao (quando existir)
- duracao em minutos
- preco

Ele seleciona um servico e clica em **Continuar**.

### 2) Escolher dia e horario

O cliente escolhe a data e depois um horario disponivel.

Regras importantes do sistema:

- **Domingos** ficam bloqueados automaticamente
- dias marcados como **folga/ausencia** no admin ficam indisponiveis
- horarios que batem com outro agendamento confirmado nao aparecem como vagos
- horarios dentro do intervalo de almoco nao ficam disponiveis
- horarios passados (no dia atual) tambem ficam indisponiveis

Depois de escolher dia e horario, clica em **Continuar**.

### 3) Preencher dados

O cliente informa:

- **Nome** (minimo 3 caracteres)
- **WhatsApp** no formato `(11) 99999-9999`

Ao confirmar, o agendamento e salvo.

### 4) Confirmacao final

A tela mostra o resumo completo:

- servico
- data
- horario e duracao
- nome e telefone do cliente

Depois disso, o cliente pode clicar em **Fazer novo agendamento** para reiniciar.

---

## Fluxo do Admin (Barbeiro)

No painel `/admin`, existem 3 abas:

1. **Agenda**
2. **Servicos**
3. **Config**

## 1) Aba Agenda

Aqui voce acompanha os agendamentos futuros organizados por data.

Cada card mostra:

- status (Confirmado, Cancelado, Concluido)
- horario (inicio e fim)
- servico
- nome e telefone do cliente

### Cancelar um agendamento

1. Clique no icone **X** do agendamento confirmado
2. Confirme no modal
3. O sistema muda o status para **CANCELLED**
4. O cliente e notificado via WhatsApp (quando a API estiver configurada)

> Agendamentos cancelados nao aparecem na listagem principal da agenda.

## 2) Aba Servicos

Nesta aba voce gerencia o catalogo de servicos:

- criar novo servico
- editar servico existente
- ativar/desativar com o switch
- remover servico

Campos do servico:

- **Nome** (obrigatorio)
- **Descricao** (opcional)
- **Preco** (maior que zero)
- **Duracao** (entre 5 e 480 minutos)

### Dica pratica

Se um servico nao deve aparecer para clientes por um tempo, prefira **desativar** em vez de excluir.

## 3) Aba Config

Essa aba tem duas partes:

### Horario de funcionamento

Defina:

- horario de abertura
- horario de fechamento
- inicio e fim do almoco
- intervalo entre slots (10 a 120 min)

Essas configuracoes impactam diretamente os horarios exibidos para o cliente.

### Folgas e ausencias

Voce pode:

- adicionar dia de folga/ausencia
- opcionalmente informar motivo
- remover folgas cadastradas

Qualquer dia marcado como folga fica indisponivel no calendario do cliente.

---

## Rotina recomendada (passo a passo)

Use esta sequencia para operar o sistema com seguranca:

1. Abra `/admin`
2. Na aba **Servicos**, confirme se os servicos ativos estao corretos
3. Na aba **Config**, revise horario e folgas da semana
4. Volte para **Agenda** e acompanhe novos agendamentos
5. Se precisar, cancele horarios diretamente por la
6. Teste como cliente em `/` para validar a experiencia

---

## WhatsApp e notificacoes

O sistema tenta enviar mensagens em 3 situacoes:

- confirmacao para cliente apos agendar
- aviso para barbeiro de novo agendamento
- aviso para cliente quando o admin cancela

Se a chave da Evolution API nao estiver configurada, o sistema continua funcionando e apenas simula o envio.

---

## Comportamentos importantes para o usuario final

- Se nao houver conexao com Airtable, o sistema usa dados de demonstracao.
- O agendamento so e concluido quando o cliente clica em **Confirmar Agendamento**.
- O cliente ve somente servicos marcados como ativos no admin.
- O horario final do atendimento e calculado automaticamente pela duracao do servico.

---

## Dicas de suporte rapido

Se um cliente disser "nao aparece horario":

1. confira se o servico esta ativo
2. confira folgas cadastradas
3. confira horario de funcionamento e almoco
4. confira se o dia escolhido nao e domingo
5. confira se os horarios ja foram ocupados por outros agendamentos

Se quiser, posso montar tambem uma versao deste guia em formato de "treinamento da equipe" (com checklist diario e scripts de atendimento).
