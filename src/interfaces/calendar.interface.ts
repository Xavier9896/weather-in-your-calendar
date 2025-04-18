export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  weather?: {
    temperature: number;
    description: string;
    icon: string;
    humidity?: number;
    pressure?: number;
    wind?: {
      speed: number;
      direction: string;
    };
    sunrise?: Date;
    sunset?: Date;
  };
}

export interface CalendarProvider {
  /**
   * 生成包含天气信息的日历事件
   * @param events 日历事件数组
   * @returns 生成的日历文件内容
   */
  generateCalendar(events: CalendarEvent[]): Promise<string>;

  /**
   * 将日历内容保存为文件
   * @param content 日历内容
   * @param filename 文件名
   */
  saveCalendar(content: string, filename: string): Promise<void>;
} 