import React, { useEffect, useState } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

export default function App() {
  const [activeTab, setActiveTab] = useState("merge");
  const [dark, setDark] = useState(false);
  const [files, setFiles] = useState([]);
  const [splitFile, setSplitFile] = useState(null);
  const [rotateFile, setRotateFile] = useState(null);
  const [watermarkFile, setWatermarkFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [removePages, setRemovePages] = useState("");

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle Window Resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Close sidebar automatically if switching to desktop
      if (!mobile) setSidebarOpen(false);
    };
    handleResize(); // Set initial state
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const theme = {
    bg: dark ? "#0b1220" : "#f4f6fb",
    card: dark ? "#0f172a" : "#ffffff",
    text: dark ? "#e5e7eb" : "#0f172a",
    sub: dark ? "#94a3b8" : "#64748b",
    border: dark ? "#1f2937" : "#e5e7eb",
    idle: dark ? "#111827" : "#eef2ff",
    brand: "#4f46e5"
  };

  const downloadFile = (bytes, name) => {
    const blob = new Blob([bytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  // Logic Handlers (Unchanged)
  const handleMerge = async () => {
    if (files.length < 2) return alert("Upload at least 2 PDFs");
    const mergedPdf = await PDFDocument.create();
    for (let file of files) {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => mergedPdf.addPage(p));
    }
    const mergedBytes = await mergedPdf.save();
    downloadFile(mergedBytes, "merged.pdf");
  };

  const handleSplit = async () => {
    if (!splitFile) return alert("Upload a PDF to split");
    const bytes = await splitFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const total = pdf.getPageCount();
    for (let i = 0; i < total; i++) {
      const newPdf = await PDFDocument.create();
      const [page] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(page);
      const newBytes = await newPdf.save();
      downloadFile(newBytes, `page_${i + 1}.pdf`);
    }
  };

  const handleRotate = async () => {
    if (!rotateFile) return alert("Upload a PDF to rotate");
    const bytes = await rotateFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    pdf.getPages().forEach((p) => p.setRotation(degrees(90)));
    const newBytes = await pdf.save();
    downloadFile(newBytes, "rotated.pdf");
  };

  const handleWatermark = async () => {
    if (!watermarkFile || !watermarkText) return alert("Upload file & enter text");
    const bytes = await watermarkFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    pdf.getPages().forEach((page) => {
      const { width, height } = page.getSize();
      page.drawText(watermarkText, {
        x: width / 4,
        y: height / 2,
        size: 40,
        font,
        color: rgb(0.75, 0.75, 0.75),
        rotate: degrees(45),
      });
    });
    const newBytes = await pdf.save();
    downloadFile(newBytes, "watermarked.pdf");
  };

  const handleRemovePages = async () => {
    if (!removeFile || !removePages) return alert("Upload file & enter pages like 1,3");
    const pagesToRemove = removePages.split(",").map((n) => parseInt(n.trim()) - 1);
    const bytes = await removeFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    pagesToRemove.sort((a, b) => b - a).forEach((p) => pdf.removePage(p));
    const newBytes = await pdf.save();
    downloadFile(newBytes, "updated.pdf");
  };

  // UI Components
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
          padding: isMobile ? 20 : 40,
          textAlign: "center",
          marginBottom: 16,
          background: drag ? "rgba(79,70,229,0.08)" : (dark ? "#020617" : "#fafbff"),
          width: "100%",
          boxSizing: "border-box",
          color: theme.sub
        }}
      >
        <div style={{ marginBottom: 12, fontWeight: 600 }}>{drag ? "Drop now!" : "Select or Drag PDF"}</div>
        <input 
          type="file" 
          accept="application/pdf" 
          multiple={multiple}
          style={{ width: '100%', maxWidth: '250px' }}
          onChange={(e) => onFiles(e.target.files)} 
        />
      </div>
    );
  };

  const PrimaryButton = ({ onClick, label }) => (
    <button
      onClick={onClick}
      style={{
        padding: "14px 28px",
        background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
        color: "white",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 700,
        width: isMobile ? "100%" : "auto",
        minWidth: 200,
        boxShadow: "0 4px 12px rgba(79, 70, 229, 0.3)"
      }}
    >
      {label}
    </button>
  );

  const Navbar = () => (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 16px",
      background: theme.card,
      borderBottom: `1px solid ${theme.border}`,
      zIndex: 100
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: theme.text, fontWeight: 800 }}>
        {isMobile && (
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            style={{ border: "none", background: "transparent", fontSize: 24, cursor: "pointer", color: theme.text, padding: 8 }}
          >
            {sidebarOpen ? "✕" : "☰"}
          </button>
        )}
        <div style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }} />
        <span>pdfWorld</span>
      </div>
      <button 
        onClick={() => setDark(!dark)} 
        style={{ padding: "8px 16px", borderRadius: 9999, border: `1px solid ${theme.border}`, background: "transparent", color: theme.text, cursor: "pointer", fontSize: 13 }}
      >
        {dark ? "☀️ Light" : "🌙 Dark"}
      </button>
    </div>
  );

  const Tool = ({ id, label }) => (
    <button 
      onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "12px 16px",
        borderRadius: 12,
        border: "none",
        marginBottom: 8,
        background: activeTab === id ? theme.brand : "transparent",
        color: activeTab === id ? "#fff" : theme.text,
        cursor: "pointer",
        fontWeight: 600,
        transition: "0.2s"
      }}>
      {label}
    </button>
  );

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, fontFamily: 'system-ui, sans-serif' }}>
      <Navbar />

      {/* Mobile Backdrop Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 140,
            backdropFilter: "blur(2px)"
          }}
        />
      )}

      <div style={{ display: "flex", paddingTop: 64 }}>
        {/* Sidebar */}
        <div style={{
          position: isMobile ? "fixed" : "sticky",
          top: 64,
          left: 0,
          bottom: 0,
          width: 260,
          background: theme.card,
          padding: 16,
          borderRight: `1px solid ${theme.border}`,
          zIndex: 150,
          transition: "transform 0.3s ease",
          transform: isMobile && !sidebarOpen ? "translateX(-100%)" : "translateX(0)",
          height: "calc(100vh - 64px)",
          overflowY: "auto"
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.sub, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Tools</div>
          <Tool id="merge" label="Merge PDFs" />
          <Tool id="split" label="Split PDF" />
          <Tool id="rotate" label="Rotate Pages" />
          <Tool id="watermark" label="Add Watermark" />
          <Tool id="remove" label="Remove Pages" />
        </div>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          padding: isMobile ? "20px 16px" : "40px",
          maxWidth: 1000,
          margin: "0 auto",
          width: "100%",
          boxSizing: "border-box"
        }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: isMobile ? 24 : 32, marginBottom: 8, fontWeight: 800 }}>
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} PDF
            </h1>
            <p style={{ color: theme.sub }}>Fast, browser-based PDF tools without uploading to a server.</p>
          </div>

          <div style={{
            background: theme.card,
            borderRadius: 20,
            padding: isMobile ? 20 : 40,
            border: `1px solid ${theme.border}`,
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20
          }}>
            {activeTab === "merge" && (<><UploadBox multiple onFiles={(f) => setFiles([...f])} /><PrimaryButton onClick={handleMerge} label="Merge PDFs" /></>)}
            {activeTab === "split" && (<><UploadBox onFiles={(f) => setSplitFile(f[0])} /><PrimaryButton onClick={handleSplit} label="Split All Pages" /></>)}
            {activeTab === "rotate" && (<><UploadBox onFiles={(f) => setRotateFile(f[0])} /><PrimaryButton onClick={handleRotate} label="Rotate 90°" /></>)}
            
            {activeTab === "watermark" && (
              <>
                <UploadBox onFiles={(f) => setWatermarkFile(f[0])} />
                <input 
                  type="text" 
                  placeholder="Enter watermark text..." 
                  onChange={(e) => setWatermarkText(e.target.value)} 
                  style={{ padding: 14, borderRadius: 12, width: "100%", maxWidth: 400, border: `2px solid ${theme.border}`, background: dark ? "#020617" : "#fff", color: theme.text, fontSize: 16 }}
                />
                <PrimaryButton onClick={handleWatermark} label="Add Watermark" />
              </>
            )}

            {activeTab === "remove" && (
              <>
                <UploadBox onFiles={(f) => setRemoveFile(f[0])} />
                <input 
                  type="text" 
                  placeholder="Example: 1, 3, 5" 
                  onChange={(e) => setRemovePages(e.target.value)} 
                  style={{ padding: 14, borderRadius: 12, width: "100%", maxWidth: 400, border: `2px solid ${theme.border}`, background: dark ? "#020617" : "#fff", color: theme.text, fontSize: 16 }}
                />
                <PrimaryButton onClick={handleRemovePages} label="Remove Pages" />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}