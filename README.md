# **Requisitos Obrigatórios do CRUD**

## **Funcionalidades**
- CRUD completo:
  - Cadastrar  
  - Listar  
  - Editar  
  - Excluir  
- Pesquisa por nome  
- Atualização automática da tabela  
- Mensagens de sucesso/erro  
- Confirmação antes de excluir  

## **Back-end (Flask + MySQL)**
- Integração Flask + MySQL  
- Rotas REST:
    - GET /api/produtos  
    - POST /api/produtos  
    - DELETE /api/produtos/<id>  
    - PUT ou POST para editar  
- Edição deve alterar: nome, preço, categoria  

## **Front-end (HTML/CSS/JS)**
- Comunicação com API via fetch  
- Botão **Editar** na tabela  
- Formulário de edição funcional  
- Campo **Buscar produto**  
- Manipulação de DOM para atualizar a tabela automaticamente  

## **Organização**
- Estrutura de pastas:
```
  backend/app.py
  backend/db_config.py
  backend/schema.sql
  templates/
  static/
```

- README/LEIA-ME com instruções  
- Prints: listagem, edição, pesquisa  

## **Apresentação**
- Demonstração do sistema funcionando  
- Mostrar integração front-end ↔ back-end  
- Explicar decisões de implementação  

---

# **Requisitos Opcionais**
- Filtro por categoria  
- Ordenação por preço  
- Campo “disponível” (sim/não) com filtro  
