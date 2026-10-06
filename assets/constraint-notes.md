# ReFlex: paired stage-level constraint specifications

These examples accompany five authored MuJoCo demonstrations across four
scenes. The equations are manually written task specifications. They are not
inputs solved during playback, model-generated constraints, or automatic
ReFlex repair outputs. An incorrect specification may permit a task-incorrect
motion; it does not necessarily force a planner to generate that motion.

## Notation and common conditions

A stage spans `[t0, T]`. Subgoal constraints hold at its endpoint; path
constraints hold during the applicable stage or declared moving segment.

- `p_e(t)`, `R_e(t)`, `T_e(t)`: TCP position, rotation and world pose.
- `q(t)`: robot joints. `w(t)`: per-finger displacement, not total jaw width.
- `k_o`, `k_r`: calibrated TCP grasp references for an object or region.
- `k_G`: TCP placement reference. `d_G(t) = ||p_e(t) - k_G||`.
- `T_o(t)`: object world pose. `v_e(t)`: TCP motion vector.
- `epsilon_p`, `epsilon_R`, `theta`: explanatory tolerances, not frozen
  ReFlex detector thresholds.

$$
\mathcal C_i = \mathcal C_{i,\mathrm{sg}}\cup\mathcal C_{i,\mathrm{path}},
\qquad
\mathcal H_i=\{q_{\min}\le q(t)\le q_{\max},\quad
 e_R(R_e(t),R_i^{\mathrm{ref}})\le\epsilon_R,\quad
 0\le w(t)\le w_{\max}\}.
$$

Approach stages hold the gripper open. Closure smoothly changes its opening
while keeping the grasp pose. After closure, scripted rigid attachment is
represented by

$$
\mathcal A_o=\{w(t)=w_o,\ T_e(t)^{-1}T_o(t)=A_o\}.
$$

This attachment does not establish force closure or contact stability.

## 01. Scene A: object binding

Task: grasp the apple. The distractor is a pear. Let `h_a` be an approach
height and `e_z` the upward unit vector.

$$
\begin{aligned}
\mathcal C_{\mathrm{hover,sg}}(o)&=\{\|p_e(T)-(k_o+h_a e_z)\|\le\epsilon_p\},\\
\mathcal C_{\mathrm{descend,sg}}(o)&=\{\|p_e(T)-k_o\|\le\epsilon_p\},\\
\mathcal C_{\mathrm{close,sg}}(o)&=\{\|p_e(T)-k_o\|\le\epsilon_p,\ w(T)=w_o\}.
\end{aligned}
$$

Path conditions include `H_i`; hover and descent preserve the open gripper,
while closure holds the grasp pose. Correct: `o = apple`. Incorrect:
`o = pear`, although the task still specifies the apple. Per-finger closure
displacements are 38.1 mm for the apple and 33.2 mm for the pear.
This case stops after grasp closure and hold; it does not transport or release.

Candidate repair: replace the object reference and adjust object-dependent
grasp geometry, preserving the intended stage and other valid requirements.

## 02. Scene B: functional-region binding

Task: pick up the spatula by its handle. Both references keep the spatula
object. Approach and descent use the previous reference-point conditions
with `k_r` in place of `k_o`.

$$
\begin{aligned}
\mathcal C_{\mathrm{grasp,sg}}(r)&=\{\|p_e(T)-k_r\|\le\epsilon_p,\ w(T)=w_r\},\\
\mathcal C_{\mathrm{lift,sg}}&=\{z_o(T)-z_o^0\ge h_l\},\\
\mathcal C_{\mathrm{lift,path}}(r)&=\mathcal H_i\cup\mathcal A_{\mathrm{spatula}}.
\end{aligned}
$$

Correct: `r = handle`. Incorrect: `r = blade`. Both scripted references lift
approximately 75 mm. The per-finger displacements are 10.5 mm and 33.3 mm,
respectively. The blade can still be lifted in the illustration; task semantics
require the handle.

Candidate repair: change the functional-region reference and corresponding
grasp geometry, preserving object identity and the lift requirement.

## 03. Scene C: approach direction

Task: approach the button from above. Both references reach the same TCP
target `k_b = (0.62, -0.03, 0.340) m`, with the same final joint pose and
3 mm per-finger displacement. The direction condition is restricted to
the final moving approach segment `I_a`, excluding zero-speed samples.

