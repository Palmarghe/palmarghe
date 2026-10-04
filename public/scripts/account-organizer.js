(() => {
  const account=document.querySelector('.account-content');if(!account?.querySelector('input[value=logout]'))return;
  const tr=document.documentElement.lang!=='en';
  const security=document.createElement('section');security.className='account-security';
  const heading=document.createElement('h2');heading.textContent=tr?'Oturum ve hesap':'Sessions and account';security.append(heading);
  for(const form of [...account.querySelectorAll(':scope>form')])if(!form.classList.contains('account-profile-form'))security.append(form);
  account.append(security);
  const sections=[account.querySelector('.profile-card')||account.querySelector('.account-profile-form'),account.querySelector('.saved-reading'),account.querySelector('.liked-reading'),account.querySelector('.account-notifications'),security].filter(Boolean);
  const labels=tr?['Profil','Okuma listesi','Beğeniler','Bildirimler','Hesap']:['Profile','Reading list','Likes','Notifications','Account'];
  const tabs=document.createElement('nav');tabs.className='account-tabs';tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',tr?'Hesap bölümleri':'Account sections');
  const select=index=>{sections.forEach((section,i)=>{section.hidden=i!==index;const b=tabs.children[i];b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1;});};
  sections.forEach((section,i)=>{section.id='account-panel-'+i;section.setAttribute('role','tabpanel');section.setAttribute('aria-labelledby','account-tab-'+i);const b=document.createElement('button');b.type='button';b.id='account-tab-'+i;b.setAttribute('role','tab');b.setAttribute('aria-controls',section.id);b.textContent=labels[i];b.addEventListener('click',()=>{select(i);history.replaceState(null,'','#'+['profile','reading','likes','updates','settings'][i]);});b.addEventListener('keydown',event=>{let next=i;if(event.key==='ArrowRight')next=(i+1)%sections.length;else if(event.key==='ArrowLeft')next=(i+sections.length-1)%sections.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=sections.length-1;else return;event.preventDefault();select(next);tabs.children[next].focus();});tabs.append(b);});
  account.prepend(tabs);select(Math.max(0,['#profile','#reading','#likes','#updates','#settings'].indexOf(location.hash)));
})();
