/**
 * Yanhal Assistant Performance & Conversion Metrics Service
 * Tracks response latency, controlled action success rates, summary accuracy, and booking completion.
 */

export interface AssistantMetricEntry {
  id: string;
  timestamp: string;
  metricType: 'latency' | 'action_success' | 'summary_accuracy' | 'booking_completion';
  name: string;
  value: number; // e.g. milliseconds for latency, 1 or 0 for boolean success, percentage
  metadata?: Record<string, any>;
}

const metricsLog: AssistantMetricEntry[] = [];

export const metricsService = {
  recordLatency(actionName: string, durationMs: number, metadata?: Record<string, any>) {
    metricsLog.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metricType: 'latency',
      name: actionName,
      value: durationMs,
      metadata,
    });
  },

  recordActionSuccess(actionName: string, success: boolean, metadata?: Record<string, any>) {
    metricsLog.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metricType: 'action_success',
      name: actionName,
      value: success ? 1 : 0,
      metadata,
    });
  },

  recordSummaryAccuracy(enquiryId: string, accuracyScore: number, metadata?: Record<string, any>) {
    metricsLog.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metricType: 'summary_accuracy',
      name: 'summary_fact_validation',
      value: accuracyScore,
      metadata: { enquiryId, ...metadata },
    });
  },

  recordBookingCompletion(appointmentId: string, completed: boolean, metadata?: Record<string, any>) {
    metricsLog.push({
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metricType: 'booking_completion',
      name: 'consultation_booking',
      value: completed ? 1 : 0,
      metadata: { appointmentId, ...metadata },
    });
  },

  getReport() {
    const latencies = metricsLog.filter(m => m.metricType === 'latency');
    const actions = metricsLog.filter(m => m.metricType === 'action_success');
    const summaries = metricsLog.filter(m => m.metricType === 'summary_accuracy');
    const bookings = metricsLog.filter(m => m.metricType === 'booking_completion');

    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((acc, l) => acc + l.value, 0) / latencies.length) 
      : 0;

    const actionSuccessRate = actions.length > 0
      ? Math.round((actions.filter(a => a.value === 1).length / actions.length) * 100)
      : 100;

    const bookingRate = bookings.length > 0
      ? Math.round((bookings.filter(b => b.value === 1).length / bookings.length) * 100)
      : 0;

    const avgAccuracy = summaries.length > 0
      ? Math.round(summaries.reduce((acc, s) => acc + s.value, 0) / summaries.length)
      : 100;

    return {
      totalMetricsLogged: metricsLog.length,
      averageLatencyMs: avgLatency,
      actionSuccessRatePercent: actionSuccessRate,
      bookingCompletionRatePercent: bookingRate,
      averageSummaryAccuracyPercent: avgAccuracy,
      recentEntries: metricsLog.slice(-15),
    };
  }
};
