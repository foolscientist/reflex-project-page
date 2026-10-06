(() => {
  'use strict';
  const config = window.REFLEX_SITE || {};
  const cases = {
    object: {
      scene: 'Scene A · Object binding', title: 'Grasp the apple, not the nearby pear.',
      correctAction: 'Target: apple', wrongAction: 'Target: pear', scope: 'Subgoal',
      good: String.raw`\|p_e(T)-k_{\mathrm{apple}}\|\leq\epsilon_p`,
      bad: String.raw`\|p_e(T)-k_{\mathrm{pear}}\|\leq\epsilon_p`,
      correct: 'Bind the grasp reference to the task-intended apple.',
      wrong: 'Bind the reference to a distractor while the task still asks for the apple.',
      repair: 'Replace the object reference. Preserve the grasp stage, gripper pose and closure requirements.',
      detail: 'Both motions close the gripper at the authored grasp position. This case illustrates object selection; it does not include transport or release.'
    },
    region: {
      scene: 'Scene B · Functional region binding', title: 'Pick up the spatula by its handle.',
      correctAction: 'Handle grasp', wrongAction: 'Blade grasp', scope: 'Subgoal',
      good: String.raw`\|p_e(T)-k_{\mathrm{handle}}\|\leq\epsilon_p`,
      bad: String.raw`\|p_e(T)-k_{\mathrm{blade}}\|\leq\epsilon_p`,
      correct: 'Keep the spatula object and select its task-relevant handle.',
      wrong: 'Keep the same object, but bind the grasp to its blade.',
      repair: 'Revise the functional-region reference and associated grasp geometry. Preserve the spatula binding and lift requirement.',
      detail: 'Both references lift the spatula by approximately 75 mm. The task requires the handle; the error does not depend on the blade being impossible to grasp.'
    },
    direction: {
      scene: 'Scene C · Approach direction', title: 'Approach the button from above.',
      correctAction: 'Downward approach', wrongAction: 'Horizontal approach', scope: 'Path',
      good: String.raw`v_e\cdot n_{\downarrow}\geq\|v_e\|\cos\theta`,
      bad: String.raw`v_e\cdot n_{\rightarrow}\geq\|v_e\|\cos\theta`,
      correct: 'Require downward motion during the final moving approach segment.',
      wrong: 'Approach horizontally despite reaching the same TCP endpoint.',
      repair: 'Correct the final approach direction. Preserve the button target, gripper orientation and opening.',
      detail: 'Both references reach the same approach target and joint pose. The correct sequence then scripts a press and indicator light; these effects are not results of simulated contact dynamics.'
    },
    progress: {
      scene: 'Scene A · Progress stagnation', title: 'Complete the apple transport stage.',
      correctAction: 'Reach placement reference', wrongAction: 'Oscillate and hold', scope: 'Subgoal',
      good: String.raw`d_G(T)=\|p_e(T)-k_G\|\leq\epsilon_p`,
      bad: String.raw`\mathcal C_{\mathrm{carry,sg}}^{-}=\varnothing`,
      correct: 'Keep grasp attachment and require arrival at the placement reference.',
      wrong: 'Keep grasp attachment and pose, but omit the transport endpoint requirement.',
      repair: 'Add an explicit stage-completion condition. Preserve the apple binding and grasp; interpret progress over the active transport window.',
      detail: 'The correct Scene A reference reaches the placement pose and remains grasped. The omitted condition permits local oscillation; it does not force a planner to produce it. Normal holds after arrival are not stagnation.'
    },
    collision: {
      scene: 'Scene D · Collision risk', title: 'Carry the apple safely over the barrier.',
      correctAction: 'Lift, cross, place, release', wrongAction: 'Low path; stop before contact', scope: 'Path',
      good: String.raw`\operatorname{dist}(\mathcal B(t),\mathcal O)\geq\delta`,
      bad: String.raw`z_e(t)=z_{\mathrm{low}}\quad\text{(clearance omitted)}`,
      correct: 'Maintain clearance for the robot and carried apple while preserving the placement goal.',
      wrong: 'Transport at a low height without the required obstacle-clearance condition.',
      repair: 'Add path clearance for both the robot and the carried object. Preserve the original placement goal and release stages.',
      detail: 'The incorrect playback stops about 2.5 mm before the barrier; the dashed route is an unplayed hazardous continuation. The correct reference completes placement, opens the gripper and retreats.'
    }
  };
  const $ = id => document.getElementById(id);
  const videos = [$('correct-video'), $('wrong-video')];
  const tabs = [...document.querySelectorAll('[data-case]')];
  let pairPlaying = false;
  let changingCase = false;
  let caseRevision = 0;

  function renderMath(element, tex) {
    element.dataset.tex = tex;
    if (window.katex) window.katex.render(tex, element, {throwOnError: false, strict: 'warn', output: 'htmlAndMathml'});
    else element.textContent = tex;
  }
  document.querySelectorAll('[data-tex]').forEach(element => renderMath(element, element.dataset.tex));

  $('authors').textContent = config.authors || 'Shaoyi Wang';
  if (config.affiliation) { $('affiliation').textContent = config.affiliation; $('affiliation').hidden = false; }
  if (config.paperUrl) document.querySelectorAll('[data-paper-link]').forEach(link => { link.href = config.paperUrl; });
  if (config.paperLabel) document.querySelectorAll('[data-paper-label]').forEach(label => { label.textContent = config.paperLabel; });
  if (config.citation) $('bibtex').textContent = config.citation;
  let codeUrl = config.codeUrl;
  if (!codeUrl && location.hostname.endsWith('.github.io')) {
    const owner = location.hostname.split('.')[0];
    const repository = location.pathname.split('/').filter(Boolean)[0] || `${owner}.github.io`;
    codeUrl = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}`;
  }
  if (codeUrl) document.querySelectorAll('[data-code-link]').forEach(link => {
    link.href = codeUrl; link.target = '_blank'; link.rel = 'noopener'; link.hidden = false;
  });

  function updatePlaybackLabel() {
    $('play-label').textContent = pairPlaying ? 'Pause both' : 'Play both';
    $('play-icon').textContent = pairPlaying ? 'Ⅱ' : '▶';
  }
  function pausePair() {
    pairPlaying = false;
    videos.forEach(video => video.pause());
    updatePlaybackLabel();
    $('playback-note').textContent = 'Paused. Resume both references from this point.';
  }
  async function playPair(startTime) {
    const revision = caseRevision;
    const time = startTime === undefined ? videos[0].currentTime : startTime;
    if (videos.some(video => video.ended)) videos.forEach(video => { video.currentTime = 0; });
    else videos.forEach(video => { if (Math.abs(video.currentTime - time) > .08) video.currentTime = time; });
    pairPlaying = true;
    updatePlaybackLabel();
    $('playback-note').textContent = 'Playing both references on a shared timeline.';
    const results = await Promise.allSettled(videos.map(video => video.play()));
    if (revision !== caseRevision) return;
    if (results.some(result => result.status === 'rejected')) {
      pausePair();
      $('playback-note').textContent = 'Pair playback is unavailable. Use the individual video controls.';
    }
  }
  videos.forEach((video, index) => {
    video.addEventListener('play', () => { if (!pairPlaying && !changingCase) playPair(video.currentTime); });
    video.addEventListener('pause', () => { if (pairPlaying && !changingCase) pausePair(); });
    video.addEventListener('ended', () => {
      if (!changingCase) { pausePair(); $('playback-note').textContent = 'Comparison complete. Restart to watch again.'; }
    });
    video.addEventListener('seeking', () => {
      if (changingCase) return;
      const other = videos[1 - index];
      if (Number.isFinite(other.duration) && Math.abs(other.currentTime - video.currentTime) > .2) {
        other.currentTime = Math.min(video.currentTime, other.duration);
      }
    });
    video.addEventListener('error', () => {
      if (!changingCase) { pausePair(); $('playback-note').textContent = 'This video could not load. Reload the page or check the media files.'; }
    });
  });
  videos[0].addEventListener('timeupdate', () => {
    if (pairPlaying && !videos[1].seeking && Number.isFinite(videos[1].duration) &&
        Math.abs(videos[0].currentTime - videos[1].currentTime) > .35) videos[1].currentTime = videos[0].currentTime;
  });
  $('play-pair').addEventListener('click', () => { if (pairPlaying) pausePair(); else playPair(); });
  $('restart-pair').addEventListener('click', () => {
    pausePair(); videos.forEach(video => { video.currentTime = 0; });
    $('playback-note').textContent = 'Restarted. Press Play both to compare.';
  });

  function selectCase(name) {
    const selected = cases[name];
    if (!selected) return;
    changingCase = true;
    caseRevision += 1;
    pausePair();
    tabs.forEach(tab => {
      const active = tab.dataset.case === name;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    });
    const activeTab = tabs.find(tab => tab.dataset.case === name);
    const tabList = activeTab.parentElement;
    if (tabList.scrollWidth > tabList.clientWidth) tabList.scrollLeft = activeTab.offsetLeft - tabs[0].offsetLeft;
    $('case-panel').setAttribute('aria-labelledby', `tab-${name}`);
    $('scene-label').textContent = selected.scene;
    $('case-title').textContent = selected.title;
    $('correct-action').textContent = selected.correctAction;
    $('wrong-action').textContent = selected.wrongAction;
    $('correct-description').textContent = selected.correct;
    $('wrong-description').textContent = selected.wrong;
    $('repair-text').textContent = selected.repair;
    $('case-detail').textContent = selected.detail;
    document.querySelectorAll('.constraint > p:first-child span').forEach(label => { label.textContent = selected.scope; });
    renderMath($('correct-equation'), selected.good);
    renderMath($('wrong-equation'), selected.bad);
    videos.forEach((video, index) => {
      const side = index === 0 ? 'correct' : 'wrong';
      const url = `assets/videos/${name}-${side}.mp4`;
      video.poster = `assets/images/${name}-${side}.jpg`;
      video.querySelector('source').src = url;
      video.querySelector('a').href = url;
      video.setAttribute('aria-label', `${index === 0 ? 'Correct' : 'Incorrect'} reference: ${selected.title}`);
      video.load();
    });
    $('playback-note').textContent = 'Compare the two references on a shared timeline.';
    changingCase = false;
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCase(tab.dataset.case));
    tab.addEventListener('keydown', event => {
      const movements = {ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0, End: tabs.length - 1};
      if (movements[event.key] === undefined) return;
      event.preventDefault();
      const next = tabs[movements[event.key]];
      selectCase(next.dataset.case); next.focus(); next.scrollIntoView({block: 'nearest', inline: 'nearest'});
    });
  });
  document.querySelectorAll('[data-open-case]').forEach(button => button.addEventListener('click', () => {
    selectCase(button.dataset.openCase);
    $('demos').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    $(`tab-${button.dataset.openCase}`).focus({preventScroll: true});
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pausePair(); });
  $('copy-citation').addEventListener('click', async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText($('bibtex').textContent);
      else {
        const field = document.createElement('textarea');
        field.value = $('bibtex').textContent; field.style.position = 'fixed'; field.style.left = '-9999px';
        document.body.append(field); field.select();
        const copied = document.execCommand('copy'); field.remove();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      $('copy-status').textContent = 'BibTeX copied.';
    } catch { $('copy-status').textContent = 'Select and copy the citation text above.'; }
  });
})();
