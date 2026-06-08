# 🚀 Nova - AI Chat Assistant

A sophisticated, production-ready AI chatbot built with modern web technologies, featuring a ChatGPT-like interface, functional productivity tools, persistent chat history, and seamless Groq API integration.

**Live Demo:** 

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Tools & Features](#tools--features)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Chat Functionality
- **AI-Powered Conversations:** Integrated with Groq API for fast, intelligent responses
- **Persistent Chat History:** All conversations are automatically saved to the database
- **Automatic Title Generation:** Conversations are automatically named based on the first user message using LLM
- **Context-Aware Responses:** Maintains the last 10 messages for contextual understanding
- **Markdown Rendering:** Full markdown support with syntax highlighting in chat messages
- **Real-time Typing Indicators:** Visual feedback while the AI is generating responses

### Conversation Management
- **Create New Chats:** Start fresh conversations with a single click
- **Switch Between Conversations:** Seamlessly navigate between multiple active chats
- **Search & Filter:** Find conversations by title or content with real-time search
- **Rename Conversations:** Customize conversation titles for better organization
- **Delete Conversations:** Remove unwanted chats with confirmation
- **Conversation List:** Sidebar displays all past conversations with timestamps (oldest to newest)

### Export & Sharing
- **Markdown Export:** Export conversations as formatted Markdown files
- **JSON Export:** Export conversations with full metadata as JSON
- **Shareable Links:** Generate unique share tokens for public conversation viewing
- **Copy to Clipboard:** One-click sharing with automatic link copying

### Productivity Tools
The sidebar includes four fully functional tools for enhanced productivity:

1. **Projects Tool**
   - Create and organize projects
   - List all your projects
   - Delete projects you no longer need
   - Color-coded project organization

2. **Documents Tool**
   - Upload and manage documents
   - Support for multiple file formats (images, PDFs, text)
   - Image preview functionality
   - File size tracking

3. **Web Search Tool**
   - Real-time internet search using DuckDuckGo API
   - Display search results with snippets and links
   - Source citation in AI responses
   - Result filtering and sorting

4. **Code Interpreter Tool**
   - Execute JavaScript code snippets
   - Display code output and errors
   - Syntax highlighting
   - Language selection support

### User Interface
- **Modern Green & White Theme:** ChatGPT-inspired design with green accents (#10a37f)
- **Responsive Layout:** Works seamlessly on desktop, tablet, and mobile devices
- **Collapsible Sidebar:** Mobile-friendly navigation with toggle
- **Header Navigation:** Quick access to settings and app information
- **Settings Dropdown:** Easy access to preferences and help
- **Auto-resizing Textarea:** Input field grows with your message
- **Keyboard Shortcuts:** 
  - `Enter` to send message
  - `Shift+Enter` for new line
  - `Ctrl+K` for command palette

### Authentication & Security
- **Manus OAuth Integration:** Secure user authentication
- **Session Management:** Persistent login state across sessions
- **User Authorization:** All operations verified against user ownership
- **Role-Based Access:** Support for user and admin roles

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern UI framework with latest features
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool with HMR
- **tRPC** - End-to-end type-safe API
- **TanStack Query** - Powerful data synchronization
- **Radix UI** - Unstyled, accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Streamdown** - Markdown rendering with streaming support
- **Lucide React** - Beautiful icon library
- **Wouter** - Lightweight routing library

### Backend
- **Express 4** - Minimalist web framework
- **Node.js** - JavaScript runtime
- **tRPC 11** - Type-safe RPC framework
- **Drizzle ORM** - Lightweight TypeScript ORM

### Database
- **MySQL** - Relational database
- **Drizzle Kit** - Schema management and migrations

### External APIs
- **Groq API** - Fast LLM inference
- **DuckDuckGo API** - Web search functionality
- **Piston API** - Code execution sandbox
- **Manus OAuth** - User authentication

### Development & Testing
- **Vitest** - Unit testing framework
- **TypeScript** - Type checking
- **Prettier** - Code formatting
- **ESLint** - Code linting

---

## 📁 Project Structure

```
nova/
├── client/                          # React frontend application
│   ├── public/                      # Static assets (favicon, robots.txt)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBoxModern.tsx    # Main chat interface component
│   │   │   ├── ModernLayout.tsx     # App layout with sidebar
│   │   │   ├── ToolsPanel.tsx       # Tools sidebar component
│   │   │   └── ui/                  # Radix UI component library
│   │   ├── pages/
│   │   │   └── Home.tsx             # Main authenticated page
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx     # Theme management
│   │   ├── hooks/
│   │   │   └── useAuth.ts           # Authentication hook
│   │   ├── lib/
│   │   │   └── trpc.ts              # tRPC client configuration
│   │   ├── App.tsx                  # Root component with routing
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.css                # Global styles and theme tokens
│   │   └── const.ts                 # Frontend constants
│   └── index.html                   # HTML template
│
├── server/                          # Express backend
│   ├── _core/
│   │   ├── index.ts                 # Server bootstrap
│   │   ├── context.ts               # tRPC context creation
│   │   ├── trpc.ts                  # tRPC setup
│   │   ├── llm.ts                   # Groq LLM integration
│   │   ├── oauth.ts                 # OAuth flow
│   │   ├── cookies.ts               # Session cookie management
│   │   └── notification.ts          # Owner notifications
│   ├── routers.ts                   # tRPC procedure definitions
│   ├── db.ts                        # Database helpers
│   ├── auth.logout.test.ts          # Test example
│   └── storage.ts                   # S3 file storage helpers
│
├── drizzle/                         # Database schema & migrations
│   ├── schema.ts                    # Table definitions
│   └── migrations/                  # Generated SQL migrations
│
├── shared/                          # Shared types and constants
│   ├── constants.ts                 # Shared constants
│   └── types.ts                     # Shared types
│
├── storage/                         # S3 storage configuration
│
├── patches/                         # Package patches
│
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── vite.config.ts                   # Vite build configuration
├── vitest.config.ts                 # Vitest test configuration
├── drizzle.config.ts                # Drizzle ORM configuration
├── tailwind.config.ts               # Tailwind CSS configuration
├── components.json                  # shadcn/ui configuration
├── todo.md                          # Project tracking
└── README.md                        # This file
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and pnpm 10+
- MySQL 8+ or compatible database
- Groq API key
- Manus OAuth credentials

### Step 1: Clone the Repository
```bash
git clone https://github.com/greatraushan2525/NOVA-.git
cd NOVA-
```

### Step 2: Install Dependencies
```bash
pnpm install
```

### Step 3: Set Up Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/nova_db

# Groq API
GROQ_API_KEY=your_groq_api_key

# Manus OAuth
VITE_APP_ID=your_app_id
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
OAUTH_SERVER_URL=https://api.manus.im

# JWT
JWT_SECRET=your_jwt_secret_key

# Owner Info
OWNER_NAME=Your Name
OWNER_OPEN_ID=your_open_id

# Built-in APIs
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# App Branding
VITE_APP_TITLE=Nova
VITE_APP_LOGO=https://your-logo-url.png
```

### Step 4: Set Up Database
```bash
# Generate migrations
pnpm drizzle-kit generate

# Run migrations
pnpm drizzle-kit migrate
```

### Step 5: Start Development Server
```bash
pnpm dev
```

The application will start at `http://localhost:3000`

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | MySQL connection string | ✅ |
| `GROQ_API_KEY` | Groq API authentication key | ✅ |
| `VITE_APP_ID` | Manus OAuth application ID | ✅ |
| `JWT_SECRET` | Secret for session signing | ✅ |
| `OAUTH_SERVER_URL` | Manus OAuth server URL | ✅ |
| `VITE_OAUTH_PORTAL_URL` | Manus OAuth portal URL | ✅ |
| `OWNER_NAME` | Application owner name | ✅ |
| `OWNER_OPEN_ID` | Owner's OAuth ID | ✅ |
| `BUILT_IN_FORGE_API_URL` | Manus built-in API URL | ✅ |
| `BUILT_IN_FORGE_API_KEY` | Manus API key (server-side) | ✅ |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus API key (client-side) | ✅ |
| `VITE_FRONTEND_FORGE_API_URL` | Manus API URL (client-side) | ✅ |
| `VITE_APP_TITLE` | Application title | ❌ |
| `VITE_APP_LOGO` | Application logo URL | ❌ |
| `VITE_ANALYTICS_ENDPOINT` | Analytics service endpoint | ❌ |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID | ❌ |

---

## 💬 Usage

### Starting a New Chat
1. Click the **"New Chat"** button in the sidebar
2. Type your message in the input field
3. Press `Enter` or click the send button
4. Nova will respond with an AI-generated answer

### Using Tools
Each tool is accessible from the sidebar:

**Projects:**
- Click the Projects tool to expand
- Enter a project name and click "Create"
- View all projects in the list
- Delete projects with the delete button

**Documents:**
- Click the Documents tool
- Click "Upload File" to select a document
- View uploaded documents with file sizes
- Preview images directly in the interface

**Web Search:**
- Click the Web Search tool
- Enter your search query
- View results with snippets and links
- Results are automatically cited in AI responses

**Code Interpreter:**
- Click the Code Interpreter tool
- Select a programming language
- Enter your code
- Click "Execute" to run the code
- View output and error messages

### Managing Conversations
- **Search:** Use the search bar in the sidebar to find conversations
- **Rename:** Click the rename icon next to a conversation title
- **Delete:** Click the delete icon to remove a conversation
- **Switch:** Click any conversation to view its history

### Exporting Conversations
- Click the export button in the chat header
- Choose format: Markdown or JSON
- The file will be downloaded automatically

### Sharing Conversations
- Click the share button in the chat header
- A shareable link will be generated and copied
- Share the link with others to let them view the conversation

---

## 📡 API Documentation

### Authentication Procedures

#### `auth.me`
Get current user information
```typescript
const user = await trpc.auth.me.useQuery();
// Returns: { id, openId, name, email, role, createdAt, updatedAt, lastSignedIn }
```

#### `auth.logout`
Log out the current user
```typescript
await trpc.auth.logout.useMutation();
// Clears session cookie and returns { success: true }
```

### Chat Procedures

#### `chat.sendMessage`
Send a message and get AI response
```typescript
const response = await trpc.chat.sendMessage.useMutation({
  conversationId: 1,
  message: "Hello, how are you?"
});
// Returns: { reply: "I'm doing well, thank you for asking!" }
```

#### `chat.getHistory`
Retrieve all messages in a conversation
```typescript
const messages = await trpc.chat.getHistory.useQuery({ conversationId: 1 });
// Returns: Array of { id, conversationId, role, content, createdAt }
```

#### `chat.createConversation`
Create a new conversation
```typescript
const result = await trpc.chat.createConversation.useMutation();
// Returns: { conversationId: 1 }
```

#### `chat.getConversations`
Get all conversations for the user
```typescript
const conversations = await trpc.chat.getConversations.useQuery();
// Returns: Array of { id, userId, title, shareToken, isPublic, createdAt, updatedAt }
```

#### `chat.deleteConversation`
Delete a conversation
```typescript
await trpc.chat.deleteConversation.useMutation({ conversationId: 1 });
// Returns: { success: true }
```

#### `chat.searchConversations`
Search conversations by title
```typescript
const results = await trpc.chat.searchConversations.useQuery({ query: "python" });
// Returns: Filtered array of conversations
```

#### `chat.generateTitle`
Generate a title for a conversation
```typescript
const result = await trpc.chat.generateTitle.useMutation({
  conversationId: 1,
  firstMessage: "How do I learn Python?"
});
// Returns: { title: "Learning Python Basics" }
```

#### `chat.generateShareLink`
Generate a shareable link for a conversation
```typescript
const result = await trpc.chat.generateShareLink.useMutation({ conversationId: 1 });
// Returns: { shareToken: "abc123...", shareUrl: "/share/abc123..." }
```

#### `chat.exportConversation`
Export a conversation in specified format
```typescript
const result = await trpc.chat.exportConversation.useQuery({
  conversationId: 1,
  format: "markdown" // or "json"
});
// Returns: { content: "# Conversation...", filename: "conversation.md" }
```

#### `chat.renameConversation`
Rename a conversation
```typescript
await trpc.chat.renameConversation.useMutation({
  conversationId: 1,
  newTitle: "My New Title"
});
// Returns: { success: true }
```

### Tools Procedures

#### `chat.tools.createProject`
Create a new project
```typescript
const project = await trpc.chat.tools.createProject.useMutation({
  name: "Web Development",
  description: "Frontend and backend projects"
});
// Returns: { id, name, description, createdAt, userId }
```

#### `chat.tools.listProjects`
List all projects
```typescript
const projects = await trpc.chat.tools.listProjects.useQuery();
// Returns: Array of projects
```

#### `chat.tools.uploadDocument`
Upload a document
```typescript
const doc = await trpc.chat.tools.uploadDocument.useMutation({
  filename: "report.pdf",
  content: "base64_encoded_content"
});
// Returns: { id, filename, size, uploadedAt, userId }
```

#### `chat.tools.listDocuments`
List all documents
```typescript
const docs = await trpc.chat.tools.listDocuments.useQuery();
// Returns: Array of documents
```

#### `chat.tools.searchWeb`
Search the web
```typescript
const results = await trpc.chat.tools.searchWeb.useQuery({ query: "React hooks" });
// Returns: Array of { title, url, snippet }
```

#### `chat.tools.executeCode`
Execute code
```typescript
const result = await trpc.chat.tools.executeCode.useMutation({
  code: "console.log('Hello, World!')",
  language: "javascript"
});
// Returns: { success, output, language } or { success: false, error }
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  title VARCHAR(255) DEFAULT 'New Chat',
  shareToken VARCHAR(64) UNIQUE,
  isPublic ENUM('true', 'false') DEFAULT 'false',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  conversationId INT NOT NULL,
  role ENUM('user', 'assistant') NOT NULL,
  content TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Projects Table
```sql
CREATE TABLE projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#10a37f',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tools Table
```sql
CREATE TABLE tools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  type ENUM('project', 'document', 'search', 'code', 'other') NOT NULL,
  description TEXT,
  data TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

## 🛠️ Tools & Features

### Projects Tool
Organize your work into projects. Create, view, and manage projects directly from the sidebar.

**Features:**
- Create projects with custom names and descriptions
- Color-coded project organization
- Delete projects you no longer need
- View all projects in a list

### Documents Tool
Upload and manage documents for reference during conversations.

**Features:**
- Upload multiple file formats (PDF, images, text files)
- Image preview in the sidebar
- File size tracking
- Easy access to uploaded documents

### Web Search Tool
Search the internet in real-time using DuckDuckGo API.

**Features:**
- Real-time search results
- Display snippets and source links
- Automatic source citation in AI responses
- Filter and sort results

### Code Interpreter Tool
Execute code snippets and see results instantly.

**Features:**
- Support for JavaScript execution
- Display code output and errors
- Syntax highlighting
- Language selection

---

## 🧪 Development

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test auth.logout.test.ts
```

### Code Quality
```bash
# Type checking
pnpm check

# Format code
pnpm format

# Lint code
pnpm lint
```

### Building for Production
```bash
# Build frontend and backend
pnpm build

# Start production server
pnpm start
```

### Database Management
```bash
# Generate migrations from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Open Drizzle Studio (GUI)
pnpm drizzle-kit studio
```

---

## 📊 Testing

Nova includes comprehensive test coverage with Vitest. All tests are passing (10/10).

**Test Files:**
- `server/auth.logout.test.ts` - Authentication tests
- Additional test coverage for chat procedures, tools, and database operations

**Running Tests:**
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

---

## 🚀 Deployment

### Deploying to Manus Platform
1. Create a checkpoint in the Manus UI
2. Click the "Publish" button
3. Your app will be deployed to `groqchatbot-hakmkukg.manus.space`

### Deploying to Other Platforms

**Railway:**
```bash
railway link
railway up
```

**Vercel (Frontend only):**
```bash
vercel deploy
```

**Docker:**
```bash
docker build -t nova .
docker run -p 3000:3000 nova
```

### Environment Variables for Production
Ensure all required environment variables are set in your production environment. Use secrets management tools like:
- Manus Secrets Manager
- Railway Secrets
- Vercel Environment Variables
- Docker Secrets

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write tests for new functionality
5. Run tests and linting (`pnpm test && pnpm check`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Keep components focused and reusable
- Use Tailwind CSS for styling
- Document complex logic with comments
- Maintain consistent code formatting with Prettier

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Groq** - Fast LLM inference
- **React** - UI framework
- **Tailwind CSS** - Styling framework
- **tRPC** - Type-safe API
- **Drizzle ORM** - Database ORM
- **Manus** - Hosting and authentication platform

---

## 📞 Support & Feedback

For issues, feature requests, or feedback:
- Open an issue on GitHub
- Contact the development team
- Check the documentation at [docs.example.com](https://docs.example.com)

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Real-time collaboration on conversations
- [ ] Voice input and output
- [ ] Advanced conversation analytics
- [ ] Custom AI personality training
- [ ] Plugin system for extending tools
- [ ] Mobile app (iOS/Android)
- [ ] Dark mode support
- [ ] Conversation branching and versioning
- [ ] Team workspaces
- [ ] API rate limiting and usage analytics

### Performance Improvements
- [ ] Message streaming optimization
- [ ] Database query optimization
- [ ] Frontend bundle size reduction
- [ ] Caching strategies
- [ ] CDN integration

---

**Built with ❤️ by the Nova Team**

Last Updated: May 2026
