'use strict';

const sourceBrain='https://www.ninds.nih.gov/sites/default/files/2025-05/know-your-brain-brian-basics.pdf';
const sourceNerve='https://medlineplus.gov/ency/anatomyvideos/000089.htm';
const concepts=[
  {id:'neuron',category:'Cells',title:'Neuron',hint:'The nervous system’s messenger.',detail:'Neurons are nerve cells that receive and transmit information. They communicate with other cells through electrical and chemical signals.',source:sourceNerve},
  {id:'dendrites',category:'Cells',title:'Dendrites',hint:'Branches that receive information.',detail:'Dendrites extend from a neuron and receive signals from other cells. These inputs help determine how the neuron responds.',source:sourceBrain},
  {id:'axon',category:'Cells',title:'Axon',hint:'A pathway for outgoing signals.',detail:'The axon carries electrical signals away from the neuron’s cell body towards its terminals and other cells.',source:sourceNerve},
  {id:'myelin',category:'Cells',title:'Myelin',hint:'Insulation for nerve fibres.',detail:'Myelin surrounds many axons and helps electrical signals travel more quickly along them.',source:'https://medlineplus.gov/ency/article/002344.htm'},
  {id:'synapse',category:'Cells',title:'Synapse',hint:'Where cells pass a signal along.',detail:'A synapse is a junction where a neuron communicates with another cell. At a chemical synapse, a signalling molecule crosses a tiny gap.',source:sourceBrain},
  {id:'neurotransmitter',category:'Cells',title:'Neurotransmitter',hint:'A chemical message between cells.',detail:'Neurotransmitters are chemicals released by a neuron that bind to receptors on a receiving cell, changing its activity.',source:sourceNerve},
  {id:'cerebrum',category:'Brain regions',title:'Cerebrum',hint:'The brain’s largest major part.',detail:'The cerebrum is involved in functions including thinking, interpreting sensory information and voluntary movement.',source:sourceBrain},
  {id:'cortex',category:'Brain regions',title:'Cerebral cortex',hint:'The folded outer layer.',detail:'The cerebral cortex is the outer layer of the cerebrum. Its many folds increase surface area, supporting complex functions.',source:sourceBrain},
  {id:'cerebellum',category:'Brain regions',title:'Cerebellum',hint:'A key player in coordination.',detail:'The cerebellum contributes to coordination, balance and the fine-tuning of movement.',source:sourceBrain},
  {id:'brainstem',category:'Brain regions',title:'Brainstem',hint:'A vital connection to the spinal cord.',detail:'The brainstem connects the brain with the spinal cord and helps regulate essential functions such as breathing and heart rate.',source:sourceBrain},
  {id:'hippocampus',category:'Brain regions',title:'Hippocampus',hint:'Important for learning and memory.',detail:'The hippocampus plays an important role in learning and forming memories.',source:sourceBrain},
  {id:'cns',category:'Systems',title:'Central nervous system',hint:'Brain and spinal cord, together.',detail:'The central nervous system consists of the brain and spinal cord. It works with the peripheral nervous system to receive and coordinate information.',source:'https://medlineplus.gov/ency/article/002311.htm'}
];
const regions={
  overview:{kicker:'YOUR OVERVIEW',title:'The whole picture',description:'Your brain is a wonderfully connected team. Its different regions work together to help you think, feel, move and make sense of the world.',fact:'The two cerebral hemispheres communicate with each other through a bundle of fibres called the corpus callosum.'},
  left:{kicker:'CEREBRAL HEMISPHERES',title:'Left cerebral hemisphere',description:'The cerebrum has two hemispheres, each containing frontal, parietal, temporal and occipital lobes. They work together across many functions.',fact:'A bundle of fibres called the corpus callosum helps the hemispheres communicate.'},
  right:{kicker:'CEREBRAL HEMISPHERES',title:'Right cerebral hemisphere',description:'The right cerebral hemisphere contains the same four broad lobes as the left. The two sides exchange information and work together.',fact:'Each cerebral hemisphere is involved in processing information from both sides of the body.'},
  frontal:{kicker:'THINKING & PLANNING',title:'Frontal lobe',description:'The frontal lobes contribute to planning, decision-making and voluntary movement. They sit toward the front of the cerebrum.',fact:'The motor cortex, near the back of each frontal lobe, helps plan and control voluntary movements.'},
  parietal:{kicker:'SENSATION & SPACE',title:'Parietal lobe',description:'The parietal lobes help process information about touch, temperature and the position of the body.',fact:'The somatosensory cortex receives information from different parts of the body.'},
  temporal:{kicker:'SOUND & MEMORY',title:'Temporal lobe',description:'The temporal lobes contribute to processing sounds and play an important part in forming and retrieving memories.',fact:'Auditory regions near the top of each temporal lobe receive information from the ears.'},
  occipital:{kicker:'SEEING & PERCEPTION',title:'Occipital lobe',description:'The occipital lobes, at the back of the brain, process visual information from the eyes.',fact:'Vision involves multiple areas working together, with visual processing beginning in the occipital cortex.'},
  cerebellum:{kicker:'MOVEMENT & BALANCE',title:'Cerebellum',description:'The cerebellum helps coordinate movement and contributes to balance and learned motor skills.',fact:'Activities such as playing the piano rely on coordinated movements involving the cerebellum.'},
  brainstem:{kicker:'ESSENTIAL FUNCTIONS',title:'Brainstem',description:'The brainstem connects the brain and spinal cord and helps regulate essential functions, including breathing and heart rate.',fact:'It includes the midbrain, pons and medulla.'}
};
const questions=[
  {q:'Which part of a neuron generally carries signals away from the cell body?',options:['Dendrite','Axon','Synapse'],correct:1,explain:'The axon carries signals away from the cell body.'},
  {q:'What is one important role of myelin?',options:['Speeding signal transmission along many axons','Producing all memories','Connecting the two eyes'],correct:0,explain:'Myelin insulates many axons and helps signals travel faster.'},
  {q:'Which brain region helps coordinate movement and balance?',options:['Cerebellum','Hippocampus','Retina'],correct:0,explain:'The cerebellum contributes to balance and coordination.'},
  {q:'What makes up the central nervous system?',options:['The brain and spinal cord','All muscles and bones','Only nerves in the limbs'],correct:0,explain:'The brain and spinal cord together form the central nervous system.'},
  {q:'What crosses the gap at a chemical synapse?',options:['A neurotransmitter','A bone cell','A blood vessel'],correct:0,explain:'A neurotransmitter is released and binds to receptors on the receiving cell.'}
];

