import { useMemo, useState } from 'react';

const calculatorCopy = {
  English: {
    back: ' Back to Scheme',
    eyebrow: 'YOJANAX · Financial Calculator',
    heading: 'EMI & Repayment Calculator',
    subtitle: 'Estimate your monthly EMI, total interest, and repayment for government-backed loan schemes. Adjust the sliders below to match your requirements accordingly. ',
    controlsTitle: 'Loan Parameters',
    controlsDesc: 'Drag or type to adjust values',
    loanAmount: 'Loan Amount',
    interestRate: 'Interest Rate (p.a.)',
    tenureMonths: 'Loan Tenure',
    months: 'months',
    disclaimer: '⚠️ This is an estimate based on the selected scheme. Final repayment may vary based on lender-specific terms and charges. Parameters above may or may not match respective scheme details.', resultEyebrow: 'Estimate Ready',
    resultTitle: 'Repayment Breakdown',
    demoBadge: 'Scheme Estimate',
    totalPayable: 'Total Payable',
    demoEstimate: 'based on selected Scheme estimate',
    principalAmount: 'Principal',
    interestAmount: 'Interest',
    estimatedEmi: 'Estimated Monthly EMI',
    perMonth: '/ month',
    calculateBtn: 'Apply Now',
    totalRepayment: 'Total Repayment',
    totalInterest: 'Total Interest',
    rateLabel: 'Interest Rate',
    periodLabel: 'Loan Period',
  },
  'हिंदी': {
    back: '← योजना पर वापस जाएं',
    eyebrow: 'YOJANAX · वित्तीय कैलकुलेटर',
    heading: 'EMI और पुनर्भुगतान कैलकुलेटर',
    subtitle: 'सरकारी ऋण योजनाओं के लिए अपनी मासिक EMI, कुल ब्याज और पुनर्भुगतान का अनुमान लगाएं।',
    controlsTitle: 'ऋण मापदंड',
    controlsDesc: 'मान बदलने के लिए खिसकाएं या टाइप करें',
    loanAmount: 'ऋण राशि',
    interestRate: 'ब्याज दर (प्रति वर्ष)',
    tenureMonths: 'ऋण अवधि',
    months: 'महीने',
    disclaimer: '⚠️ यह चयनित योजना के आधार पर एक अनुमान है। अंतिम पुनर्भुगतान ऋणदाता की शर्तों और शुल्क के अनुसार अलग हो सकता है।',
    resultEyebrow: 'अनुमान तैयार',
    resultTitle: 'पुनर्भुगतान विवरण',
    demoBadge: 'योजना अनुमान',
    totalPayable: 'कुल देय',
    demoEstimate: 'चयनित योजना के आधार पर',
    principalAmount: 'मूलधन',
    interestAmount: 'ब्याज',
    estimatedEmi: 'अनुमानित मासिक EMI',
    perMonth: '/ माह',
    calculateBtn: 'अभी आवेदन करें',
    totalRepayment: 'कुल पुनर्भुगतान',
    totalInterest: 'कुल ब्याज',
    rateLabel: 'ब्याज दर',
    periodLabel: 'ऋण अवधि',
  },
};

