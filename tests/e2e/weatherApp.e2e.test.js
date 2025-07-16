// tests/e2e/weatherApp.e2e.test.js

import { Builder } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import chromedriver from "chromedriver";
// Import our new Page Object
import WeatherPage from "./pageobjects/WeatherPage.js";

describe("Weather Dashboard E2E Tests", () => {
  let driver;
  let weatherPage; // A variable to hold our page object instance

  // Runs once before all tests
  beforeAll(async () => {
    const serviceBuilder = new chrome.ServiceBuilder(chromedriver.path);
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeService(serviceBuilder)
      .build();
    await driver.manage().setTimeouts({ implicit: 10000 });
    // Create a new instance of our page object, passing it the driver
    weatherPage = new WeatherPage(driver);
  }, 30000);

  // Runs once after all tests
  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  // This hook runs BEFORE EACH test in this describe block
  beforeEach(async () => {
    // Navigate to the page. Now we don't have to repeat this in every test!
    await weatherPage.navigate();

    // Tell the driver to execute this JavaScript command inside the browser
    await driver.executeScript("window.localStorage.clear()");

    // Navigate again AFTER clearing storage to ensure the UI reflects the empty state
    await weatherPage.navigate();
  });

  // --- City Search Tests ---
  describe("City Search Feature", () => {
    test("Happy Path: User can search for a valid city (e.g., 'Tokyo')", async () => {
      await weatherPage.searchForCity("Tokyo");
      const displayedCity = await weatherPage.getDisplayedCityName();
      expect(displayedCity).toContain("Tokyo");
    });

    test("Case Insensitivity: Search for 'tokyo' yields same result as 'Tokyo'", async () => {
      await weatherPage.searchForCity("tokyo");
      const displayedCity = await weatherPage.getDisplayedCityName();
      expect(displayedCity).toContain("Tokyo");
    });

    test("Input Trimming: Search for ' New York ' works correctly", async () => {
      await weatherPage.searchForCity(" New York ");
      const displayedCity = await weatherPage.getDisplayedCityName();
      expect(displayedCity).toContain("New York");
    });

    test("Data Display: Correct temp, wind, humidity, and icon appear", async () => {
      await weatherPage.searchForCity("London");
      await weatherPage.waitForResults(); // Wait for the page to load

      const details = await weatherPage.getTodayWeatherDetails();

      // Assert that each piece of data is not empty and contains expected text
      expect(details.iconUrl).toContain("openweathermap.org");
      expect(details.tempText).toContain("Temp:");
      expect(details.windText).toContain("Wind:");
      expect(details.humidityText).toContain("Humidity:");
    });

    test("5-Day Forecast: 5 forecast cards are dynamically created", async () => {
      await weatherPage.searchForCity("Paris");
      await weatherPage.waitForResults();

      const cardCount = await weatherPage.getForecastCardsCount();
      // We expect 5 cards for the 5-day forecast
      expect(cardCount).toBe(5);
    });
  });

  // --- Error Handling Tests ---
  describe("Error Handling Feature", () => {
    test("Invalid City: Search for a non-existent city triggers an alert", async () => {
      await weatherPage.searchForCity("FakeCity123");
      const alertText = await weatherPage.handleAlert();
      expect(alertText).toContain("City not found");
    });

    test("Empty Input: Clicking search with an empty input triggers an alert", async () => {
      await weatherPage.searchForCity("");
      const alertText = await weatherPage.handleAlert();
      expect(alertText).toContain("Please enter a city name");
    });
  });

  // --- Search History Tests ---
  describe("Search History Feature", () => {
    test("Add to History: A successful search adds a new city button", async () => {
      await weatherPage.searchForCity("Berlin");
      await weatherPage.waitForResults(); // Wait for search to complete

      const historyButtons = await weatherPage.getHistoryButtons();
      const buttonTexts = await Promise.all(
        historyButtons.map((btn) => btn.getText())
      );

      expect(buttonTexts).toContain("Berlin");
    });

    test("No Duplicates: Searching for the same city twice does not add a duplicate button", async () => {
      // First search
      await weatherPage.searchForCity("Lisbon");
      await weatherPage.waitForResults();
      let historyButtons = await weatherPage.getHistoryButtons();
      // Clear local storage to ensure a clean state for this specific test
      await driver.executeScript("window.localStorage.clear()");
      await weatherPage.navigate(); // Re-navigate to apply the cleared storage

      // Search for the city the first time
      await weatherPage.searchForCity("Lisbon");
      await weatherPage.waitForResults();
      let buttonsAfterFirstSearch = await weatherPage.getHistoryButtons();
      expect(buttonsAfterFirstSearch.length).toBe(1);

      // Search for the same city a second time
      await weatherPage.searchForCity("Lisbon");
      await weatherPage.waitForResults(); // Wait to ensure UI has time to update
      let buttonsAfterSecondSearch = await weatherPage.getHistoryButtons();

      // The count should still be 1
      expect(buttonsAfterSecondSearch.length).toBe(1);
    });

    test("History Click: Clicking a history button displays its weather data", async () => {
      // Search for two cities to ensure the history is populated
      await weatherPage.searchForCity("Madrid");
      await weatherPage.waitForResults();
      await weatherPage.searchForCity("Rome");
      await weatherPage.waitForResults();

      // Now click on the first city's history button
      await weatherPage.clickHistoryButton("Madrid");

      const displayedCity = await weatherPage.getDisplayedCityName();
      expect(displayedCity).toContain("Madrid");
    });

    test("Persistence: Search history remains after a page refresh", async () => {
      await weatherPage.searchForCity("Cairo");
      await weatherPage.waitForResults(); // Ensure the button is added

      // Refresh the page
      await driver.navigate().refresh();

      // After refresh, the history should be re-rendered from localStorage
      // We need to wait for the history buttons to appear again
      const historyButtons = await weatherPage.getHistoryButtons();
      const buttonTexts = await Promise.all(
        historyButtons.map((btn) => btn.getText())
      );

      expect(buttonTexts).toContain("Cairo");
    });
  });
});
