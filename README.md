# Fer-117's Weather Dashboard (Full-Stack Edition)

## Description

This project is a modern, full-stack weather dashboard application. Originally a simple client-side application, it has been refactored to use a robust client-server architecture. The backend is built with **Node.js** and **Express**, creating a secure API that handles all communication with the external OpenWeatherMap service. This protects sensitive API keys and separates concerns effectively.

The frontend is a dynamic, single-page application built with vanilla **JavaScript** and styled with **Tailwind CSS**. It communicates exclusively with our own backend API to fetch weather data. All UI elements, such as the forecast cards, are generated dynamically based on the data received from the server.

## Key Features

- **Client-Server Architecture**: Securely handles API requests on the backend.
- **Dynamic UI**: Weather forecast cards are generated dynamically in the DOM.
- **Search History**: `localStorage` is used to save and display previous city searches for quick access.
- **Modern Tooling**: Utilizes modern JavaScript (ES Modules), Node.js, and Tailwind CSS.

## Technologies Used

- **Frontend**: HTML5, Tailwind CSS, JavaScript (ES Modules)
- **Backend**: Node.js, Express.js, CORS, Dotenv
- **API**: OpenWeatherMap 5 Day / 3 Hour Forecast API
- **Testing**: Selenium WebDriver, Jest, Chromedriver

## Getting Started

To run this project locally, you will need to run both the server and the client.

### Prerequisites

- Node.js (v18 or later)
- An API key from [OpenWeatherMap](https://openweathermap.org/api)

### Backend Setup

1.  Navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `server` directory and add your API key:
    ```
    API_KEY="YOUR_OPENWEATHERMAP_API_KEY"
    PORT=3001
    ```
4.  Start the server:
    ```bash
    npm run dev
    ```
    The server will be running on `http://localhost:3001`.

### Frontend Setup

1.  Open the `client/index.html` file in your browser. A tool like VS Code's "Live Server" extension is recommended.

## Testing

This project uses **Selenium WebDriver** for End-to-End (E2E) testing and **Jest** as the test runner. The testing strategy focuses on verifying critical user journeys from the UI to ensure the application functions as expected.

- **E2E Tests**: Simulate real user interactions, such as searching for a city and verifying that the weather data is displayed correctly.
- **Test Structure**: All tests are located in the top-level `/tests` directory, organized by test type (E2E, Integration, Unit).

To run the tests, navigate to the project's root directory and run:

```bash
# (This will be configured soon)
npm test
```
