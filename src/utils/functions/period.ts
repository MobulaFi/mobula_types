export default function normalizePeriod(period: string, defaultPeriod = '1h') {
  switch (period.toLowerCase()) {
    case '1s':
      return '1s';
    case '5s':
      return '5s';
    case '15s':
      return '15s';
    case '30s':
      return '30s';
    case '1':
    case '1m':
    case '1min':
      return '1m';
    case '5':
    case '5m':
    case '5min':
      return '5m';
    case '15':
    case '15m':
    case '15min':
      return '15m';
    case '30':
    case '30m':
    case '30min':
      return '30m';
    case '60':
    case '1h':
      return '1h';
    case '240':
    case '4h':
      return '4h';
    case '360':
    case '6h':
      return '6h';
    case '720':
    case '12h':
      return '12h';
    case '1d':
      return '1d';
    case '1w':
      return '1w';
    case '1month':
      return '1M';
    default:
      return defaultPeriod;
  }
}

export function getPeriodSeconds(period: string): number {
  switch (period) {
    case '1s':
      return 1;
    case '5s':
      return 5;
    case '15s':
      return 15;
    case '30s':
      return 30;
    case '1m':
      return 60;
    case '5m':
      return 5 * 60;
    case '15m':
      return 15 * 60;
    case '30m':
      return 30 * 60;
    case '1h':
      return 60 * 60;
    case '4h':
      return 4 * 60 * 60;
    case '6h':
      return 6 * 60 * 60;
    case '12h':
      return 12 * 60 * 60;
    case '1d':
      return 24 * 60 * 60;
    case '1w':
      return 7 * 24 * 60 * 60;
    case '1M':
      return 30 * 24 * 60 * 60;
    default:
      throw new Error('Invalid bar value');
  }
}

export function getBucketExpression(period: string): string {
  // Postgres expression to truncate "date" column to the start of the bucket
  // using DATE_TRUNC + interval arithmetic instead of manual epoch math.
  switch (period) {
    case '1s':
      return `date_trunc('second', date)`;
    case '5s':
      return `
        date_trunc('minute', date)
        + floor(extract(second from date)::int / 5) * interval '5 second'
      `;
    case '15s':
      return `
        date_trunc('minute', date)
        + floor(extract(second from date)::int / 15) * interval '15 second'
      `;
    case '30s':
      return `
        date_trunc('minute', date)
        + floor(extract(second from date)::int / 30) * interval '30 second'
      `;
    case '1m':
      return `date_trunc('minute', date)`;
    case '5m':
      return `
        date_trunc('hour', date)
        + floor(extract(minute from date)::int / 5) * interval '5 minute'
      `;
    case '15m':
      return `
        date_trunc('hour', date)
        + floor(extract(minute from date)::int / 15) * interval '15 minute'
      `;
    case '30m':
      return `
        date_trunc('hour', date)
        + floor(extract(minute from date)::int / 30) * interval '30 minute'
      `;
    case '1h':
      return `date_trunc('hour', date)`;
    case '4h':
      return `
        date_trunc('day', date)
        + floor(extract(hour from date)::int / 4) * interval '4 hour'
      `;
    case '6h':
      return `
        date_trunc('day', date)
        + floor(extract(hour from date)::int / 6) * interval '6 hour'
      `;
    case '12h':
      return `
        date_trunc('day', date)
        + floor(extract(hour from date)::int / 12) * interval '12 hour'
      `;
    case '1d':
      return `date_trunc('day', date)`;
    case '1w':
      return `date_trunc('week', date)`;
    case '1M':
      return `date_trunc('month', date)`;
    default:
      throw new Error('Invalid period value');
  }
}
