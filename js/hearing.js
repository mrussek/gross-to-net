// The audit committee confrontation: rebut each claim by presenting the right evidence.
(function () {
  const U = G.util;
  const root = document.getElementById('hearing');
  const H = { open: false };
  H.isOpen = () => H.open;

  const ROUNDS = [
    {
      who: 'celeste', key: 'r1', evidence: ['ev_rf'],
      claim: 'The trade accrual is an estimate. It’s reconciled every quarter, and I’m comfortable it’s supported.',
      press: 'Revenue Management provides the top-side adjustments. Those are judgment calls — that’s what we pay Victor for. I signed the Q2 rec myself.',
      wrongs: { default: 'Celeste: "I don’t see how that bears on whether the accrual is supported."' },
      after: [
        ['you', 'The roll-forward doesn’t roll. $30.55 million of "Other — per Rev Mgmt" top-sides over five quarters. No TPM support. Martin refused to sign Q2. You overrode him.'],
        ['celeste', '...Thirty million. I thought they were timing differences. Victor said—'],
        ['beck', 'Ms. Marr, we’ll come back to what you thought. Mr. Kessane, you’re up.'],
      ],
    },
    {
      who: 'victor', key: 'r2', evidence: ['ev_je'],
      claim: 'The Q3 true-up was a routine change in estimate. It went through normal close procedures, like every entry I’ve ever made.',
      press: 'Every entry in our ERP has an approver. That’s what SOX is for. I don’t even have posting rights — how would I post an unapproved entry?',
      wrongs: { default: 'Victor: "Interesting document. It says nothing about my estimate."' },
      after: [
        ['you', 'You’re right — you don’t have posting rights. So you checked out the firefighter ID at 11:41 PM on October 2nd, reopened a locked period, posted $8,450,000 with no approver, and locked it again at 12:06.'],
        ['lena', 'Back-dated, post-close, unapproved. Harold, my firm will need to reassess our reliance on management representations. All of them.'],
        ['victor', 'There was an interface problem. I fixed it.'],
        ['you', 'The interface posts at 11:15 every night. It posted fine. Yours was the only manual entry in that session.'],
      ],
    },
    {
      who: 'victor', key: 'r3', evidence: ['ev_vm', 'ev_dale'],
      claim: 'Fine — the accrual was aggressive. But Meridian Retail Solutions is an independent broker. I have no personal relationship with them whatsoever.',
      press: 'They came recommended by a retail contact. I couldn’t tell you who owns them. I’ve never been to their offices.',
      wrongs: { default: 'Victor: "That’s about a vendor’s billing. Not about me."' },
      after: [
        ['you', 'You’ve never been to their offices? Meridian’s remit-to address is 8812 Larkspur Court, Mason. That’s the address you gave HR for your emergency contact. Your sister, Elise Moore.'],
        ['victor', '...'],
        ['beck', 'Mr. Kessane. Is that your sister’s address?'],
        ['victor', 'My sister runs a small consulting business. That isn’t a crime.'],
      ],
    },
    {
      who: 'victor', key: 'r4', evidence: ['ev_pop'],
      claim: 'And Meridian *performed*. The promotions ran. Look at MegaMart in July — Kettle chips nearly doubled. That’s execution.',
      press: 'You want to second-guess retail execution from a spreadsheet? Ask any of our customers. Those events happened.',
      wrongs: { default: 'Victor: "That doesn’t tell you anything about whether promotions ran."' },
      after: [
        ['you', 'MegaMart in July was a retailer-run event — MegaMart’s own TPR. Meridian billed for it anyway. But four of six invoices I sampled billed for events with zero lift in scan data. FreshCo dish pods, weeks 29 through 34: flat. Grandway, flat. A second MegaMart display in September: flat.'],
        ['you', 'And the TPM calendar that says they were "executed" was edited under your ID on October 1st at 10:14 PM.'],
        ['stokes', 'Jesus, Victor.'],
      ],
    },
    {
      who: 'victor', key: 'r5', evidence: ['ev_benford'],
      claim: 'Every Meridian invoice was under fifty thousand and approved within the delegation of authority. The controls worked exactly as designed.',
      press: 'Small invoices, small events. That’s how retail execution is billed across this industry. If AP processed something wrong, talk to Dale.',
      wrongs: { default: 'Victor: "And that has what to do with the DoA?"' },
      after: [
        ['you', '548 Meridian invoices this year. Average: $48,372. Ninety-four percent land within five thousand of the Controller’s threshold. Leading digit 4 shows up at more than twice Benford’s expectation. That isn’t how retail execution is billed. That’s how you keep a Controller from ever seeing an invoice.'],
        ['dale', 'He told me to keep them under fifty. Every one. He paid me four thousand a month to set up the vendor and approve them. I’m sorry. I’m so sorry.'],
        ['victor', 'Dale. Shut up.'],
      ],
    },
    {
      who: 'beck', key: 'r6', evidence: ['ev_loss'],
      claim: '{last}, this committee needs a number. Before we call the SEC, the auditors, and the US Attorney — what has this cost Halvorsen’s shareholders?',
      press: 'Not invoices. Not estimates. Cash that left this company and isn’t coming back.',
      wrongs: { default: 'Beck: "That’s not a number, {last}."' },
      after: [
        ['you', 'Forty-two million, five hundred six thousand, eight hundred dollars. Net cash, vendor inception through September 30th. Q3 has to be corrected before the 10-Q, and prior periods evaluated under SAB 108.'],
        ['lena', 'We’ll be issuing a request to delay the filing. NT 10-Q.'],
      ],
    },
  ];

  let st;

  H.start = function () {
    return new Promise(resolve => {
      H.open = true;
      root.classList.remove('hidden');
      const saved = G.state.hearing || {};
      st = { round: saved.round || 0, cred: saved.cred != null ? saved.cred : 5, pressed: false, mode: 'claim', flash: null, resolve };
      render();
    });
  };

  function persist() { G.state.hearing = { round: st.round, cred: st.cred }; G.save(); }

  function close(result) {
    H.open = false;
    root.classList.add('hidden');
    root.innerHTML = '';
    st.resolve(result);
  }

  function hearts() {
    let s = '';
    for (let i = 0; i < 5; i++) s += i < st.cred ? '♥' : '<span class="lost">♥</span>';
    return s;
  }

  function sub(t) { return t.replace(/\{last\}/g, G.state.lastName).replace(/\{first\}/g, G.state.firstName); }

  function render() {
    if (st.round >= ROUNDS.length) return finale();
    const R = ROUNDS[st.round];
    const who = G.cast[R.who];
    root.innerHTML = '';
    const shell = U.el('div', { class: 'hr-shell' });
    shell.innerHTML = `<div class="hr-top"><div><div class="hr-title">Special Session of the Audit Committee</div><div class="hr-round">CLAIM ${st.round + 1} OF ${ROUNDS.length} · BOARDROOM, FLOOR 14 · FRI 10/09 9:04 AM</div></div><div class="hr-cred" title="Credibility with the committee">${hearts()}</div></div>`;
    const stmt = U.el('div', { class: 'hr-statement' });
    const pc = U.el('canvas', { width: 32, height: 32 });
    G.render.drawPortrait(pc, who.look);
    stmt.appendChild(pc);
    const txt = U.el('div', {}, `<div class="hr-who">${U.esc(who.name)}<small>${U.esc(who.title)}</small></div><div class="hr-quote">“${U.rich(sub(R.claim))}”</div>` + (st.pressed ? `<div class="hr-press">${U.rich(sub(R.press))}</div>` : ''));
    stmt.appendChild(txt);
    shell.appendChild(stmt);

    const actions = U.el('div', { class: 'hr-actions' });
    const bPress = U.el('button', {}, '“Press” — ask a follow-up');
    bPress.addEventListener('click', () => { st.pressed = true; G.audio.select(); render(); });
    if (!st.pressed) actions.appendChild(bPress);
    const bPresent = U.el('button', { class: 'primary' }, '⚑ Present evidence');
    bPresent.addEventListener('click', () => { st.mode = st.mode === 'present' ? 'claim' : 'present'; G.audio.select(); render(); });
    actions.appendChild(bPresent);
    const bPhone = U.el('button', {}, '\u{1F4F1} Check phone');
    bPhone.addEventListener('click', () => G.ui.openPhone());
    actions.appendChild(bPhone);
    shell.appendChild(actions);

    if (st.flash) shell.appendChild(U.el('div', { class: 'hr-flash ' + st.flash.kind }, U.rich(sub(st.flash.text))));

    if (st.mode === 'present') {
      const grid = U.el('div', { class: 'hr-evidence' });
      for (const id of G.state.evidence) {
        const d = G.story.evidence[id];
        const b = U.el('button', {}, '<b>' + U.esc(d.title) + '</b>' + U.esc(d.short));
        b.addEventListener('click', () => present(id));
        grid.appendChild(b);
      }
      shell.appendChild(grid);
    }
    root.appendChild(shell);
  }

  async function present(id) {
    const R = ROUNDS[st.round];
    if (R.evidence.includes(id)) {
      st.flash = null;
      root.innerHTML = '<div class="objection">EXCEPTION NOTED!</div>';
      G.audio.objection();
      G.engine.shakeScreen(6);
      await U.sleep(1100);
      root.classList.add('hidden');
      for (const [who, line] of R.after) await G.ui.say(who, sub(line));
      root.classList.remove('hidden');
      st.round++; st.pressed = false; st.mode = 'claim';
      persist();
      render();
    } else {
      st.cred--;
      G.audio.fail();
      G.engine.shakeScreen(3);
      st.flash = { kind: 'bad', text: (R.wrongs[id] || R.wrongs.default) + ' — The committee exchanges glances. (−1 credibility)' };
      st.mode = 'claim';
      persist();
      G.hints.fail('hearing.' + R.key);
      if (st.cred <= 0) {
        render();
        await U.sleep(900);
        root.classList.add('hidden');
        await G.ui.say('beck', 'I’ve heard enough. {last}, you came into this room with accusations against a twenty-year officer of this company and you can’t keep your own exhibits straight.');
        await G.ui.say('victor', 'Thank you, Harold. I’m sure {first} meant well.');
        await G.ui.say('beck', 'This session is adjourned. We’ll reconvene when management has had a chance to respond in writing.');
        G.state.hearing = { round: st.round, cred: 5 };
        G.save();
        close('lose');
        return;
      }
      render();
    }
  }

  async function finale() {
    root.classList.add('hidden');
    await G.ui.say('beck', 'Mr. Kessane, you are suspended effective immediately. Security will escort you from the building. Do not access any company system. Counsel will be in touch.');
    await G.ui.say('victor', '...');
    await G.ui.narrate('Victor stands. On his way past, he stops beside you and lowers his voice.');
    for (;;) {
      const c = await G.ui.choose('victor', 'You know what Martin got? Eighteen months’ salary and a non-disparagement agreement. It’s not too late to be reasonable, {first}. Whatever they pay you, I can—', [
        'Martin’s NDA can’t stop him from talking to the SEC. Rule 21F-17. And I’m not for sale.',
        '...How much are we talking about?',
        'Say nothing. Let security do their job.',
      ]);
      if (c === 0) {
        await G.ui.say('victor', '...');
        await G.ui.say('beck', 'Get him out of here.');
        break;
      } else if (c === 1) {
        G.hints.fail('hearing.r7');
        await G.ui.say('beck', 'I’m going to pretend I didn’t hear that, {last}. Try again.');
      } else {
        await G.ui.narrate('Victor smiles thinly, as if your silence were a negotiation.');
        await G.ui.say('victor', 'Think about it. Martin did.');
      }
    }
    G.state.hearing = null;
    H.open = false;
    root.innerHTML = '';
    st.resolve('win');
  }

  G.hearing = H;
})();
