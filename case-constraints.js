// Explanatory stage specifications from paper/sections/appendix_case_constraints.tex.
// Playback is scripted; these are not recorded model or planner outputs.
(() => {
  'use strict';
  const red = tex => String.raw`\textcolor{#a94436}{${tex}}`;
  const row = (label, tex, issue = '') => ({label, tex, issue});
  const point = name => String.raw`k_{\mathrm{${name}}}`;
  const grasp = (name, bad = false) => {
    const k = bad ? red(point(name)) : point(name);
    return [
      row('Hover · subgoal', String.raw`\mathcal C_{\mathrm{hover,sg}}=\{\|p_e(T)-(${k}+h_a e_z)\|\le\epsilon_p\}`),
      row('Descend · subgoal', String.raw`\mathcal C_{\mathrm{descend,sg}}=\{\|p_e(T)-${k}\|\le\epsilon_p\}`),
      row('Close · subgoal', String.raw`\mathcal C_{\mathrm{close,sg}}=\left\{\begin{aligned}&\|p_e(T)-${k}\|\le\epsilon_p,\\&w(T)=w_{\mathrm{${name}}}\end{aligned}\right\}`),
      row('Hover & descend · path', String.raw`\mathcal C_{\mathrm{approach,path}}=\mathcal H_i\cup\{w(t)=w_{\mathrm{open}}\}`),
      row('Close · path', String.raw`\mathcal C_{\mathrm{close,path}}=\mathcal H_i\cup\{p_e(t)=${k}\}`)
    ];
  };
  const release = [
    row('Release · subgoal', String.raw`\mathcal C_{\mathrm{release,sg}}=\{w(T)=w_{\mathrm{open}},\ \Phi_G(T_o(T))\}`),
    row('Release · path', String.raw`\mathcal C_{\mathrm{release,path}}=\mathcal H_i\cup\{T_o(t)=T_o(T_s)\}`),
    row('Retreat · subgoal', String.raw`\mathcal C_{\mathrm{retreat,sg}}=\{z_e(T)-z_e(T_s)\ge h_r\}`),
    row('Retreat · path', String.raw`\mathcal C_{\mathrm{retreat,path}}=\mathcal H_i\cup\left\{\begin{aligned}&w(t)=w_{\mathrm{open}},\\&T_o(t)=T_o(T_s)\end{aligned}\right\}`)
  ];
  window.REFLEX_CONSTRAINTS = {
    object: {
      correct: [
        row('Object reference', String.raw`o=\mathrm{apple}`), ...grasp('apple'),
        row('Hold · path', String.raw`\mathcal C_{\mathrm{hold,path}}=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}`)
      ],
      wrong: [
        row('Object reference', String.raw`o=${red(String.raw`\boxed{\mathrm{pear}}`)}`, 'Wrong object'), ...grasp('pear', true),
        row('Hold · path', String.raw`\mathcal C_{\mathrm{hold,path}}=\mathcal H_i\cup\mathcal A_{\mathrm{pear}}`)
      ],
      errorTitle: 'Wrong binding: pear replaces apple.',
      errorText: 'The instruction asks for the apple, but the grasp reference is bound to the pear. Reaching that reference and closing the gripper can satisfy the written constraints while failing the task.',
      preserve: 'Keep the hover, descend, close and hold stages. Change the object reference and its calibrated grasp geometry.',
      context: 'The opening w is per finger: 38.1 mm for the apple and 33.2 mm for the pear. This pair ends with grasp and hold; transport and release are outside its scope.'
    },
    region: {
      correct: [row('Functional-region reference', String.raw`o=\mathrm{spatula},\quad r=\mathrm{handle}`), ...grasp('handle'),
        row('Lift · subgoal', String.raw`\mathcal C_{\mathrm{lift,sg}}=\{z_o(T)-z_o^0\ge h_l\}`),
        row('Lift · path', String.raw`\mathcal C_{\mathrm{lift,path}}=\mathcal H_i\cup\mathcal A_{\mathrm{spatula}}`)],
      wrong: [row('Functional-region reference', String.raw`o=\mathrm{spatula},\quad r=${red(String.raw`\boxed{\mathrm{blade}}`)}`, 'Wrong region'), ...grasp('blade', true),
        row('Lift · subgoal', String.raw`\mathcal C_{\mathrm{lift,sg}}=\{z_o(T)-z_o^0\ge h_l\}`),
        row('Lift · path', String.raw`\mathcal C_{\mathrm{lift,path}}=\mathcal H_i\cup\mathcal A_{\mathrm{spatula}}`)],
      errorTitle: 'Wrong region: blade replaces handle.',
      errorText: 'The object identity is correct. The grasp point belongs to the blade instead of the task-required handle. Lifting the spatula does not resolve this semantic mismatch.',
      preserve: 'Keep the spatula binding and lift goal. Revise the region reference and corresponding grasp opening.',
      context: 'Both references lift by approximately 75 mm. Per-finger closure is 10.5 mm at the handle and 33.3 mm at the blade; the error does not require the blade to be impossible to grasp.'
    },
    direction: {
      correct: [
        row('Approach · subgoal', String.raw`\mathcal C_{\mathrm{approach,sg}}=\{\|p_e(T)-k_b\|\le\epsilon_p\}`),
        row('Final moving approach · direction', String.raw`\mathcal D_a^+=\{v_e\cdot n_{\downarrow}\ge\|v_e\|\cos\theta\}`),
        row('Approach · path', String.raw`\mathcal C_{\mathrm{approach,path}}=\mathcal H_i\cup\{w=w_b\}\cup\mathcal D_a^+`)
      ],
      wrong: [
        row('Approach · subgoal', String.raw`\mathcal C_{\mathrm{approach,sg}}=\{\|p_e(T)-k_b\|\le\epsilon_p\}`),
        row('Final moving approach · direction', String.raw`\mathcal D_a^-=\{v_e\cdot ${red(String.raw`n_{\rightarrow}`)}\ge\|v_e\|\cos\theta\}`, 'Wrong direction'),
        row('Approach · path', String.raw`\mathcal C_{\mathrm{approach,path}}=\mathcal H_i\cup\{w=w_b\}\cup\mathcal D_a^-`)
      ],
      errorTitle: 'Wrong direction, even with the same endpoint.',
      errorText: 'The target k_b, gripper pose and opening are preserved. The highlighted horizontal direction replaces the required downward approach, so endpoint accuracy alone cannot catch the error.',
      preserve: 'Keep the button target, pose and opening. Replace the direction relation on the final moving approach segment.',
      context: 'Direction conditions apply only for t in the final segment I_a, with nonzero speed. Both references reach k_b = (0.62, −0.03, 0.340) m with 3 mm per-finger opening. The correct playback then scripts an 8 mm press and indicator light.'
    },
    progress: {
      correct: [
        row('Carry · subgoal', String.raw`\mathcal C_{\mathrm{carry,sg}}^+=\{d_G(T)\le\epsilon_p\}`),
        row('Carry · path', String.raw`\mathcal C_{\mathrm{carry,path}}^+=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}`),
        row('Distance to placement reference', String.raw`d_G(t)=\|p_e(t)-k_G\|`)
      ],
      wrong: [
        row('Carry · subgoal', String.raw`\mathcal C_{\mathrm{carry,sg}}^-=${red(String.raw`\boxed{\varnothing}`)}`, 'Missing arrival condition'),
        row('Carry · path', String.raw`\mathcal C_{\mathrm{carry,path}}^-=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}`),
        row('Distance to placement reference', String.raw`d_G(t)=\|p_e(t)-k_G\|`)
      ],
      errorTitle: 'Missing condition: arrive at the placement reference.',
      errorText: 'The empty subgoal set omits d_G(T) ≤ ε_p. Grasp attachment and pose remain valid, but they do not require transport completion. The authored incorrect motion illustrates the local oscillation this specification permits.',
      preserve: 'Keep the apple binding, grasp and pose. Add the carry-stage endpoint condition; interpret progress only during active transport.',
      context: 'Both sequences share the grasp and lift. The correct Scene A reference reaches the placement pose and remains held. Missing arrival does not force stagnation; waits, detours and holds after arrival need stage context.'
    },
    collision: {
      correct: [
        row('Carry · subgoal', String.raw`\mathcal C_{\mathrm{carry,sg}}^+=\{\Phi_G(T_o(T))\}`),
        row('Carry · path', String.raw`\mathcal C_{\mathrm{carry,path}}^+=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}\cup\mathcal S`),
        row('Safety · path', String.raw`\mathcal S=\{\operatorname{dist}(\mathcal B(t),\mathcal O)\ge\delta\}`),
        ...release
      ],
      wrong: [
        row('Carry · intended subgoal', String.raw`\mathcal C_{\mathrm{carry,sg}}^-=\{\Phi_G(T_o(T))\}`),
        row('Carry · path', String.raw`\mathcal C_{\mathrm{carry,path}}^-=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}\cup\mathcal L`),
        row('Low transfer · path', String.raw`\mathcal L=\{${red(String.raw`z_e(t)=z_{\mathrm{low}}`)}\}`, 'Clearance omitted'),
        ...release.map(item => ({...item, label: `${item.label} · intended`}))
      ],
      errorTitle: 'Missing safety condition: robot and carried-object clearance.',
      errorText: 'The placement goal is preserved, but the low transfer path omits the safety set S. A low TCP height does not guarantee clearance for either the robot or the carried apple. The hazardous continuation is shown as a dashed route.',
      preserve: 'Keep the placement, release and retreat goals. Add obstacle clearance for the robot, gripper and carried apple throughout transport.',
      context: 'B(t) includes the robot, gripper and apple; O is the barrier. The illustrative clearance δ is 20 mm. Low transfer is 0.350 m; the correct crossing is about 0.490 m. Incorrect playback stops about 2.5 mm before contact and never executes its intended placement, release or retreat.',
      placement: String.raw`\Phi_G(T_o)\Longleftrightarrow\left\{\begin{aligned}&\|c_{o,xy}-g_{xy}\|\le\epsilon_{xy},\\&|z_{\min}(T_o)-z_{\mathrm{plate}}|\le\epsilon_z\end{aligned}\right.`
    }
  };
  // Give the valid counterpart the same visual emphasis for easy comparison.
  for (const item of Object.values(window.REFLEX_CONSTRAINTS)) {
    const index = item.wrong.findIndex(constraint => constraint.issue);
    item.correct[index].reference = true;
  }
})();
