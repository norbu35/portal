/* eslint-disable import/no-extraneous-dependencies */
'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { StaticImageData } from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { WeatherData } from './types';
import { WidgetState } from '@/components/layout/types';

import getGeocode from './getGeocode';
import getLocation from './getLocation';
import getWeather from './getWeather';

import getWeatherIconBg from './getWeatherIconBg';
import renderTab from './renderTab';
import Loader from './Loader';

import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import '@fontsource/inter/200.css';
import styles from './Weather.module.scss';

interface Props {
  state: WidgetState;
}

function Weather({ state }: Props) {
  const { settings } = state;
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [city, setCity] = useState<string>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeView, setActiveView] = useState<string>('hourly');
  const [forecastIsOpen, setForecastIsOpen] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const geoLocation = await getLocation();
        const coords = geoLocation.coords;
        const weatherData = await getWeather(coords);
        setWeather(weatherData);
        const geoCode = await getGeocode(coords);
        setCity(geoCode.results[9].formatted_address.split(',')[0]);
        setLoading(false);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
  }, []);

  const { weatherIcon: currentWeatherIcon, weatherBgImg: currentWeatherBgImg } =
    getWeatherIconBg(
      weather?.current_weather.weathercode,
      true,
      weather?.current_weather.time,
    );

  function handleSwitchView(viewType: string): void {
    setActiveView(viewType);
  }

  function toggleForecast() {
    setForecastIsOpen(!forecastIsOpen);
  }

  const localDate = new Date().toLocaleDateString();

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>{error.message}</p>;
  }

  return (
    <div
      className={styles.container}
      style={{
        backgroundImage: settings!.bgImg
          ? currentWeatherBgImg
            ? `url(${currentWeatherBgImg.src})`
            : "url('/widgets/Weather/clear-day.jpg')"
          : 'none',
        backgroundPosition: 'center',
        fontSize: (settings!.fontSize / 16).toFixed(3) + 'rem',
        color: settings!.fontColor,
      }}
    >
      <div className={styles.current}>
        <div className={styles.left}>
          <div className={styles.locationDate}>
            <div className={styles.location}>{city}</div>
            <div className={styles.date}>{localDate}</div>
          </div>
          <div className={styles.currentConditions}>
            {currentWeatherIcon}
            <div className={styles.conditionDescription}></div>
          </div>
        </div>
        <div className={styles.right}>
          <div className={styles.currentTemp}>
            {weather?.current_weather.temperature}°
          </div>
          <div className={styles.maxTemp}>
            {weather?.daily?.temperature_2m_max[0]}°
          </div>
          <div className={styles.minTemp}>
            {weather?.daily?.temperature_2m_min[0]}°
          </div>
          <div className={styles.wind}></div>
        </div>
      </div>
      {forecastIsOpen || (
        <div className={styles.forecastButtonTop} onClick={toggleForecast}>
          <FontAwesomeIcon icon={faAngleDown} />
        </div>
      )}
      {forecastIsOpen && (
        <div className={styles.forecast}>
          <ul className={styles.tabsNav}>
            <li
              className={
                activeView === 'hourly'
                  ? `${styles.tabActive} ${styles.tabButton}`
                  : `${styles.tabButton}`
              }
              onClick={() => handleSwitchView('hourly')}
            >
              Hourly
            </li>
            <li
              className={
                activeView === 'daily'
                  ? `${styles.tabActive} ${styles.tabButton}`
                  : `${styles.tabButton}`
              }
              onClick={() => handleSwitchView('daily')}
            >
              Daily
            </li>
            <li
              className={
                activeView === 'precipitation'
                  ? `${styles.tabActive} ${styles.tabButton}`
                  : `${styles.tabButton}`
              }
              onClick={() => handleSwitchView('precipitation')}
            >
              Precipitation
            </li>
          </ul>
          <div className={styles.tab}>
            {weather && renderTab(activeView, weather)}
          </div>
        </div>
      )}
      {forecastIsOpen && (
        <div className={styles.forecastButtonBottom} onClick={toggleForecast}>
          <FontAwesomeIcon icon={faAngleDown} />
        </div>
      )}
    </div>
  );
}

export default Weather;
