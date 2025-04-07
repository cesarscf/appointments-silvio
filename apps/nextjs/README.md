# Checklist de Ajustes no Sistema

## Interface do Usuário (UI)

- [x] **Renomear "Slug" para "Link"**

- [x] **Adicionar aba "Dados Pessoais" após "Indisponibilidades"**

  - Verificar se pode deixa no geral mesmo.

- [x] **Substituir números por dias da semana**

- [x] **Adicionar botão "Retornar ao Menu" em todas as telas**

- [ ] **Melhorar campo de data de nascimento**

  - Permitir digitação manual.

- [ ] **Adicionar três barras (menu hambúrguer) no canto superior esquerdo**

  - Implementar ícone e menu lateral.

- [ ] **Botão "Deletar Funcionário"**
  - Adicionar na tela de detalhes do funcionário (com confirmação).

---

## Funcionalidades

- [ ] **Validação de slug/link**

  - Garantir que o campo está sendo salvo corretamente (backend).

- [ ] **Confirmação ao excluir serviço**

  - Implementar modal com: _"Excluir este serviço removerá todos os dados relacionados. Confirmar?"_.

- [ ] **Formatação do valor do serviço**

  - Permitir entrada com decimais (ex: R$ 50,00).
  - Validar formato de moeda e exibir alerta em PT-BR se inválido.

- [ ] **Gerenciamento de horários**

  - Corrigir bug onde agendar 14:00 para "barba" bloqueia múltiplos horários.
  - Implementar "Replicar horário" para dias da semana (ex: copiar horário de segunda para terça).

- [ ] **Campo CPF no cadastro de cliente**

  - Remover obrigatoriedade OU adicionar asterisco (\*) se for obrigatório.

- [ ] **Opções de cancelamento e pagamento na agenda**

  - Adicionar motivo de cancelamento (ex: "cliente não compareceu").
  - Incluir dropdown com formas de pagamento: Dinheiro, PIX, Cartão (crédito/débito), Boleto.

- [ ] **Pacotes**
  - Implementar módulo de pacotes (pendente conforme descrição).

---

## Correções e Ajustes Técnicos

- [ ] **Salvamento do horário de funcionamento**

  - Verificar conexão frontend/backend (ex: campos não mapeados).

- [ ] **Comissão dos serviços vinculados a funcionários**

  - Opção 1: Remover seleção de serviços no cadastro do funcionário.
  - Opção 2: Adicionar campo "comissão" durante a vinculação de serviços.

- [ ] **Data na agenda**
  - Garantir que o calendário sempre mostre a data atual, mas permita navegação.

---

## Fluxo de Navegação

- [ ] **Botão de retorno na tela de detalhes do funcionário**

  - Adicionar botão "Voltar" ou link para a lista de funcionários.

- [ ] **Padronizar botões de retorno**
  - "Retornar ao Menu" deve ter o mesmo comportamento em todas as telas.
