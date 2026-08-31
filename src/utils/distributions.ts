import { ThreePointEstimate, PercentileStats, HistogramBin } from '../types/fair';

/**
 * Standard Normal Random Variate using Box-Muller transform
 */
export function sampleStandardNormal(randomFn = Math.random): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = randomFn();
  while (v === 0) v = randomFn();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Gamma Distribution Sampler using Marsaglia and Tsang method (2000)
 */
export function sampleGamma(alpha: number, beta = 1, randomFn = Math.random): number {
  if (alpha < 1) {
    // Boost using Weibull rejection
    const u = randomFn();
    return (sampleGamma(alpha + 1, beta, randomFn) * Math.pow(u, 1 / alpha));
  }

  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  while (true) {
    const z = sampleStandardNormal(randomFn);
    const v = Math.pow(1 + c * z, 3);
    if (v <= 0) continue;

    const u = randomFn();
    if (u < 1 - 0.0331 * Math.pow(z, 4)) {
      return (d * v) / beta;
    }
    if (Math.log(u) < 0.5 * Math.pow(z, 2) + d * (1 - v + Math.log(v))) {
      return (d * v) / beta;
    }
  }
}

/**
 * Beta Distribution Sampler
 */
export function sampleBeta(p: number, q: number, randomFn = Math.random): number {
  if (p <= 0 || q <= 0) return 0.5;
  const x = sampleGamma(p, 1, randomFn);
  const y = sampleGamma(q, 1, randomFn);
  if (x + y === 0) return 0.5;
  return x / (x + y);
}

/**
 * Beta-PERT (Modified PERT) Distribution Sampler
 * In Open FAIR, Beta-PERT is the gold standard for expert estimates.
 * Shape factor gamma default is 4 (confidence = 4). Higher confidence narrows the peak.
 */
export function samplePert(
  estimate: ThreePointEstimate,
  randomFn = Math.random
): number {
  const { low, mode, high, confidence = 4 } = estimate;

  if (low >= high) return mode;
  if (mode < low || mode > high) {
    const minVal = Math.min(low, mode, high);
    const maxVal = Math.max(low, mode, high);
    return minVal + (maxVal - minVal) * randomFn();
  }

  const range = high - low;
  if (range <= 0.000001) return mode;

  // Beta parameters
  const gamma = Math.max(0.1, confidence);
  const p = 1 + gamma * ((mode - low) / range);
  const q = 1 + gamma * ((high - mode) / range);

  const betaSample = sampleBeta(p, q, randomFn);
  const val = low + betaSample * range;
  return Math.max(low, Math.min(high, val));
}

/**
 * Sample vector of PERT variates
 */
export function samplePertVector(
  estimate: ThreePointEstimate,
  count: number,
  randomFn = Math.random
): Float64Array {
  const result = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = samplePert(estimate, randomFn);
  }
  return result;
}

/**
 * Sample Poisson random variate
 */
export function samplePoisson(lambda: number, randomFn = Math.random): number {
  if (lambda <= 0) return 0;
  if (lambda < 30) {
    const L = Math.exp(-lambda);
    let k = 0;
    let p = 1;
    do {
      k++;
      p *= randomFn();
    } while (p > L);
    return k - 1;
  }
  // Gaussian approximation for large lambda
  const z = sampleStandardNormal(randomFn);
  const val = Math.round(lambda + Math.sqrt(lambda) * z);
  return Math.max(0, val);
}

/**
 * Sample Binomial random variate (n events with probability p)
 */
export function sampleBinomial(n: number, p: number, randomFn = Math.random): number {
  if (n <= 0 || p <= 0) return 0;
  if (p >= 1) return n;

  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (randomFn() < p) {
      successes++;
    }
  }
  return successes;
}

/**
 * Fast Quantile / Percentile calculation on sorted or unsorted float array
 */
