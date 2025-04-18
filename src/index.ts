import express from 'express';
import dotenv from 'dotenv';
import { WeatherService } from './services/weather.service';
import { CalendarService } from './services/calendar.service';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const weatherService = new WeatherService();
const calendarService = new CalendarService();

app.get('/', (req, res) => {
  res.send('Weather in Your Calendar API is running!');
});

app.get('/calendar', async (req, res) => {
  try {
    const { city, zip, country_code } = req.query;
    let weatherData;

    if (city) {
      weatherData = await weatherService.getWeatherByCity(
        city as string,
        country_code as string
      );
    } else if (zip && country_code) {
      weatherData = await weatherService.getWeatherByZip(
        zip as string,
        country_code as string
      );
    } else {
      return res.status(400).json({
        error: 'Please provide either city or zip and country_code parameters'
      });
    }

    const calendar = calendarService.generateCalendar(
      weatherData.list,
      weatherData.city
    );

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather-calendar.ics'
    );
    res.send(calendar);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to generate calendar',
      details: error.message
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 