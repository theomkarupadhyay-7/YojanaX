import { useEffect, useState } from 'react';

// Mock response shape for a future GET /schemes/{scheme_id} integration.
const mockScheme = {
  id: 'sample-entrepreneurship-a',
  name: 'Pradhan Mantri Mudra Yojana (PMMY)',
  description: 'A mock government-backed credit support option for eligible micro and small business activities.',
  matchStatus: 'Strong Match',
  matchScore: 92,
  overview: 'This demo profile presents the information that may be shown for a matched scheme. Verified scheme descriptions and conditions will be supplied by the backend.',
  purpose: 'Mock purpose: support business funding needs through an applicable financial assistance channel.',
  targetApplicants: 'Mock value: entrepreneurs and small business applicants whose profile matches the applicable criteria.',
  supportType: 'Mock value: credit-linked financial assistance.',
  benefits: [
    'May align with your business stage and selected funding purpose.',
    'Provides a clear way to review applicable financial support.',
    'Helps you understand possible requirements before applying.',
  ],
  eligibility: [
    ['Applicant type', 'Provided by backend'],
    ['Category requirement', 'As applicable'],
    ['Income requirement', 'Provided by backend'],
    ['Certificate requirement', 'As applicable'],
    ['Other conditions', 'As applicable to the final scheme guidelines'],
  ],
  applicationProcess: [
    'Check eligibility',
    'Prepare required information',
    'Approach the applicable channel partner',
    'Submit application',
    'Verification',
    'Further processing',
  ],
  documentsRequired: [
    'Identity and address information - as applicable',
    'Business or enterprise information - provided by backend',
    'Category or certificate documents - as applicable',
    'Financial information - as requested by the applicable channel',
  ],
  faqs: [
    ['Who can apply?', 'This demo answer is a placeholder. Applicant criteria will be provided by the backend.'],
    ['How is eligibility checked?', 'Your submitted profile may be compared with verified scheme criteria.'],
    ['Where can I apply?', 'The applicable channel will be provided by the backend or a verified source.'],
    ['What documents may be required?', 'Document requirements can vary and will be supplied by the backend.'],
    ['How does financial assistance work?', 'Verified assistance details, limits, and terms will be shown when available.'],
  ],
  sources: [],
};

