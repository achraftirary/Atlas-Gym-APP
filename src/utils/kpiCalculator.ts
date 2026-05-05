/**
 * KPI and metrics calculation utilities
 */

export interface KPIData {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercent?: number;
  tooltip?: string;
}

export const calculatePaymentKPIs = (payments: any[]): KPIData[] => {
  const totalAmount = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const paidAmount = payments
    .filter((p) => p.status === 'Paid')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const pendingAmount = payments
    .filter((p) => p.status !== 'Paid')
    .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const collectionRate = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return [
    {
      label: 'Total Collections',
      value: `$${totalAmount.toFixed(2)}`,
      trend: 'up',
      tooltip: 'All time total from all payments',
    },
    {
      label: 'Paid Invoices',
      value: `$${paidAmount.toFixed(2)}`,
      trend: 'up',
      tooltip: 'Successfully collected payments',
    },
    {
      label: 'Pending',
      value: `$${pendingAmount.toFixed(2)}`,
      trend: pendingAmount > 0 ? 'down' : 'neutral',
      tooltip: 'Awaiting payment',
    },
    {
      label: 'Collection Rate',
      value: `${collectionRate.toFixed(1)}%`,
      trend: collectionRate > 80 ? 'up' : collectionRate > 60 ? 'neutral' : 'down',
      tooltip: 'Percentage of invoices collected',
    },
  ];
};

export const calculateAttendanceKPIs = (attendance: any[]): KPIData[] => {
  const totalCheckIns = attendance.length;
  const uniqueMembers = new Set(attendance.map((a) => a.member)).size;
  const todayCheckIns = attendance.filter((a) => {
    const date = new Date(a.time);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }).length;
  const avgCheckInsPerMember = uniqueMembers > 0 ? (totalCheckIns / uniqueMembers).toFixed(1) : 0;

  return [
    {
      label: 'Total Check-ins',
      value: totalCheckIns,
      trend: 'up',
      tooltip: 'Lifetime attendance records',
    },
    {
      label: 'Active Members',
      value: uniqueMembers,
      trend: 'up',
      tooltip: 'Members who checked in',
    },
    {
      label: "Today's Attendance",
      value: todayCheckIns,
      trend: 'neutral',
      tooltip: 'Check-ins today',
    },
    {
      label: 'Avg per Member',
      value: avgCheckInsPerMember,
      trend: 'neutral',
      tooltip: 'Average check-ins per member',
    },
  ];
};

export const calculateClassKPIs = (classes: any[]): KPIData[] => {
  const totalClasses = classes.length;
  const totalCapacity = classes.reduce((sum, c) => sum + (parseInt(c.spots || '0') || 0), 0);
  const uniqueCoaches = new Set(classes.map((c) => c.coach)).size;
  const avgCapacity = totalClasses > 0 ? (totalCapacity / totalClasses).toFixed(0) : 0;

  return [
    {
      label: 'Total Classes',
      value: totalClasses,
      trend: 'up',
      tooltip: 'Total sessions scheduled',
    },
    {
      label: 'Total Capacity',
      value: totalCapacity,
      trend: 'up',
      tooltip: 'Total available spots',
    },
    {
      label: 'Unique Coaches',
      value: uniqueCoaches,
      trend: 'neutral',
      tooltip: 'Different instructors',
    },
    {
      label: 'Avg Class Size',
      value: avgCapacity,
      trend: 'neutral',
      tooltip: 'Average spots per class',
    },
  ];
};

export const calculateLeadKPIs = (leads: any[]): KPIData[] => {
  const totalLeads = leads.length;
  const convertedLeads = leads.filter((l) => l.stage === 'Member').length;
  const conversionRateNum = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100) : 0;
  const conversionRate = conversionRateNum.toFixed(1);
  const trialStage = leads.filter((l) => l.stage?.includes('Trial')).length;

  return [
    {
      label: 'Total Leads',
      value: totalLeads,
      trend: 'up',
      tooltip: 'All prospective or current members',
    },
    {
      label: 'Converted',
      value: convertedLeads,
      trend: 'up',
      tooltip: 'Leads that became members',
    },
    {
      label: 'Trial Bookings',
      value: trialStage,
      trend: 'up',
      tooltip: 'Scheduled trial sessions',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      trend: Number(conversionRate) > 50 ? 'up' : 'neutral',
      tooltip: 'Percentage of leads converted',
    },
  ];
};

export const calculateMembershipKPIs = (memberships: any[]): KPIData[] => {
  const activeMemberships = memberships.filter((m) => m.status === 'active').length;
  const expiredMemberships = memberships.filter((m) => m.status === 'expired').length;
  const totalValue = memberships.reduce((sum, m) => sum + (parseFloat(m.price) || 0), 0);
  const activationRateNum = memberships.length > 0 ? ((activeMemberships / memberships.length) * 100) : 0;
  const activationRate = activationRateNum.toFixed(1);

  return [
    {
      label: 'Active Memberships',
      value: activeMemberships,
      trend: 'up',
      tooltip: 'Current active plans',
    },
    {
      label: 'Expired',
      value: expiredMemberships,
      trend: expiredMemberships > 0 ? 'down' : 'neutral',
      tooltip: 'Lapsed memberships',
    },
    {
      label: 'Total MRR',
      value: `$${totalValue.toFixed(2)}`,
      trend: 'up',
      tooltip: 'Monthly recurring revenue',
    },
    {
      label: 'Activation Rate',
      value: `${activationRate}%`,
      trend: Number(activationRate) > 70 ? 'up' : 'neutral',
      tooltip: 'Active vs total memberships',
    },
  ];
};

export const calculateTrainerKPIs = (trainers: any[]): KPIData[] => {
  const totalTrainers = trainers.length;
  const avgRating = trainers.length > 0 
    ? (trainers.reduce((sum, t) => sum + (parseFloat(t.rating) || 0), 0) / trainers.length).toFixed(1)
    : 0;
  const availableTrainers = trainers.filter((t) => t.availability === 'Available').length;

  return [
    {
      label: 'Total Staff',
      value: totalTrainers,
      trend: 'up',
      tooltip: 'Total instructors',
    },
    {
      label: 'Available Now',
      value: availableTrainers,
      trend: availableTrainers > 0 ? 'up' : 'neutral',
      tooltip: 'Ready to take classes',
    },
    {
      label: 'Avg Rating',
      value: `${avgRating}⭐`,
      trend: parseFloat(avgRating as string) > 4 ? 'up' : 'neutral',
      tooltip: 'Average trainer satisfaction',
    },
    {
      label: 'Specialties',
      value: new Set(trainers.map((t) => t.specialty)).size,
      trend: 'up',
      tooltip: 'Different specializations',
    },
  ];
};

export const getStatusTrend = (current: number, previous?: number): KPIData['trend'] => {
  if (!previous) return 'neutral';
  if (current > previous) return 'up';
  if (current < previous) return 'down';
  return 'neutral';
};
