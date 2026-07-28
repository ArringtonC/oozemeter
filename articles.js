/* OOZEONOMICS article store — plain data, one object per article.
   Seed articles are drafted by the facility from live data (numbers checked
   against data/latest.json and the backtest). Operator articles mix in here.
   Fields: slug, cat (report|incident|explainer|manual), date, title, dek,
   keyPoints[], body[] (paragraphs; lines starting "## " render as h3). */
window.ARTICLES = [
{slug:'june-2026-seal',cat:'report',month:'2026-06',date:'2026-07-24',title:'June seals at 27: the jar drains 3 points',
 dek:'Gas and inflation eased at the same time — the biggest one-month relief since the winter.',
 keyPoints:[
  'The June 2026 Ooze Level sealed at 27 (Sticky), down 3 points from May\'s 30.',
  'Gas pressure fell 11 points and inflation eased 9 — the two biggest movers.',
  'Employment remains the calmest line on the board at 14.'],
 body:[
  'The monthly specimen sealed in mid-July, once the jobs report and CPI landed, and the reading is the friendliest since spring: 27 out of 100. That is Sticky territory — the band where normal economies live — and 3 points below May. June\'s reading is calmer than six of every ten months since 2003.',
  'The relief came from the two lines everyone feels first. Gas pressure dropped 11 points as pump prices steadied around $4.00, and inflation eased 9 as the yearly price change cooled to 3.5%. When the first link of the cascade relaxes, the whole chain breathes.',
  '## What\'s still pressing',
  'Housing remains the heaviest weight on the board — mortgage rates at 6.58% keep affordability pressure in the mid-40s. Auto-loan delinquency, on the truer New York Fed measure the lab now uses, reads hotter than the old proxy suggested. Credit card delinquency sits at 2.9% — higher than the unusually calm pandemic years, but not historically exceptional.',
  'Employment is the reason the jar stays calm. Unemployment held at 4.2%, and weekly jobless claims stayed quiet. Together they kept the employment line at just 14 — the calmest reading on the board. As the Lab Notes put it: recessions are employment events, and there isn\'t one in this data.',
  '## What a household would notice',
  'For most households, June probably felt a little easier than May. Filling the tank hurt less, grocery prices weren\'t rising as quickly, and steady employment kept paychecks coming. Housing remained the biggest source of strain, but for many families the month ended with a little more breathing room than it began.',
  'The next specimen seals in mid-August, when July\'s jobs report and CPI complete the month. The jar updates itself; you just check it.']},

  {slug:'oozemaxing-near-miss',cat:'incident',date:'2026-07-25',title:'2008 missed OOZEMAXING by exactly one line',
 dek:'The backtest found something nobody knew: even the Great Financial Crisis never tripped the everything-fails-at-once alarm.',
 keyPoints:[
  'OOZEMAXING requires all six weighted lines to read 60+ simultaneously. It has never happened in 25 years of data.',
  'At the GFC\'s worst (June 2009), five of six lines crossed 60.',
  'The holdout was inflation — deflation held the line at 55 and kept the declaration off the board.'],
 body:[
  'When the facility defined OOZEMAXING — the breadth condition where every weighted intake line reads elevated at once — we assumed 2008 had obviously met it. Then we ran the numbers.',
  'June 2009, the worst month in the backtest, scores a calibrated 90: credit at 90, housing at 87, autos at 85, employment at 78, gas at 62. Five of six lines deep in failure. And the sixth?',
  '## The line that held',
  'Inflation — at stress 55. Not because prices were stable, but because they were falling. Deflation is its own kind of economic sickness, and the U-shaped inflation curve scores it as stress — but at 55, five points shy of the threshold. The Great Financial Crisis, the collapse that defines this meter\'s ceiling, missed the total-failure condition by one line and five points.',
  'That is why the facility can say something no other economic dashboard can: OOZEMAXING has never been declared. Not in 2008. Not in 2020. If this facility ever declares it, it will not be hype — it will be a first in modern history.',
  'Every number in this file is reproducible from the public backtest. Check us.']},

{slug:'vibecession-measured',cat:'explainer',date:'2026-07-25',title:'The vibecession, measured: why 2022 only scored 27',
 dek:'Everyone hated that economy. The cascade data says households mostly held. Both things are true.',
 keyPoints:[
  'The 2022 inflation surge peaked with CPI at 9.1% — the fastest since 1981.',
  'The Ooze peaked at just 27 that year, barely above today\'s reading.',
  'The gap between feelings and cascade data is what "vibecession" actually means.'],
 body:[
  'June 2022: inflation hits 9.1%, gas passes $5, consumer sentiment prints its worst reading ever recorded. And the Ooze Level reads... 27.',
  'That number offends people. It felt so much worse. But the meter doesn\'t measure feelings — it measures the cascade: are households missing payments, losing cars, losing jobs, losing homes? In 2022, mostly, they weren\'t. Unemployment sat under 4%. Delinquencies were near record lows, still suppressed by pandemic savings. The bills were infuriating, and they were getting paid.',
  '## What the gap teaches',
  'Economists later named the phenomenon a vibecession — sentiment collapsing while the real economy held. OOZEMeter\'s 2022 reading is that concept with a number on it. The anger was real; the cascade failure never came. Prices are a tax on happiness before they are a tax on solvency.',
  'This is the meter\'s core discipline, and it cuts both ways: it refused to panic in 2022, and it refused to celebrate in April 2010, when the reading was still elevated at 74 while headlines had moved on. Feelings lead; the cascade lags; the jar reports the cascade.']},

{slug:'what-is-oozeonomics',cat:'manual',date:'2026-07-26',title:'What is Oozeonomics?',
 dek:'The study of economic slime: how stress actually moves through household budgets, measured instead of narrated.',
 keyPoints:[
  'Oozeonomics is the facility\'s discipline: economics through the cascade, in plain language, from public data.',
  'Core doctrine: markets are not the economy; feelings are not the cascade; every number must be reproducible.',
  'This section mixes facility reports (from live data) with operator dispatches.'],
 body:[
  'Economics has a translation problem. The data lives in government spreadsheets; the narration lives in headlines optimized for alarm. Between them, a person just trying to answer "how bad is it, actually?" gets either jargon or panic.',
  'Oozeonomics is the facility\'s answer: study the slime. Follow stress the way it actually travels through a household — gas to credit card to car to job to house — and measure each link with public data anyone can check.',
  '## The three laws',
  'First: markets are not the economy. The dot-com crash vaporized trillions and the cascade barely moved; that is why there is no stock ticker in the formula. Second: feelings are not the cascade. 2022 proved a nation can be furious while solvent. Third: every number is reproducible. The anchors are published, the calibration is published, and any journalist with a free FRED key can rebuild the score to the digit.',
  'What appears in this section: monthly Specimen Reports when each reading seals, Incident Files when history gets re-examined, and explainers that turn one confusing economic idea at a time into plain language. Facility-drafted pieces are generated from live data and checked against it; operator dispatches are marked as such.',
  'The economy is a specimen. Watch it with us.']},
];
