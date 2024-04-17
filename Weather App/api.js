"use strict";
const api_Key = "";

export const fetchData = async function (url, callback) {
  try {
    let response = await fetch(url);
    let data = await response.json();
    callback(data);
  } catch (err) {
    console.log(err);
  }
};

export const url = {
  currentWeather(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/weather?${lat}&${lon}&appid=${api_Key}&units=metric`;
  },
  forecast(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/forecast?${lat}&${lon}&appid=${api_Key}&units=metric`;
  },
  airPollution(lat, lon) {
    return `https://api.openweathermap.org/data/2.5/air_pollution?${lat}&${lon}&appid=${api_Key}&units=metric`;
  },
  reverseGeo(lat, lon) {
    return `https://api.openweathermap.org/geo/1.0/reverse?${lat}&${lon}&limit=5&appid=${api_Key}&units=metric`;
  },
  geo(query) {
    return `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${api_Key}&units=metric`;
  },
};
