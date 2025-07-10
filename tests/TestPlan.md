# Weather Dashboard - Test Plan

## 1. Objective

To verify the core functionality, reliability, and user experience of the Weather Dashboard application. This plan outlines the scope and strategy for End-to-End (E2E), Integration, and Unit testing.

## 2. Scope

In Scope: All features currently implemented, including city search, data display from the API, and local search history. Both client-side and server-side logic will be tested.

Out of Scope: Third-party API (OpenWeatherMap) uptime, load/stress testing, advanced security penetration testing.

## 3. Test Scenarios & Cases

| Feature Area   | Test Scenario                                                                     | Test Type   | Priority |
| -------------- | --------------------------------------------------------------------------------- | ----------- | -------- |
| City Search    | Happy Path: User can search for a valid city (e.g., "Tokyo").                     | E2E         | High     |
|                | Case Insensitivity: Search for "london" yields same result as "London".           | E2E         | High     |
|                | Input Trimming: Search for " New York " works correctly.                          | E2E         | Medium   |
|                | Data Display: Correct city name, temp, wind, humidity, and icon appear.           | E2E         | High     |
|                | 5-Day Forecast: 5 forecast cards are dynamically created and displayed.           | E2E         | High     |
| Error Handling | Invalid City: Search for a non-existent city (e.g., "FakeCity123").               | E2E         | High     |
|                | Empty Input: User clicks search with an empty input field.                        | E2E         | Medium   |
|                | API Failure: Server returns a 500 error (mocked).                                 | Integration | Medium   |
| Search History | Add to History: A successful search adds a new city button to the history.        | E2E         | High     |
|                | No Duplicates: Searching for the same city twice does not add a duplicate button. | E2E         | High     |
|                | History Click: Clicking a history button displays that city's weather data.       | Integration | High     |
|                | Persistence: Search history remains after a page refresh.                         | E2E         | High     |
| Backend API    | GET /api/weather/:city (Valid): Returns status 200 and weather data.              | Integration | High     |
|                | GET /api/weather/:city (Invalid): Returns status 404 and error message.           | Integration | High     |
|                | GET /api/weather/ (No City): Returns status 400 and error message.                | Integration | High     |
| Data Logic     | API Response Filtering: Correctly filters 40 API results into 5-6 unique days.    | Unit        | Medium   |
|                | Date Formatting: A utility function correctly formats a dt_txt string.            | Unit        | Low      |
