const compactNumberFormatter = new Intl.NumberFormat(undefined, {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat();

export function formatNumber(value: number, compact = false): string {
  return compact ? compactNumberFormatter.format(value) : numberFormatter.format(value);
}