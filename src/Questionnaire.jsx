import { useState } from 'react';
import StateDistrictSelect from './StateDistrictSelect';

const labels = {
  English: { step1: 'About You', step2: 'Business Details', step3: 'Funding Requirements', step4: 'Existing Financial Situation', ready: 'Ready to find your schemes?', readyDesc: 'Based on the information you provided, YOJANX will compare your profile with available government-backed schemes and explain why each scheme may or may not be suitable.', cancel: 'Cancel', back: 'Back', continue: 'Continue', find: '🔎 Find Suitable Schemes' },
  'हिंदी': { step1: 'आपके बारे में', step2: 'व्यवसाय का विवरण', step3: 'फंडिंग की आवश्यकताएं', step4: 'वर्तमान वित्तीय स्थिति', ready: 'क्या आप अपनी योजनाएं खोजने के लिए तैयार हैं?', readyDesc: 'आपके द्वारा दी गई जानकारी के आधार पर, YOJANX आपकी प्रोफ़ाइल की तुलना उपलब्ध योजनाओं से करेगा।', cancel: 'रद्द करें', back: 'पीछे', continue: 'आगे बढ़ें', find: '🔎 उपयुक्त योजनाएं खोजें' },
};

const educationCopy = {
  English: { support: 'Education / Higher Studies', sc: 'Are you from the Marginalized category?', certificate: 'Do you have a valid caste certificate?', income: 'What is your annual family income range?', course: 'What type of course are you pursuing?', courseFee: 'What is the course fee?', fullTime: 'Is the course full-time?', recognized: 'Is the institution recognized?', selectCourse: 'Select course type', undergraduate: 'Undergraduate', postgraduate: 'Postgraduate', professional: 'Professional course', vocational: 'Vocational course', other: 'Other' },
  'हिंदी': { support: 'शिक्षा / उच्च अध्ययन', sc: 'क्या आप SC श्रेणी से हैं?', certificate: 'क्या आपके पास वैध जाति प्रमाण पत्र है?', income: 'आपकी वार्षिक पारिवारिक आय क्या है?', course: 'आप किस प्रकार का कोर्स कर रहे हैं?', courseFee: 'कोर्स की फीस कितनी है?', fullTime: 'क्या कोर्स पूर्णकालिक है?', recognized: 'क्या संस्थान मान्यता प्राप्त है?', selectCourse: 'कोर्स का प्रकार चुनें', undergraduate: 'स्नातक', postgraduate: 'स्नातकोत्तर', professional: 'व्यावसायिक कोर्स', vocational: 'व्यावसायिक प्रशिक्षण कोर्स', other: 'अन्य' },
  'मराठी': { support: 'शिक्षण / उच्च शिक्षण', sc: 'तुम्ही SC प्रवर्गातील आहात का?', certificate: 'तुमच्याकडे वैध जात प्रमाणपत्र आहे का?', income: 'तुमचे वार्षिक कौटुंबिक उत्पन्न किती आहे?', course: 'तुम्ही कोणत्या प्रकारचा अभ्यासक्रम करत आहात?', courseFee: 'अभ्यासक्रमाची फी किती आहे?', fullTime: 'अभ्यासक्रम पूर्णवेळ आहे का?', recognized: 'संस्था मान्यताप्राप्त आहे का?', selectCourse: 'अभ्यासक्रमाचा प्रकार निवडा', undergraduate: 'पदवी', postgraduate: 'पदव्युत्तर', professional: 'व्यावसायिक अभ्यासक्रम', vocational: 'व्यावसायिक प्रशिक्षण अभ्यासक्रम', other: 'इतर' },
  'ગુજરાતી': { support: 'શિક્ષણ / ઉચ્ચ અભ્યાસ', sc: 'શું તમે SC શ્રેણીમાં આવો છો?', certificate: 'શું તમારી પાસે માન્ય જાતિ પ્રમાણપત્ર છે?', income: 'તમારી વાર્ષિક કૌટુંબિક આવક કેટલી છે?', course: 'તમે કયા પ્રકારનો કોર્સ કરી રહ્યા છો?', courseFee: 'કોર્સની ફી કેટલી છે?', fullTime: 'શું કોર્સ પૂર્ણ સમયનો છે?', recognized: 'શું સંસ્થા માન્યતા પ્રાપ્ત છે?', selectCourse: 'કોર્સનો પ્રકાર પસંદ કરો', undergraduate: 'સ્નાતક', postgraduate: 'અનુસ્નાતક', professional: 'વ્યાવસાયિક કોર્સ', vocational: 'વ્યાવસાયિક તાલીમ કોર્સ', other: 'અન્ય' },
  'தமிழ்': { support: 'கல்வி / உயர் கல்வி', sc: 'நீங்கள் SC பிரிவைச் சேர்ந்தவரா?', certificate: 'உங்களிடம் செல்லுபடியாகும் சாதிச் சான்றிதழ் உள்ளதா?', income: 'உங்கள் ஆண்டு குடும்ப வருமானம் என்ன?', course: 'நீங்கள் எந்த வகையான படிப்பை பயில்கிறீர்கள்?', courseFee: 'படிப்புக் கட்டணம் எவ்வளவு?', fullTime: 'படிப்பு முழுநேரமா?', recognized: 'நிறுவனம் அங்கீகரிக்கப்பட்டதா?', selectCourse: 'படிப்பு வகையைத் தேர்ந்தெடுக்கவும்', undergraduate: 'இளங்கலை', postgraduate: 'முதுகலை', professional: 'தொழில்முறை படிப்பு', vocational: 'தொழிற்கல்வி படிப்பு', other: 'மற்றவை' },
  'తెలుగు': { support: 'విద్య / ఉన్నత విద్య', sc: 'మీరు SC వర్గానికి చెందినవారా?', certificate: 'మీ వద్ద చెల్లుబాటు అయ్యే కుల ధృవీకరణ పత్రం ఉందా?', income: 'మీ వార్షిక కుటుంబ ఆదాయం ఎంత?', course: 'మీరు ఏ రకమైన కోర్సు చదువుతున్నారు?', courseFee: 'కోర్సు ఫీజు ఎంత?', fullTime: 'కోర్సు పూర్తికాలమా?', recognized: 'సంస్థ గుర్తింపు పొందిందా?', selectCourse: 'కోర్సు రకాన్ని ఎంచుకోండి', undergraduate: 'అండర్ గ్రాడ్యుయేట్', postgraduate: 'పోస్ట్ గ్రాడ్యుయేట్', professional: 'ప్రొఫెషనల్ కోర్సు', vocational: 'వృత్తి విద్యా కోర్సు', other: 'ఇతర' },
  'മലയാളം': { support: 'വിദ്യാഭ്യാസം / ഉന്നത വിദ്യാഭ്യാസം', sc: 'നിങ്ങൾ SC വിഭാഗത്തിൽപ്പെട്ടവരാണോ?', certificate: 'നിങ്ങളുടെ കൈവശം സാധുവായ ജാതി സർട്ടിഫിക്കറ്റ് ഉണ്ടോ?', income: 'നിങ്ങളുടെ വാർഷിക കുടുംബ വരുമാനം എത്രയാണ്?', course: 'നിങ്ങൾ ഏത് തരത്തിലുള്ള കോഴ്സാണ് പഠിക്കുന്നത്?', courseFee: 'കോഴ്സ് ഫീസ് എത്രയാണ്?', fullTime: 'കോഴ്സ് മുഴുവൻ സമയമാണോ?', recognized: 'സ്ഥാപനം അംഗീകൃതമാണോ?', selectCourse: 'കോഴ്സ് തരം തിരഞ്ഞെടുക്കുക', undergraduate: 'ബിരുദം', postgraduate: 'ബിരുദാനന്തര ബിരുദം', professional: 'പ്രൊഫഷണൽ കോഴ്സ്', vocational: 'വൊക്കേഷണൽ കോഴ്സ്', other: 'മറ്റുള്ളവ' },
  'ଓଡ଼ିଆ': { support: 'ଶିକ୍ଷା / ଉଚ୍ଚଶିକ୍ଷା', sc: 'ଆପଣ SC ବର୍ଗରୁ କି?', certificate: 'ଆପଣଙ୍କ ପାଖରେ ବୈଧ ଜାତି ପ୍ରମାଣପତ୍ର ଅଛି କି?', income: 'ଆପଣଙ୍କ ବାର୍ଷିକ ପାରିବାରିକ ଆୟ କେତେ?', course: 'ଆପଣ କେଉଁ ପ୍ରକାରର ପାଠ୍ୟକ୍ରମ କରୁଛନ୍ତି?', courseFee: 'ପାଠ୍ୟକ୍ରମ ଫି କେତେ?', fullTime: 'ପାଠ୍ୟକ୍ରମ ପୂର୍ଣ୍ଣକାଳୀନ କି?', recognized: 'ଅନୁଷ୍ଠାନଟି ସ୍ୱୀକୃତିପ୍ରାପ୍ତ କି?', selectCourse: 'ପାଠ୍ୟକ୍ରମ ପ୍ରକାର ବାଛନ୍ତୁ', undergraduate: 'ସ୍ନାତକ', postgraduate: 'ସ୍ନାତକୋତ୍ତର', professional: 'ବୃତ୍ତିଗତ ପାଠ୍ୟକ୍ରମ', vocational: 'ଧନ୍ଦାମୂଳକ ପାଠ୍ୟକ୍ରମ', other: 'ଅନ୍ୟାନ୍ୟ' },
  'বাংলা': { support: 'শিক্ষা / উচ্চশিক্ষা', sc: 'আপনি কি SC শ্রেণির অন্তর্ভুক্ত?', certificate: 'আপনার কি বৈধ জাতি শংসাপত্র আছে?', income: 'আপনার বার্ষিক পারিবারিক আয় কত?', course: 'আপনি কোন ধরনের কোর্স করছেন?', courseFee: 'কোর্সের ফি কত?', fullTime: 'কোর্সটি কি পূর্ণকালীন?', recognized: 'প্রতিষ্ঠানটি কি স্বীকৃত?', selectCourse: 'কোর্সের ধরন বেছে নিন', undergraduate: 'স্নাতক', postgraduate: 'স্নাতকোত্তর', professional: 'পেশাগত কোর্স', vocational: 'বৃত্তিমূলক কোর্স', other: 'অন্যান্য' },
  'भोजपुरी': { support: 'शिक्षा / उच्च पढ़ाई', sc: 'का रउरा SC श्रेणी से बानी?', certificate: 'का रउरा लगे मान्य जाति प्रमाण पत्र बा?', income: 'रउरा के सालाना पारिवारिक आमदनी कतना बा?', course: 'रउरा कवन प्रकार के कोर्स करत बानी?', courseFee: 'कोर्स के फीस कतना बा?', fullTime: 'का कोर्स पूरा समय के बा?', recognized: 'का संस्थान मान्यता प्राप्त बा?', selectCourse: 'कोर्स के प्रकार चुनीं', undergraduate: 'स्नातक', postgraduate: 'स्नातकोत्तर', professional: 'व्यावसायिक कोर्स', vocational: 'व्यावसायिक प्रशिक्षण कोर्स', other: 'अन्य' },
};

