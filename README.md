# Barbearia Rio Preto — Site de Serviços & Agendamento

Site profissional e moderno para barbearia especializada em corte de cabelo e barba em **São José do Rio Preto - SP**.

Desenvolvido com **HTML5, CSS3, JavaScript e Java puro** (sem frameworks, bibliotecas externas ou dependências adicionais).

---

## 💈 Características do Projeto

1. **Stack Pura & Alta Performance**:
   - `index.html`: Estrutura semântica, responsiva e acessível.
   - `style.css`: Estilização moderna com paleta sofisticada inspirada no logotipo (tons de preto obsidiana, ouro vintage e âmbar).
   - `arquivo.js`: Script puro para controle dinâmico da galeria, calendário com horários, bloqueio automático de vagas, área administrativa do proprietário e integração com WhatsApp.
   - `arquivo.java`: Utilitário puro em Java (servidor HTTP embutido) sem frameworks externos.

2. **Sistema de Calendário com Horários & Bloqueio Automático**:
   - Calendário mensal interativo com navegação entre meses e identificação de dias úteis e domingos (fechado).
   - Grade de horários em tempo real (`09:00`, `10:00`, `11:00`, `13:00`, `14:00`, etc.).
   - Formulário do cliente com campos para **Nome**, **Telefone/WhatsApp** e **Serviço**.
   - **Regra de Bloqueio Automático:** Assim que o proprietário aceita a solicitação na Área Administrativa, o horário fica **automaticamente bloqueado** (com cadeado 🔒 e tag `(Ocupado)`), impedindo que qualquer outro cliente o selecione.

3. **Área Administrativa do Proprietário**:
   - Acesso via botão **"Área Admin 🔐"** no cabeçalho ou no rodapé.
   - **Login de Administrador:**
     - **Usuário Padrão:** `admin`
     - **Senha Padrão:** `admin123` *(também aceita `barbearia123` ou `rio preto2026`)*
   - **Painel de Controle:**
     - Contadores em tempo real: *Pendentes de Aprovação*, *Aprovados (Horários Bloqueados)* e *Total*.
     - **Botão "✓ Aceitar (Bloquear Horário)":** Confirma o agendamento e bloqueia a vaga no calendário do site na mesma hora.
     - **Botão "✕ Recusar / Liberar":** Desfaz a reserva e libera o horário de volta.
     - **Botão "💬 Enviar Confirmação no WhatsApp":** Abre o WhatsApp do cliente com mensagem de confirmação pré-montada.
     - **Ferramenta de Bloqueio Manual:** Permite ao barbeiro bloquear datas e horários para almoço, folgas ou compromissos pessoais.

4. **Identidade Visual & Logotipo (`/MIDEA`)**:
   - Logotipo exclusivo nos formatos `LOGO.svg` (vetorial) e `LOGO.png`.
   - Paleta de cores integrada com acabamento premium para barbearias tradicionais e contemporâneas.

5. **Galeria Dinâmica & Sincronização**:
   - Subpastas:
     - `MIDEA/fotografia/`: Fotos de cortes de cabelo, degradê, barba e ambiente.
     - `MIDEA/videos/`: Vídeos dos trabalhos e do espaço.
   - Integração com `atualizar_galeria.bat` e `atualizar_galeria.py`:
     - Basta adicionar fotos ou vídeos e dar **dois cliques em `atualizar_galeria.bat`** para atualizar o site automaticamente.

6. **Solicitação de Orçamento & Agendamento via WhatsApp**:
   - Formulário com os 3 serviços principais (Corte Degradê/Fade, Barboterapia com Toalha Quente e Combo Imperial).
   - Cálculo instantâneo do subtotal e geração de link WhatsApp para o DDD 17 de São José do Rio Preto.

---

## 🚀 Como Utilizar

### 1. Abrir o site no navegador:
Dê um duplo clique no arquivo [`index.html`](file:///C:/Users/Ygor/Desktop/projeto%20barbearia/index.html) para abrir diretamente no Chrome, Edge ou qualquer navegador.

### 2. Acessar a Área Administrativa:
1. Clique no botão **"Área Admin 🔐"** no topo da página (ou no link do rodapé).
2. Digite o usuário `admin` e a senha `admin123`.
3. No painel, visualize os agendamentos pendentes e clique em **"✓ Aceitar"** para bloquear o horário no site.

### 3. Adicionar novas fotos ou vídeos:
1. Copie suas fotos para a pasta `MIDEA/fotografia/`
2. Copie seus vídeos para a pasta `MIDEA/videos/`
3. Execute o arquivo [`atualizar_galeria.bat`](file:///C:/Users/Ygor/Desktop/projeto%20barbearia/atualizar_galeria.bat)
4. Recarregue a página (`F5`).

---

## 📍 Contatos da Barbearia
- **WhatsApp:** (17) 99100-7524
- **E-mail:** contato@barbeariariopreto.com.br
- **Endereço:** Rua Cel. Spínola de Castro, 3450 - Redentora / Centro, São José do Rio Preto - SP
