# n8n-nodes-soliah-clinic

Community node do n8n para o CRM do **Soliah Clinic**, via API de integração
externa (Personal Access Token).

## Instalação

**Community Nodes** (n8n): instale `n8n-nodes-soliah-clinic`.

Ou manualmente (dev):

```bash
npm install
npm run build
```

e aponte o n8n para a pasta (ex.: link em `~/.n8n/custom` ou `npm link`).

## Credencial

**Soliah Clinic API**:

- **API Token**: gere em *Configurações → Integrações → Tokens de API* (formato `sk_soliah_...`).
- **Base URL**: `https://api.soliahclinic.com` (padrão).

O botão **Test** da credencial bate em `GET /api/integrations/crm/pipelines`.

## Recursos

- **Negociação (Deal)**: Criar, Obter, Obter Vários, Atualizar (inclui mover
  etapa e ganhar/perder), Deletar.
- **Atividade (Activity)**: Criar, Obter Vários, Atualizar, Definir Status.
  *(Vencimento é obrigatório para tipos diferentes de "Nota".)*
- **Tag**: Associar, Desassociar (informe o UUID da tag).

Os dropdowns de **Funil**, **Etapa**, **Responsável**, **Serviço** e **Motivo
da Perda** são carregados dinamicamente da sua organização.

## Notas

- O token carrega os scopes `crm:read` / `crm:write`. Operações de escrita
  exigem `crm:write`.
- Todos os dados são escopados à organização dona do token.
- Na **Atualização** de negociação, o campo *Funil* serve apenas para listar as
  etapas no dropdown — ele não é enviado à API.

## Licença

MIT
