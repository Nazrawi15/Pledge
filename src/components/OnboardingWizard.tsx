import { useState } from 'react'

const CURRENCIES = [
  { code: 'USD', flag: '💵', country: 'USD · Save in Dollars', inflation: 'global' },
  { code: 'EUR', flag: '💶', country: 'EUR · Save in Euros', inflation: 'global' },
  { code: 'TRY', flag: '🇹🇷', country: 'Turkey — Lira', inflation: '65%' },
  { code: 'ARS', flag: '🇦🇷', country: 'Argentina — Peso', inflation: '211%' },
  { code: 'NGN', flag: '🇳🇬', country: 'Nigeria — Naira', inflation: '28.9%' },
  { code: 'PKR', flag: '🇵🇰', country: 'Pakistan — Rupee', inflation: '29%' },
  { code: 'EGP', flag: '🇪🇬', country: 'Egypt — Pound', inflation: '35%' },
  { code: 'GHS', flag: '🇬🇭', country: 'Ghana — Cedi', inflation: '23%' },
  { code: 'ETB', flag: '🇪🇹', country: 'Ethiopia — Birr', inflation: '30.2%' },
  { code: 'UAH', flag: '🇺🇦', country: 'Ukraine — Hryvnia', inflation: '26.6%' },
  { code: 'IDR', flag: '🇮🇩', country: 'Indonesia — Rupiah', inflation: '2.8%' },
  { code: 'RON', flag: '🇷🇴', country: 'Romania — Leu', inflation: '10.4%' },
  { code: 'GEL', flag: '🇬🇪', country: 'Georgia — Lari', inflation: '9.5%' },
  { code: 'AOA', flag: '🇦🇴', country: 'Angola — Kwanza', inflation: '20%' },
]

const INFLATION_EXPERIENCES = [
  { id: 'badly', label: 'Yes, badly', desc: 'My savings lost significant value' },
  { id: 'little', label: 'A little', desc: 'I noticed prices going up' },
  { id: 'notyet', label: 'Not yet', desc: 'But I want to be prepared' },
]

const GOALS = [
  { id: 'protect', label: 'Protect my savings', desc: 'Stop inflation eating my money' },
  { id: 'grow', label: 'Grow my wealth', desc: 'Earn as much yield as possible' },
  { id: 'goal', label: 'Save for something specific', desc: 'House, education, emergency fund' },
  { id: 'discipline', label: 'Build saving discipline', desc: 'Commit and stop impulse spending' },
]

const LOCK_PREFS = [
  { id: 'flexible', label: 'Flexible', desc: 'I might need it anytime' },
  { id: '30', label: '30 days', desc: 'Short commitment' },
  { id: '60', label: '60 days', desc: 'Medium commitment' },
  { id: '90', label: '90 days', desc: 'Maximum rewards' },
]

type Step = 'currency' | 'experience' | 'goal' | 'lock' | 'loading' | 'result'

interface WizardState {
  currency: typeof CURRENCIES[0] | null
  experience: typeof INFLATION_EXPERIENCES[0] | null
  goal: typeof GOALS[0] | null
  lockPref: typeof LOCK_PREFS[0] | null
}

const wStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  @keyframes wiz-spin { to { transform: rotate(360deg); } }
  @keyframes wiz-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes wiz-pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.8); }
    50% { opacity: 1; transform: scale(1.2); }
  }
  @keyframes wiz-fade { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .wiz-opt {
    width: 100%;
    padding: 16px 18px;
    border-radius: 12px;
    border: 1.5px solid #e8e0d8;
    background: #faf6f0;
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    font-family: 'Plus Jakarta Sans', sans-serif;
    position: relative;
  }
  .wiz-opt:hover {
    border-color: #10b981;
    background: rgba(16,185,129,0.04);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16,185,129,0.12);
  }
  .wiz-dd-item {
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-bottom: 1px solid #f0ebe3;
    background: transparent;
    cursor: pointer;
    text-align: left;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: background 0.1s ease;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }
  .wiz-dd-item:hover { background: #faf6f0; }
  .wiz-dd-item:last-child { border-bottom: none; }
`

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState<Step>('currency')
  const [state, setState] = useState<WizardState>({ currency: null, experience: null, goal: null, lockPref: null })
  const [recommendation, setRecommendation] = useState('')
  const [error, setError] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)

  async function getRecommendation(wizardState: WizardState) {
    setStep('loading')
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 150,
          messages: [
            { role: 'system', content: `You are a warm, empathetic DeFi savings advisor for HoldFirm — a savings app for people facing inflation or currency risk anywhere in the world. You give short, personal, actionable advice. Never use bullet points. Always write in flowing paragraphs.` },
            { role: 'user', content: `A user answered 4 questions:
1. Local currency: ${wizardState.currency?.country} (${wizardState.currency?.code}, inflation: ${wizardState.currency?.inflation})
2. Inflation experience: ${wizardState.experience?.label} — ${wizardState.experience?.desc}
3. Goal: ${wizardState.goal?.label} — ${wizardState.goal?.desc}
4. Lock preference: ${wizardState.lockPref?.label} — ${wizardState.lockPref?.desc}

HoldFirm modes:
- NestSave: Simple USDC or EURC savings at 4-5% APY. Best for basic inflation protection with full flexibility.
- DisciplineVault: Onchain lock for 30/60/90 days. Early withdrawers pay 4.5% penalty redistributed to committed savers. Best for discipline + earning from others.

Write exactly 2 short paragraphs under 100 words total. Be warm, direct, and specific. Para 1: Acknowledge their situation in one sentence and recommend NestSave or DisciplineVault. Para 2: What their savings look like in 90 days. No bullet points.` },
          ],
        }),
      })
      const data = await response.json()
      setRecommendation(data.choices?.[0]?.message?.content ?? 'Unable to generate recommendation.')
      setStep('result')
    } catch {
      setError('Could not connect. Please try again.')
      setStep('result')
    }
  }

  const progressSteps = ['currency', 'experience', 'goal', 'lock']
  const currentIndex = progressSteps.indexOf(step)

  const stepTitles: Record<string, { title: string; sub: string }> = {
    currency: { title: "What's your local currency?", sub: 'HoldFirm works everywhere — pick the closest match' },
    experience: { title: 'Has inflation hurt your savings?', sub: state.currency?.code === 'USD' || state.currency?.code === 'EUR' ? 'Currency risk affects everyone differently' : `${state.currency?.country ?? 'Your region'} has ${state.currency?.inflation} annual inflation` },
    goal: { title: "What's your main savings goal?", sub: "We'll recommend the best saving mode for you" },
    lock: { title: 'How long can you commit?', sub: 'Longer locks earn more from the penalty pool' },
  }

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(28,25,23,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', backdropFilter: 'blur(16px)', overflow: 'auto' }}>
      <style>{wStyles}</style>

      <div style={{ backgroundColor: '#fefcf9', borderRadius: '24px', width: '100%', maxWidth: '520px', maxHeight: '95vh', overflowY: 'visible', border: '1px solid #e8e0d8', boxShadow: '0 32px 80px rgba(28,25,23,0.2), 0 8px 24px rgba(28,25,23,0.1)', fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'wiz-up 0.4s ease forwards', position: 'relative' }}>

        {/* Amber+green gradient top bar */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: '24px 24px 0 0' }} />

        {/* Header */}
        <div style={{ padding: '22px 28px 18px', borderBottom: '1px solid #f0ebe3' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: currentIndex >= 0 ? '16px' : '0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #fef3c7, #d1fae5)', border: '1px solid #e8e0d8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#1c1917', letterSpacing: '-0.2px' }}>AI Strategy Advisor</div>
                <div style={{ fontSize: '12px', color: '#78716c', marginTop: '1px', fontWeight: 500 }}>Powered by Llama 3.3</div>
              </div>
            </div>
            {currentIndex >= 0 && (
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: '#a8a29e', fontWeight: 700, fontFamily: "'DM Mono', monospace" }}>{currentIndex + 1} / 4</div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          {currentIndex >= 0 && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {progressSteps.map((s, i) => (
                <div key={s} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < currentIndex ? '#10b981' : i === currentIndex ? 'linear-gradient(90deg, #f59e0b, #10b981)' : '#f0ebe3', transition: 'background 0.3s ease', position: 'relative', overflow: 'hidden' }}>
                  {i === currentIndex && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: '2px' }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '22px 28px 28px' }}>

          {/* Step heading */}
          {currentIndex >= 0 && (
            <div style={{ marginBottom: '18px', animation: 'wiz-fade 0.3s ease forwards' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 400, color: '#1c1917', margin: '0 0 6px 0', fontFamily: 'Instrument Serif, Georgia, serif', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                {stepTitles[step]?.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#78716c', margin: 0, fontWeight: 500 }}>
                {stepTitles[step]?.sub}
              </p>
            </div>
          )}

          {/* STEP 1: Currency picker */}
          {step === 'currency' && (
            <div>
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', border: `1.5px solid ${state.currency ? '#10b981' : '#d6cdc3'}`, background: state.currency ? 'rgba(16,185,129,0.04)' : '#faf6f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s', boxShadow: dropdownOpen ? '0 0 0 3px rgba(16,185,129,0.1)' : 'none' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {state.currency ? (
                      <>
                        <span style={{ fontSize: '24px' }}>{state.currency.flag}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917' }}>{state.currency.country}</div>
                          <div style={{ fontSize: '12px', color: '#78716c', fontWeight: 500 }}>
                            {state.currency.code === 'USD' || state.currency.code === 'EUR' ? 'Save in stable currency · works globally' : `${state.currency.inflation} annual inflation`}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: '15px', color: '#a8a29e', fontWeight: 500 }}>Select your local currency...</span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: '#a8a29e', transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block' }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 999999, backgroundColor: '#fefcf9', border: '1px solid #e8e0d8', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 20px 48px rgba(28,25,23,0.14), 0 4px 12px rgba(28,25,23,0.08)', maxHeight: '280px', overflowY: 'auto' }}>
                    {/* Global section */}
                    <div style={{ padding: '8px 16px 5px', fontSize: '11px', fontWeight: 800, color: '#059669', letterSpacing: '0.8px', textTransform: 'uppercase', background: 'rgba(16,185,129,0.04)', borderBottom: '1px solid #f0ebe3' }}>
                      🌍 Global — Stable Currency
                    </div>
                    {CURRENCIES.slice(0, 2).map(c => (
                      <button key={c.code} className="wiz-dd-item" onClick={() => { setState(s => ({ ...s, currency: c })); setDropdownOpen(false) }} style={{ background: 'rgba(16,185,129,0.02)' }}>
                        <span style={{ fontSize: '22px' }}>{c.flag}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#1c1917' }}>{c.country}</div>
                          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 500 }}>Best for global savers</div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, background: '#d1fae5', padding: '2px 8px', borderRadius: '20px' }}>Stable</span>
                      </button>
                    ))}
                    {/* Local currencies section */}
                    <div style={{ padding: '8px 16px 5px', fontSize: '11px', fontWeight: 800, color: '#d97706', letterSpacing: '0.8px', textTransform: 'uppercase', borderBottom: '1px solid #f0ebe3' }}>
                      📍 High-Inflation Currencies
                    </div>
                    {CURRENCIES.slice(2).map(c => (
                      <button key={c.code} className="wiz-dd-item" onClick={() => { setState(s => ({ ...s, currency: c })); setDropdownOpen(false) }}>
                        <span style={{ fontSize: '22px' }}>{c.flag}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917' }}>{c.country}</div>
                        </div>
                        <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 700, background: '#fef3c7', padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>{c.inflation}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {state.currency && (
                <button
                  onClick={() => setStep('experience')}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', fontWeight: 700, fontSize: '16px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'opacity 0.15s', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                >
                  Continue →
                </button>
              )}

              <p style={{ fontSize: '12px', color: '#a8a29e', fontWeight: 500, textAlign: 'center', marginTop: '14px', lineHeight: 1.5 }}>
                Don't see your currency? USD savings protect anyone from local currency risk.
              </p>
            </div>
          )}

          {/* STEP 2: Experience */}
          {step === 'experience' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'wiz-fade 0.3s ease forwards' }}>
              {INFLATION_EXPERIENCES.map(e => (
                <button key={e.id} className="wiz-opt" onClick={() => { setState(s => ({ ...s, experience: e })); setStep('goal') }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917', marginBottom: '3px' }}>{e.label}</div>
                  <div style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>{e.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 3: Goal */}
          {step === 'goal' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'wiz-fade 0.3s ease forwards' }}>
              {GOALS.map(g => (
                <button key={g.id} className="wiz-opt" onClick={() => { setState(s => ({ ...s, goal: g })); setStep('lock') }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917', marginBottom: '3px' }}>{g.label}</div>
                  <div style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>{g.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* STEP 4: Lock */}
          {step === 'lock' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'wiz-fade 0.3s ease forwards' }}>
              {LOCK_PREFS.map(l => (
                <button key={l.id} className="wiz-opt" onClick={() => { const ns = { ...state, lockPref: l }; setState(ns); getRecommendation(ns) }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1c1917', marginBottom: '3px' }}>{l.label}</div>
                  <div style={{ fontSize: '13px', color: '#78716c', fontWeight: 500 }}>{l.desc}</div>
                </button>
              ))}
            </div>
          )}

          {/* LOADING */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '52px 20px', animation: 'wiz-fade 0.3s ease forwards' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '32px' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === 0 ? '#f59e0b' : i === 1 ? '#10b981' : '#f59e0b', animation: `wiz-pulse 1.4s ease-in-out ${i * 0.25}s infinite` }} />
                ))}
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: 400, color: '#1c1917', margin: '0 0 10px 0', fontFamily: 'Instrument Serif, Georgia, serif' }}>Analyzing your situation...</h3>
              <p style={{ fontSize: '14px', color: '#78716c', margin: 0, fontWeight: 500 }}>Building your personalized savings strategy</p>
            </div>
          )}

          {/* RESULT */}
          {step === 'result' && (
            <div style={{ animation: 'wiz-fade 0.4s ease forwards' }}>
              {/* Result header card */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px', padding: '16px 18px', background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(16,185,129,0.06))', border: '1px solid #e8e0d8', borderRadius: '14px' }}>
                <span style={{ fontSize: '32px' }}>{state.currency?.flag}</span>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#1c1917', margin: 0 }}>Your personalized strategy</p>
                  <p style={{ fontSize: '12px', color: '#78716c', margin: '3px 0 0', fontWeight: 500 }}>Powered by Llama 3.3 · Based on your answers</p>
                </div>
              </div>

              {error ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px', marginBottom: '18px' }}>
                  <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: 500, margin: 0 }}>{error}</p>
                </div>
              ) : (
                <div style={{ background: '#faf6f0', border: '1px solid #e8e0d8', borderRadius: '14px', padding: '20px', marginBottom: '18px' }}>
                  <p style={{ color: '#1c1917', fontSize: '15px', lineHeight: 1.85, margin: 0, fontWeight: 400 }}>{recommendation}</p>
                </div>
              )}

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '22px' }}>
                {[state.currency?.country, state.goal?.label, state.lockPref?.label].filter(Boolean).map((tag, i) => (
                  <span key={i} style={{ background: '#faf6f0', color: '#44403c', fontSize: '12px', fontWeight: 600, padding: '5px 12px', borderRadius: '20px', border: '1px solid #e8e0d8' }}>{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setStep('currency'); setState({ currency: null, experience: null, goal: null, lockPref: null }); setRecommendation(''); setError('') }}
                  style={{ flex: 1, padding: '13px', borderRadius: '12px', border: '1.5px solid #e8e0d8', background: 'transparent', color: '#44403c', fontWeight: 600, fontSize: '14px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Start over
                </button>
                <button
                  onClick={onComplete}
                  style={{ flex: 2, padding: '13px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', fontWeight: 700, fontSize: '15px', cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}
                >
                  Start Saving →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
