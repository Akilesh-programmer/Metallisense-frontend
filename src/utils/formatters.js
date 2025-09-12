// Small formatting helpers for numbers and percentages
export const formatNumber = (value, maxDecimals = 2) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
  return formatter.format(num);
};

export const formatPercent = (value, maxDecimals = 2) => {
  if (value === null || value === undefined || value === "") return "-";
  const num = Number(value);
  if (Number.isNaN(num)) return "-";
  return `${formatNumber(num, maxDecimals)}%`;
};

export const formatRange = (range, maxDecimals = 2) => {
  if (!range || !Array.isArray(range) || range.length < 2) return "-";
  const [low, high] = range;
  return `${formatPercent(low, maxDecimals)} - ${formatPercent(
    high,
    maxDecimals
  )}`;
};

export default {
  formatNumber,
  formatPercent,
  formatRange,
};
