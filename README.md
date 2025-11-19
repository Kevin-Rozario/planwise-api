<div align="center">
  <br />
  <h1>PlanWise API 🗓️✨</h1>
  <p>
    <b>An intelligent event planner and conflict detector powered by Google's Gemini AI.</b>
  </p>
  <br />
</div>

<p align="center">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img alt="Express" src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white">
  <img alt="Gemini" src="https://img.shields.io/badge/Gemini-4A89F3?style=for-the-badge&logo=google-gemini&logoColor=white">
</p>

Welcome to the PlanWise API, a smart backend service designed to make event scheduling seamless and efficient. By leveraging the power of Google's Gemini AI, PlanWise goes beyond simple event management to offer intelligent features that help you avoid conflicts, optimize your schedule, and stay organized.

## 🌟 Features

### Core Functionality
- ✅ **Event Management**: Full CRUD (Create, Read, Update, Delete) functionality for your events.
- 🗂️ **In-Memory Storage**: Fast, session-based event storage. *Note: Data is not persisted and will be lost on server restart.*
- 🛡️ **Schema Validation**: Robust API request validation using Zod to ensure data integrity.

### 🧠 AI-Powered Intelligence
- 💥 **Conflict Detection**: Automatically identifies scheduling conflicts when you create or update an event.
- 💡 **Smart Suggestions**: When a conflict is detected, the AI suggests alternative time slots to resolve it.
- 📊 **Automatic Prioritization**: If you don't set a priority, the AI will assign one (`low`, `medium`, or `high`) based on the event's title and description.
- 🤖 **Auto-Rescheduling**: An endpoint to let the AI find a new, conflict-free time for an event.
- ✍️ **Description Enhancement**: Automatically improves event descriptions to be more detailed, engaging, and clear.
- 📝 **Event Summarization**: Generates a concise summary of your entire schedule.
- 🗣️ **Natural Language Queries**: Ask questions about your schedule in plain English, like "What's on my schedule for today?" or "When am I free tomorrow?".
- ⏰ **User-Specific Working Hours**: Tailors time suggestions to your specified working hours for more personalized scheduling.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)

### Installation & Setup
1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```
2.  **Navigate to the backend directory:**
    ```bash
    cd planwise/backend
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Configure your environment:**
    - Create a `.env` file in the `backend` directory.
    - Add your Gemini API key to the `.env` file:
      ```
      GEMINI_API_KEY=your_gemini_api_key
      ```

### ▶️ Running the Application
To start the development server with live reloading, run:
```bash
npm run start:dev
```
The server will attempt to start on port `3000` (as defined in `.env`) and fall back to `4000` if `3000` is unavailable.

## 📖 API Documentation

All endpoints are prefixed with `/api/v1`.

---

### Event Endpoints

#### `POST /events`
Create a new event.

-   **Body**: `IEventInput`
-   **Success Response (201)**: `{ "id": "string" }`
-   **Conflict Response (409)**: `{ "conflicts": [IEvent], "suggestion": { "startTime": "string" } }`

**Example Request:**
```json
{
  "title": "Team Meeting",
  "description": "Weekly sync-up with project team.",
  "mode": "offline",
  "venue": "Conference Room A",
  "startTime": "2025-11-16T09:00:00",
  "endTime": "2025-11-16T10:00:00",
  "tags": ["meeting"]
}
```

---

#### `GET /events`
Fetch all events.

-   **Success Response (200)**: `[IEvent]`

---

#### `GET /events/:id`
Fetch a single event by its ID.

-   **Success Response (200)**: `IEvent`

---

#### `PUT /events/:id`
Update an event by its ID.

-   **Body**: `IEventInput`
-   **Success Response (200)**: `IEvent`
-   **Conflict Response (409)**: `{ "conflicts": [IEvent], "suggestion": { "startTime": "string" } }`

---

#### `DELETE /events/:id`
Delete an event by its ID.

-   **Success Response (200)**: `IEvent` (the deleted event)

---

#### `GET /events/filtered`
Filter events by a tag.

-   **Query Parameter**: `tag` (e.g., `/events/filtered?tag=meeting`)
-   **Success Response (200)**: `[IEvent]`

---

### AI Endpoints

#### `POST /ai/auto-reschedule/:id`
Suggest a new time for a conflicting event.

-   **Success Response (200)**: `{ "startTime": "string" }`

---

#### `GET /ai/improve-description/:id`
Get an AI-enhanced description for an event.

-   **Success Response (200)**: `{ "description": "string" }`

---

#### `GET /ai/generate-summary`
Get a summary of all events.

-   **Success Response (200)**: `{ "summary": "string" }`

---

#### `POST /ai/natural-language-query`
Ask a question about your schedule.

-   **Body**: `{ "query": "string" }`
-   **Success Response (200)**: `{ "answer": "string" }`

**Example Request:**
```json
{
  "query": "What is scheduled for today?"
}
```

---

## 🧪 Testing the API

You can test the API using the provided `.rest` files (`event.test.rest` and `ai.test.rest`) located in the `src/routes` directory.

If you are using **Visual Studio Code**, the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension is highly recommended for a seamless testing experience.

## 🔮 Future Improvements
- **Database Integration**: Replace the in-memory store with a persistent database like PostgreSQL or MongoDB.
- **User Authentication**: Add user accounts and authentication to manage schedules on a per-user basis.
- **WebSocket Integration**: Implement real-time updates for a more dynamic frontend experience.

---
This README provides a comprehensive overview of the PlanWise API, its features, and how to get started.