import React, { useState } from 'react';
import { User, Booking, InvestmentRecord, TeamMember } from '../types';
import { MOCK_TEAM_TREE } from '../data/mockData';
import { User as UserIcon, ShieldCheck, CreditCard, TrendingUp, Users, FileText, Download, Printer, Copy, Award, CheckCircle2, ChevronRight, ChevronDown, LogOut, X, Loader2, Camera, Upload, XCircle, GitFork, UserPlus, Search, Phone, Share2, MapPin, Grid, FileSpreadsheet, Eye, Layers, Compass, FileCheck, UserCheck, Receipt, Building2, Wallet, ArrowDownLeft, ArrowUpRight, PieChart, BarChart3, CloudUpload } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatINR } from '../utils/calculators';
import { MediaUploadManager } from './MediaUploadManager';
import { CustomerPaymentHistory } from './CustomerPaymentHistory';

interface UserDashboardProps {
  currentUser: User | null;
  userBookings: Booking[];
  userInvestments: InvestmentRecord[];
  onLogout: () => void;
  onNavigate: (section: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  userBookings,
  userInvestments,
  onLogout,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'investments' | 'commissions' | 'team' | 'docs' | 'payments' | 'emi' | 'financial' | 'media'>('profile');
  const [financialTimeframe, setFinancialTimeframe] = useState<'monthly' | 'quarterly' | 'sixMonthly' | 'annually'>('monthly');
  const [copiedRef, setCopiedRef] = useState(false);
  const [showICardModal, setShowICardModal] = useState(false);
  const [isDownloadingICard, setIsDownloadingICard] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(currentUser?.avatarUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // EMI Interactive Payment States
  const [paidEmiNumbers, setPaidEmiNumbers] = useState<number[]>([1, 2]);
  const [showEmiModal, setShowEmiModal] = useState(false);
  const [selectedEmi, setSelectedEmi] = useState<{ number: number; amount: number; dueDate: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingEmi, setIsProcessingEmi] = useState(false);
  const [emiSuccess, setEmiSuccess] = useState<{ txnId: string; date: string; amount: number; emiNum: number } | null>(null);
  const [emiTxnIdInput, setEmiTxnIdInput] = useState('');
  const [emiTxnError, setEmiTxnError] = useState('');

  const handleOpenEmiModal = (emiNum: number, amount: number, dueDate: string) => {
    setSelectedEmi({ number: emiNum, amount, dueDate });
    setEmiSuccess(null);
    setPaymentMethod('upi');
    setEmiTxnIdInput('');
    setEmiTxnError('');
    setShowEmiModal(true);
  };

  const handleProcessEmiPayment = () => {
    const cleanDigits = emiTxnIdInput.trim().replace(/\D/g, '');
    if (cleanDigits.length !== 12) {
      setEmiTxnError('Payment Failed! Please enter a valid 12-digit Transaction ID / UTR number.');
      return;
    }

    setEmiTxnError('');
    setIsProcessingEmi(true);
    setTimeout(() => {
      setIsProcessingEmi(false);
      const todayDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      if (selectedEmi) {
        setPaidEmiNumbers((prev) => Array.from(new Set([...prev, selectedEmi.number])));
        setEmiSuccess({
          txnId: `TXN-${cleanDigits}`,
          date: todayDate,
          amount: selectedEmi.amount,
          emiNum: selectedEmi.number
        });
      }
    }, 1200);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUserPhoto(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Team Tree Network States
  const [teamViewMode, setTeamViewMode] = useState<'horizontal' | 'tree' | 'list'>('horizontal');
  const [collapsedTreeNodes, setCollapsedTreeNodes] = useState<Record<string, boolean>>({});
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [selectedMemberModal, setSelectedMemberModal] = useState<any | null>(null);
  const [previewDocModal, setPreviewDocModal] = useState<{ type: 'khatauni' | 'map' | 'plotLayout'; title: string; subtitle: string } | null>(null);

  const [uploadedDocs, setUploadedDocs] = useState<Record<'khatauni' | 'map' | 'plotLayout', { name: string; url: string; size: string; date: string; isImage: boolean } | null>>({
    khatauni: null,
    map: null,
    plotLayout: null,
  });

  const handleDocFileUpload = (type: 'khatauni' | 'map' | 'plotLayout', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const formattedSize = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
        : `${(file.size / 1024).toFixed(1)} KB`;

      setUploadedDocs((prev) => ({
        ...prev,
        [type]: {
          name: file.name,
          url: dataUrl,
          size: formattedSize,
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          isImage,
        },
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveUploadedDoc = (type: 'khatauni' | 'map' | 'plotLayout') => {
    setUploadedDocs((prev) => ({
      ...prev,
      [type]: null,
    }));
  };

  const toggleTreeNodeCollapse = (nodeId: string) => {
    setCollapsedTreeNodes((prev) => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const userName = currentUser?.name || 'Valued Partner';
  const role = currentUser?.role || 'buyer';
  const agentId = currentUser?.agentId || 'VPM-AG-101';
  const referralUrl = `${window.location.origin}?ref=${agentId}`;

  // Hierarchical Team Structure Data
  interface TreeMemberNode {
    id: string;
    name: string;
    role: string;
    phone: string;
    totalSales: number;
    commissionEarned: number;
    joinedDate: string;
    sponsorId: string;
    downlineCount: number;
    level: number;
    children?: TreeMemberNode[];
  }

  const hierarchicalTeamTree: TreeMemberNode[] = [
    {
      id: agentId,
      name: `${userName} (You)`,
      role: 'Team Director / Root Head',
      phone: currentUser?.phone || '9876543210',
      totalSales: 52,
      commissionEarned: 2450000,
      joinedDate: currentUser?.joinedDate || '2024-01-01',
      sponsorId: 'DIRECT',
      downlineCount: 28,
      level: 0,
      children: [
        {
          id: 'TM-001',
          name: 'Prabhat Gautam',
          role: 'Director / Top Leader (4.5%)',
          phone: '7275300974',
          totalSales: 45,
          commissionEarned: 1850000,
          joinedDate: '2024-01-10',
          sponsorId: agentId,
          downlineCount: 16,
          level: 1,
          children: [
            {
              id: 'TM-002',
              name: 'Anand Kumar Singh',
              role: 'Mentor Level (4.2%)',
              phone: '9415001122',
              totalSales: 18,
              commissionEarned: 620000,
              joinedDate: '2024-05-12',
              sponsorId: 'TM-001',
              downlineCount: 8,
              level: 2,
              children: [
                {
                  id: 'TM-003',
                  name: 'Priya Tripathy',
                  role: 'Salesman Level (3.5%)',
                  phone: '9839112233',
                  totalSales: 8,
                  commissionEarned: 240000,
                  joinedDate: '2025-02-18',
                  sponsorId: 'TM-002',
                  downlineCount: 3,
                  level: 3,
                  children: [
                    {
                      id: 'TM-004',
                      name: 'Suresh Chaurasia',
                      role: 'Agent Level (3.0%)',
                      phone: '9450998877',
                      totalSales: 3,
                      commissionEarned: 95000,
                      joinedDate: '2025-09-01',
                      sponsorId: 'TM-003',
                      downlineCount: 0,
                      level: 4,
                      children: []
                    },
                    {
                      id: 'TM-007',
                      name: 'Vikas Patel',
                      role: 'Agent Level (3.0%)',
                      phone: '9812345678',
                      totalSales: 2,
                      commissionEarned: 68000,
                      joinedDate: '2025-10-15',
                      sponsorId: 'TM-003',
                      downlineCount: 0,
                      level: 4,
                      children: []
                    }
                  ]
                },
                {
                  id: 'TM-006',
                  name: 'Rajesh Maurya',
                  role: 'Salesman Level (3.5%)',
                  phone: '9918273645',
                  totalSales: 5,
                  commissionEarned: 150000,
                  joinedDate: '2025-04-10',
                  sponsorId: 'TM-002',
                  downlineCount: 0,
                  level: 3,
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'TM-005',
          name: 'Sunita Yadav',
          role: 'Senior Agent (4.0%)',
          phone: '9711223344',
          totalSales: 12,
          commissionEarned: 410000,
          joinedDate: '2024-08-20',
          sponsorId: agentId,
          downlineCount: 4,
          level: 1,
          children: [
            {
              id: 'TM-008',
              name: 'Manoj Kumar',
              role: 'Agent Level (3.0%)',
              phone: '9654321098',
              totalSales: 4,
              commissionEarned: 120000,
              joinedDate: '2025-06-05',
              sponsorId: 'TM-005',
              downlineCount: 0,
              level: 2,
              children: []
            }
          ]
        }
      ]
    }
  ];

  const nextUnpaidEmi = [1, 2, 3, 4, 5, 6].find((num) => !paidEmiNumbers.includes(num)) || 3;
  const hasPendingEmi = !paidEmiNumbers.includes(3);
  const emiDateMap: Record<number, string> = { 3: '15 Aug 2026', 4: '15 Sep 2026', 5: '15 Oct 2026', 6: '15 Nov 2026' };

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 3000);
  };

  const drawFallbackICardCanvas = async (): Promise<HTMLCanvasElement> => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 920;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 920);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#1e293b');
    gradient.addColorStop(1, '#090d16');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(0, 0, 600, 920, 28);
    } else {
      ctx.rect(0, 0, 600, 920);
    }
    ctx.fill();

    // Gold outer border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Inner gold badge VPM
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(32, 32, 48, 48, 10);
    } else {
      ctx.rect(32, 32, 48, 48);
    }
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VPM', 56, 63);

    // Header Title
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('VIGYA PAURUSH MILESTONE PVT LTD', 92, 50);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText('Real Estate & Infrastructure | Prayagraj', 92, 70);

    // Line divider
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(32, 100);
    ctx.lineTo(568, 100);
    ctx.stroke();

    // User photo or initials
    let photoLoaded = false;
    if (userPhoto) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await Promise.race([
          new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = userPhoto;
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Image load timeout')), 1200))
        ]);
        ctx.save();
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(32, 120, 110, 110, 20);
        } else {
          ctx.rect(32, 120, 110, 110);
        }
        ctx.clip();
        ctx.drawImage(img, 32, 120, 110, 110);
        ctx.restore();

        ctx.strokeStyle = '#fcd34d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(32, 120, 110, 110, 20);
        } else {
          ctx.rect(32, 120, 110, 110);
        }
        ctx.stroke();
        photoLoaded = true;
      } catch {
        photoLoaded = false;
      }
    }

    if (!photoLoaded) {
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(32, 120, 110, 110, 20);
      } else {
        ctx.rect(32, 120, 110, 110);
      }
      ctx.fill();

      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(userName.substring(0, 2).toUpperCase(), 87, 188);
    }

    // User details text
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(userName, 160, 150);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 15px sans-serif';
    const displayRole = role === 'buyer' ? 'AUTHORISED BUYER / PARTNER' : `${role.toUpperCase()} AGENT`;
    ctx.fillText(displayRole, 160, 178);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText(`ID NO: `, 160, 205);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText(agentId, 215, 205);

    // Table box
    ctx.fillStyle = 'rgba(2, 6, 23, 0.7)';
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(32, 250, 536, 520, 16);
    } else {
      ctx.rect(32, 250, 536, 520);
    }
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const latestBooking = userBookings && userBookings.length > 0 ? userBookings[0] : null;
    const bookingHolderNameVal = latestBooking?.customerName || currentUser?.name || userName;
    const bookingHolderIdVal = latestBooking?.id || (currentUser?.id ? `BH-${currentUser.id.substring(0, 6).toUpperCase()}` : 'BH-VPM-882941');
    const seniorNameVal = currentUser?.sponsorName || 'Prabhat Gautam';
    const seniorIdVal = currentUser?.sponsorId || 'TM-001';

    const rows = [
      { label: 'Booking Holder Name:', value: bookingHolderNameVal, color: '#ffffff' },
      { label: 'Booking Holder ID:', value: bookingHolderIdVal, color: '#fcd34d' },
      { label: 'Senior Name:', value: seniorNameVal, color: '#ffffff' },
      { label: 'Senior ID:', value: seniorIdVal, color: '#fcd34d' },
      { label: 'Mobile Number:', value: currentUser?.phone || '7275300974', color: '#ffffff' },
      { label: 'KYC Status:', value: 'VERIFIED MEMBER', color: '#34d399' },
      { label: 'Valid Upto:', value: 'DECEMBER 2028', color: '#fbbf24' }
    ];

    let startY = 295;
    rows.forEach((row, i) => {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(row.label, 52, startY);

      ctx.fillStyle = row.color;
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(row.value, 548, startY);

      if (i < rows.length - 1) {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(52, startY + 20);
        ctx.lineTo(548, startY + 20);
        ctx.stroke();
      }
      startY += 68;
    });

    // Bottom Footer
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(32, 800);
    ctx.lineTo(568, 800);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText('Prayagraj Branch Office', 32, 835);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('www.vpmrealestate.in', 32, 860);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fcd34d';
    ctx.font = 'italic bold 18px Georgia, serif';
    ctx.fillText('Prabhat Gautam', 568, 835);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Managing Director', 568, 860);

    return canvas;
  };

  const generateICardCanvas = async (): Promise<HTMLCanvasElement> => {
    if (!showICardModal) {
      setShowICardModal(true);
      await new Promise((res) => setTimeout(res, 250));
    } else {
      await new Promise((res) => setTimeout(res, 50));
    }

    const cardElement = document.getElementById('icard-print-area');
    if (!cardElement) {
      return drawFallbackICardCanvas();
    }

    try {
      const canvas = await Promise.race([
        html2canvas(cardElement, {
          scale: 2.2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#0f172a',
          logging: false,
          onclone: (clonedDoc) => {
            const el = clonedDoc.getElementById('icard-print-area');
            if (el) {
              el.style.backgroundColor = '#0f172a';
              el.style.backgroundImage = 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%)';
              el.style.color = '#ffffff';
              el.style.borderRadius = '16px';
              el.style.border = '2px solid #f59e0b';

              const toRemove = el.querySelectorAll('button, input, .print\\:hidden');
              toRemove.forEach((item) => item.remove());

              const allEls = el.querySelectorAll('*');
              allEls.forEach((child) => {
                const hChild = child as HTMLElement;
                hChild.style.backdropFilter = 'none';
                (hChild.style as any).webkitBackdropFilter = 'none';
              });
            }
          }
        }),
        new Promise<HTMLCanvasElement>((_, reject) =>
          setTimeout(() => reject(new Error('html2canvas capture timeout')), 2500)
        )
      ]);
      return canvas;
    } catch (err) {
      console.warn('html2canvas capture failed, using fallback canvas:', err);
      return drawFallbackICardCanvas();
    }
  };

  const handleDownloadPDF = async () => {
    setIsDownloadingICard(true);
    try {
      let canvas: HTMLCanvasElement;
      try {
        canvas = await generateICardCanvas();
      } catch {
        canvas = await drawFallbackICardCanvas();
      }

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [95, 145]
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, Math.min(pdfHeight, 145));
      pdf.save(`VPM_ICard_${agentId || 'Partner'}.pdf`);
    } catch (err) {
      console.error('PDF export failed:', err);
      // Fallback direct draw to PDF
      const fallbackCanvas = await drawFallbackICardCanvas();
      const imgData = fallbackCanvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [95, 145] });
      pdf.addImage(imgData, 'PNG', 0, 0, 95, 145);
      pdf.save(`VPM_ICard_${agentId || 'Partner'}.pdf`);
    } finally {
      setIsDownloadingICard(false);
    }
  };

  const handleDownloadPNG = async () => {
    setIsDownloadingICard(true);
    try {
      let canvas: HTMLCanvasElement;
      try {
        canvas = await generateICardCanvas();
      } catch {
        canvas = await drawFallbackICardCanvas();
      }

      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `VPM_ICard_${agentId || 'Partner'}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 300);
    } catch (err) {
      console.error('PNG export failed:', err);
      const fallbackCanvas = await drawFallbackICardCanvas();
      const imgData = fallbackCanvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `VPM_ICard_${agentId || 'Partner'}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 300);
    } finally {
      setIsDownloadingICard(false);
    }
  };

  const handlePrintICard = async () => {
    setShowICardModal(true);
    setIsDownloadingICard(true);

    try {
      let canvas: HTMLCanvasElement;
      try {
        canvas = await generateICardCanvas();
      } catch {
        canvas = await drawFallbackICardCanvas();
      }

      const imgDataUrl = canvas.toDataURL('image/png', 1.0);

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Print Official I-Card - VPM Real Estate</title>
              <style>
                @page {
                  size: 95mm 145mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 10px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background: #ffffff;
                  font-family: sans-serif;
                }
                .card-img {
                  width: 95mm;
                  max-width: 100%;
                  height: auto;
                  border-radius: 12px;
                }
                @media print {
                  body {
                    padding: 0;
                    background: transparent;
                  }
                  .card-img {
                    width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <img src="${imgDataUrl}" class="card-img" alt="Official I-Card" />
            </body>
          </html>
        `);
        doc.close();

        setTimeout(() => {
          try {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
          } catch (e) {
            console.warn('Iframe print failed, fallback to PDF download:', e);
            handleDownloadPDF();
          } finally {
            setTimeout(() => {
              if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
              }
            }, 1000);
          }
        }, 300);
      } else {
        window.print();
      }
    } catch (err) {
      console.error('Print I-Card error, triggering PDF fallback:', err);
      await handleDownloadPDF();
    } finally {
      setIsDownloadingICard(false);
    }
  };

  const handleDownloadICard = async () => {
    setShowICardModal(true);
    await handleDownloadPDF();
  };

  const downloadEmiReceiptPDF = (
    emiNum: number,
    amount: number,
    dueDate: string,
    paymentMode: string = "UPI / NetBanking",
    txnId?: string
  ) => {
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const transactionId = txnId || `TXN-VPM-EMI-${emiNum}-${Math.floor(100000 + Math.random() * 900000)}`;
      const plotId = userBookings[0]?.plotId || userBookings[0]?.plotNo || 'P-104';
      const customerName = currentUser?.name || 'Valued Customer';
      const customerPhone = currentUser?.phone || '+91 98765 43210';
      const projectName = userBookings[0]?.projectName || 'Shri Radha Krishna Township Phase 1';

      // Header background (Navy Blue)
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 42, 'F');

      // Gold accent bar
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 42, 210, 3, 'F');

      // Header Text
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(16);
      pdf.text('VIGYA PAURUSH MILESTONE PVT LTD', 14, 18);

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(203, 213, 225);
      pdf.text('Head Office: Prayagraj-Lucknow Highway, Near Toll Plaza, Prayagraj, UP', 14, 26);
      pdf.text('Official Monthly Installment (EMI) Payment Receipt', 14, 33);

      // Receipt badge
      pdf.setFillColor(16, 185, 129);
      pdf.roundedRect(142, 12, 54, 20, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text('PAID RECEIPT', 149, 24);

      // Meta details box
      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 52, 182, 34, 3, 3, 'FD');

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RECEIPT NO:', 20, 61);
      pdf.text('TRANSACTION ID:', 20, 70);
      pdf.text('PAYMENT DATE:', 20, 79);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`VPM/EMI/2026/0${emiNum}`, 58, 61);
      pdf.text(transactionId, 58, 70);
      pdf.text(dueDate, 58, 79);

      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PLOT NO:', 118, 61);
      pdf.text('PAYMENT MODE:', 118, 70);
      pdf.text('STATUS:', 118, 79);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Phase 1 - Plot #${plotId}`, 155, 61);
      pdf.text(paymentMode, 155, 70);
      pdf.setTextColor(16, 185, 129);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SUCCESSFUL / CLEARED', 155, 79);

      // Customer & Plot Details section
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer & Allotment Details', 14, 98);

      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(255, 255, 255);
      pdf.roundedRect(14, 102, 182, 32, 3, 3, 'FD');

      pdf.setFontSize(9);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Customer Name:', 20, 111);
      pdf.text('Contact Phone:', 20, 120);
      pdf.text('Project Name:', 20, 129);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.text(customerName, 55, 111);
      pdf.setFont('helvetica', 'normal');
      pdf.text(customerPhone, 55, 120);
      pdf.text(projectName, 55, 129);

      // Table header
      pdf.setFillColor(15, 23, 42);
      pdf.rect(14, 144, 182, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Installment Particulars', 20, 150.5);
      pdf.text('Amount (INR)', 158, 150.5);

      // Table row
      pdf.setDrawColor(226, 232, 240);
      pdf.rect(14, 154, 182, 14, 'D');
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Monthly Installment EMI #${emiNum} (0% Interest Company Direct EMI)`, 20, 162.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Rs. ${amount.toLocaleString('en-IN')}`, 158, 162.5);

      // Total Box
      pdf.setFillColor(236, 253, 245);
      pdf.setDrawColor(167, 243, 208);
      pdf.roundedRect(14, 174, 182, 16, 3, 3, 'FD');
      pdf.setTextColor(6, 95, 70);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Total Amount Received:', 20, 184.5);
      pdf.text(`Rs. ${amount.toLocaleString('en-IN')} /-`, 148, 184.5);

      // Note & Verification
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text('* This is an official computer-generated receipt issued by Vigya Paurush Milestone Pvt Ltd.', 14, 202);
      pdf.text('* Amount received is verified and credited towards your plot installment account.', 14, 207);

      // Stamp & Seal
      pdf.setDrawColor(217, 119, 6);
      pdf.roundedRect(142, 218, 54, 24, 2, 2, 'D');
      pdf.setTextColor(180, 83, 9);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VPM PVT LTD SEAL', 151, 226);
      pdf.text('VERIFIED & STAMPED', 148, 231);
      pdf.setTextColor(15, 23, 42);
      pdf.text('Authorized Signatory', 151, 237);

      // Save PDF
      pdf.save(`VPM_EMI_Receipt_EMI${emiNum}_${transactionId}.pdf`);
    } catch (err) {
      console.error('Failed to generate EMI receipt PDF:', err);
      alert('Unable to generate PDF receipt.');
    }
  };

  // 1. Khatauni Land Revenue Record PDF Generator
  const downloadKhatauniPDF = () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 38, 'F');

      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 38, 210, 3, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text('UTTAR PRADESH REVENUE LAND RECORD (KHATAUNI)', 14, 16);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(251, 191, 36);
      pdf.text('VIGYA PAURUSH MILESTONE PVT LTD - OFFICIAL REVENUE COPY', 14, 25);
      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text('Tehsil Sadar / Chaka | District: Prayagraj | State: Uttar Pradesh', 14, 32);

      pdf.setFillColor(16, 185, 129);
      pdf.roundedRect(145, 10, 52, 18, 3, 3, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('100% VERIFIED TITLE', 148, 21);

      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 48, 182, 36, 3, 3, 'FD');

      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KHATAUNI KHATA NO:', 20, 57);
      pdf.text('KHASRA / GATA NOS:', 20, 66);
      pdf.text('TOTAL LAND AREA:', 20, 75);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text('00849 / 2026 (Prayagraj Revenue Records)', 60, 57);
      pdf.text('Gata No. 452/1 & Gata No. 453/2', 60, 66);
      pdf.text('5.42 Hectares (approx 13.39 Acres / 108 Plot Sites)', 60, 75);

      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LANDOWNER:', 125, 57);
      pdf.text('LAND USE:', 125, 66);
      pdf.text('REGISTRY STAGE:', 125, 75);

      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'normal');
      pdf.text('VPM Pvt. Ltd. (Director P. Gautam)', 152, 57);
      pdf.text('Residential (NA Sec 143 Approved)', 152, 66);
      pdf.text('Freehold Direct Possession', 152, 75);

      pdf.setFillColor(15, 23, 42);
      pdf.rect(14, 92, 182, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Khasra / Gata No.', 18, 98.5);
      pdf.text('Khatedar Name (Land Owner)', 62, 98.5);
      pdf.text('Area (Hectare)', 132, 98.5);
      pdf.text('Dakhil Kharij Status', 165, 98.5);

      const rows = [
        { gata: 'Gata No. 452/1', owner: 'Vigya Paurush Milestone Pvt Ltd', area: '2.85 Hectare', status: 'Cleared (Sec 143)' },
        { gata: 'Gata No. 453/2', owner: 'Vigya Paurush Milestone Pvt Ltd', area: '2.57 Hectare', status: 'Cleared (Sec 143)' },
        { gata: 'Gata No. 454/A', owner: 'Vigya Paurush Milestone Pvt Ltd', area: '1.20 Hectare', status: 'Commercial Zone' },
      ];

      let yPos = 102;
      rows.forEach((r, idx) => {
        pdf.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(14, yPos, 182, 11, 'FD');
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.text(r.gata, 18, yPos + 7);
        pdf.setFont('helvetica', 'normal');
        pdf.text(r.owner, 62, yPos + 7);
        pdf.text(r.area, 132, yPos + 7);
        pdf.setTextColor(16, 185, 129);
        pdf.setFont('helvetica', 'bold');
        pdf.text(r.status, 165, yPos + 7);
        yPos += 11;
      });

      pdf.setFillColor(236, 253, 245);
      pdf.setDrawColor(167, 243, 208);
      pdf.roundedRect(14, yPos + 10, 182, 40, 3, 3, 'FD');

      pdf.setTextColor(6, 95, 70);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Official Revenue Certification & Title Search Summary:', 20, yPos + 19);

      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(15, 23, 42);
      pdf.text('1. Certified that Khatauni Khata #00849 is free from all encumbrances, litigation, or bank mortgage.', 20, yPos + 27);
      pdf.text('2. Land is 100% NA Section 143 converted for non-agricultural residential township development in Prayagraj.', 20, yPos + 34);
      pdf.text('3. Immediate sub-registrar registry (बैनामा) and Dakhil-Kharij assistance guaranteed for all buyers.', 20, yPos + 41);

      pdf.setDrawColor(217, 119, 6);
      pdf.roundedRect(140, yPos + 58, 54, 26, 2, 2, 'D');
      pdf.setTextColor(180, 83, 9);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('REVENUE DEPT SEAL', 148, yPos + 66);
      pdf.text('PRAYAGRAJ SUB-REGISTRAR', 143, yPos + 72);
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(8);
      pdf.text('Verified Officer Signatory', 146, yPos + 78);

      pdf.save('VPM_Khatauni_Land_Record_Prayagraj.pdf');
    } catch (e) {
      console.error('Khatauni PDF Error:', e);
    }
  };

  // 2. Township Geographical Location Map PDF Generator
  const downloadMapPDF = () => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 38, 'F');
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 38, 210, 3, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text('OFFICIAL TOWNSHIP GEOGRAPHICAL LOCATION MAP', 14, 16);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(251, 191, 36);
      pdf.text('SHRI RADHA KRISHNA TOWNSHIP - PHASE 1, PRAYAGRAJ', 14, 25);
      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text('NH-24 Lucknow Highway Connectivity | Proximity Map & Route Guide', 14, 32);

      pdf.setDrawColor(15, 23, 42);
      pdf.setFillColor(241, 245, 249);
      pdf.roundedRect(14, 48, 182, 115, 4, 4, 'FD');

      pdf.setDrawColor(226, 232, 240);
      for (let x = 24; x < 190; x += 25) {
        pdf.line(x, 48, x, 163);
      }
      for (let y = 58; y < 160; y += 20) {
        pdf.line(14, y, 196, y);
      }

      pdf.setDrawColor(217, 119, 6);
      pdf.setLineWidth(3);
      pdf.line(20, 155, 190, 70);

      pdf.setTextColor(180, 83, 9);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('Prayagraj - Lucknow Highway (4-Lane Express Corridor)', 45, 130);

      pdf.setFillColor(15, 23, 42);
      pdf.setDrawColor(245, 158, 11);
      pdf.setLineWidth(1);
      pdf.roundedRect(105, 82, 60, 32, 3, 3, 'FD');

      pdf.setTextColor(251, 191, 36);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('★ SHRI RADHA KRISHNA', 108, 91);
      pdf.text('TOWNSHIP PHASE 1', 108, 98);
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'normal');
      pdf.text('13.5 Acres Prime Plotting Site', 108, 107);

      pdf.setFillColor(2, 132, 199);
      pdf.circle(40, 80, 5, 'F');
      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Bamrauli Airport (8 Km)', 22, 90);

      pdf.setFillColor(16, 185, 129);
      pdf.circle(165, 135, 5, 'F');
      pdf.text('Prayagraj Jn (12 Km)', 145, 145);

      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(203, 213, 225);
      pdf.roundedRect(165, 52, 26, 26, 2, 2, 'FD');
      pdf.setTextColor(220, 38, 38);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('▲ N', 172, 65);
      pdf.setFontSize(7);
      pdf.setTextColor(100, 116, 139);
      pdf.text('NORTH', 171, 74);

      pdf.setFillColor(15, 23, 42);
      pdf.rect(14, 170, 182, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Key Strategic Location & Landmark Proximity', 18, 176.5);

      const landmarks = [
        { name: 'Prayagraj - Lucknow 4-Lane Highway Frontage', dist: 'Direct 0.2 Km', drive: '1 Min Drive' },
        { name: 'Outer Ring Road & Bypass Express Junction', dist: '1.2 Km', drive: '3 Mins Drive' },
        { name: 'Bamrauli Domestic Airport, Prayagraj', dist: '8.0 Km', drive: '12 Mins Drive' },
        { name: 'Prayagraj Junction Railway Station & Civil Lines', dist: '12.0 Km', drive: '20 Mins Drive' },
        { name: 'Holy Triveni Sangam & Kumbh Mela Grounds', dist: '15.0 Km', drive: '25 Mins Drive' },
      ];

      let lyPos = 180;
      landmarks.forEach((lm, idx) => {
        pdf.setFillColor(idx % 2 === 0 ? 255 : 248, 250, 252);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(14, lyPos, 182, 10, 'FD');
        pdf.setTextColor(15, 23, 42);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.text(lm.name, 18, lyPos + 6.5);
        pdf.setTextColor(217, 119, 6);
        pdf.text(lm.dist, 130, lyPos + 6.5);
        pdf.setTextColor(16, 185, 129);
        pdf.text(lm.drive, 165, lyPos + 6.5);
        lyPos += 10;
      });

      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.setFont('helvetica', 'normal');
      pdf.text('* Official location map verified by Vigya Paurush Milestone Pvt Ltd surveying team.', 14, lyPos + 10);

      pdf.save('VPM_Township_Geographical_Map.pdf');
    } catch (e) {
      console.error('Map PDF Error:', e);
    }
  };

  // 3. Master Sub-Division Plot Layout Plan PDF Generator
  const downloadPlotLayoutPDF = () => {
    try {
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 297, 34, 'F');
      pdf.setFillColor(245, 158, 11);
      pdf.rect(0, 34, 297, 3, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.text('APPROVED MASTER SITE PLOT LAYOUT PLAN - PHASE 1', 14, 15);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(251, 191, 36);
      pdf.text('SHRI RADHA KRISHNA TOWNSHIP, PRAYAGRAJ | VIGYA PAURUSH MILESTONE PVT LTD', 14, 24);
      pdf.setFontSize(8);
      pdf.setTextColor(203, 213, 225);
      pdf.text('Total Plots: 108 | Main Entrance: 40ft Wide Road | Internal Roads: 30ft Wide | Central Green Park', 14, 30);

      pdf.setDrawColor(15, 23, 42);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 42, 269, 115, 3, 3, 'FD');

      pdf.setFillColor(203, 213, 225);
      pdf.setDrawColor(148, 163, 184);
      pdf.rect(14, 92, 269, 14, 'FD');
      pdf.setTextColor(15, 23, 42);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('══════════════ 40 FEET WIDE MAIN ENTRANCE BOULEVARD ROAD ══════════════', 35, 101);

      let px = 20;
      for (let i = 1; i <= 12; i++) {
        pdf.setFillColor(i === 4 ? 254 : 255, i === 4 ? 243 : 255, i === 4 ? 199 : 255);
        pdf.setDrawColor(i === 4 ? 217 : 203, i === 4 ? 119 : 213, i === 4 ? 6 : 225);
        pdf.setLineWidth(i === 4 ? 0.8 : 0.4);
        pdf.roundedRect(px, 48, 19, 38, 1.5, 1.5, 'FD');

        pdf.setTextColor(i === 4 ? 180 : 15, i === 4 ? 83 : 23, i === 4 ? 9 : 42);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`P-${i}`, px + 4, 58);
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('1200 Sqft', px + 2, 67);
        pdf.text('30\' x 40\'', px + 3, 75);

        if (i === 4) {
          pdf.setFontSize(6);
          pdf.setTextColor(16, 185, 129);
          pdf.setFont('helvetica', 'bold');
          pdf.text('★ YOURS', px + 1, 82);
        }
        px += 20;
      }

      pdf.setFillColor(220, 252, 231);
      pdf.setDrawColor(134, 239, 172);
      pdf.roundedRect(260, 48, 20, 38, 2, 2, 'FD');
      pdf.setTextColor(22, 101, 52);
      pdf.setFontSize(7.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GREEN', 263, 62);
      pdf.text('PARK', 264, 70);

      px = 20;
      for (let i = 13; i <= 24; i++) {
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(203, 213, 225);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(px, 112, 19, 38, 1.5, 1.5, 'FD');

        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`P-${i}`, px + 4, 122);
        pdf.setFontSize(6.5);
        pdf.setFont('helvetica', 'normal');
        pdf.text('1500 Sqft', px + 2, 131);
        pdf.text('30\' x 50\'', px + 3, 139);
        px += 20;
      }

      pdf.setFillColor(254, 243, 199);
      pdf.setDrawColor(252, 211, 77);
      pdf.roundedRect(260, 112, 20, 38, 2, 2, 'FD');
      pdf.setTextColor(146, 64, 14);
      pdf.setFontSize(7);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TEMPLE &', 261, 125);
      pdf.text('MARKET', 262, 133);

      pdf.setFillColor(15, 23, 42);
      pdf.rect(14, 162, 269, 8, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8.5);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Plot Category Dimensions', 20, 167.5);
      pdf.text('Total Units', 100, 167.5);
      pdf.text('Road Width', 160, 167.5);
      pdf.text('Status & Approval', 220, 167.5);

      const specs = [
        { cat: 'Standard Residential (30ft x 40ft = 1200 Sq.Ft)', units: '64 Plots', road: '30ft Concrete Internal Road', app: '100% Sold Out / Booked' },
        { cat: 'Premium Executive (30ft x 50ft = 1500 Sq.Ft)', units: '32 Plots', road: '40ft Main Boulevard Road', app: 'Available for Booking' },
        { cat: 'Corner Luxury Villa (40ft x 50ft = 2000 Sq.Ft)', units: '12 Plots', road: 'Dual Corner 40ft & 30ft Roads', app: 'Limited Inventory' }
      ];

      let spy = 170;
      specs.forEach((s) => {
        pdf.setFillColor(255, 255, 255);
        pdf.setDrawColor(226, 232, 240);
        pdf.rect(14, spy, 269, 7.5, 'FD');
        pdf.setTextColor(15, 23, 42);
        pdf.setFontSize(7.5);
        pdf.setFont('helvetica', 'bold');
        pdf.text(s.cat, 20, spy + 5);
        pdf.setFont('helvetica', 'normal');
        pdf.text(s.units, 100, spy + 5);
        pdf.text(s.road, 160, spy + 5);
        pdf.setTextColor(16, 185, 129);
        pdf.setFont('helvetica', 'bold');
        pdf.text(s.app, 220, spy + 5);
        spy += 7.5;
      });

      pdf.save('VPM_Plot_Layout_Plan_Phase1.pdf');
    } catch (e) {
      console.error('Plot Layout PDF Error:', e);
    }
  };

  const downloadSampleDocPDF = (title: string, sub: string) => {
    try {
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.setFillColor(15, 23, 42);
      pdf.rect(0, 0, 210, 35, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VIGYA PAURUSH MILESTONE PVT LTD', 14, 18);
      pdf.setFontSize(9);
      pdf.setTextColor(203, 213, 225);
      pdf.text('Official Legal & Revenue Records Copy', 14, 26);

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, 14, 50);

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Registration Ref / Reg No: ${sub}`, 14, 58);
      pdf.text(`Issued On: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 65);

      pdf.setDrawColor(226, 232, 240);
      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(14, 75, 182, 100, 3, 3, 'FD');

      pdf.setTextColor(15, 23, 42);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Document Content & Verification Record:', 20, 87);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(51, 65, 85);
      pdf.text(`This official document confirms the registration of ${title} under Prayagraj revenue jurisdiction.`, 20, 97);
      pdf.text('All plot coordinates, Khatauni land records, and RERA approvals are legally verified by VPM Pvt Ltd.', 20, 105);
      pdf.text('Land Classification: Residential Township Plotting (Zone A)', 20, 113);
      pdf.text('Registry Authority: Sub-Registrar Office, Chaka / Sadar, Prayagraj', 20, 121);

      pdf.setDrawColor(217, 119, 6);
      pdf.roundedRect(140, 140, 50, 24, 2, 2, 'D');
      pdf.setTextColor(180, 83, 9);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('VPM OFFICIAL SEAL', 147, 149);
      pdf.text('APPROVED COPY', 148, 155);

      pdf.save(`${title.replace(/\s+/g, '_')}_VPM.pdf`);
    } catch (e) {
      console.error(e);
    }
  };

  const latestBooking = userBookings && userBookings.length > 0 ? userBookings[0] : null;
  const bookingHolderName = latestBooking?.customerName || currentUser?.name || userName;
  const bookingHolderId = latestBooking?.id || (currentUser?.id ? `BH-${currentUser.id.substring(0, 6).toUpperCase()}` : 'BH-VPM-882941');
  const seniorName = currentUser?.sponsorName || 'Prabhat Gautam';
  const seniorId = currentUser?.sponsorId || 'TM-001';

  return (
    <div className="py-12 bg-slate-100 min-h-[80vh] font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* User Dashboard Welcome Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 border border-amber-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-xl flex items-center justify-center border-2 border-slate-800 shadow-md">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white">{userName}</h2>
                <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Phone: {currentUser?.phone || '7275300974'} | Agent ID: <strong className="text-amber-300 font-mono">{agentId}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('emi')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-colors border border-emerald-500/50 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-300" />
              <span>My EMI</span>
            </button>
            <button
              onClick={handleDownloadICard}
              disabled={isDownloadingICard}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow flex items-center gap-1.5 transition-colors border border-indigo-500/50 cursor-pointer disabled:opacity-50"
            >
              {isDownloadingICard ? <Loader2 className="w-3.5 h-3.5 text-amber-300 animate-spin" /> : <Download className="w-3.5 h-3.5 text-amber-300" />}
              <span>{isDownloadingICard ? 'Downloading...' : 'Download Icard'}</span>
            </button>
            <button
              onClick={() => onNavigate('plot-booking')}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold shadow transition-colors cursor-pointer"
            >
              + Book New Plot
            </button>
            <button
              onClick={onLogout}
              className="bg-slate-800 hover:bg-slate-700 text-rose-400 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'profile' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <UserIcon className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'bookings' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>My Bookings ({userBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('emi')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'emi' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CreditCard className="w-4 h-4 text-emerald-500" />
            <span>My EMI</span>
          </button>

          <button
            onClick={() => setActiveTab('investments')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'investments' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>My Investments ({userInvestments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('commissions')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'commissions' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>My Commissions</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'team' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span>Team Network</span>
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'financial' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Financial & Payout Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'payments' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <Receipt className="w-4 h-4 text-emerald-400" />
            <span>Payment History</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'docs' ? 'bg-sky-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Documents & Receipts</span>
          </button>

          <button
            onClick={() => setActiveTab('media')}
            className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'media' ? 'bg-sky-900 text-white shadow-xs font-black' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            <CloudUpload className="w-4 h-4 text-amber-500" />
            <span>Media Vault & Uploads</span>
          </button>
        </div>

        {/* Tab: Media Upload Manager */}
        {activeTab === 'media' && (
          <MediaUploadManager
            currentUserRole={role === 'buyer' ? 'customer' : (role as any)}
            currentUserId={currentUser?.id}
            currentUserName={currentUser?.name || userName}
            isDarkMode={true}
          />
        )}

        {/* Tab: Customer Payment History */}
        {activeTab === 'payments' && (
          <CustomerPaymentHistory
            currentUser={currentUser}
          />
        )}

        {/* Tab 1: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Account Overview & Partner Profile
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500">Full Name</span>
                <p className="text-sm font-bold text-slate-900">{userName}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500">Contact Number</span>
                <p className="text-sm font-bold text-slate-900">{currentUser?.phone || '7275300974'}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-slate-500">KYC Status</span>
                <p className="text-sm font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Dakhil Kharij Holder
                </p>
              </div>
            </div>

            {/* Agent Referral Box */}
            <div className="bg-slate-900 text-white p-5 rounded-xl border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-amber-400 text-sm">Your Referral Code & Link</h4>
                  <p className="text-[11px] text-slate-300">Share this link to earn 8% agent commission on customer bookings</p>
                </div>
                <span className="font-mono font-bold bg-amber-500 text-slate-950 px-2.5 py-1 rounded text-xs">
                  {agentId}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={referralUrl}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-300 text-xs"
                />
                <button
                  onClick={handleCopyRef}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2.5 rounded-lg flex items-center gap-1 shrink-0"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copiedRef ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Bookings */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">My Registered Plot Bookings</h3>
              <button
                onClick={() => onNavigate('plot-booking')}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                + Book Another Plot @ ₹10,000
              </button>
            </div>

            {userBookings.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-slate-500">No active bookings found.</p>
                <button
                  onClick={() => onNavigate('projects')}
                  className="text-sky-900 font-bold hover:underline"
                >
                  Browse Projects to Book Plot
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {userBookings.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sky-900">{b.id}</span>
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          {b.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{b.projectName} — Plot {b.plotNo}</h4>
                      <p className="text-slate-500 text-[11px]">
                        Size: {b.plotSizeSqft} sq.ft | Rate: ₹{b.ratePerSqft}/sqft | Total: {formatINR(b.totalPrice)}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-emerald-700 font-extrabold text-sm block">Paid: ₹10,000</span>
                      <p className="text-slate-400 text-[10px]">Txn ID: {b.paymentId}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Investments */}
        {activeTab === 'investments' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">My Risk-Free Investments</h3>
              <button
                onClick={() => onNavigate('investment')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
              >
                + New Investment Plan
              </button>
            </div>

            {userInvestments.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                No active investment records. Calculate and submit an investor plan to start earning up to 32% ROI.
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {userInvestments.map((inv) => (
                  <div key={inv.id} className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <span className="font-mono text-amber-700 font-bold">{inv.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm">Invested Area: {inv.sqftInvested} sq.ft @ ₹{inv.ratePerSqft}/sqft</h4>
                      <p className="text-slate-500">Guaranteed ROI: {inv.roiPercentage}% | Date: {inv.investmentDate}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400">Total Invested</span>
                      <p className="text-sm font-bold text-slate-900">{formatINR(inv.totalInvestedAmount)}</p>
                      <span className="text-emerald-600 font-extrabold">Est. Payout: {formatINR(inv.estimatedRoiPayout)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Commissions */}
        {activeTab === 'commissions' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
              <span>Earned Commission & Payout Ledger</span>
              {hasPendingEmi ? (
                <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-rose-200 flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  Instant Payout Inactive (Pending EMI Due)
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Instant Payout Active
                </span>
              )}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 text-white p-5 rounded-xl border border-amber-500/40">
              <div className="flex flex-col justify-between space-y-1">
                <span className="text-slate-400 text-[11px]">Total Commissions Earned</span>
                <p className="text-2xl font-black text-amber-400">₹1,85,000</p>
                <span className="text-[10px] text-slate-400">Direct Agent Sales Commission</span>
              </div>

              <div className="flex flex-col justify-between space-y-1">
                <span className="text-slate-400 text-[11px]">Pending Payout Balance</span>
                <p className="text-2xl font-black text-emerald-400">₹45,000</p>
                <span className="text-[10px] text-emerald-300">Available for UPI Withdrawal</span>
              </div>

              {/* Pay EMI Button / Box */}
              <div className="bg-slate-950 p-3 rounded-xl border border-indigo-800 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Plot EMI Dues</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-amber-300 font-bold text-xs">
                      {hasPendingEmi ? `EMI #${nextUnpaidEmi} Due` : 'All EMIs Paid'}
                    </span>
                    <span className="text-emerald-400 font-extrabold text-xs">₹44,444</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenEmiModal(nextUnpaidEmi, 44444, emiDateMap[nextUnpaidEmi] || '15th Next Month')}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2.5 px-3 rounded-lg text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pay EMI</span>
                </button>
              </div>

              {/* Request Instant Payout Button */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col justify-between space-y-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Payout Request</span>
                  <span className={`text-[11px] font-bold mt-1 block ${hasPendingEmi ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {hasPendingEmi ? '🔒 Inactive (Pending EMI)' : '✅ Active & Ready'}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={hasPendingEmi}
                  onClick={() => alert("Payout request of ₹45,000 sent to Director Prabhat Gautam for instant UPI settlement.")}
                  className={`w-full font-bold py-2.5 px-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 ${
                    hasPendingEmi
                      ? 'bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed opacity-75'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer active:scale-95'
                  }`}
                  title={hasPendingEmi ? `Payout disabled because EMI #${nextUnpaidEmi} is pending` : 'Click to request instant payout'}
                >
                  <span>Request Instant Payout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Team Network & Tree Structure */}
        {activeTab === 'team' && (() => {
          const renderHorizontalTreeNode = (node: TreeMemberNode) => {
            const isCollapsed = collapsedTreeNodes[node.id];
            const hasChildren = node.children && node.children.length > 0;
            const isSearchMatch = teamSearchQuery
              ? node.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                node.id.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                node.role.toLowerCase().includes(teamSearchQuery.toLowerCase())
              : false;

            const levelBadgeText =
              node.level === 0 ? '👑 Root' :
              node.level === 1 ? '🥇 Level 1' :
              node.level === 2 ? '🥈 Level 2' :
              node.level === 3 ? '🥉 Level 3' :
              `Level ${node.level}`;

            const levelCardStyle =
              node.level === 0
                ? 'border-amber-400/90 bg-slate-900 text-white shadow-xl ring-2 ring-amber-400/40'
                : node.level === 1
                ? 'border-indigo-500/80 bg-slate-900 text-slate-100 shadow-md'
                : node.level === 2
                ? 'border-emerald-600/80 bg-slate-900/90 text-slate-100'
                : 'border-slate-700 bg-slate-950 text-slate-200';

            return (
              <div key={node.id} className="flex items-center gap-3 shrink-0 relative my-1.5">
                {/* Horizontal Node Card */}
                <div
                  className={`w-64 p-3.5 rounded-xl border transition-all ${levelCardStyle} ${
                    isSearchMatch ? 'ring-2 ring-amber-400 shadow-amber-500/20 shadow-lg' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                        {node.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <h5 className="font-extrabold text-white text-xs truncate">{node.name}</h5>
                        <span className="text-[10px] text-indigo-300 font-mono font-bold block">{node.id}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300 shrink-0">
                      {levelBadgeText}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-300 space-y-1 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Role:</span>
                      <span className="text-amber-300 font-semibold truncate max-w-[130px]">{node.role}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sales:</span>
                      <strong className="text-amber-300 font-bold">{node.totalSales} Plots</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Earned:</span>
                      <strong className="text-emerald-400 font-extrabold">{formatINR(node.commissionEarned)}</strong>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggleTreeNodeCollapse(node.id)}
                        className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        <span>{isCollapsed ? `Expand (${node.children?.length})` : 'Hide Leg'}</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 italic text-[9px]">End Leg</span>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedMemberModal(node)}
                      className="text-indigo-300 hover:text-indigo-200 font-bold underline cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </div>

                {/* Horizontal Connector Line & Children Column */}
                {hasChildren && !isCollapsed && (
                  <div className="flex items-center shrink-0">
                    {/* Horizontal Connector Line */}
                    <div className="w-7 h-0.5 bg-indigo-500/80 relative shrink-0">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 shadow"></div>
                    </div>

                    {/* Vertical Children Column */}
                    <div className="flex flex-col gap-2 border-l-2 border-indigo-500/60 pl-3 py-1">
                      {node.children?.map((child) => renderHorizontalTreeNode(child))}
                    </div>
                  </div>
                )}
              </div>
            );
          };

          const renderTreeMemberNode = (node: TreeMemberNode) => {
            const isCollapsed = collapsedTreeNodes[node.id];
            const hasChildren = node.children && node.children.length > 0;
            const isSearchMatch = teamSearchQuery
              ? node.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                node.id.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                node.role.toLowerCase().includes(teamSearchQuery.toLowerCase())
              : false;

            const levelBadgeText =
              node.level === 0 ? '👑 Root Leader' :
              node.level === 1 ? '🥇 Level 1 (Direct)' :
              node.level === 2 ? '🥈 Level 2 (Sub)' :
              node.level === 3 ? '🥉 Level 3 (Tier 3)' :
              `🎖️ Level ${node.level}`;

            const levelCardStyle =
              node.level === 0
                ? 'border-amber-400/80 bg-slate-900 text-white shadow-xl ring-2 ring-amber-400/40'
                : node.level === 1
                ? 'border-indigo-500/80 bg-slate-900 text-slate-100 shadow-md'
                : node.level === 2
                ? 'border-emerald-600/70 bg-slate-900/90 text-slate-100'
                : 'border-slate-700 bg-slate-950 text-slate-200';

            return (
              <div key={node.id} className="relative space-y-2">
                {/* Node Card */}
                <div
                  className={`p-3.5 rounded-xl border transition-all ${levelCardStyle} ${
                    isSearchMatch ? 'ring-2 ring-amber-400 shadow-amber-500/20 shadow-lg' : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Expand/Collapse Button if children exist */}
                      {hasChildren ? (
                        <button
                          type="button"
                          onClick={() => toggleTreeNodeCollapse(node.id)}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                          title={isCollapsed ? "Expand team branch" : "Collapse team branch"}
                        >
                          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-slate-800/40 flex items-center justify-center text-slate-500 shrink-0">
                          <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                        </div>
                      )}

                      {/* Avatar circle */}
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold flex items-center justify-center text-xs shrink-0">
                        {node.name.substring(0, 2).toUpperCase()}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-white text-sm">{node.name}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-amber-300">
                            {levelBadgeText}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="font-mono text-indigo-300 font-semibold">{node.id}</span>
                          <span>•</span>
                          <span>{node.role}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Phone className="w-3 h-3 text-amber-400" />
                            {node.phone}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-2.5 text-right flex-wrap sm:flex-nowrap">
                      <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/80 text-center">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Sales</span>
                        <strong className="text-amber-300 text-xs font-black">{node.totalSales} Plots</strong>
                      </div>

                      <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800/80 text-center">
                        <span className="text-[9px] text-slate-400 block uppercase font-bold">Earned</span>
                        <strong className="text-emerald-400 text-xs font-black">{formatINR(node.commissionEarned)}</strong>
                      </div>

                      {hasChildren && (
                        <div className="bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800 text-center hidden sm:block">
                          <span className="text-[9px] text-indigo-300 block uppercase font-bold">Downlines</span>
                          <strong className="text-white text-xs font-black">{node.children?.length} Direct</strong>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedMemberModal(node)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors shrink-0"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* Children Sub-branch tree connectors */}
                {hasChildren && !isCollapsed && (
                  <div className="pl-4 md:pl-7 border-l-2 border-indigo-500/40 space-y-2.5 mt-2 ml-3">
                    {node.children?.map((child) => renderTreeMemberNode(child))}
                  </div>
                )}
              </div>
            );
          };

          return (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs font-sans">
              {/* Header & Controls Bar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <GitFork className="w-5 h-5 text-amber-500" />
                    <span>MLM Team Network Hierarchy</span>
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Visual Tree Structure & Multi-Tier Downline Commission Tracker
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* View Mode Toggle */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setTeamViewMode('horizontal')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        teamViewMode === 'horizontal'
                          ? 'bg-slate-900 text-amber-400 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GitFork className="w-3.5 h-3.5 rotate-90 text-amber-400" />
                      <span>➡️ Horizontal Tree</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeamViewMode('tree')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        teamViewMode === 'tree'
                          ? 'bg-slate-900 text-amber-400 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GitFork className="w-3.5 h-3.5" />
                      <span>🌳 Vertical Tree</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTeamViewMode('list')}
                      className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        teamViewMode === 'list'
                          ? 'bg-slate-900 text-amber-400 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>📋 List View</span>
                    </button>
                  </div>

                  {/* Copy Referral Link */}
                  <button
                    type="button"
                    onClick={handleCopyRef}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{copiedRef ? 'Link Copied!' : 'Invite Member'}</span>
                  </button>
                </div>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900 text-white p-4 rounded-xl border border-indigo-900">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Network Size</span>
                  <strong className="text-xl font-black text-amber-400">28 Members</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Direct Level 1 Legs</span>
                  <strong className="text-xl font-black text-emerald-400">2 Directs</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Total Team Sales</span>
                  <strong className="text-xl font-black text-sky-400">52 Plots</strong>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Team Earnings</span>
                  <strong className="text-xl font-black text-amber-300">₹24,50,000</strong>
                </div>
              </div>

              {/* Search Filter Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={teamSearchQuery}
                  onChange={(e) => setTeamSearchQuery(e.target.value)}
                  placeholder="Search team member by name, Agent ID (e.g. TM-001) or role..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* HORIZONTAL TREE STRUCTURE VIEW */}
              {teamViewMode === 'horizontal' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-4">
                  {/* Legend & Hint Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300 uppercase tracking-wider text-[10px]">Horizontal Layout Legend:</span>
                      <span className="text-slate-400 hidden sm:inline">(Scroll horizontally ➡️ to view deep downline branches)</span>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 👑 Root</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> 🥇 Direct Leg (L1)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 🥈 Sub Leg (L2)</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> 🥉 Tier 3+</span>
                    </div>
                  </div>

                  {/* Scrollable Canvas for Horizontal Tree Flow */}
                  <div className="overflow-x-auto pb-4 pt-2 custom-scrollbar">
                    <div className="inline-flex min-w-full items-start p-2">
                      {hierarchicalTeamTree.map((rootNode) => renderHorizontalTreeNode(rootNode))}
                    </div>
                  </div>
                </div>
              )}

              {/* VERTICAL TREE STRUCTURE VIEW */}
              {teamViewMode === 'tree' && (
                <div className="bg-slate-950 p-4 md:p-6 rounded-2xl border border-slate-800 shadow-2xl overflow-x-auto space-y-4">
                  {/* Tree Legend */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 text-[11px] text-slate-400 flex-wrap">
                    <span className="font-bold text-slate-200 uppercase tracking-wider text-[10px]">Tree Legend:</span>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 👑 Level 0 (Root)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> 🥇 Level 1 (Direct)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 🥈 Level 2 (Sub)</span>
                      <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> 🥉 Level 3+</span>
                    </div>
                  </div>

                  {/* Hierarchical Tree Canvas */}
                  <div className="space-y-4 min-w-[320px]">
                    {hierarchicalTeamTree.map((rootNode) => renderTreeMemberNode(rootNode))}
                  </div>
                </div>
              )}

              {/* LIST VIEW TABLE */}
              {teamViewMode === 'list' && (
                <div className="space-y-3">
                  {MOCK_TEAM_TREE.filter(
                    (m) =>
                      !teamSearchQuery ||
                      m.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
                      m.id.toLowerCase().includes(teamSearchQuery.toLowerCase())
                  ).map((member) => (
                    <div key={member.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-sky-900 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{member.name} ({member.role})</h4>
                          <p className="text-slate-500 text-[11px]">Agent ID: {member.id} | Downlines: {member.downlineCount}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 block">Total Team Sales: {member.totalSales} Plots</span>
                        <p className="font-extrabold text-emerald-700 text-sm">{formatINR(member.commissionEarned)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Member Detail Modal */}
              {selectedMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                  <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 font-sans">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-black flex items-center justify-center text-sm">
                          {selectedMemberModal.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base text-white">{selectedMemberModal.name}</h3>
                          <p className="text-xs text-amber-400 font-bold">{selectedMemberModal.role}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberModal(null)}
                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-400">Agent ID:</span>
                        <strong className="text-indigo-300 font-mono font-bold">{selectedMemberModal.id}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-400">Mobile Phone:</span>
                        <strong className="text-slate-200">{selectedMemberModal.phone}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-400">Sponsor Leader ID:</span>
                        <strong className="text-slate-200">{selectedMemberModal.sponsorId}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-400">Joined Date:</span>
                        <strong className="text-slate-200">{selectedMemberModal.joinedDate}</strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-400">Total Plots Sold:</span>
                        <strong className="text-amber-400 font-bold">{selectedMemberModal.totalSales} Plots</strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Commission Earned:</span>
                        <strong className="text-emerald-400 font-black text-sm">{formatINR(selectedMemberModal.commissionEarned)}</strong>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <a
                        href={`tel:${selectedMemberModal.phone}`}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 text-center"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Agent</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => setSelectedMemberModal(null)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs text-center"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tab 6: Documents & Download Options */}
        {activeTab === 'docs' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs font-sans">
            <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <span>Official Revenue Documents, Maps & Plot Layout Downloads</span>
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Download authentic Government Khatauni records, geographic maps, and approved sub-division plot layout plans
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-amber-900 flex items-center gap-1.5 shrink-0 self-start md:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Verified Revenue Records (Prayagraj U.P.)</span>
              </div>
            </div>

            {/* TOP FEATURED DOWNLOAD CARDS GRID (1. KHATAUNI, 2. MAP, 3. PLOT LAYOUT) */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Featured Property Downloads (Khatauni, Map & Layout)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. KHATAUNI CARD */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-amber-500/40 shadow-md space-y-3 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-xl group-hover:bg-amber-500/20 transition-all"></div>
                  
                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                        उत्तर प्रदेश भूलेख
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-white text-base">1. Khatauni Revenue Record</h4>
                      <p className="text-[11px] text-amber-300 font-bold mt-0.5">खतौनी उद्धरण / नकल (Khata #00849/2026)</p>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                        Official revenue land title copy for Gata No. 452/1 & 453/2, Tehsil Sadar, Prayagraj. Section 143 NA converted.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadKhatauniPDF}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ type: 'khatauni', title: 'UP Revenue Land Record (Khatauni)', subtitle: 'Khatauni Khata #00849/2026 - Tehsil Sadar Prayagraj' })}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Preview Khatauni Record"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <label className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => handleDocFileUpload('khatauni', e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploadedDocs.khatauni && (
                      <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                        <div className="truncate pr-2">
                          <span className="font-bold text-amber-300 block truncate">{uploadedDocs.khatauni.name}</span>
                          <span className="text-slate-400 text-[10px]">{uploadedDocs.khatauni.size} • {uploadedDocs.khatauni.date}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={uploadedDocs.khatauni.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-amber-400 text-slate-950 px-2 py-1 rounded font-bold text-[10px]"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedDoc('khatauni')}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove uploaded file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. TOWNSHIP MAP CARD */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-500/40 shadow-md space-y-3 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>

                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300">
                        NH-24 Proximity
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-white text-base">2. Geographic Location Map</h4>
                      <p className="text-[11px] text-indigo-300 font-bold mt-0.5">Lucknow Highway Connectivity Map</p>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                        Official route & distance map showing Prayagraj Airport (8 Km), Railway Station (12 Km) & Ring Road access.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadMapPDF}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ type: 'map', title: 'Township Geographic Location Map', subtitle: 'Lucknow Highway NH-24 Connectivity & Proximity Guide' })}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Preview Geographical Map"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <label className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => handleDocFileUpload('map', e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploadedDocs.map && (
                      <div className="bg-indigo-500/10 border border-indigo-500/30 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                        <div className="truncate pr-2">
                          <span className="font-bold text-indigo-300 block truncate">{uploadedDocs.map.name}</span>
                          <span className="text-slate-400 text-[10px]">{uploadedDocs.map.size} • {uploadedDocs.map.date}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={uploadedDocs.map.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-indigo-500 text-white px-2 py-1 rounded font-bold text-[10px]"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedDoc('map')}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove uploaded file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. PLOT LAYOUT PLAN CARD */}
                <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-emerald-500/40 shadow-md space-y-3 flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>

                  <div className="space-y-2 relative z-10">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center">
                        <Grid className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                        Phase 1 Master Site
                      </span>
                    </div>

                    <div>
                      <h4 className="font-black text-white text-base">3. Master Plot Layout Plan</h4>
                      <p className="text-[11px] text-emerald-300 font-bold mt-0.5">Phase 1 Approved Site Layout Map</p>
                      <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                        Detailed 108 plot division diagram with 40ft entrance road, 30ft internal roads, central park & temple.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex flex-col gap-2 relative z-10">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={downloadPlotLayoutPDF}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDocModal({ type: 'plotLayout', title: 'Master Sub-Division Site Plot Layout Plan', subtitle: 'Phase 1 Approved Sub-Division Map (Plots P-1 to P-108)' })}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Preview Plot Layout Map"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>
                      <label className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload</span>
                        <input
                          type="file"
                          accept="image/*,.pdf,.doc,.docx"
                          onChange={(e) => handleDocFileUpload('plotLayout', e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {uploadedDocs.plotLayout && (
                      <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                        <div className="truncate pr-2">
                          <span className="font-bold text-emerald-300 block truncate">{uploadedDocs.plotLayout.name}</span>
                          <span className="text-slate-400 text-[10px]">{uploadedDocs.plotLayout.size} • {uploadedDocs.plotLayout.date}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={uploadedDocs.plotLayout.url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-emerald-500 text-white px-2 py-1 rounded font-bold text-[10px]"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveUploadedDoc('plotLayout')}
                            className="text-rose-400 hover:text-rose-300 p-1"
                            title="Remove uploaded file"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* SECONDARY LEGAL & CERTIFICATE DOCUMENTS */}
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2 border-t border-slate-100 pt-4">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>RERA & Statutory Title Certificates</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">VPM Company RERA Certificate</h4>
                    <p className="text-[11px] text-slate-500">UPRERAPRJ994821</p>
                  </div>
                  <button
                    onClick={() => downloadSampleDocPDF("VPM Company RERA Certificate", "UPRERAPRJ994821")}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Sample Dakhil Kharij Title Deed</h4>
                    <p className="text-[11px] text-slate-500">Prayagraj Revenue Records</p>
                  </div>
                  <button
                    onClick={() => downloadSampleDocPDF("Sample Dakhil Kharij Title Deed", "Prayagraj Revenue Records - Khatauni #849/2026")}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900">Section 143 NA Land Conversion</h4>
                    <p className="text-[11px] text-slate-500">SDM Court Order Prayagraj</p>
                  </div>
                  <button
                    onClick={() => downloadSampleDocPDF("Section 143 NA Land Conversion Approval", "Prayagraj Revenue Court Order #143/2025")}
                    className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Financial & Payout Summary Dashboard */}
        {activeTab === 'financial' && (
          <div className="bg-slate-900 text-white rounded-3xl border border-amber-500/40 p-6 md:p-8 shadow-2xl space-y-8 text-xs relative overflow-hidden">
            {/* Background Glow Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header Title & Timeframe Selector */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full tracking-wider">
                    Executive Financial Ledger
                  </span>
                  <span className="text-slate-400 text-xs font-mono">FY 2025-26 Live Audit</span>
                </div>
                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-amber-400" />
                  <span>Financial & Payout Dashboard Summary</span>
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  Complete breakdown of Customers, Agents, Investors, Employees payouts, expenditures, loans, cashflows, and inflows/outflows.
                </p>
              </div>

              {/* Timeframe Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setFinancialTimeframe('monthly')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                    financialTimeframe === 'monthly' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  This Month
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialTimeframe('quarterly')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                    financialTimeframe === 'quarterly' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quarterly
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialTimeframe('sixMonthly')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                    financialTimeframe === 'sixMonthly' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Six Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setFinancialTimeframe('annually')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all text-xs cursor-pointer ${
                    financialTimeframe === 'annually' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Annually
                </button>
              </div>
            </div>

            {/* Top 3 Metric Cards (Cashflow, Total Inflow, Total Outflow) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
              {/* 7. TOTAL CASHFLOW */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/50 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    7. Total Cashflow
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Net Positive
                  </span>
                </div>
                <div className="text-3xl font-black text-emerald-400 mb-1">+₹84,50,000</div>
                <p className="text-slate-400 text-[11px]">
                  Net operating cash reserves maintained across Prayagraj site projects. Reserve Cushion Ratio: <strong className="text-emerald-300">1.62x</strong>
                </p>
              </div>

              {/* 8. TOTAL INFLOW */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-sky-500/50 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowDownLeft className="w-4 h-4 text-sky-400" />
                    8. Total Inflow ({financialTimeframe === 'monthly' ? 'This Month' : financialTimeframe === 'quarterly' ? 'Quarterly' : financialTimeframe === 'sixMonthly' ? 'Six Monthly' : 'Annually'})
                  </span>
                  <span className="bg-sky-500/20 text-sky-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-sky-500/30">
                    Revenue Received
                  </span>
                </div>
                <div className="text-3xl font-black text-sky-400 mb-1">
                  {financialTimeframe === 'monthly' && '₹32,50,000'}
                  {financialTimeframe === 'quarterly' && '₹98,00,000'}
                  {financialTimeframe === 'sixMonthly' && '₹1,92,00,000'}
                  {financialTimeframe === 'annually' && '₹3,85,00,000'}
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div>This Month: <strong className="text-white">₹32.5L</strong></div>
                  <div>Quarterly: <strong className="text-white">₹98.0L</strong></div>
                  <div>Six Monthly: <strong className="text-white">₹1.92Cr</strong></div>
                  <div>Annually: <strong className="text-white">₹3.85Cr</strong></div>
                </div>
              </div>

              {/* 9. TOTAL OUTFLOW */}
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-rose-500/50 p-5 rounded-2xl shadow-lg relative overflow-hidden group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    9. Total Outflow ({financialTimeframe === 'monthly' ? 'This Month' : financialTimeframe === 'quarterly' ? 'Quarterly' : financialTimeframe === 'sixMonthly' ? 'Six Monthly' : 'Annually'})
                  </span>
                  <span className="bg-rose-500/20 text-rose-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-rose-500/30">
                    Disbursed Capital
                  </span>
                </div>
                <div className="text-3xl font-black text-rose-400 mb-1">
                  {financialTimeframe === 'monthly' && '₹18,20,000'}
                  {financialTimeframe === 'quarterly' && '₹54,60,000'}
                  {financialTimeframe === 'sixMonthly' && '₹1,12,00,000'}
                  {financialTimeframe === 'annually' && '₹2,24,00,000'}
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2 text-[10px] text-slate-300 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <div>This Month: <strong className="text-white">₹18.2L</strong></div>
                  <div>Quarterly: <strong className="text-white">₹54.6L</strong></div>
                  <div>Six Monthly: <strong className="text-white">₹1.12Cr</strong></div>
                  <div>Annually: <strong className="text-white">₹2.24Cr</strong></div>
                </div>
              </div>
            </div>

            {/* Grid of the 6 Categories: Customers, Agents, Investors, Employees, Expenditures, Loan & EMI */}
            <div className="space-y-4 relative z-10">
              <h4 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <PieChart className="w-4 h-4 text-amber-400" />
                <span>Entity Stakeholder Payouts & Operational Liabilities</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. TOTAL CUSTOMERS & HIS PAYOUT */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">1. Total Customers & His Payout</h5>
                        <span className="text-[10px] text-slate-400">Plot Buyers & Registry Clients</span>
                      </div>
                    </div>
                    <span className="bg-amber-500/10 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                      142 Clients
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Customer Count:</span>
                      <strong className="text-white font-extrabold">142 Active Buyers</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Customer Payout Disbursed:</span>
                      <strong className="text-amber-400 font-black text-sm">₹12,50,000</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Plot Refunds & Adjustments:</span>
                        <span className="text-slate-200 font-semibold">₹8,00,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Early Booking Cashbacks:</span>
                        <span className="text-slate-200 font-semibold">₹4,50,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. TOTAL AGENTS & HIS PAYOUT */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">2. Total Agents & His Payout</h5>
                        <span className="text-[10px] text-slate-400">Channel Partners & Network</span>
                      </div>
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                      38 Partners
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Agent Network:</span>
                      <strong className="text-white font-extrabold">38 Active Agents</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Agent Payout Disbursed:</span>
                      <strong className="text-indigo-400 font-black text-sm">₹28,40,000</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Direct 8% Sales Commission:</span>
                        <span className="text-slate-200 font-semibold">₹22,10,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Level Downline Overrides:</span>
                        <span className="text-slate-200 font-semibold">₹6,30,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. TOTAL INVESTORS & HIS PAYOUT */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">3. Total Investors & His Payout</h5>
                        <span className="text-[10px] text-slate-400">Fixed High ROI Investors</span>
                      </div>
                    </div>
                    <span className="bg-emerald-500/10 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                      19 Investors
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Investors Count:</span>
                      <strong className="text-white font-extrabold">19 Investors</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Investor ROI Payout:</span>
                      <strong className="text-emerald-400 font-black text-sm">₹42,80,000</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Capital Deposited:</span>
                        <span className="text-slate-200 font-semibold">₹1,34,00,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>32% Guaranteed ROI Yield:</span>
                        <span className="text-emerald-300 font-semibold">₹42,80,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. TOTAL EMPLOYEES & HIS PAYOUT */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-sky-500/20 text-sky-300 rounded-xl">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">4. Total Employees & His Payout</h5>
                        <span className="text-[10px] text-slate-400">Payroll Staff & Engineers</span>
                      </div>
                    </div>
                    <span className="bg-sky-500/10 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-500/20">
                      24 Staff
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Employees Count:</span>
                      <strong className="text-white font-extrabold">24 Employees</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Salary & Bonus Payout:</span>
                      <strong className="text-sky-400 font-black text-sm">₹18,60,000</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Monthly Payroll Salaries:</span>
                        <span className="text-slate-200 font-semibold">₹14,40,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Site Allowance & Bonuses:</span>
                        <span className="text-slate-200 font-semibold">₹4,20,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. TOTAL EXPENDITURES */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">5. Total Expenditures</h5>
                        <span className="text-[10px] text-slate-400">Development & Ops Cost</span>
                      </div>
                    </div>
                    <span className="bg-rose-500/10 text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20">
                      Operating Outlay
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Company Expenditure:</span>
                      <strong className="text-rose-400 font-black text-sm">₹65,20,000</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Roads & Civil Layout Construction:</span>
                        <span className="text-slate-200 font-semibold">₹32,40,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Marketing, Banners & Ads:</span>
                        <span className="text-slate-200 font-semibold">₹14,80,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>RERA & Section 143 Legal Fees:</span>
                        <span className="text-slate-200 font-semibold">₹12,00,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Office & Administrative Operations:</span>
                        <span className="text-slate-200 font-semibold">₹6,00,000</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. TOTAL LOAN & HIS EMI */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500/20 text-purple-300 rounded-xl">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white text-xs">6. Total Loan & His EMI</h5>
                        <span className="text-[10px] text-slate-400">Bank Project Acquisition Loan</span>
                      </div>
                    </div>
                    <span className="bg-purple-500/10 text-purple-300 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-500/20">
                      Bank Liability
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Development Loan:</span>
                      <strong className="text-white font-extrabold">₹1,20,00,000</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Monthly Bank EMI Payout:</span>
                      <strong className="text-purple-400 font-black text-sm">₹3,45,000 / month</strong>
                    </div>
                    <div className="bg-slate-900 p-2.5 rounded-xl text-[10px] text-slate-300 space-y-1">
                      <div className="flex justify-between">
                        <span>Bank Lender:</span>
                        <span className="text-slate-200 font-semibold">SBI Commercial Prayagraj</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Annual Interest Rate:</span>
                        <span className="text-slate-200 font-semibold">9.25% p.a.</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Principal Outstanding:</span>
                        <span className="text-purple-300 font-semibold">₹88,20,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions Banner */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-500/30">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-white text-sm">Download Official Financial Statement & Audit Summary</h5>
                  <p className="text-slate-400 text-[11px]">Generate verified PDF report containing all 9 financial metrics & payout statements</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => downloadSampleDocPDF("VPM Company Master Financial Audit Report 2026", "REG-FIN-AUDIT-992014")}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer transition-transform active:scale-95 shrink-0"
              >
                <Download className="w-4 h-4" />
                <span>Export Audit PDF</span>
              </button>
            </div>
          </div>
        )}
        {activeTab === 'emi' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  My Plot EMI & Monthly Installment Schedule
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Track your monthly EMI dues, payment history, and pay installments online
                </p>
              </div>
              <button
                onClick={() => {
                  const nextUnpaid = [1, 2, 3, 4, 5, 6].find((num) => !paidEmiNumbers.includes(num)) || 3;
                  const dateMap: Record<number, string> = { 3: '15 Aug 2026', 4: '15 Sep 2026', 5: '15 Oct 2026', 6: '15 Nov 2026' };
                  handleOpenEmiModal(nextUnpaid, 44444, dateMap[nextUnpaid] || '15th Next Month');
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto transition-colors"
              >
                <CreditCard className="w-4 h-4 text-amber-300" />
                <span>Pay Next EMI Online</span>
              </button>
            </div>

            {/* EMI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[11px]">Total Plot Value</span>
                <p className="text-lg font-extrabold text-amber-400">
                  {formatINR(userBookings[0]?.totalPrice || 1250000)}
                </p>
                <span className="text-[10px] text-slate-400">Phase 1 - Plot #{userBookings[0]?.plotId || 'P-104'}</span>
              </div>

              <div className="bg-emerald-50 text-emerald-900 p-4 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-700 text-[11px]">Total Paid Amount</span>
                <p className="text-lg font-extrabold text-emerald-600">
                  {formatINR((userBookings[0]?.paidAmount || 450000) + (paidEmiNumbers.length - 2) * 44444)}
                </p>
                <span className="text-[10px] text-emerald-700 font-semibold">{paidEmiNumbers.length} Installments Cleared</span>
              </div>

              <div className="bg-amber-50 text-amber-950 p-4 rounded-xl border border-amber-200 space-y-1">
                <span className="text-amber-800 text-[11px]">Outstanding Balance</span>
                <p className="text-lg font-extrabold text-amber-700">
                  {formatINR((userBookings[0]?.totalPrice || 1250000) - ((userBookings[0]?.paidAmount || 450000) + (paidEmiNumbers.length - 2) * 44444))}
                </p>
                <span className="text-[10px] text-amber-800 font-semibold">{24 - paidEmiNumbers.length} Remaining EMIs</span>
              </div>

              <div className="bg-sky-50 text-sky-950 p-4 rounded-xl border border-sky-200 space-y-1">
                <span className="text-sky-800 text-[11px]">Next Monthly EMI</span>
                <p className="text-lg font-extrabold text-sky-700">
                  {formatINR(44444)}
                </p>
                <span className="text-[10px] text-rose-600 font-bold">
                  Due: {!paidEmiNumbers.includes(3) ? '15th Aug 2026' : !paidEmiNumbers.includes(4) ? '15th Sep 2026' : '15th Oct 2026'}
                </span>
              </div>
            </div>

            {/* Installments Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                <span>EMI Payment Schedule & Statement</span>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  0% Interest Company EMI Plan
                </span>
              </h4>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Inst #</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">EMI Amount</th>
                      <th className="p-3">Payment Mode</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action / Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr className="bg-emerald-50/50">
                      <td className="p-3 font-bold">EMI #1</td>
                      <td className="p-3">15 Feb 2026</td>
                      <td className="p-3 font-bold">{formatINR(44444)}</td>
                      <td className="p-3">UPI / NetBanking</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          PAID
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => downloadEmiReceiptPDF(1, 44444, "15 Feb 2026", "UPI / NetBanking", "TXN-VPM-EMI1-92841")}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-indigo-600" />
                          <span>Download Receipt</span>
                        </button>
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50">
                      <td className="p-3 font-bold">EMI #2</td>
                      <td className="p-3">15 Mar 2026</td>
                      <td className="p-3 font-bold">{formatINR(44444)}</td>
                      <td className="p-3">Bank Transfer</td>
                      <td className="p-3">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          PAID
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => downloadEmiReceiptPDF(2, 44444, "15 Mar 2026", "Bank Transfer", "TXN-VPM-EMI2-81723")}
                          className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-indigo-600" />
                          <span>Download Receipt</span>
                        </button>
                      </td>
                    </tr>

                    {/* EMI #3 */}
                    <tr className={paidEmiNumbers.includes(3) ? "bg-emerald-50/50" : "bg-amber-50/60"}>
                      <td className="p-3 font-bold text-slate-900">EMI #3</td>
                      <td className="p-3 font-semibold text-slate-700">15 Aug 2026</td>
                      <td className="p-3 font-bold text-slate-900">{formatINR(44444)}</td>
                      <td className="p-3">{paidEmiNumbers.includes(3) ? "Online Gateway" : "Online Gateway"}</td>
                      <td className="p-3">
                        {paidEmiNumbers.includes(3) ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            PAID
                          </span>
                        ) : (
                          <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
                            UPCOMING DUE
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {paidEmiNumbers.includes(3) ? (
                          <button
                            onClick={() => downloadEmiReceiptPDF(3, 44444, "15 Aug 2026", "Online Gateway", "TXN-VPM-EMI3-10294")}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3 text-indigo-600" />
                            <span>Download Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenEmiModal(3, 44444, "15 Aug 2026")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                            <span>Pay Now</span>
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* EMI #4 */}
                    <tr className={paidEmiNumbers.includes(4) ? "bg-emerald-50/50" : "hover:bg-slate-50"}>
                      <td className="p-3 font-bold text-slate-900">EMI #4</td>
                      <td className="p-3 text-slate-700">15 Sep 2026</td>
                      <td className="p-3 font-bold text-slate-900">{formatINR(44444)}</td>
                      <td className="p-3">Scheduled</td>
                      <td className="p-3">
                        {paidEmiNumbers.includes(4) ? (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            PAID
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded text-[10px]">
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {paidEmiNumbers.includes(4) ? (
                          <button
                            onClick={() => downloadEmiReceiptPDF(4, 44444, "15 Sep 2026", "Online Gateway", "TXN-VPM-EMI4-55102")}
                            className="text-indigo-600 hover:text-indigo-800 hover:underline font-bold text-[11px] cursor-pointer inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3 text-indigo-600" />
                            <span>Download Receipt</span>
                          </button>
                        ) : paidEmiNumbers.includes(3) ? (
                          <button
                            onClick={() => handleOpenEmiModal(4, 44444, "15 Sep 2026")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                            <span>Pay Now</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Next in Line</span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Official Identity Card Modal */}
      {showICardModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-amber-500/30">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Official Partner Identity Card</h3>
              </div>
              <button
                onClick={() => setShowICardModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / ICard Printable Area */}
            <div className="p-6 space-y-4">
              <div id="icard-print-area" className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 border-2 border-amber-500/60 shadow-xl space-y-4 relative overflow-hidden">
                {/* Subtle Watermark Badge */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

                {/* Card Header */}
                <div className="flex items-center justify-between border-b border-amber-500/30 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      VPM
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-amber-400 leading-tight">VIGYA PAURUSH MILESTONE PVT LTD</h4>
                      <p className="text-[9px] text-slate-300 font-semibold">Real Estate & Infrastructure | Prayagraj</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/40">
                    OFFICIAL ICARD
                  </span>
                </div>

                {/* Card Main Info */}
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black text-2xl flex items-center justify-center border-2 border-amber-300 shadow-md overflow-hidden cursor-pointer relative group transition-transform active:scale-95"
                      title="Click to upload/change photo"
                    >
                      {userPhoto ? (
                        <img src={userPhoto} alt={userName} className="w-full h-full object-cover" />
                      ) : (
                        <span>{userName.substring(0, 2).toUpperCase()}</span>
                      )}
                      <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-amber-300 p-1">
                        <Camera className="w-4 h-4" />
                        <span className="text-[7px] font-bold mt-0.5 text-center leading-tight">Change</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="absolute -bottom-1 -right-1 bg-amber-500 hover:bg-amber-400 text-slate-950 p-1 rounded-full shadow-md border border-slate-900 cursor-pointer transition-colors print:hidden"
                      title="Upload Photo"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">{userName}</h3>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[10px] text-amber-300 hover:text-amber-200 underline font-semibold flex items-center gap-1 cursor-pointer print:hidden"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload Photo</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">
                      {role === 'buyer' ? 'AUTHORISED BUYER / PARTNER' : `${role.toUpperCase()} AGENT`}
                    </p>
                    <p className="text-[10px] text-slate-300 font-mono">
                      ID NO: <strong className="text-white">{agentId}</strong>
                    </p>
                  </div>
                </div>

                {/* Card Details Table */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-700/60 space-y-1 text-[10px] text-slate-300">
                  <div className="flex justify-between border-b border-slate-800 pb-1">
                    <span>Booking Holder Name:</span>
                    <span className="font-bold text-white">{bookingHolderName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1">
                    <span>Booking Holder ID:</span>
                    <span className="font-bold text-amber-300 font-mono">{bookingHolderId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1">
                    <span>Senior Name:</span>
                    <span className="font-bold text-white">{seniorName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1">
                    <span>Senior ID:</span>
                    <span className="font-bold text-amber-300 font-mono">{seniorId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1">
                    <span>Mobile Number:</span>
                    <span className="font-bold text-white">{currentUser?.phone || '7275300974'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 py-1">
                    <span>KYC Status:</span>
                    <span className="font-bold text-emerald-400">VERIFIED MEMBER</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Valid Upto:</span>
                    <span className="font-bold text-amber-300">DECEMBER 2028</span>
                  </div>
                </div>

                {/* Footer Signature */}
                <div className="flex items-end justify-between pt-1 text-[9px] text-slate-400 border-t border-slate-800">
                  <div>
                    <p className="text-[8px]">Prayagraj Branch Office</p>
                    <p className="font-semibold text-slate-300">www.vpmrealestate.in</p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif italic text-amber-300 text-[10px] font-bold">Prabhat Gautam</p>
                    <p className="text-[8px] text-slate-400 font-bold">Managing Director</p>
                  </div>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={handlePrintICard}
                  disabled={isDownloadingICard}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700 disabled:opacity-50"
                >
                  {isDownloadingICard ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  ) : (
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{isDownloadingICard ? 'Preparing Print...' : 'Print'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPNG}
                  disabled={isDownloadingICard}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isDownloadingICard ? <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" /> : <Download className="w-3.5 h-3.5 text-slate-950" />}
                  <span>PNG Image</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={isDownloadingICard}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors disabled:opacity-50"
                >
                  {isDownloadingICard ? <Loader2 className="w-3.5 h-3.5 text-amber-300 animate-spin" /> : <Download className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowICardModal(false)}
                  className="px-3 py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Online EMI Payment Checkout Modal */}
      {showEmiModal && selectedEmi && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Online EMI Payment Gateway</h3>
                  <p className="text-[11px] text-slate-400">Vigya Paurush Milestone Pvt Ltd</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmiModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {emiSuccess ? (
                /* Payment Success View */
                <div className="text-center space-y-4 py-2">
                  <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">Payment Successful!</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Your installment for <strong className="text-emerald-400">EMI #{emiSuccess.emiNum}</strong> has been credited.
                    </p>
                  </div>

                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-left space-y-1.5 text-xs">
                    <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Transaction ID:</span>
                      <span className="font-mono font-bold text-amber-300">{emiSuccess.txnId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 py-1.5">
                      <span className="text-slate-400">Paid Amount:</span>
                      <span className="font-bold text-emerald-400">{formatINR(emiSuccess.amount)}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 py-1.5">
                      <span className="text-slate-400">Payment Date:</span>
                      <span className="text-slate-200">{emiSuccess.date}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-slate-400">Plot No:</span>
                      <span className="font-bold text-white">Phase 1 - #{userBookings[0]?.plotId || 'P-104'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => downloadEmiReceiptPDF(emiSuccess.emiNum, emiSuccess.amount, emiSuccess.date, paymentMethod.toUpperCase(), emiSuccess.txnId)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow cursor-pointer transition-colors"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-300" />
                      <span>Download Receipt</span>
                    </button>
                    <button
                      onClick={() => setShowEmiModal(false)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-colors"
                    >
                      Close Gateway
                    </button>
                  </div>
                </div>
              ) : (
                /* Payment Gateway Checkout Form */
                <>
                  {/* Summary Box */}
                  <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2">
                      <span className="font-semibold">Installment:</span>
                      <span className="font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        EMI #{selectedEmi.number}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 border-b border-slate-800 pb-2">
                      <span className="font-semibold">Due Date:</span>
                      <span className="text-rose-400 font-medium">{selectedEmi.dueDate}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-300 pt-1">
                      <span className="font-semibold">Total Amount Due:</span>
                      <span className="text-base font-extrabold text-emerald-400">{formatINR(selectedEmi.amount)}</span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300 block">Select Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                          paymentMethod === 'upi'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        UPI / QR
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                          paymentMethod === 'card'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Debit / Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer text-xs font-bold ${
                          paymentMethod === 'netbanking'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        NetBanking
                      </button>
                    </div>
                  </div>

                  {/* Method Content */}
                  {paymentMethod === 'upi' && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-2">
                      <p className="text-[11px] text-slate-400">Scan QR Code using Google Pay, PhonePe or Paytm</p>
                      <div className="w-28 h-28 bg-white p-2 rounded-lg mx-auto flex items-center justify-center shadow-inner">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=vpmrealestate@icici%26pn=VigyaPaurushMilestone%26am=${selectedEmi.amount}`}
                          alt="UPI Payment QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px]">
                        <span className="text-slate-400 font-mono">vpmrealestate@icici</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText('vpmrealestate@icici');
                            alert('UPI ID copied to clipboard!');
                          }}
                          className="text-amber-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-2 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Card Number</label>
                        <input
                          type="text"
                          placeholder="4532 •••• •••• 8829"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Expiry (MM/YY)</label>
                          <input
                            type="text"
                            placeholder="08/28"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">CVV</label>
                          <input
                            type="password"
                            placeholder="•••"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'netbanking' && (
                    <div className="space-y-2 text-xs">
                      <label className="text-[11px] text-slate-400 block">Select Popular Bank</label>
                      <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500">
                        <option>State Bank of India (SBI)</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Axis Bank</option>
                        <option>Punjab National Bank (PNB)</option>
                        <option>Bank of Baroda</option>
                      </select>
                    </div>
                  )}

                  {/* 12-Digit Transaction ID Input Field */}
                  <div className="space-y-1.5 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <label className="text-[11px] font-bold text-slate-200 flex items-center justify-between">
                      <span>Transaction ID / 12-Digit UTR <span className="text-rose-400">*</span></span>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        12 Digits Required
                      </span>
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={emiTxnIdInput}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setEmiTxnIdInput(val);
                        if (emiTxnError) setEmiTxnError('');
                      }}
                      placeholder="Enter 12-digit UTR (e.g. 123456789012)"
                      className={`w-full bg-slate-900 border rounded-xl px-3 py-2.5 text-amber-300 font-mono text-xs focus:outline-none transition-colors ${
                        emiTxnError
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-800 focus:border-emerald-500'
                      }`}
                    />
                    {emiTxnError ? (
                      <p className="text-[11px] text-rose-400 font-bold flex items-center gap-1 mt-1">
                        <XCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{emiTxnError}</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        Please check your payment app receipt to enter the exact 12-digit UTR number.
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleProcessEmiPayment}
                    disabled={isProcessingEmi}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-xl shadow-lg transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                  >
                    {isProcessingEmi ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                        <span>Verifying & Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>Confirm & Pay {formatINR(selectedEmi.amount)}</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Document Preview Modal */}
      {previewDocModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col my-auto">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                  {previewDocModal.type === 'khatauni' && <FileSpreadsheet className="w-5 h-5" />}
                  {previewDocModal.type === 'map' && <MapPin className="w-5 h-5" />}
                  {previewDocModal.type === 'plotLayout' && <Grid className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">{previewDocModal.title}</h3>
                  <p className="text-xs text-slate-400">{previewDocModal.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {previewDocModal.type === 'khatauni' && (
                  <button
                    type="button"
                    onClick={downloadKhatauniPDF}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                )}
                {previewDocModal.type === 'map' && (
                  <button
                    type="button"
                    onClick={downloadMapPDF}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Map PDF</span>
                  </button>
                )}
                {previewDocModal.type === 'plotLayout' && (
                  <button
                    type="button"
                    onClick={downloadPlotLayoutPDF}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Layout PDF</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setPreviewDocModal(null)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 text-xs bg-slate-950/40">
              {uploadedDocs[previewDocModal.type] && (
                <div className="bg-slate-900 border border-amber-500/40 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 block uppercase tracking-wider">User Uploaded Custom Attachment</span>
                      <span className="font-bold text-white text-sm block">{uploadedDocs[previewDocModal.type]?.name}</span>
                      <span className="text-slate-400 text-[11px]">{uploadedDocs[previewDocModal.type]?.size} • Uploaded on {uploadedDocs[previewDocModal.type]?.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={uploadedDocs[previewDocModal.type]?.url}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Attachment</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveUploadedDoc(previewDocModal.type)}
                      className="bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}

              {/* KHATAUNI PREVIEW CONTENT */}
              {previewDocModal.type === 'khatauni' && (
                <div className="bg-white text-slate-900 rounded-2xl p-6 border border-slate-200 shadow-inner space-y-5 font-serif">
                  <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-end">
                    <div>
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-sans font-bold px-2 py-0.5 rounded border border-amber-300">
                        उत्तर प्रदेश सरकार - भूलेख खतौनी उद्धरण
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 mt-1">उद्धरण खतौनी (Khatauni Revenue Record)</h2>
                      <p className="text-xs font-sans text-slate-600">तहसील: सदर / चाका | जनपद: प्रयागराज | परगना: अरैल</p>
                    </div>
                    <div className="text-right font-sans">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded border border-emerald-300">
                        100% VERIFIED TITLE
                      </span>
                      <p className="text-[10px] text-slate-500 mt-1">Khata No: 00849 / 2026</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-amber-50/60 p-3.5 rounded-xl border border-amber-200 font-sans text-[11px]">
                    <div>
                      <span className="text-slate-500 block">खाता संख्या:</span>
                      <strong className="text-slate-900 font-bold">00849</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">गाटा / खसरा सं:</span>
                      <strong className="text-slate-900 font-bold">452/1, 453/2</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">कुल क्षेत्रफल:</span>
                      <strong className="text-slate-900 font-bold">5.4200 हे० (13.39 एकड़)</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">भूमि उपयोग:</span>
                      <strong className="text-emerald-700 font-bold">धारा 143 अकृषिक (NA)</strong>
                    </div>
                  </div>

                  <div className="overflow-x-auto font-sans">
                    <table className="w-full text-left border-collapse border border-slate-200 text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold">
                          <th className="p-2.5 border border-slate-300">खसरा सं० (Gata No.)</th>
                          <th className="p-2.5 border border-slate-300">खातेदार का नाम (Landowner)</th>
                          <th className="p-2.5 border border-slate-300">क्षेत्रफल (Hectare)</th>
                          <th className="p-2.5 border border-slate-300">आदेश / विवरण (Status)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr className="bg-white">
                          <td className="p-2.5 border border-slate-200 font-bold">गाटा संख्या 452/1</td>
                          <td className="p-2.5 border border-slate-200">विज्ञा पौरुष मीलस्टोन प्रा० लि० (निदेशक प्रभात गौतम)</td>
                          <td className="p-2.5 border border-slate-200">2.8500 हे०</td>
                          <td className="p-2.5 border border-slate-200 text-emerald-700 font-bold">धारा 143 आवासीय टाउनशिप स्वीकृत</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-2.5 border border-slate-200 font-bold">गाटा संख्या 453/2</td>
                          <td className="p-2.5 border border-slate-200">विज्ञा पौरुष मीलस्टोन प्रा० लि० (निदेशक प्रभात गौतम)</td>
                          <td className="p-2.5 border border-slate-200">2.5700 हे०</td>
                          <td className="p-2.5 border border-slate-200 text-emerald-700 font-bold">दाखिल खारिज पूर्ण / निर्विवाद</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl font-sans text-xs space-y-1 text-emerald-950">
                    <h5 className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>राजस्व सत्यापन एवं प्रमाण पत्र:</span>
                    </h5>
                    <p className="text-[11px] text-emerald-800">
                      प्रमाणित किया जाता है कि खाता संख्या 00849 पूर्णतः भार-मुक्त, बैंक बंधक मुक्त एवं निर्विवाद है। उप-निबंधक कार्यालय सदर प्रयागराज द्वारा रजिस्ट्री हेतु पूर्णतः अधिकृत है।
                    </p>
                  </div>
                </div>
              )}

              {/* MAP PREVIEW CONTENT */}
              {previewDocModal.type === 'map' && (
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-indigo-400" />
                        <span>Shri Radha Krishna Township Geographical Location Map</span>
                      </h4>
                      <p className="text-slate-400 text-xs">Lucknow Highway NH-24 Frontage & Proximity Guide</p>
                    </div>
                    <span className="bg-indigo-500/20 text-indigo-300 font-mono text-[10px] px-2.5 py-1 rounded-lg border border-indigo-500/30">
                      GPS: 25.4358° N, 81.8463° E
                    </span>
                  </div>

                  {/* Visual Map Render Box */}
                  <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative min-h-[220px] flex flex-col justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>

                    {/* Highway Corridor */}
                    <div className="relative z-10 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
                        <span className="font-extrabold text-amber-300 text-xs">4-Lane Lucknow Highway Corridor (NH-24)</span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold">Frontage Road</span>
                    </div>

                    {/* Township Pin */}
                    <div className="relative z-10 my-4 self-center bg-indigo-600 text-white px-5 py-3 rounded-2xl border-2 border-amber-400 shadow-xl flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-amber-300 animate-bounce" />
                      <div>
                        <h5 className="font-black text-sm text-white">Shri Radha Krishna Township</h5>
                        <p className="text-[11px] text-amber-200">13.5 Acre Prime Plotting Site</p>
                      </div>
                    </div>

                    {/* Landmark Pins */}
                    <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
                      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-slate-300">
                        <span className="text-sky-400 font-bold block">✈ Bamrauli Airport</span>
                        <span>8.0 Km (12 Mins)</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-slate-300">
                        <span className="text-emerald-400 font-bold block">🚉 Prayagraj Jn Station</span>
                        <span>12.0 Km (20 Mins)</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-slate-300">
                        <span className="text-amber-400 font-bold block">🌊 Holy Triveni Sangam</span>
                        <span>15.0 Km (25 Mins)</span>
                      </div>
                      <div className="bg-slate-900/90 border border-slate-800 p-2 rounded-lg text-slate-300">
                        <span className="text-purple-400 font-bold block">🛣 Outer Ring Road</span>
                        <span>1.2 Km (3 Mins)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PLOT LAYOUT PREVIEW CONTENT */}
              {previewDocModal.type === 'plotLayout' && (
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-5">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white flex items-center gap-2">
                        <Grid className="w-5 h-5 text-emerald-400" />
                        <span>Master Site Sub-Division Plot Layout Plan (Phase 1)</span>
                      </h4>
                      <p className="text-slate-400 text-xs">Total 108 Plots | 40ft Entrance Road | 30ft Internal Sector Roads</p>
                    </div>
                    <span className="bg-emerald-500/20 text-emerald-300 font-bold text-xs px-3 py-1 rounded-full border border-emerald-500/30">
                      Approved Layout Map
                    </span>
                  </div>

                  {/* Scaled Plot Layout Grid Display */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4">
                    {/* Sector Roads Legend */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="font-bold text-slate-300">Layout Legend:</span>
                      <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                        <span className="w-3 h-3 bg-amber-400 rounded"></span> Your Allotted Plot (P-104)
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-300">
                        <span className="w-3 h-3 bg-emerald-500 rounded"></span> Central Green Park
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-3 h-3 bg-slate-700 rounded"></span> 40ft Main Boulevard
                      </span>
                    </div>

                    {/* Plots Grid Visual */}
                    <div className="space-y-3">
                      {/* Top Row Plots */}
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((pNum) => (
                          <div
                            key={pNum}
                            className={`p-2 rounded-lg text-center border font-mono text-[10px] ${
                              pNum === 4
                                ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-lg ring-2 ring-amber-400/50 scale-105'
                                : 'bg-slate-900 text-slate-200 border-slate-800'
                            }`}
                          >
                            <span className="block font-bold">P-{pNum}</span>
                            <span className="text-[9px] opacity-80">1200 sqft</span>
                          </div>
                        ))}
                      </div>

                      {/* Main Entrance Road */}
                      <div className="bg-slate-800/80 border border-slate-700 py-2.5 px-4 rounded-xl text-center font-bold text-amber-300 tracking-wider text-[11px] flex items-center justify-between">
                        <span>◀ 40 FEET WIDE MAIN ENTRANCE BOULEVARD ROAD ▶</span>
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px]">Commercial Zone</span>
                      </div>

                      {/* Bottom Row Plots */}
                      <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
                        {Array.from({ length: 12 }, (_, i) => i + 13).map((pNum) => (
                          <div
                            key={pNum}
                            className="p-2 rounded-lg text-center border font-mono text-[10px] bg-slate-900 text-slate-200 border-slate-800"
                          >
                            <span className="block font-bold">P-{pNum}</span>
                            <span className="text-[9px] opacity-80">1500 sqft</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>Vigya Paurush Milestone Pvt Ltd • Prayagraj Revenue Approved Records</span>
              <button
                type="button"
                onClick={() => setPreviewDocModal(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
