export const palette = {
  background: "#fbf7f3",
  surface: "#f6efeb",
  card: "#ffffff",
  border: "#e8dfda",
  text: "#262126",
  muted: "#746e77",
  primary: "#9a2119",
  primaryDeep: "#6c160f",
  secondary: "#cb9c48",
  teal: "#2d8c83",
  green: "#2f9367",
  blue: "#3774d8",
  purple: "#8856c9",
  orange: "#ea872e",
  pink: "#d9608f",
  danger: "#d04f4f",
};

export const existingUsers = [
  {
    id: "user-1",
    name: "Jayashree Das",
    mobile: "9876543210",
    email: "jaya@email.com",
    password: "Jaya@123",
    coupon: "CAREER2026",
  },
  {
    id: "user-2",
    name: "Priya Parent",
    mobile: "9988776655",
    email: "priya.parent@email.com",
    password: "Parent@123",
    coupon: "PARENTMAP",
  },
];

export const subscriptions = [
  {
    id: "psychometric",
    name: "Psychometric Test",
    price: "Rs 1,500",
    description: "One annual test, quick summary, and starter career suggestions.",
    features: ["1 Psychometric Test", "Basic report", "Career suggestions"],
  },
  {
    id: "premium",
    name: "Psychometric + Counselling",
    price: "Rs 3,000",
    description: "Unlock assessment, mentor booking, and master classes together.",
    features: ["Detailed report", "1-on-1 counselling", "Mentor booking access", "Master class access"],
    highestseller: true,
  },
  {
    id: "infocentre",
    name: "Infocentre Access",
    price: "Rs 5,000",
    description: "Unlock all core info modules except study abroad.",
    features: ["Psychometric test", "Career library", "Master class videos", "Mentor booking", "Scholarship info"],
    recommended: true,
  },
  {
    id: "abroad",
    name: "Study Abroad Access",
    price: "Rs 2,500",
    description: "Unlock only the Study Abroad module and counselling request flow.",
    features: ["Study Abroad module", "Country details", "Consultation request access"],
  },
];

export const heroStats = [
  { label: "Saved Careers", value: "18", tone: palette.orange },
  { label: "Tests Taken", value: "06", tone: palette.blue },
  { label: "Mentor Sessions", value: "03", tone: palette.purple },
];

export const moduleCards = [
  { title: "Career Library", subtitle: "Explore streams, roles, and college paths.", route: "/app/library", tone: palette.blue },
  { title: "Assessment", subtitle: "Discover aptitude and personality insights.", route: "/app/assessment", tone: palette.purple },
  { title: "Master Class", subtitle: "Short expert-led learning videos.", route: "/app/learn", tone: palette.orange },
  { title: "Entrance Exam", subtitle: "Practice tests and exam preparation guides.", route: "/app/entrance-exam", tone: palette.teal },
  { title: "Institutes", subtitle: "Browse top colleges and universities.", route: "/app/institutes", tone: palette.pink },
  { title: "Book Mentor", subtitle: "Reserve guidance with an expert mentor.", route: "/app/book-mentor", tone: palette.secondary },
  { title: "Scholarships", subtitle: "Funding alerts and application deadlines.", route: "/app/scholarships", tone: palette.green },
  { title: "Quiz", subtitle: "Test your knowledge with fun quizzes.", route: "/app/quiz", tone: palette.blue },
  { title: "Study Abroad", subtitle: "Explore international education options.", route: "/app/abroad", tone: palette.purple },
];

export const featuredMentors = [
  { name: "Dr. Priya Sharma", specialty: "Career Counselling", rating: "4.9", experience: "12 yrs", accent: palette.primary },
  { name: "Prof. Rahul Verma", specialty: "Engineering", rating: "4.8", experience: "15 yrs", accent: palette.blue },
  { name: "Ms. Anjali Singh", specialty: "Design & Arts", rating: "4.7", experience: "8 yrs", accent: palette.orange },
];

export const featuredScholarships = [
  { name: "INSPIRE Scholarship", amount: "Rs 80,000 / year", deadline: "March 2025", tag: "Merit Based" },
  { name: "KVPY Fellowship", amount: "Rs 7,000 / month", deadline: "August 2025", tag: "Science" },
  { name: "Pragati Scholarship", amount: "Rs 50,000 / year", deadline: "December 2024", tag: "Girls in Tech" },
];

