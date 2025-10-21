## 🚀 Project Setup & Usage
**How to install and run:**  
Create a .env file based on .env.example.

Then run:  
- `npm install`  
- `npm run db:generate`  
- `npm run db:migrate`  
- `npx prisma migrate dev`  
- `npm run dev`

## 🔗 Deployed Web URL or APK file
[michi-ai.vercel.app](https://michi-ai.vercel.app)

## 🎥 Demo Video
[Video demo](https://www.youtube.com/watch?v=D_40_JjVFN8)

## 💻 Project Introduction

### a. Overview
A minimalist, AI-powered task manager that helps users organize, track, and manage tasks efficiently with AI suggestions and intelligent scheduling.

### b. Key Features & Function Manual
- Add, edit, delete, and mark tasks as completed.
- AI-powered task suggestions and reminders.
- Simple and minimalistic UI for quick task management.

### c. Unique Features (What’s special about this app?) 
- AI chatbot integration to help manage tasks and suggest priorities.
- Smart date parsing: e.g., “tomorrow 14:00” or “next Monday.”
- Timeline view for task scheduling.

### d. Technology Stack and Implementation Methods
- Frontend: Next.js, React, TypeScript  
- Backend: tRPC, Prisma, PostgreSQL  
- AI: ai-sdk with Gemini API for ChatBot with tools  
- Other: react-big-calendar for timeline view, date-fns for date manipulation

### e. Service Architecture & Database Structure (when used)
- Architecture: Client-server with Next.js API routes and tRPC endpoints.  
- Database: PostgreSQL with a Task table storing task text, status, time, and user ID.

## 🧠 Reflection
- Improve AI accuracy and task suggestions.  
- Enhance chat UI/UX.  
- Add more advanced task and timeline functions.  
- Integrate additional AI-powered features.  
- Allow users to add personal notes for AI to better understand context.

### a. If you had more time, what would you expand?
- Improve accuracy of tools  
- Better UI/UX in chat  
- More functions in tasks and timeline  
- More AI-powered features  
- Add functionality to let users add notes so AI can better understand them

### b. If you integrate AI APIs more for your app, what would you do?
- Currently, I use AI, but I want to implement RAG in my application so that the chatbot can fully understand the user's context.

## ✅ Checklist
- [x] Code runs without errors  
- [x] All required features implemented (add/edit/delete/complete tasks)  
- [x] All ✍️ sections are filled
