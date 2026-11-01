// Navo - Utility functions

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

export function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  if (diffDays <= 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return formatDate(dateStr);
}

export function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

export function isUrgent(dateStr: string | null): boolean {
  const days = daysUntil(dateStr);
  return days !== null && days >= 0 && days <= 3;
}

export function getContentTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    opportunity: '💼',
    recipe: '🍳',
    place: '📍',
    tutorial: '📚',
    product: '🛍️',
    design: '🎨',
    event: '📅',
    other: '📌'
  };
  return icons[type] || '📌';
}

export function getIntentLabel(intent: string): string {
  const labels: Record<string, string> = {
    apply: 'Apply',
    visit: 'Visit',
    cook: 'Cook',
    learn: 'Learn',
    get_inspired: 'Get Inspired',
    buy: 'Buy',
    someday: 'Someday'
  };
  return labels[intent] || intent;
}

export function getContentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    opportunity: 'Opportunity',
    recipe: 'Recipe',
    place: 'Place',
    tutorial: 'Tutorial',
    product: 'Product',
    design: 'Design',
    event: 'Event',
    other: 'Other'
  };
  return labels[type] || type;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'text-stone-700 bg-stone-100',
    completed: 'text-emerald-700 bg-emerald-50',
    archived: 'text-stone-400 bg-stone-50',
    expired: 'text-red-600 bg-red-50'
  };
  return colors[status] || 'text-stone-500 bg-stone-100';
}

export function getDeadlineColor(dateStr: string | null): string {
  const days = daysUntil(dateStr);
  if (days === null) return 'text-stone-400';
  if (days < 0) return 'text-red-500';
  if (days <= 1) return 'text-red-600 font-semibold';
  if (days <= 3) return 'text-orange-600 font-medium';
  if (days <= 7) return 'text-amber-600';
  return 'text-stone-500';
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