const localizedEducationCopy = {
  English: { sc: 'Are you from the Marginalized category?', certificate: 'Do you have a valid caste certificate?', income: 'What is your annual family income range?', course: 'What type of course are you pursuing?', courseFee: 'What is the course fee?', fullTime: 'Is the course full-time?', recognized: 'Is the institution recognized?', selectCourse: 'Select course type', undergraduate: 'Undergraduate', postgraduate: 'Postgraduate', professional: 'Professional course', vocational: 'Vocational course', other: 'Other' },
  'हिंदी': { sc: 'क्या आप Marginalized श्रेणी से हैं?', certificate: 'क्या आपके पास वैध जाति प्रमाण पत्र है?', income: 'आपकी वार्षिक पारिवारिक आय क्या है?', course: 'आप किस प्रकार का कोर्स कर रहे हैं?', courseFee: 'कोर्स की फीस कितनी है?', fullTime: 'क्या कोर्स पूर्णकालिक है?', recognized: 'क्या संस्थान मान्यता प्राप्त है?', selectCourse: 'कोर्स का प्रकार चुनें', undergraduate: 'स्नातक', postgraduate: 'स्नातकोत्तर', professional: 'व्यावसायिक कोर्स', vocational: 'व्यावसायिक प्रशिक्षण कोर्स', other: 'अन्य' },
  'मराठी': { sc: 'तुम्ही Marginalized प्रवर्गातील आहात का?', certificate: 'तुमच्याकडे वैध जात प्रमाणपत्र आहे का?', income: 'तुमचे वार्षिक कौटुंबिक उत्पन्न किती आहे?', course: 'तुम्ही कोणत्या प्रकारचा अभ्यासक्रम करत आहात?', courseFee: 'अभ्यासक्रमाची फी किती आहे?', fullTime: 'अभ्यासक्रम पूर्णवेळ आहे का?', recognized: 'संस्था मान्यताप्राप्त आहे का?', selectCourse: 'अभ्यासक्रमाचा प्रकार निवडा', undergraduate: 'पदवी', postgraduate: 'पदव्युत्तर', professional: 'व्यावसायिक अभ्यासक्रम', vocational: 'व्यावसायिक प्रशिक्षण अभ्यासक्रम', other: 'इतर' },
  'भोजपुरी': { sc: 'का रउरा Marginalized श्रेणी से बानी?', certificate: 'का रउरा लगे मान्य जाति प्रमाण पत्र बा?', income: 'रउरा के सालाना पारिवारिक आमदनी कतना बा?', course: 'रउरा कवन प्रकार के कोर्स करत बानी?', courseFee: 'कोर्स के फीस कतना बा?', fullTime: 'का कोर्स पूरा समय के बा?', recognized: 'का संस्थान मान्यता प्राप्त बा?', selectCourse: 'कोर्स के प्रकार चुनीं', undergraduate: 'स्नातक', postgraduate: 'स्नातकोत्तर', professional: 'व्यावसायिक कोर्स', vocational: 'व्यावसायिक प्रशिक्षण कोर्स', other: 'अन्य' },
  'தமிழ்': { sc: 'நீங்கள் Marginalized பிரிவைச் சேர்ந்தவரா?', certificate: 'உங்களிடம் செல்லுபடியாகும் சாதிச் சான்றிதழ் உள்ளதா?', income: 'உங்கள் ஆண்டு குடும்ப வருமானம் என்ன?', course: 'நீங்கள் எந்த வகையான படிப்பை பயில்கிறீர்கள்?', courseFee: 'படிப்புக் கட்டணம் எவ்வளவு?', fullTime: 'படிப்பு முழுநேரமா?', recognized: 'நிறுவனம் அங்கீகரிக்கப்பட்டதா?', selectCourse: 'படிப்பு வகையைத் தேர்ந்தெடுக்கவும்', undergraduate: 'இளங்கலை', postgraduate: 'முதுகலை', professional: 'தொழில்முறை படிப்பு', vocational: 'தொழிற்கல்வி படிப்பு', other: 'மற்றவை' },
  'తెలుగు': { sc: 'మీరు Marginalized వర్గానికి చెందినవారా?', certificate: 'మీ వద్ద చెల్లుబాటు అయ్యే కుల ధృవీకరణ పత్రం ఉందా?', income: 'మీ వార్షిక కుటుంబ ఆదాయం ఎంత?', course: 'మీరు ఏ రకమైన కోర్సు చదువుతున్నారు?', courseFee: 'కోర్సు ఫీజు ఎంత?', fullTime: 'కోర్సు పూర్తికాలమా?', recognized: 'సంస్థ గుర్తింపు పొందిందా?', selectCourse: 'కోర్సు రకాన్ని ఎంచుకోండి', undergraduate: 'అండర్ గ్రాడ్యుయేట్', postgraduate: 'పోస్ట్ గ్రాడ్యుయేట్', professional: 'ప్రొఫెషనల్ కోర్సు', vocational: 'వృత్తి విద్యా కోర్సు', other: 'ఇతర' },
  'മലയാളം': { sc: 'നിങ്ങൾ Marginalized വിഭാഗത്തിൽപ്പെട്ടവരാണോ?', certificate: 'നിങ്ങളുടെ കൈവശം സാധുവായ ജാതി സർട്ടിഫിക്കറ്റ് ഉണ്ടോ?', income: 'നിങ്ങളുടെ വാർഷിക കുടുംബ വരുമാനം എത്രയാണ്?', course: 'നിങ്ങൾ ഏത് തരത്തിലുള്ള കോഴ്സാണ് പഠിക്കുന്നത്?', courseFee: 'കോഴ്സ് ഫീസ് എത്രയാണ്?', fullTime: 'കോഴ്സ് മുഴുവൻ സമയമാണോ?', recognized: 'സ്ഥാപനം അംഗീകൃതമാണോ?', selectCourse: 'കോഴ്സ് തരം തിരഞ്ഞെടുക്കുക', undergraduate: 'ബിരുദം', postgraduate: 'ബിരുദാനന്തര ബിരുദം', professional: 'പ്രൊഫഷണൽ കോഴ്സ്', vocational: 'വൊക്കേഷണൽ കോഴ്സ്', other: 'മറ്റുള്ളവ' },
  'ગુજરાતી': { sc: 'શું તમે Marginalized શ્રેણીમાં આવો છો?', certificate: 'શું તમારી પાસે માન્ય જાતિ પ્રમાણપત્ર છે?', income: 'તમારી વાર્ષિક કૌટુંબિક આવક કેટલી છે?', course: 'તમે કયા પ્રકારનો કોર્સ કરી રહ્યા છો?', courseFee: 'કોર્સની ફી કેટલી છે?', fullTime: 'શું કોર્સ પૂર્ણ સમયનો છે?', recognized: 'શું સંસ્થા માન્યતા પ્રાપ્ત છે?', selectCourse: 'કોર્સનો પ્રકાર પસંદ કરો', undergraduate: 'સ્નાતક', postgraduate: 'અનુસ્નાતક', professional: 'વ્યાવસાયિક કોર્સ', vocational: 'વ્યાવસાયિક તાલીમ કોર્સ', other: 'અન્ય' },
  'ଓଡ଼ିଆ': { sc: 'ଆପଣ Marginalized ବର୍ଗରୁ କି?', certificate: 'ଆପଣଙ୍କ ପାଖରେ ବୈଧ ଜାତି ପ୍ରମାଣପତ୍ର ଅଛି କି?', income: 'ଆପଣଙ୍କ ବାର୍ଷିକ ପାରିବାରିକ ଆୟ କେତେ?', course: 'ଆପଣ କେଉଁ ପ୍ରକାରର ପାଠ୍ୟକ୍ରମ କରୁଛନ୍ତି?', courseFee: 'ପାଠ୍ୟକ୍ରମ ଫି କେତେ?', fullTime: 'ପାଠ୍ୟକ୍ରମ ପୂର୍ଣ୍ଣକାଳୀନ କି?', recognized: 'ଅନୁଷ୍ଠାନଟି ସ୍ୱୀକୃତିପ୍ରାପ୍ତ କି?', selectCourse: 'ପାଠ୍ୟକ୍ରମ ପ୍ରକାର ବାଛନ୍ତୁ', undergraduate: 'ସ୍ନାତକ', postgraduate: 'ସ୍ନାତକୋତ୍ତର', professional: 'ବୃତ୍ତିଗତ ପାଠ୍ୟକ୍ରମ', vocational: 'ଧନ୍ଦାମୂଳକ ପାଠ୍ୟକ୍ରମ', other: 'ଅନ୍ୟାନ୍ୟ' },
  'বাংলা': { sc: 'আপনি কি Marginalized শ্রেণির অন্তর্ভুক্ত?', certificate: 'আপনার কি বৈধ জাতি শংসাপত্র আছে?', income: 'আপনার বার্ষিক পারিবারিক আয় কত?', course: 'আপনি কোন ধরনের কোর্স করছেন?', courseFee: 'কোর্সের ফি কত?', fullTime: 'কোর্সটি কি পূর্ণকালীন?', recognized: 'প্রতিষ্ঠানটি কি স্বীকৃত?', selectCourse: 'কোর্সের ধরন বেছে নিন', undergraduate: 'স্নাতক', postgraduate: 'স্নাতকোত্তর', professional: 'পেশাগত কোর্স', vocational: 'বৃত্তিমূলক কোর্স', other: 'অন্যান্য' },
};

