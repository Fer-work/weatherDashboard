// tests/e2e/pageobjects/WeatherPage.js

import { By, until } from "selenium-webdriver";

// The Page Object class for our Weather Dashboard
export default class WeatherPage {
  // The constructor takes the selenium driver as an argument
  constructor(driver) {
    this.driver = driver;
    this.url = "https://weather-dashboard-beta-eight-12.vercel.app/";

    // Locators for all the elements we'll interact with.
    this.locators = {
      cityInput: By.id("inputCity"),
      searchButton: By.id("searchBtn"),
      cityNameDisplay: By.id("cityName"),
      todayWeatherCard: By.css(".todayWeather"),
      forecastCards: By.css("#cardContainer .card"),
      historyButtons: By.css(".resultsContainer .city"),
    };
  }

  // --- Page Actions ---

  // Navigates to the app's URL
  async navigate() {
    await this.driver.get(this.url);
  }

  /**
   * A reusable function to perform a city search.
   * @param {string} cityName - The name of the city to search for.
   */
  async searchForCity(cityName) {
    const cityInputElement = await this.driver.findElement(
      this.locators.cityInput
    );
    await cityInputElement.clear();
    await cityInputElement.sendKeys(cityName);
    await this.driver.findElement(this.locators.searchButton).click();
  }

  /**
   * A reusable function that waits for the results to load after a search.
   */
  async waitForResults() {
    const element = await this.driver.wait(
      until.elementLocated(this.locators.cityNameDisplay),
      15000
    );
    await this.driver.wait(until.elementIsVisible(element), 15000);
    return element;
  }

  /**
   * Handles browser alerts, gets their text, and accepts them.
   * @returns {Promise<string>} The text of the alert.
   */
  async handleAlert() {
    // Wait for the alert to be present
    await this.driver.wait(until.alertIsPresent(), 5000);
    // Switch to the alert
    const alert = await this.driver.switchTo().alert();
    // Get the text of the alert
    const alertText = await alert.getText();
    // Click the "OK" button on the alert
    await alert.accept();
    return alertText;
  }

  /**
   * Clicks a history button that matches the given city name.
   * @param {string} cityName - The text of the history button to click.
   */
  async clickHistoryButton(cityName) {
    const historyButton = await this.driver.findElement(
      By.xpath(`//button[@class='city' and text()='${cityName}']`)
    );
    await historyButton.click();
  }

  // --- Getters for Assertions ---

  async getDisplayedCityName() {
    const element = await this.waitForResults();
    return element.getText();
  }

  async getForecastCardsCount() {
    const cards = await this.driver.findElements(this.locators.forecastCards);
    return cards.length;
  }

  async getHistoryButtons() {
    return this.driver.findElements(this.locators.historyButtons);
  }

  async getTodayWeatherDetails() {
    const card = await this.driver.findElement(this.locators.todayWeatherCard);

    const iconUrl = await card
      .findElement(By.className("weatherSymbol"))
      .getAttribute("src");
    const tempText = await card
      .findElement(By.className("cardDegrees"))
      .getText();
    const windText = await card.findElement(By.className("cardWind")).getText();
    const humidityText = await card
      .findElement(By.className("cardHumidity"))
      .getText();

    return { iconUrl, tempText, windText, humidityText };
  }
}