export function calculatePercentiles(data: Float64Array | number[]): PercentileStats {
  const arr = Array.isArray(data) ? new Float64Array(data) : data.slice();
  const n = arr.length;
  if (n === 0) {
    return {
      min: 0,
      p05: 0,
      p10: 0,
      p25: 0,
      p50: 0,
      mean: 0,
      p75: 0,
      p90: 0,
      p95: 0,
      p99: 0,
      max: 0,
      stdDev: 0
    };
  }

  // Sort array in ascending order
  arr.sort();

  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += arr[i];
  }
  const mean = sum / n;

  let varianceSum = 0;
  for (let i = 0; i < n; i++) {
    varianceSum += Math.pow(arr[i] - mean, 2);
  }
  const stdDev = Math.sqrt(varianceSum / n);

  const getQuantile = (q: number): number => {
    if (q <= 0) return arr[0];
    if (q >= 1) return arr[n - 1];
    const index = q * (n - 1);
    const low = Math.floor(index);
    const high = Math.ceil(index);
    const weight = index - low;
    return arr[low] * (1 - weight) + arr[high] * weight;
  };

  return {
    min: arr[0],
    p05: getQuantile(0.05),
    p10: getQuantile(0.10),
    p25: getQuantile(0.25),
    p50: getQuantile(0.50),
    mean,
    p75: getQuantile(0.75),
    p90: getQuantile(0.90),
    p95: getQuantile(0.95),
    p99: getQuantile(0.99),
    max: arr[n - 1],
    stdDev
  };
}

/**
 * Generate frequency histogram bins with cumulative frequency S-curve
 */
export function generateHistogram(
  data: Float64Array | number[],
  numBins = 30,
  currency = '$',
  scaleUnit = 1
): HistogramBin[] {
  const arr = Array.isArray(data) ? new Float64Array(data) : data;
  const n = arr.length;
  if (n === 0) return [];

  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < n; i++) {
    if (arr[i] < min) min = arr[i];
    if (arr[i] > max) max = arr[i];
  }

  if (min === max) {
    return [{
      binMin: min,
      binMax: max,
      binLabel: formatAmount(min, currency, scaleUnit),
      count: n,
      frequency: 1,
      cumulativeFrequency: 100
    }];
  }

  const binWidth = (max - min) / numBins;
  const bins: HistogramBin[] = [];

  for (let i = 0; i < numBins; i++) {
    const bMin = min + i * binWidth;
    const bMax = i === numBins - 1 ? max : min + (i + 1) * binWidth;
    bins.push({
      binMin: bMin,
      binMax: bMax,
      binLabel: `${formatAmount(bMin, currency, scaleUnit)}`,
      count: 0,
      frequency: 0,
      cumulativeFrequency: 0
    });
  }

  for (let i = 0; i < n; i++) {
    const val = arr[i];
    let binIdx = Math.floor((val - min) / binWidth);
    if (binIdx >= numBins) binIdx = numBins - 1;
    if (binIdx < 0) binIdx = 0;
    bins[binIdx].count++;
  }

  let runningCount = 0;
  for (let i = 0; i < numBins; i++) {
    bins[i].frequency = bins[i].count / n;
    runningCount += bins[i].count;
    bins[i].cumulativeFrequency = (runningCount / n) * 100;
  }

  return bins;
}

/**
 * Format currency amounts with clean abbreviations ($k, $M, $B)
 */
export function formatAmount(
  amount: number,
  currency = '$',
  unitScale = 1
): string {
  const scaled = amount * unitScale;
  if (isNaN(scaled)) return `${currency}0`;
  
  if (Math.abs(scaled) >= 1_000_000_000) {
    return `${currency}${(scaled / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(scaled) >= 1_000_000) {
    return `${currency}${(scaled / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(scaled) >= 1_000) {
    return `${currency}${(scaled / 1_000).toFixed(1)}k`;
  }
  if (Math.abs(scaled) < 1 && Math.abs(scaled) > 0) {
    return `${currency}${scaled.toFixed(2)}`;
  }
  return `${currency}${Math.round(scaled).toLocaleString()}`;
}

/**
 * PRNG with custom seed (Xorshift128+) for reproducible air-gapped simulation runs
 */
export class SeededRandom {
  private s0: number;
  private s1: number;

  constructor(seed = 123456789) {
    this.s0 = seed >>> 0 || 123456789;
    this.s1 = (seed * 1812433253 + 1) >>> 0 || 362436069;
  }

  public next(): number {
    let s1 = this.s0;
    const s0 = this.s1;
    this.s0 = s0;
    s1 ^= s1 << 23;
    this.s1 = s1 ^ s0 ^ (s1 >>> 17) ^ (s0 >>> 26);
    return ((this.s1 + s0) >>> 0) / 4294967296;
  }
}
