import { Location } from './weather.interface';

export interface GenerateCalendarRequest {
  location: Location;
  days?: number;
  filename?: string;
}

export interface GenerateCalendarResponse {
  success: boolean;
  message?: string;
  data?: {
    calendarContent: string;
    downloadUrl?: string;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: any;
} 