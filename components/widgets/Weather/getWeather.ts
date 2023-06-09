import { WeatherData } from './types';

interface Options {
  latitude: number;
  longitude: number;
  temperature_unit: string;
  daily: string[];
  timezone: string;
  current_weather: boolean;
}

function getWeather(
  {
    latitude,
    longitude,
  }: {
    latitude: number;
    longitude: number;
  },
  unit: string,
): Promise<WeatherData> {
  return new Promise((resolve, reject) => {
    const fetchData = async () => {
      try {
        const url = 'https://api.open-meteo.com/v1/forecast';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const options = {
          longitude: longitude.toString(),
          latitude: latitude.toString(),
          temperature_unit: unit === 'F' ? 'fahrenheit' : 'celsius',
          daily: [
            'temperature_2m_max',
            'temperature_2m_min',
            'precipitation_probability_mean',
            'precipitation_sum',
            'weathercode',
          ],
          hourly: [
            'temperature_2m',
            'precipitation_probability',
            'weathercode',
          ],

          timezone,
          current_weather: true,
        };

        const params = new URLSearchParams();
        for (const k in options) {
          params.append(`${k}`, `${options[k as keyof Options]}`);
        }
        const response = await fetch(`${url}?${params.toString()}`);
        if (!response.ok) {
          reject(Error('Error fetching weather data from API'));
        }
        const fetchedData = await response.json();
        if (fetchedData.error_message) {
          reject(Error(fetchedData.error_message));
        }
        resolve(fetchedData);
      } catch (err) {
        reject(err);
      }
    };

    fetchData();
  });
}

export default getWeather;
