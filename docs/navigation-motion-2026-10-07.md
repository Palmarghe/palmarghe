# Navigation motion — 7 October 2026

Trusted local Chrome demonstrated a real cascade defect: reduced-motion still computed `palmarghe-page-out` because a later animation shorthand overrode the preference. A final scoped media rule now disables old/new/group root transition animations. Ordinary navigation retains the existing restrained timings. No router, history override or content changes were introduced.

Targeted E2E2/2 passed: both transition pseudo-elements compute `none` with reduced motion, normal motion retains the entry animation, smooth scrolling is disabled by the preference, and navigating through the actual footer About link then Back restores the reading position within10px. This is local evidence; deployment and current production checks remain pending for this change.

Rollback: revert the scoped CSS rule and rebuild/deploy normally. Premium requirements for true device preview, hero controls, visual baselines and broader performance/resilience remain active.

The first full run passed87/88 and exposed a theme-switch contrast defect in Studio buttons: foreground changed immediately while the background retained the old theme during its160ms transition. Theme-dependent surfaces now switch atomically; border/shadow/press motion remains. The unchanged pending-cleanup axe scenario passed1/1 after repair across390/1440px and dark/light. A clean full rerun passed88/88 in4.1m after repair. The original87/88 run remains historical evidence of the defect.