const yesNo = [{ value: 'Yes', label: 'Yes' }, { value: 'No', label: 'No' }];

const questionnaireCopy = {
  English: {
    supportQuestion: 'What kind of support are you looking for?', businessSupport: 'Start or Grow a Business', businessDescription: 'Find government-backed financial schemes for starting or growing a business.', educationSupport: 'Education / Higher Studies', educationDescription: 'Find government-backed educational loan/support schemes for your studies.', businessStatus: 'Are you planning to start a new business or do you already have a business?', sc: 'Are you from the Marginalized category?', income: 'What is your annual family income range?', education: 'What is your highest education qualification?', businessType: 'What type of business are you planning or currently running?', activity: 'What is the main activity of your business?', location: 'Where is your business located?', projectCost: 'What is the estimated total project cost?', assistance: 'How much financial assistance do you need?', fundingPurpose: 'What do you need the funding for?', existingLoan: 'Do you currently have any business loan?', outstandingLoan: 'If yes, what is the approximate outstanding loan amount?', newBusiness: 'Starting a new business', existingBusiness: 'Existing business', belowOne: 'Below ₹1 lakh', oneThree: '₹1–3 lakh', threeFive: '₹3–5 lakh', aboveFive: 'Above ₹5 lakh', educationOptions: ['Below 10th', '10th', '12th', 'Diploma', 'Graduate', 'Postgraduate'], businessOptions: ['Manufacturing', 'Services', 'Trading', 'Agriculture & allied activities', 'Other'], fundingOptions: ['Starting a new business', 'Purchasing machinery/equipment', 'Working capital', 'Business expansion', 'Education/training related to entrepreneurship', 'Other'], other: 'Other', no: 'No', yes: 'Yes', pin: 'PIN code', activityPlaceholder: 'e.g. Tailoring, dairy farming, mobile repair'
  },
  'हिंदी': { supportQuestion: 'आप किस प्रकार की सहायता चाहते हैं?', businessSupport: 'व्यवसाय शुरू या बढ़ाएं', businessDescription: 'व्यवसाय शुरू करने या बढ़ाने के लिए सरकार समर्थित वित्तीय योजनाएं खोजें।', educationSupport: 'शिक्षा / उच्च अध्ययन', educationDescription: 'अपनी पढ़ाई के लिए सरकार समर्थित शैक्षिक ऋण/सहायता योजनाएं खोजें।', businessStatus: 'क्या आप नया व्यवसाय शुरू करने की योजना बना रहे हैं या पहले से व्यवसाय है?', sc: 'क्या आप Marginalized श्रेणी से हैं?', income: 'आपकी वार्षिक पारिवारिक आय क्या है?', education: 'आपकी उच्चतम शैक्षणिक योग्यता क्या है?', businessType: 'आप किस प्रकार का व्यवसाय चला रहे हैं या शुरू करना चाहते हैं?', activity: 'आपके व्यवसाय की मुख्य गतिविधि क्या है?', location: 'आपका व्यवसाय कहाँ स्थित है?', projectCost: 'अनुमानित कुल परियोजना लागत कितनी है?', assistance: 'आपको कितनी वित्तीय सहायता चाहिए?', fundingPurpose: 'आपको फंडिंग किस लिए चाहिए?', existingLoan: 'क्या आपके पास वर्तमान में कोई व्यावसायिक ऋण है?', outstandingLoan: 'यदि हाँ, तो अनुमानित बकाया ऋण राशि क्या है?', newBusiness: 'नया व्यवसाय शुरू करना', existingBusiness: 'मौजूदा व्यवसाय', belowOne: '₹1 लाख से कम', oneThree: '₹1–3 लाख', threeFive: '₹3–5 लाख', aboveFive: '₹5 लाख से अधिक', educationOptions: ['10वीं से कम', '10वीं', '12वीं', 'डिप्लोमा', 'स्नातक', 'स्नातकोत्तर'], businessOptions: ['विनिर्माण', 'सेवाएं', 'व्यापार', 'कृषि एवं संबद्ध गतिविधियां', 'अन्य'], fundingOptions: ['नया व्यवसाय शुरू करने के लिए', 'मशीनरी/उपकरण खरीदने के लिए', 'कार्यशील पूंजी', 'व्यवसाय विस्तार', 'उद्यमिता शिक्षा/प्रशिक्षण', 'अन्य'], other: 'अन्य', no: 'नहीं', yes: 'हाँ', pin: 'पिन कोड', activityPlaceholder: 'जैसे सिलाई, डेयरी फार्मिंग, मोबाइल रिपेयर' },
  'मराठी': { supportQuestion: 'तुम्ही कोणत्या प्रकारची मदत शोधत आहात?', businessSupport: 'व्यवसाय सुरू करा किंवा वाढवा', businessDescription: 'व्यवसाय सुरू करण्यासाठी किंवा वाढवण्यासाठी सरकार समर्थित आर्थिक योजना शोधा.', educationSupport: 'शिक्षण / उच्च शिक्षण', educationDescription: 'तुमच्या शिक्षणासाठी सरकार समर्थित शैक्षणिक कर्ज/मदत योजना शोधा.', businessStatus: 'तुम्ही नवीन व्यवसाय सुरू करण्याची योजना आखत आहात की आधीच व्यवसाय आहे?', sc: 'तुम्ही SC प्रवर्गातील आहात का?', income: 'तुमचे वार्षिक कौटुंबिक उत्पन्न किती आहे?', education: 'तुमची सर्वोच्च शैक्षणिक पात्रता काय आहे?', businessType: 'तुम्ही कोणत्या प्रकारचा व्यवसाय चालवत आहात किंवा सुरू करू इच्छिता?', activity: 'तुमच्या व्यवसायाची मुख्य क्रिया काय आहे?', location: 'तुमचा व्यवसाय कुठे आहे?', projectCost: 'अंदाजित एकूण प्रकल्प खर्च किती आहे?', assistance: 'तुम्हाला किती आर्थिक मदत हवी आहे?', fundingPurpose: 'तुम्हाला निधी कशासाठी हवा आहे?', existingLoan: 'तुमच्याकडे सध्या व्यावसायिक कर्ज आहे का?', outstandingLoan: 'होय असल्यास, अंदाजे थकीत कर्ज किती आहे?', newBusiness: 'नवीन व्यवसाय सुरू करणे', existingBusiness: 'विद्यमान व्यवसाय', belowOne: '₹1 लाखापेक्षा कमी', oneThree: '₹1–3 लाख', threeFive: '₹3–5 लाख', aboveFive: '₹5 लाखांपेक्षा जास्त', educationOptions: ['10वी पेक्षा कमी', '10वी', '12वी', 'डिप्लोमा', 'पदवी', 'पदव्युत्तर'], businessOptions: ['उत्पादन', 'सेवा', 'व्यापार', 'कृषी आणि संलग्न क्रियाकलाप', 'इतर'], fundingOptions: ['नवीन व्यवसाय सुरू करण्यासाठी', 'यंत्रसामग्री/उपकरणे खरेदी करण्यासाठी', 'खेळते भांडवल', 'व्यवसाय विस्तार', 'उद्योजकता शिक्षण/प्रशिक्षण', 'इतर'], other: 'इतर', no: 'नाही', yes: 'होय', pin: 'पिन कोड', activityPlaceholder: 'उदा. शिवणकाम, दुग्धव्यवसाय, मोबाईल दुरुस्ती' },
};

