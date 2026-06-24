import { Injectable } from '@angular/core';
import { MetricData, MetricPoint, AppMetricGroup } from '../models/metric-data';

@Injectable({ providedIn: 'root' })
export class MetricDataService {
  /**
   * Generate realistic metric data for demo purposes.
   * Time window: 24 hours centered around the given event time.
   */
  generateMetrics(eventTime: Date, granularityMinutes: number): MetricData[] {
    const timestamps = this.buildTimestamps(eventTime, granularityMinutes);

    return [
      this.buildMetric('cpu', 'CPU使用率', '%', timestamps, 100, 20, 65, 15, '#A78BFA'),
      this.buildMetric('memory', '内存使用率', '%', timestamps, 100, 65, 95, 5, '#EF4444', true),
      this.buildMetric('disk-io', '磁盘 I/O', 'IOPS', timestamps, 500, 50, 350, 80, '#A78BFA'),
      this.buildMetric('disk-read-iops', '磁盘读取 IOPS', 'IOPS', timestamps, 300, 10, 120, 30, '#A78BFA'),
      this.buildMetric('disk-write-iops', '磁盘写入 IOPS', 'IOPS', timestamps, 300, 5, 100, 25, '#A78BFA'),
      this.buildMetric('disk-read-latency', '磁盘读取延迟', 'ms', timestamps, 50, 1, 15, 5, '#A78BFA'),
      this.buildMetric('disk-write-latency', '磁盘写入延迟', 'ms', timestamps, 50, 1, 10, 3, '#A78BFA'),
      this.buildMetric('disk-avg-queue', '磁盘平均等待队列长度', '', timestamps, 20, 0, 8, 2, '#A78BFA'),
    ];
  }

  /**
   * Generate per-app metric groups for demo purposes.
   */
  generateAppMetrics(
    eventTime: Date,
    granularityMinutes: number,
    apps: { id: string; name: string; version: string }[]
  ): AppMetricGroup[] {
    const timestamps = this.buildTimestamps(eventTime, granularityMinutes);

    return apps.map((app) => {
      // Per-app metrics: cpu, memory + handles, processes
      const metrics: MetricData[] = [
        this.buildMetric(`app-cpu-${app.id}`, '应用 CPU 使用率', '%', timestamps, 100, 0, 30, 10, '#A78BFA'),
        this.buildMetric(`app-memory-${app.id}`, '应用内存使用率', '%', timestamps, 100, 10, 60, 5, '#EF4444'),
        this.buildMetric(`app-handles-${app.id}`, '句柄总数', '', timestamps, 5000, 500, 2000, 10, '#60A5FA'),
        this.buildMetric(`app-processes-${app.id}`, '进程数量', '', timestamps, 50, 1, 10, 15, '#34D399'),
      ];

      return {
        appId: app.id,
        appName: app.name,
        appVersion: app.version,
        metrics,
        isExpanded: false,
      };
    });
  }

  /** Build uniform timestamps array for a 24h window. */
  private buildTimestamps(eventTime: Date, granularityMinutes: number): number[] {
    const pointsCount = Math.floor((24 * 60) / granularityMinutes);
    const endTime = eventTime.getTime();
    const startTime = endTime - 24 * 60 * 60 * 1000;
    const intervalMs = granularityMinutes * 60 * 1000;

    const timestamps: number[] = [];
    for (let i = 0; i <= pointsCount; i++) {
      timestamps.push(startTime + i * intervalMs);
    }
    return timestamps;
  }

  /** Build one metric with randomized but semi-realistic data. */
  private buildMetric(
    id: string,
    name: string,
    unit: string,
    timestamps: number[],
    maxValue: number,
    baselineMin: number,
    baselineMax: number,
    spikeChance: number,
    color: string,
    isAlert = false
  ): MetricData {
    const points: MetricPoint[] = timestamps.map((ts) => ({
      timestamp: ts,
      value: this.clamp(this.randomInRange(baselineMin, baselineMax) + (Math.random() < spikeChance / 100 ? this.randomInRange(baselineMax, maxValue) : 0), 0, maxValue),
    }));
    return { id, name, unit, points, maxValue, isAlert, color };
  }

  private randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }

  private clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v));
  }
}