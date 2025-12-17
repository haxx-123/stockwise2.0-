import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Double unit formatter: "X Box Y Bottle"
export const formatStock = (
  qtyLarge: number,
  qtySmall: number,
  unitLarge: string,
  unitSmall: string,
  conversionRate: number
) => {
  // Normalize if small units exceed conversion rate (optional, but good for display)
  // Logic: The DB stores raw numbers. We display them directly or normalized.
  // Requirement says "X 整 Y 散".
  return `${qtyLarge} ${unitLarge} ${qtySmall} ${unitSmall}`;
};

// Calculate total small units for sorting/math
export const getTotalSmallUnits = (large: number, small: number, rate: number) => {
  return (large * rate) + small;
};

// Simulated Face API delay helper
export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
