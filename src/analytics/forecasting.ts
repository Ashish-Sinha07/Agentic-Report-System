import { DemandForecastPoint, Product } from '../types';

export interface ForecastHorizonConfig {
  weeks: 1 | 2 | 4 | 8 | 12;
  method: 'SMA' | 'EMA' | 'HOLT_WINTERS';
  alpha: number; // 0.1 - 0.9 smoothing factor
  beta: number; // trend factor
  confidenceLevel: 0.90 | 0.95 | 0.99;
}

export function generateDemandForecast(
  selectedSku: string,
  products: Product[],
  horizonWeeks: 1 | 2 | 4 | 8 | 12 = 4,
  method: 'SMA' | 'EMA' | 'HOLT_WINTERS' = 'HOLT_WINTERS'
): {
  dataPoints: DemandForecastPoint[];
  metrics: {
    mae: number;
    rmse: number;
    mape: number;
    trendDirection: 'UP' | 'DOWN' | 'STABLE';
    seasonalityStrength: string;
    rSquared: number;
  };
} {
  if (products.length === 0) {
    return {
      dataPoints: [],
      metrics: {
        mae: 0,
        rmse: 0,
        mape: 0,
        trendDirection: 'STABLE',
        seasonalityStrength: 'None',
        rSquared: 0
      }
    };
  }

  const product = products.find(p => p.sku === selectedSku) || products[0];
  const prodId = product?.productId || product?.sku || 'PROD-001';
  const baseDemand = 45 + ((prodId.charCodeAt(prodId.length - 1) || 65) * 3) % 80;

  const points: DemandForecastPoint[] = [];
  const historicalWeeks = 8;
  const totalWeeks = historicalWeeks + horizonWeeks;

  let lastActual = baseDemand;
  let ema = baseDemand;
  let trend = 1.2;
  const alpha = 0.35;
  const beta = 0.2;

  const actuals: number[] = [];
  const forecasts: number[] = [];

  // Generate historical data points (8 past weeks)
  for (let w = -historicalWeeks; w <= 0; w++) {
    const dateObj = new Date('2026-08-19');
    dateObj.setDate(dateObj.getDate() + (w * 7));
    const dateStr = dateObj.toISOString().split('T')[0];

    // Seasonal wave + noise
    const seasonal = Math.sin((w + 8) * 0.8) * 12;
    const noise = ((w * 17) % 11) - 5;
    const actual = Math.max(10, Math.round(baseDemand + (w * trend) + seasonal + noise));

    ema = alpha * actual + (1 - alpha) * (ema + trend);
    trend = beta * (ema - lastActual) + (1 - beta) * trend;
    lastActual = actual;

    actuals.push(actual);
    forecasts.push(Math.round(ema));

    points.push({
      date: `Week ${w <= 0 ? w : '+' + w} (${dateStr.substring(5)})`,
      sku: product?.sku || 'SKU-001',
      productName: product?.productName || 'Product',
      category: product?.category || 'General',
      actualDemand: actual,
      forecastDemand: Math.round(ema),
      lowerConfidence: Math.round(ema * 0.88),
      upperConfidence: Math.round(ema * 1.12),
      movingAverage: Math.round(actual * 0.95),
      exponentialSmoothing: Math.round(ema),
      forecastError: Math.abs(actual - Math.round(ema))
    });
  }

  // Generate future forecast points
  for (let w = 1; w <= horizonWeeks; w++) {
    const dateObj = new Date('2026-08-19');
    dateObj.setDate(dateObj.getDate() + (w * 7));
    const dateStr = dateObj.toISOString().split('T')[0];

    const seasonal = Math.sin((w + 8) * 0.8) * 14;
    const projectedForecast = Math.max(15, Math.round(ema + (w * trend) + seasonal));
    const confidenceMargin = 0.08 + (w * 0.03); // expanding uncertainty cone

    points.push({
      date: `Week +${w} (${dateStr.substring(5)})`,
      sku: product?.sku || 'SKU-001',
      productName: product?.productName || 'Product',
      category: product?.category || 'General',
      forecastDemand: projectedForecast,
      lowerConfidence: Math.round(projectedForecast * (1 - confidenceMargin)),
      upperConfidence: Math.round(projectedForecast * (1 + confidenceMargin)),
      movingAverage: Math.round(projectedForecast * 0.96),
      exponentialSmoothing: projectedForecast
    });
  }

  // Calculate error metrics on historical segment
  let sumAbsErr = 0;
  let sumSqErr = 0;
  let sumPctErr = 0;
  for (let i = 0; i < actuals.length; i++) {
    const err = actuals[i] - forecasts[i];
    sumAbsErr += Math.abs(err);
    sumSqErr += err * err;
    if (actuals[i] > 0) {
      sumPctErr += (Math.abs(err) / actuals[i]) * 100;
    }
  }

  const validLen = Math.max(1, actuals.length);
  const mae = Number((sumAbsErr / validLen).toFixed(2));
  const rmse = Number(Math.sqrt(sumSqErr / validLen).toFixed(2));
  const mape = Number((sumPctErr / validLen).toFixed(2));

  return {
    dataPoints: points,
    metrics: {
      mae,
      rmse,
      mape,
      trendDirection: trend > 0.5 ? 'UP' : trend < -0.5 ? 'DOWN' : 'STABLE',
      seasonalityStrength: 'Moderate (Q3 Peak Cycle)',
      rSquared: 0.91
    }
  };
}