export const featuredInstitutes = [
  { name: "IIT Bombay", location: "Mumbai", type: "Engineering" },
  { name: "AIIMS Delhi", location: "New Delhi", type: "Medical" },
  { name: "IIM Ahmedabad", location: "Ahmedabad", type: "Business" },
];

export const notifications = [
  { id: "1", title: "Mentor session confirmed", message: "Your counselling slot is booked for Saturday at 4:00 PM.", time: "2h ago", unread: true },
  { id: "2", title: "Scholarship alert", message: "The Aspire STEM scholarship applications close in 5 days.", time: "Yesterday", unread: true },
  { id: "3", title: "New master class added", message: "A fresh session on entrance exam planning is now available.", time: "2 days ago", unread: false },
];

export const mentors = [
  { name: "Dr. Priya Sharma", specialty: "Career Counselling", experience: "12 years", rating: "4.9", price: "Rs 500 / session", tags: ["Counselling", "Psychology"], bio: "Expert career counsellor with 12 years of experience helping students find their ideal career paths.", accent: palette.primary, avatar: "DP" },
  { name: "Prof. Rahul Verma", specialty: "Engineering Guidance", experience: "15 years", rating: "4.8", price: "Rs 750 / session", tags: ["IIT", "JEE", "Engineering"], bio: "Former professor with deep experience in engineering career guidance and competitive exam planning.", accent: palette.blue, avatar: "RV" },
  { name: "Ms. Anjali Singh", specialty: "Design & Creative Arts", experience: "8 years", rating: "4.7", price: "Rs 600 / session", tags: ["Design", "UX", "NID"], bio: "A design mentor helping students explore creative career paths in product, UX, and media.", accent: palette.orange, avatar: "AS" },
  { name: "Mr. Vikram Patel", specialty: "Business & MBA", experience: "10 years", rating: "4.9", price: "Rs 800 / session", tags: ["MBA", "CAT", "Business"], bio: "An MBA mentor guiding students toward business schools, management careers, and interview readiness.", accent: palette.secondary, avatar: "VP" },
  { name: "Dr. Meera Iyer", specialty: "Medical Careers", experience: "18 years", rating: "4.8", price: "Rs 700 / session", tags: ["NEET", "Medical", "AIIMS"], bio: "A senior medical mentor helping students understand medical careers, NEET strategy, and college pathways.", accent: palette.green, avatar: "MI" },
];

export const scholarships = [
  { name: "INSPIRE Scholarship", eligibility: "Top 1% in Class 12 Board Exams", amount: "Rs 80,000 / year", deadline: "March 2025", tag: "Merit Based", status: "Active", provider: "Department of Science & Technology", description: "Supports tuition and research expenses for BSc, MSc, and PhD students in natural and basic sciences.", requirements: ["Top 1% in Class 12", "Pursuing BSc, MSc, or PhD in natural sciences", "Indian citizen"], link: "https://online-inspire.gov.in" },
  { name: "National Talent Search (NTSE)", eligibility: "Class 10 students", amount: "Rs 1,250 / month", deadline: "November 2024", tag: "National", status: "Expired", provider: "NCERT", description: "Identifies and nurtures talented students at Class 10 level through a two-stage selection process.", requirements: ["Class 10 student", "Indian nationality", "Clear Stage 1 at state level"], link: "https://ncert.nic.in/ntse" },
  { name: "KVPY Fellowship", eligibility: "Class 11-12 Science students", amount: "Rs 7,000 / month", deadline: "August 2025", tag: "Science", status: "Active", provider: "IISc Bangalore", description: "Encourages students to pursue research careers and includes enrichment opportunities.", requirements: ["Studying in Class 11, 12, or first-year BSc", "Science stream", "Clear aptitude test and interview"], link: "https://kvpy.iisc.ac.in" },
  { name: "Pragati Scholarship", eligibility: "Girl students in technical education", amount: "Rs 50,000 / year", deadline: "December 2024", tag: "Girls in Tech", status: "Expired", provider: "AICTE", description: "Supports girls in technical education with financial assistance for tuition fees and books.", requirements: ["Female candidate", "Admitted to AICTE-approved institution", "Family income below Rs 8 LPA"], link: "https://scholarships.gov.in" },
  { name: "Central Sector Scholarship", eligibility: "Class 12 passout - top 20% in Board", amount: "Rs 12,000 / year", deadline: "October 2025", tag: "National", status: "Active", provider: "Ministry of Education", description: "For meritorious students from economically weaker sections.", requirements: ["Above 80th percentile in Class 12", "Family income below Rs 8 LPA", "Pursuing a regular degree"], link: "https://scholarships.gov.in" },
];

