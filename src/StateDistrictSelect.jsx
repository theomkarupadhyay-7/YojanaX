import { useState } from 'react';
import { indiaStates, indiaStatesDistricts } from './Indiastatesdistricts ';

/**
 * Dependent State/District select.
 *
 * Usage:
 *   <StateDistrictSelect
 *     onChange={({ state, district }) => console.log(state, district)}
 *   />
 *
 * Selecting a state populates the district dropdown with that state's
 * districts and resets any previously chosen district.
 */
const selectTranslations = {
  English: { stateLabel: 'State / UT', selectState: 'Select State / UT', districtLabel: 'District', selectDistrict: 'Select District', selectStateFirst: 'Select a state first' },
  'हिंदी': { stateLabel: 'राज्य / केंद्र शासित प्रदेश', selectState: 'राज्य / केंद्र शासित प्रदेश चुनें', districtLabel: 'जिला', selectDistrict: 'जिला चुनें', selectStateFirst: 'पहले एक राज्य चुनें' },
  'मराठी': { stateLabel: 'राज्य / केंद्रशासित प्रदेश', selectState: 'राज्य / केंद्रशासित प्रदेश निवडा', districtLabel: 'जिल्हा', selectDistrict: 'जिल्हा निवडा', selectStateFirst: 'प्रथम राज्य निवडा' },
  'भोजपुरी': { stateLabel: 'राज्य / केंद्र शासित प्रदेश', selectState: 'राज्य / केंद्र शासित प्रदेश चुनीं', districtLabel: 'जिला', selectDistrict: 'जिला चुनीं', selectStateFirst: 'पहिले राज्य चुनीं' },
  'தமிழ்': { stateLabel: 'மாநிலம் / யூனியன் பிரதேசம்', selectState: 'மாநிலம் / யூனியன் பிரதேசத்தைத் தேர்ந்தெடுக்கவும்', districtLabel: 'மாவட்டம்', selectDistrict: 'மாவட்டத்தைத் தேர்ந்தெடுக்கவும்', selectStateFirst: 'முதலில் மாநிலத்தைத் தேர்ந்தெடுக்கவும்' },
  'తెలుగు': { stateLabel: 'రాష్ట్రం / కేంద్రపాలిత ప్రాంతం', selectState: 'రాష్ట్రం / కేంద్రపాలిత ప్రాంతాన్ని ఎంచుకోండి', districtLabel: 'జిల్లా', selectDistrict: 'జిల్లాను ఎంచుకోండి', selectStateFirst: 'ముందుగా రాష్ట్రాన్ని ఎంచుకోండి' },
  'മലയാളം': { stateLabel: 'സംസ്ഥാനം / കേന്ദ്രഭരണ പ്രദേശം', selectState: 'സംസ്ഥാനം / കേന്ദ്രഭരണ പ്രദേശം തിരഞ്ഞെടുക്കുക', districtLabel: 'ജില്ല', selectDistrict: 'ജില്ല തിരഞ്ഞെടുക്കുക', selectStateFirst: 'ആദ്യം ഒരു സംസ്ഥാനം തിരഞ്ഞെടുക്കുക' },
  'ગુજરાતી': { stateLabel: 'રાજ્ય / કેન્દ્રશાસિત પ્રદેશ', selectState: 'રાજ્ય / કેન્દ્રશાસિત પ્રદેશ પસંદ કરો', districtLabel: 'જિલ્લો', selectDistrict: 'જિલ્લો પસંદ કરો', selectStateFirst: 'પહેલા રાજ્ય પસંદ કરો' },
  'ଓଡ଼ିଆ': { stateLabel: 'ରାଜ୍ୟ / କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ', selectState: 'ରାଜ୍ୟ / କେନ୍ଦ୍ରଶାସିତ ଅଞ୍ଚଳ ବାଛନ୍ତୁ', districtLabel: 'ଜିଲ୍ଲା', selectDistrict: 'ଜିଲ୍ଲା ବାଛନ୍ତୁ', selectStateFirst: 'ପ୍ରଥମେ ଗୋଟିଏ ରାଜ୍ୟ ବାଛନ୍ତୁ' },
  'বাংলা': { stateLabel: 'রাজ্য / কেন্দ্রশাসিত অঞ্চল', selectState: 'রাজ্য / কেন্দ্রশাসিত অঞ্চল নির্বাচন করুন', districtLabel: 'জেলা', selectDistrict: 'জেলা নির্বাচন করুন', selectStateFirst: 'প্রথমে একটি রাজ্য নির্বাচন করুন' },
};

export default function StateDistrictSelect({ onChange, language = 'English' }) {
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');

  const t = selectTranslations[language] ?? selectTranslations.English;
  const districts = state ? indiaStatesDistricts[state] : [];

  function handleStateChange(e) {
    const newState = e.target.value;
    setState(newState);
    setDistrict(''); // reset district whenever the state changes
    onChange?.({ state: newState, district: '' });
  }

  function handleDistrictChange(e) {
    const newDistrict = e.target.value;
    setDistrict(newDistrict);
    onChange?.({ state, district: newDistrict });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="state-select">
          {t.stateLabel}
        </label>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900"
          id="state-select"
          onChange={handleStateChange}
          value={state}
        >
          <option value="">{t.selectState}</option>
          {indiaStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="district-select">
          {t.districtLabel}
        </label>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-navy-900/20 focus:border-navy-900 disabled:bg-slate-100 disabled:text-slate-400"
          disabled={!state}
          id="district-select"
          onChange={handleDistrictChange}
          value={district}
        >
          <option value="">{state ? t.selectDistrict : t.selectStateFirst}</option>
          {districts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}