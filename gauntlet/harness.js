/* ============================================================
   THE GAUNTLET — adversarial critics for the Claim Gate.

   Ported from StockCharter's gauntlet/, where 22 standalone critics each test
   one way a trading system could be lying to itself. Same idea, different
   target: these try to make the Claim Gate approve a false economic statement.

   ONE INVERSION from the original. StockCharter's critics print for a human to
   judge. These EXIT NON-ZERO WHEN THE ATTACK SUCCEEDS, because a claim that
   slips past the gate is a defect, not an observation. A green gauntlet means
   every attack was refused.

   Each critic is standalone: `node gauntlet/critic_x.js`. Run them all with
   `node gauntlet/run.js`. A critic that finds something writes the attack, the
   false claim that would have shipped, and the root cause — the same shape the
   red-team brief asks for.
   ============================================================ */
const findings = [];

/* An attack SUCCEEDED means the gate let something through it should not have.
   Phrase every call so `pass` = the gate held. */
function attack(name, {input, expected, actual, falseClaim, rootCause}) {
  const held = JSON.stringify(expected) === JSON.stringify(actual);
  findings.push({name, held, input, expected, actual, falseClaim, rootCause});
  return held;
}

function report(critic) {
  const broke = findings.filter(f => !f.held);
  console.log(`\n${critic} — ${findings.length} attack(s), ${broke.length} succeeded`);
  for (const f of findings) {
    console.log(`  ${f.held ? '·  REFUSED' : '✗  BROKE  '} ${f.name}`);
    if (!f.held) {
      console.log(`       input       : ${JSON.stringify(f.input)}`);
      console.log(`       expected    : ${JSON.stringify(f.expected)}`);
      console.log(`       actual      : ${JSON.stringify(f.actual)}`);
      if (f.falseClaim) console.log(`       would ship  : ${f.falseClaim}`);
      if (f.rootCause) console.log(`       root cause  : ${f.rootCause}`);
    }
  }
  if (broke.length) {
    console.error(`\n${critic}: ${broke.length} attack(s) got through — these are defects.`);
    process.exit(1);
  }
  console.log(`${critic}: gate held.`);
}

module.exports = {attack, report, findings};
