import { useState, useEffect } from 'react';

// Local mock data shaped for a future scheme recommendations API response.
const mockSchemes = [
  {
    id: 'sample-entrepreneurship-a',
    scheme_name: 'Pradhan Mantri Mudra Yojana (PMMY)',
    description: 'A fictional support programme for entrepreneurs exploring funding for a new or growing business.',
    match_score: 92,
    matchStatus: 'Strong Match',
    recommendation_reason: [
      'Matches your profile as a new business starter.',
      'Aligns with your selected business activity.',
      'Fits the funding purpose in your questionnaire.',
    ],
  },
  {
    id: 'sample-micro-business-b',
    scheme_name: 'Credit Guarantee Trust for Micro and Small Enterprises (CGTMSE)',
    description: 'A fictional finance discovery option for small enterprises reviewing working-capital needs.',
    match_score: 85,
    matchStatus: 'Good Match',
    recommendation_reason: [
      'Matches your stated business category.',
      'Relates to your indicated funding requirement.',
    ],
  },
  {
    id: 'sample-growth-assistance-c',
    scheme_name: 'Stand-Up India Scheme',
    description: 'A fictional programme for applicants comparing support options for business expansion.',
    match_score: 78,
    matchStatus: 'Potential Match',
    recommendation_reason: [
      'Connects with your selected expansion goal.',
      'May suit the business information you provided.',
      'Requires further review of applicable criteria.',
    ],
  },
];

const statusStyles = {
  'Strong Match': 'bg-orange-100 text-saffron-700',
  'Good Match': 'bg-blue-50 text-navy-700',
  'Potential Match': 'bg-slate-100 text-slate-700',
};

