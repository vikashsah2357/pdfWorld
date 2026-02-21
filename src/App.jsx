import React, { useEffect, useState } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState("home"); // "home" shows the grid
  const [dark, setDark] = useState(false);
  const [files, setFiles] = useState([]);
  const [singleFile, setSingleFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [extraInput, setExtraInput] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // --- TOOLS DATA ---
  const tools = [
    { id: "merge", label: "Merge PDF", desc: "Combine PDFs in the order you want.", icon: "📑", color: "#e74c3c" },
    { id: "split", label: "Split PDF", desc: "Separate one page or a whole set.", icon: "✂️", color: "#f39c12" },
    { id: "compress", label: "Compress PDF", desc: "Reduce file size while optimizing quality.", icon: "📉", color: "#27ae60" },
    { id: "pdf-to-word", label: "PDF to Word", desc: "Convert PDF to editable DOCX.", icon: "📘", color: "#2980b9" },
    { id: "word-to-pdf", label: "Word to PDF", desc: "Make DOCX files easy to read.", icon: "📝", color: "#2980b9" },
    { id: "pdf-to-excel", label: "PDF to Excel", desc: "Extract data to spreadsheets.", icon: "📊", color: "#1e8449" },
    { id: "edit", label: "Edit PDF", desc: "Add text, images, or shapes.", icon: "✒️", color: "#8e44ad" },
    { id: "watermark", label: "Watermark", desc: "Stamp an image or text over PDF.", icon: "🖋️", color: "#34495e" },
    { id: "rotate", label: "Rotate PDF", desc: "Rotate pages the way you need.", icon: "🔄", color: "#d35400" },
    { id: "remove", label: "Remove Pages", desc: "Delete pages from your document.", icon: "🗑️", color: "#c0392b" },
  ];

  const theme = {
    bg: dark ? "#0b1220" : "#f4f6fb",
    card: dark ? "#0f172a" : "#ffffff",
    text: dark ? "#e5e7eb" : "#0f172a",
    sub: dark ? "#94a3b8" : "#64748b",
    border: dark ? "#1f2937" : "#e5e7eb",
    idle: dark ? "#111827" : "#eef2ff",
    brand: "#4f46e5"
  };

  // --- LOGIC ---
  const downloadFile = (bytes, name) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const handleMerge = async () => {
    if (files.length < 2) return alert("Upload at least 2 PDFs");
    const mergedPdf = await PDFDocument.create();
    for (let file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    }
    downloadFile(await mergedPdf.save(), "merged.pdf");
  };

  const handleRotate = async () => {
    if (!singleFile) return alert("Upload a PDF");
    const pdf = await PDFDocument.load(await singleFile.arrayBuffer());
    pdf.getPages().forEach((p) => p.setRotation(degrees(90)));
    downloadFile(await pdf.save(), "rotated.pdf");
  };

  // Note: PDF to Word/Excel usually requires server-side processing. 
  // Here we provide the UI for the workflow.
  const handlePlaceholder = () => alert("Conversion tools require a backend server. UI is ready!");

  // --- COMPONENTS ---
  const UploadBox = ({ onFiles, multiple = false }) => {
    const [drag, setDrag] = useState(false);
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${theme.border}`,
          borderRadius: 14,
          padding: isMobile ? 20 : 36,
          textAlign: "center",
          marginBottom: 16,
          background: drag ? "rgba(79,70,229,0.08)" : (dark ? "#020617" : "#fafbff"),
          width: "100%",
          color: theme.sub
        }}
      >
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Drag & Drop PDF here</div>
        <input type="file" multiple={multiple} onChange={(e) => onFiles(e.target.files)} />
      </div>
    );
  };

  const PrimaryButton = ({ onClick, label }) => (
    <button
      onClick={onClick}
      style={{
        padding: isMobile ? "12px 20px" : "14px 28px",
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        border: "none",
        borderRadius: 9999,
        cursor: "pointer",
        fontWeight: 700,
        width: isMobile ? "100%" : 260
      }}
    >
      {label}
    </button>
  );

  const HomeGrid = () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
      gap: 20,
      width: "100%"
    }}>
      {tools.map(tool => (
        <div
          key={tool.id}
          onClick={() => setActiveTab(tool.id)}
          style={{
            background: theme.card,
            padding: 24,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            cursor: "pointer",
            transition: "transform 0.2s",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 12
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-5px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          <div style={{ fontSize: 32 }}>{tool.icon}</div>
          <div style={{ fontWeight: 800, fontSize: 18, color: theme.text }}>{tool.label}</div>
          <div style={{ fontSize: 14, color: theme.sub }}>{tool.desc}</div>
        </div>
      ))}
    </div>
  );

  const Navbar = () => (
    <div style={{
      position: "sticky", top: 0, height: 64, display: "flex", alignItems: "center",
      justifyContent: "space-between", padding: "0 16px", background: theme.card,
      borderBottom: `1px solid ${theme.border}`, zIndex: 30
    }}>
      <div
        style={{ display: "flex", alignItems: "center", gap: 12, color: theme.text, fontWeight: 800, cursor: "pointer" }}
        onClick={() => setActiveTab("home")}
      >
        {isMobile && (
          <button onClick={(e) => { e.stopPropagation(); setSidebarOpen(!sidebarOpen) }} style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: theme.text }}>☰</button>
        )}
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }} />
        pdfWorld
      </div>
      <button onClick={() => setDark(!dark)} style={{ padding: "6px 12px", borderRadius: 9999, border: `1px solid ${theme.border}`, background: "transparent", color: theme.text, cursor: "pointer" }}>
        {dark ? "Light" : "Dark"}
      </button>
    </div>
  );

  const Sidebar = () => (
    <div style={{
      position: isMobile ? "fixed" : "relative",
      left: isMobile ? (sidebarOpen ? 0 : -260) : 0,
      top: isMobile ? 64 : 0,
      width: 260,
      background: theme.card,
      padding: 16,
      borderRight: isMobile ? `1px solid ${theme.border}` : "none",
      transition: "left .25s ease",
      zIndex: 25,
      height: isMobile ? "calc(100vh - 64px)" : "auto",
      overflowY: "auto"
    }}>
      <button onClick={() => { setActiveTab("home"); setSidebarOpen(false) }} style={{ width: "100%", textAlign: "left", padding: 12, border: "none", background: "transparent", color: theme.text, fontWeight: 800, cursor: "pointer" }}>🏠 Home</button>
      <div style={{ height: 1, background: theme.border, margin: "10px 0" }} />
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => { setActiveTab(tool.id); setSidebarOpen(false); }}
          style={{
            width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 10, border: "none", marginBottom: 4,
            background: activeTab === tool.id ? theme.brand : "transparent",
            color: activeTab === tool.id ? "#fff" : theme.text, cursor: "pointer", fontWeight: 600
          }}>
          {tool.icon} {tool.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: "sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 20, display: "flex", gap: 20 }}>
        {!isMobile && <Sidebar />}
        <div style={{ flex: 1 }}>
          {activeTab === "home" ? (
            <div>
              <h1 style={{ textAlign: "center", marginBottom: 10 }}>Every tool you need to work with PDFs</h1>
              <p style={{ textAlign: "center", color: theme.sub, marginBottom: 40 }}>All are 100% FREE and easy to use!</p>
              <HomeGrid />
            </div>
          ) : (
            <div style={{ background: theme.card, borderRadius: 20, padding: isMobile ? 20 : 40, border: `1px solid ${theme.border}`, minHeight: 400, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
              <h2 style={{ margin: 0 }}>{tools.find(t => t.id === activeTab)?.label}</h2>
              <p style={{ color: theme.sub, marginTop: -10 }}>{tools.find(t => t.id === activeTab)?.desc}</p>

              {activeTab === "merge" && <><UploadBox multiple onFiles={(f) => setFiles([...f])} /><PrimaryButton onClick={handleMerge} label="Merge PDFs" /></>}
              {activeTab === "rotate" && <><UploadBox onFiles={(f) => setSingleFile(f[0])} /><PrimaryButton onClick={handleRotate} label="Rotate 90°" /></>}

              {/* Other tools share a general UI for now */}
              {["split", "compress", "pdf-to-word", "word-to-pdf", "pdf-to-excel", "edit", "watermark", "remove"].includes(activeTab) && (
                <>
                  <UploadBox onFiles={(f) => setSingleFile(f[0])} />
                  {activeTab === "watermark" && <input type="text" placeholder="Watermark Text" style={{ padding: 12, borderRadius: 8, width: "100%", maxWidth: 300, border: `1px solid ${theme.border}` }} />}
                  <PrimaryButton onClick={handlePlaceholder} label="Upload & Process" />
                </>
              )}
              <button onClick={() => setActiveTab("home")} style={{ background: "transparent", border: "none", color: theme.brand, cursor: "pointer" }}>Back to home</button>
            </div>
          )}
        </div>
      </div>
      {isMobile && sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 20 }} />}
    </div>
  );
}