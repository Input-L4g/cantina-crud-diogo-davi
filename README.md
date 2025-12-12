# PROJETO CRUD COM FLASK, MYSQL E HTML/CSS/JS

## Integrantes
- **Diogo Antunes**: Responsável pelo gerenciamento do projeto e desenvolvimento back-end (Python) e front-end (HTML/CSS/JS).
- **Davi Augusto**: Responsável pelo início do front-end (HTML/CSS) e pela estruturação da página do site.

---

## Como rodar

Antes de tudo, é necessário ter o **Python** instalado para executar a aplicação.
A versão utilizada no desenvolvimento foi **3.13.5**.
Também é necessário o **XAMPP**, pois ele fornece o servidor MySQL usado pela aplicação.

**Download do Python:**
https://www.python.org/downloads/

**Download do XAMPP:**
https://www.apachefriends.org/download.html

---

## Estrutura de pastas

A aplicação segue a seguinte estrutura de diretórios:

```python
RAIZ
 |
 |- backend               # Pasta núcleo da aplicação
 |   |- static            # Arquivos estáticos (CSS/IMG/JS)
 |   |- templates         # Arquivos .html do projeto
 |   |- app.py            # Script que inicia a aplicação Flask
 |   |- db.py             # Funções de integração com MySQL
 |   |- enums.py          # Classes Enum
 |   |- utils.py          # Funções auxiliares
 |   |_ schema.sql        # Script para criar o DB e tabelas
 |
 |- tests                 # Scripts de testes da aplicação
 |   |_ ...
 |
 |- README.md             # Instruções da aplicação
 |_ requirements.txt      # Bibliotecas Python utilizadas
```

---

## Instalação de dependências

Com base na estrutura acima, verifique se todas as bibliotecas necessárias estão instaladas.
No terminal, na pasta raiz do projeto:

```bash
pip install -r requirements.txt
```

---

## Iniciando o servidor MySQL

Abra o XAMPP (**xampp-control.exe**)
Localize **MySQL** e clique em **Start**.
Deixe-o rodando em segundo plano enquanto inicia a aplicação.

---

## Rodando o projeto Flask

No VSCode (ou no terminal), abra o diretório raiz do projeto e navegue até a pasta `/backend`:

```bash
cd ./backend
```

Em seguida, execute:

```bash
python app.py
```

A aplicação irá iniciar e aparecerá no terminal algo como:
```bash
Running on http://127.0.0.1:5000
```
Copie essa URL e cole em seu navegador para acessar o sistema.

---

## Funcionamento breve

### Busca
O sistema possui um campo para buscar produtos pelo nome. A busca considera apenas produtos cujo nome **começa** com o texto informado.

Fluxo interno:
1. Carregar os dados atuais da tabela.
2. Filtrar por nomes que iniciam com o texto digitado.
3. Renderizar a tabela já filtrada.

---

### Edição
Na coluna **AÇÃO**, ao passar o mouse, surgem dois botões: **editar** e **excluir**.
Ao clicar em editar, um menu mostra os dados atuais do produto, permitindo alterar os campos e confirmar em **Editar**.

Fluxo interno:
1. Coletar os novos valores informados.
2. Enviar uma requisição para a API de **UPDATE**.
3. Validar a resposta da API.
4. Atualizar a tabela na interface.

---
