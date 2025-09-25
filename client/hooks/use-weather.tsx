/**
 * Weather Service Hook
 * Provides weather data and forecasts for construction sites
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

export interface WeatherData {
  location: string;
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  forecast: {
    day: string;
    temp: number;
    conditions: string;
  }[];
}

export interface WeatherCurrent {
  temperature: number;
  condition: string;
  workSuitability: string;
}

export interface WeatherForecast {
  day: string;
  high: number;
  low: number;
  condition: string;
  workSuitability: string;
}

export function useWeather() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [current, setCurrent] = useState<WeatherCurrent | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWeather = useCallback(async (location: string = 'London, UK') => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await api.getWeather(location);
      setWeatherData(data);
      
      // Transform the API data to match the expected format
      const currentWeather: WeatherCurrent = {
        temperature: data.temperature,
        condition: data.conditions,
        workSuitability: data.temperature > 5 && data.temperature < 35 && !data.conditions.toLowerCase().includes('rain') ? 'good' : 'limited'
      };
      
      const forecastData: WeatherForecast[] = data.forecast.map((f, index) => ({
        day: index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : f.day,
        high: f.temp + 2,
        low: f.temp - 2,
        condition: f.conditions,
        workSuitability: f.temp > 5 && f.temp < 35 && !f.conditions.toLowerCase().includes('rain') ? 'good' : 'limited'
      }));
      
      setCurrent(currentWeather);
      setForecast(forecastData);
      
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch weather data');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    weatherData,
    current,
    forecast,
    loading,
    error,
    getWeather,
  };
}