const labels = {
  English: { back: 'Back to Recommendations', language: 'Language', mock: 'Mock data', details: 'Details', name: 'Scheme name', overview: 'Overview', purpose: 'Purpose', applicants: 'Target applicants', support: 'Support type', benefits: 'Benefits', eligibility: 'Eligibility', demo: '.', process: 'Application Process', documents: 'Documents Required', faq: 'Frequently Asked Questions', sources: 'Sources & References', noSources: 'Source information will be provided by the backend.', feedback: 'Feedback', helpful: 'Was this information helpful?', yes: 'Yes', no: 'No', placeholder: 'Optional short feedback', submit: 'Submit', note: 'Please verify the latest eligibility requirements and scheme information before applying.', calculate: 'Calculate Financing', partner: 'Find Nearby Partner', match: 'Match' },
  'हिंदी': { back: 'सिफारिशों पर वापस जाएं', language: 'भाषा', mock: 'मॉक डेटा', details: 'विवरण', name: 'योजना का नाम', overview: 'अवलोकन', purpose: 'उद्देश्य', applicants: 'लक्षित आवेदक', support: 'सहायता का प्रकार', benefits: 'लाभ', eligibility: 'पात्रता', demo: 'जहां सत्यापित जानकारी उपलब्ध नहीं है, वहां मॉक/डेमो भाषा दिखाई गई है।', process: 'आवेदन प्रक्रिया', documents: 'आवश्यक दस्तावेज', faq: 'अक्सर पूछे जाने वाले प्रश्न', sources: 'स्रोत और संदर्भ', noSources: 'स्रोत की जानकारी बैकएंड से प्रदान की जाएगी।', feedback: 'प्रतिक्रिया', helpful: 'क्या यह जानकारी उपयोगी थी?', yes: 'हां', no: 'नहीं', placeholder: 'वैकल्पिक संक्षिप्त प्रतिक्रिया', submit: 'जमा करें', note: 'आवेदन करने से पहले नवीनतम पात्रता और योजना की जानकारी सत्यापित करें।', calculate: 'वित्तीय गणना करें', partner: 'नजदीकी साझेदार खोजें', match: 'मिलान' },
  'मराठी': { back: 'शिफारसींकडे परत जा', language: 'भाषा', mock: 'मॉक डेटा', details: 'तपशील', name: 'योजनेचे नाव', overview: 'आढावा', purpose: 'उद्देश', applicants: 'लक्षित अर्जदार', support: 'मदतीचा प्रकार', benefits: 'फायदे', eligibility: 'पात्रता', demo: 'सत्यापित माहिती उपलब्ध नसताना मॉक/डेमो मजकूर दाखवला आहे.', process: 'अर्ज प्रक्रिया', documents: 'आवश्यक कागदपत्रे', faq: 'वारंवार विचारले जाणारे प्रश्न', sources: 'स्रोत आणि संदर्भ', noSources: 'स्रोत माहिती बॅकएंडकडून दिली जाईल.', feedback: 'अभिप्राय', helpful: 'ही माहिती उपयुक्त होती का?', yes: 'होय', no: 'नाही', placeholder: 'पर्यायी संक्षिप्त अभिप्राय', submit: 'सादर करा', note: 'अर्ज करण्यापूर्वी नवीनतम पात्रता आणि योजनेची माहिती तपासा.', calculate: 'आर्थिक गणना करा', partner: 'जवळचा भागीदार शोधा', match: 'जुळणी' },
  'भोजपुरी': { back: 'सिफारिश पर वापस जाईं', language: 'भाषा', mock: 'मॉक डेटा', details: 'विवरण', name: 'योजना के नाम', overview: 'जानकारी', purpose: 'उद्देश्य', applicants: 'लक्षित आवेदक', support: 'मदद के प्रकार', benefits: 'फायदा', eligibility: 'पात्रता', demo: 'जहां सत्यापित जानकारी नइखे, उहां मॉक/डेमो मजकूर बा।', process: 'आवेदन प्रक्रिया', documents: 'जरूरी कागज', faq: 'अक्सर पूछल जाए वाला सवाल', sources: 'स्रोत आ संदर्भ', noSources: 'स्रोत के जानकारी बैकएंड से आई।', feedback: 'राय', helpful: 'का ई जानकारी काम के रहल?', yes: 'हां', no: 'ना', placeholder: 'वैकल्पिक छोट राय', submit: 'जमा करीं', note: 'आवेदन से पहिले नवीनतम पात्रता आ योजना के जानकारी जांचीं।', calculate: 'वित्तीय गणना करीं', partner: 'नजदीकी साझेदार खोजीं', match: 'मिलान' },
  'தமிழ்': { back: 'பரிந்துரைகளுக்குத் திரும்பு', language: 'மொழி', mock: 'மாதிரி தரவு', details: 'விவரங்கள்', name: 'திட்டத்தின் பெயர்', overview: 'கண்ணோட்டம்', purpose: 'நோக்கம்', applicants: 'இலக்கு விண்ணப்பதாரர்கள்', support: 'ஆதரவு வகை', benefits: 'நன்மைகள்', eligibility: 'தகுதி', demo: 'சரிபார்க்கப்பட்ட தகவல் இல்லாத இடங்களில் மாதிரி உரை காட்டப்படுகிறது.', process: 'விண்ணப்ப செயல்முறை', documents: 'தேவையான ஆவணங்கள்', faq: 'அடிக்கடி கேட்கப்படும் கேள்விகள்', sources: 'ஆதாரங்கள் மற்றும் குறிப்புகள்', noSources: 'ஆதாரத் தகவல் பின்தளத்திலிருந்து வழங்கப்படும்.', feedback: 'கருத்து', helpful: 'இந்தத் தகவல் பயனுள்ளதாக இருந்ததா?', yes: 'ஆம்', no: 'இல்லை', placeholder: 'விருப்பக் கருத்து', submit: 'சமர்ப்பிக்கவும்', note: 'விண்ணப்பிக்கும் முன் சமீபத்திய தகுதி மற்றும் திட்டத் தகவலை சரிபார்க்கவும்.', calculate: 'நிதியைக் கணக்கிடு', partner: 'அருகிலுள்ள கூட்டாளியைக் கண்டறி', match: 'பொருத்தம்' },
  'తెలుగు': { back: 'సిఫార్సులకు తిరిగి వెళ్లండి', language: 'భాష', mock: 'మాక్ డేటా', details: 'వివరాలు', name: 'పథకం పేరు', overview: 'అవలోకనం', purpose: 'ఉద్దేశ్యం', applicants: 'లక్ష్య దరఖాస్తుదారులు', support: 'మద్దతు రకం', benefits: 'ప్రయోజనాలు', eligibility: 'అర్హత', demo: 'ధృవీకరించిన సమాచారం లేని చోట మాక్ టెక్స్ట్ చూపబడుతుంది.', process: 'దరఖాస్తు ప్రక్రియ', documents: 'అవసరమైన పత్రాలు', faq: 'తరచుగా అడిగే ప్రశ్నలు', sources: 'మూలాలు మరియు సూచనలు', noSources: 'మూల సమాచారం బ్యాకెండ్ నుండి అందించబడుతుంది.', feedback: 'అభిప్రాయం', helpful: 'ఈ సమాచారం ఉపయోగకరంగా ఉందా?', yes: 'అవును', no: 'కాదు', placeholder: 'ఐచ్ఛిక అభిప్రాయం', submit: 'సమర్పించండి', note: 'దరఖాస్తు ముందు తాజా అర్హతలు మరియు పథకం సమాచారాన్ని నిర్ధారించండి.', calculate: 'ఫైనాన్సింగ్ లెక్కించండి', partner: 'దగ్గరి భాగస్వామిని కనుగొనండి', match: 'సరిపోలిక' },
  'മലയാളം': { back: 'ശുപാർശകളിലേക്ക് മടങ്ങുക', language: 'ഭാഷ', mock: 'മോക്ക് ഡാറ്റ', details: 'വിശദാംശങ്ങൾ', name: 'പദ്ധതിയുടെ പേര്', overview: 'അവലോകനം', purpose: 'ഉദ്ദേശ്യം', applicants: 'ലക്ഷ്യ അപേക്ഷകർ', support: 'പിന്തുണയുടെ തരം', benefits: 'ആനുകൂല്യങ്ങൾ', eligibility: 'യോഗ്യത', demo: 'പരിശോധിച്ച വിവരങ്ങൾ ലഭ്യമല്ലാത്തിടത്ത് മോക്ക് ടെക്സ്റ്റ് കാണിക്കുന്നു.', process: 'അപേക്ഷാ പ്രക്രിയ', documents: 'ആവശ്യമായ രേഖകൾ', faq: 'പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ', sources: 'ഉറവിടങ്ങളും റഫറൻസുകളും', noSources: 'ഉറവിട വിവരങ്ങൾ ബാക്കെൻഡിൽ നിന്ന് നൽകും.', feedback: 'അഭിപ്രായം', helpful: 'ഈ വിവരം സഹായകരമായിരുന്നോ?', yes: 'അതെ', no: 'ഇല്ല', placeholder: 'ഓപ്ഷണൽ അഭിപ്രായം', submit: 'സമർപ്പിക്കുക', note: 'അപേക്ഷിക്കുന്നതിന് മുമ്പ് ഏറ്റവും പുതിയ യോഗ്യതയും പദ്ധതി വിവരങ്ങളും പരിശോധിക്കുക.', calculate: 'ധനസഹായം കണക്കാക്കുക', partner: 'സമീപത്തുള്ള പങ്കാളിയെ കണ്ടെത്തുക', match: 'പൊരുത്തം' },
  'ગુજરાતી': { back: 'ભલામણો પર પાછા જાઓ', language: 'ભાષા', mock: 'મોક ડેટા', details: 'વિગતો', name: 'યોજનાનું નામ', overview: 'ઝાંખી', purpose: 'હેતુ', applicants: 'લક્ષિત અરજદારો', support: 'સહાયનો પ્રકાર', benefits: 'લાભ', eligibility: 'પાત્રતા', demo: 'ચકાસેલી માહિતી ન હોય ત્યાં મોક ટેક્સ્ટ બતાવવામાં આવે છે.', process: 'અરજી પ્રક્રિયા', documents: 'જરૂરી દસ્તાવેજો', faq: 'વારંવાર પૂછાતા પ્રશ્નો', sources: 'સ્રોતો અને સંદર્ભો', noSources: 'સ્રોતની માહિતી બેકએન્ડમાંથી આપવામાં આવશે.', feedback: 'પ્રતિસાદ', helpful: 'શું આ માહિતી ઉપયોગી હતી?', yes: 'હા', no: 'ના', placeholder: 'વૈકલ્પિક પ્રતિસાદ', submit: 'સબમિટ કરો', note: 'અરજી કરતા પહેલાં નવીનતમ પાત્રતા અને યોજનાની માહિતી ચકાસો.', calculate: 'ફાઇનાન્સિંગની ગણતરી કરો', partner: 'નજીકના ભાગીદાર શોધો', match: 'મેળ' },
  'ଓଡ଼ିଆ': { back: 'ସୁପାରିଶକୁ ଫେରନ୍ତୁ', language: 'ଭାଷା', mock: 'ମକ୍ ଡାଟା', details: 'ବିବରଣୀ', name: 'ଯୋଜନାର ନାମ', overview: 'ସମୀକ୍ଷା', purpose: 'ଉଦ୍ଦେଶ୍ୟ', applicants: 'ଲକ୍ଷ୍ୟ ଆବେଦକ', support: 'ସହାୟତା ପ୍ରକାର', benefits: 'ଲାଭ', eligibility: 'ଯୋଗ୍ୟତା', demo: 'ଯାଞ୍ଚିତ ସୂଚନା ନଥିବା ସ୍ଥାନରେ ମକ୍ ଟେକ୍ସଟ୍ ଦେଖାଯାଉଛି।', process: 'ଆବେଦନ ପ୍ରକ୍ରିୟା', documents: 'ଆବଶ୍ୟକ ଦଲିଲ', faq: 'ବାରମ୍ବାର ପଚରାଯାଉଥିବା ପ୍ରଶ୍ନ', sources: 'ସୂତ୍ର ଏବଂ ସନ୍ଦର୍ଭ', noSources: 'ସୂତ୍ର ସୂଚନା ବ୍ୟାକଏଣ୍ଡରୁ ପ୍ରଦାନ କରାଯିବ।', feedback: 'ମତାମତ', helpful: 'ଏହି ସୂଚନା ଉପଯୋଗୀ ଥିଲା କି?', yes: 'ହଁ', no: 'ନା', placeholder: 'ଇଚ୍ଛାଧୀନ ମତାମତ', submit: 'ଦାଖଲ କରନ୍ତୁ', note: 'ଆବେଦନ ପୂର୍ବରୁ ସର୍ବଶେଷ ଯୋଗ୍ୟତା ଏବଂ ଯୋଜନା ସୂଚନା ଯାଞ୍ଚ କରନ୍ତୁ।', calculate: 'ଅର୍ଥ ସାହାଯ୍ୟ ଗଣନା କରନ୍ତୁ', partner: 'ନିକଟସ୍ଥ ସହଯୋଗୀ ଖୋଜନ୍ତୁ', match: 'ମେଳ' },
  'বাংলা': { back: 'সুপারিশে ফিরে যান', language: 'ভাষা', mock: 'মক ডেটা', details: 'বিবরণ', name: 'প্রকল্পের নাম', overview: 'সংক্ষিপ্ত বিবরণ', purpose: 'উদ্দেশ্য', applicants: 'লক্ষ্য আবেদনকারী', support: 'সহায়তার ধরন', benefits: 'সুবিধা', eligibility: 'যোগ্যতা', demo: 'যেখানে যাচাই করা তথ্য নেই, সেখানে মক টেক্সট দেখানো হয়েছে।', process: 'আবেদন প্রক্রিয়া', documents: 'প্রয়োজনীয় নথি', faq: 'সচরাচর জিজ্ঞাসিত প্রশ্ন', sources: 'উৎস ও রেফারেন্স', noSources: 'উৎসের তথ্য ব্যাকএন্ড থেকে দেওয়া হবে।', feedback: 'মতামত', helpful: 'এই তথ্যটি কি সহায়ক ছিল?', yes: 'হ্যাঁ', no: 'না', placeholder: 'ঐচ্ছিক মতামত', submit: 'জমা দিন', note: 'আবেদন করার আগে সর্বশেষ যোগ্যতা এবং প্রকল্পের তথ্য যাচাই করুন।', calculate: 'অর্থায়ন হিসাব করুন', partner: 'কাছের অংশীদার খুঁজুন', match: 'মিল' },
};

