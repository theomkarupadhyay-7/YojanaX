import { useEffect, useRef, useState } from 'react';
import Questionnaire from './Questionnaire';
import Recommendations from './pages/Recommendations';
import SchemeDetails from './pages/SchemeDetails';
import Calculator from './pages/Calculator';
import StateDistrictSelect from './StateDistrictSelect';
import Partners from './pages/Partners';
import Chatbot from "./components/chatbot";
import SignIn from './pages/SignIn';

// English is the base language; every other language falls back to these
// keys whenever a translation is missing.
const translations = {
  "English": {
    "home": "Home",
    "schemes": "Schemes",
    "about": "About",
    "badge": "Government-Backed Financial Discovery Platform",
    "headline": "Find the Right Financial Assistance for Your Business.",
    "description": "YOJANAX helps marginalized entrepreneurs discover suitable government-backed financial schemes based on their business, income, and funding requirements.",
    "findScheme": "Find My Scheme",
    "explore": "Explore Schemes",
    "schemesCount": "Central & State Schemes",
    "dbt": "Direct DBT Disbursal",
    "intermediaries": "Zero Intermediaries",
    "matching": "Personalized Matching",
    "matchingText": "Find schemes tailored to your trade, category, and capital requirements.",
    "transparent": "Simple & Transparent",
    "transparentText": "Know exactly why a scheme suits you with clear eligibility checks.",
    "partners": "Find Nearby Partners",
    "partnersText": "Find nearby authorized channel partners for financial assistance.",
    "ctaHeading": "Ready to find the right scheme?",
    "ctaText": "Answer few simple questions about your enterprise to get matched instantly. No registration fee required.",
    "footerText": "Making government financial support easier to discover.",
    "privacy": "Privacy",
    "terms": "Terms",
    "contact": "Contact",
    "accessibility": "Accessibility",
    "officialInitiative": "An Initiative under Ministry of Electronics & Information Technology",
    "digitalIndia": "Digital India Program",
    "rashtriyaPortal": "राष्ट्रीय पहचान पोर्टल",
    "govRegistry": "Gov.in Official Registry",
    "signIn": "Sign In",
    "trendingTag": "Trending Featured Scheme",
    "mudraTag": "PMMY · Mudra Loan Support",
    "capitalTag": "Capital Assistance",
    "subsidyTag": "Interest Subsidy up to 35%",
    "copyright": "Yojanax — SIH 2026 Project",
    "ourVision": "Our Vision",
    "visionText": "Our vision is to make citizens life easier by providing streamlined access to welfare programs.",
    "ourMission": "Our Mission",
    "missionText": "Our mission is to streamline the government-user interface for government schemes and benefits, reducing time and effort required to discover and avail benefits.",
    "close": "Close"
  },
  "हिंदी": {
    "home": "होम",
    "schemes": "योजनाएं",
    "about": "हमारे बारे में",
    "badge": "सरकार समर्थित वित्तीय खोज मंच",
    "headline": "अपने व्यवसाय के लिए सही वित्तीय सहायता पाएं।",
    "description": "YOJANAX हाशिए पर रहने वाले उद्यमियों को उनके व्यवसाय, आय और वित्तीय जरूरतों के आधार पर उपयुक्त सरकारी योजनाएं खोजने में मदद करता है।",
    "findScheme": "मेरी योजना खोजें",
    "explore": "योजनाएं देखें",
    "schemesCount": "120+ केंद्रीय और राज्य योजनाएं",
    "dbt": "100% प्रत्यक्ष DBT वितरण",
    "intermediaries": "कोई बिचौलिया नहीं",
    "matching": "व्यक्तिगत मिलान",
    "matchingText": "अपने व्यापार, श्रेणी और पूंजी की जरूरतों के अनुसार योजनाएं खोजें।",
    "transparent": "सरल और पारदर्शी",
    "transparentText": "स्पष्ट पात्रता जांच के साथ जानें कि कौन सी योजना आपके लिए सही है।",
    "partners": "नजदीकी साझेदार खोजें",
    "partnersText": "नजदीकी सार्वजनिक क्षेत्र के बैंकों और नोडल केंद्रों से सीधा संपर्क।",
    "ctaHeading": "सही योजना खोजने के लिए तैयार हैं?",
    "ctaText": "अपने उद्यम के बारे में कुछ आसान सवालों के जवाब दें और तुरंत योजना पाएं। कोई पंजीकरण शुल्क नहीं।",
    "footerText": "सरकारी वित्तीय सहायता खोजना आसान बनाना।",
    "privacy": "गोपनीयता",
    "terms": "नियम",
    "contact": "संपर्क",
    "accessibility": "सुलभता",
    "officialInitiative": "इलेक्ट्रॉनिक्स और सूचना प्रौद्योगिकी मंत्रालय के तहत एक पहल",
    "digitalIndia": "डिजिटल इंडिया कार्यक्रम",
    "rashtriyaPortal": "राष्ट्रीय पहचान पोर्टल",
    "govRegistry": "Gov.in आधिकारिक रजिस्ट्री",
    "signIn": "साइन इन",
    "trendingTag": "ट्रेंडिंग प्रमुख योजना",
    "mudraTag": "PMMY · मुद्रा ऋण सहायता",
    "capitalTag": "पूंजी सहायता",
    "subsidyTag": "35% तक ब्याज सब्सिडी",
    "copyright": "भारत सरकार की पहल।",
    "ourVision": "हमारा दृष्टिकोण",
    "visionText": "हमारा दृष्टिकोण कल्याणकारी योजनाओं तक आसान पहुंच प्रदान करके नागरिकों के जीवन को सरल बनाना है।",
    "ourMission": "हमारा मिशन",
    "missionText": "हमारा मिशन सरकारी योजनाओं और लाभों को खोजने और प्राप्त करने में लगने वाले समय और प्रयास को कम करना है।",
    "close": "बंद करें"
  },
  "मराठी": {
    "home": "मुख्यपृष्ठ",
    "schemes": "योजना",
    "about": "आमच्याबद्दल",
    "badge": "सरकार समर्थित आर्थिक शोध मंच",
    "headline": "तुमच्या व्यवसायासाठी योग्य आर्थिक मदत शोधा।",
    "description": "YOJANAX उद्योजकांना त्यांच्या व्यवसाय, उत्पन्न आणि निधीच्या गरजेनुसार योग्य सरकारी योजना शोधण्यात मदत करते।",
    "findScheme": "माझी योजना शोधा",
    "explore": "योजना पहा",
    "schemesCount": "120+ केंद्र आणि राज्य योजना",
    "dbt": "100% थेट DBT वितरण",
    "intermediaries": "कोणतेही मध्यस्थ नाहीत",
    "matching": "वैयक्तिक जुळणी",
    "matchingText": "तुमच्या व्यवसाय, श्रेणी आणि भांडवलाच्या गरजेनुसार योजना शोधा।",
    "transparent": "सोपे आणि पारदर्शक",
    "transparentText": "स्पष्ट पात्रता तपासणीसह तुमच्यासाठी योग्य योजना जाणून घ्या।",
    "partners": "जवळचे भागीदार शोधा",
    "partnersText": "जवळच्या सार्वजनिक क्षेत्रातील बँका आणि नोडल केंद्रांशी थेट संपर्क।",
    "ctaHeading": "योग्य योजना शोधण्यासाठी तयार आहात?",
    "ctaText": "तुमच्या उद्योगाबद्दल काही सोप्या प्रश्नांची उत्तरे द्या आणि त्वरित योजना मिळवा। नोंदणी शुल्क नाही।",
    "footerText": "सरकारी आर्थिक मदत शोधणे सोपे करणे।",
    "privacy": "गोपनीयता",
    "terms": "अटी",
    "contact": "संपर्क",
    "accessibility": "सुलभता",
    "officialInitiative": "इलेक्ट्रॉनिक्स आणि माहिती तंत्रज्ञान मंत्रालयाची उपक्रम",
    "digitalIndia": "डिजिटल इंडिया कार्यक्रम",
    "rashtriyaPortal": "राष्ट्रीय ओळख पोर्टल",
    "govRegistry": "Gov.in अधिकृत नोंदणी",
    "signIn": "साइन इन",
    "trendingTag": "प्रमुख योजना",
    "mudraTag": "PMMY · मुद्रा कर्ज मदत",
    "capitalTag": "भांडवल मदत",
    "subsidyTag": "35% पर्यंत व्याज सबसिडी",
    "copyright": "भारत सरकारचा उपक्रम.",
    "ourVision": "आमचा दृष्टीकोन",
    "visionText": "कल्याणकारी योजनांपर्यंत सुलभ पोहोच देऊन नागरिकांचे जीवन सुकर करणे हा आमचा दृष्टीकोन आहे.",
    "ourMission": "आमचे ध्येय",
    "missionText": "सरकारी योजना आणि लाभ शोधण्यासाठी आणि मिळवण्यासाठी लागणारा वेळ आणि प्रयत्न कमी करणे हे आमचे ध्येय आहे.",
    "close": "बंद करा"
  },
  "भोजपुरी": {
    "home": "होम",
    "schemes": "योजना",
    "about": "हमनी के बारे में",
    "badge": "सरकार से समर्थित वित्तीय खोज मंच",
    "headline": "अपना कारोबार खातिर सही आर्थिक मदद पाईं।",
    "description": "YOJANAX कारोबार, आमदनी आ पूंजी के जरूरत के हिसाब से सही सरकारी योजना खोजे में उद्यमी लोग के मदद करेला।",
    "findScheme": "हमार योजना खोजीं",
    "explore": "योजना देखीं",
    "schemesCount": "120+ केंद्र आ राज्य योजना",
    "dbt": "100% सीधा DBT भुगतान",
    "intermediaries": "कवनो बिचौलिया ना",
    "matching": "आपके हिसाब से मिलान",
    "matchingText": "आपन कारोबार, श्रेणी आ पूंजी के जरूरत के हिसाब से योजना खोजीं।",
    "transparent": "सहज आ पारदर्शी",
    "transparentText": "साफ पात्रता जांच से जानीं कि कवन योजना रउरा खातिर सही बा।",
    "partners": "नजदीकी साझेदार खोजीं",
    "partnersText": "नजदीकी सरकारी बैंक आ नोडल केंद्र से सीधा संपर्क।",
    "ctaHeading": "सही योजना खोजे खातिर तैयार बानी?",
    "ctaText": "अपना कारोबार के बारे में कुछ आसान सवाल के जवाब दीं आ तुरंत योजना पाईं। पंजीकरण शुल्क नइखे।",
    "footerText": "सरकारी आर्थिक मदद खोजल आसान बनावल।",
    "privacy": "गोपनीयता",
    "terms": "नियम",
    "contact": "संपर्क",
    "accessibility": "सुगमता",
    "officialInitiative": "इलेक्ट्रॉनिक्स आ सूचना प्रौद्योगिकी मंत्रालय के पहल",
    "digitalIndia": "डिजिटल इंडिया प्रोग्राम",
    "rashtriyaPortal": "राष्ट्रीय पहचान पोर्टल",
    "govRegistry": "Gov.in ऑफिशियल रजिस्ट्री",
    "signIn": "साइन इन",
    "trendingTag": "ट्रेंडिंग मुख्य योजना",
    "mudraTag": "PMMY · मुद्रा लोन सहायता",
    "capitalTag": "पूंजी सहायता",
    "subsidyTag": "35% तक ब्याज सब्सिडी",
    "copyright": "भारत सरकार के पहल।",
    "ourVision": "हमार विजन",
    "visionText": "सरकारी योजना तक पहुंच आसान बना के नागरिकन के जीवन सहज बनावल हमार लक्ष्य बा।",
    "ourMission": "हमार मिशन",
    "missionText": "सरकारी योजना के खोजे में लागे वाला समय आ मेहनत कम कइल हमार मिशन बा।",
    "close": "बंद करीं"
  },
  "தமிழ்": {
    "home": "முகப்பு",
    "schemes": "திட்டங்கள்",
    "about": "எங்களைப் பற்றி",
    "badge": "அரசு ஆதரவு நிதி தேடல் தளம்",
    "headline": "உங்கள் தொழிலுக்கு சரியான நிதி உதவியைப் பெறுங்கள்.",
    "description": "உங்கள் தொழில், வருமானம் மற்றும் நிதித் தேவைகளின் அடிப்படையில் பொருத்தமான அரசு திட்டங்களைக் கண்டறிய YOJANAX உதவுகிறது.",
    "findScheme": "என் திட்டத்தைக் கண்டறி",
    "explore": "திட்டங்களைப் பார்க்கவும்",
    "schemesCount": "120+ மத்திய மற்றும் மாநில திட்டங்கள்",
    "dbt": "100% நேரடி DBT வழங்கல்",
    "intermediaries": "இடைத்தரகர்கள் இல்லை",
    "matching": "தனிப்பயன் பொருத்தம்",
    "matchingText": "உங்கள் தொழில், வகை மற்றும் மூலதனத் தேவைகளுக்கு ஏற்ற திட்டங்களைக் கண்டறியவும்.",
    "transparent": "எளிமையானதும் வெளிப்படையானதும்",
    "transparentText": "தெளிவான தகுதி சரிபார்ப்புடன் உங்களுக்கு ஏற்ற திட்டத்தை அறியவும்.",
    "partners": "அருகிலுள்ள கூட்டாளர்களைக் கண்டறியவும்",
    "partnersText": "அருகிலுள்ள பொதுத்துறை வங்கிகள் மற்றும் மையங்களுடன் நேரடி தொடர்பு.",
    "ctaHeading": "சரியான திட்டத்தைக் கண்டறிய தயாரா?",
    "ctaText": "உங்கள் நிறுவனத்தைப் பற்றிய சில எளிய கேள்விகளுக்குப் பதிலளித்து உடனடியாக பொருத்தமான திட்டத்தைப் பெறுங்கள்.",
    "footerText": "அரசு நிதி ஆதரவைக் கண்டறிவதை எளிதாக்குதல்.",
    "privacy": "தனியுரிமை",
    "terms": "விதிமுறைகள்",
    "contact": "தொடர்பு",
    "accessibility": "அணுகல்தன்மை",
    "officialInitiative": "மின்னணு மற்றும் தகவல் தொழில்நுட்ப அமைச்சகத்தின் கீழ் ஒரு முயற்சி",
    "digitalIndia": "டிஜிட்டல் இந்தியா திட்டம்",
    "rashtriyaPortal": "தேசிய அடையாள போர்டல்",
    "govRegistry": "Gov.in அதிகாரப்பூர்வ பதிவகம்",
    "signIn": "உள்நுழைக",
    "trendingTag": "பிரபலமான சிறப்புத் திட்டம்",
    "mudraTag": "PMMY · முத்ரா கடன் உதவி",
    "capitalTag": "மூலதன உதவி",
    "subsidyTag": "35% வரை வட்டி மானியம்",
    "copyright": "இந்திய அரசின் முயற்சி.",
    "ourVision": "எங்கள் பார்வை",
    "visionText": "அரசு நலத்திட்டங்களை எளிதில் அணுகக்கூடியதாக மாற்றி குடிமக்களின் வாழ்க்கையை எளிதாக்குவதே எங்கள் பார்வையாகும்.",
    "ourMission": "எங்கள் லட்சியம்",
    "missionText": "அரசு திட்டங்களைக் கண்டறிவதற்கும் நன்மைகளைப் பெறுவதற்கும் தேவையான நேரத்தையும் முயற்சியையும் குறைப்பதே எங்கள் லட்சியம்.",
    "close": "மூடு"
  },
  "తెలుగు": {
    "home": "హోమ్",
    "schemes": "పథకాలు",
    "about": "మా గురించి",
    "badge": "ప్రభుత్వ మద్దతు ఆర్థిక శోధన వేదిక",
    "headline": "మీ వ్యాపారానికి సరైన ఆర్థిక సహాయం పొందండి.",
    "description": "మీ వ్యాపారం, ఆదాయం మరియు నిధుల అవసరాల ఆధారంగా తగిన ప్రభుత్వ పథకాలను కనుగొనడంలో YOJANAX సహాయపడుతుంది.",
    "findScheme": "నా పథకాన్ని కనుగొనండి",
    "explore": "పథకాలను చూడండి",
    "schemesCount": "120+ కేంద్ర మరియు రాష్ట్ర పథకాలు",
    "dbt": "100% ప్రత్యక్ష DBT పంపిణీ",
    "intermediaries": "మధ్యవర్తులు లేరు",
    "matching": "వ్యక్తిగత సరిపోలిక",
    "matchingText": "మీ వ్యాపారం, వర్గం మరియు మూలధన అవసరాలకు తగిన పథకాలను కనుగొనండి.",
    "transparent": "సరళమైనది మరియు పారదర్శకమైనది",
    "transparentText": "స్పష్టమైన అర్హత తనిఖీలతో మీకు సరిపోయే పథకాన్ని తెలుసుకోండి.",
    "partners": "దగ్గరి భాగస్వాములను కనుగొనండి",
    "partnersText": "దగ్గరి ప్రభుత్వ రంగ బ్యాంకులు మరియు కేంద్రాలతో ప్రత్యక్ష సంబంధం.",
    "ctaHeading": "సరైన పథకాన్ని కనుగొనడానికి సిద్ధంగా ఉన్నారా?",
    "ctaText": "మీ సంస్థ గురించి కొన్ని సులభమైన ప్రశ్నలకు సమాధానం ఇవ్వండి మరియు వెంటనే పథకాన్ని పొందండి.",
    "footerText": "ప్రభుత్వ ఆర్థిక సహాయాన్ని కనుగొనడం సులభతరం చేయడం.",
    "privacy": "గోప్యత",
    "terms": "నిబంధనలు",
    "contact": "సంప్రదించండి",
    "accessibility": "అందుబాటు",
    "officialInitiative": "ఎలక్ట్రానిక్స్ మరియు సమాచార సాంకేతిక మంత్రిత్వ శాఖ ఆధ్వర్యంలో చొరవ",
    "digitalIndia": "డిజిటల్ ఇండియా ప్రోగ్రామ్",
    "rashtriyaPortal": "జాతీయ గుర్తింపు పోర్టల్",
    "govRegistry": "Gov.in అధికారిక రిజిస్ట్రీ",
    "signIn": "సైన్ ఇన్",
    "trendingTag": "ప్రసిద్ధ ముఖ్యాంశ పథకం",
    "mudraTag": "PMMY · ముద్రా రుణం మద్దతు",
    "capitalTag": "మూలధన సహాయం",
    "subsidyTag": "35% వరకు వడ్డీ సబ్సిడీ",
    "copyright": "భారత ప్రభుత్వ చొరవ.",
    "ourVision": "మా దృష్టి",
    "visionText": "సంక్షేమ పథకాలను సులభంగా పొందేలా చేయడం ద్వారా పౌరుల జీవితాలను సులభతరం చేయడం మా దృష్టి.",
    "ourMission": "మా లక్ష్యం",
    "missionText": "ప్రభుత్వ పథకాలను కనుగొనడానికి మరియు ప్రయోజనాలను పొందడానికి పట్టే సమయం మరియు శ్రమను తగ్గించడం మా లక్ష్యం.",
    "close": "మూసివేయి"
  },
  "മലയാളം": {
    "home": "ഹോം",
    "schemes": "പദ്ധതികൾ",
    "about": "ഞങ്ങളെക്കുറിച്ച്",
    "badge": "സർക്കാർ പിന്തുണയുള്ള സാമ്പത്തിക തിരച്ചിൽ വേദി",
    "headline": "നിങ്ങളുടെ ബിസിനസിന് ശരിയായ സാമ്പത്തിക സഹായം കണ്ടെത്തൂ.",
    "description": "നിങ്ങളുടെ ബിസിനസ്, വരുമാനം, ധനസഹായ ആവശ്യങ്ങൾ എന്നിവയുടെ അടിസ്ഥാനത്തിൽ അനുയോജ്യമായ സർക്കാർ പദ്ധതികൾ കണ്ടെത്താൻ YOJANAX സഹായിക്കുന്നു.",
    "findScheme": "എന്റെ പദ്ധതി കണ്ടെത്തുക",
    "explore": "പദ്ധതികൾ കാണുക",
    "schemesCount": "120+ കേന്ദ്ര, സംസ്ഥാന പദ്ധതികൾ",
    "dbt": "100% നേരിട്ടുള്ള DBT വിതരണം",
    "intermediaries": "ഇടനിലക്കാരില്ല",
    "matching": "വ്യക്തിഗത പൊരുത്തം",
    "matchingText": "നിങ്ങളുടെ വ്യാപാരം, വിഭാഗം, മൂലധന ആവശ്യങ്ങൾ എന്നിവയ്ക്ക് അനുയോജ്യമായ പദ്ധതികൾ കണ്ടെത്തുക.",
    "transparent": "ലളിതവും സുതാര്യവും",
    "transparentText": "വ്യക്തമായ യോഗ്യതാ പരിശോധനയിലൂടെ നിങ്ങൾക്ക് അനുയോജ്യമായ പദ്ധതി കണ്ടെത്തൂ.",
    "partners": "സമീപത്തുള്ള പങ്കാളികളെ കണ്ടെത്തുക",
    "partnersText": "സമീപത്തുള്ള പൊതുമേഖലാ ബാങ്കുകളുമായും കേന്ദ്രങ്ങളുമായും നേരിട്ടുള്ള ബന്ധം.",
    "ctaHeading": "ശരിയായ പദ്ധതി കണ്ടെത്താൻ തയ്യാറാണോ?",
    "ctaText": "നിങ്ങളുടെ സ്ഥാപനത്തെക്കുറിച്ചുള്ള കുറച്ച് ലളിതമായ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകി ഉടൻ പദ്ധതി കണ്ടെത്തൂ.",
    "footerText": "സർക്കാർ സാമ്പത്തിക സഹായം കണ്ടെത്തുന്നത് എളുപ്പമാക്കുന്നു.",
    "privacy": "സ്വകാര്യത",
    "terms": "നിബന്ധനകൾ",
    "contact": "ബന്ധപ്പെടുക",
    "accessibility": "പ്രവേശനക്ഷമത",
    "officialInitiative": "ഇലക്ട്രോണിക്സ് & ഇൻഫർമേഷൻ ടെക്നോളജി മന്ത്രാലയത്തിന് കീഴിലുള്ള സംരംഭം",
    "digitalIndia": "ഡിജിറ്റൽ ഇന്ത്യ പ്രോഗ്രാം",
    "rashtriyaPortal": "ദേശീയ തിരിച്ചറിയൽ പോർട്ടൽ",
    "govRegistry": "Gov.in ഔദ്യോഗിക രജിസ്ട്രി",
    "signIn": "സൈൻ ഇൻ",
    "trendingTag": "പ്രധാന പദ്ധതി",
    "mudraTag": "PMMY · മുദ്ര വായ്പ സഹായം",
    "capitalTag": "മൂലധന സഹായം",
    "subsidyTag": "35% വരെ പലിശ സബ്‌സിഡി",
    "copyright": "ഇന്ത്യൻ സർക്കാരിന്റെ സംരംഭം.",
    "ourVision": "ഞങ്ങളുടെ കാഴ്ചപ്പാട്",
    "visionText": "ക്ഷേമ പദ്ധതികളിലേക്ക് എളുപ്പത്തിൽ പ്രവേശനം നൽകി പൗരന്മാരുടെ ജീവിതം എളുപ്പമാക്കുക എന്നതാണ് ഞങ്ങളുടെ കാഴ്ചപ്പാട്.",
    "ourMission": "ഞങ്ങളുടെ ലക്ഷ്യം",
    "missionText": "സർക്കാർ പദ്ധതികൾ കണ്ടെത്തുന്നതിനും ആനുകൂല്യങ്ങൾ നേടുന്നതിനുമുള്ള സമയവും ശ്രമവും കുറയ്ക്കുക എന്നതാണ് ഞങ്ങളുടെ ലക്ഷ്യം.",
    "close": "അടയ്ക്കുക"
  },
  "ગુજરાતી": {
    "home": "હોમ",
    "schemes": "યોજનાઓ",
    "about": "અમારા વિશે",
    "badge": "સરકાર સમર્થિત નાણાકીય શોધ પ્લેટફોર્મ",
    "headline": "તમારા વ્યવસાય માટે યોગ્ય નાણાકીય સહાય મેળવો.",
    "description": "તમારા વ્યવસાય, આવક અને ભંડોળની જરૂરિયાતોના આધારે યોગ્ય સરકારી યોજનાઓ શોધવામાં YOJANAX મદદ કરે છે.",
    "findScheme": "મારી યોજના શોધો",
    "explore": "યોજનાઓ જુઓ",
    "schemesCount": "120+ કેન્દ્ર અને રાજ્ય યોજનાઓ",
    "dbt": "100% સીધી DBT ચુકવણી",
    "intermediaries": "કોઈ વચેટિયા નથી",
    "matching": "વ્યક્તિગત મેળ",
    "matchingText": "તમારા વ્યવસાય, શ્રેણી અને મૂડીની જરૂરિયાતોને અનુરૂપ યોજનાઓ શોધો.",
    "transparent": "સરળ અને પારદર્શક",
    "transparentText": "સ્પષ્ટ પાત્રતા તપાસ સાથે તમારા માટે યોગ્ય યોજના જાણો.",
    "partners": "નજીકના ભાગીદારો શોધો",
    "partnersText": "નજીકની જાહેર ક્ષેત્રની બેંકો અને કેન્દ્રો સાથે સીધો સંપર્ક.",
    "ctaHeading": "યોગ્ય યોજના શોધવા તૈયાર છો?",
    "ctaText": "તમારા ઉદ્યોગ વિશે થોડા સરળ પ્રશ્નોના જવાબ આપો અને તરત યોજના મેળવો.",
    "footerText": "સરકારી નાણાકીય સહાય શોધવાનું સરળ બનાવવું.",
    "privacy": "ગોપનીયતા",
    "terms": "શરતો",
    "contact": "સંપર્ક",
    "accessibility": "સુલભતા",
    "officialInitiative": "ઇલેક્ટ્રોનિક્સ અને ઇન્ફર્મેશન ટેકનોલોજી મંત્રાલય હેઠળની પહેલ",
    "digitalIndia": "ડિજિટલ ઇન્ડિયા પ્રોગ્રામ",
    "rashtriyaPortal": "રાષ્ટ્રીય ઓળખ પોર્ટલ",
    "govRegistry": "Gov.in સત્તાવાર રજિસ્ટ્રી",
    "signIn": "સાઇન ઇન",
    "trendingTag": "મુખ્ય યોજના",
    "mudraTag": "PMMY · મુદ્રા લોન સહાય",
    "capitalTag": "મૂડી સહાય",
    "subsidyTag": "35% સુધી વ્યાજ સબસીડી",
    "copyright": "ભારત સરકારની પહેલ.",
    "ourVision": "અમારો દ્રષ્ટિકોણ",
    "visionText": "સરકારી યોજનાઓ સરળताથી પૂરી પાડીને નાગરિકોનું જીવન સરળ બનાવવું એ અમારો દ્રષ્ટિકોણ છે.",
    "ourMission": "અમારો મિશન",
    "missionText": "સરકારી યોજનાઓ શોધવા અને તેનો લાભ લેવા માટેનો સમય અને પ્રયત્ન ઘટાડવો એ અમારો મિશન છે.",
    "close": "બંધ કરો"
  },
  "ଓଡ଼ିଆ": {
    "home": "ହୋମ",
    "schemes": "ଯୋଜନା",
    "about": "ଆମ ବିଷୟରେ",
    "badge": "ସରକାରୀ ସମର୍ଥିତ ଆର୍ଥିକ ସନ୍ଧାନ ମଞ୍ଚ",
    "headline": "ଆପଣଙ୍କ ବ୍ୟବସାୟ ପାଇଁ ଉପଯୁକ୍ତ ଆର୍ଥିକ ସହାୟତା ପାଆନ୍ତୁ।",
    "description": "ଆପଣଙ୍କ ବ୍ୟବସାୟ, ଆୟ ଏବଂ ପାଣ୍ଠି ଆବଶ୍ୟକତା ଅନୁଯାୟୀ ଉପଯୁକ୍ତ ସରକାରୀ ଯୋଜନା ଖୋଜିବାରେ YOJANAX ସାହାଯ୍ୟ କରେ।",
    "findScheme": "ମୋ ଯୋଜନା ଖୋଜନ୍ତୁ",
    "explore": "ଯୋଜନା ଦେଖନ୍ତୁ",
    "schemesCount": "120+ କେନ୍ଦ୍ର ଏବଂ ରାଜ୍ୟ ଯୋଜନା",
    "dbt": "100% ସିଧାସଳଖ DBT ବଣ୍ଟନ",
    "intermediaries": "କୌଣସି ମଧ୍ୟସ୍ଥ ନାହାନ୍ତି",
    "matching": "ବ୍ୟକ୍ତିଗତ ମେଳ",
    "matchingText": "ଆପଣଙ୍କ ବ୍ୟବସାୟ, ବର୍ଗ ଏବଂ ପୁଞ୍ଜି ଆବଶ୍ୟକତା ଅନୁଯାୟୀ ଯୋଜନା ଖୋଜନ୍ତୁ।",
    "transparent": "ସରଳ ଏବଂ ସ୍ୱଚ୍ଛ",
    "transparentText": "ସ୍ପଷ୍ଟ ଯୋଗ୍ୟତା ଯାଞ୍ଚ ସହିତ ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ଯୋଜନା ଜାଣନ୍ତୁ।",
    "partners": "ନିକଟସ୍ଥ ଭାଗୀଦାର ଖୋଜନ୍ତୁ",
    "partnersText": "ନିକଟସ୍ଥ ସରକାରୀ ବ୍ୟାଙ୍କ ଏବଂ କେନ୍ଦ୍ର ସହିତ ସିଧାସଳଖ ସମ୍ପର୍କ।",
    "ctaHeading": "ସଠିକ ଯୋଜନା ଖୋଜିବାକୁ ପ୍ରସ୍ତୁତ?",
    "ctaText": "ଆପଣଙ୍କ ଉଦ୍ୟୋଗ ବିଷୟରେ କିଛି ସରଳ ପ୍ରଶ୍ନର ଉତ୍ତର ଦିଅନ୍ତୁ ଏବଂ ତୁରନ୍ତ ଯୋଜନା ପାଆନ୍ତୁ।",
    "footerText": "ସରକାରୀ ଆର୍ଥିକ ସହାୟତା ଖୋଜିବାକୁ ସହଜ କରିବା।",
    "privacy": "ଗୋପନୀୟତା",
    "terms": "ନିୟମ",
    "contact": "ଯୋଗାଯୋଗ",
    "accessibility": "ସୁଗମତା",
    "officialInitiative": "ଇଲେକ୍ଟ୍ରୋନିକ୍ସ ଏବଂ ସୂଚନା ପ୍ରଯୁକ୍ତିବିଦ୍ୟା ମନ୍ତ୍ରଣାଳୟ ଅଧୀନରେ ଏକ ପଦକ୍ଷେପ",
    "digitalIndia": "ଡିଜିଟାଲ୍ ଇଣ୍ଡିଆ ପ୍ରୋଗ୍ରାମ୍",
    "rashtriyaPortal": "ଜାତୀୟ ପରିଚୟ ପୋର୍ଟାଲ୍",
    "govRegistry": "Gov.in ଅଫିସିଆଲ୍ ରେଜିଷ୍ଟ୍ରି",
    "signIn": "ସାଇନ୍ ଇନ୍",
    "trendingTag": "ମୁଖ୍ୟ ଯୋଜନା",
    "mudraTag": "PMMY · ମୁଦ୍ରା ରୁଣ ସହାୟତା",
    "capitalTag": "ପୁଞ୍ଜି ସହାୟତା",
    "subsidyTag": "35% ପର୍ଯ୍ୟନ୍ତ ସୁଧ ରିହାତି",
    "copyright": "ଭାରତ ସରକାରଙ୍କ ପଦକ୍ଷେପ।",
    "ourVision": "ଆମର ଦୃଷ୍ଟିକୋଣ",
    "visionText": "ସରକାରୀ ଯୋଜନାକୁ ସହଜରେ ପହଞ୍ଚାଇ ନାଗରିକଙ୍କ ଜୀବନ ସହଜ କରିବା ଆମର ଲକ୍ଷ୍ୟ।",
    "ourMission": "ଆମର ମିଶନ୍",
    "missionText": "ସରକାରୀ ଯୋଜନା ଖୋଜିବା ଏବଂ ଲାଭ ପାଇବା ପାଇଁ ସମୟ ଏବଂ ପରିଶ୍ରମ ହ୍ରାସ କରିବା ଆମର ମିଶନ୍।",
    "close": "ବନ୍ଦ କରନ୍ତୁ"
  },
  "বাংলা": {
    "home": "হোম",
    "schemes": "প্রকল্পসমূহ",
    "about": "আমাদের সম্পর্কে",
    "badge": "সরকার সমর্থিত আর্থিক অনুসন্ধান প্ল্যাটফর্ম",
    "headline": "আপনার ব্যবসার জন্য সঠিক আর্থিক সহায়তা পান।",
    "description": "আপনার ব্যবসা, আয় এবং অর্থায়নের প্রয়োজনের ভিত্তিতে উপযুক্ত সরকারি প্রকল্প খুঁজে পেতে YOJANAX সাহায্য করে।",
    "findScheme": "আমার প্রকল্প খুঁজুন",
    "explore": "প্রকল্প দেখুন",
    "schemesCount": "১২০+ কেন্দ্রীয় ও রাজ্য প্রকল্প",
    "dbt": "১০০% সরাসরি DBT বিতরণ",
    "intermediaries": "কোনও মধ্যস্থতাকারী নেই",
    "matching": "ব্যক্তিগত মিল",
    "matchingText": "আপনার ব্যবসা, শ্রেণি এবং মূলধনের প্রয়োজন অনুযায়ী প্রকল্প খুঁজুন।",
    "transparent": "সহজ ও স্বচ্ছ",
    "transparentText": "স্পষ্ট যোগ্যতা যাচাইয়ের মাধ্যমে আপনার জন্য উপযুক্ত প্রকল্প জানুন।",
    "partners": "কাছের অংশীদার খুঁজুন",
    "partnersText": "কাছের সরকারি ব্যাঙ্ক ও কেন্দ্রের সঙ্গে সরাসরি যোগাযোগ।",
    "ctaHeading": "সঠিক প্রকল্প খুঁজতে প্রস্তুত?",
    "ctaText": "আপনার উদ্যোগ সম্পর্কে কয়েকটি সহজ প্রশ্নের উত্তর দিন এবং সঙ্গে সঙ্গে প্রকল্প পান।",
    "footerText": "সরকারি আর্থিক সহায়তা খুঁজে পাওয়া সহজ করা।",
    "privacy": "গোপনীয়তা",
    "terms": "শর্তাবলি",
    "contact": "যোগাযোগ",
    "accessibility": "অ্যাক্সেসিবിലിটি",
    "officialInitiative": "ইলেক্ট্রনিক্স ও তথ্য প্রযুক্তি মন্ত্রকের অধীনস্থ একটি উদ্যোগ",
    "digitalIndia": "ডিজিটাল ইন্ডিয়া প্রোগ্রাম",
    "rashtriyaPortal": "জাতীয় পরিচয় পোর্টাল",
    "govRegistry": "Gov.in অফিসিয়াল রেজিস্ট্রি",
    "signIn": "সাইন ইন",
    "trendingTag": "জনপ্রিয় বিশেষ প্রকল্প",
    "mudraTag": "PMMY · মুদ্রা ঋণ সহায়তা",
    "capitalTag": "মূলধন সহায়তা",
    "subsidyTag": "৩৫% পর্যন্ত সুদে ভরতुकি",
    "copyright": "ভারত সরকারের উদ্যোগ।",
    "ourVision": "আমাদের ভিশন",
    "visionText": "সরকারি প্রকল্পগুলিতে সহজ প্রবেশাধিকার প্রদান করে নাগরিকদের জীবনকে সহজ করাই আমাদের লক্ষ্য।",
    "ourMission": "আমাদের মিশন",
    "missionText": "সরকারি প্রকল্প আবিষ্কার এবং সুবিধা গ্রহণের সময় ও প্রচেষ্টা কমানোই আমাদের লক্ষ্য।",
    "close": "বন্ধ করুন"
  }
};

