import React, { useState } from 'react';
import { Language, User, Project, Plot, Booking, InvestmentRecord, GalleryItem, MediaStatus } from './types';
import { INITIAL_PROJECTS } from './data/mockData';
import { INITIAL_GALLERY_ITEMS } from './data/mockGalleryData';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Components
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { CompanyOverview } from './components/CompanyOverview';
import { FeaturedProjects } from './components/FeaturedProjects';
import { PlotMatrixModal } from './components/PlotMatrixModal';
import { PlotBookingModal } from './components/PlotBookingModal';
import { InvestorModule } from './components/InvestorModule';
import { CommissionModule } from './components/CommissionModule';
import { CareerAgentRegistration } from './components/CareerAgentRegistration';
import { MediaGallery } from './components/MediaGallery';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ContactSection } from './components/ContactSection';
import { FAQSection } from './components/FAQSection';
import { BlogSection } from './components/BlogSection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { LegalModal } from './components/LegalModal';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { Footer } from './components/Footer';

function MainAppContent() {
  const { language, setLanguage } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>('home');

  // Application Data States
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [userBookings, setUserBookings] = useState<Booking[]>([
    {
      id: "VPM-BK-1001",
      customerName: "Rajesh Sharma",
      customerPhone: "9876543210",
      customerEmail: "rajesh@example.com",
      projectId: "proj-001",
      projectName: "Milestone City Prayagraj",
      plotNo: "A-12",
      plotSizeSqft: 1200,
      ratePerSqft: 1250,
      totalPrice: 1500000,
      bookingAmountPaid: 10000,
      paymentMethod: "Razorpay / UPI Direct",
      paymentId: "PAY_VPM_N9X2K1L8",
      bookingDate: "2026-07-28",
      status: "Confirmed",
      installmentPlan: "12 Months EMI"
    }
  ]);

  const [userInvestments, setUserInvestments] = useState<InvestmentRecord[]>([
    {
      id: "VPM-INV-5001",
      investorName: "Sanjay Gupta",
      phone: "9988776655",
      email: "sanjay@example.com",
      ratePerSqft: 1450,
      roiPercentage: 22.5,
      sqftInvested: 2000,
      totalInvestedAmount: 2900000,
      basePlotCost: 2000000,
      estimatedRoiPayout: 652500,
      investmentDate: "2026-06-15",
      status: "Active"
    }
  ]);

  // Gallery Showcase State
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);

  const handleAddGalleryItem = (item: Partial<GalleryItem>) => {
    setGalleryItems(prev => [item as GalleryItem, ...prev]);
  };

  const handleUpdateGalleryStatus = (id: string, status: MediaStatus) => {
    setGalleryItems(prev => prev.map(item => item.id === id ? { ...item, status } : item));
  };

  const handleDeleteGalleryItem = (id: string) => {
    setGalleryItems(prev => prev.filter(item => item.id !== id));
  };

  const handleToggleGalleryLike = (id: string) => {
    setGalleryItems(prev => prev.map(item => {
      if (item.id === id) {
        const userId = currentUser?.id || 'guest';
        const hasLiked = item.likedBy?.includes(userId);
        const updatedLikedBy = hasLiked
          ? item.likedBy.filter(uid => uid !== userId)
          : [...(item.likedBy || []), userId];
        return {
          ...item,
          likes: hasLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
          likedBy: updatedLikedBy
        };
      }
      return item;
    }));
  };

  const handleAddGalleryComment = (id: string, commentText: string) => {
    setGalleryItems(prev => prev.map(item => {
      if (item.id === id) {
        const newComment = {
          id: "c-" + Math.floor(1000 + Math.random() * 9000),
          userName: currentUser?.name || 'Community Member',
          userRole: currentUser?.role || 'Buyer',
          comment: commentText,
          createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
        return {
          ...item,
          comments: [...item.comments, newComment]
        };
      }
      return item;
    }));
  };

  // Modal & Popup States
  const [matrixProject, setMatrixProject] = useState<Project | null>(null);
  const [bookingProject, setBookingProject] = useState<Project | null>(null);
  const [bookingPlot, setBookingPlot] = useState<Plot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | 'refund' | 'disclaimer' | null>(null);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'plot-booking') {
      setShowBookingModal(true);
    } else {
      setTimeout(() => {
        const sectionMap: Record<string, string> = {
          'home': 'home-section',
          'about': 'about-section',
          'projects': 'projects-section',
          'investment': 'investment-section',
          'commission': 'commission-section',
          'career': 'career-section',
          'gallery': 'gallery-section',
          'faq': 'faq-section',
          'contact': 'contact-section',
        };
        const elementId = sectionMap[section];
        const el = elementId ? document.getElementById(elementId) : null;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    }
  };

  const handleSelectPlotForBooking = (project: Project, plot?: Plot) => {
    setBookingProject(project);
    setBookingPlot(plot || null);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = (newBooking: Booking) => {
    setUserBookings(prev => [newBooking, ...prev]);
    
    // Update local plot availability
    setProjects(prevProjects =>
      prevProjects.map(proj => {
        if (proj.id === newBooking.projectId) {
          const updatedGrid = proj.plotsGrid.map(plot => {
            if (plot.plotNo === newBooking.plotNo) {
              return { ...plot, status: 'booked' as const };
            }
            return plot;
          });
          return {
            ...proj,
            availablePlots: Math.max(0, proj.availablePlots - 1),
            plotsGrid: updatedGrid
          };
        }
        return proj;
      })
    );
  };

  const handleAddInvestment = (record: Partial<InvestmentRecord>) => {
    const newInv: InvestmentRecord = {
      id: "VPM-INV-" + Math.floor(5000 + Math.random() * 9000),
      investorName: record.investorName || "Valued Investor",
      phone: record.phone || "9988776655",
      email: record.email || "",
      ratePerSqft: record.ratePerSqft || 1450,
      roiPercentage: record.roiPercentage || 22.5,
      sqftInvested: record.sqftInvested || 2000,
      totalInvestedAmount: record.totalInvestedAmount || 2900000,
      basePlotCost: record.basePlotCost || 2000000,
      estimatedRoiPayout: record.estimatedRoiPayout || 652500,
      investmentDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    };
    setUserInvestments(prev => [newInv, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        currentLang={language}
        onLanguageChange={setLanguage}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        currentUserRole={currentUser?.role || null}
        currentUserName={currentUser?.name || null}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={() => {
          setCurrentUser(null);
          setActiveSection('home');
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {activeSection === 'dashboard' && (
          <UserDashboard
            currentUser={currentUser}
            userBookings={userBookings}
            userInvestments={userInvestments}
            onLogout={() => {
              setCurrentUser(null);
              setActiveSection('home');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {activeSection === 'admin-dashboard' && (
          <AdminDashboard
            projects={projects}
            bookings={userBookings}
            investments={userInvestments}
            onUpdateProject={setProjects}
            onNavigate={handleNavigate}
          />
        )}

        {activeSection !== 'dashboard' && activeSection !== 'admin-dashboard' && (
          <>
            {/* Hero Section */}
            <HeroSection currentLang={language} onNavigate={handleNavigate} currentUser={currentUser} />

            {/* About Company & Vision */}
            <CompanyOverview currentLang={language} onNavigate={handleNavigate} />

            {/* Featured Projects & Plot System */}
            <FeaturedProjects
              currentLang={language}
              onSelectPlotForBooking={handleSelectPlotForBooking}
              onOpenPlotMatrix={(proj) => setMatrixProject(proj)}
              onBookSiteVisit={(proj) => {
                alert(`Site visit requested for ${proj.name}. Director Prabhat Gautam's desk will call you to confirm transport!`);
              }}
            />

            {/* Risk-Free Investor Module */}
            <InvestorModule
              currentLang={language}
              onNavigate={handleNavigate}
              onSubmitInvestment={handleAddInvestment}
            />

            {/* Commission & MLM Team Bonus Module */}
            <CommissionModule currentLang={language} onNavigate={handleNavigate} />

            {/* Career & Agent Registration */}
            <CareerAgentRegistration
              currentLang={language}
              onRegisterAgentSuccess={(agent) => {
                setCurrentUser(agent);
                setActiveSection('dashboard');
              }}
              onNavigate={handleNavigate}
            />

            {/* Premium Media Gallery & Community Showcase */}
            <MediaGallery
              items={galleryItems}
              currentUserRole={currentUser?.role || null}
              currentUserName={currentUser?.name || null}
              onAddItem={handleAddGalleryItem}
              onUpdateItemStatus={handleUpdateGalleryStatus}
              onDeleteItem={handleDeleteGalleryItem}
              onToggleLike={handleToggleGalleryLike}
              onAddComment={handleAddGalleryComment}
              onOpenAuth={() => setShowAuthModal(true)}
            />

            {/* Testimonials */}
            <TestimonialsSection />

            {/* Blog & Market News */}
            <BlogSection />

            {/* FAQ Accordion */}
            <FAQSection currentLang={language} />

            {/* Direct Contact Section */}
            <ContactSection currentLang={language} />
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        currentLang={language}
        onNavigate={handleNavigate}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      {/* Floating WhatsApp Chat Widget */}
      <WhatsAppWidget />

      {/* Plot Matrix Modal View */}
      {matrixProject && (
        <PlotMatrixModal
          project={matrixProject}
          onClose={() => setMatrixProject(null)}
          onProceedBooking={(proj, plot) => {
            setMatrixProject(null);
            handleSelectPlotForBooking(proj, plot);
          }}
        />
      )}

      {/* Plot Booking ₹10,000 Modal */}
      {showBookingModal && (
        <PlotBookingModal
          initialProject={bookingProject}
          initialPlot={bookingPlot}
          allProjects={projects}
          onClose={() => setShowBookingModal(false)}
          onBookingSuccess={handleBookingSuccess}
          onGoToDashboard={() => {
            setShowBookingModal(false);
            setActiveSection('dashboard');
          }}
        />
      )}

      {/* Login / Signup Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'admin') {
              setActiveSection('admin-dashboard');
            } else {
              setActiveSection('dashboard');
            }
          }}
        />
      )}

      {/* Legal Information Modal */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MainAppContent />
    </LanguageProvider>
  );
}
