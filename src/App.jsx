import React, { useEffect, useState } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

// --- CUSTOM LOGO COMPONENT ---
const Logo = ({ theme, isMobile }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <svg width={isMobile ? "30" : "36"} height={isMobile ? "30" : "36"} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="10" fill="url(#logo-gradient)" />
      <path d="M12 10H22L28 16V30C28 31.1046 27.1046 32 26 32H12C10.8954 32 10 31.1046 10 30V12C10 10.8954 10.8954 10 12 10Z" fill="white" fillOpacity="0.2" />
      <path d="M15 14H23L25 16V26C25 27.1046 24.1046 28 23 28H15C13.8954 28 13 27.1046 13 26V16C13 14.8954 13.8954 14 15 14Z" fill="white" />
      <rect x="16" y="19" width="6" height="1.5" rx="0.75" fill="#4f46e5" />
      <rect x="16" y="22" width="4" height="1.5" rx="0.75" fill="#4f46e5" />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
    <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, letterSpacing: "-0.5px", color: theme.text }}>
      pdf<span style={{ color: "#4f46e5" }}>World</span>
    </span>
  </div>
);

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("home");
  const [dark, setDark] = useState(false);
  const [files, setFiles] = useState([]);
  const [singleFile, setSingleFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [pagesToProcess, setPagesToProcess] = useState("");
  const [showBreadcrumbMenu, setShowBreadcrumbMenu] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- THEME ---
  const theme = {
    bg: dark ? "#0f172a" : "#f8fafc",
    card: dark ? "#1e293b" : "#ffffff",
    text: dark ? "#f1f5f9" : "#0f172a",
    sub: dark ? "#94a3b8" : "#64748b",
    border: dark ? "#334155" : "#e2e8f0",
    brand: "#4f46e5"
  };

  // --- TOOLS DATA ---
  const tools = [
    { id: "merge", label: "Merge PDF", desc: "Combine PDFs in the order you want.", icon: "📑" },
    { id: "split", label: "Split PDF", desc: "Separate one page or a whole set.", icon: "✂️" },
    { id: "compress", label: "Compress PDF", desc: "Reduce file size while optimizing quality.", icon: "📉" },
    { id: "pdf-to-word", label: "PDF to Word", desc: "Convert PDF to editable DOCX.", icon: "📘" },
    { id: "word-to-pdf", label: "Word to PDF", desc: "Make DOCX files easy to read.", icon: "📝" },
    { id: "pdf-to-excel", label: "PDF to Excel", desc: "Extract data to spreadsheets.", icon: "📊" },
    { id: "edit", label: "Edit PDF", desc: "Add text, images, or shapes.", icon: "✒️" },
    { id: "watermark", label: "Watermark", desc: "Stamp an image or text over PDF.", icon: "🖋️" },
    { id: "rotate", label: "Rotate PDF", desc: "Rotate pages the way you need.", icon: "🔄" },
    { id: "remove", label: "Remove Pages", desc: "Delete pages from your document.", icon: "🗑️" },
  ];

  // --- LOGIC FUNCTIONS ---
  const downloadFile = (bytes, name) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.click();
  };

  const handleMerge = async () => {
    if (files.length < 2) return alert("Upload at least 2 PDFs");
    const mergedPdf = await PDFDocument.create();
    for (let file of files) {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(p => mergedPdf.addPage(p));
    }
    downloadFile(await mergedPdf.save(), "merged.pdf");
  };

  const handleRotate = async () => {
    if (!singleFile) return alert("Upload a PDF");
    const pdf = await PDFDocument.load(await singleFile.arrayBuffer());
    pdf.getPages().forEach(p => p.setRotation(degrees(90)));
    downloadFile(await pdf.save(), "rotated.pdf");
  };

  const handlePlaceholder = () => alert("This specific tool logic is being updated. The UI is ready!");

  // --- SUB-COMPONENTS ---

  const Breadcrumbs = () => {
    if (!isMobile || activeTab === "home") return null;
    const currentTool = tools.find(t => t.id === activeTab);
    return (
      <div style={{ position: "relative", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: theme.sub, background: theme.card, padding: "10px 15px", borderRadius: 10, border: `1px solid ${theme.border}` }}>
          <span onClick={() => setActiveTab("home")} style={{ cursor: "pointer" }}>🏠 Home</span>
          <span style={{ opacity: 0.5 }}>/</span>
          <div onClick={() => setShowBreadcrumbMenu(!showBreadcrumbMenu)} style={{ color: theme.brand, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            {currentTool?.label} <span style={{ fontSize: 10 }}>▼</span>
          </div>
        </div>
        {showBreadcrumbMenu && (
          <div style={{ position: "absolute", top: 45, left: 0, right: 0, background: theme.card, borderRadius: 12, border: `1px solid ${theme.border}`, zIndex: 1000, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", overflowY: "auto", maxHeight: "300px" }}>
            {tools.map(tool => (
              <div key={tool.id} onClick={() => { setActiveTab(tool.id); setShowBreadcrumbMenu(false); setFiles([]); setSingleFile(null); }} style={{ padding: "12px 15px", borderBottom: `1px solid ${theme.border}`, fontSize: 14, background: activeTab === tool.id ? theme.bg : "transparent" }}>
                {tool.icon} {tool.label}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const Sidebar = () => (
    <aside style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 280, background: theme.card, zIndex: 2000,
      transform: sidebarOpen || !isMobile ? "translateX(0)" : "translateX(-100%)",
      transition: "0.3s ease", borderRight: `1px solid ${theme.border}`, padding: 20,
      visibility: !isMobile || sidebarOpen ? "visible" : "hidden", overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
        <Logo theme={theme} isMobile={false} />
        {isMobile && <button onClick={() => setSidebarOpen(false)} style={{ border: "none", background: "none", fontSize: 20, color: theme.text }}>✕</button>}
      </div>
      <button onClick={() => { setActiveTab("home"); setSidebarOpen(false); }} style={{ width: "100%", textAlign: "left", padding: "12px 15px", borderRadius: 10, border: "none", background: activeTab === "home" ? theme.brand : "transparent", color: activeTab === "home" ? "#fff" : theme.text, fontWeight: 600, cursor: "pointer", marginBottom: 5 }}>🏠 Home</button>
      <div style={{ height: 1, background: theme.border, margin: "15px 0" }} />
      {tools.map(tool => (
        <button key={tool.id} onClick={() => { setActiveTab(tool.id); setSidebarOpen(false); setFiles([]); setSingleFile(null); }} style={{ width: "100%", textAlign: "left", padding: "12px 15px", borderRadius: 10, border: "none", background: activeTab === tool.id ? theme.brand : "transparent", color: activeTab === tool.id ? "#fff" : theme.text, fontWeight: 600, cursor: "pointer", marginBottom: 5 }}>
          <span style={{ marginRight: 10 }}>{tool.icon}</span> {tool.label}
        </button>
      ))}
    </aside>
  );

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: "sans-serif" }}>
      {/* NAVBAR */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 70, background: theme.card, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${theme.border}`, zIndex: 1100 }}>
        <div style={{ width: "100%", maxWidth: 1200, display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            {isMobile && <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", fontSize: 24, color: theme.text, cursor: "pointer" }}>☰</button>}
            <div onClick={() => setActiveTab("home")} style={{ cursor: "pointer" }}><Logo theme={theme} isMobile={isMobile} /></div>
          </div>
          <button onClick={() => setDark(!dark)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20 }}>{dark ? "☀️" : "🌙"}</button>
        </div>
      </nav>

      <Sidebar />
      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1500 }} />}

      <main style={{ marginLeft: isMobile ? 0 : 280, paddingTop: 70, display: "flex", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 1000, padding: isMobile ? "30px 15px" : "60px 40px" }}>
          <Breadcrumbs />

          {activeTab === "home" ? (
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: isMobile ? 28 : 42, fontWeight: 900, marginBottom: 10 }}>PDF tools, simplified.</h1>
              <p style={{ color: theme.sub, marginBottom: 40 }}>Merge, split, compress and convert PDFs for free.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
                {tools.map(tool => (
                  <div key={tool.id} onClick={() => { setActiveTab(tool.id); setFiles([]); setSingleFile(null); }} style={{ background: theme.card, padding: 30, borderRadius: 15, border: `1px solid ${theme.border}`, textAlign: "left", cursor: "pointer", transition: "0.2s" }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}>
                    <div style={{ fontSize: 35, marginBottom: 15 }}>{tool.icon}</div>
                    <h3 style={{ margin: "0 0 10px 0" }}>{tool.label}</h3>
                    <p style={{ margin: 0, fontSize: 14, color: theme.sub }}>{tool.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <h1 style={{ fontSize: 36, fontWeight: 900 }}>{tools.find(t => t.id === activeTab).label}</h1>
              <p style={{ color: theme.sub, marginBottom: 20 }}>{tools.find(t => t.id === activeTab).desc}</p>

              <div style={{ background: theme.card, padding: isMobile ? 30 : 60, borderRadius: 25, border: `1px solid ${theme.border}`, marginTop: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
                <div style={{ border: `2px dashed ${theme.border}`, borderRadius: 15, padding: 40, width: "100%", boxSizing: "border-box" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>☁️</div>
                  <input type="file" multiple={activeTab === 'merge'} onChange={(e) => activeTab === 'merge' ? setFiles(Array.from(e.target.files)) : setSingleFile(e.target.files[0])} />
                </div>

                {/* Specific Inputs for Watermark / Remove Pages */}
                {activeTab === "watermark" && (
                  <input type="text" placeholder="Enter watermark text..." onChange={(e) => setWatermarkText(e.target.value)} style={{ padding: 15, borderRadius: 10, width: "100%", maxWidth: 400, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }} />
                )}
                {activeTab === "remove" && (
                  <input type="text" placeholder="Pages to remove (e.g. 1, 3)" onChange={(e) => setPagesToProcess(e.target.value)} style={{ padding: 15, borderRadius: 10, width: "100%", maxWidth: 400, border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text }} />
                )}

                <button
                  onClick={activeTab === "merge" ? handleMerge : activeTab === "rotate" ? handleRotate : handlePlaceholder}
                  style={{ padding: "16px 50px", background: theme.brand, color: "white", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", width: isMobile ? "100%" : "auto" }}
                >
                  Process {activeTab.toUpperCase()}
                </button>
                <button onClick={() => setActiveTab("home")} style={{ background: "none", border: "none", color: theme.brand, cursor: "pointer", fontWeight: 700 }}>← Back to home</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}