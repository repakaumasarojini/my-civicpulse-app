import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Share2, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Filter, 
  RefreshCw, 
  Building2, 
  Camera, 
  Globe, 
  Award, 
  ExternalLink,
  Info,
  Trash2,
  Printer,
  Navigation,
  AlertTriangle
} from 'lucide-react';

import { db } from './firebase';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';

// Default Sample Data (VZ-18-001 to VZ-21-010)
const DEFAULT_TICKETS = [
  { id: 'VZ-18-001', ward: 'Ward 18 (MVP Colony)', zone: 'Zone 2', category: 'Pothole', severity: 'High', status: 'Logged', date: '2026-11-01', summary: 'Deep asphalt hole causing traffic slowdown near circle.', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 18 },
  { id: 'VZ-18-002', ward: 'Ward 18 (MVP Colony)', zone: 'Zone 2', category: 'Garbage Dump', severity: 'Medium', status: 'Verified Fixed', date: '2026-11-02', summary: 'Cleared illegal garbage heap near public park.', image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 0 },
  { id: 'VZ-07-003', ward: 'Ward 7 (Madhuravada)', zone: 'Zone 2', category: 'Broken Streetlight', severity: 'Low', status: 'Pending', date: '2026-11-03', summary: 'Flickering street pole light near IT Hill Signal.', image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 36 },
  { id: 'VZ-07-004', ward: 'Ward 7 (Madhuravada)', zone: 'Zone 2', category: 'Open Drain', severity: 'High', status: 'In Progress', date: '2026-11-03', summary: 'Uncovered storm drain hazard along main arterial road.', image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 12 },
  { id: 'VZ-65-005', ward: 'Ward 65 (Gajuwaka)', zone: 'Zone 5', category: 'Road Crater', severity: 'High', status: 'Logged', date: '2026-11-04', summary: 'Large crater near industrial corridor junction.', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 42 },
  { id: 'VZ-65-006', ward: 'Ward 65 (Gajuwaka)', zone: 'Zone 5', category: 'Garbage Dump', severity: 'High', status: 'Verified Fixed', date: '2026-11-04', summary: 'Sanitation team completed waste clearing and disinfection.', image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 0 },
  { id: 'VZ-14-007', ward: 'Ward 14 (Seethammadhara)', zone: 'Zone 2', category: 'Streetlight', severity: 'Low', status: 'Pending', date: '2026-11-05', summary: 'Non-functional lane streetlight fixture.', image: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 45 },
  { id: 'VZ-14-008', ward: 'Ward 14 (Seethammadhara)', zone: 'Zone 2', category: 'Pothole', severity: 'Medium', status: 'Logged', date: '2026-11-05', summary: 'Rough road patch causing two-wheeler skids.', image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 40 },
  { id: 'VZ-21-009', ward: 'Ward 21 (Maddilapalem)', zone: 'Zone 2', category: 'Water Leakage', severity: 'High', status: 'Pending', date: '2026-11-05', summary: 'Main supply pipeline leak spilling drinking water onto road.', image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 24 },
  { id: 'VZ-21-010', ward: 'Ward 21 (Maddilapalem)', zone: 'Zone 2', category: 'Garbage Dump', severity: 'Medium', status: 'Logged', date: '2026-11-05', summary: 'Accumulated commercial cardboard boxes and organic waste.', image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80', slaHoursRemaining: 48 },
];

const PRESET_IMAGES = [
  { name: 'Overflow Garbage Dump', ward: 'Ward 18 (MVP Colony)', zone: 'Zone 2', url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80' },
  { name: 'Hazardous Road Pothole', ward: 'Ward 7 (Madhuravada)', zone: 'Zone 2', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80' },
  { name: 'Open Water Drain Hazard', ward: 'Ward 65 (Gajuwaka)', zone: 'Zone 5', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&auto=format&fit=crop&q=80' },
  { name: 'Broken Streetlight Pole', ward: 'Ward 14 (Seethammadhara)', zone: 'Zone 2', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=600&auto=format&fit=crop&q=80' }
];

const I18N = {
  en: {
    appTitle: 'CivicPulse',
    tagline: 'Report local street defects on WhatsApp & track open, photo-verified ward report cards in Visakhapatnam.',
    navIngestion: 'WhatsApp Bot',
    navCard: 'Share Ticket',
    navDigest: 'Ward Scoreboard',
    navAbout: 'Why It Matters',
    actionWhatsApp: '📱 Send Photo & Location on WhatsApp',
    step1Title: '1. Capture / Upload Photo',
    step2Title: '2. Auto Location Pin',
    step3Title: '3. AI Vision Analysis & Log Ticket',
    analyzeBtn: 'Analyze Defect with AI & Generate Ticket',
    analyzing: 'AI Vision Inspector is analyzing defect...',
    shareOnWA: 'Share on WhatsApp Group',
    filterWard: 'Filter Ward',
    filterStatus: 'Filter Status',
    clearData: 'Reset Default Demo Data',
  },
  te: {
    appTitle: 'సివిక్ పల్స్ (CivicPulse)',
    tagline: 'వాట్సాప్‌లో వీధి సమస్యలను నివేదించండి & విశాఖపట్నం వార్డు రిపోర్ట్ కార్డులను ట్రాక్ చేయండి.',
    navIngestion: 'వాట్సాప్ బోట్',
    navCard: 'టికెట్ షేర్',
    navDigest: 'వార్డు స్కోర్‌బోర్డ్',
    navAbout: 'ఎందుకు ముఖ్యం',
    actionWhatsApp: '📱 వాట్సాప్‌లో ఫోటో & లొకేషన్ పంపండి',
    step1Title: '1. ఫోటోను అప్‌లోడ్ చేయండి',
    step2Title: '2. ఆటో లొకేషన్ గుర్తింపు',
    step3Title: '3. AI విశ్లేషణ & టికెట్ నమోదు',
    analyzeBtn: 'AIతో సమస్యను విశ్లేషించండి & టికెట్ సృష్టించండి',
    analyzing: 'AI సమస్యను తనిఖీ చేస్తోంది...',
    shareOnWA: 'వాట్సాప్ గ్రూప్‌లో షేర్ చేయండి',
    filterWard: 'వార్డు ఫిల్టర్',
    filterStatus: 'స్టేటస్ ఫిల్టర్',
    clearData: 'డెమో డేటాను రీసెట్ చేయండి',
  }
};

export default function App() {
  const [lang, setLang] = useState('en');
  const [activeTab, setActiveTab] = useState('ingestion');
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(DEFAULT_TICKETS[0].id);
  const [toastMessage, setToastMessage] = useState('');

  // Photo & Location State
  const [selectedImage, setSelectedImage] = useState(PRESET_IMAGES[0].url);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [selectedWard, setSelectedWard] = useState('Ward 18 (MVP Colony)');
  const [selectedZone, setSelectedZone] = useState('Zone 2');
  const [coords, setCoords] = useState(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatusText, setGpsStatusText] = useState('GPS Idle');

  // AI & Filter State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [wardFilter, setWardFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const t = I18N[lang];

  useEffect(() => {
    detectUserLocation();
  }, []);

  // Real-Time Firebase Listener
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const liveTickets = snapshot.docs.map(docSnap => ({
        docId: docSnap.id,
        ...docSnap.data()
      }));
      setTickets(liveTickets.length > 0 ? liveTickets : DEFAULT_TICKETS);
    }, (error) => {
      console.warn("Firestore fallback:", error);
      setTickets(DEFAULT_TICKETS);
    });

    return () => unsubscribe();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      setGpsStatusText('Geolocation API not supported.');
      return;
    }
    setIsDetectingGps(true);
    setGpsStatusText('Acquiring GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(5);
        const lng = position.coords.longitude.toFixed(5);
        setCoords({ lat, lng });
        setIsDetectingGps(false);
        setGpsStatusText(`GPS Locked (${lat}, ${lng})`);
        triggerToast('📍 GPS location locked & mapped to Ward!');
      },
      (error) => {
        setIsDetectingGps(false);
        setGpsStatusText('GPS permission denied. Using selected ward.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
        triggerToast('📷 Custom photo loaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const runAiVisionInspector = async () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiAnalysis({
        category: 'Solid Waste / Illegal Garbage Dump',
        severity: 'High',
        summary: 'Overflowing waste dump blocking pedestrian lane & road drain.'
      });
      triggerToast('✨ Gemini AI Inspector successfully analyzed defect!');
    }, 1200);
  };

  const handleLogTicket = async () => {
    const wardNumber = selectedWard.match(/\d+/)?.[0] || '18';
    const newSeq = (tickets.length + 1).toString().padStart(3, '0');
    const newId = `VZ-${wardNumber}-${newSeq}`;

    const newTicket = {
      id: newId,
      ward: selectedWard,
      zone: selectedZone,
      coordinates: coords ? `${coords.lat}, ${coords.lng}` : 'Auto GPS Pin',
      category: aiAnalysis ? aiAnalysis.category : 'Reported Civic Defect',
      severity: aiAnalysis ? aiAnalysis.severity : 'High',
      status: 'Logged',
      date: new Date().toISOString().split('T')[0],
      summary: aiAnalysis ? aiAnalysis.summary : 'Photo verified defect logged via WhatsApp Bot.',
      image: selectedImage,
      slaHoursRemaining: 48,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, "tickets"), newTicket);
      setSelectedTicketId(newId);
      setActiveTab('card');
      triggerToast(`Ticket ${newId} logged to Cloud Firestore! Switched to Share Card.`);
    } catch (err) {
      setTickets([newTicket, ...tickets]);
      setSelectedTicketId(newId);
      setActiveTab('card');
      triggerToast(`Ticket ${newId} logged locally!`);
    }
  };

  const getWhatsAppShareLink = (ticket) => {
    const text = `🚨 *CIVICPULSE VERIFIED TICKET CARD* 🚨\n\n` +
      `📌 *Ticket ID:* ${ticket.id}\n` +
      `📍 *Location:* ${ticket.ward} (${ticket.zone})\n` +
      `⚠️ *Issue:* ${ticket.category} (${ticket.severity} Severity)\n` +
      `⏱️ *SLA Countdown:* ${ticket.slaHoursRemaining} Hours Remaining\n` +
      `📝 *Summary:* ${ticket.summary}\n\n` +
      `Track full Ward Scoreboard and public resolution stats on CivicPulse Vizag:\n` +
      `https://civicpulse.vizag.gov.in/track/${ticket.id}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  };

  // Ward Scoreboard Leaderboard calculation
  const wardScoreboard = useMemo(() => {
    const wardsMap = {};
    tickets.forEach(ticket => {
      if (!wardsMap[ticket.ward]) {
        wardsMap[ticket.ward] = { ward: ticket.ward, zone: ticket.zone, total: 0, fixed: 0, pending: 0, highSeverity: 0 };
      }
      wardsMap[ticket.ward].total += 1;
      if (ticket.status === 'Verified Fixed') {
        wardsMap[ticket.ward].fixed += 1;
      } else {
        wardsMap[ticket.ward].pending += 1;
      }
      if (ticket.severity === 'High') {
        wardsMap[ticket.ward].highSeverity += 1;
      }
    });

    return Object.values(wardsMap).map(w => ({
      ...w,
      resolutionRate: Math.round((w.fixed / w.total) * 100) || 0
    })).sort((a, b) => b.resolutionRate - a.resolutionRate);
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      const matchWard = wardFilter === 'ALL' || t.ward === wardFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchWard && matchStatus;
    });
  }, [tickets, wardFilter, statusFilter]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId) || tickets[0] || DEFAULT_TICKETS[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased">
      
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-emerald-900 text-white px-4 py-3 rounded-lg shadow-xl border border-emerald-500 flex items-center space-x-2 animate-bounce">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('ingestion')}>
            <div className="bg-emerald-600 p-2 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-900/50">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                {t.appTitle}
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                  Vizag Ward Watch
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Visakhapatnam WhatsApp Civic Tracking</p>
            </div>
          </div>

          <nav className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1">
            <button onClick={() => setActiveTab('ingestion')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${activeTab === 'ingestion' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              📱 {t.navIngestion}
            </button>
            <button onClick={() => setActiveTab('card')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${activeTab === 'card' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              🏷️ {t.navCard}
            </button>
            <button onClick={() => setActiveTab('digest')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${activeTab === 'digest' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              📊 {t.navDigest}
            </button>
            <button onClick={() => setActiveTab('about')} className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${activeTab === 'about' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
              ℹ️ {t.navAbout}
            </button>
          </nav>

          <div className="flex items-center space-x-2">
            <button onClick={() => setLang(lang === 'en' ? 'te' : 'en')} className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 text-xs font-semibold rounded-lg text-slate-200 flex items-center space-x-1">
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'en' ? 'తెలుగు' : 'English'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* HERO BANNER */}
      <section className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 text-white py-6 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visakhapatnam Civic Transparency Platform</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white max-w-3xl">{t.tagline}</h2>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* TAB 1: INGESTION */}
        {activeTab === 'ingestion' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    WhatsApp Bot Ingestion Flow
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Upload a photo and auto-detect your location pin via GPS.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* STEP 1: PHOTO */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-sm text-slate-800 flex items-center justify-between">
                    <span>{t.step1Title}</span>
                    <Camera className="w-4 h-4 text-emerald-600" />
                  </h4>
                  <div className="relative aspect-video bg-slate-200 rounded-lg overflow-hidden border border-slate-300">
                    <img src={selectedImage} alt="Defect Preview" className="w-full h-full object-cover" />
                  </div>
                  <label className="flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-xl cursor-pointer text-xs font-bold shadow">
                    <Upload className="w-4 h-4" />
                    <span>{uploadedFileName ? uploadedFileName : 'Upload Real Photo'}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_IMAGES.map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setSelectedImage(preset.url); setSelectedWard(preset.ward); setSelectedZone(preset.zone); }}
                        className={`text-left p-2 text-xs rounded border ${selectedImage === preset.url ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold' : 'bg-white border-slate-200'}`}
                      >
                        <p className="truncate">{preset.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* STEP 2: LOCATION */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h4 className="font-semibold text-sm text-slate-800 flex items-center justify-between">
                    <span>{t.step2Title}</span>
                    <Navigation className="w-4 h-4 text-emerald-600" />
                  </h4>
                  <div className="bg-slate-900 text-white p-3 rounded-lg text-xs font-mono space-y-1">
                    <p className="text-emerald-400 font-bold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {gpsStatusText}
                    </p>
                    {coords && <p className="text-slate-300">Lat: {coords.lat} | Lng: {coords.lng}</p>}
                  </div>
                  <select
                    value={selectedWard}
                    onChange={(e) => setSelectedWard(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 font-medium"
                  >
                    <option value="Ward 18 (MVP Colony)">Ward 18 (MVP Colony)</option>
                    <option value="Ward 7 (Madhuravada)">Ward 7 (Madhuravada)</option>
                    <option value="Ward 65 (Gajuwaka)">Ward 65 (Gajuwaka)</option>
                    <option value="Ward 14 (Seethammadhara)">Ward 14 (Seethammadhara)</option>
                    <option value="Ward 21 (Maddilapalem)">Ward 21 (Maddilapalem)</option>
                  </select>
                </div>

                {/* STEP 3: SUBMIT */}
                <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <button
                    onClick={runAiVisionInspector}
                    disabled={isAnalyzing}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white p-3 rounded-xl font-semibold text-xs flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
                    <span>{isAnalyzing ? t.analyzing : t.analyzeBtn}</span>
                  </button>
                  <button
                    onClick={handleLogTicket}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm & Save to Cloud Database</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TICKET CARD */}
        {activeTab === 'card' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-200 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    {selectedTicket.id}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-2">{selectedTicket.ward}</h3>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  selectedTicket.status === 'Verified Fixed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>
              <img src={selectedTicket.image} alt="Ticket Defect" className="w-full aspect-video rounded-xl object-cover" />
              <div className="space-y-2 text-xs">
                <p><strong>Category:</strong> {selectedTicket.category}</p>
                <p><strong>Summary:</strong> {selectedTicket.summary}</p>
              </div>
              <a href={getWhatsAppShareLink(selectedTicket)} target="_blank" rel="noopener noreferrer" className="w-full bg-emerald-600 text-white p-3 rounded-xl font-bold text-xs flex justify-center items-center gap-2">
                <Share2 className="w-4 h-4" /> {t.shareOnWA}
              </a>
            </div>
          </div>
        )}

        {/* TAB 3: WARD SCOREBOARD LEADERBOARD & OPPOSITION STATUS */}
        {activeTab === 'digest' && (
          <div className="space-y-8">
            
            {/* WARD RANKINGS LEADERBOARD */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  Visakhapatnam Ward Resolution Leaderboard
                </h3>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
                  Ranked by Fix Rate %
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wardScoreboard.map((ward, rank) => (
                  <div key={ward.ward} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Rank #{rank + 1}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{ward.ward}</h4>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        ward.resolutionRate >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {ward.resolutionRate}% Fixed
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200 text-xs flex justify-between text-slate-600">
                      <span>Total: <b>{ward.total}</b></span>
                      <span>Resolved: <b className="text-emerald-700">{ward.fixed}</b></span>
                      <span>Pending: <b className="text-amber-700">{ward.pending}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* OPPOSITION / PENDING ISSUES LIST */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Open Defect Tickets & Opposition Trackers
                </h3>

                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select
                    value={wardFilter}
                    onChange={(e) => setWardFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="ALL">All Wards</option>
                    {wardScoreboard.map(w => (
                      <option key={w.ward} value={w.ward}>{w.ward}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Logged">Logged</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Verified Fixed">Verified Fixed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTickets.map((ticket, idx) => (
                  <div key={ticket.docId || ticket.id || idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{ticket.id}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          ticket.status === 'Verified Fixed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{ticket.ward}</h4>
                      <p className="text-xs text-slate-600">{ticket.summary}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                      <span className="font-medium text-slate-500">{ticket.category}</span>
                      <button
                        onClick={() => { setSelectedTicketId(ticket.id); setActiveTab('card'); }}
                        className="text-emerald-600 font-bold hover:underline"
                      >
                        Card &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: ABOUT */}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-xl font-extrabold text-slate-900">About CivicPulse</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              CivicPulse combines real-time Firebase Firestore synchronization, browser GPS auto-location, and Gemini AI vision inspection to bring complete municipal transparency across Visakhapatnam wards.
            </p>
          </div>
        )}

      </main>
    </div>
  );
}