const recommendationCopy = {
  English: { back: 'Back to questionnaire', matching: 'Scheme Matching', eyebrow: 'Personalized discovery', heading: 'Your Recommended Schemes', subtitle: 'Based on the information you provided, here are schemes that may be suitable for you.', why: 'Why this may suit you', details: 'View Scheme Details', match: 'Match', note: 'Recommendations are based on the information provided and applicable scheme criteria. Please verify the latest eligibility requirements before applying.',  loadingTitle: 'Finding the best schemes for you...',
  loadingSubtitle: 'Please wait while YojanaX analyzes your profile and matches the most relevant government schemes.' },
  'हिंदी': { back: 'प्रश्नावली पर वापस जाएं', matching: 'योजना मिलान', eyebrow: 'व्यक्तिगत खोज', heading: 'आपकी अनुशंसित योजनाएं', subtitle: 'आपके द्वारा दी गई जानकारी के आधार पर, यहां आपके लिए उपयुक्त योजनाएं हैं।', why: 'यह आपके लिए उपयुक्त क्यों हो सकती है', details: 'योजना विवरण देखें', match: 'मिलान', note: 'अनुशंसाएं दी गई जानकारी और लागू योजना मानदंडों पर आधारित हैं। आवेदन से पहले नवीनतम पात्रता आवश्यकताओं की जांच करें।' },
  'मराठी': { back: 'प्रश्नावलीकडे परत जा', matching: 'योजना जुळणी', eyebrow: 'वैयक्तिक शोध', heading: 'तुमच्यासाठी शिफारस केलेल्या योजना', subtitle: 'तुम्ही दिलेल्या माहितीच्या आधारे, तुमच्यासाठी योग्य योजना येथे आहेत.', why: 'ही तुमच्यासाठी योग्य का असू शकते', details: 'योजनेचा तपशील पहा', match: 'जुळणी', note: 'शिफारसी दिलेल्या माहिती आणि लागू योजना निकषांवर आधारित आहेत. अर्ज करण्यापूर्वी नवीनतम पात्रता तपासा.' },
  'भोजपुरी': { back: 'प्रश्नावली पर वापस जाईं', matching: 'योजना मिलान', eyebrow: 'आपके खातिर खोज', heading: 'रउरा खातिर सुझावल योजना', subtitle: 'रउरा देहल जानकारी के आधार पर, रउरा खातिर सही हो सके वाला योजना इहां बा।', why: 'ई रउरा खातिर सही काहे हो सकेला', details: 'योजना के विवरण देखीं', match: 'मिलान', note: 'सिफारिश रउरा देहल जानकारी आ लागू योजना के नियम पर आधारित बा। आवेदन से पहिले नवीनतम पात्रता जांचीं।' },
  'தமிழ்': { back: 'கேள்வித்தாளுக்குத் திரும்பு', matching: 'திட்ட பொருத்தம்', eyebrow: 'தனிப்பயன் தேடல்', heading: 'உங்களுக்குப் பரிந்துரைக்கப்பட்ட திட்டங்கள்', subtitle: 'நீங்கள் வழங்கிய தகவலின் அடிப்படையில், உங்களுக்கு ஏற்ற திட்டங்கள் இங்கே உள்ளன.', why: 'இது உங்களுக்கு ஏற்றதாக இருக்கக்கூடிய காரணம்', details: 'திட்ட விவரங்களைக் காண்க', match: 'பொருத்தம்', note: 'பரிந்துரைகள் வழங்கப்பட்ட தகவல் மற்றும் பொருந்தும் திட்ட அளவுகோல்களை அடிப்படையாகக் கொண்டவை. விண்ணப்பிக்கும் முன் சமீபத்திய தகுதியை சரிபார்க்கவும்.' },
  'తెలుగు': { back: 'ప్రశ్నావళికి తిరిగి వెళ్లండి', matching: 'పథకం సరిపోలిక', eyebrow: 'వ్యక్తిగత శోధన', heading: 'మీ కోసం సిఫార్సు చేసిన పథకాలు', subtitle: 'మీరు అందించిన సమాచారం ఆధారంగా, మీకు సరిపోయే పథకాలు ఇవి.', why: 'ఇది మీకు ఎందుకు సరిపోవచ్చు', details: 'పథకం వివరాలు చూడండి', match: 'సరిపోలిక', note: 'సిఫార్సులు మీరు అందించిన సమాచారం మరియు వర్తించే పథక ప్రమాణాలపై ఆధారపడి ఉంటాయి. దరఖాస్తు ముందు తాజా అర్హతలను తనిఖీ చేయండి.' },
  'മലയാളം': { back: 'ചോദ്യാവലിയിലേക്ക് മടങ്ങുക', matching: 'പദ്ധതി പൊരുത്തം', eyebrow: 'വ്യക്തിഗത തിരച്ചിൽ', heading: 'നിങ്ങൾക്കുള്ള ശുപാർശ ചെയ്ത പദ്ധതികൾ', subtitle: 'നിങ്ങൾ നൽകിയ വിവരങ്ങളുടെ അടിസ്ഥാനത്തിൽ, നിങ്ങൾക്ക് അനുയോജ്യമായ പദ്ധതികൾ ഇവയാണ്.', why: 'ഇത് നിങ്ങൾക്ക് അനുയോജ്യമാകാനുള്ള കാരണം', details: 'പദ്ധതി വിശദാംശങ്ങൾ കാണുക', match: 'പൊരുത്തം', note: 'നൽകിയ വിവരങ്ങളും ബാധകമായ പദ്ധതി മാനദണ്ഡങ്ങളും അടിസ്ഥാനമാക്കിയാണ് ശുപാർശകൾ. അപേക്ഷിക്കുന്നതിന് മുമ്പ് ഏറ്റവും പുതിയ യോഗ്യത പരിശോധിക്കുക.' },
  'ગુજરાતી': { back: 'પ્રશ્નાવલી પર પાછા જાઓ', matching: 'યોજના મેળ', eyebrow: 'વ્યક્તિગત શોધ', heading: 'તમારા માટે ભલામણ કરેલી યોજનાઓ', subtitle: 'તમે આપેલી માહિતીના આધારે, તમારા માટે યોગ્ય યોજનાઓ અહીં છે.', why: 'આ તમારા માટે યોગ્ય કેમ હોઈ શકે', details: 'યોજનાની વિગતો જુઓ', match: 'મેળ', note: 'ભલામણો આપેલી માહિતી અને લાગુ યોજના માપદંડો પર આધારિત છે. અરજી કરતા પહેલાં નવીનતમ પાત્રતા ચકાસો.' },
  'ଓଡ଼ିଆ': { back: 'ପ୍ରଶ୍ନାବଳୀକୁ ଫେରନ୍ତୁ', matching: 'ଯୋଜନା ମେଳ', eyebrow: 'ବ୍ୟକ୍ତିଗତ ସନ୍ଧାନ', heading: 'ଆପଣଙ୍କ ପାଇଁ ସୁପାରିଶ ଯୋଜନା', subtitle: 'ଆପଣ ଦେଇଥିବା ସୂଚନା ଆଧାରରେ, ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ଯୋଜନା ଏଠାରେ ଅଛି।', why: 'ଏହା ଆପଣଙ୍କ ପାଇଁ କାହିଁକି ଉପଯୁକ୍ତ', details: 'ଯୋଜନା ବିବରଣୀ ଦେଖନ୍ତୁ', match: 'ମେଳ', note: 'ସୁପାରିଶ ଆପଣଙ୍କ ସୂଚନା ଏବଂ ଲାଗୁ ଯୋଜନା ମାନદଣ୍ડ ଉପରେ ଆଧାରିତ। ଆବେଦନ ପୂର୍ବରୁ ସର୍ବଶେଷ ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରନ୍ତୁ।' },
  'বাংলা': { back: 'প্রশ্নাবলীতে ফিরে যান', matching: 'প্রকল্পের মিল', eyebrow: 'ব্যক্তিগত অনুসন্ধান', heading: 'আপনার জন্য সুপারিশ করা প্রকল্প', subtitle: 'আপনার দেওয়া তথ্যের ভিত্তিতে, আপনার জন্য উপযুক্ত প্রকল্পগুলি এখানে রয়েছে।', why: 'এটি আপনার জন্য উপযুক্ত হতে পারে কেন', details: 'প্রকল্পের বিবরণ দেখুন', match: 'মিল', note: 'সুপারিশগুলি আপনার দেওয়া তথ্য এবং প্রযোজ্য প্রকল্পের মানদণ্ডের উপর ভিত্তি করে। আবেদন করার আগে সর্বশেষ যোগ্যতা যাচাই করুন।' },
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14 5l7 7m0 0-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

const Recommendations = ({ answers, onBack, onViewDetails, language = 'English' }) => {
  const copy = recommendationCopy[language] ?? recommendationCopy.English;

  // ADD THESE THREE LINES HERE
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!answers) return;

    const fetchRecommendations = async () => {
      setLoading(true);
      setApiError('');

      const maxAttempts = 3;
      const retryDelay = 1500;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const response = await fetch('https://yojanax.onrender.com/recommendations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              purpose: answers.supportType,

              is_sc: answers.formData.is_sc
                ? answers.formData.is_sc === 'Yes'
                : answers.formData.socialCategory === 'Yes',

              caste_certificate_valid:
                answers.formData.caste_certificate_valid === 'Yes'
                  ? true
                  : answers.formData.caste_certificate_valid === 'No'
                    ? false
                    : answers.formData.socialCategory === 'Yes'
                      ? true
                      : undefined,

              annual_family_income_inr: answers.formData.annual_family_income_inr
                ? Number(String(answers.formData.annual_family_income_inr).replace(/,/g, ''))
                : answers.formData.familyIncome === 'Below ₹1 lakh'
                  ? 99999
                  : answers.formData.familyIncome === '₹1–3 lakh'
                    ? 300000
                    : answers.formData.familyIncome === '₹3–5 lakh'
                      ? 500000
                      : answers.formData.familyIncome === 'Above ₹5 lakh'
                        ? 500001
                        : undefined,

              project_cost_inr: answers.formData.projectCost
                ? Number(String(answers.formData.projectCost).replace(/,/g, ''))
                : undefined,

              requested_loan_inr: answers.formData.financialAssistance
                ? Number(String(answers.formData.financialAssistance).replace(/,/g, ''))
                : undefined,

              course_fee_inr: answers.formData.course_fee_inr
                ? Number(String(answers.formData.course_fee_inr).replace(/,/g, ''))
                : undefined,

              course_type: answers.formData.course_type || undefined,

              is_full_time:
                answers.formData.is_full_time === 'Yes'
                  ? true
                  : answers.formData.is_full_time === 'No'
                    ? false
                    : undefined,

              institution_recognized:
                answers.formData.institution_recognized === 'Yes'
                  ? true
                  : answers.formData.institution_recognized === 'No'
                    ? false
                    : undefined,
            }),
          });

          // Retry temporary server errors, but don't retry normal validation errors.
          if (!response.ok) {
            if (response.status >= 500 && attempt < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
              continue;
            }

            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          setSchemes(data.recommendations || []);
          setApiError('');
          setLoading(false);
          return;
        } catch (error) {
          console.error(`Recommendation API attempt ${attempt} failed:`, error);

          if (attempt < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            continue;
          }

          setApiError('Unable to load recommendations. Please try again.');
        }
      }

      setLoading(false);
    };
    fetchRecommendations();
  }, [answers]);

  return (
    <div className="min-h-screen bg-[#fcfdfd] font-sans text-slate-800 antialiased">
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              aria-label={copy.back}
              className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-navy-900"
              onClick={onBack}
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 19-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
            <div>
              <div className="text-xl font-extrabold leading-none tracking-tight text-navy-900">
                YOJANA<span className="text-saffron-500">X</span>
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{copy.matching}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-orange-500" />
              </div>

              <h2 className="text-xl font-bold text-navy-900">
                Finding the best schemes for you...
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Please wait while YojanaX analyzes your profile and matches the most relevant government schemes.
              </p>
            </div>
          </div>
        ) : (
          <>
            <section className="mb-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-saffron-600">{copy.eyebrow}</p>
              <h1 className="text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">{copy.heading}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                {copy.subtitle}
              </p>
            </section>

            <div className="space-y-6">
              {schemes.map((scheme, index) => (
                <article
                  className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8 ${index === 0 ? 'border-saffron-500 ring-1 ring-saffron-500/20' : 'border-slate-200'
                    }`}
                  key={scheme.scheme_id}
                >
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                            {scheme.eligibility_status === 'incomplete' ? 'Suitable — Partner Required' : 'Eligible'}
                          </span>
                          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                            {scheme.match_score}% {copy.match}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-navy-900 sm:text-2xl">{scheme.scheme_id === 'ELS'
                          ? 'PM-Vidyalaxmi'
                          : scheme.scheme_name}</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">{scheme.description}</p>
                      </div>
                      <span className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-lg font-bold text-saffron-600 sm:flex" aria-hidden="true">
                        ₹
                      </span>
                    </div>

                    <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                      <h3 className="text-sm font-bold text-navy-900">{copy.why}</h3>
                      <ul className="mt-3 space-y-3">
                        {(scheme.fit_factors || [scheme.recommendation_reason]).map((reason) => (
                          <li className="flex items-start gap-2 text-sm leading-relaxed text-slate-600" key={reason}>
                            <CheckIcon />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex justify-end">
                      <button
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-800 sm:w-auto"
                        onClick={() => onViewDetails?.(scheme)}
                        type="button"
                      >
                        {copy.details}
                        <ArrowIcon />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="mt-10 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-5">
              <div className="flex items-start gap-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <p>
                  {copy.note}
                </p>
              </div>
            </aside>
          </>
        )}
      </main>
    </div>
  );
};

export default Recommendations;