function CheckIcon() {
  return <span className="shrink-0 text-lg font-bold text-emerald-600" aria-hidden="true">✓</span>;
}

function ArrowIcon() {
  return <span aria-hidden="true">→</span>;
}

export default function SchemeDetails({ scheme, answers, onBack, onCalculate, onPartner, language = 'English' }) {
  const [openFaq, setOpenFaq] = useState(null);
  const [feedbackChoice, setFeedbackChoice] = useState('');
  const [apiScheme, setApiScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const copy = labels[language] ?? labels.English;

  const form = answers?.formData ?? {};

  const hasBusinessInfo =
    Boolean(form.businessType) ||
    Boolean(form.mainActivity) ||
    Boolean(form.projectCost) ||
    Boolean(form.fundingPurpose);

  const casteCertificateReady =
    form.caste_certificate_valid === 'Yes';

  const gapItems = [
    {
      name: 'Udyam Registration',
      status: 'Not verified',
    },
    {
      name: 'Bank Account Details',
      status: 'Not verified',
    },
    {
      name: 'Business Information',
      status: hasBusinessInfo ? 'Profile info provided' : 'Not provided',
    },
  ];

  const documentItems = [
    {
      name: 'Aadhaar',
      status: 'Not verified',
    },
    {
      name: 'PAN',
      status: 'Not verified',
    },
    {
      name: 'Caste Certificate',
      status: casteCertificateReady ? 'Provided' : 'Not verified',
    },
    {
      name: 'Bank Statement',
      status: 'Not verified',
    },
    {
      name: 'Business Registration',
      status: 'Not verified',
    },
  ];

  const readinessItems = [
    hasBusinessInfo,
    casteCertificateReady,
    false, // Aadhaar not verified
    false, // PAN not verified
    false, // Bank statement not verified
  ];

  const readinessScore = Math.round(
    (readinessItems.filter(Boolean).length / readinessItems.length) * 100
  );

  useEffect(() => {
    const loadScheme = async () => {
      if (!scheme?.scheme_id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://yojanax.onrender.com/schemes/${scheme.scheme_id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to load scheme: ${response.status}`);
        }

        const data = await response.json();
        setApiScheme(data);
      } catch (error) {
        console.error('Scheme details API error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadScheme();
  }, [scheme?.scheme_id]);

  const schemeDescriptions = {
    MFS: 'A micro-finance credit scheme for eligible entrepreneurs seeking financial assistance for small business activities. Loan assistance can cover up to 90% of the project cost, with funding available up to ₹1.25 lakh at a fixed interest rate of 6.5% and repayment over 3 years.',

    TERM_LOAN: 'A term loan scheme for eligible entrepreneurs with larger project requirements. Financial assistance can cover up to 90% of the project cost, with loans available up to ₹45 lakh at a fixed interest rate of 8% and repayment over a period of up to 7 years.',

    AMY: 'Aajeevika Micro-Finance Yojana provides micro-finance assistance for eligible entrepreneurs through NBFC-MFI channel partners. Loan assistance can cover up to 90% of the project cost, with funding available up to ₹1.25 lakh at an interest rate of 15% and repayment over 3 years.',

    UNY: 'A credit scheme for eligible entrepreneurs seeking financial assistance for business activities. Loan assistance is available up to ₹4.5 lakh through approved channel partners, with repayment over up to 5 years. The applicable interest rate depends on the lending partner.',

    ELS: 'PM-Vidyalaxmi loan scheme for eligible SC students pursuing regular full-time professional or technical courses. Loan assistance is available up to ₹40 lakh at a fixed interest rate of 6.5%, with repayment over up to 12 years. Courses and institutions must meet the applicable recognition requirements.',
  };
  const schemeFaqs = {
    MFS: [
      [
        'Who can apply for the Micro Finance Scheme?',
        'Eligible SC entrepreneurs who meet the applicable income and scheme requirements can apply through an authorized channel partner.',
      ],
      [
        'What is the maximum loan assistance?',
        'Loan assistance is available up to ₹1.25 lakh, subject to the applicable scheme conditions.',
      ],
      [
        'What is the interest rate?',
        'The fixed interest rate is 6.5%.',
      ],
      [
        'What is the repayment period?',
        'The repayment period is up to 3 years, with a 3-month moratorium.',
      ],
    ],

    TERM_LOAN: [
      [
        'Who can apply for the Term Loan scheme?',
        'Eligible SC entrepreneurs meeting the applicable scheme requirements can apply through an authorized channel partner.',
      ],
      [
        'What is the maximum loan assistance?',
        'Financial assistance is available up to ₹45 lakh, subject to the applicable scheme conditions.',
      ],
      [
        'What is the interest rate?',
        'The fixed interest rate is 8%.',
      ],
      [
        'What is the repayment period?',
        'The repayment period is up to 7 years. Certain eligible activities may have a longer moratorium.',
      ],
    ],

    AMY: [
      [
        'What is Aajeevika Micro-Finance Yojana?',
        'It provides micro-finance assistance to eligible SC entrepreneurs through NBFC-MFI channel partners.',
      ],
      [
        'What is the maximum loan assistance?',
        'Loan assistance is available up to ₹1.25 lakh, subject to the applicable scheme conditions.',
      ],
      [
        'What is the interest rate?',
        'The interest rate is 15%.',
      ],
      [
        'What is the repayment period?',
        'The repayment period is up to 3 years, with a 3-month moratorium.',
      ],
    ],

    UNY: [
      [
        'What is the maximum loan assistance under Udyam Nidhi Yojana?',
        'Loan assistance is available up to ₹4.5 lakh, subject to the applicable scheme conditions.',
      ],
      [
        'Who can apply?',
        'Eligible SC entrepreneurs meeting the applicable income and other scheme requirements can apply through approved channel partners.',
      ],
      [
        'What is the repayment period?',
        'The repayment period is up to 5 years, with a 3-month moratorium.',
      ],
      [
        'Does the interest rate vary?',
        'Yes. The applicable interest rate depends on the lending channel partner.',
      ],
    ],

    ELS: [
      [
        'Who can apply for PM-Vidyalaxmi?',
        'Eligible SC students pursuing regular full-time professional or technical courses can apply, subject to the applicable eligibility requirements.',
      ],
      [
        'What is the maximum loan assistance?',
        'Educational loan assistance is available up to ₹40 lakh, subject to the applicable scheme conditions.',
      ],
      [
        'What is the interest rate?',
        'The fixed interest rate is 6.5%.',
      ],
      [
        'What courses are eligible?',
        'Eligible professional and technical courses must meet the applicable recognition requirements.',
      ],
    ],
  };
  const detailsScheme = apiScheme
    ? {
      name:
        apiScheme.scheme_id === 'ELS'
          ? 'PM-Vidyalaxmi'
          : apiScheme.scheme_name,
      description:
        schemeDescriptions[apiScheme.scheme_id] ||
        `${apiScheme.scheme_category
          ? apiScheme.scheme_category.charAt(0).toUpperCase() +
          apiScheme.scheme_category.slice(1)
          : 'N/A'} scheme for ${apiScheme.target_type
            ? apiScheme.target_type.charAt(0).toUpperCase() +
            apiScheme.target_type.slice(1)
            : 'N/A'
        }.`,
      matchStatus:
        scheme?.eligibility_status === 'incomplete'
          ? 'Suitable — Partner Required'
          : 'Eligible',
      matchScore: scheme?.match_score ?? 0,
      overview:
        apiScheme.scheme_category
          ? apiScheme.scheme_category.charAt(0).toUpperCase() +
          apiScheme.scheme_category.slice(1)
          : 'N/A',

      purpose:
        apiScheme.target_type
          ? apiScheme.target_type.charAt(0).toUpperCase() +
          apiScheme.target_type.slice(1)
          : 'N/A',
      targetApplicants: apiScheme.eligibility?.notes?.join(' ') || 'As per scheme eligibility criteria.',
      supportType: `Loan assistance up to ₹${apiScheme.loan_amount?.max_inr?.toLocaleString('en-IN') || 'N/A'}.`,
      benefits: [
        `Maximum loan amount: ₹${apiScheme.loan_amount?.max_inr?.toLocaleString('en-IN') || 'N/A'}`,
        `Interest rate: ${apiScheme.interest_rate?.value_percent ?? 'Partner dependent'}%`,
        `Repayment period: ${apiScheme.repayment?.period_years ?? 'N/A'} years`,
      ],
      eligibility: [
        ['SC requirement', apiScheme.eligibility?.sc_required ? 'Required' : 'Not required'],
        ['Annual family income limit', apiScheme.eligibility?.annual_family_income_max_inr
          ? `₹${apiScheme.eligibility.annual_family_income_max_inr.toLocaleString('en-IN')}`
          : 'Not specified'],
        ['Eligibility notes', apiScheme.eligibility?.notes?.join(' ') || 'See official criteria'],
      ],
      applicationProcess: [
        apiScheme.application_process?.channel_partner_required
          ? 'Approach an authorized channel partner'
          : 'Check application process',
        'Submit required information and documents',
        'Verification and further processing',
      ],
      documentsRequired: apiScheme.documents?.length
        ? apiScheme.documents
        : ['Documents as specified by the scheme'],
      faqs: schemeFaqs[apiScheme.scheme_id] || [],
      sources: apiScheme.provenance?.source_url
        ? [apiScheme.provenance.source_url]
        : [],
    }


    : {
      ...mockScheme,
      name: scheme?.scheme_name ?? mockScheme.name,
      matchScore: scheme?.match_score ?? mockScheme.matchScore,
    };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-lg font-semibold text-navy-900">
          Loading scheme details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#fcfdfd] to-white font-sans text-slate-800 antialiased">
      <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
        <div className="mb-8 border-b border-slate-200 pb-4">
          <button className="group inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-100 hover:text-saffron-600" onClick={onBack} type="button">
            <span aria-hidden="true">←</span>{copy.back}
          </button>
        </div>
        <section className="relative overflow-hidden border-b border-slate-200 pb-10 pt-2 sm:pb-14">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-orange-100/50 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-wrap items-center gap-3"><span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-lg font-bold text-saffron-700">{detailsScheme.matchStatus}</span><span className="rounded-md border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xl font-semibold text-emerald-700">{detailsScheme.matchScore}% {copy.match}</span></div>
          <h1 className="relative mt-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-5xl">{detailsScheme.name}</h1>
          <p className="relative mt-4 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">{detailsScheme.description}</p>
        </section>

        <section className="border-b border-slate-200 py-10">
          <h2 className="text-2xl font-bold text-navy-900">{copy.details}</h2>
          <dl className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {[[copy.name, detailsScheme.name], [copy.overview, detailsScheme.overview], [copy.purpose, detailsScheme.purpose], [copy.applicants, detailsScheme.targetApplicants], [copy.support, detailsScheme.supportType]].map(([label, value]) => <div className="grid gap-2 px-4 py-5 odd:bg-slate-50/70 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:gap-8 sm:px-6" key={label}><dt className="text-sm font-semibold text-navy-900">{label}</dt><dd className="text-base leading-relaxed text-slate-600">{value}</dd></div>)}
          </dl>
        </section>

        <section className="border-b border-slate-200 py-10"><h2 className="border-l-4 border-saffron-500 pl-3 text-2xl font-bold text-navy-900">{copy.benefits}</h2><ul className="mt-6 space-y-4">{detailsScheme.benefits.map((benefit) => <li className="flex items-start gap-3 text-base leading-relaxed text-slate-600" key={benefit}><CheckIcon />{benefit}</li>)}</ul></section>

        <section className="border-b border-slate-200 py-10"><h2 className="border-l-4 border-emerald-500 pl-3 text-2xl font-bold text-navy-900">{copy.eligibility}</h2><p className="mt-2 text-sm text-slate-500">{copy.demo}</p><dl className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{detailsScheme.eligibility.map(([label, value]) => <div className="grid gap-2 px-4 py-5 odd:bg-slate-50/70 sm:grid-cols-2 sm:gap-8 sm:px-6" key={label}><dt className="text-sm font-semibold text-navy-900">{label}</dt><dd className="text-sm leading-relaxed text-slate-600">{value}</dd></div>)}</dl></section>



        <section className="border-b border-slate-200 py-10">
          <h2 className="border-l-4 border-amber-500 pl-3 text-2xl font-bold text-navy-900">Scheme Gap Analyzer</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Identify requirements that may still need attention before applying.</p>
          <div className="mt-5">
            <div className="flex items-center justify-between text-base font-semibold text-slate-700">
              <span>Profile Readiness</span>
              <span>{readinessScore}%</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-amber-500 transition-all"
                style={{ width: `${readinessScore}%` }}
              />
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {gapItems.map((item) => (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex sm:items-center sm:justify-between sm:gap-6" key={item.name}>
                <div><h3 className="text-sm font-bold text-slate-800">{item.name}</h3></div>
                <span className="mt-3 inline-flex w-fit rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-700 sm:mt-0">{item.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-slate-200 py-10">
          <h2 className="border-l-4 border-emerald-500 pl-3 text-2xl font-bold text-navy-900">Document Readiness Checker</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">Check which documents are ready and which may still be required before applying.</p>
          <p className="mt-2 text-xs text-slate-400">
            Document requirements are based on the selected scheme.
          </p>
          <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {documentItems.map((item) => (
              <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6" key={item.name}>
                <div className="flex items-start gap-3">
                  <div><h3 className="text-sm font-bold text-slate-800">{item.name}</h3></div>
                </div>
                <span className="inline-flex w-fit rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">{item.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm font-semibold text-navy-900"></div>
        </section>

        <section className="border-b border-slate-200 py-10"><h2 className="border-l-4 border-navy-900 pl-3 text-2xl font-bold text-navy-900">{copy.process}</h2><p className="mt-2 text-sm text-slate-500">{copy.demo}</p><ol className="mt-7 space-y-0">{detailsScheme.applicationProcess.map((step, index) => <li className="relative flex gap-4 pb-7 last:pb-0" key={step}><span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-900 text-xs font-bold text-white shadow-sm">{String(index + 1).padStart(2, '0')}</span><span className="pt-1 text-sm text-slate-600">{step}</span>{index < detailsScheme.applicationProcess.length - 1 && <span className="absolute left-4 top-8 h-full w-px bg-slate-200" />}</li>)}</ol></section>

        <section className="border-b border-slate-200 py-10"><h2 className="border-l-4 border-saffron-500 pl-3 text-2xl font-bold text-navy-900">{copy.documents}</h2><p className="mt-2 text-sm text-slate-500">{copy.demo}</p><ul className="mt-6 grid gap-3 sm:grid-cols-2">{detailsScheme.documentsRequired.map((document) => <li className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-600 shadow-sm" key={document}><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-saffron-500" />{document}</li>)}</ul></section>

        <section className="border-b border-slate-200 py-10"><h2 className="border-l-4 border-navy-900 pl-3 text-2xl font-bold text-navy-900">{copy.faq}</h2><div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">{detailsScheme.faqs.map(([question, answer], index) => <div key={question}><button aria-expanded={openFaq === index} className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-50 sm:px-6" onClick={() => setOpenFaq(openFaq === index ? null : index)} type="button"><span>{question}</span><span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-lg font-normal leading-none text-slate-500">{openFaq === index ? '−' : '+'}</span></button>{openFaq === index && <p className="bg-slate-50 px-4 pb-5 pr-8 text-sm leading-relaxed text-slate-600 sm:px-6">{answer}</p>}</div>)}</div></section>

        <section className="border-b border-slate-200 py-10"><h2 className="border-l-4 border-slate-400 pl-3 text-2xl font-bold text-navy-900">{copy.sources}</h2>
          <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm leading-relaxed">
            {detailsScheme.sources.length ? (
              detailsScheme.sources.map((source) => (
                <a
                  key={source}
                  href={source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-700 underline underline-offset-2 hover:text-blue-900"
                >
                  {source}
                </a>
              ))
            ) : (
              <span className="text-slate-600">{copy.noSources}</span>
            )}
          </div></section>

        <section className="border-b border-slate-200 py-10"><h2 className="border-l-4 border-emerald-500 pl-3 text-2xl font-bold text-navy-900">{copy.feedback}</h2><p className="mt-3 text-sm text-slate-600">{copy.helpful}</p><div className="mt-4 flex gap-3"><button className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${feedbackChoice === 'yes' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-700 hover:border-emerald-400'}`} onClick={() => setFeedbackChoice('yes')} type="button">{copy.yes}</button><button className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${feedbackChoice === 'no' ? 'border-saffron-500 bg-orange-50 text-saffron-700' : 'border-slate-300 bg-white text-slate-700 hover:border-saffron-400'}`} onClick={() => setFeedbackChoice('no')} type="button">{copy.no}</button></div><div className="mt-4 flex flex-col gap-3 sm:flex-row"><input aria-label={copy.placeholder} className="min-h-11 flex-1 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none transition-shadow placeholder:text-slate-400 focus:border-navy-900 focus:ring-2 focus:ring-navy-900/10" placeholder={copy.placeholder} type="text" /><button className="rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-navy-800" type="button">{copy.submit}</button></div></section>

        <p className="mt-8 border-l-4 border-blue-300 bg-blue-50/70 px-4 py-3 text-sm leading-relaxed text-slate-600">{copy.note}</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-navy-900 shadow-sm transition-all hover:-translate-y-0.5 hover:border-navy-900 hover:shadow-md" onClick={onCalculate} type="button">{copy.calculate} <ArrowIcon /></button><button className="inline-flex items-center justify-center gap-2 rounded-xl bg-navy-900 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-navy-800 hover:shadow-md" onClick={onPartner} type="button">{copy.partner} <ArrowIcon /></button></div>
      </main>
    </div>
  );
}