const storage={
  get(key,fallback){try {const value=localStorage.getItem(key);return value===null?fallback:value;}catch(e){return fallback;}},
  set(key,value){try {localStorage.setItem(key,value);return true;}catch(e){return false;}}
};
const storageKey='neuroNav.studied.v1';
let studied=new Set();
try{const saved=JSON.parse(storage.get(storageKey,'[]'));if(Array.isArray(saved))studied=new Set(saved.filter(id=>concepts.some(c=>c.id===id)));}catch(e){}
let filter='All',expanded=new Set(),questionIndex=0,score=0,selected=null;
const cards=document.querySelector('#cards'),search=document.querySelector('#search');
function saveProgress(){storage.set(storageKey,JSON.stringify([...studied]));}
function renderCards(){
  const term=search.value.trim().toLowerCase();
  const visible=concepts.filter(c=>(filter==='All'||c.category===filter)&&[c.title,c.hint,c.detail,c.category].some(v=>v.toLowerCase().includes(term)));
  document.querySelector('#total-count').textContent=concepts.length;
  document.querySelector('#studied-count').textContent=studied.size;
  document.querySelector('#result-count').textContent=visible.length+' concepts shown';
  cards.innerHTML=visible.length?visible.map(c=>{
    const n=concepts.indexOf(c)+1,open=expanded.has(c.id),done=studied.has(c.id);
    return `<article class="concept-card"><div class="concept-top"><span class="concept-tag">${c.category}</span><span class="concept-num">${String(n).padStart(2,'0')} / 12</span></div><h3>${c.title}</h3><p>${c.hint}</p><div class="concept-actions"><button class="concept-open" type="button" data-action="expand" data-id="${c.id}" aria-expanded="${open}" aria-controls="detail-${c.id}">${open?'Hide idea ↑':'Explore idea ↗'}</button><button class="concept-done" type="button" data-action="studied" data-id="${c.id}" aria-pressed="${done}">${done?'✓ Studied':'Mark studied'}</button></div><div class="concept-details" id="detail-${c.id}" ${open?'':'hidden'}><p>${c.detail}</p><a href="${c.source}" target="_blank" rel="noopener noreferrer">Read the source ↗</a></div></article>`;
  }).join(''):'<div class="empty">No concepts found. Try a different search or topic.</div>';
}
cards.addEventListener('click',event=>{const button=event.target.closest('button[data-action]');if(!button)return;const {action,id}=button.dataset;if(action==='expand'){expanded.has(id)?expanded.delete(id):expanded.add(id);}if(action==='studied'){studied.has(id)?studied.delete(id):studied.add(id);saveProgress();}renderCards();cards.querySelector(`button[data-action="${action}"][data-id="${id}"]`)?.focus();});
search.addEventListener('input',renderCards);
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('.filter').forEach(b=>{const active=b===button;b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active);});renderCards();}));
document.querySelector('#reset-progress').addEventListener('click',()=>{studied.clear();saveProgress();renderCards();});

function selectRegion(id){
  const entry=regions[id];if(!entry)return;
  document.querySelectorAll('.region').forEach(b=>{const active=b.dataset.region===id;b.setAttribute('aria-pressed',String(active));b.classList.toggle('active',active);});
  document.querySelector('#brain-select').value=id;
  document.querySelector('#region-kicker').textContent=entry.kicker;
  document.querySelector('#region-title').textContent=entry.title;
  document.querySelector('#region-description').textContent=entry.description;
  document.querySelector('#region-fact').textContent=entry.fact;
  window.NeuroNavBrain?.select(id);
}
document.querySelectorAll('.region').forEach(button=>button.addEventListener('click',()=>selectRegion(button.dataset.region)));
document.querySelector('#brain-select').addEventListener('change',event=>selectRegion(event.target.value));
document.addEventListener('neuronav:select',event=>selectRegion(event.detail));
document.querySelector('#isolation').addEventListener('input',event=>window.NeuroNavBrain?.setIsolation(event.target.value));

