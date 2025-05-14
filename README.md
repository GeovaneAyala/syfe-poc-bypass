# syfe-poc-bypass

> Proof-of-Concept para exploração remota na plataforma [Syfe](https://www.syfe.com), com foco em redirecionamento controlado via OneLink (AppsFlyer), coleta furtiva de dados e possível bypass de CSP.

---

## 🧪 Objetivo

Demonstrar como o endpoint `syfe.onelink.me` pode ser utilizado como vetor de redirecionamento e execução remota de scripts, incluindo exfiltração de dados sensíveis do navegador em contexto de usuário.

---

## 📌 Ponto de Entrada

Utilizando o `deep_link_value` do OneLink:
