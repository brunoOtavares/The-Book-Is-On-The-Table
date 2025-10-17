# Configuração do Firebase para BibliRead

Este documento contém instruções detalhadas para configurar o Firebase Firestore para salvar os dados dos livros da sua aplicação BibliRead.

## 1. Configurar Projeto Firebase

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Crie um novo projeto ou selecione um projeto existente
3. No painel do projeto, vá para "Project Settings" (ícone de engrenagem)
4. Na seção "Your apps", clique em "Web" para adicionar uma aplicação web
5. Copie as credenciais (apiKey, authDomain, projectId, etc.)

## 2. Atualizar Configuração do Firebase

Substitua as credenciais no arquivo `src/firebase/config.js` com as suas credenciais reais:

```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_REAL",
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_ID_DE_PROJETO",
  storageBucket: "SEU_PROJETO.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID_REAL"
};
```

## 3. Configurar Regras de Segurança do Firestore

1. No Console do Firebase, vá para "Firestore Database"
2. Clique em "Regras" (Rules) na aba superior
3. Substitua o conteúdo existente com as regras do arquivo `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para usuários autenticados
    match /users/{userId} {
      // Usuários podem ler e escrever seus próprios dados
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Regras para a coleção de livros do usuário
      match /books/{bookId} {
        // Usuários podem ler, escrever, atualizar e deletar seus próprios livros
        allow read, write, update, delete: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Regras para dados públicos (se necessário no futuro)
    match /public/{documentId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

4. Clique em "Publicar" (Publish)

## 4. Configurar Autenticação

1. No Console do Firebase, vá para "Authentication"
2. Na aba "Método de login", habilite "Email/Senha"
3. Você pode habilitar outros métodos como Google, Facebook, etc., se desejar

## 5. Estrutura de Dados

Os dados serão salvos no Firestore com a seguinte estrutura:

```
users/{userId}/
├── {userId}/ (documento do usuário)
│   ├── username: "nome_do_usuario"
│   ├── email: "usuario@exemplo.com"
│   └── createdAt: "2023-01-01T00:00:00.000Z"
└── books/
    ├── {bookId1}/ (documento do livro)
    │   ├── title: "Título do Livro"
    │   ├── author: "Autor do Livro"
    │   ├── cover: "URL_DA_CAPA"
    │   ├── description: "Descrição do livro"
    │   ├── publisher: "Editora"
    │   ├── publishedDate: "2023-01-01"
    │   ├── pageCount: 300
    │   ├── currentPage: 150
    │   ├── status: "reading" (unread, reading, finished)
    │   ├── tags: ["Ficção", "Aventura"]
    │   ├── isbn: "978-85-111-1111-1"
    │   ├── progress: 50
    │   ├── createdAt: "2023-01-01T00:00:00.000Z"
    │   └── updatedAt: "2023-01-01T00:00:00.000Z"
    └── {bookId2}/
        ...

usernames/{username}/
├── {username}/ (documento para garantir unicidade)
│   ├── uid: "ID_DO_USUARIO"
│   └── createdAt: "2023-01-01T00:00:00.000Z"
```

**Importante**: A coleção `usernames` é usada para garantir que todos os usernames sejam únicos no sistema.

## 6. Solução de Problemas

### Erro de Permissão
Se você receber um erro "Missing or insufficient permissions":
1. Verifique se as regras de segurança foram configuradas corretamente
2. Certifique-se de que o usuário está autenticado
3. Verifique se as credenciais do Firebase estão corretas

### Dados Não São Salvos
1. Verifique o console do navegador para erros
2. Confirme que o usuário está logado
3. Verifique a aba "Network" nas ferramentas de desenvolvedor para ver as requisições ao Firebase

## 7. Testar a Configuração

1. Faça login na aplicação
2. Tente adicionar um novo livro usando o botão flutuante "+"
3. Verifique no Console do Firebase > Firestore Database se os dados aparecem

## 8. Backup dos Dados

Para fazer backup dos dados:
1. No Console do Firebase, vá para "Firestore Database"
2. Clique em "Exportar dados" no menu superior
3. Siga as instruções para exportar seus dados

---

**Importante:** Mantenha suas credenciais do Firebase seguras e nunca as compartilhe publicamente!