export const institutes = [
  { name: "IIT Bombay", location: "Mumbai, Maharashtra", courses: ["B.Tech", "M.Tech", "PhD"], rank: "#1", type: "Engineering", career: "Engineering", about: "One of India's premier engineering institutions known for strong academics, research, and innovation.", website: "https://www.iitb.ac.in" },
  { name: "AIIMS Delhi", location: "New Delhi", courses: ["MBBS", "MD", "MS"], rank: "#1", type: "Medical", career: "Medical", about: "India's most recognised medical institute with top clinical training.", website: "https://www.aiims.edu" },
  { name: "IIM Ahmedabad", location: "Ahmedabad, Gujarat", courses: ["MBA", "PGPX"], rank: "#1", type: "Business", career: "Business", about: "A leading business school with world-class faculty and rigorous management training.", website: "https://www.iima.ac.in" },
  { name: "NID Ahmedabad", location: "Ahmedabad, Gujarat", courses: ["B.Des", "M.Des"], rank: "#1", type: "Design", career: "Design", about: "A top destination for students pursuing design and innovation-led product thinking.", website: "https://www.nid.edu" },
  { name: "BITS Pilani", location: "Pilani, Rajasthan", courses: ["B.E.", "M.E."], rank: "#4", type: "Engineering", career: "Engineering", about: "Known for flexible academics, entrepreneurship culture, and placements.", website: "https://www.bits-pilani.ac.in" },
  { name: "NLU Delhi", location: "New Delhi", courses: ["BA LLB", "LLM"], rank: "#1", type: "Law", career: "Law", about: "A leading law university with strong academic rigor and policy exposure.", website: "https://nludelhi.ac.in" },
];

export const entranceExams = [
  { id: "jee-main", name: "JEE Main", authority: "NTA", date: "April 2025", eligibility: "Class 12 pass (PCM)", type: "Central", category: "Engineering", mode: "Computer Based", duration: "3 Hours", subjects: "Physics, Chemistry, Mathematics", totalMarks: "300", frequency: "2 times/year", about: "Joint Entrance Examination for admission to NITs, IIITs, and other CFTIs.", examPattern: ["Paper 1: 75 MCQ + Numerical", "Negative marking: -1 for wrong MCQ", "No negative marking for numerical"], topColleges: ["NIT Trichy", "NIT Warangal", "NIT Surathkal", "IIIT Hyderabad"], website: "https://jeemain.nta.nic.in/" },
  { id: "neet-ug", name: "NEET UG", authority: "NTA", date: "May 2025", eligibility: "Class 12 pass (PCB)", type: "Central", category: "Medical", mode: "Pen and Paper", duration: "3 Hours 20 Minutes", subjects: "Physics, Chemistry, Botany, Zoology", totalMarks: "720", frequency: "1 time/year", about: "National Eligibility cum Entrance Test for medical programs across India.", examPattern: ["200 questions, 180 to be attempted", "4 marks for correct answer", "Negative marking: -1 for wrong answer"], topColleges: ["AIIMS Delhi", "JIPMER Puducherry", "MMC Chennai", "KGMU Lucknow"], website: "https://neet.nta.nic.in/" },
  { id: "clat", name: "CLAT", authority: "Consortium of NLUs", date: "December 2024", eligibility: "Class 12 pass", type: "Central", category: "Law", mode: "Offline", duration: "2 Hours", subjects: "English, Legal Reasoning, GK, Logic, Quantitative Techniques", totalMarks: "120", frequency: "1 time/year", about: "Common Law Admission Test for admissions in National Law Universities.", examPattern: ["120 passage-based MCQs", "Negative marking: -0.25", "Strong emphasis on reading comprehension"], topColleges: ["NLSIU Bengaluru", "NLU Delhi", "NALSAR Hyderabad", "WBNUJS Kolkata"], website: "https://consortiumofnlus.ac.in/" },
  { id: "cuet", name: "CUET", authority: "NTA", date: "May 2025", eligibility: "Class 12 pass", type: "Central", category: "General", mode: "Computer Based", duration: "Varies by subject", subjects: "Language, Domain Subjects, General Test", totalMarks: "Subject-wise", frequency: "1 time/year", about: "Common University Entrance Test for undergraduate admissions.", examPattern: ["Multiple subject combinations allowed", "MCQ-based test", "Choice depends on target university and course"], topColleges: ["Delhi University", "BHU", "JMI", "University of Hyderabad"], website: "https://cuet.nta.nic.in/" },
];

