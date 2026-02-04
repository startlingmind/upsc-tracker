
import { Task, Phase } from './types';

const RAW_DATA = [
    { day: 1, phase: 1, subject: "Economy & History", topics: "RBI Functions, Monetary Policy (Repo, Reverse Repo, MSF), Decline of Mughals, Advent of Europeans", type: "Study" },
    { day: 2, phase: 1, subject: "Polity & History", topics: "Regulating Act 1773 to 1935 Act, Preamble, Battle of Plassey & Buxar", type: "Study" },
    { day: 3, phase: 1, subject: "Economy & Testing", topics: "MCLR vs Base Rate, BASEL III Norms, Mid-Week Test: Economy Banking Basics", type: "Test" },
    { day: 4, phase: 1, subject: "Economy & History", topics: "Inflation (CPI, WPI, GDP Deflator), IIP, Revolt of 1857 (Leaders/Causes)", type: "Study" },
    { day: 5, phase: 1, subject: "Polity & History", topics: "Socio-Religious Reforms (Raja Ram Mohan Roy, Arya Samaj), Citizenship, Fundamental Rights (12-35)", type: "Study" },
    { day: 6, phase: 1, subject: "Full Length Test", topics: "FLT 1 (Basic NCERT Level), Weekend Upskilling Block", type: "FLT" },
    { day: 7, phase: 1, subject: "Economy & History", topics: "Budget Terms (Deficits), FRBM Act, Formation of INC, Moderates vs Extremists", type: "Study" },
    { day: 8, phase: 1, subject: "Economy & History", topics: "GST Council & Slabs, Partition of Bengal (1905), Swadeshi Movement", type: "Study" },
    { day: 9, phase: 1, subject: "Polity & History", topics: "Surat Split, DPSP, Fundamental Duties, Amendment Procedure", type: "Study" },
    { day: 10, phase: 1, subject: "History Testing", topics: "Mid-Week Test: Modern History (1857-1905)", type: "Test" },
    { day: 11, phase: 1, subject: "Economy & History", topics: "BoP, Current/Capital Account, Forex, Ghadar Movement, Komagata Maru", type: "Study" },
    { day: 12, phase: 1, subject: "Economy & History", topics: "NEER vs REER, FDI vs FII, Home Rule League, Lucknow Pact 1916", type: "Study" },
    { day: 13, phase: 1, subject: "Polity", topics: "President, Vice-President, Governor (Pardoning powers)", type: "Study" },
    { day: 14, phase: 1, subject: "Full Length Test", topics: "FLT 2, Weekend Upskilling Block", type: "FLT" },
    { day: 15, phase: 1, subject: "Buffer/Review", topics: "Review FLT 2 Mistakes, Catch up on backlog", type: "Buffer" },
    { day: 16, phase: 1, subject: "Economy & History", topics: "Money Market (T-Bills), Capital Market (SEBI, IPOs), Gandhi's Entry (Champaran/Kheda)", type: "Study" },
    { day: 17, phase: 1, subject: "History & Polity", topics: "Rowlatt Act, Jallianwala Bagh, Non-Cooperation, Parliament Sessions", type: "Study" },
    { day: 18, phase: 1, subject: "Polity", topics: "Bills (Money vs Finance), Budget Process, Parliamentary Committees", type: "Study" },
    { day: 19, phase: 1, subject: "Polity Testing", topics: "Mid-Week Test: Polity (Executive & Parliament)", type: "Test" },
    { day: 20, phase: 1, subject: "Review Phase 1", topics: "Consolidate Notes for Eco/History/Polity", type: "Buffer" },

    { day: 21, phase: 2, subject: "Economy & History", topics: "Agriculture (MSP, FRP), WTO Boxes, Simon Commission, Nehru Report", type: "Study" },
    { day: 22, phase: 2, subject: "Geography & History", topics: "Interior of Earth, Earthquakes, Volcanoes, Civil Disobedience (Dandi)", type: "Study" },
    { day: 23, phase: 2, subject: "Geography & History", topics: "Continental Drift, Round Table Conferences, Poona Pact", type: "Study" },
    { day: 24, phase: 2, subject: "Full Length Test", topics: "FLT 3, Weekend Upskilling Block", type: "FLT" },
    { day: 25, phase: 2, subject: "Economy", topics: "Five Year Plans, NITI Aayog, Poverty Committees (Tendulkar/Rangarajan)", type: "Study" },
    { day: 26, phase: 2, subject: "History", topics: "GoI Act 1935, Quit India Movement, INA Trials", type: "Study" },
    { day: 27, phase: 2, subject: "Geography & History", topics: "Atmosphere Layers, Cyclones, Cabinet Mission, Mountbatten Plan", type: "Study" },
    { day: 28, phase: 2, subject: "Geography Testing", topics: "Mid-Week Test: Geography (Physical)", type: "Test" },
    { day: 29, phase: 2, subject: "IR & Mapping", topics: "West Asia (Israel-Palestine, Red Sea), Central Asia Groupings", type: "Study" },
    { day: 30, phase: 2, subject: "Polity & IR", topics: "Supreme Court vs High Court (Writs), South China Sea Dispute", type: "Study" },
    { day: 31, phase: 2, subject: "Geography", topics: "Oceanography (Currents, Salinity, Coral Bleaching)", type: "Study" },
    { day: 32, phase: 2, subject: "Full Length Test", topics: "FLT 4, Weekend Upskilling Block", type: "FLT" },
    { day: 33, phase: 2, subject: "Polity", topics: "Constitutional Bodies (ECI, UPSC, CAG, Finance Comm)", type: "Study" },
    { day: 34, phase: 2, subject: "Polity", topics: "Non-Constitutional Bodies (NHRC, CIC, CVC), Tribunals", type: "Study" },
    { day: 35, phase: 2, subject: "Geography", topics: "Indian Physical (Himalayas, Plateau), River Systems (Indus, Ganga)", type: "Study" },
    { day: 36, phase: 2, subject: "Geography & IR", topics: "River Systems (Godavari, Krishna, Kaveri), India's Neighborhood Disputes", type: "Study" },
    { day: 37, phase: 2, subject: "Mixed Testing", topics: "Mid-Week Test: Mixed (History + Polity)", type: "Test" },
    { day: 38, phase: 2, subject: "IR", topics: "Indian Ocean Rim (IOR), Important Straits and Canals", type: "Study" },
    { day: 39, phase: 2, subject: "Buffer", topics: "Catch up on Geography & Mapping", type: "Buffer" },
    { day: 40, phase: 2, subject: "Review Phase 2", topics: "Consolidate Geography & IR Notes", type: "Buffer" },

    { day: 41, phase: 3, subject: "Environment", topics: "Ecology Basics (Ecotone, Niche), Biodiversity Levels", type: "Study" },
    { day: 42, phase: 3, subject: "Sci-Tech", topics: "Space (Orbits LEO/GEO, Launch Vehicles, Chandrayaan)", type: "Study" },
    { day: 43, phase: 3, subject: "Ancient History", topics: "Indus Valley Civilization, Buddhism & Jainism", type: "Study" },
    { day: 44, phase: 3, subject: "Full Length Test", topics: "FLT 5, Weekend Upskilling Block", type: "FLT" },
    { day: 45, phase: 3, subject: "Environment", topics: "Protected Areas (National Parks, WLS, Biosphere Reserves)", type: "Study" },
    { day: 46, phase: 3, subject: "Sci-Tech", topics: "Biotech (CRISPR, DNA Profiling, Vaccines), Diseases", type: "Study" },
    { day: 47, phase: 3, subject: "Ancient History", topics: "Mauryan Empire (Ashoka), Gupta Period (Art/Arch)", type: "Study" },
    { day: 48, phase: 3, subject: "Env/Sci Testing", topics: "Mid-Week Test: Environment & Science", type: "Test" },
    { day: 49, phase: 3, subject: "Environment", topics: "Climate Change (UNFCCC, Kyoto, Paris), Pollution (AQI, BS-VI)", type: "Study" },
    { day: 50, phase: 3, subject: "Sci-Tech", topics: "Defense (Missiles, Subs), Nuclear Tech (3-Stage Program)", type: "Study" },
    { day: 51, phase: 3, subject: "Medieval History", topics: "Mughal Architecture/Admin, Vijayanagara Empire", type: "Study" },
    { day: 52, phase: 3, subject: "Full Length Test", topics: "FLT 6, Weekend Upskilling Block", type: "FLT" },
    { day: 53, phase: 3, subject: "Environment", topics: "Acts (WPA 1972, EPA 1986, FRA), IUCN Red List Categories", type: "Study" },
    { day: 54, phase: 3, subject: "Sci-Tech", topics: "IT & Comm (5G/6G, AI, Blockchain, Quantum)", type: "Study" },
    { day: 55, phase: 3, subject: "Polity", topics: "Panchayati Raj & Municipalities (73rd/74th Amd)", type: "Study" },
    { day: 56, phase: 3, subject: "CA Testing", topics: "Mid-Week Test: Current Affairs (Last 12 Months)", type: "Test" },
    { day: 57, phase: 3, subject: "Environment", topics: "Renewable Energy Targets, Waste Management Rules", type: "Study" },
    { day: 58, phase: 3, subject: "Schemes", topics: "Govt Schemes (Agri, Rural Dev, Women)", type: "Study" },
    { day: 59, phase: 3, subject: "Buffer", topics: "Catch up on S&T/Env", type: "Buffer" },
    { day: 60, phase: 3, subject: "Review Phase 3", topics: "Consolidate S&T and Environment Notes", type: "Buffer" },

    { day: 61, phase: 4, subject: "Simulation", topics: "FLT 7 (9:30 AM - 11:30 AM), Detailed Analysis", type: "FLT" },
    { day: 62, phase: 4, subject: "Revision", topics: "Economy Schemes, Budget/Survey Summary", type: "Revision" },
    { day: 63, phase: 4, subject: "Revision", topics: "Modern History Timeline, Governor Generals", type: "Revision" },
    { day: 64, phase: 4, subject: "Simulation", topics: "FLT 8 (Focus on CSAT if weak)", type: "FLT" },
    { day: 65, phase: 4, subject: "Revision", topics: "Polity Articles, Amendments List", type: "Revision" },
    { day: 66, phase: 4, subject: "Revision", topics: "Environment Acts, National Parks Map", type: "Revision" },
    { day: 67, phase: 4, subject: "Simulation", topics: "FLT 9 (Open Mock)", type: "FLT" },
    { day: 68, phase: 4, subject: "Revision", topics: "Sci-Tech Emerging Technologies", type: "Revision" },
    { day: 69, phase: 4, subject: "Revision", topics: "Mapping (Places in News), IR Revision", type: "Revision" },
    { day: 70, phase: 4, subject: "Simulation", topics: "FLT 10 (Final Mock)", type: "FLT" },
    { day: 71, phase: 4, subject: "Relax/Buffer", topics: "Light Reading, Short Notes Only", type: "Buffer" },
    { day: 72, phase: 4, subject: "Relax/Buffer", topics: "Light Reading, Short Notes Only", type: "Buffer" },
    { day: 73, phase: 4, subject: "Relax/Buffer", topics: "Sleep Cycle Correction", type: "Buffer" },
    { day: 74, phase: 4, subject: "Relax/Buffer", topics: "Sleep Cycle Correction", type: "Buffer" },
    { day: 75, phase: 4, subject: "THE EXAM", topics: "Go conquer it, Mental Preparation, Final Check", type: "Exam" },
];

export const UPSC_PLAN: Task[] = RAW_DATA.flatMap((dayData) => {
    const topicList = dayData.topics.split(/,(?![^(]*\))/).map(s => s.trim());
    return topicList.map((topic, index) => ({
        id: `${dayData.day}-${index + 1}`,
        day: dayData.day,
        category: dayData.subject,
        title: topic
    }));
});

export const getPhaseForDay = (day: number): Phase => {
  if (day <= 20) return Phase.PHASE_1;
  if (day <= 40) return Phase.PHASE_2;
  if (day <= 60) return Phase.PHASE_3;
  return Phase.PHASE_4;
};
