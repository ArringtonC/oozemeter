#!/usr/bin/env node
/* The Morning Specimen sender — OOZEBOT's newsletter (data/editorial.json)
   → Buttondown. Needs BUTTONDOWN_API_KEY in the env; exits quietly without it
   so the cron can carry this step before the account exists.

   Creates a DRAFT by default (operator reviews + sends in Buttondown).
   Set BUTTONDOWN_AUTOSEND=1 to send without review once trust is earned.

   Refuses to send the same monthly seal twice (data/newsletter-log.json).
   Wire into the cron after the seal step once the data session's workflow
   batch lands. */
const fs=require('fs');

const KEY=process.env.BUTTONDOWN_API_KEY;
if(!KEY){console.log('send-newsletter: BUTTONDOWN_API_KEY not set — no ESP connected, skipping');process.exit(0)}

const d=JSON.parse(fs.readFileSync('data/editorial.json','utf8'));
if(!d.newsletter){console.error('send-newsletter: editorial payload has no newsletter text');process.exit(1)}

let log={};try{log=JSON.parse(fs.readFileSync('data/newsletter-log.json','utf8'))}catch{}
if(log[d.month]){console.log(`send-newsletter: ${d.month} already handled ${log[d.month]} — skipping`);process.exit(0)}

const [subject,...rest]=d.newsletter.split('\n');
const autosend=process.env.BUTTONDOWN_AUTOSEND==='1';

fetch('https://api.buttondown.com/v1/emails',{
  method:'POST',
  headers:{Authorization:`Token ${KEY}`,'Content-Type':'application/json'},
  body:JSON.stringify({
    subject:subject.trim(),
    body:rest.join('\n').trim(),
    status:autosend?'about_to_send':'draft',
  }),
}).then(async r=>{
  if(!r.ok)throw new Error(`${r.status} ${await r.text()}`);
  log[d.month]=new Date().toISOString().slice(0,10);
  fs.writeFileSync('data/newsletter-log.json',JSON.stringify(log,null,2)+'\n');
  console.log(`send-newsletter: ${autosend?'sent':'drafted'} "${subject.trim()}" for ${d.month}`);
}).catch(e=>{console.error('send-newsletter: FAILED —',e.message);process.exit(1)});