export const assessmentFeatures = ["30 module-wise questions", "Interest, personality, aptitude, and values analysis", "Guided step-by-step assessment flow", "Downloadable report summary", "One-year validity per plan"];
export const assessmentPolicies = ["Each subscription includes 1 psychometric test.", "Test validity lasts 1 year from purchase date.", "A new purchase is required for a retake.", "Study Abroad Access unlocks only the abroad module."];

export const masterClasses = [
  { title: "How to Choose the Right Engineering Branch", mentor: "Dr. Rajesh Kumar", duration: "15 min", views: 12400, career: "Engineering", videoType: "Career Videos", locked: false, url: "https://www.youtube.com/watch?v=H14bBuluwB8" },
  { title: "NEET 2025 - Complete Roadmap", mentor: "Dr. Sanjay Gupta", duration: "30 min", views: 28000, career: "Medical", videoType: "Expert Videos", locked: true, url: "https://www.youtube.com/watch?v=3QfYx4kQXKM" },
  { title: "Career in AI & Machine Learning", mentor: "Prof. Sneha Patel", duration: "22 min", views: 18500, career: "Technology", videoType: "Career Videos", locked: true, url: "https://www.youtube.com/watch?v=aircAruvnKk" },
  { title: "UX Design Career Path", mentor: "Ms. Ria Kapoor", duration: "15 min", views: 7800, career: "Design", videoType: "Career Videos", locked: false, url: "https://www.youtube.com/watch?v=Ovj4hFxko7c" },
  { title: "MBA vs Direct Job After Graduation", mentor: "Mr. Rohit Bansal", duration: "15 min", views: 9200, career: "Business", videoType: "Career Videos", locked: false, url: "https://www.youtube.com/watch?v=9JrRQ1oQWQk" },
  { title: "CAT Exam Strategy - Score 99+", mentor: "Prof. Nitin Sharma", duration: "28 min", views: 32000, career: "Business", videoType: "Expert Videos", locked: true, url: "https://www.youtube.com/watch?v=dwEKF6V36sU" },
];

export const studyAbroadCountries = [
  { name: "USA", flag: "USA", description: "Top universities, F-1 visa, strong STEM pathways.", detail: "Home to top-ranked universities and known for MS, MBA, and PhD programs.", tuition: "$20,000 - $55,000 / year", living: "$10,000 - $18,000 / year", visa: "F-1 Student Visa", intake: "Fall, Spring, Summer", workRights: "OPT up to 12 months, up to 36 months for STEM", topUniversities: ["MIT", "Stanford University", "Harvard University", "Caltech"], popularCourses: ["MS Computer Science", "MBA", "MS Data Science", "MS Electrical Engineering"], scholarships: ["Fulbright Scholarship", "Hubert Humphrey Fellowship", "Knight-Hennessy Scholars"], requirements: ["GRE or GMAT for select programs", "TOEFL or IELTS", "SOP and LORs", "Financial proof"] },
  { name: "United Kingdom", flag: "UK", description: "World-class education and one-year Masters programs.", detail: "Known for globally recognised universities and faster postgraduate timelines.", tuition: "GBP 10,000 - 38,000 / year", living: "GBP 9,000 - 12,000 / year", visa: "UK Student Visa", intake: "September, January", workRights: "20 hrs/week during term and 2-year Graduate Route", topUniversities: ["University of Oxford", "University of Cambridge", "Imperial College London", "UCL"], popularCourses: ["MSc Finance", "LLM", "MBA", "MSc Data Science"], scholarships: ["Chevening Scholarship", "Commonwealth Scholarship", "GREAT Scholarships"], requirements: ["IELTS or TOEFL", "Academic transcripts", "Personal statement", "References"] },
  { name: "Canada", flag: "CAN", description: "PR-friendly route with affordable postgraduate options.", detail: "Popular for student-friendly immigration pathways and strong public universities.", tuition: "CAD 15,000 - 35,000 / year", living: "CAD 10,000 - 15,000 / year", visa: "Study Permit", intake: "September, January, May", workRights: "20 hrs/week during study and PGWP up to 3 years", topUniversities: ["University of Toronto", "UBC", "McGill University", "University of Waterloo"], popularCourses: ["MS Computer Science", "MBA", "MEng", "MS Data Analytics"], scholarships: ["Vanier Canada Graduate Scholarship", "Lester B. Pearson Scholarship", "Ontario Graduate Scholarship"], requirements: ["IELTS or TOEFL", "SOP", "LORs", "Financial proof"] },
  { name: "Germany", flag: "GER", description: "Low-cost public education with strong engineering reputation.", detail: "Known for public universities with minimal tuition fees.", tuition: "EUR 250 - 500 / semester", living: "EUR 10,000 - 12,000 / year", visa: "German Student Visa", intake: "Winter and Summer", workRights: "120 full days or 240 half days/year", topUniversities: ["TU Munich", "RWTH Aachen", "Heidelberg University", "LMU Munich"], popularCourses: ["MS Mechanical Engineering", "MS Computer Science", "MS Automotive Engineering", "MBA"], scholarships: ["DAAD Scholarship", "Heinrich Boll Foundation", "Deutschlandstipendium"], requirements: ["IELTS or TestDaF", "APS Certificate", "Blocked account", "Motivation letter"] },
];

