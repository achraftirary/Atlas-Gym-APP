export const overviewKpis = [
  { id: 'activeMembers', value: '426', delta: '+8.4%', trend: 'up' as const },
  { id: 'monthlyRevenue', value: '48,200 MAD', delta: '+5.1%', trend: 'up' as const },
  { id: 'checkinsToday', value: '132', delta: '-3.2%', trend: 'down' as const },
  { id: 'trialLeads', value: '24', delta: '+12%', trend: 'up' as const },
  { id: 'activeClasses', value: '18', delta: '+2', trend: 'up' as const },
  { id: 'staffOnShift', value: '12', delta: 'On time', trend: 'flat' as const }
];

export const classesToday = [
  { id: 1, name: 'HIIT Pulse', coach: 'Sara Benali', time: '08:30', spots: '12/18' },
  { id: 2, name: 'Strength Forge', coach: 'Youssef Amine', time: '12:00', spots: '9/16' },
  { id: 3, name: 'Mobility Flow', coach: 'Nadia Farah', time: '18:30', spots: '14/20' }
];

export const paymentQueue = [
  { id: 1, member: 'Imane Zahra', plan: 'Premium', amount: '650 MAD', status: 'Pending' },
  { id: 2, member: 'Omar El Idrissi', plan: 'Standard', amount: '420 MAD', status: 'Paid' },
  { id: 3, member: 'Salma Kara', plan: 'Elite', amount: '890 MAD', status: 'Pending' }
];

export const staffSchedule = [
  { id: 1, name: 'Hajar Ait', role: 'Front Desk', shift: '07:00 - 15:00' },
  { id: 2, name: 'Rachid Karim', role: 'Coach', shift: '12:00 - 20:00' },
  { id: 3, name: 'Nora Aziz', role: 'Physio', shift: '10:00 - 18:00' }
];

export const leadPipeline = [
  { id: 1, name: 'Samir O.', stage: 'Trial booked', owner: 'Amal' },
  { id: 2, name: 'Kenza D.', stage: 'Follow-up', owner: 'Hajar' },
  { id: 3, name: 'Rami L.', stage: 'Tour scheduled', owner: 'Salim' }
];

export const equipmentList = [
  { id: 1, name: 'Treadmill #4', status: 'In service', nextCheck: '2026-05-12' },
  { id: 2, name: 'Rowing Machine #2', status: 'Maintenance', nextCheck: '2026-05-06' },
  { id: 3, name: 'Cable Station', status: 'In service', nextCheck: '2026-05-15' }
];

export const branches = [
  { id: 1, name: 'Atlas Gym Downtown', city: 'Casablanca', members: 240 },
  { id: 2, name: 'Atlas Gym Marina', city: 'Rabat', members: 186 },
  { id: 3, name: 'Atlas Gym Summit', city: 'Marrakesh', members: 132 }
];

export const controlRoomSignals = [
  { id: 'occupancy', label: 'Live occupancy', value: '82%', detail: 'Peak window 18:00-20:00' },
  { id: 'collections', label: 'Today collections', value: '24,800 MAD', detail: '17 paid, 4 pending' },
  { id: 'retention', label: 'Retention', value: '96.4%', detail: '+2.1% vs last week' },
  { id: 'nps', label: 'Member NPS', value: '72', detail: 'Latest pulse survey' }
];

export const activityFeed = [
  { id: 1, title: 'New premium membership sold', subtitle: 'Imane Zahra • Elite annual • 2 min ago', tone: 'success' as const },
  { id: 2, title: 'Treadmill #4 flagged for service', subtitle: 'Maintenance automation • 11 min ago', tone: 'warning' as const },
  { id: 3, title: 'Trial lead booked a tour', subtitle: 'Samir O. • CRM stage advanced • 18 min ago', tone: 'info' as const },
  { id: 4, title: 'Morning class hit 96% capacity', subtitle: 'HIIT Pulse • 35 attendees today', tone: 'success' as const }
];

export const premiumActions = [
  { id: 1, label: 'Add member', hint: 'Fast onboarding' },
  { id: 2, label: 'Create membership', hint: 'Plan builder' },
  { id: 3, label: 'Open cash desk', hint: 'Quick collect' },
  { id: 4, label: 'Log check-in', hint: 'Attendance scan' }
];

export {};
