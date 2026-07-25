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