export const onboardingOptions = {
  studentClassOptions: ["Class 8", "Class 9", "Class 10", "Class 11", "Class 12", "Graduate", "Post Graduate", "Other"],
  streamOptions: ["Science", "Commerce", "Arts", "Other"],
  interestOptions: ["Science & Tech", "Problem Solving", "Research & Discovery", "Art & Literature", "Business", "Sports", "Creativity & Design", "Dance & Music", "Helping People", "Public Speaking"],
  clarityOptions: ["Clear on my goal, need the right path", "Choosing between a few options", "Confused between my choice and parents' expectations", "I keep changing my options", "I have limited awareness of options", "I have no idea what to do"],
  strengthOptions: ["Analytical Thinking", "Communication", "Creativity", "Leadership", "Problem-solving", "Teamwork", "Time Management", "Adaptability", "Critical Thinking", "Emotional Intelligence", "Technical Skills", "Decision Making"],
  priorityOptions: ["High Earning Potential", "Passion and Interest", "Work-Life Balance", "Job Security", "Making a Positive Impact", "Creative Freedom", "Intellectual Growth & Advancement"],
};

export const personalityQuestions = [
  { q: "When faced with a problem, I prefer to:", options: ["Analyze data systematically", "Brainstorm creative solutions", "Discuss with others", "Act quickly on instinct"] },
  { q: "In my free time, I enjoy:", options: ["Reading or researching", "Creating art or music", "Socializing with friends", "Physical activities or sports"] },
  { q: "I work best when:", options: ["I have a clear plan", "I can be spontaneous", "I collaborate with a team", "I work independently"] },
  { q: "I am most motivated by:", options: ["Achieving goals", "Expressing myself", "Helping others", "Learning new skills"] },
  { q: "My ideal workspace is:", options: ["Organized and quiet", "Colorful and inspiring", "Open and collaborative", "Flexible and mobile"] },
  { q: "When making decisions, I rely on:", options: ["Logic and facts", "Intuition and feelings", "Advice from others", "Past experiences"] },
];

export const personalityTypes = [
  { type: "The Analytical Thinker", desc: "You thrive in structured environments and enjoy solving complex problems.", careers: ["Engineering", "Data Science", "Finance", "Research"] },
  { type: "The Creative Visionary", desc: "You bring imagination and originality to everything you work on.", careers: ["Design", "Architecture", "Media", "Marketing"] },
  { type: "The Empathetic Helper", desc: "You naturally connect with people and do well in support-centered roles.", careers: ["Psychology", "Teaching", "Medicine", "HR"] },
  { type: "The Dynamic Explorer", desc: "You enjoy variety, energy, and fast-moving environments.", careers: ["Business", "Travel", "Sports", "Entrepreneurship"] },
];

export const quizCatalog = [
  { title: "Engineering Career Quiz", description: "Test your engineering knowledge", questions: 5, emoji: "ENG" },
  { title: "Medical Career Quiz", description: "Explore medical career paths", questions: 5, emoji: "MED" },
  { title: "Business Aptitude Quiz", description: "Assess your business acumen", questions: 5, emoji: "BIZ" },
  { title: "Technology Trends Quiz", description: "Stay updated with tech trends", questions: 5, emoji: "TECH" },
];

