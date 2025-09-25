import { RequestHandler } from "express";
import { z } from "zod";
import { authenticateToken } from "./auth";

// Weather API Integration
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'demo-key';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Email Service Integration (using Resend as example)
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || 'demo-key';
const EMAIL_BASE_URL = 'https://api.resend.com';

// SMS Service Integration (using Twilio as example)
const SMS_API_KEY = process.env.SMS_API_KEY || 'demo-key';
const SMS_BASE_URL = 'https://api.twilio.com';

// Validation schemas
const weatherQuerySchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  units: z.enum(['metric', 'imperial']).default('metric')
});

const emailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  type: z.enum(['project_update', 'material_alert', 'system_notification']).default('system_notification')
});

const smsSchema = z.object({
  to: z.string().min(10),
  message: z.string().min(1).max(160),
  type: z.enum(['emergency', 'update', 'reminder']).default('update')
});

// Weather API Integration
export const handleGetWeather: RequestHandler = async (req, res) => {
  try {
    const validation = weatherQuerySchema.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { lat, lon, units } = validation.data;

    // In production, use real API
    if (WEATHER_API_KEY === 'demo-key') {
      // Mock weather data for development
      const mockWeather = {
        location: { lat, lon },
        current: {
          temperature: Math.round(Math.random() * 30 + 10),
          humidity: Math.round(Math.random() * 40 + 30),
          windSpeed: Math.round(Math.random() * 20 + 5),
          condition: ['Clear', 'Cloudy', 'Rain', 'Sunny'][Math.floor(Math.random() * 4)],
          icon: '01d'
        },
        forecast: Array.from({ length: 5 }, (_, i) => ({
          date: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
          temperature: Math.round(Math.random() * 30 + 10),
          condition: ['Clear', 'Cloudy', 'Rain', 'Sunny'][Math.floor(Math.random() * 4)],
          precipitation: Math.round(Math.random() * 100)
        })),
        alerts: []
      };

      return res.json(mockWeather);
    }

    // Real API call
    const weatherResponse = await fetch(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${WEATHER_API_KEY}`
    );

    if (!weatherResponse.ok) {
      throw new Error('Weather API request failed');
    }

    const weatherData = await weatherResponse.json();
    res.json(weatherData);

  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ message: 'Failed to fetch weather data' });
  }
};

// Email Service Integration
export const handleSendEmail: RequestHandler = async (req, res) => {
  try {
    const validation = emailSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { to, subject, body, type } = validation.data;

    // In production, use real email service
    if (EMAIL_API_KEY === 'demo-key') {
      console.log('📧 Mock Email Sent:', { to, subject, type });
      
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return res.json({
        success: true,
        messageId: `mock-${Date.now()}`,
        message: 'Email sent successfully (demo mode)'
      });
    }

    // Real email API call
    const emailResponse = await fetch(`${EMAIL_BASE_URL}/emails`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${EMAIL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@construction-success.com',
        to,
        subject,
        html: body,
        tags: [{ name: 'type', value: type }]
      })
    });

    if (!emailResponse.ok) {
      throw new Error('Email API request failed');
    }

    const emailData = await emailResponse.json();
    res.json(emailData);

  } catch (error) {
    console.error('Email API error:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
};

// SMS Service Integration
export const handleSendSMS: RequestHandler = async (req, res) => {
  try {
    const validation = smsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        errors: validation.error.issues.map(err => ({
          message: err.message,
          field: err.path[0] as string,
        }))
      });
    }

    const { to, message, type } = validation.data;

    // In production, use real SMS service
    if (SMS_API_KEY === 'demo-key') {
      console.log('📱 Mock SMS Sent:', { to, type });
      
      // Simulate SMS sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return res.json({
        success: true,
        messageId: `mock-sms-${Date.now()}`,
        message: 'SMS sent successfully (demo mode)'
      });
    }

    // Real SMS API call
    const smsResponse = await fetch(`${SMS_BASE_URL}/2010-04-01/Accounts/${SMS_API_KEY}/Messages.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${SMS_API_KEY}:${SMS_API_KEY}`).toString('base64')}`
      },
      body: new URLSearchParams({
        To: to,
        From: '+1234567890', // Your Twilio number
        Body: message
      })
    });

    if (!smsResponse.ok) {
      throw new Error('SMS API request failed');
    }

    const smsData = await smsResponse.json();
    res.json(smsData);

  } catch (error) {
    console.error('SMS API error:', error);
    res.status(500).json({ message: 'Failed to send SMS' });
  }
};

// GPS/Location Services
export const handleGetLocation: RequestHandler = async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    // Mock geocoding for development
    const mockLocation = {
      address,
      coordinates: {
        lat: 40.7128 + (Math.random() - 0.5) * 0.1,
        lon: -74.0060 + (Math.random() - 0.5) * 0.1
      },
      timezone: 'America/New_York',
      formatted_address: `${address}, New York, NY, USA`
    };

    res.json(mockLocation);

  } catch (error) {
    console.error('Location API error:', error);
    res.status(500).json({ message: 'Failed to get location' });
  }
};

// Calendar Integration
export const handleGetCalendarEvents: RequestHandler = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Mock calendar events
    const mockEvents = [
      {
        id: '1',
        title: 'Project Review Meeting',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        type: 'meeting',
        location: 'Conference Room A',
        attendees: ['john@example.com', 'jane@example.com']
      },
      {
        id: '2',
        title: 'Material Delivery',
        start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
        type: 'delivery',
        location: 'Construction Site',
        attendees: ['supplier@example.com']
      }
    ];

    res.json({ events: mockEvents });

  } catch (error) {
    console.error('Calendar API error:', error);
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
};

// Backup and Export Services
export const handleExportData: RequestHandler = async (req, res) => {
  try {
    const userId = req.userId!;
    const { format, type } = req.query;

    // Mock data export
    const exportData = {
      user: userId,
      timestamp: new Date().toISOString(),
      format: format || 'json',
      type: type || 'all',
      data: {
        projects: [],
        materials: [],
        files: [],
        analytics: {}
      }
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csv = 'Project,Status,Progress\nDemo Project,Active,75%';
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
      return res.send(csv);
    }

    res.json(exportData);

  } catch (error) {
    console.error('Export API error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
};

// System Health Check
export const handleSystemHealth: RequestHandler = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'connected',
        email: EMAIL_API_KEY !== 'demo-key' ? 'connected' : 'demo',
        sms: SMS_API_KEY !== 'demo-key' ? 'connected' : 'demo',
        weather: WEATHER_API_KEY !== 'demo-key' ? 'connected' : 'demo'
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ message: 'Health check failed' });
  }
};