const heroImages = [
  {
    src: 'https://www.ibef.org/uploads/govtschemes/Pradhan-Mantri-Mudra-Loan-Bank-Yojana-july-2025.png',
    alt: 'Modern clean vector illustration of an Indian entrepreneur smiling, standing next to modern subtle digital financial tech symbols',
  },
  {
    src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNuTtqlqoAEerYg5qOW1hL4fjoQ6v2PliLrBWMLN9-cSAfPgVceWFAYCL1&s=10',
    alt: 'Placeholder image 2 — replace with your own artwork',
  },
  {
    src: 'https://ascocapital.com/wp-content/uploads/2023/10/startup-india-scheme-1024x570-1.jpg',
    alt: 'Placeholder image 3 — replace with your own artwork',
  },
  {
    src: 'https://i0.wp.com/www.impriindia.com/wp-content/uploads/2025/10/image-24.jpeg?resize=672%2C524&ssl=1',
    alt: 'Placeholder image 4 — replace with your own artwork',
  },
  {
    src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9LHYACGPDnnz66mpdGWUt9Kli4ovCF1ZbniVkg1xKkw&s=10',
    alt: 'Placeholder image 2 — replace with your own artwork',
  },

];

export default function App() {
  const [language, setLanguage] = useState('English');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('yojanax-dark-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored === 'true' || (stored === null && prefersDark);
  });
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showPartners, setShowPartners] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const langMenuRef = useRef(null);
  const [showSignIn, setShowSignIn] = useState(false);

  // Look up a translated string, falling back to English if missing.
  const t = (key) => translations[language]?.[key] ?? translations.English[key];

  // Keep <body> class + localStorage in sync with dark mode state.
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('yojanax-dark-mode', String(darkMode));
  }, [darkMode]);

  // Auto-advance the hero slideshow every 4 seconds.
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Close the language menu on outside click or Escape.
  useEffect(() => {
    function handleClick(event) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const Modal = ({ title, onClose, children }) => {
    useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose?.();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-backdrop-in"
        onClick={onClose}
      >
        <div
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl shadow-navy-900/20 dark:shadow-saffron-500/10 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200/80 dark:border-slate-800 animate-popup-in transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative Top Gradient Accent Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-saffron-500 via-amber-500 to-navy-900"></div>

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 dark:bg-slate-800 text-saffron-600 dark:text-saffron-500 font-bold border border-orange-200/60 dark:border-slate-700 shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-navy-900 dark:text-white">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all duration-200 hover:rotate-90 active:scale-95 cursor-pointer"
              aria-label="Close modal"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Modal Content Body */}
          <div className="p-6 sm:p-8 overflow-y-auto flex-grow text-slate-600 dark:text-slate-300 space-y-6 custom-scrollbar text-sm sm:text-base leading-relaxed">
            {children}
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/60 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">YOJANAX Official Portal</span>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-navy-900 to-slate-800 hover:from-slate-900 hover:to-navy-900 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Close</span>
              <svg className="w-4 h-4 text-saffron-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };
  if (showSignIn) {
    return (
      <SignIn
        onBack={() => setShowSignIn(false)}
      />
    );
  }
  return (
    <div className="bg-[#fcfdfd] text-slate-800 font-sans antialiased selection:bg-orange-100 selection:text-orange-900 min-h-screen flex flex-col relative overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-orange-100/40 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/3"></div>
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none -z-10 -translate-x-1/2"></div>
      <aside aria-label="Official Government Banner" className="w-full bg-[#f8fafc] border-b border-slate-200/80 py-1.5 px-4 sm:px-8 text-xs font-medium text-slate-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>Ministry of Social Justice and Empowerment</span>
            <span className="hidden md:inline text-slate-300">|</span>
            <span className="hidden md:inline text-slate-500 font-normal">Digital India Program | आत्मनिर्भर भारत  </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="hidden sm:inline hover:text-navy-900 cursor-pointer">राष्ट्रीय पहचान पोर्टल</span>
            <span className="text-slate-300">|</span>
            <span className="font-semibold text-slate-700">Gov.in Official Registry</span>
          </div>
        </div>
      </aside>
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <nav aria-label="Primary Navigation" className="max-w-7xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <a aria-label="YOJANX Home" className="flex items-center gap-2 group" href="#">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900 group-hover:text-navy-800 transition-colors">
                YOJANA<span className="text-saffron-500">X</span>
              </span>
              <span className="hidden lg:inline-block text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">GovTech</span>
            </a>
            <div aria-hidden="true" className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <img alt="State Emblem of India" className="h-9 w-auto object-contain" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 120' width='40' height='48' fill='none'><g fill='%231e3a8a'><path d='M50 18 C46 18 42 22 42 28 C42 34 46 38 50 38 C54 38 58 34 58 28 C58 22 54 18 50 18 Z' opacity='0.95'/><path d='M47 25 C47 24 48 23 50 23 C52 23 53 24 53 25 C53 27 51 28 50 30 C49 28 47 27 47 25 Z' fill='%23ffffff'/><circle cx='46' cy='27' r='1' fill='%231e3a8a'/><circle cx='54' cy='27' r='1' fill='%231e3a8a'/><path d='M40 24 C36 26 34 32 36 38 C38 42 42 45 45 47 L44 54 L56 54 L55 47 C58 45 62 42 64 38 C66 32 64 26 60 24 C57 27 54 28 50 28 C46 28 43 27 40 24 Z'/><path d='M34 26 C30 27 26 32 28 39 C30 44 35 48 40 49 C37 43 35 36 34 26 Z'/><path d='M66 26 C70 27 74 32 72 39 C70 44 65 48 60 49 C63 43 65 36 66 26 Z'/><rect x='22' y='55' width='56' height='5' rx='1.5'/><circle cx='50' cy='69' r='8' stroke='%231e3a8a' strokeWidth='1.8' fill='%23ffffff'/><circle cx='50' cy='69' r='2' fill='%231e3a8a'/><line x1='50' y1='61' x2='50' y2='77' stroke='%231e3a8a' strokeWidth='0.8'/><line x1='42' y1='69' x2='58' y2='69' stroke='%231e3a8a' strokeWidth='0.8'/><line x1='44.3' y1='63.3' x2='55.7' y2='74.7' stroke='%231e3a8a' strokeWidth='0.8'/><line x1='44.3' y1='74.7' x2='55.7' y2='63.3' stroke='%231e3a8a' strokeWidth='0.8'/><path d='M30 67 C28 65 24 66 23 70 C24 72 28 72 31 70 Z'/><path d='M70 67 C72 65 76 66 77 70 C76 72 72 72 69 70 Z'/><rect x='18' y='78' width='64' height='4' rx='1'/><rect x='14' y='83' width='72' height='4.5' rx='1'/><text x='50' y='98' font-family='sans-serif' font-size='7.5' font-weight='700' text-anchor='middle' fill='%231e3a8a' letter-spacing='0.5'>सत्यमेव जयते</text></g></svg>" />
              <div aria-hidden="true" className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <img alt="Digital India Logo" className="h-8 w-auto object-contain hidden sm:block" src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 50' width='120' height='38' fill='none'><path d='M8 32 C 14 20, 24 14, 34 22 C 44 30, 52 18, 58 10' stroke='%23FF9933' strokeWidth='4.5' strokeLinecap='round'/><circle cx='20' cy='18' r='3' fill='%23000080'/><circle cx='34' cy='22' r='3' fill='%23000080'/><circle cx='48' cy='18' r='3' fill='%23000080'/><path d='M20 18 L34 22 L48 18' stroke='%23000080' strokeWidth='1.5' stroke-dasharray='2 2'/><path d='M12 39 C 20 28, 30 25, 40 33 C 48 39, 56 30, 62 24' stroke='%23138808' strokeWidth='4' strokeLinecap='round'/><text x='68' y='22' font-family='sans-serif' font-weight='900' font-size='14' fill='%230b2265' letter-spacing='-0.3'>Digital India</text><text x='68' y='34' font-family='sans-serif' font-weight='600' font-size='7' fill='%2364748b' letter-spacing='0.6'>POWER TO EMPOWER</text></svg>" />
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a className="text-navy-900 font-semibold hover:text-navy-800 transition-colors cursor-pointer" data-i18n="home" onClick={() => setShowQuestionnaire(false)}>{t('home')}</a>
              <a className="hover:text-navy-900 transition-colors cursor-pointer" data-i18n="schemes" onClick={() => setShowQuestionnaire(false)}>{t('schemes')}</a>
              <a className="hover:text-navy-900 transition-colors cursor-pointer" data-i18n="about" onClick={(e) => { e.preventDefault(); setActiveModal('about'); }}>{t('about')}</a>
            </div>
            <button
              aria-label={darkMode ? 'Disable dark mode' : 'Enable dark mode'}
              className="dark-mode-toggle inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-100"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              type="button"
              onClick={() => setDarkMode((prev) => !prev)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {darkMode ? (
                  <path d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36l-1.42 1.42M7.05 16.95l-1.42 1.42m12.73 0l-1.42-1.42M7.05 7.05L5.63 5.63M16 12a4 4 0 11-8 0 4 4 0 018 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                ) : (
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                )}
              </svg>
            </button>
            <div className="relative" data-purpose="language-selector" ref={langMenuRef}>
              <button aria-controls="language-menu" aria-expanded={menuOpen} className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 transition-all hover:bg-slate-100" type="button" onClick={() => setMenuOpen((prev) => !prev)}>
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
                <span>{language === 'English' ? 'English' : language}</span>
                <svg className={`w-3 h-3 text-slate-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                </svg>
              </button>
              <div aria-labelledby="language-toggle" className={`absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/60 z-50 ${menuOpen ? '' : 'hidden'}`} role="menu">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Choose language</p>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-navy-900 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="English" role="menuitem" type="button" onClick={() => { setLanguage('English'); setMenuOpen(false); }}><span>English</span><span className="text-[11px] font-normal text-slate-400">English</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="मराठी" role="menuitem" type="button" onClick={() => { setLanguage('मराठी'); setMenuOpen(false); }}><span>मराठी</span><span className="text-[11px] font-normal text-slate-400">Marathi</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="भोजपुरी" role="menuitem" type="button" onClick={() => { setLanguage('भोजपुरी'); setMenuOpen(false); }}><span>भोजपुरी</span><span className="text-[11px] font-normal text-slate-400">Bhojpuri</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="தமிழ்" role="menuitem" type="button" onClick={() => { setLanguage('தமிழ்'); setMenuOpen(false); }}><span>தமிழ்</span><span className="text-[11px] font-normal text-slate-400">Tamil</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="తెలుగు" role="menuitem" type="button" onClick={() => { setLanguage('తెలుగు'); setMenuOpen(false); }}><span>తెలుగు</span><span className="text-[11px] font-normal text-slate-400">Telugu</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="മലയാളം" role="menuitem" type="button" onClick={() => { setLanguage('മലയാളം'); setMenuOpen(false); }}><span>മലയാളം</span><span className="text-[11px] font-normal text-slate-400">Malayalam</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="ગુજરાતી" role="menuitem" type="button" onClick={() => { setLanguage('ગુજરાતી'); setMenuOpen(false); }}><span>ગુજરાતી</span><span className="text-[11px] font-normal text-slate-400">Gujarati</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="ଓଡ଼ିଆ" role="menuitem" type="button" onClick={() => { setLanguage('ଓଡ଼ିଆ'); setMenuOpen(false); }}><span>ଓଡ଼ିଆ</span><span className="text-[11px] font-normal text-slate-400">Odia</span></button>
                <button className="language-option flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors" data-language="বাংলা" role="menuitem" type="button" onClick={() => { setLanguage('বাংলা'); setMenuOpen(false); }}><span>বাংলা</span><span className="text-[11px] font-normal text-slate-400">Bengali</span></button>
              </div>
            </div>
            <a className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg border border-slate-300 hover:border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white transition-all duration-200 cursor-pointer"  onClick={() => setShowSignIn(true)}>
              Sign In
            </a>
          </div>
        </nav>
      </header>
      <main className="flex-grow flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-12 w-full">
        {showPartners ? (
          <Partners onBack={() => setShowPartners(false)} />
        ) : showCalculator ? (
          <Calculator
            language={language}
            scheme={selectedScheme}
            onBack={() => setShowCalculator(false)} />
        ) : selectedScheme ? (
          <SchemeDetails
            language={language}
            scheme={selectedScheme}
            answers={questionnaireAnswers}
            onCalculate={() => setShowCalculator(true)}
            onPartner={() => {
              setShowPartners(true);
            }}
            onBack={() => {
              setSelectedScheme(null);
              setShowRecommendations(true);
            }}
          />
        ) : showRecommendations ? (
          <Recommendations answers={questionnaireAnswers} language={language} onBack={() => {
            setShowRecommendations(false);
            setShowQuestionnaire(true);
          }} onViewDetails={(scheme) => {
            setSelectedScheme(scheme);
            setShowRecommendations(false);
          }} />
        ) : showQuestionnaire ? (
          <div className="py-8 w-full animate-fade-in" id="questionnaire-section">
            <Questionnaire
              onBackToHome={() => setShowQuestionnaire(false)}
              onFindSchemes={(answers) => {
                setQuestionnaireAnswers(answers);
                setShowQuestionnaire(false);
                setShowRecommendations(true);
              }}
              language={language}
            />
          </div>
        ) : (
          <>
            <section aria-labelledby="hero-title" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-4 lg:py-8" id="hero">
              <div className="lg:col-span-7 flex flex-col items-start">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-orange-800 text-xs font-semibold mb-6">
                  <svg className="w-3.5 h-3.5 text-saffron-600" fill="currentColor" viewBox="0 0 20 20">
                    <path clipRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" fillRule="evenodd"></path>
                  </svg>
                  <span data-i18n="badge">{t('badge')}</span>
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-navy-900 leading-[1.12] mb-5" data-i18n="headline" id="hero-title">{t('headline')}</h1>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl" data-i18n="description">{t('description')}</p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-8 w-full sm:w-auto">
                  <a
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-navy-900 hover:bg-slate-900 text-white font-semibold text-base sm:text-lg px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 group cursor-pointer"
                    onClick={(e) => { e.preventDefault(); setShowQuestionnaire(true); }}
                  >
                    <span data-i18n="findScheme">{t('findScheme')}</span>
                    <svg className="w-5 h-5 text-saffron-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"></path>
                    </svg>
                  </a>
                  <a className="text-slate-600 hover:text-navy-900 font-medium text-base underline-offset-4 hover:underline transition-colors px-2 py-1" data-i18n="explore" href="#schemes">{t('explore')}</a>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 border-t border-slate-200 text-xs sm:text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                    </svg>
                    <span data-i18n="schemesCount">{t('schemesCount')}</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                    </svg>
                    <span data-i18n="dbt">{t('dbt')}</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5"></path>
                    </svg>
                    <span data-i18n="intermediaries">{t('intermediaries')}</span>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
                <div className="relative w-full max-w-xl lg:max-w-none bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/80 shadow-sm shadow-slate-100">
                  <div className="overflow-hidden rounded-xl bg-slate-50 relative aspect-[4/3] flex items-center justify-center">
                    {heroImages.map((image, index) => (
                      <img
                        key={image.src}
                        alt={image.alt}
                        className={`absolute inset-0 w-full h-full object-contain object-center transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                          }`}
                        src={image.src}
                      />
                    ))}
                    {/* Dot indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                      {heroImages.map((image, index) => (
                        <button
                          key={image.src}
                          aria-label={`Show slide ${index + 1}`}
                          className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                            }`}
                          onClick={() => setCurrentSlide(index)}
                          type="button"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute -top-3 -left-3 sm:-left-4 bg-white/95 backdrop-blur border border-slate-200 px-3.5 py-2 rounded-xl shadow-md flex items-center gap-2.5 animate-float-slow">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                      <span className="text-orange-700 font-bold text-xs">₹</span>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Trending Featured Scheme</p>
                      <p className="text-xs font-bold text-navy-900">PMMY Mudra Loan Support</p>
                    </div>
                  </div>
                  <div className="absolute -bottom-3 -right-2 sm:-right-4 bg-white/95 backdrop-blur border border-slate-200 px-3.5 py-2 rounded-xl shadow-md flex items-center gap-2.5 animate-float-delayed">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Capital Assistance</p>
                      <p className="text-xs font-bold text-emerald-700">Interest Subsidy up to 35%</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section aria-label="Core Pillars of Service" className="mt-8 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <div className="w-10 h-10 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-saffron-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-navy-900" data-i18n="matching">{t('matching')}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed" data-i18n="matchingText">{t('matchingText')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-slate-100 shadow-2xs">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-navy-800">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-navy-900" data-i18n="transparent">{t('transparent')}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed" data-i18n="transparentText">{t('transparentText')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-200 hover:shadow-sm cursor-pointer transition-all" onClick={() => { setShowQuestionnaire(false); setShowPartners(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} role="button" tabIndex={0}>
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-white border border-slate-100 shadow-2xs hover:border-emerald-200 hover:shadow-sm cursor-pointer transition-all relative z-50 pointer-events-auto" onClick={() => { setShowQuestionnaire(false); setShowPartners(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }} role="button" tabIndex={0}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-navy-900" data-i18n="partners">{t('partners')}</h2>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed" data-i18n="partnersText">{t('partnersText')}</p>
                  </div>
                </div>
              </div>
            </section>
            <section aria-labelledby="cta-heading" className="mt-4 mb-2">
              <div className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white" data-i18n="ctaHeading" id="cta-heading">{t('ctaHeading')}</h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl" data-i18n="ctaText">{t('ctaText')}</p>
                  </div>
                  <div className="shrink-0 w-full sm:w-auto">
                    <a
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-saffron-500 hover:bg-saffron-600 text-white font-semibold text-sm sm:text-base px-7 py-3 rounded-xl transition-all duration-150 shadow hover:shadow-orange-500/25 cursor-pointer"
                      onClick={(e) => { e.preventDefault(); setShowQuestionnaire(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    >
                      <span data-i18n="findScheme">{t('findScheme')}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="w-full border-t border-slate-200 bg-white py-6 px-4 sm:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-navy-900 text-sm tracking-tight">YOJANA<span className="text-saffron-500">X</span></span>
            <span className="text-slate-300">|</span>
            <span data-i18n="footerText">{t('footerText')}</span>
          </div>
          <nav aria-label="Legal and Assistance Links" className="flex items-center gap-4 text-xs">
            <a className="hover:text-navy-900 transition-colors cursor-pointer" data-i18n="privacy">{t('privacy')}</a>
            <span className="text-slate-300">·</span>
            <a className="hover:text-navy-900 transition-colors cursor-pointer" data-i18n="terms" onClick={(e) => { e.preventDefault(); setActiveModal('terms'); }}>{t('terms')}</a>
            <span className="text-slate-300">·</span>
            <a className="hover:text-navy-900 transition-colors cursor-pointer" data-i18n="contact" onClick={(e) => { e.preventDefault(); setActiveModal('contact'); }}>{t('contact')}</a>
            <span className="text-slate-300">·</span>
            <a className="hover:text-navy-900 transition-colors cursor-pointer" data-i18n="accessibility">{t('accessibility')}</a>
          </nav>
          <div className="text-[11px] text-slate-400">
            &copy; 2026 YOJANAX. A demo Government of India Initiative.
          </div>
        </div>
      </footer>

      {activeModal === 'about' && (
        <Modal title="About Us" onClose={() => setActiveModal(null)}>
          <div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Our Vision</h3>
            <p className="leading-relaxed">Our vision is to make citizens life easier.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy-900 mb-2">Our Mission</h3>
            <p className="leading-relaxed">
              Our mission is to streamline the government - user interface for government schemes and benefits.
              Reduce time and effort required to find and avail a government scheme.
            </p>
          </div>
        </Modal>
      )}

      {activeModal === 'terms' && (
        <Modal title="Terms of Use" onClose={() => setActiveModal(null)}>
          <p>These terms of use describe your rights and responsibilities as a user of the https://www.myscheme.gov.in . To have a myScheme account, you must accept these terms of use.</p>
          <p>MeitY and Govt. of India reserve the right to make changes to myScheme and these terms of use at any time. If those changes affect your rights or responsibilities, you will be notified through myScheme.</p>
          <p>The following terms of use supersede and replace any terms and conditions you may have previously accepted governing your use of myScheme. The following Terms & Conditions come into effect as soon as you have accepted it and created your myScheme account.</p>
          <p>As a user of myScheme you are granted a nonexclusive, nontransferable, revocable, limited license to access and use myScheme and content following these Terms of Use. The provider may terminate this license at any time for any reason.</p>
          <p>myScheme is designed by NeGD & hosted by Amazon Web Services (AWS),and Contents are provided by the various Organizations, Departments, and Ministries of the Government of India.</p>
          <p>Though all efforts have been made to ensure the accuracy of the content on myScheme, the same should not be construed as a statement of law or used for any legal purposes. In case of any ambiguity or doubts, users are advised to verify/check with the concerned Ministry/Department/Organization and/or other source(s), and to obtain appropriate professional advice.</p>
          <p>Under no circumstances will the Government Ministry/Department/Organization be liable for any expense, loss, or damage including, without limitation, indirect or consequential loss or damage, or any expense, loss, or damage whatsoever arising from use, or loss of use, of data, arising out of or in connection with the use of myScheme.</p>

          <h3 className="text-lg font-bold text-navy-900 mt-4 mb-2">LIMITATION ON USE:</h3>
          <p>Any unauthorized use of myScheme is prohibited. The use of any software (e.g. bots, scraper tools) or other automatic devices to access, monitor, or copy the platform pages is prohibited unless expressly authorized by the myScheme in writing.</p>

          <h3 className="text-lg font-bold text-navy-900 mt-4 mb-2">POLICY CONCERNING YOUR CONTENT:</h3>
          <p>Uploading content or submitting any materials for use on myScheme, you grant (or warrant that the owner of such rights has expressly granted) myScheme a perpetual, worldwide, royalty-free, irrevocable, non-exclusive right and license, with a right to sublicense, to use, reproduce, modify, adapt, publish, publicly perform, publicly display, digitally display and digitally perform translate, create derivative works from and distribute such materials or incorporate such materials into any form, medium, or technology now known or later developed throughout the universe. You agree that you shall have no recourse against Provider for any alleged or actual infringement or misappropriation of any proprietary right in your communication to us.</p>

          <h3 className="text-lg font-bold text-navy-900 mt-4 mb-2">USER RESPONSIBILITY:</h3>
          <p>You must:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Be a natural person to access or seek to access myScheme or a Member Service;</li>
            <li>Not access or link to or seek to access or link to (either directly or indirectly) any other person's myScheme or Member Service account;</li>
            <li>Not permit any other person to use your username and password; keep your myScheme account username, and password, at all times and not disclose your password to anyone else;</li>
            <li>Report the HelpDesk immediately if you suspect that the security of your myScheme account may have been compromised e.g.: your password or username has been lost or stolen. Contact myScheme using the details at Contact Us;</li>
            <li>Ensure your details (including your name and date of birth) are accurate and keep up to date with myScheme;</li>
            <li>You are responsible for any use of your myScheme account using your username and password, whether or not such use has been authorized by you.</li>
            <li>Details on myScheme may only be accessed through the myScheme, and only using the username and authentication details that have been specifically allocated to you.</li>
            <li>You must use myScheme and your myScheme account only for lawful purposes and in a manner that does not infringe the rights of or restrict or inhibit the use of myScheme by any third party. This includes conduct that is unlawful or which may harass or cause distress or inconvenience to any person, the transmission of obscene or offensive content, or disruption to myScheme.</li>
          </ul>

          <h3 className="text-lg font-bold text-navy-900 mt-4 mb-2">INFORMATION THAT YOU PROVIDE ON myScheme:</h3>
          <p>If within your myScheme account, you are asked to provide information, the information you supply must be complete and accurate. You acknowledge that if you supply incomplete, inaccurate, or false information, use myScheme to perform (or attempt to perform) an unauthorized action, or otherwise misuse myScheme, it may suspend or terminate your myScheme access.</p>
          <p>Giving false or misleading information is a serious offense. Providing incomplete, inaccurate, or false information via myScheme will be treated in the same way as providing incorrect information on a form or in person and may result in prosecution and civil or criminal penalties.</p>
        </Modal>
      )}

      {activeModal === 'contact' && (
        <Modal title="Contact Us & FAQ" onClose={() => setActiveModal(null)}>
          <div className="mb-8">
            <h3 className="text-xl font-bold text-navy-900 mb-4">Official Contact Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-xs uppercase font-bold text-slate-500 mb-1">General Enquiries</p>
                <p className="font-semibold text-navy-900 dark:text-white">support@yojanax.gov.in</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-xs uppercase font-bold text-slate-500 mb-1">Toll Free Helpline</p>
                <p className="font-semibold text-navy-900 dark:text-white">1800-11-2233</p>
                <p className="text-xs text-slate-500 mt-1">Available 8 AM to 8 PM</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-xs uppercase font-bold text-slate-500 mb-1">Grievance Redressal</p>
                <p className="font-semibold text-navy-900 dark:text-white">grievance@yojanax.gov.in</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
                <p className="text-xs uppercase font-bold text-slate-500 mb-1">Nodal Ministry</p>
                <p className="font-semibold text-navy-900 dark:text-white">Ministry of Social Justice and Empowerment</p>
                <p className="text-xs text-slate-500 mt-1">Electronics Niketan, New Delhi</p>
              </div>
            </div>
          </div>



          <div>
            <h3 className="text-xl font-bold text-navy-900 mb-4">Frequently Asked Questions</h3>
            <div className="space-y-4">
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="font-bold text-navy-900 dark:text-white mb-2">Is there any fee to check scheme eligibility?</h4>
                <p className="text-sm">No. Checking scheme eligibility on YOJANAX is completely free for all citizens.</p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="font-bold text-navy-900 dark:text-white mb-2">How accurate is the scheme matching?</h4>
                <p className="text-sm">The matching is based on the data you provide in the questionnaire and cross-referenced with the latest official guidelines for Central and State schemes.</p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="font-bold text-navy-900 dark:text-white mb-2">Do I need to submit physical documents?</h4>
                <p className="text-sm">Not for the initial discovery. However, when you decide to apply for a matched scheme, you may be required to upload digital copies of necessary documents through the respective portal.</p>
              </div>
              <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                <h4 className="font-bold text-navy-900 dark:text-white mb-2">Can I apply for multiple schemes at once?</h4>
                <p className="text-sm">While you can discover multiple eligible schemes, the application rules depend on the specific schemes. Many schemes do not allow concurrent benefits for the same business purpose.</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
      <Chatbot />
    </div>

  );
}