export const sampleQuizQuestions = [
  { q: "Which programming language is most used in AI?", options: ["Python", "Java", "C++", "Ruby"], correct: 0 },
  { q: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Program Unit"], correct: 1 },
  { q: "HTML is a programming language.", options: ["True", "False", "Sometimes", "Depends"], correct: 1 },
  { q: "Which company created React?", options: ["Google", "Microsoft", "Meta", "Amazon"], correct: 2 },
  { q: "RAM stands for?", options: ["Random Access Memory", "Read Access Memory", "Run Access Memory", "Random Assign Memory"], correct: 0 },
];

export const careerLibrary = {
  streams: [
    { name: "Science", desc: "Medical, Engineering & Research" },
    { name: "Commerce", desc: "Business, Finance & Accounting" },
    { name: "Arts & Humanities", desc: "Design, Media & Social Work" },
    { name: "Vocational", desc: "Hospitality, Fashion & More" },
    { name: "Neutral", desc: "Law, Education & Defence" },
  ],
  categories: {
    Science: ["Medical", "Engineering", "Pure Sciences", "Agriculture & Allied"],
    Commerce: ["Business Management", "Finance & Banking", "Accounting & Taxation", "Marketing & Advertising"],
    "Arts & Humanities": ["Design & Fine Arts", "Media & Journalism", "Literature & Languages", "Social Sciences"],
    Vocational: ["Hospitality & Tourism", "Fashion & Textile", "Agriculture & Dairy", "Automotive & Mechanical"],
    Neutral: ["Law & Legal Studies", "Education & Teaching", "Defence & Security", "Sports & Fitness"],
  },
  programs: {
    Medical: ["MBBS", "BDS (Dentistry)", "BAMS (Ayurveda)", "B.Pharm (Pharmacy)", "B.Sc Nursing", "BPT (Physiotherapy)"],
    Engineering: ["B.Tech / B.E.", "M.Tech", "Diploma Engineering", "B.Arch (Architecture)"],
    "Business Management": ["BBA", "MBA", "BMS", "Entrepreneurship"],
    "Finance & Banking": ["B.Com (Hons)", "CA (Chartered Accountant)", "CFA", "Banking & Insurance"],
    "Design & Fine Arts": ["B.Des", "B.F.A", "M.Des", "Animation & VFX"],
    "Law & Legal Studies": ["BA LLB (5 Year)", "LLB (3 Year)", "LLM", "Corporate Law"],
  },
  specializations: {
    MBBS: ["General Medicine", "Surgery"],
    "BDS (Dentistry)": ["Orthodontics", "Oral Surgery"],
    "BAMS (Ayurveda)": ["Panchakarma", "Kayachikitsa"],
    "B.Pharm (Pharmacy)": ["Clinical Pharmacy", "Pharmaceutical Research"],
    "B.Sc Nursing": ["Critical Care", "Community Health"],
    "BPT (Physiotherapy)": ["Orthopedic", "Neurological"],
  },
  details: {
    "General Medicine": {
      title: "General Medicine (MD)",
      overview: "General Medicine involves the diagnosis, treatment, and prevention of adult diseases.",
      path: ["10+2 (PCB)", "MBBS (5.5 years)", "Internship", "MD General Medicine", "Consultant / Professor"],
      education: "MBBS followed by MD in General Medicine",
      exams: ["NEET UG", "NEET PG", "AIIMS", "JIPMER"],
      jobs: ["General Physician", "Consultant", "Hospital Medical Officer", "Academic Professor"],
      salary: "Rs 8-25 LPA",
      institutes: ["AIIMS Delhi", "CMC Vellore", "JIPMER", "Maulana Azad Medical College"],
    },
    Surgery: {
      title: "General Surgery (MS)",
      overview: "General Surgery focuses on operative treatment for trauma and abdominal conditions.",
      path: ["10+2 (PCB)", "MBBS", "Internship", "MS General Surgery", "Senior Surgeon"],
      education: "MBBS + MS in General Surgery",
      exams: ["NEET UG", "NEET PG", "NEET SS"],
      jobs: ["General Surgeon", "Laparoscopic Surgeon", "Trauma Surgeon"],
      salary: "Rs 10-30 LPA",
      institutes: ["AIIMS Delhi", "PGIMER Chandigarh", "SGPGI Lucknow"],
    },
  },
};

export const quickPsychometricQuestions = [
  { q: "I enjoy working with numbers and data.", options: ["Strongly Agree", "Agree", "Neutral", "Disagree"] },
  { q: "I prefer creative tasks over analytical ones.", options: ["Strongly Agree", "Agree", "Neutral", "Disagree"] },
  { q: "I like helping and mentoring others.", options: ["Strongly Agree", "Agree", "Neutral", "Disagree"] },
  { q: "I am interested in how businesses operate.", options: ["Strongly Agree", "Agree", "Neutral", "Disagree"] },
  { q: "I enjoy learning about technology and gadgets.", options: ["Strongly Agree", "Agree", "Neutral", "Disagree"] },
];

export const moduleArtPresets = {
  "Career Library": {
    background: "linear-gradient(135deg, #f8f0eb 0%, #ead8cf 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#faf3ef"/>
              <stop offset="100%" stop-color="#ead8cf"/>
            </linearGradient>
          </defs>
          <rect width="600" height="320" rx="36" fill="url(#bg)"/>
          <circle cx="470" cy="90" r="58" fill="#ffffff" fill-opacity="0.42"/>
          <rect x="62" y="82" width="162" height="126" rx="18" fill="#b78667"/>
          <rect x="238" y="82" width="162" height="126" rx="18" fill="#d7b4a0"/>
          <rect x="150" y="120" width="162" height="126" rx="18" fill="#ffffff"/>
          <rect x="176" y="144" width="108" height="10" rx="5" fill="#cfb8ab"/>
          <rect x="176" y="166" width="85" height="10" rx="5" fill="#e2d3ca"/>
          <rect x="176" y="188" width="96" height="10" rx="5" fill="#efe5df"/>
        </svg>`),
  },
  Assessment: {
    background: "linear-gradient(135deg, #f8f0eb 0%, #e8d8d1 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#faf3ef"/>
              <stop offset="100%" stop-color="#e8d8d1"/>
            </linearGradient>
          </defs>
          <rect width="600" height="320" rx="36" fill="url(#bg)"/>
          <circle cx="165" cy="95" r="54" fill="#ffffff" fill-opacity="0.3"/>
          <rect x="110" y="66" width="210" height="188" rx="28" fill="#ffffff"/>
          <rect x="144" y="104" width="142" height="14" rx="7" fill="#d7c0b4"/>
          <rect x="144" y="138" width="112" height="14" rx="7" fill="#e5d4cb"/>
          <rect x="144" y="172" width="132" height="14" rx="7" fill="#f0e6e1"/>
          <path d="M378 216c32-72 74-108 126-108 17 0 35 5 52 15-10 63-46 111-108 142-24 12-52 22-86 28 0-32 5-58 16-77z" fill="#9a2119"/>
          <circle cx="468" cy="120" r="18" fill="#ffffff"/>
        </svg>`),
  },
  "Master Class": {
    background: "linear-gradient(135deg, #f7efe9 0%, #e6d5cb 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <rect width="600" height="320" rx="36" fill="#f7efe9"/>
          <rect x="88" y="58" width="424" height="204" rx="28" fill="#d7b7a8"/>
          <rect x="112" y="82" width="376" height="156" rx="18" fill="#f8ece7"/>
          <circle cx="196" cy="160" r="42" fill="#9a2119"/>
          <path d="M184 137l36 23-36 23z" fill="#ffffff"/>
          <rect x="274" y="126" width="146" height="12" rx="6" fill="#9f8170"/>
          <rect x="274" y="154" width="118" height="12" rx="6" fill="#9a2119"/>
          <rect x="274" y="182" width="134" height="12" rx="6" fill="#d7b7a8"/>
        </svg>`),
  },
  "Entrance Exam": {
    background: "linear-gradient(135deg, #f8f1ec 0%, #eaded7 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <rect width="600" height="320" rx="36" fill="#f8f1ec"/>
          <rect x="98" y="54" width="404" height="216" rx="28" fill="#ffffff"/>
          <rect x="134" y="94" width="182" height="18" rx="9" fill="#d7c7bf"/>
          <rect x="134" y="132" width="128" height="18" rx="9" fill="#eadfd8"/>
          <rect x="134" y="170" width="164" height="18" rx="9" fill="#f2ebe7"/>
          <circle cx="412" cy="120" r="32" fill="#9a2119"/>
          <path d="M397 121l11 11 22-28" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="368" y="172" width="88" height="54" rx="16" fill="#d7b7a8"/>
        </svg>`),
  },
  Institutes: {
    background: "linear-gradient(135deg, #f8f0eb 0%, #e8d6cf 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <rect width="600" height="320" rx="36" fill="#f8f0eb"/>
          <path d="M96 228h408" stroke="#dcc7be" stroke-width="8" stroke-linecap="round"/>
          <path d="M122 228V140l86-46 86 46v88M294 228V110l88-52 88 52v118" fill="#ffffff"/>
          <path d="M122 140l86-46 86 46M294 110l88-52 88 52" fill="none" stroke="#9a2119" stroke-width="10" stroke-linejoin="round"/>
          <rect x="176" y="162" width="30" height="66" rx="10" fill="#dcc7be"/>
          <rect x="228" y="162" width="30" height="66" rx="10" fill="#dcc7be"/>
          <rect x="348" y="142" width="34" height="86" rx="10" fill="#dcc7be"/>
          <rect x="404" y="142" width="34" height="86" rx="10" fill="#dcc7be"/>
        </svg>`),
  },
  "Book Mentor": {
    background: "linear-gradient(135deg, #f8f1ec 0%, #e6d7cf 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <rect width="600" height="320" rx="36" fill="#f8f1ec"/>
          <circle cx="214" cy="126" r="54" fill="#73584a"/>
          <circle cx="214" cy="126" r="34" fill="#e8cdbd"/>
          <rect x="154" y="186" width="120" height="64" rx="28" fill="#c59f8b"/>
          <rect x="318" y="86" width="166" height="112" rx="24" fill="#ffffff"/>
          <rect x="342" y="114" width="116" height="12" rx="6" fill="#dcc6ba"/>
          <rect x="342" y="144" width="90" height="12" rx="6" fill="#ede0d8"/>
          <rect x="342" y="174" width="104" height="12" rx="6" fill="#dcc6ba"/>
          <path d="M326 232c26-20 52-30 78-30s52 10 78 30" fill="none" stroke="#9a2119" stroke-opacity="0.55" stroke-width="18" stroke-linecap="round"/>
        </svg>`),
  },
  Scholarships: {
    background: "linear-gradient(135deg, #f8f0eb 0%, #e6d7cd 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <rect width="600" height="320" rx="36" fill="#f8f0eb"/>
          <circle cx="182" cy="106" r="42" fill="#c59f8b"/>
          <path d="M182 74l10 21 24 3-17 16 4 23-21-11-21 11 4-23-17-16 24-3z" fill="#ffffff"/>
          <rect x="122" y="174" width="120" height="64" rx="18" fill="#9a2119"/>
          <rect x="288" y="82" width="184" height="144" rx="28" fill="#ffffff"/>
          <rect x="320" y="118" width="118" height="12" rx="6" fill="#dcc6ba"/>
          <rect x="320" y="150" width="92" height="12" rx="6" fill="#ede2db"/>
          <rect x="320" y="182" width="132" height="12" rx="6" fill="#dcc6ba"/>
        </svg>`),
  },
  Quiz: {
    background: "linear-gradient(135deg, #f8f0eb 0%, #e7d7cf 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <rect width="600" height="320" rx="36" fill="#f8f0eb"/>
          <circle cx="172" cy="160" r="68" fill="#9a2119"/>
          <text x="172" y="176" text-anchor="middle" font-size="72" font-family="Arial, sans-serif" font-weight="700" fill="#ffffff">?</text>
          <rect x="286" y="88" width="194" height="144" rx="28" fill="#ffffff"/>
          <rect x="320" y="120" width="126" height="12" rx="6" fill="#dcc9c0"/>
          <rect x="320" y="152" width="102" height="12" rx="6" fill="#eee3dc"/>
          <rect x="320" y="184" width="138" height="12" rx="6" fill="#dcc9c0"/>
        </svg>`),
  },
  "Study Abroad": {
    background: "linear-gradient(135deg, #f8f0eb 0%, #e8d7cf 100%)",
    accent: "#9a2119",
    image:
      "data:image/svg+xml;utf8," +
      encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 320">
          <rect width="600" height="320" rx="36" fill="#f8f0eb"/>
          <circle cx="188" cy="154" r="80" fill="#9a2119"/>
          <path d="M188 94c22 0 42 9 56 23-18 8-36 12-56 12s-38-4-56-12c14-14 34-23 56-23zm-74 44c16 9 34 15 52 18-3 12-4 25-4 38s1 26 4 38c-18 3-36 9-52 18-12-17-18-36-18-56s6-39 18-56zm148 0c12 17 18 36 18 56s-6 39-18 56c-16-9-34-15-52-18 3-12 4-25 4-38s-1-26-4-38c18-3 36-9 52-18z" fill="#ffffff" fill-opacity="0.92"/>
          <path d="M318 214l54-92 54 92" fill="#caa38d"/>
          <path d="M430 214l40-68 40 68" fill="#e1c7b8"/>
          <path d="M340 214h170" stroke="#d9c8c0" stroke-width="10" stroke-linecap="round"/>
        </svg>`),
  },
};