export default function Questionnaire({ onBackToHome, onFindSchemes, language = 'English' }) {
  const t = labels[language] ?? labels.English;
  const [supportType, setSupportType] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showFinalScreen, setShowFinalScreen] = useState(false);
  const [showCommunityAlert, setShowCommunityAlert] = useState(false);
  const [formData, setFormData] = useState({
    businessStatus: '', socialCategory: '', familyIncome: '', education: '', businessType: '', mainActivity: '', state: '', district: '', pincode: '', projectCost: '', financialAssistance: '', fundingPurpose: '', hasExistingLoan: '', outstandingLoanAmount: '',
    is_sc: '', caste_certificate_valid: '', annual_family_income_inr: '', course_type: '', course_fee_inr: '', is_full_time: '', institution_recognized: '', gender: ''
  });
  const isEducation = supportType === 'education';
  const businessSteps = [t.step1, t.step2, t.step3, t.step4];
  const education = localizedEducationCopy[language] ?? localizedEducationCopy.English;
  const educationSteps = [education.sc, education.certificate, education.income, education.course, education.courseFee, education.fullTime, education.recognized];
  const steps = supportType === 'education' ? educationSteps : businessSteps;

  const update = (event) => setFormData((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  const chooseSupport = (value) => { setSupportType(value); setCurrentStep(1); setShowFinalScreen(false); };
  const handleNext = () => {
    const scAnswer = isEducation ? formData.is_sc : formData.socialCategory;
    const isScQuestion = (isEducation && currentStep === 1) || (!isEducation && currentStep === 1);

    if (isScQuestion && scAnswer === 'No') {
      setShowCommunityAlert(true);
      return;
    }

    if (currentStep < steps.length) setCurrentStep((step) => step + 1);
    else setShowFinalScreen(true);
  };
  const handleBack = () => { if (showFinalScreen) setShowFinalScreen(false); else if (currentStep > 1) setCurrentStep((step) => step - 1); else if (supportType) setSupportType(''); else onBackToHome(); };

  const indicator = () => <div className="mb-8"><div className="relative flex items-center justify-between"><div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200" /><div className="absolute left-0 top-1/2 -z-10 h-1 -translate-y-1/2 rounded-full bg-navy-900 transition-all" style={{ width: `${((currentStep - 1) / Math.max(steps.length - 1, 1)) * 100}%` }} />{steps.map((step, index) => <div className="flex flex-col items-center gap-2" key={`${step}-${index}`}><div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold ${currentStep >= index + 1 ? 'border-navy-900 bg-navy-900 text-white' : 'border-slate-300 bg-white text-slate-400'}`}>{index + 1}</div><span className={`hidden text-[10px] font-semibold sm:block sm:text-xs ${currentStep >= index + 1 ? 'text-navy-900' : 'text-slate-400'}`}>{step}</span></div>)}</div></div>;

  const radioGroup = (label, name, options = yesNo) => <div className="space-y-4"><label className="block text-sm font-bold text-slate-700">{label}</label><div className="grid gap-3 sm:grid-cols-2">{options.map((option) => <label className={`flex cursor-pointer items-center rounded-xl border p-4 transition-colors ${formData[name] === option.value ? 'border-navy-900 bg-navy-50' : 'border-slate-200 hover:border-slate-300'}`} key={option.value}><input className="h-4 w-4 text-navy-900 focus:ring-navy-900" name={name} value={option.value} checked={formData[name] === option.value} onChange={update} type="radio" /><span className="ml-3 text-sm font-medium text-slate-700">{option.label}</span></label>)}</div></div>;
  const moneyInput = (label, name, placeholder) => <div className="space-y-4"><label className="block text-sm font-bold text-slate-700">{label}</label><div className="relative max-w-md"><span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-semibold text-slate-500">₹</span><input className="block w-full rounded-xl border-slate-300 p-3 pl-8 text-sm focus:border-navy-900 focus:ring-navy-900" name={name} value={formData[name]} onChange={update} placeholder={placeholder} type="text" /></div></div>;

  const businessStep = () => {
    if (currentStep === 1) return <div className="space-y-6 animate-fade-in">{radioGroup('Are you planning to start a new business or do you already have a business?', 'businessStatus', [{ value: 'Starting a new business', label: 'Starting a new business' }, { value: 'Existing business', label: 'Existing business' }])}{radioGroup('Are you from the Marginalized category?', 'socialCategory')}{radioGroup('What is your gender?', 'gender', [{ value: 'Men', label: 'Male' }, { value: 'Women', label: 'Female' }, { value: 'Prefer not to say', label: 'Prefer not to say' }])}{radioGroup('What is your annual family income range?', 'familyIncome', ['Below ₹1 lakh', '₹1–3 lakh', '₹3–5 lakh', 'Above ₹5 lakh'].map((value) => ({ value, label: value })))}{radioGroup('What is your highest education qualification?', 'education', ['Below 10th', '10th', '12th', 'Diploma', 'Graduate', 'Postgraduate'].map((value) => ({ value, label: value })))}</div>;
    if (currentStep === 2) return <div className="space-y-6 animate-fade-in">{radioGroup('What type of business are you planning or currently running?', 'businessType', ['Manufacturing', 'Services', 'Trading', 'Agriculture & allied activities', 'Other'].map((value) => ({ value, label: value })))}<div className="space-y-4"><label className="block text-sm font-bold text-slate-700">What is the main activity of your business?</label><input className="block w-full rounded-xl border-slate-300 p-3 text-sm focus:border-navy-900 focus:ring-navy-900" name="mainActivity" value={formData.mainActivity} onChange={update} placeholder="e.g. Tailoring, dairy farming, mobile repair" type="text" /></div><div className="space-y-4"><label className="block text-sm font-bold text-slate-700">Where is your business located?</label><StateDistrictSelect language={language} onChange={({ state, district }) => setFormData((previous) => ({ ...previous, state, district }))} /><input className="mt-3 block w-full rounded-lg border border-slate-300 p-3 text-sm" name="pincode" value={formData.pincode} onChange={update} placeholder="PIN code" maxLength={6} type="text" /></div></div>;
    if (currentStep === 3) return <div className="space-y-6 animate-fade-in">{moneyInput('What is the estimated total project cost?', 'projectCost', '2,00,000')}{moneyInput('How much financial assistance do you need?', 'financialAssistance', '1,50,000')}{radioGroup('What do you need the funding for?', 'fundingPurpose', ['Starting a new business', 'Purchasing machinery/equipment', 'Working capital', 'Business expansion', 'Education/training related to entrepreneurship', 'Other'].map((value) => ({ value, label: value })))}</div>;
    return <div className="space-y-6 animte-fade-in">{radioGroup('Do you currently have any business loan?', 'hasExistingLoan')}{formData.hasExistingLoan === 'Yes' && moneyInput('If yes, what is the approximate outstanding loan amount?', 'outstandingLoanAmount', '50,000')}</div>;
  };

  const educationStep = () => {
    if (currentStep === 1) return <div className="space-y-6 animate-fade-in">{radioGroup(education.sc, 'is_sc')}{radioGroup('What is your gender?', 'gender', [{ value: 'Men', label: 'Male' }, { value: 'Women', label: 'Female' }, { value: 'Prefer not to say', label: 'Prefer not to say' }])}</div>;
    if (currentStep === 2) return radioGroup(education.certificate, 'caste_certificate_valid');
    if (currentStep === 3) return moneyInput(education.income, 'annual_family_income_inr', 'e.g. 250000');
    if (currentStep === 4) return <div className="space-y-4"><label className="block text-sm font-bold text-slate-700" htmlFor="course_type">{education.course}</label><select className="block w-full max-w-md rounded-xl border-slate-300 bg-white p-3 text-sm" id="course_type" name="course_type" value={formData.course_type} onChange={update}><option value="">{education.selectCourse}</option><option value="Engineering">Engineering</option><option value="Architecture">Architecture</option><option value="Medical">Medical</option><option value="Biotechnology">Biotechnology</option><option value="Pharmacy">Pharmacy</option><option value="Information Technology">Information Technology</option><option value="Management">Management</option><option value="Law">Law</option><option value="Education">Education</option><option value="Nursing">Nursing</option></select></div>;
    if (currentStep === 5) return moneyInput(education.courseFee, 'course_fee_inr', 'e.g. 150000');
    if (currentStep === 6) return radioGroup(education.fullTime, 'is_full_time');
    return radioGroup(education.recognized, 'institution_recognized');
  };

  const review = isEducation ? [['Support', 'Education / Higher Studies'], ['Purpose', 'education'], ['SC category', formData.is_sc], ['Gender', formData.gender], ['Caste certificate', formData.caste_certificate_valid], ['Annual family income (INR)', formData.annual_family_income_inr], ['Course type', formData.course_type], ['Course fee (INR)', formData.course_fee_inr], ['Full-time course', formData.is_full_time], ['Institution recognized', formData.institution_recognized]] : [['Support', 'Start or Grow a Business'], ['Purpose', 'entrepreneurship'], ['Business status', formData.businessStatus], ['SC category', formData.socialCategory], ['Gender', formData.gender], ['Annual family income', formData.familyIncome], ['Education', formData.education], ['Business type', formData.businessType], ['Main activity', formData.mainActivity], ['State', formData.state], ['District', formData.district], ['PIN code', formData.pincode], ['Project cost', formData.projectCost], ['Financial assistance', formData.financialAssistance], ['Funding purpose', formData.fundingPurpose], ['Existing loan', formData.hasExistingLoan], ['Outstanding loan', formData.outstandingLoanAmount]];
  const finalScreen = <div className="space-y-6 py-8 animate-fade-in"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">✓</div><h2 className="text-center text-3xl font-extrabold text-navy-900">{t.ready}</h2><p className="mx-auto max-w-xl text-center leading-relaxed text-slate-600">{t.readyDesc}</p><dl className="mx-auto max-w-2xl divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50 px-5">{review.map(([label, value]) => <div className="grid gap-1 py-3 sm:grid-cols-2 sm:gap-6" key={label}><dt className="text-sm font-semibold text-slate-600">{label}</dt><dd className="text-sm text-slate-800">{value || 'Not provided'}</dd></div>)}</dl></div>;

  return (
    <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
      <div className="p-6 sm:p-10">
        {!showFinalScreen && supportType && indicator()}
        <div className="min-h-[400px]">
          {showFinalScreen ? (
            finalScreen
          ) : (
            <>
              <h2 className="mb-6 text-2xl font-bold text-navy-900">
                <span className="text-saffron-500">  {currentStep}. </span> {supportType ? steps[currentStep - 1] : 'What kind of support are you looking for?'}
              </h2>
              {supportType ? (
                isEducation ? educationStep() : businessStep()
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { value: 'entrepreneurship', title: 'Start or Grow a Business', description: 'Find government-backed financial schemes for starting or growing a business.' },
                    { value: 'education', title: 'Education / Higher Studies', description: 'Find government-backed educational loan/support schemes for your studies.' },
                  ].map((option) => (
                    <button
                      className="rounded-2xl border border-slate-200 p-5 text-left transition-all hover:border-navy-900 hover:shadow-md cursor-pointer"
                      key={option.value}
                      onClick={() => chooseSupport(option.value)}
                      type="button"
                    >
                      <span className="block font-bold text-navy-900">{option.title}</span>
                      <span className="mt-2 block text-sm text-slate-600">{option.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
          <button
            className="rounded-xl px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={handleBack}
            type="button"
          >
            {currentStep === 1 && !showFinalScreen && !supportType ? t.cancel : t.back}
          </button>
          {showFinalScreen ? (
            <button
              className="rounded-xl bg-saffron-500 px-8 py-3.5 font-bold text-white hover:bg-saffron-600 shadow-md transition-all cursor-pointer"
              onClick={() => onFindSchemes({ supportType, formData })}
              type="button"
            >
              {t.find}
            </button>
          ) : (
            <button
              className="rounded-xl bg-navy-900 px-8 py-3.5 font-bold text-white hover:bg-slate-900 disabled:opacity-50 shadow-md transition-all cursor-pointer"
              disabled={!supportType}
              onClick={handleNext}
              type="button"
            >
              {t.continue} {'->'}
            </button>
          )}
        </div>
      </div>

      {showCommunityAlert && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-backdrop-in"
          onClick={() => setShowCommunityAlert(false)}
          role="presentation"
        >
          <div
            aria-labelledby="community-alert-title"
            aria-modal="true"
            className="relative w-full max-w-md rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-2xl shadow-navy-900/25 dark:shadow-saffron-500/10 animate-popup-in transition-all"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            {/* Top Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-saffron-500 via-amber-500 to-navy-900"></div>

            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-3.5 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 dark:bg-slate-800 text-saffron-600 dark:text-saffron-500 font-bold border border-orange-200/60 dark:border-slate-700 shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight text-navy-900 dark:text-white" id="community-alert-title">
                  ALERT!
                </h2>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                This scheme page  is tailored for SC/ST & marginalized applicants. If you are from the General or OBC category, please explore general schemes on the official portal.
              </p>
              <div className="mt-4">
                <a
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-saffron-600 dark:text-saffron-400 hover:text-saffron-700 hover:underline underline-offset-4"
                  href="https://www.myscheme.gov.in/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <span>Visit myScheme.gov.in</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  className="rounded-xl bg-gradient-to-r from-navy-900 to-slate-800 hover:from-slate-900 hover:to-navy-900 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  onClick={() => setShowCommunityAlert(false)}
                  type="button"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



