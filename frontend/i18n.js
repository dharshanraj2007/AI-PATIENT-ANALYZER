/**
 * MedTriage AI — Internationalization (i18n) Module
 * ===================================================
 * Supports: English (en), Tamil (ta), Hindi (hi), Telugu (te), Malayalam (ml)
 */

const TRANSLATIONS = {
    // ─── SIDEBAR / NAVIGATION ─────────────────────────
    "nav.dashboard": {
        en: "Dashboard", ta: "டாஷ்போர்டு", hi: "डैशबोर्ड", te: "డాష్‌బోర్డ్", ml: "ഡാഷ്‌ബോർഡ്"
    },
    "nav.assessment": {
        en: "Patient Assessment", ta: "நோயாளி மதிப்பீடு", hi: "रोगी मूल्यांकन", te: "రోగి అంచనా", ml: "രോഗി വിലയിരുത്തൽ"
    },
    "nav.analytics": {
        en: "Analytics", ta: "பகுப்பாய்வு", hi: "विश्लेषिकी", te: "విశ్లేషణలు", ml: "വിശകലനം"
    },
    "nav.history": {
        en: "History", ta: "வரலாறு", hi: "इतिहास", te: "చరిత్ర", ml: "ചരിത്രം"
    },
    "nav.queue": {
        en: "Queue Management", ta: "வரிசை மேலாண்மை", hi: "कतार प्रबंधन", te: "క్యూ నిర్వహణ", ml: "ക്യൂ മാനേജ്‌മെന്റ്"
    },
    "sidebar.aiActive": {
        en: "AI Model Active", ta: "AI மாதிரி செயலில்", hi: "AI मॉडल सक्रिय", te: "AI మోడల్ యాక్టివ్", ml: "AI മോഡൽ സജീവം"
    },

    // ─── DASHBOARD ────────────────────────────────────
    "dash.title": {
        en: "Dashboard Overview", ta: "டாஷ்போர்டு கண்ணோட்டம்", hi: "डैशबोर्ड अवलोकन", te: "డాష్‌బోర్డ్ అవలోకనం", ml: "ഡാഷ്‌ബോർഡ് അവലോകനം"
    },
    "dash.subtitle": {
        en: "Real-time medical triage insights and statistics", ta: "நிகழ்நேர மருத்துவ டிரையேஜ் நுண்ணறிவுகள் மற்றும் புள்ளிவிவரங்கள்", hi: "रीयल-टाइम चिकित्सा ट्राइएज अंतर्दृष्टि और सांख्यिकी", te: "రియల్-టైమ్ వైద్య ట్రయాజ్ అంతర్దృష్టులు మరియు గణాంకాలు", ml: "തത്സമയ മെഡിക്കൽ ട്രയാജ് ഉൾക്കാഴ്ചകളും സ്ഥിതിവിവരക്കണക്കുകളും"
    },
    "dash.totalRecords": {
        en: "Total Records", ta: "மொத்த பதிவுகள்", hi: "कुल रिकॉर्ड", te: "మొత్తం రికార్డులు", ml: "മൊത്തം രേഖകൾ"
    },
    "dash.lowRisk": {
        en: "Low Risk", ta: "குறைந்த ஆபத்து", hi: "कम जोखिम", te: "తక్కువ ప్రమాదం", ml: "കുറഞ്ഞ അപകടസാധ്യത"
    },
    "dash.mediumRisk": {
        en: "Medium Risk", ta: "நடுத்தர ஆபத்து", hi: "मध्यम जोखिम", te: "మధ్యస్థ ప్రమాదం", ml: "ഇടത്തരം അപകടസാധ്യത"
    },
    "dash.highRisk": {
        en: "High Risk", ta: "அதிக ஆபத்து", hi: "उच्च जोखिम", te: "అధిక ప్రమాదం", ml: "ഉയർന്ന അപകടസാധ്യത"
    },
    "dash.riskDistribution": {
        en: "Risk Distribution", ta: "ஆபத்து பரவல்", hi: "जोखिम वितरण", te: "ప్రమాద పంపిణీ", ml: "അപകടസാധ്യതാ വിതരണം"
    },
    "dash.arrivalMode": {
        en: "Arrival Mode Distribution", ta: "வருகை முறை பரவல்", hi: "आगमन मोड वितरण", te: "రాక విధానం పంపిణీ", ml: "വരവ് രീതി വിതരണം"
    },
    "dash.featureImportance": {
        en: "Feature Importance", ta: "அம்ச முக்கியத்துவம்", hi: "फ़ीचर महत्त्व", te: "ఫీచర్ ప్రాముఖ్యత", ml: "ഫീച്ചർ പ്രാധാന്യം"
    },
    "dash.vitalsOverview": {
        en: "Dataset Vitals Overview", ta: "தரவுத்தொகுப்பு உயிர்நிலை கண்ணோட்டம்", hi: "डेटासेट महत्वपूर्ण संकेत अवलोकन", te: "డేటాసెట్ వైటల్స్ అవలోకనం", ml: "ഡേറ്റാസെറ്റ് വൈറ്റൽസ് അവലോകനം"
    },

    // ─── PATIENT ASSESSMENT ───────────────────────────
    "assess.title": {
        en: "Patient Assessment", ta: "நோயாளி மதிப்பீடு", hi: "रोगी मूल्यांकन", te: "రోగి అంచనా", ml: "രോഗി വിലയിരുത്തൽ"
    },
    "assess.subtitle": {
        en: "Enter patient data for AI-powered risk classification", ta: "AI-இயங்கும் ஆபத்து வகைப்பாடுக்கான நோயாளி தரவை உள்ளிடவும்", hi: "AI-संचालित जोखिम वर्गीकरण के लिए रोगी डेटा दर्ज करें", te: "AI-ఆధారిత ప్రమాద వర్గీకరణ కోసం రోగి డేటాను నమోదు చేయండి", ml: "AI അധിഷ്ഠിത റിസ്ക് വർഗ്ഗീകരണത്തിനായി രോഗി ഡാറ്റ നൽകുക"
    },
    "assess.patientInfo": {
        en: "Patient Information", ta: "நோயாளி தகவல்", hi: "रोगी जानकारी", te: "రోగి సమాచారం", ml: "രോഗി വിവരങ്ങൾ"
    },
    "assess.formSubtitle": {
        en: "Fill in patient details for AI-powered triage", ta: "AI-இயங்கும் டிரையேஜுக்கான நோயாளி விவரங்களை நிரப்பவும்", hi: "AI-संचालित ट्राइएज के लिए रोगी विवरण भरें", te: "AI-ఆధారిత ట్రయాజ్ కోసం రోగి వివరాలను నమోదు చేయండి", ml: "AI അധിഷ്ഠിത ട്രയാജിനായി രോഗി വിശദാംശങ്ങൾ പൂരിപ്പിക്കുക"
    },
    "assess.uploadEhr": {
        en: "Upload EHR/EMR", ta: "EHR/EMR பதிவேற்றம்", hi: "EHR/EMR अपलोड करें", te: "EHR/EMR అప్‌లోడ్", ml: "EHR/EMR അപ്‌ലോഡ്"
    },
    "assess.loadSample": {
        en: "Load Sample", ta: "மாதிரி ஏற்றுக", hi: "नमूना लोड करें", te: "నమూనా లోడ్", ml: "സാമ്പിൾ ലോഡ് ചെയ്യുക"
    },
    "assess.personalDetails": {
        en: "Personal Details", ta: "தனிப்பட்ட விவரங்கள்", hi: "व्यक्तिगत विवरण", te: "వ్యక్తిగత వివరాలు", ml: "വ്യക്തിഗത വിശദാംശങ്ങൾ"
    },
    "assess.patientName": {
        en: "Patient Name", ta: "நோயாளி பெயர்", hi: "रोगी का नाम", te: "రోగి పేరు", ml: "രോഗിയുടെ പേര്"
    },
    "assess.mobileNumber": {
        en: "Mobile Number", ta: "கைபேசி எண்", hi: "मोबाइल नंबर", te: "మొబైల్ నంబర్", ml: "മൊബൈൽ നമ്പർ"
    },
    "assess.age": {
        en: "Age (years)", ta: "வயது (ஆண்டுகள்)", hi: "आयु (वर्ष)", te: "వయస్సు (సంవత్సరాలు)", ml: "പ്രായം (വർഷം)"
    },
    "assess.gender": {
        en: "Gender", ta: "பாலினம்", hi: "लिंग", te: "లింగం", ml: "ലിംഗം"
    },
    "assess.selectGender": {
        en: "Select Gender", ta: "பாலினத்தைத் தேர்ந்தெடுக்கவும்", hi: "लिंग चुनें", te: "లింగం ఎంచుకోండి", ml: "ലിംഗം തിരഞ്ഞെടുക്കുക"
    },
    "assess.male": {
        en: "Male", ta: "ஆண்", hi: "पुरुष", te: "పురుషుడు", ml: "പുരുഷൻ"
    },
    "assess.female": {
        en: "Female", ta: "பெண்", hi: "महिला", te: "స్త్రీ", ml: "സ്ത്രീ"
    },
    "assess.other": {
        en: "Other", ta: "மற்றவை", hi: "अन्य", te: "ఇతర", ml: "മറ്റുള്ളവ"
    },
    "assess.vitalSigns": {
        en: "Vital Signs", ta: "உயிர்நிலை அறிகுறிகள்", hi: "महत्वपूर्ण संकेत", te: "వైటల్ సైన్స్", ml: "സുപ്രധാന ലക്ഷണങ്ങൾ"
    },
    "assess.critical": {
        en: "Critical", ta: "முக்கியமான", hi: "गंभीर", te: "క్లిష్టమైన", ml: "ഗുരുതരം"
    },
    "assess.heartRate": {
        en: "Heart Rate", ta: "இதய துடிப்பு", hi: "हृदय गति", te: "హృదయ స్పందన రేటు", ml: "ഹൃദയമിടിപ്പ്"
    },
    "assess.systolicBP": {
        en: "Systolic BP", ta: "சிஸ்டோலிக் BP", hi: "सिस्टोलिक BP", te: "సిస్టోలిక్ BP", ml: "സിസ്റ്റോളിക് BP"
    },
    "assess.o2Saturation": {
        en: "O2 Saturation", ta: "O2 செறிவு", hi: "O2 संतृप्ति", te: "O2 సంతృప్తత", ml: "O2 സാച്ചുറേഷൻ"
    },
    "assess.temperature": {
        en: "Temperature", ta: "வெப்பநிலை", hi: "तापमान", te: "ఉష్ణోగ్రత", ml: "താപനില"
    },
    "assess.clinicalAssessment": {
        en: "Clinical Assessment", ta: "மருத்துவ மதிப்பீடு", hi: "नैदानिक मूल्यांकन", te: "క్లినికల్ అంచనా", ml: "ക്ലിനിക്കൽ വിലയിരുത്തൽ"
    },
    "assess.painLevel": {
        en: "Pain Level", ta: "வலி நிலை", hi: "दर्द स्तर", te: "నొప్పి స్థాయి", ml: "വേദന നില"
    },
    "assess.mild": {
        en: "1 - Mild", ta: "1 - மிதமான", hi: "1 - हल्का", te: "1 - తేలికపాటి", ml: "1 - നേരിയ"
    },
    "assess.severe": {
        en: "10 - Severe", ta: "10 - கடுமையான", hi: "10 - गंभीर", te: "10 - తీవ్రమైన", ml: "10 - കഠിനം"
    },
    "assess.chronicDiseases": {
        en: "Chronic Diseases", ta: "நாட்பட்ட நோய்கள்", hi: "पुरानी बीमारियाँ", te: "దీర్ఘకాలిక వ్యాధులు", ml: "വിട്ടുമാറാത്ത രോഗങ്ങൾ"
    },
    "assess.previousER": {
        en: "Previous ER Visits", ta: "முந்தைய அவசர வருகைகள்", hi: "पिछली ER यात्राएँ", te: "మునుపటి ER సందర్శనలు", ml: "മുൻ ER സന്ദർശനങ്ങൾ"
    },
    "assess.arrivalMode": {
        en: "Arrival Mode", ta: "வருகை முறை", hi: "आगमन मोड", te: "రాక విధానం", ml: "വരവ് രീതി"
    },
    "assess.walkIn": {
        en: "Walk-in", ta: "நடந்து வந்தவர்", hi: "पैदल आगमन", te: "నడచి వచ్చినవారు", ml: "നടന്നുവന്നു"
    },
    "assess.wheelchair": {
        en: "Wheelchair", ta: "சக்கர நாற்காலி", hi: "व्हीलचेयर", te: "వీల్‌చైర్", ml: "വീൽചെയർ"
    },
    "assess.ambulance": {
        en: "Ambulance", ta: "ஆம்புலன்ஸ்", hi: "एम्बुलेंस", te: "అంబులెన్స్", ml: "ആംബുലൻസ്"
    },
    "assess.additionalNotes": {
        en: "Additional Notes", ta: "கூடுதல் குறிப்புகள்", hi: "अतिरिक्त नोट्स", te: "అదనపు గమనికలు", ml: "അധിക കുറിപ്പുകൾ"
    },
    "assess.symptomsNotes": {
        en: "Symptoms / Notes", ta: "அறிகுறிகள் / குறிப்புகள்", hi: "लक्षण / नोट्स", te: "లక్షణాలు / గమనికలు", ml: "ലക്ഷണങ്ങൾ / കുറിപ്പുകൾ"
    },
    "assess.symptomsPlaceholder": {
        en: "Describe symptoms, observations, or any relevant clinical notes...", ta: "அறிகுறிகள், கவனிப்புகள் அல்லது தொடர்புடைய மருத்துவ குறிப்புகளை விவரிக்கவும்...", hi: "लक्षण, अवलोकन, या कोई प्रासंगिक नैदानिक नोट्स का वर्णन करें...", te: "లక్షణాలు, పరిశీలనలు లేదా సంబంధిత క్లినికల్ నోట్లను వివరించండి...", ml: "ലക്ഷണങ്ങൾ, നിരീക്ഷണങ്ങൾ, അല്ലെങ്കിൽ ഏതെങ്കിലും പ്രസക്തമായ ക്ലിനിക്കൽ കുറിപ്പുകൾ വിവരിക്കുക..."
    },
    "assess.securityNote": {
        en: "All data is processed securely and never stored externally", ta: "அனைத்து தரவும் பாதுகாப்பாக செயலாக்கப்பட்டு வெளிப்புறத்தில் சேமிக்கப்படுவதில்லை", hi: "सभी डेटा सुरक्षित रूप से संसाधित होता है और बाहरी रूप से संग्रहीत नहीं होता", te: "మొత్తం డేటా సురక్షితంగా ప్రాసెస్ చేయబడుతుంది మరియు బాహ్యంగా నిల్వ చేయబడదు", ml: "എല്ലാ ഡാറ്റയും സുരക്ഷിതമായി പ്രോസസ്സ് ചെയ്യുകയും ബാഹ്യമായി സൂക്ഷിക്കുകയും ചെയ്യില്ല"
    },
    "assess.resetForm": {
        en: "Reset Form", ta: "படிவம் மீட்டமை", hi: "फ़ॉर्म रीसेट करें", te: "ఫారం రీసెట్", ml: "ഫോം റീസെറ്റ്"
    },
    "assess.runAI": {
        en: "Run AI Assessment", ta: "AI மதிப்பீடு இயக்கு", hi: "AI मूल्यांकन चलाएँ", te: "AI అంచనా అమలు", ml: "AI വിലയിരുത്തൽ നടത്തുക"
    },
    "assess.runAISub": {
        en: "Analyze vitals & generate triage", ta: "உயிர்நிலைகளை பகுப்பாய்வு செய்து டிரையேஜ் உருவாக்கு", hi: "महत्वपूर्ण संकेतों का विश्लेषण करें और ट्राइएज बनाएं", te: "వైటల్స్ విశ్లేషించి ట్రయాజ్ రూపొందించు", ml: "വൈറ്റലുകൾ വിശകലനം ചെയ്ത് ട്രയാജ് സൃഷ്ടിക്കുക"
    },

    // ─── RESULTS PANEL ────────────────────────────────
    "results.aiReady": {
        en: "AI Engine Ready", ta: "AI இயந்திரம் தயார்", hi: "AI इंजन तैयार", te: "AI ఇంజిన్ సిద్ధం", ml: "AI എഞ്ചിൻ തയ്യാർ"
    },
    "results.awaitingData": {
        en: "Awaiting Patient Data", ta: "நோயாளி தரவுக்காக காத்திருக்கிறது", hi: "रोगी डेटा की प्रतीक्षा", te: "రోగి డేటా కోసం వేచి ఉంది", ml: "രോഗി ഡാറ്റയ്ക്കായി കാത്തിരിക്കുന്നു"
    },
    "results.subtitle": {
        en: "Complete the assessment form to trigger the AI-powered triage pipeline", ta: "AI-இயங்கும் டிரையேஜ் பைப்லைனைத் தூண்ட மதிப்பீட்டு படிவத்தை நிரப்பவும்", hi: "AI-संचालित ट्राइएज पाइपलाइन शुरू करने के लिए मूल्यांकन फ़ॉर्म भरें", te: "AI-ఆధారిత ట్రయాజ్ పైప్‌లైన్ ప్రారంభించడానికి అంచనా ఫారం పూర్తి చేయండి", ml: "AI അധിഷ്ഠിത ട്രയാജ് പൈപ്പ്‌ലൈൻ ആരംഭിക്കാൻ വിലയിരുത്തൽ ഫോം പൂർത്തിയാക്കുക"
    },
    "results.pipeline": {
        en: "Assessment Pipeline", ta: "மதிப்பீட்டு பைப்லைன்", hi: "मूल्यांकन पाइपलाइन", te: "అంచనా పైప్‌లైన్", ml: "വിലയിരുത്തൽ പൈപ്പ്‌ലൈൻ"
    },
    "results.complete": {
        en: "Complete", ta: "முடிந்தது", hi: "पूर्ण", te: "పూర్తయింది", ml: "പൂർത്തിയായി"
    },
    "results.dataCollection": {
        en: "Data Collection", ta: "தரவு சேகரிப்பு", hi: "डेटा संग्रहण", te: "డేటా సేకరణ", ml: "ഡാറ്റ ശേഖരണം"
    },
    "results.dataCollectionDesc": {
        en: "Vitals, demographics & history", ta: "உயிர்நிலை, மக்கள்தொகை மற்றும் வரலாறு", hi: "महत्वपूर्ण संकेत, जनसांख्यिकी और इतिहास", te: "వైటల్స్, జనాభా మరియు చరిత్ర", ml: "വൈറ്റലുകൾ, ജനസംഖ്യാ വിവരങ്ങൾ & ചരിത്രം"
    },
    "results.mlInference": {
        en: "ML Inference", ta: "ML அனுமானம்", hi: "ML अनुमान", te: "ML అనుమానం", ml: "ML അനുമാനം"
    },
    "results.mlInferenceDesc": {
        en: "Model scoring & confidence", ta: "மாதிரி மதிப்பெண் மற்றும் நம்பகத்தன்மை", hi: "मॉडल स्कोरिंग और आत्मविश्वास", te: "మోడల్ స్కోరింగ్ & విశ్వసనీయత", ml: "മോഡൽ സ്‌കോറിംഗ് & ആത്മവിശ്വാസം"
    },
    "results.resultsInsights": {
        en: "Results & Insights", ta: "முடிவுகள் மற்றும் நுண்ணறிவுகள்", hi: "परिणाम और अंतर्दृष्टि", te: "ఫలితాలు & అంతర్దృష్టులు", ml: "ഫലങ്ങൾ & ഉൾക്കാഴ്ചകൾ"
    },
    "results.resultsInsightsDesc": {
        en: "Risk class, dept & explainability", ta: "ஆபத்து வகுப்பு, துறை மற்றும் விளக்கம்", hi: "जोखिम वर्ग, विभाग और व्याख्या", te: "ప్రమాద వర్గం, విభాగం & వివరణ", ml: "റിസ്ക് ക്ലാസ്, വിഭാഗം & വിശദീകരണം"
    },
    "results.pending": {
        en: "Pending", ta: "நிலுவையில்", hi: "लंबित", te: "పెండింగ్‌లో", ml: "തീർപ്പാക്കാത്തത്"
    },
    "results.riskClassification": {
        en: "Risk Classification", ta: "ஆபத்து வகைப்பாடு", hi: "जोखिम वर्गीकरण", te: "ప్రమాద వర్గీకరణ", ml: "അപകടസാധ്യതാ വർഗ്ഗീകരണം"
    },
    "results.riskDesc": {
        en: "3-tier severity scoring", ta: "3-நிலை தீவிரம் மதிப்பீடு", hi: "3-स्तरीय गंभीरता स्कोरिंग", te: "3-అంచెల తీవ్రత స్కోరింగ్", ml: "3-തട്ട് തീവ്രതാ സ്‌കോറിംഗ്"
    },
    "results.deptRouting": {
        en: "Dept. Routing", ta: "துறை வழிசெலுத்தல்", hi: "विभाग रूटिंग", te: "విభాగ మార్గం", ml: "വിഭാഗ റൂട്ടിംഗ്"
    },
    "results.deptRoutingDesc": {
        en: "Smart ward assignment", ta: "ஸ்மார்ட் வார்டு ஒதுக்கீடு", hi: "स्मार्ट वार्ड असाइनमेंट", te: "స్మార్ట్ వార్డ్ కేటాయింపు", ml: "സ്മാർട്ട് വാർഡ് നിയമനം"
    },
    "results.explainability": {
        en: "Explainability", ta: "விளக்கத்தன்மை", hi: "व्याख्यात्मकता", te: "వివరణాత్మకత", ml: "വിശദീകരണക്ഷമത"
    },
    "results.explainabilityDesc": {
        en: "Feature importance map", ta: "அம்ச முக்கியத்துவ வரைபடம்", hi: "फ़ीचर महत्व मानचित्र", te: "ఫీచర్ ప్రాముఖ్యత మ్యాప్", ml: "ഫീച്ചർ പ്രാധാന്യ മാപ്പ്"
    },
    "results.proTip": {
        en: "Pro tip: Upload an EHR/EMR PDF to auto-populate all fields instantly", ta: "சிறப்பு உதவிக்குறிப்பு: அனைத்து புலங்களையும் உடனடியாக தானாக நிரப்ப EHR/EMR PDF-ஐ பதிவேற்றவும்", hi: "प्रो टिप: सभी फ़ील्ड तुरंत ऑटो-भरने के लिए EHR/EMR PDF अपलोड करें", te: "ప్రో చిట్కా: అన్ని ఫీల్డ్‌లను వెంటనే ఆటో-ఫిల్ చేయడానికి EHR/EMR PDF అప్‌లోడ్ చేయండి", ml: "പ്രോ ടിപ്പ്: എല്ലാ ഫീൽഡുകളും തൽക്ഷണം ഓട്ടോ-ഫിൽ ചെയ്യാൻ EHR/EMR PDF അപ്‌ലോഡ് ചെയ്യുക"
    },
    "results.riskLevel": {
        en: "Risk Level", ta: "ஆபத்து நிலை", hi: "जोखिम स्तर", te: "ప్రమాద స్థాయి", ml: "അപകടസാധ്യതാ നില"
    },
    "results.deptRecommendation": {
        en: "Department Recommendation", ta: "துறை பரிந்துரை", hi: "विभाग अनुशंसा", te: "విభాగ సిఫార్సు", ml: "വിഭാഗ ശുപാർശ"
    },
    "results.contributingFactors": {
        en: "Contributing Factors", ta: "பங்களிக்கும் காரணிகள்", hi: "योगदान करने वाले कारक", te: "దోహదపడే కారకాలు", ml: "സംഭാവന ചെയ്യുന്ന ഘടകങ്ങൾ"
    },
    "results.contributingDesc": {
        en: "Key factors influencing the risk classification", ta: "ஆபத்து வகைப்பாட்டை பாதிக்கும் முக்கிய காரணிகள்", hi: "जोखिम वर्गीकरण को प्रभावित करने वाले प्रमुख कारक", te: "ప్రమాద వర్గీకరణను ప్రభావితం చేసే ముఖ్య కారకాలు", ml: "അപകടസാധ്യതാ വർഗ്ഗീകരണത്തെ സ്വാധീനിക്കുന്ന പ്രധാന ഘടകങ്ങൾ"
    },

    // ─── ANALYTICS ─────────────────────────────────────
    "analytics.title": {
        en: "Analytics & Insights", ta: "பகுப்பாய்வு & நுண்ணறிவுகள்", hi: "विश्लेषिकी और अंतर्दृष्टि", te: "విశ్లేషణలు & అంతర్దృష్టులు", ml: "വിശകലനം & ഉൾക്കാഴ്ചകൾ"
    },
    "analytics.subtitle": {
        en: "Deep dive into dataset patterns and model performance", ta: "தரவுத்தொகுப்பு வடிவங்கள் மற்றும் மாதிரி செயல்திறனில் ஆழ்ந்த ஆய்வு", hi: "डेटासेट पैटर्न और मॉडल प्रदर्शन में गहन अध्ययन", te: "డేటాసెట్ నమూనాలు మరియు మోడల్ పనితీరులో లోతైన అధ్యయనం", ml: "ഡേറ്റാസെറ്റ് പാറ്റേണുകളിലേക്കും മോഡൽ പ്രകടനത്തിലേക്കും ആഴത്തിലുള്ള പഠനം"
    },
    "analytics.ehrTitle": {
        en: "EHR Extracted Summary", ta: "EHR பிரித்தெடுக்கப்பட்ட சுருக்கம்", hi: "EHR निकाला गया सारांश", te: "EHR సంగ్రహం", ml: "EHR എക്സ്ട്രാക്റ്റ് ചെയ്ത സംഗ്രഹം"
    },
    "analytics.ehrSubtitle": {
        en: "AI-powered extraction from uploaded medical records", ta: "பதிவேற்றிய மருத்துவ பதிவுகளிலிருந்து AI-இயங்கும் பிரித்தெடுப்பு", hi: "अपलोड किए गए मेडिकल रिकॉर्ड से AI-संचालित निष्कर्षण", te: "అప్‌లోడ్ చేసిన వైద్య రికార్డుల నుండి AI-ఆధారిత సంగ్రహణ", ml: "അപ്‌ലോഡ് ചെയ്ത മെഡിക്കൽ രേഖകളിൽ നിന്ന് AI അധിഷ്ഠിത എക്സ്ട്രാക്ഷൻ"
    },
    "analytics.awaitingUpload": {
        en: "Awaiting Upload", ta: "பதிவேற்றத்திற்காக காத்திருக்கிறது", hi: "अपलोड की प्रतीक्षा", te: "అప్‌లోడ్ కోసం వేచి ఉంది", ml: "അപ്‌ലോഡിനായി കാത്തിരിക്കുന്നു"
    },
    "analytics.noRecord": {
        en: "No Medical Record Uploaded", ta: "மருத்துவ பதிவு பதிவேற்றப்படவில்லை", hi: "कोई मेडिकल रिकॉर्ड अपलोड नहीं किया गया", te: "వైద్య రికార్డ్ అప్‌లోడ్ చేయబడలేదు", ml: "മെഡിക്കൽ രേഖ അപ്‌ലോഡ് ചെയ്തിട്ടില്ല"
    },
    "analytics.uploadDesc": {
        en: "Upload an EHR/EMR PDF in the <strong>Patient Assessment</strong> section to auto-extract clinical data using our AI pipeline.", ta: "<strong>நோயாளி மதிப்பீடு</strong> பிரிவில் EHR/EMR PDF-ஐ பதிவேற்றி எங்கள் AI பைப்லைனைப் பயன்படுத்தி மருத்துவ தரவை தானாக பிரித்தெடுக்கவும்.", hi: "<strong>रोगी मूल्यांकन</strong> अनुभाग में EHR/EMR PDF अपलोड करें ताकि हमारी AI पाइपलाइन का उपयोग करके नैदानिक डेटा ऑटो-एक्सट्रैक्ट किया जा सके।", te: "మా AI పైప్‌లైన్ ఉపయోగించి క్లినికల్ డేటాను ఆటో-ఎక్స్‌ట్రాక్ట్ చేయడానికి <strong>రోగి అంచనా</strong> విభాగంలో EHR/EMR PDF అప్‌లోడ్ చేయండి.", ml: "ഞങ്ങളുടെ AI പൈപ്പ്‌ലൈൻ ഉപയോഗിച്ച് ക്ലിനിക്കൽ ഡാറ്റ ഓട്ടോ-എക്സ്ട്രാക്ട് ചെയ്യാൻ <strong>രോഗി വിലയിരുത്തൽ</strong> വിഭാഗത്തിൽ EHR/EMR PDF അപ്‌ലോഡ് ചെയ്യുക."
    },
    "analytics.demographics": {
        en: "Demographics", ta: "மக்கள்தொகை", hi: "जनसांख्यिकी", te: "జనాభా", ml: "ജനസംഖ്യാ വിവരങ്ങൾ"
    },
    "analytics.diagnosis": {
        en: "Diagnosis", ta: "நோய் கண்டறிதல்", hi: "निदान", te: "రోగ నిర్ధారణ", ml: "രോഗനിർണയം"
    },
    "analytics.allergies": {
        en: "Allergies", ta: "ஒவ்வாமைகள்", hi: "एलर्जी", te: "అలెర్జీలు", ml: "അലർജികൾ"
    },
    "analytics.queueTitle": {
        en: "Queue Insights & Analytics", ta: "வரிசை நுண்ணறிவுகள் & பகுப்பாய்வு", hi: "कतार अंतर्दृष्टि और विश्लेषिकी", te: "క్యూ అంతర్దృష్టులు & విశ్లేషణలు", ml: "ക്യൂ ഉൾക്കാഴ്ചകൾ & വിശകലനം"
    },
    "analytics.queueSubtitle": {
        en: "Real-time patient queue monitoring and department analytics", ta: "நிகழ்நேர நோயாளி வரிசை கண்காணிப்பு மற்றும் துறை பகுப்பாய்வு", hi: "रीयल-टाइम रोगी कतार निगरानी और विभाग विश्लेषिकी", te: "రియల్-టైమ్ రోగి క్యూ మానిటరింగ్ మరియు విభాగ విశ్లేషణలు", ml: "തത്സമയ രോഗി ക്യൂ മോണിറ്ററിംഗും വിഭാഗ വിശകലനവും"
    },
    "analytics.queueSize": {
        en: "Queue Size", ta: "வரிசை அளவு", hi: "कतार आकार", te: "క్యూ పరిమాణం", ml: "ക്യൂ വലിപ്പം"
    },
    "analytics.avgWait": {
        en: "Avg Wait Time", ta: "சராசரி காத்திருப்பு நேரம்", hi: "औसत प्रतीक्षा समय", te: "సగటు వేచి ఉండే సమయం", ml: "ശരാശരി കാത്തിരിപ്പ് സമയം"
    },
    "analytics.throughput": {
        en: "Throughput/hr", ta: "செயலாக்கம்/மணி", hi: "थ्रूपुट/घंटा", te: "థ్రూపుట్/గంట", ml: "ത്രൂപുട്ട്/മണിക്കൂർ"
    },
    "analytics.peakHour": {
        en: "Peak Hour", ta: "உச்ச நேரம்", hi: "पीक घंटा", te: "పీక్ అవర్", ml: "തിരക്ക് സമയം"
    },
    "analytics.deptLoad": {
        en: "Department Load", ta: "துறை சுமை", hi: "विभाग भार", te: "విభాగ భారం", ml: "വിഭാഗ ഭാരം"
    },
    "analytics.waitBreakdown": {
        en: "Wait Time Breakdown", ta: "காத்திருப்பு நேர பிரிவு", hi: "प्रतीक्षा समय विश्लेषण", te: "వేచి ఉండే సమయ విభజన", ml: "കാത്തിരിപ്പ് സമയ വിശകലനം"
    },
    "analytics.queueFooter": {
        en: "Queue data refreshes automatically. Priority scoring uses the Dynamic Weighted Priority Scheduling algorithm.", ta: "வரிசை தரவு தானாகவே புதுப்பிக்கப்படுகிறது. முன்னுரிமை மதிப்பீடு டைனமிக் எடையுள்ள முன்னுரிமை திட்டமிடல் அல்காரிதத்தைப் பயன்படுத்துகிறது.", hi: "कतार डेटा स्वचालित रूप से रीफ्रेश होता है। प्राथमिकता स्कोरिंग डायनामिक वेटेड प्रायोरिटी शेड्यूलिंग एल्गोरिथम का उपयोग करती है।", te: "క్యూ డేటా ఆటోమేటిక్‌గా రిఫ్రెష్ అవుతుంది. ప్రాధాన్యత స్కోరింగ్ డైనమిక్ వెయిటెడ్ ప్రయారిటీ షెడ్యూలింగ్ అల్గారిథమ్‌ను ఉపయోగిస్తుంది.", ml: "ക്യൂ ഡാറ്റ സ്വയമേവ പുതുക്കപ്പെടുന്നു. മുൻഗണനാ സ്‌കോറിംഗ് ഡൈനാമിക് വെയ്റ്റഡ് പ്രയോറിറ്റി ഷെഡ്യൂളിംഗ് അൽഗോരിതം ഉപയോഗിക്കുന്നു."
    },

    // ─── HISTORY ───────────────────────────────────────
    "history.title": {
        en: "Assessment History", ta: "மதிப்பீட்டு வரலாறு", hi: "मूल्यांकन इतिहास", te: "అంచనా చరిత్ర", ml: "വിലയിരുത്തൽ ചരിത്രം"
    },
    "history.subtitle": {
        en: "Previous patient assessments during this session", ta: "இந்த அமர்வின் போது முந்தைய நோயாளி மதிப்பீடுகள்", hi: "इस सत्र के दौरान पिछले रोगी मूल्यांकन", te: "ఈ సెషన్ సమయంలో మునుపటి రోగి అంచనాలు", ml: "ഈ സെഷനിലെ മുൻ രോഗി വിലയിരുത്തലുകൾ"
    },
    "history.clearHistory": {
        en: "Clear History", ta: "வரலாற்றை அழி", hi: "इतिहास साफ़ करें", te: "చరిత్ర తొలగించు", ml: "ചരിത്രം മായ്ക്കുക"
    },
    "history.noAssessments": {
        en: "No assessments yet. Go to Patient Assessment to start.", ta: "இதுவரை மதிப்பீடுகள் இல்லை. தொடங்க நோயாளி மதிப்பீட்டிற்குச் செல்லுங்கள்.", hi: "अभी तक कोई मूल्यांकन नहीं। शुरू करने के लिए रोगी मूल्यांकन पर जाएँ।", te: "ఇంకా అంచనాలు లేవు. ప్రారంభించడానికి రోగి అంచనాకు వెళ్ళండి.", ml: "ഇതുവരെ വിലയിരുത്തലുകൾ ഇല്ല. ആരംഭിക്കാൻ രോഗി വിലയിരുത്തലിലേക്ക് പോകുക."
    },
    "history.queueHistory": {
        en: "Queue History", ta: "வரிசை வரலாறு", hi: "कतार इतिहास", te: "క్యూ చరిత్ర", ml: "ക്യൂ ചരിത്രം"
    },
    "history.queueSubtitle": {
        en: "Session-only log of patients added to the queue", ta: "வரிசையில் சேர்க்கப்பட்ட நோயாளிகளின் அமர்வு-மட்டும் பதிவு", hi: "कतार में जोड़े गए रोगियों का केवल-सत्र लॉग", te: "క్యూలో జోడించబడిన రోగుల సెషన్-మాత్రమే లాగ్", ml: "ക്യൂവിൽ ചേർത്ത രോഗികളുടെ സെഷൻ-മാത്രം ലോഗ്"
    },
    "history.clearQueue": {
        en: "Clear Queue History", ta: "வரிசை வரலாற்றை அழி", hi: "कतार इतिहास साफ़ करें", te: "క్యూ చరిత్ర తొలగించు", ml: "ക്യൂ ചരിത്രം മായ്ക്കുക"
    },
    "history.noQueue": {
        en: "No queue entries yet. Patients are logged here after assessment.", ta: "இதுவரை வரிசை பதிவுகள் இல்லை. மதிப்பீட்டிற்குப் பிறகு நோயாளிகள் இங்கே பதிவு செய்யப்படுகிறார்கள்.", hi: "अभी तक कोई कतार प्रविष्टियाँ नहीं। मूल्यांकन के बाद रोगियों को यहाँ दर्ज किया जाता है।", te: "ఇంకా క్యూ ఎంట్రీలు లేవు. అంచనా తర్వాత రోగులు ఇక్కడ నమోదు చేయబడతారు.", ml: "ഇതുവരെ ക്യൂ എൻട്രികൾ ഇല്ല. വിലയിരുത്തലിന് ശേഷം രോഗികൾ ഇവിടെ രേഖപ്പെടുത്തുന്നു."
    },

    // ─── QUEUE MANAGEMENT ──────────────────────────────
    "queue.title": {
        en: "Queue Management", ta: "வரிசை மேலாண்மை", hi: "कतार प्रबंधन", te: "క్యూ నిర్వహణ", ml: "ക്യൂ മാനേജ്‌മെന്റ്"
    },
    "queue.subtitle": {
        en: "Real-time hospital queue and patient flow optimization", ta: "நிகழ்நேர மருத்துவமனை வரிசை மற்றும் நோயாளி ஓட்டம் மேம்படுத்தல்", hi: "रीयल-टाइम अस्पताल कतार और रोगी प्रवाह अनुकूलन", te: "రియల్-టైమ్ ఆసుపత్రి క్యూ మరియు రోగి ప్రవాహ ఆప్టిమైజేషన్", ml: "തത്സമയ ആശുപത്രി ക്യൂ, രോഗി ഫ്ലോ ഒപ്റ്റിമൈസേഷൻ"
    },
    "queue.autoRefresh": {
        en: "Auto-Refresh", ta: "தானியங்கி புதுப்பிப்பு", hi: "ऑटो-रिफ्रेश", te: "ఆటో-రిఫ్రెష్", ml: "ഓട്ടോ-റിഫ്രഷ്"
    },
    "queue.refresh": {
        en: "Refresh", ta: "புதுப்பி", hi: "रिफ्रेश", te: "రిఫ్రెష్", ml: "റിഫ്രഷ്"
    },
    "queue.totalPatients": {
        en: "Total Patients", ta: "மொத்த நோயாளிகள்", hi: "कुल रोगी", te: "మొత్తం రోగులు", ml: "മൊത്തം രോഗികൾ"
    },
    "queue.avgWaitTime": {
        en: "Average Wait Time", ta: "சராசரி காத்திருப்பு நேரம்", hi: "औसत प्रतीक्षा समय", te: "సగటు వేచి ఉండే సమయం", ml: "ശരാശരി കാത്തിരിപ്പ് സമയം"
    },
    "queue.activeQueue": {
        en: "Active Patient Queue", ta: "செயலில் நோயாளி வரிசை", hi: "सक्रिय रोगी कतार", te: "యాక్టివ్ రోగి క్యూ", ml: "സജീവ രോഗി ക്യൂ"
    },
    "queue.all": {
        en: "All", ta: "அனைத்தும்", hi: "सभी", te: "అన్నీ", ml: "എല്ലാം"
    },
    "queue.emergency": {
        en: "Emergency", ta: "அவசரம்", hi: "आपातकालीन", te: "ఎమర్జెన్సీ", ml: "അടിയന്തരം"
    },
    "queue.cardiology": {
        en: "Cardiology", ta: "இதயவியல்", hi: "हृदय रोग", te: "కార్డియాలజీ", ml: "കാർഡിയോളജി"
    },
    "queue.pulmonary": {
        en: "Pulmonary", ta: "நுரையீரல்", hi: "फेफड़े", te: "పల్మనరీ", ml: "പൾമണറി"
    },
    "queue.internalMed": {
        en: "Internal Med", ta: "உள் மருத்துவம்", hi: "आंतरिक चिकित्सा", te: "ఇంటర్నల్ మెడ్", ml: "ഇന്റേണൽ മെഡ്"
    },
    "queue.queueCol": {
        en: "Queue", ta: "வரிசை", hi: "कतार", te: "క్యూ", ml: "ക്യൂ"
    },
    "queue.patientId": {
        en: "Patient ID", ta: "நோயாளி அடையாளம்", hi: "रोगी आईडी", te: "రోగి ID", ml: "രോഗി ID"
    },
    "queue.riskLevel": {
        en: "Risk Level", ta: "ஆபத்து நிலை", hi: "जोखिम स्तर", te: "ప్రమాద స్థాయి", ml: "അപകടസാധ്യതാ നില"
    },
    "queue.department": {
        en: "Department", ta: "துறை", hi: "विभाग", te: "విభాగం", ml: "വിഭാഗം"
    },
    "queue.waitTime": {
        en: "Wait Time", ta: "காத்திருப்பு நேரம்", hi: "प्रतीक्षा समय", te: "వేచి ఉండే సమయం", ml: "കാത്തിരിപ്പ് സമയം"
    },
    "queue.status": {
        en: "Status", ta: "நிலை", hi: "स्थिति", te: "స్థితి", ml: "നില"
    },
    "queue.refreshEvery": {
        en: "Refresh Every", ta: "ஒவ்வொன்றும் புதுப்பி", hi: "हर बार रिफ्रेश", te: "ప్రతిసారి రిఫ్రెష్", ml: "ഓരോന്നും റിഫ്രഷ്"
    },
    "queue.metrics": {
        en: "Queue Metrics", ta: "வரிசை அளவீடுகள்", hi: "कतार मेट्रिक्स", te: "క్యూ మెట్రిక్స్", ml: "ക്യൂ മെട്രിക്സ്"
    },
    "queue.highRiskPatients": {
        en: "High Risk Patients", ta: "அதிக ஆபத்து நோயாளிகள்", hi: "उच्च जोखिम रोगी", te: "అధిక ప్రమాద రోగులు", ml: "ഉയർന്ന അപകടസാധ്യതയുള്ള രോഗികൾ"
    },
    "queue.avgWaitByDept": {
        en: "Avg Wait by Department", ta: "துறை வாரியான சராசரி காத்திருப்பு", hi: "विभाग अनुसार औसत प्रतीक्षा", te: "విభాగం వారీ సగటు వేచి ఉండే సమయం", ml: "വിഭാഗം അനുസരിച്ച് ശരാശരി കാത്തിരിപ്പ്"
    },
    "queue.summary": {
        en: "Summary", ta: "சுருக்கம்", hi: "सारांश", te: "సారాంశం", ml: "സംഗ്രഹം"
    },
    "queue.selectPatient": {
        en: "Select a patient", ta: "நோயாளியைத் தேர்ந்தெடுக்கவும்", hi: "एक रोगी चुनें", te: "ఒక రోగిని ఎంచుకోండి", ml: "ഒരു രോഗിയെ തിരഞ്ഞെടുക്കുക"
    },
    "queue.waitForecast": {
        en: "Wait Time Forecast", ta: "காத்திருப்பு நேர முன்னறிவிப்பு", hi: "प्रतीक्षा समय पूर्वानुमान", te: "వేచి ఉండే సమయ అంచనా", ml: "കാത്തിരിപ്പ് സമയ പ്രവചനം"
    },
    "queue.congestionAlert": {
        en: "High congestion likely in 30 min. Alert staff to prepare.", ta: "30 நிமிடங்களில் அதிக நெரிசல் ஏற்படலாம். தயார் செய்ய ஊழியர்களை எச்சரிக்கவும்.", hi: "30 मिनट में उच्च भीड़ की संभावना। तैयार होने के लिए स्टाफ को सूचित करें।", te: "30 నిమిషాల్లో అధిక రద్దీ ఉండవచ్చు. సిద్ధం కావడానికి సిబ్బందిని అలర్ట్ చేయండి.", ml: "30 മിനിറ്റിനുള്ളിൽ ഉയർന്ന തിരക്ക് സാധ്യത. തയ്യാറെടുക്കാൻ ജീവനക്കാരെ അറിയിക്കുക."
    },
    "queue.potentialHighRisk": {
        en: "Potential High Risk Patients", ta: "சாத்தியமான அதிக ஆபத்து நோயாளிகள்", hi: "संभावित उच्च जोखिम रोगी", te: "సంభావ్య అధిక ప్రమాద రోగులు", ml: "സാധ്യതയുള്ള ഉയർന്ന അപകടസാധ്യതാ രോഗികൾ"
    },
    "queue.noHighRisk": {
        en: "No high risk patients detected.", ta: "அதிக ஆபத்து நோயாளிகள் கண்டறியப்படவில்லை.", hi: "कोई उच्च जोखिम रोगी नहीं मिला।", te: "అధిక ప్రమాద రోగులు కనుగొనబడలేదు.", ml: "ഉയർന്ന അപകടസാധ്യതയുള്ള രോഗികൾ കണ്ടെത്തിയില്ല."
    },

    // ─── LOADING / MISC ────────────────────────────────
    "loading.analyzing": {
        en: "Analyzing patient data...", ta: "நோயாளி தரவை பகுப்பாய்வு செய்கிறது...", hi: "रोगी डेटा का विश्लेषण हो रहा है...", te: "రోగి డేటాను విశ్లేషిస్తోంది...", ml: "രോഗി ഡാറ്റ വിശകലനം ചെയ്യുന്നു..."
    },
    "loading.analyzingEHR": {
        en: "Analyzing EHR with AI...", ta: "AI மூலம் EHR பகுப்பாய்வு...", hi: "AI के साथ EHR का विश्लेषण...", te: "AI తో EHR విశ్లేషణ...", ml: "AI ഉപയോഗിച്ച് EHR വിശകലനം..."
    },

    // ─── LANGUAGE SWITCHER ─────────────────────────────
    "lang.label": {
        en: "Language", ta: "மொழி", hi: "भाषा", te: "భాష", ml: "ഭാഷ"
    },
};

