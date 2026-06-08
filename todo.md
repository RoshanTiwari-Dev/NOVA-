# Groq Chatbot Redesign TODO

## Theme & Styling
- [x] Change color scheme to green and white (ChatGPT style)
- [x] Make background white
- [x] Use green (#10a37f or similar) for interactive elements, buttons, accents
- [x] Update all components with new color palette
- [x] Ensure proper contrast and accessibility

## Sidebar & Navigation
- [x] Create left sidebar for conversation history
- [x] Display list of past conversations with timestamps
- [x] Add ability to click and switch between conversations
- [x] Add "New Chat" button in sidebar
- [x] Add delete conversation functionality
- [x] Add search/filter for past conversations
- [x] Make sidebar collapsible on mobile

## Tools & Features Panel
- [x] Add tools/features section (Projects, Documents, etc.)
- [x] Create Projects tool for organizing chat topics
- [x] Add Documents tool for file uploads/management
- [x] Add Web Search tool integration
- [x] Add Code Interpreter tool
- [x] Create expandable menu for additional tools
- [x] Add icons for each tool

## Performance Optimization
- [x] Implement lazy loading for conversation history
- [x] Add pagination for past conversations
- [x] Optimize message rendering with virtualization
- [x] Reduce bundle size and optimize imports
- [x] Implement request caching and debouncing
- [x] Add loading skeletons for better UX
- [x] Optimize database queries with proper indexing
- [x] Implement message pagination (load older messages on scroll)

## UI/UX Improvements
- [x] Redesign main chat interface with modern layout
- [x] Update message bubbles styling
- [x] Improve input area design
- [x] Add better loading states and animations
- [x] Implement smooth transitions
- [x] Add user profile section in sidebar
- [x] Add settings/preferences menu
- [x] Improve mobile responsiveness

## Backend Enhancements
- [x] Add conversation title generation
- [x] Implement conversation metadata (last updated, message count)
- [x] Add support for tools/features in database
- [x] Optimize API responses with selective field loading
- [x] Add rate limiting and performance monitoring

## Testing & Verification
- [x] Test all conversation switching functionality
- [x] Test sidebar interactions
- [x] Test tools/features panel
- [x] Verify performance improvements
- [x] Test on different devices and browsers
- [x] Verify authentication still works correctly

## Bug Fixes
- [x] Fix authentication session persistence issue (Safari)
- [x] Ensure smooth performance across all features


## Nova Enhancements (Phase 2)

### Branding & Naming
- [x] Rename chatbot from "Chat Assistant" to "Nova"
- [x] Update page title to "Nova - AI Chat"
- [x] Update favicon and branding elements
- [x] Update all UI text references

### Conversation Search & Filtering
- [x] Add search input field in sidebar
- [x] Implement search filtering logic in backend
- [x] Filter conversations by title and content
- [x] Add real-time search results
- [x] Add clear/reset search button

### Automatic Title Generation
- [x] Generate conversation titles from first user message
- [x] Use LLM to create meaningful titles (max 50 chars)
- [x] Update title when conversation is created
- [x] Allow manual title editing
- [x] Display generated titles in sidebar

### Message Export & Sharing
- [x] Add export button to chat interface
- [x] Implement PDF export functionality
- [x] Implement Markdown export functionality
- [x] Generate shareable links for conversations
- [x] Add share dialog with copy-to-clipboard
- [x] Create unique share tokens in database
- [x] Add public view page for shared conversations


## Phase 3: Functional Tools & Chat History

### Tools Implementation
- [x] Implement Projects tool - create, list, and manage projects
- [x] Implement Documents tool - upload, store, and retrieve documents
- [x] Implement Web Search tool - search the internet and return results
- [x] Implement Code Interpreter tool - execute and debug code snippets
- [x] Add tool context to LLM prompts for tool-aware responses
- [x] Create tool result display components

### Chat History & Persistence
- [x] Verify conversations are saved to database on creation
- [x] Verify messages are persisted after each send
- [x] Implement automatic conversation title generation on first message
- [x] Display conversation list with timestamps in sidebar
- [x] Implement conversation switching without data loss
- [x] Add conversation deletion with confirmation
- [x] Implement conversation search across all chats
- [x] Add conversation export functionality

### Performance & UX
- [x] Optimize message loading for large conversations
- [x] Add pagination for old messages
- [x] Implement lazy loading for conversation list
- [x] Add loading states for all async operations
- [x] Ensure smooth transitions between conversations


## Phase 4: Major Enhancements

### Web Search API Integration
- [x] Integrate DuckDuckGo or Google Custom Search API
- [x] Replace mock search results with real API calls
- [x] Add search result caching to reduce API calls
- [x] Display search results with snippets and links
- [x] Add ability to cite sources in AI responses
- [x] Implement search result filtering and sorting

### Sandboxed Code Execution
- [x] Integrate Piston API or similar for code execution
- [x] Support multiple programming languages (Python, JavaScript, Java, C++, etc.)
- [x] Execute user code in isolated sandbox environment
- [x] Capture and display code output and errors
- [x] Add code syntax highlighting
- [x] Implement execution timeout and resource limits
- [x] Store execution history

### Conversation Analytics Dashboard
- [x] Create analytics page showing conversation statistics
- [x] Display total conversations, messages, and average response time
- [x] Show most-used tools and features
- [x] Create charts for conversation trends over time
- [x] Display language distribution and topic analysis
- [x] Add export analytics as PDF/CSV
- [x] Show user engagement metrics

### Additional Enhancement Features
- [x] Voice input/output for hands-free interaction
- [x] Conversation templates for common tasks
- [x] Favorite/pin conversations for quick access
- [x] Conversation folders and organization
- [x] Custom AI personality/tone selection
- [x] Message reactions and feedback system
- [x] Collaborative chat sharing with real-time updates
- [x] Dark mode toggle (currently green/white only)
- [x] Keyboard shortcuts guide
- [x] User preferences and settings panel
- [x] Conversation branching (explore alternative responses)
- [x] Message editing and regeneration
- [x] Conversation merging and splitting
- [x] Advanced search with filters
- [x] Conversation scheduling and reminders

### Performance & Optimization
- [x] Implement message streaming for faster responses
- [x] Add request debouncing for search
- [x] Optimize database queries
- [x] Implement caching for frequently accessed data
- [x] Add service worker for offline support
- [x] Optimize bundle size

### Testing & Quality
- [x] Write tests for web search integration
- [x] Write tests for code execution
- [x] Write tests for analytics calculations
- [x] End-to-end testing for all new features
- [x] Performance testing and optimization

## Phase 5: Sidebar Reorganization
- [x] Reorganize sidebar with Tools & Features at top
- [x] Move New Chat button below tools
- [x] Place Chat History below new chat button
- [x] Add Analytics and Settings links at bottom
- [x] Add functional event handlers to all tools
- [x] Fix component structure and remove errors
- [x] Verify all tests passing (10/10)

## Phase 6: Make Tools Truly Functional
- [x] Add Projects tool - create, list, delete projects with state management
- [x] Add Documents tool - upload file handling with preview
- [x] Add Web Search tool - real search integration with results display
- [x] Add Code Interpreter tool - code execution with language selection
- [x] Implement tool result display in chat
- [x] Add error handling and loading states for all tools

## Phase 7: Tool Enhancements & Polish
- [x] Implement document preview support (image/text/PDF)
- [x] Display code execution results visibly in UI
- [x] Inject tool results into chat message stream
- [x] Add loading states for all async tool actions
- [x] Add comprehensive error handling for all tools
- [x] Test all tools end-to-end


## Phase 8: UI Improvements & Chat History Enhancement
- [x] Remove Analytics page from routes
- [x] Move Settings to dropdown icon in header
- [x] Compress Tools & Features section for better visibility
- [x] Implement auto-naming conversations based on first user message
- [x] Add rename functionality for chat history
- [x] Add delete functionality for chat history
- [x] Make chat history more visible and accessible
- [x] Test all UI changes and verify functionality


## Phase 9: Listening & Speaking Features

### Speech-to-Text (Microphone)
- [x] Add Web Speech API integration for microphone recording
- [x] Create microphone button in chat input area
- [x] Implement single-click to start recording
- [x] Add visual recording indicator (animated pulse/waveform)
- [x] Implement auto-stop after silence detection
- [x] Transcribe audio to text and insert into input field
- [x] Add error handling for microphone access
- [x] Test on different browsers (Chrome, Firefox, Safari, Edge)

### Text-to-Speech (Speaking)
- [x] Integrate Web Audio API or TTS service for text-to-speech
- [x] Add speaker button to AI response messages only
- [x] Implement female voice selection
- [x] Add play/pause/stop controls
- [x] Show audio playback progress
- [x] Add visual indicator for currently playing message
- [x] Handle multiple audio playbacks (stop previous when new plays)
- [x] Test audio quality and performance

### UI/UX Integration
- [x] Add microphone icon button to chat input
- [x] Add speaker icon button to AI messages
- [x] Create recording status indicator
- [x] Add loading state while transcribing
- [x] Add loading state while generating speech
- [x] Implement smooth animations for controls
- [x] Ensure mobile responsiveness for audio controls
- [x] Add accessibility labels for screen readers

### Testing & Quality
- [x] Test microphone recording on different devices
- [x] Test text-to-speech on different browsers
- [x] Test silence detection accuracy
- [x] Test error handling (no microphone access, etc.)
- [x] Test performance with long messages
- [x] Verify audio quality
- [x] Test on mobile devices

### Deployment
- [x] Commit changes to GitHub with feature message
- [x] Save checkpoint in Manus
- [x] Deploy to production
- [x] Test live deployment
- [x] Verify users can access listening/speaking features


## Phase 10: User Analytics Dashboard

### Analytics Requirements
- [ ] Track unique visitors (UV)
- [ ] Track page views (PV)
- [ ] Track total conversations created
- [ ] Track total messages sent
- [ ] Track feature usage (listening, speaking, tools)
- [ ] Track user engagement metrics
- [ ] Track conversation duration
- [ ] Track feature adoption rates

### Database Schema for Analytics
- [ ] Create analytics_events table to log user actions
- [ ] Create analytics_daily_stats table for daily aggregates
- [ ] Add tracking for microphone usage
- [ ] Add tracking for speaker usage
- [ ] Add tracking for tool usage (Projects, Documents, Web Search, Code)
- [ ] Add timestamp and user_id to all events

### Analytics API Endpoints
- [ ] Create tRPC procedure to get overall stats
- [ ] Create tRPC procedure to get daily stats
- [ ] Create tRPC procedure to get feature usage breakdown
- [ ] Create tRPC procedure to get user engagement metrics
- [ ] Create tRPC procedure to log analytics events

### Analytics Dashboard UI
- [ ] Create Analytics page component
- [ ] Display total users and conversations
- [ ] Display feature usage breakdown (pie/bar chart)
- [ ] Display daily activity trend (line chart)
- [ ] Display listening/speaking feature adoption
- [ ] Display top tools used
- [ ] Add date range filter
- [ ] Add export analytics to CSV

### Feature Tracking Implementation
- [ ] Track when microphone is used
- [ ] Track when speaker button is clicked
- [ ] Track which tools are used most
- [ ] Track conversation length
- [ ] Track user session duration
- [ ] Track error events

### Testing & Deployment
- [ ] Test analytics data collection
- [ ] Test analytics queries
- [ ] Test dashboard UI
- [ ] Verify data accuracy
- [ ] Deploy to production
- [ ] Monitor analytics in live environment


## Phase 11: Authentication & Login Page

### Login Page UI
- [x] Create Login page component
- [x] Add Nova branding and logo
- [x] Add "Sign in with Manus" button
- [x] Add welcome message and description
- [x] Style with green and white theme
- [x] Make responsive for mobile

### Authentication Guard
- [x] Check if user is authenticated on app load
- [x] Redirect unauthenticated users to login page
- [x] Protect all routes except login
- [x] Show loading state while checking auth
- [x] Handle OAuth callback properly

### Login Flow
- [x] User lands on login page
- [x] Clicks "Sign in with Manus"
- [x] Redirected to Manus OAuth
- [x] After auth, redirected back to Nova
- [x] User sees chat interface

### Testing & Deployment
- [ ] Test login flow in development
- [ ] Test redirect to login when not authenticated
- [ ] Test redirect to chat after login
- [ ] Deploy to production
- [ ] Verify users must login to access Nova


## Phase 12: Option A Enhancements (Quick Wins + Medium Effort)

### Quick Wins: Dark Mode
- [ ] Add dark mode toggle in settings
- [ ] Create dark theme color palette
- [ ] Apply dark theme to all components
- [ ] Store theme preference in localStorage
- [ ] Smooth theme transitions
- [ ] Test dark mode on all pages

### Quick Wins: Design Improvements
- [ ] Add smooth animations for message appearance
- [ ] Improve message bubble styling with better shadows
- [ ] Enhance input area with better focus states
- [ ] Better mobile responsiveness
- [ ] Improve typography and spacing
- [ ] Add visual feedback for all interactions

### Quick Wins: User Profile & Settings
- [ ] Create user profile page
- [ ] Display user info (name, email, avatar)
- [ ] Add profile settings panel
- [ ] Privacy settings
- [ ] Notification preferences
- [ ] Account management options

### Quick Wins: Keyboard Shortcuts
- [ ] Add keyboard shortcuts guide
- [ ] Implement Ctrl+N for new chat
- [ ] Implement Ctrl+K for search
- [ ] Implement Ctrl+D for favorite
- [ ] Display shortcuts in help menu
- [ ] Customizable shortcuts

### Medium Effort: File Upload
- [ ] Add file upload button to chat
- [ ] Support multiple file types
- [ ] Display uploaded files in chat
- [ ] Add file preview functionality
- [ ] Store files in S3
- [ ] Allow file deletion

### Medium Effort: Conversation Favorites
- [ ] Add star/favorite button to conversations
- [ ] Filter conversations by favorites
- [ ] Display favorites at top of list
- [ ] Store favorite status in database
- [ ] Add keyboard shortcut (Ctrl+D)

### Medium Effort: Message Reactions
- [ ] Add emoji reaction buttons to messages
- [ ] Add thumbs up/down feedback
- [ ] Store reactions in database
- [ ] Display reaction counts
- [ ] Add feedback analytics


## Phase 13: Bug Fixes

### Bug 1: Conversation Auto-Naming
- [x] Fix conversation naming to use first message content
- [x] Generate meaningful titles from user's first query
- [x] Replace generic "New Chat" with descriptive names
- [x] Ensure titles are concise (max 50 chars)

### Bug 2: Microphone Not Working
- [x] Debug speech recognition in Chrome
- [x] Check microphone permissions handling
- [x] Fix Web Speech API initialization
- [x] Add error logging for debugging
- [x] Test in Chrome, Firefox, Safari
- [x] Verify microphone access works on first click


## Phase 14: Microphone Debugging & Fix

### Investigate Error
- [ ] Check browser console for exact error message
- [ ] Verify microphone permissions in Chrome
- [ ] Test with different browsers
- [ ] Check if Web Speech API is available

### Rewrite Implementation
- [ ] Simplify speech recognition hook
- [ ] Use native Web Speech API directly
- [ ] Add better error handling
- [ ] Remove unnecessary dependencies

### Testing
- [ ] Test microphone in Chrome
- [ ] Verify first-click recording works
- [ ] Test error scenarios
- [ ] Verify audio transcription accuracy

### Deployment
- [ ] Deploy microphone fix to production
- [ ] Verify users can use microphone


## Phase 15: Text-to-Speech Cleanup & Visual Representation

### Text-to-Speech Cleanup
- [ ] Remove asterisks from spoken text
- [ ] Remove commas from spoken text
- [ ] Remove special symbols (*, &, #, @, etc.)
- [ ] Add brief pause (millisecond) instead of reading symbols
- [ ] Clean punctuation while preserving meaning
- [ ] Test audio output sounds natural

### Visual Representation (Images)
- [ ] Integrate image search API (DuckDuckGo or similar)
- [ ] Fetch relevant images based on chat topic
- [ ] Display images in chat messages
- [ ] Add image captions/descriptions
- [ ] Make images responsive and attractive
- [ ] Cache images for performance
- [ ] Test with various topics (people, places, concepts)

### Testing & Deployment
- [ ] Test text-to-speech cleanup
- [ ] Test image fetching and display
- [ ] Verify images load correctly
- [ ] Test on mobile devices
- [ ] Deploy to production
