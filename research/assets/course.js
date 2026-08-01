document.addEventListener('click',event=>{
  const button=event.target.closest('[data-answer]');
  if(!button)return;
  const quiz=button.closest('.quiz');
  const buttons=[...quiz.querySelectorAll('[data-answer]')];
  buttons.forEach(item=>{item.disabled=true;item.classList.add(item.dataset.answer==='correct'?'correct':'wrong')});
  const feedback=quiz.querySelector('.feedback');
  const right=button.dataset.answer==='correct';
  feedback.textContent=right?'Correct. '+quiz.dataset.correct:'Not quite. '+quiz.dataset.retry;
  feedback.style.color=right?'var(--mint)':'var(--amber)';
});

/* Facility chrome for the academy wing: wordmark links home, every lesson gets
   a one-tap path to today's reading + the standard closing line. */
document.addEventListener('DOMContentLoaded',()=>{
  const brand=document.querySelector('.brand');
  if(brand&&!brand.closest('a')){
    const a=document.createElement('a');
    a.href='../../index.html';a.style.textDecoration='none';a.style.color='inherit';
    brand.parentNode.insertBefore(a,brand);a.appendChild(brand);
  }
  const nav=document.querySelector('header .nav');
  if(nav&&!document.getElementById('todayLink')){
    nav.insertAdjacentHTML('beforeend','<a id="todayLink" href="../../index.html" style="border:1px solid var(--line2);border-radius:6px;padding:7px 13px;text-decoration:none;font-size:.72rem;letter-spacing:.12em;white-space:nowrap">🫙 TODAY\'S READING</a>');
  }
  if(!document.querySelector('main > footer')){
    document.querySelector('main').insertAdjacentHTML('beforeend',
      '<footer>OOZE ACADEMY is the training wing of <a href="../../index.html">OOZEMeter — Division of Economic Containment</a>. Lessons teach the instruments; the <a href="../../index.html">jar</a> holds the reading. Not financial advice.</footer>');
  }
});
