import { appUrl } from './sender.js';

export function bookingRequestEmail(p: {
  lenderName: string;
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
}): { subject: string; html: string } {
  return {
    subject: `New rental request for "${p.listingTitle}"`,
    html: `
      <p>Hi ${p.lenderName},</p>
      <p><strong>${p.renterName}</strong> has requested to rent your item
         <strong>${p.listingTitle}</strong> from ${p.startDate} to ${p.endDate}.</p>
      <p><a href="${appUrl}/bookings">Review the request →</a></p>
      <p>— StuFlux</p>
    `,
  };
}

export function bookingConfirmedEmail(p: {
  renterName: string;
  listingTitle: string;
  lenderName: string;
  startDate: string;
  endDate: string;
}): { subject: string; html: string } {
  return {
    subject: `Your booking for "${p.listingTitle}" is confirmed!`,
    html: `
      <p>Hi ${p.renterName},</p>
      <p><strong>${p.lenderName}</strong> confirmed your rental of
         <strong>${p.listingTitle}</strong> from ${p.startDate} to ${p.endDate}.</p>
      <p><a href="${appUrl}/bookings">View booking details →</a></p>
      <p>— StuFlux</p>
    `,
  };
}

export function bookingRejectedEmail(p: {
  renterName: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
}): { subject: string; html: string } {
  return {
    subject: `Rental request for "${p.listingTitle}" was declined`,
    html: `
      <p>Hi ${p.renterName},</p>
      <p>Your rental request for <strong>${p.listingTitle}</strong>
         (${p.startDate} – ${p.endDate}) was not accepted.</p>
      <p><a href="${appUrl}/explore">Browse other listings →</a></p>
      <p>— StuFlux</p>
    `,
  };
}