(() => {
  const dialog = document.querySelector('#search-overlay');
  let returnFocus;
  let backdropPress = false;
  const open = trigger => {
    returnFocus = trigger;
    document.querySelector('.menu-toggle[aria-expanded="true"]')?.click();
    if (!dialog.open) dialog.showModal();
    document.documentElement.classList.add('search-overlay-open');
    trigger.setAttribute('aria-expanded', 'true');
    dialog.querySelector('input').focus();
    dialog.dispatchEvent(new Event('search-open'));
  };
  document.querySelectorAll('[data-search-trigger]').forEach(trigger => trigger.addEventListener('click', event => { event.preventDefault(); open(trigger); }));
  dialog?.querySelector('[data-search-close]').addEventListener('click', () => dialog.close());
  dialog?.addEventListener('pointerdown', event => { backdropPress = event.target === dialog; });
  dialog?.addEventListener('pointerup', event => {
    if (backdropPress && event.target === dialog) dialog.close();
    backdropPress = false;
  });
  dialog?.addEventListener('pointercancel', () => { backdropPress = false; });
  dialog?.addEventListener('close', () => {
    backdropPress = false;
    document.documentElement.classList.remove('search-overlay-open');
    returnFocus?.setAttribute('aria-expanded', 'false');
    (returnFocus?.closest('#mobile-nav') ? document.querySelector('.menu-toggle') : returnFocus)?.focus();
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && !event.target?.matches('input,textarea,[contenteditable="true"]')) {
      event.preventDefault(); open(document.querySelector('.head-actions [data-search-trigger]'));
    }
  });
  document.querySelectorAll('[data-live-search]').forEach(root => {
    const input = root.querySelector('input[name="q"]'), results = root.querySelector('[data-search-results]'), status = root.querySelector('[data-search-status]');
    const form = root.querySelector('form'), select = root.querySelector('select[name="type"]');
    const english = root.dataset.locale === 'en';
    let categorySelect=form.querySelector('[name=category]');
    if(!categorySelect){const categoryLabel=document.createElement('label');categoryLabel.className='search-category-filter';categoryLabel.textContent=english?'Category / game':'Kategori / oyun';categorySelect=document.createElement('select');categorySelect.name='category';categorySelect.innerHTML=`<option value="">${english?'All categories':'Tüm kategoriler'}</option>`;categoryLabel.append(categorySelect);form.append(categoryLabel);}
    let category=new URL(location.href).searchParams.get('category')||'';
    const queryControl = document.createElement('div');
    queryControl.className = 'search-query-control';
    const inputLabel = input.closest('label');
    inputLabel.before(queryControl); queryControl.append(inputLabel);
    const clear = document.createElement('button');
    clear.type = 'button'; clear.className = 'search-query-clear';
    clear.setAttribute('aria-label', english ? 'Clear search' : 'Aramayı temizle');
    clear.title = english ? 'Clear search' : 'Aramayı temizle';
    clear.textContent = '×'; queryControl.append(clear);
    const syncClear = () => { clear.hidden = !input.value; };
    syncClear();
    const labels = english ? {article:'Article',project:'Project',fm_mod:'FM Mod',gallery:'Gallery',lab_entry:'Lab'} : {article:'Yazı',project:'Proje',fm_mod:'FM Mod',gallery:'Galeri',lab_entry:'Lab'};
    let type = select?.value || '', timer, controller, version = 0, selected = -1, unavailable = false;
    const retry = document.createElement('button');
    retry.type='button';retry.className='search-retry text-link';retry.hidden=true;
    retry.textContent=english?'Retry search':'Aramayı yeniden dene';status.after(retry);
    status.hidden = false; results.hidden = false;
    root.querySelectorAll('[data-search-fallback]').forEach(el => { el.hidden = true; });
    const appendText = (parent, text, term) => {
      const value = String(text || ''), language = english ? 'en' : 'tr';
      const start = term ? value.toLocaleLowerCase(language).indexOf(term.toLocaleLowerCase(language)) : -1;
      if (start < 0) { parent.textContent = value; return; }
      parent.append(value.slice(0,start));
      const mark = document.createElement('mark'); mark.textContent = value.slice(start,start + term.length);
      parent.append(mark,value.slice(start + term.length));
    };
    const render = (items,q) => {
      selected = -1; results.replaceChildren();
      for (const item of items) {
        const link = document.createElement('a'); link.className = 'instant-search-result'; link.dataset.searchResult = '';
        link.href = `${english ? '/en/' : '/'}${String(item.slug).split('/').map(encodeURIComponent).join('/')}/`;
        const image = document.createElement('img');
        const source = item.cover_media_id ? `/api/media/${encodeURIComponent(item.cover_media_id)}/` : item.cover_url;
        try { const url = new URL(source || '/visuals/og-default.webp',location.origin); if (url.origin === location.origin || url.protocol === 'https:') image.src = url.href; } catch {}
        if (typeof item.cover_srcset === 'string') { image.srcset = item.cover_srcset; image.sizes = '(max-width: 600px) 64px, 104px'; }
        image.alt = ''; image.width = 104; image.height = 78; image.loading = 'lazy';
        const copy = document.createElement('div'), meta = document.createElement('span'), title = document.createElement('strong'), excerpt = document.createElement('small');
        meta.className = 'eyebrow'; meta.textContent = labels[item.type] || item.type;
        appendText(title,item.title,q); appendText(excerpt,item.excerpt,q);
        copy.append(meta,title,excerpt); link.append(image,copy); results.append(link);
      }
      status.textContent = items.length ? (q ? `${items.length} ${english ? 'results' : 'sonuç'}` : (english ? 'Latest publications' : 'Son yayınlar')) : (english ? 'No results. Try another phrase or type.' : 'Sonuç yok. Başka bir kelime veya yayın türü dene.');
      if (!items.length) { const empty = document.createElement('a'); empty.className = 'search-empty-link'; empty.href = english ? '/en/archive/' : '/archive/'; empty.textContent = english ? 'Explore the archive →' : 'Arşivi keşfet →'; results.append(empty); }
    };
    const search = (immediate = false) => {
      clearTimeout(timer); controller?.abort(); const current = ++version, q = input.value.trim(); selected = -1;
      const returnToInput=document.activeElement===retry;retry.hidden=true;unavailable=false;results.setAttribute('aria-busy','true');
      if (q.length === 1) { results.replaceChildren(); results.removeAttribute('aria-busy'); status.textContent = english ? 'Enter at least two characters.' : 'En az iki karakter yaz.'; return; }
      status.textContent = english ? 'Searching…' : 'Aranıyor…';
      timer = setTimeout(async () => {
        const active = new AbortController(); controller = active;let timedOut=false;
        const deadline=setTimeout(()=>{timedOut=true;active.abort();},12000);
        try {
          const response = await fetch(`/api/search/?locale=${english ? 'en' : 'tr'}&q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&category=${encodeURIComponent(category)}`,{signal:active.signal});
          if (!response.ok) throw new Error('Unavailable');
          const payload = await response.json(); if (current !== version) return;
          const validItems=items=>Array.isArray(items)&&items.every(item=>item&&typeof item.slug==='string'&&typeof item.title==='string'&&typeof item.type==='string');
          if(!payload||!validItems(payload.results)||(payload.suggestions!==undefined&&!validItems(payload.suggestions))||(payload.categories!==undefined&&(!Array.isArray(payload.categories)||!payload.categories.every(item=>item&&typeof item.id==='string'&&typeof item.name_tr==='string'&&typeof item.name_en==='string'))))throw new Error('Invalid search response');
          if(categorySelect.options.length===1){for(const item of payload.categories||[]){const option=document.createElement('option');option.value=item.id;option.textContent=english?item.name_en:item.name_tr;option.selected=item.id===category||item.slug===category;categorySelect.append(option);}}
          render(payload.results || [],q);if(returnToInput)input.focus();
          if(!payload.results?.length&&payload.suggestions?.length){const note=document.createElement('p');note.className='search-suggestion-heading';note.textContent=english?'You might also explore':'Bunlara da göz atabilirsin';const previous=status.textContent;render(payload.suggestions,'');results.prepend(note);status.textContent=previous;}
          const full = root.querySelector('a.text-link');
          if (full) full.href = `${english ? '/en' : ''}/search/?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}&category=${encodeURIComponent(category)}`;
          if (root !== dialog) { const url = new URL(location.href); q ? url.searchParams.set('q',q) : url.searchParams.delete('q'); type ? url.searchParams.set('type',type) : url.searchParams.delete('type'); category?url.searchParams.set('category',category):url.searchParams.delete('category');history.replaceState(null,'',url); }
        } catch { if (current === version && (!active.signal.aborted || timedOut)) {
          unavailable=true;retry.hidden=false;
          const retained=Boolean(results.querySelector('[data-search-result]'));
          status.textContent=english?(retained?'Search could not update. Previous results are shown; retry when ready.':'Search is unavailable. Please retry.'):(retained?'Sonuçlar güncellenemedi. Önceki sonuçlar gösteriliyor; yeniden dene.':'Aramaya ulaşılamadı. Yeniden dene.');
        } }
        finally { clearTimeout(deadline);if (current === version) results.removeAttribute('aria-busy'); }
      },immediate ? 0 : 220);
    };
    retry.addEventListener('click',()=>search(true));
    window.addEventListener('online',()=>{if(unavailable && (root!==dialog || dialog.open))search(true);});
    input.addEventListener('input',() => { syncClear(); search(); });
    clear.addEventListener('click',() => { input.value = ''; syncClear(); input.focus(); search(true); });
    form.addEventListener('submit',event => { event.preventDefault(); search(true); });
    select?.addEventListener('change',() => { type = select.value; search(true); });
    categorySelect.addEventListener('change',()=>{category=categorySelect.value;search(true);});
    root.querySelectorAll('[data-search-type]').forEach(button => button.addEventListener('click',() => {
      type = button.dataset.searchType;
      root.querySelectorAll('[data-search-type]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
      search(true);
    }));
    root.addEventListener('keydown',event => {
      if (root === dialog && event.key === 'Tab') {
        const controls = [...root.querySelectorAll('a[href],button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),[tabindex="0"]')]
          .filter(element => element.getClientRects().length > 0 && !element.closest('[hidden]'));
        const first = controls[0], last = controls[controls.length - 1];
        if (first && (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        }
      }
      if (!['ArrowDown','ArrowUp'].includes(event.key) || !(event.target === input || event.target.closest('[data-search-result]'))) return;
      const links = [...results.querySelectorAll('[data-search-result]')]; if (!links.length) return;
      event.preventDefault();
      if (event.key === 'ArrowUp' && selected <= 0) { selected = -1; input.focus(); return; }
      selected = (selected + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length; links[selected].focus();
    });
    if (root === dialog) { root.addEventListener('search-open',() => search(true)); root.addEventListener('close',() => { clearTimeout(timer); controller?.abort(); version++; }); }
    else search(true);
  });
})();
