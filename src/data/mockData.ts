import { Project, BlogPost, Testimonial, TeamMember } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: "proj-001",
    name: "Milestone City Prayagraj",
    location: "New Jhunsi, Near GT Road Highway",
    city: "Prayagraj, Uttar Pradesh",
    address: "GT Road Extension, Jhunsi, Prayagraj - 211019",
    tagline: "Ultra-Modern Gated Township with Commercial & Residential Plotting",
    description: "Milestone City is our flagship township project strategically positioned in New Jhunsi, Prayagraj. Spread over 45 acres of fertile, elevated land with 40ft wide main roads, electricity transformers, drainage system, and 24/7 security gate.",
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80"
    ],
    totalPlots: 120,
    availablePlots: 48,
    plotSizes: ["1000 sq.ft", "1200 sq.ft", "1500 sq.ft", "2000 sq.ft"],
    priceRange: "₹1,000 - ₹1,450 / sq.ft",
    minPricePerSqft: 1000,
    reraNumber: "UPRERAPRJ994821",
    mapEmbedUrl: "https://maps.google.com/maps?q=Jhunsi+Prayagraj&t=&z=13&ie=UTF8&iwloc=&output=embed",
    latitude: 25.4358,
    longitude: 81.8983,
    brochureUrl: "#brochure-download",
    features: [
      "40 ft. & 30 ft. Blacktop Wide Roads",
      "Underground Drainage & Sewerage Lines",
      "Dedicated Electricity Substation & Street Lights",
      "Parks, Children Play Area & Temple",
      "Gated Community with 24x7 Guard Security",
      "100% Clear Title & Registry Ready Land"
    ],
    isFeatured: true,
    plotsGrid: [
      { plotNo: "A-01", sizeSqft: 1200, dimensions: "30 x 40 ft", ratePerSqft: 1250, totalPrice: 1500000, facing: "East", status: "booked", category: "Residential" },
      { plotNo: "A-02", sizeSqft: 1200, dimensions: "30 x 40 ft", ratePerSqft: 1250, totalPrice: 1500000, facing: "East", status: "available", category: "Residential" },
      { plotNo: "A-03", sizeSqft: 1500, dimensions: "30 x 50 ft", ratePerSqft: 1250, totalPrice: 1875000, facing: "East", status: "available", category: "Residential" },
      { plotNo: "A-04", sizeSqft: 1500, dimensions: "30 x 50 ft", ratePerSqft: 1350, totalPrice: 2025000, facing: "Corner", status: "investor_locked", category: "Corner Premium" },
      { plotNo: "B-01", sizeSqft: 1000, dimensions: "25 x 40 ft", ratePerSqft: 1000, totalPrice: 1000000, facing: "North", status: "available", category: "Residential" },
      { plotNo: "B-02", sizeSqft: 1000, dimensions: "25 x 40 ft", ratePerSqft: 1000, totalPrice: 1000000, facing: "North", status: "available", category: "Residential" },
      { plotNo: "B-03", sizeSqft: 1000, dimensions: "25 x 40 ft", ratePerSqft: 1050, totalPrice: 1050000, facing: "North", status: "booked", category: "Residential" },
      { plotNo: "B-04", sizeSqft: 2000, dimensions: "40 x 50 ft", ratePerSqft: 1450, totalPrice: 2900000, facing: "East", status: "available", category: "Commercial" },
      { plotNo: "C-01", sizeSqft: 1200, dimensions: "30 x 40 ft", ratePerSqft: 1120, totalPrice: 1344000, facing: "West", status: "available", category: "Residential" },
      { plotNo: "C-02", sizeSqft: 1200, dimensions: "30 x 40 ft", ratePerSqft: 1120, totalPrice: 1344000, facing: "West", status: "investor_locked", category: "Residential" },
      { plotNo: "C-03", sizeSqft: 1500, dimensions: "30 x 50 ft", ratePerSqft: 1210, totalPrice: 1815000, facing: "South", status: "available", category: "Residential" },
      { plotNo: "C-04", sizeSqft: 1800, dimensions: "30 x 60 ft", ratePerSqft: 1320, totalPrice: 2376000, facing: "East", status: "available", category: "Commercial" }
    ]
  },
  {
    id: "proj-002",
    name: "Vigya Paradise Jhunsi",
    location: "4/199 EWS AVC New Jhunsi Area",
    city: "Prayagraj, Uttar Pradesh",
    address: "Near Shastri Bridge Link Road, New Jhunsi, Prayagraj",
    tagline: "Premium Residential & Commercial Investment Destination",
    description: "Vigya Paradise is located in the rapidly expanding prime zone of New Jhunsi near Shastri Bridge connecting directly to Civil Lines and Sangam area. Ideal for immediate house construction as well as high-yield investment.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
    ],
    totalPlots: 85,
    availablePlots: 32,
    plotSizes: ["1000 sq.ft", "1250 sq.ft", "1600 sq.ft", "2400 sq.ft"],
    priceRange: "₹1,050 - ₹1,770 / sq.ft",
    minPricePerSqft: 1050,
    reraNumber: "UPRERAPRJ882194",
    mapEmbedUrl: "https://maps.google.com/maps?q=Prayagraj+Jhunsi&t=&z=13&ie=UTF8&iwloc=&output=embed",
    latitude: 25.432,
    longitude: 81.891,
    brochureUrl: "#brochure-download",
    features: [
      "Adjacent to Proposed Metro Hub & Ring Road",
      "Ready Possession with Immediate Dakhil Kharij",
      "Solar Powered Street Lighting Infrastructure",
      "Clubhouse, Gym & Swimming Pool Layout",
      "High Return Investor Buyback Guarantee Available"
    ],
    isFeatured: true,
    plotsGrid: [
      { plotNo: "VP-101", sizeSqft: 1000, dimensions: "25 x 40 ft", ratePerSqft: 1050, totalPrice: 1050000, facing: "North", status: "available", category: "Residential" },
      { plotNo: "VP-102", sizeSqft: 1250, dimensions: "25 x 50 ft", ratePerSqft: 1120, totalPrice: 1400000, facing: "East", status: "booked", category: "Residential" },
      { plotNo: "VP-103", sizeSqft: 1600, dimensions: "40 x 40 ft", ratePerSqft: 1450, totalPrice: 2320000, facing: "Corner", status: "available", category: "Corner Premium" },
      { plotNo: "VP-104", sizeSqft: 2400, dimensions: "40 x 60 ft", ratePerSqft: 1770, totalPrice: 4248000, facing: "East", status: "available", category: "Commercial" }
    ]
  },
  {
    id: "proj-003",
    name: "Tula Ki Baag",
    location: "Jhunsi",
    city: "Prayagraj, Uttar Pradesh",
    address: "Mirzapur Highway Corridor, Naini, Prayagraj - 211008",
    tagline: "Affordable Plotting & High Appreciation Smart Zone",
    description: "Located near the industrial expansion hub of Naini and SHUATS University campus. Excellent connectivity via Yamuna Bridge with high expected plot price appreciation in coming years.",
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"
    ],
    totalPlots: 95,
    availablePlots: 51,
    plotSizes: ["800 sq.ft", "1000 sq.ft", "1200 sq.ft"],
    priceRange: "₹1,000 - ₹1,320 / sq.ft",
    minPricePerSqft: 1000,
    reraNumber: "UPRERAPRJ771920",
    mapEmbedUrl: "https://maps.google.com/maps?q=Naini+Prayagraj&t=&z=13&ie=UTF8&iwloc=&output=embed",
    latitude: 25.405,
    longitude: 81.862,
    brochureUrl: "#brochure-download",
    features: [
      "Very Close to Engineering Colleges & Universities",
      "25 ft. Wide Internal Roads",
      "Low Initial Booking @ ₹10,000",
      "Flexible Easy EMI Options Available"
    ],
    isFeatured: true,
    plotsGrid: [
      { plotNo: "PR-01", sizeSqft: 800, dimensions: "20 x 40 ft", ratePerSqft: 1000, totalPrice: 800000, facing: "North", status: "available", category: "Residential" },
      { plotNo: "PR-02", sizeSqft: 1000, dimensions: "25 x 40 ft", ratePerSqft: 1120, totalPrice: 1120000, facing: "East", status: "available", category: "Residential" },
      { plotNo: "PR-03", sizeSqft: 1200, dimensions: "30 x 40 ft", ratePerSqft: 1320, totalPrice: 1584000, facing: "West", status: "investor_locked", category: "Commercial" }
    ]
  },
  {
    id: "proj-004",
    name: "Milestone Green Valley Phaphamau",
    location: "Ganga Expressway Belt, Phaphamau",
    city: "Prayagraj, Uttar Pradesh",
    address: "Lucknow Highway Extension, Phaphamau, Prayagraj",
    tagline: "Eco-Friendly Scenic River View Plots with Luxury Amenities",
    description: "Milestone Green Valley offers peaceful, pollution-free living along the Ganga Expressway growth corridor in Phaphamau. Highly sought after by doctors, professors, and retired officers.",
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80"
    ],
    totalPlots: 110,
    availablePlots: 60,
    plotSizes: ["1200 sq.ft", "1500 sq.ft", "2150 sq.ft"],
    priceRange: "₹1,210 - ₹2,150 / sq.ft",
    minPricePerSqft: 1210,
    reraNumber: "UPRERAPRJ661922",
    mapEmbedUrl: "https://maps.google.com/maps?q=Phaphamau+Prayagraj&t=&z=13&ie=UTF8&iwloc=&output=embed",
    latitude: 25.531,
    longitude: 81.859,
    brochureUrl: "#brochure-download",
    features: [
      "15 Mins Drive to Central Railway Junction",
      "Lush Green Central Park & Walking Track",
      "Guaranteed High ROI Investor Option @ 32%"
    ],
    isFeatured: false,
    plotsGrid: [
      { plotNo: "GV-01", sizeSqft: 1200, dimensions: "30 x 40 ft", ratePerSqft: 1210, totalPrice: 1452000, facing: "East", status: "available", category: "Residential" },
      { plotNo: "GV-02", sizeSqft: 2150, dimensions: "43 x 50 ft", ratePerSqft: 2150, totalPrice: 4622500, facing: "Corner", status: "available", category: "Corner Premium" }
    ]
  }
];

