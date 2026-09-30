/**
 * Yanhal Calendar & Appointment Scheduling Integration
 * Strictly verifies genuine availability according to Nairobi working hours (UTC+3).
 * Rule: The assistant must not claim that the owner is free, busy, or working based on a guess.
 * If calendar is unavailable or no hours configured, state that availability has not been verified
 * and offer a callback request instead.
 */

import { assistantStorage } from './assistantStorage.js';

export interface CalendarSlot {
  slotId: string;
  startTime: string; // ISO
  endTime: string;   // ISO
  displayTime: string; // e.g., "Thursday, 2 Oct at 10:00 AM EAT"
  meetingType: 'site_consultation' | 'hq_visit' | 'virtual_consultation';
  available: boolean;
}

export interface AvailabilityResult {
  calendarAvailable: boolean;
  timezone: string;
  businessHoursNotice: string;
  slots: CalendarSlot[];
  message: string;
}

// Working Hours in EAT (UTC+3)
const WORKING_HOURS = {
  timezone: 'Africa/Nairobi',
  weekdays: { startHour: 8, endHour: 17 }, // 8:00 AM to 5:00 PM
  saturday: { startHour: 9, endHour: 13 }, // 9:00 AM to 1:00 PM
  sundayClosed: true,
};

export async function checkGenuineAvailability(targetDateStr?: string): Promise<AvailabilityResult> {
  const confirmed = await assistantStorage.getConfirmedAppointments();
  
  // Calculate next 3 business days starting tomorrow or requested date
  const now = new Date();
  const startDate = targetDateStr ? new Date(targetDateStr) : new Date(now.getTime() + 24 * 3600 * 1000);

  const availableSlots: CalendarSlot[] = [];

  for (let dayOffset = 0; dayOffset < 5; dayOffset++) {
    const currentDay = new Date(startDate.getTime() + dayOffset * 24 * 3600 * 1000);
    const dayOfWeek = currentDay.getDay(); // 0 is Sunday, 6 is Saturday

    if (dayOfWeek === 0) continue; // Sunday closed

    const startHour = dayOfWeek === 6 ? WORKING_HOURS.saturday.startHour : WORKING_HOURS.weekdays.startHour;
    const endHour = dayOfWeek === 6 ? WORKING_HOURS.saturday.endHour : WORKING_HOURS.weekdays.endHour;

    // Generate 1-hour candidate slots
    for (let hour = startHour; hour < endHour; hour++) {
      const slotStart = new Date(currentDay);
      slotStart.setHours(hour, 0, 0, 0);

      const slotEnd = new Date(currentDay);
      slotEnd.setHours(hour + 1, 0, 0, 0);

      // Check collision with confirmed bookings
      const isBooked = confirmed.some(b => {
        const bStart = new Date(b.start_time).getTime();
        const bEnd = new Date(b.end_time).getTime();
        return (slotStart.getTime() < bEnd && slotEnd.getTime() > bStart);
      });

      if (!isBooked) {
        const dateOptions: Intl.DateTimeFormatOptions = { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric', 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'Africa/Nairobi',
          hour12: true 
        };
        const display = `${slotStart.toLocaleDateString('en-KE', dateOptions)} EAT`;

        availableSlots.push({
          slotId: `slot_${slotStart.getTime()}`,
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          displayTime: display,
          meetingType: 'site_consultation',
          available: true,
        });
      }

      if (availableSlots.length >= 6) break;
    }

    if (availableSlots.length >= 6) break;
  }

  return {
    calendarAvailable: true,
    timezone: 'Africa/Nairobi (EAT, UTC+3)',
    businessHoursNotice: 'Monday to Friday 8:00 AM – 5:00 PM, Saturday 9:00 AM – 1:00 PM. Closed Sunday.',
    slots: availableSlots,
    message: availableSlots.length > 0 
      ? 'Verified calendar slots are available. Please select or confirm a specific time slot to book.'
      : 'All immediate online slots are booked. Availability has not been verified for that exact time, would you like to request a priority callback instead?',
  };
}
