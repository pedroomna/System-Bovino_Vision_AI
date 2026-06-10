# BovinoVision — Sistema de Análise da Condição Corporal de Bovinos

Bem-vindo ao protótipo completo do **BovinoVision**!

Se você baixou este protótipo como arquivo `.zip` e tentou abrir o arquivo `index.html` dando um duplo clique diretamente, a tela apareceu em branco ou com erros. 

Isso ocorre porque o BovinoVision é um sistema moderno de **Visão Computacional e Inteligência Artificial** construído como uma aplicação **Full-Stack (Vite + React + Node.js/Express)**. Aplicativos web modernos utilizam módulos JavaScript que, por razões de segurança do próprio navegador, **não podem ser executados pelo protocolo `file://` (duplo clique)**. Eles precisam de um servidor web local para funcionar.

Abaixo, veja como colocar o protótipo para rodar de forma simples e rápida no seu computador (Desktop e Mobile).

---

## 🚀 Como Executar o Protótipo no Computador (Desktop)

### Passo 1: Instalar o Node.js
Se você ainda não tem, instale o **Node.js** em seu computador.
1. Acesse: [https://nodejs.org](https://nodejs.org)
2. Baixe e instale a versão **LTS** (Recomendada).

### Passo 2: Extrair os Arquivos
1. Cole o arquivo `.zip` em uma pasta de sua escolha.
2. Descompacte/extraia o conteúdo completamente.

### Passo 3: Abrir o Terminal na Pasta do Projeto
* No **Windows**: Entre na pasta extraída, clique na barra de endereço superior, digite `cmd` e pressione `Enter`.
* No **macOS / Linux**: Abra o Terminal e utilize o comando `cd` para navegar até a pasta correspondente (Ex: `cd Downloads/bovinovision`).

### Passo 4: Instalar as Dependências
Execute o comando abaixo para instalar as bibliotecas do sistema (isso será feito apenas uma vez):
```bash
npm install
```

### Passo 5: Iniciar o Sistema
Agora, inicialize o servidor de desenvolvimento e o motor de Inteligência Artificial:
```bash
npm run dev
```

Pronto! O terminal mostrará o link local, geralmente:
👉 `http://localhost:3000`

Basta copiar este link, colar em seu navegador preferido e o sistema estará funcionando perfeitamente!

---

## 📱 Como Testar no Celular (Mobile)

Para acessar o protótipo do seu celular enquanto ele é executado pelo computador:

1. Certifique-se de que o seu **computador** e o seu **celular** estejam conectados na **mesma rede Wi-Fi**.
2. Veja o endereço IP local do seu computador na rede ou repare no endereço que o terminal gera para a rede local (Ex: `http://192.168.1.15:3000`).
3. Digite esse mesmo endereço no navegador do seu smartphone.
4. O layout se adaptará perfeitamente, oferecendo a experiência de um aplicativo mobile de campo completo.

---

## 🛠️ Tecnologias Utilizadas no Protótipo
* **Front-End**: React 19, TypeScript e Tailwind CSS (Design Responsivo e fluido adaptado para campo).
* **Back-End**: Node.js com Express e TSX Server para execução rápida.
* **Transição**: Framer Motion (para fluidez e animações de alta qualidade).
* **Ícones**: Lucide React.
