-- Replace compressed legacy media with locally served, high-resolution editorial covers.
update public.content_items
set cover_url = case slug
  when 'ai/gorsel-hikaye-kurmak' then '/visuals/premium-ai-story.png'
  when 'gaming/atmosfer-ve-hikaye' then '/visuals/premium-game-atmosphere.png'
end
where locale = 'tr'
  and slug in ('ai/gorsel-hikaye-kurmak','gaming/atmosfer-ve-hikaye');