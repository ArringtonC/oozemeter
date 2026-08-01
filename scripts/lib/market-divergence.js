function fractionalYearToMonth(value) {
  if (!Number.isFinite(value)) throw new Error('History key must be finite');
  let year = Math.floor(value);
  let monthIndex = Math.round((value - year) * 12);
  if (monthIndex === 12) {
    year += 1;
    monthIndex = 0;
  }
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function alignHistories(marketMonthly, householdHistory) {
  const householdByMonth = new Map();
  for (const row of householdHistory || []) {
    if (!Array.isArray(row) || row.length < 2 || !Number.isFinite(row[0]) || !Number.isFinite(row[1])) continue;
    householdByMonth.set(fractionalYearToMonth(row[0]), row[1]);
  }
  return (marketMonthly || [])
    .filter(row => row && /^\d{4}-\d{2}$/.test(row.month) && Number.isFinite(row.score) && householdByMonth.has(row.month))
    .map(row => {
      const household = householdByMonth.get(row.month);
      return {
        month: row.month,
        market: row.score,
        household,
        divergence: row.score - household,
      };
    });
}

module.exports = {alignHistories, fractionalYearToMonth};