$$
\begin{aligned}
\mathcal C_{\mathrm{approach,sg}}^+
&=\mathcal C_{\mathrm{approach,sg}}^-
=\{\|p_e(T)-k_b\|\le\epsilon_p\},\\
\mathcal C_{\mathrm{approach,path}}^+
&=\mathcal H_i\cup\{w=w_b,\ v_e\cdot n_{\downarrow}\ge\|v_e\|\cos\theta\},\\
\mathcal C_{\mathrm{approach,path}}^-
&=\mathcal H_i\cup\{w=w_b,\ v_e\cdot n_{\rightarrow}\ge\|v_e\|\cos\theta\}.
\end{aligned}
$$

The correct sequence then scripts an 8 mm button stroke and indicator light.
These effects are authored visual completion, not contact-dynamics results.

Candidate repair: revise the final approach direction while preserving the
target, gripper pose and opening.

## 04. Scene A: progress stagnation

Task: transport the grasped apple to the placement reference. Both sequences
share the grasp and lift. The transport specifications differ as follows:

$$
\begin{aligned}
\mathcal C_{\mathrm{carry,sg}}^+&=\{d_G(T)\le\epsilon_p\},\\
\mathcal C_{\mathrm{carry,path}}^+&=\mathcal H_i\cup\mathcal A_{\mathrm{apple}},\\
\mathcal C_{\mathrm{carry,sg}}^-&=\varnothing,\\
\mathcal C_{\mathrm{carry,path}}^-&=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}.
\end{aligned}
$$

The incorrect example omits an effective transport endpoint condition and
illustrates local oscillation. Its motion is hand-authored; omission alone
does not prove a planner will stagnate. Distance trends must be interpreted
over an active transport window, excluding waits, detours and completed-stage
holds. The correct reference reaches the placement pose but **remains held**.

Candidate repair: add stage completion, preserving apple binding and grasp
attachment. The website exports authored TCP distance samples for both cases.

## 05. Scene D: collision risk and release

Task: carry the apple over the barrier and place it on the plate. The intended
placement predicate combines a lateral reference and mesh-bottom height:

$$
\Phi_G(T_o)\Longleftrightarrow
\bigl(\|c_{o,xy}-g_{xy}\|\le\epsilon_{xy}\bigr)
\land\bigl(|z_{\min}(T_o)-z_{\mathrm{plate}}|\le\epsilon_z\bigr).
$$

`B(t)` includes the robot, gripper and carried apple; `O` is the prohibited
barrier. Both complete candidate specifications share the intended placement
goal. Low-height conditions apply only to transfer past the barrier.

$$
\begin{aligned}
\mathcal C_{\mathrm{carry,sg}}^+
&=\mathcal C_{\mathrm{carry,sg}}^-=\{\Phi_G(T_o(T))\},\\
\mathcal C_{\mathrm{carry,path}}^+
&=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}
 \cup\{\operatorname{dist}(\mathcal B(t),\mathcal O)\ge\delta\},\\
\mathcal C_{\mathrm{carry,path}}^-
&=\mathcal H_i\cup\mathcal A_{\mathrm{apple}}\cup\{z_e(t)=z_{\mathrm{low}}\}.
\end{aligned}
$$

The illustrative clearance requirement is 20 mm; low transfer height is
0.350 m, compared with approximately 0.490 m in the correct crossing segment.
The incorrect playback stops about 2.5 mm before contact. The dashed line
represents the unplayed hazardous continuation. The truncated playback does
not satisfy the full candidate endpoint specification.

Let `T_s` be the moment of placement. The correct sequence completes release
and retreat:

$$
\begin{aligned}
\mathcal C_{\mathrm{release,sg}}&=\{w(T)=w_{\mathrm{open}},\ \Phi_G(T_o(T))\},\\
\mathcal C_{\mathrm{release,path}}&=\mathcal H_i\cup\{T_o(t)=T_o(T_s)\},\\
\mathcal C_{\mathrm{retreat,sg}}&=\{z_e(T)-z_e(T_s)\ge h_r\},\\
\mathcal C_{\mathrm{retreat,path}}&=\mathcal H_i\cup\{w=w_{\mathrm{open}},\ T_o(t)=T_o(T_s)\}.
\end{aligned}
$$

The object is frozen after placement for scripted visualization. Release
starts at frame 405, retreat at frame 435, and retreat height is approximately
69 mm. The video has 540 frames at 30 fps.

Candidate repair: add obstacle clearance for robot and carried-object
geometry while preserving the placement goal and valid completion stages.

## Interpretation

These pairs explain local repair scope, not unique causal attribution or
automatic repair success. A real closed-loop evaluation must separately
record original constraints, detected evidence, repair outputs, replanned
trajectories and re-check results. Quantitative benchmark targets are not
reported as measured performance on this website.