const themeButton=document.getElementById('theme-switch');
function applyTheme(theme){document.documentElement.dataset.theme=theme;themeButton.innerHTML=theme==='dark'?'☀ <span>Light</span>':'☾ <span>Dark</span>';themeButton.setAttribute('aria-label',theme==='dark'?'Switch to light mode':'Switch to dark mode');}
applyTheme(storage.get('neuroNav.theme.v1','dark')==='light'?'light':'dark');
themeButton.addEventListener('click',()=>{const theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme(theme);storage.set('neuroNav.theme.v1',theme);});

const notes=document.querySelector('#notes'),notesStatus=document.querySelector('#notes-status');
notes.value=storage.get('neuroNav.notes.v1','');
notes.addEventListener('input',()=>{notesStatus.textContent=storage.set('neuroNav.notes.v1',notes.value)?'Saved':'Unable to save in this browser';});

let duration=15*60,remaining=duration,endsAt=0,timerHandle=null;
const timerDisplay=document.querySelector('#timer-display'),timerLabel=document.querySelector('#timer-label'),timerToggle=document.querySelector('#timer-toggle'),timerAnnouncement=document.querySelector('#timer-announcement');
function updateTimer(){const minutes=Math.floor(remaining/60),seconds=remaining%60;timerDisplay.textContent=String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0');}
function stopTimer(){if(timerHandle!==null)clearInterval(timerHandle);timerHandle=null;endsAt=0;timerToggle.innerHTML='Start focusing <span aria-hidden="true">↗</span>';}
function tick(){remaining=Math.max(0,Math.ceil((endsAt-Date.now())/1000));updateTimer();if(remaining===0){stopTimer();timerLabel.textContent='Time is up. Take a well-earned pause.';timerAnnouncement.textContent='Focus session complete.';}}
timerToggle.addEventListener('click',()=>{if(timerHandle!==null){remaining=Math.max(0,Math.ceil((endsAt-Date.now())/1000));stopTimer();timerLabel.textContent='Paused. Come back when you are ready.';updateTimer();return;}if(remaining===0)remaining=duration;endsAt=Date.now()+remaining*1000;timerLabel.textContent='One thing at a time. You have got this.';timerToggle.textContent='Pause';timerHandle=setInterval(tick,250);tick();});
document.querySelector('#timer-reset').addEventListener('click',()=>{stopTimer();remaining=duration;timerLabel.textContent='A little focus time, just for you.';timerAnnouncement.textContent='Timer reset.';updateTimer();});
document.querySelectorAll('[data-minutes]').forEach(button=>button.addEventListener('click',()=>{stopTimer();duration=Number(button.dataset.minutes)*60;remaining=duration;timerLabel.textContent='A little focus time, just for you.';document.querySelectorAll('[data-minutes]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));updateTimer();}));

const quiz=document.querySelector('#quiz-panel');
function renderQuiz(){
  if(questionIndex===questions.length){quiz.innerHTML=`<div class="quiz-meta">QUIZ COMPLETE ✨</div><p class="quiz-score">${score} / ${questions.length}</p><p class="feedback">Nice work showing up and giving it a go. Revisit the cards and try again whenever you like.</p><button class="next" type="button" data-quiz="restart">Try again ↻</button>`;return;}
  const q=questions[questionIndex],answered=selected!==null;
  const options=q.options.map((answer,i)=>`<button type="button" class="answer ${answered&&i===q.correct?'correct':''} ${answered&&i===selected&&i!==q.correct?'incorrect':''}" data-answer="${i}" ${answered?'disabled':''}>${answer}</button>`).join('');
  quiz.innerHTML=`<div class="quiz-meta">QUESTION ${questionIndex+1} OF ${questions.length}</div><div class="quiz-progress" aria-hidden="true"><span style="width:${(questionIndex/questions.length)*100}%"></span></div><h3>${q.q}</h3><div class="answers">${options}</div>${answered?`<p class="feedback"><strong>${selected===q.correct?'That’s right!':'Not quite.'}</strong> ${q.explain}</p><button type="button" class="next" data-quiz="next">${questionIndex===questions.length-1?'See results':'Next question'} →</button>`:''}`;
}
quiz.addEventListener('click',event=>{const answer=event.target.closest('button[data-answer]'),action=event.target.closest('button[data-quiz]');if(answer&&selected===null){selected=Number(answer.dataset.answer);if(selected===questions[questionIndex].correct)score++;renderQuiz();quiz.querySelector('[data-quiz="next"]')?.focus();}else if(action?.dataset.quiz==='next'){questionIndex++;selected=null;renderQuiz();quiz.querySelector('button')?.focus();}else if(action?.dataset.quiz==='restart'){questionIndex=0;score=0;selected=null;renderQuiz();quiz.querySelector('button')?.focus();}});
renderCards();renderQuiz();updateTimer();