const calculatorConfig = {
  loanAmount: { min: 50000, max: 1000000, step: 5000, initial: 250000 },
  interestRate: { min: 1, max: 20, step: 0.1, initial: 10.5 },
  tenureMonths: { min: 6, max: 84, step: 1, initial: 36 },
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return `₹${currencyFormatter.format(Math.round(value))}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function parseInput(value, fallback) {
  const parsed = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function DonutChart({ principal, interest, total, copy }) {
  const principalRatio = total > 0 ? principal / total : 1;
  const circumference = 2 * Math.PI * 92;
  const principalLength = circumference * principalRatio;

  return (
    <div className="relative mx-auto h-72 w-72 sm:h-80 sm:w-80">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220" role="img" aria-label="Principal and interest breakdown">
        <circle cx="110" cy="110" r="92" fill="none" stroke="#e2e8f0" strokeWidth="24" />
        <circle
          cx="110"
          cy="110"
          r="92"
          fill="none"
          stroke="#102a56"
          strokeDasharray={`${principalLength} ${circumference - principalLength}`}
          strokeLinecap="round"
          strokeWidth="24"
        />
        <circle
          cx="110"
          cy="110"
          r="92"
          fill="none"
          stroke="#f28c28"
          strokeDasharray={`${circumference - principalLength} ${principalLength}`}
          strokeDashoffset={-principalLength}
          strokeLinecap="round"
          strokeWidth="24"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{copy.totalPayable}</span>
        <strong className="mt-2 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">{formatCurrency(total)}</strong>
        <span className="mt-1 text-xs text-slate-500">{copy.demoEstimate}</span>
      </div>
    </div>
  );
}

function SliderControl({ label, value, min, max, step, suffix, onChange, monthsText }) {
  const displayValue =
    suffix === '%'
      ? `${value}%`
      : suffix === 'months'
        ? `${value} ${monthsText ?? 'months'}`
        : formatCurrency(value);
  return (
    <div className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-bold text-navy-900">{label}</label>
        <div className="relative w-32 sm:w-36">
          {suffix === '₹' && <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-semibold text-slate-500">₹</span>}
          <input
            aria-label={label}
            className={`w-full rounded-lg border border-slate-300 bg-white py-2 text-right text-sm font-bold text-navy-900 outline-none transition focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10 ${suffix === '₹' ? 'pl-7 pr-3' : 'px-3'}`}
            inputMode="decimal"
            onChange={(event) => onChange(event.target.value)}
            type="text"
            value={suffix === '₹' ? currencyFormatter.format(value) : displayValue}
          />
        </div>
      </div>
      <input
        aria-label={`${label} slider`}
        className="mt-5 h-2 w-full cursor-pointer accent-saffron-500"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        step={step}
        type="range"
        value={value}
      />
      <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
        <span>{suffix === '%' ? `${min}%` : suffix === 'months' ? `${min} ${monthsText ?? 'months'}` : formatCurrency(min)}</span>
        <span>{suffix === '%' ? `${max}%` : suffix === 'months' ? `${max} ${monthsText ?? 'months'}` : formatCurrency(max)}</span>
      </div>
    </div>
  );
}

export default function Calculator({ onBack, language = 'English', scheme }) {
  const [loanAmount, setLoanAmount] = useState(calculatorConfig.loanAmount.initial);
  const [interestRate, setInterestRate] = useState(calculatorConfig.interestRate.initial);
  const [tenureMonths, setTenureMonths] = useState(calculatorConfig.tenureMonths.initial);

  const copy = calculatorCopy[language] ?? calculatorCopy.English;
  const selectedSchemeName =
    scheme?.scheme_name ?? scheme?.name ?? 'Selected Scheme';

  const result = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const emi = monthlyRate === 0
      ? loanAmount / tenureMonths
      : (loanAmount * monthlyRate * (1 + monthlyRate) ** tenureMonths) / ((1 + monthlyRate) ** tenureMonths - 1);
    const totalRepayment = emi * tenureMonths;

    return {
      emi,
      totalRepayment,
      totalInterest: Math.max(totalRepayment - loanAmount, 0),
    };
  }, [interestRate, loanAmount, tenureMonths]);

  const setAmount = (value) => setLoanAmount(clamp(parseInput(value, loanAmount), calculatorConfig.loanAmount.min, calculatorConfig.loanAmount.max));
  const setRate = (value) => setInterestRate(clamp(parseInput(value, interestRate), calculatorConfig.interestRate.min, calculatorConfig.interestRate.max));
  const setTenure = (value) => setTenureMonths(clamp(Math.round(parseInput(value, tenureMonths)), calculatorConfig.tenureMonths.min, calculatorConfig.tenureMonths.max));

  return (
    <main className="min-h-screen bg-[#f7f9fc] px-4 py-8 font-sans text-slate-800 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 border-b border-slate-200 pb-6 sm:mb-10">
          <button
            className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-100 hover:text-saffron-600 cursor-pointer"
            onClick={onBack}
            type="button"
          >
            <span aria-hidden="true">←</span>
            {copy.back}
          </button>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron-600">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">{copy.heading}</h1>
          <p className="mt-2 text-xl font-semibold text-saffron-600">
            {selectedSchemeName}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{copy.subtitle}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="calculator-controls-title">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-navy-900" id="calculator-controls-title">{copy.controlsTitle}</h2>
              <p className="mt-1 text-sm text-slate-500">{copy.controlsDesc}</p>
            </div>
            <div className="space-y-7">
              <SliderControl label={copy.loanAmount} value={loanAmount} min={calculatorConfig.loanAmount.min} max={calculatorConfig.loanAmount.max} step={calculatorConfig.loanAmount.step} suffix="₹" onChange={setAmount} />
              <SliderControl label={copy.interestRate} value={interestRate} min={calculatorConfig.interestRate.min} max={calculatorConfig.interestRate.max} step={calculatorConfig.interestRate.step} suffix="%" onChange={setRate} />
              <SliderControl label={copy.tenureMonths} value={tenureMonths} min={calculatorConfig.tenureMonths.min} max={calculatorConfig.tenureMonths.max} step={calculatorConfig.tenureMonths.step} suffix="months" monthsText={copy.months} onChange={setTenure} />
            </div>
            <div className="mt-8 rounded-xl border border-orange-100 bg-orange-50/70 p-4 text-xs leading-relaxed text-slate-600">
              {copy.disclaimer}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" aria-labelledby="calculator-result-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">{copy.resultEyebrow}</p>
                <h2 className="mt-2 text-xl font-bold text-navy-900" id="calculator-result-title">{copy.resultTitle}</h2>
              </div>
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 sm:inline-flex">{copy.demoBadge}</span>
            </div>

            <DonutChart principal={loanAmount} interest={result.totalInterest} total={result.totalRepayment} copy={copy} />

            <div className="mx-auto mt-2 grid max-w-md grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><span className="h-3 w-3 rounded-full bg-navy-900" />{copy.principalAmount} <strong className="ml-auto text-navy-900">{formatCurrency(loanAmount)}</strong></div>
              <div className="flex items-center gap-2 text-slate-600"><span className="h-3 w-3 rounded-full bg-saffron-500" />{copy.interestAmount} <strong className="ml-auto text-navy-900">{formatCurrency(result.totalInterest)}</strong></div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div><p className="text-sm font-semibold text-slate-500">{copy.estimatedEmi}</p><p className="mt-1 text-4xl font-extrabold tracking-tight text-navy-900">{formatCurrency(result.emi)}<span className="ml-2 text-sm font-semibold text-slate-500">{copy.perMonth}</span></p></div>

              </div>
              <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-slate-100 pt-5 sm:grid-cols-4">
                <div><dt className="text-xs text-slate-500">{copy.totalRepayment}</dt><dd className="mt-1 text-sm font-bold text-navy-900">{formatCurrency(result.totalRepayment)}</dd></div>
                <div><dt className="text-xs text-slate-500">{copy.totalInterest}</dt><dd className="mt-1 text-sm font-bold text-navy-900">{formatCurrency(result.totalInterest)}</dd></div>
                <div><dt className="text-xs text-slate-500">{copy.rateLabel}</dt><dd className="mt-1 text-sm font-bold text-navy-900">{interestRate}% p.a.</dd></div>
                <div><dt className="text-xs text-slate-500">{copy.periodLabel}</dt><dd className="mt-1 text-sm font-bold text-navy-900">{tenureMonths} {copy.months}</dd></div>
              </dl>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