// ─── i18n Engine ──────────────────────────────────────
let currentLang = localStorage.getItem('medtriage_lang') || 'en';

function t(key) {
    const entry = TRANSLATIONS[key];
    if (!entry) return key;
    return entry[currentLang] || entry['en'] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('medtriage_lang', lang);
    applyTranslations();
    updateLanguageSwitcher();
}

function applyTranslations() {
    // Translate all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = translation;
        } else if (el.hasAttribute('data-i18n-html')) {
            el.innerHTML = translation;
        } else {
            el.textContent = translation;
        }
    });

    // Translate select options with data-i18n
    document.querySelectorAll('option[data-i18n]').forEach(opt => {
        opt.textContent = t(opt.getAttribute('data-i18n'));
    });

    // Update page title
    document.title = `MedTriage AI - ${t('nav.dashboard')}`;
}

function updateLanguageSwitcher() {
    const btns = document.querySelectorAll('.lang-btn');
    btns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
}

function initLanguageSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    if (!switcher) return;

    switcher.addEventListener('click', (e) => {
        const btn = e.target.closest('.lang-btn');
        if (btn && btn.dataset.lang) {
            setLanguage(btn.dataset.lang);
        }
    });

    // Apply saved language on load
    updateLanguageSwitcher();
    applyTranslations();
}
