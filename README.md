# Project Management System (PMS)

Aplicativo web completo para gerenciamento de projetos, tarefas e equipes, com interface moderna, responsiva e recursos avançados de colaboração, produtividade e exportação de dados.

## Objetivo
Facilitar a organização, acompanhamento e colaboração em projetos, permitindo que equipes criem, arquivem, monitorem e exportem projetos e tarefas, com notificações, permissões, relatórios e acessibilidade.

## Tecnologias Utilizadas
- Next.js (App Router)
- React.js
- TypeScript
- Tailwind CSS
- Firebase Authentication
- Firestore
- Jest e Testing Library (testes automatizados)
- Framer Motion (animações)
- React DnD (drag-and-drop)
- Chart.js (gráficos)

## Funcionalidades Principais
- Autenticação segura de usuários (Firebase)
- Dashboard com visão geral, estatísticas e gráficos
- Criação, edição, arquivamento e remoção de projetos
- Kanban de tarefas com drag-and-drop
- Permissões: apenas admin/owner podem arquivar/remover/alterar estado
- Colaboração: comentários, feedback, atribuição de membros
- Notificações visuais e automáticas (Cloud Functions, e-mail/push)
- Pomodoro Timer integrado
- Exportação de projetos para CSV/PDF
- Relatórios de produtividade
- Área de arquivação e desarquivação de projetos
- Responsividade e acessibilidade (labels, ARIA, navegação por teclado)
- Testes automatizados (unitários e integração)

## Como Configurar e Rodar
1. Clone o repositório

```bash
git clone <url-do-repo>
cd project-manager-app
```

2. Instale as dependências

```bash
npm install
```

3. Configure o Firebase
- Crie um projeto no Firebase Console
- Ative Authentication (Email/Password)
- Crie o Firestore Database
- Adicione as variáveis no arquivo `.env.local`

4. Inicie o servidor

```bash
npm run dev
```
Acesse http://localhost:3000

## Como Executar os Testes

```bash
npm run test
```

## DER (Modelo de Dados Firestore)
### Coleção: projects
| Campo        | Tipo                  | Descrição                           |
|--------------|-----------------------|-------------------------------------|
| id           | string (docId)        | Identificador único do projeto      |
| title        | string                | Título do projeto                   |
| description  | string                | Descrição detalhada                 |
| status       | "TO_DO", "IN_PROGRESS", "DONE" | Estado do projeto |
| priority     | "low", "medium", "high" | Prioridade do projeto |
| createdAt    | Timestamp             | Data de criação                     |
| startDate    | Timestamp             | Data de início                      |
| endDate      | Timestamp             | Data de término                     |
| owner        | string (uid)          | Usuário criador                     |
| members      | string[] (emails)     | Membros do projeto                  |
| archived     | boolean               | Indica se está arquivado            |

#### Subcoleção: tasks (dentro de cada projeto)
| Campo        | Tipo                  | Descrição                           |
|--------------|-----------------------|-------------------------------------|
| id           | string (docId)        | Identificador único da tarefa       |
| title        | string                | Título da tarefa                    |
| description  | string                | Descrição                           |
| status       | "pending", "completed" , "overdue" | Estado da tarefa |
| priority     | "low", "medium" , "high" | Prioridade da tarefa |
| dueDate      | Timestamp             | Prazo final                         |
| completedAt  | Timestamp             | Data de conclusão                   |
| assignedTo   | string[] (emails)     | Membros responsáveis                |
| createdAt    | Timestamp             | Data de criação                     |

#### Subcoleção: comments (dentro de cada tarefa)
| Campo        | Tipo                  | Descrição                           |
|--------------|-----------------------|-------------------------------------|
| id           | string (docId)        | Identificador único do comentário   |
| text         | string                | Texto do comentário                 |
| author       | string                | Nome ou email do autor              |
| authorEmail  | string                | Email do autor                      |
| createdAt    | Timestamp             | Data de criação                     |
| feedback     | objeto opcional       | Feedback sobre tarefa (dificuldade, melhorias) |

### Coleção: users
| Campo        | Tipo                  | Descrição                           |
|--------------|-----------------------|-------------------------------------|
| id           | string (docId)        | Identificador único do usuário      |
| email        | string                | Email do usuário                    |
| displayName  | string                | Nome do usuário                     |
| createdAt    | Timestamp             | Data de criação                     |

### Coleção: notifications
| Campo           | Tipo                  | Descrição                           |
|-----------------|----------------------|-------------------------------------|
| id              | string (docId)        | Identificador único da notificação  |
| projectId       | string                | Projeto relacionado                 |
| taskId          | string (opcional)     | Tarefa relacionada                  |
| recipientEmail  | string                | Email do destinatário               |
| message         | string                | Mensagem                            |
| read            | boolean               | Lida ou não                         |
| type            | string                | Tipo ("comment", "deadline", etc)  |
| createdAt       | Timestamp             | Data de criação                     |

## Permissões e Segurança
- Apenas admin/owner podem arquivar, remover ou alterar estado de projetos/tarefas.
- Regras de segurança do Firestore devem garantir acesso restrito conforme papel do usuário.

## Acessibilidade e Responsividade
- Labels, ARIA, navegação por teclado, contraste e responsividade mobile.

## Exportação de Dados
- Botão para exportar projetos para CSV/PDF na dashboard.

## Relatórios e Produtividade
- Modal de relatório acessível na dashboard, com indicadores e gráficos.

## Testes Automatizados
- Cobertura de renderização, ações e flows críticos (Jest, Testing Library).

## Contribuição
Pull requests são bem-vindos! Siga o padrão de componentes, testes e documentação.

## Autor
Desenvolvido por Josemar Ndungue ([github.com/jndungue089](https://github.com/jndungue089))

## Implementações Futuras
- Notificações automáticas (Cloud Functions, e-mail/push)
- Paginação e filtros avançados
- Monitoramento de tempo e produtividade
- Integração com Google Calendar, Slack, etc
- Dashboard personalizável
- Templates de projetos/tarefas
- Internacionalização (i18n)
- Upload de arquivos em tarefas
- Melhorias de acessibilidade

## Branch mais atualizada
A branch mais atualizada, com as novas implementações é a branch **addOns**.