export const MOCK_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Why New Jhunsi in Prayagraj is the Top Real Estate Investment Destination in 2026",
    excerpt: "Discover how major infrastructural projects like the Ganga Expressway expansion and Shastri bridge links are skyrocketing property values in Jhunsi.",
    category: "Market Trends",
    date: "July 24, 2026",
    author: "Prabhat Gautam",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80",
    readTime: "5 min read"
  },
  {
    id: "blog-2",
    title: "How to Earn up to 15.5% Free Plot Scheme & 8% Agent Commissions Capped by VPM Transparency",
    excerpt: "Understand Vigya Paurush Milestone's progressive plot slab structure designed to reward loyal property clients and dedicated sales agents.",
    category: "Commission & Earnings",
    date: "July 15, 2026",
    author: "VPM Advisory Desk",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    readTime: "4 min read"
  },
  {
    id: "blog-3",
    title: "Understanding Free Plot Scheme Plans: How Capped ROI Payouts Protect Your Capital",
    excerpt: "A deep dive into VPM's investor slabs starting at ₹1050/sqft up to ₹2150/sqft, providing guaranteed returns safely backed by prime plot assets.",
    category: "Investment Strategy",
    date: "June 29, 2026",
    author: "Prabhat Gautam",
    image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    readTime: "6 min read"
  }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Dr. Ramesh Chandra Mishra",
    role: "Free Plot Scheme Investor",
    location: "Civil Lines, Prayagraj",
    quote: "I booked a 1500 sq.ft plot in Milestone City Jhunsi with just ₹10,000 booking fee. The transparency in Dakhil Kharij and clear legal documents handled by Mr. Prabhat Gautam was unmatched!",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "test-2",
    name: "Ratan Lal Viswakarma",
    role: "Senior Real Estate Agent",
    location: "Phaphamau, UP",
    quote: "Vigya Paurush Milestone offers the cleanest commission payout cycle. The 8% agent commission starting slab plus multi-tier team bonus has boosted my monthly income significantly.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
  },
  {
    id: "test-3",
    name: "Vikas Agarwal",
    role: "Investor",
    location: "Kanpur / Prayagraj",
    quote: "I invested in 3000 sq.ft at ₹1450/sqft under VPM's Free Plot Scheme plan. Receiving 22.5% ROI with land collateral peace of mind makes this the safest real estate growth model.",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
  }
];

export const MOCK_TEAM_TREE: TeamMember[] = [
  { id: "TM-001", name: "Prabhat Gautam", role: "Director / Leader", phone: "7275300974", totalSales: 45, commissionEarned: 1850000, joinedDate: "2024-01-10", sponsorId: "DIRECT", downlineCount: 28 },
  { id: "TM-002", name: "Anand Kumar Singh", role: "Mentor Level (4.2%)", phone: "9415001122", totalSales: 18, commissionEarned: 620000, joinedDate: "2024-05-12", sponsorId: "TM-001", downlineCount: 12 },
  { id: "TM-003", name: "Priya Tripathy", role: "Salesman Level (3.5%)", phone: "9839112233", totalSales: 8, commissionEarned: 240000, joinedDate: "2025-02-18", sponsorId: "TM-002", downlineCount: 5 },
  { id: "TM-004", name: "Suresh Chaurasia", role: "Agent Level (3.0%)", phone: "9450998877", totalSales: 3, commissionEarned: 95000, joinedDate: "2025-09-01", sponsorId: "TM-003", downlineCount: 2 }
];
