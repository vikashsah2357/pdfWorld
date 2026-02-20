import React, { useState } from "react";
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

  const theme = {
    bg: dark ? "#0f172a" : "#f1f5f9",
    card: dark ? "#111827" : "#ffffff",
    text: dark ? "#e5e7eb" : "#111827",
    sub: dark ? "#94a3b8" : "#64748b",
    border: dark ? "#334155" : "#cbd5e1",
    tabIdle: dark ? "#1f2937" : "#e5e7eb",
  };

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
    const pages = pdf.getPages();
    pages.forEach((p) => p.setRotation(degrees(90)));
    const newBytes = await pdf.save();
    downloadFile(newBytes, "rotated.pdf");
  };

  const handleWatermark = async () => {
    if (!watermarkFile || !watermarkText) return alert("Upload file & enter text");
    const bytes = await watermarkFile.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const font = await pdf.embedFont(StandardFonts.HelveticaBold);
    const pages = pdf.getPages();
    pages.forEach((page) => {
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

  const Icon = ({ path }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
      <path d={path} />
    </svg>
  );

  const TabButton = ({ id, label, icon }) => {
    const [hover, setHover] = useState(false);
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          borderRadius: 9999,
          border: "none",
          cursor: "pointer",
          background: active ? "#2563eb" : theme.tabIdle,
          color: active ? "#fff" : theme.text,
          fontWeight: 600,
          transform: hover ? "translateY(-1px) scale(1.03)" : "scale(1)",
          boxShadow: active || hover ? "0 10px 24px rgba(37,99,235,0.25)" : "none",
          transition: "all .18s ease"
        }}
      >
        {icon}
        {label}
      </button>
    );
  };

  const Card = ({ children }) => (
    <div
      style={{
        background: theme.card,
        padding: 24,
        borderRadius: 16,
        boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
        margin: "16px auto",
        maxWidth: 560,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: theme.text
      }}
    >
      {children}
    </div>
  );

  const UploadBox = ({ onFiles, multiple=false }) => {
    const [drag, setDrag] = useState(false);
    return (
      <div
        onDragOver={(e)=>{e.preventDefault();setDrag(true);}}
        onDragLeave={()=>setDrag(false)}
        onDrop={(e)=>{e.preventDefault();setDrag(false); onFiles(e.dataTransfer.files);}}
        style={{
          border: `2px dashed ${theme.border}`,
          borderRadius: 12,
          padding: 28,
          textAlign: "center",
          margin: "0 auto 16px",
          background: drag ? "rgba(37,99,235,0.08)" : (dark?"#020617":"#f8fafc"),
          width: "100%",
          maxWidth: 440,
          color: theme.sub
        }}
      >
        <div style={{ marginBottom: 8 }}>Drag & Drop PDF here</div>
        <input type="file" accept="application/pdf" multiple={multiple}
          onChange={(e)=>onFiles(e.target.files)} />
      </div>
    );
  };

  const PrimaryButton = ({ onClick, label }) => {
    const [hover, setHover] = useState(false);
    return (
      <button
        onClick={onClick}
        onMouseEnter={()=>setHover(true)}
        onMouseLeave={()=>setHover(false)}
        style={{
          padding: "12px 26px",
          background: "linear-gradient(135deg, #2563eb, #7c3aed)",
          color: "white",
          border: "none",
          borderRadius: 9999,
          cursor: "pointer",
          fontWeight: 700,
          letterSpacing: 0.3,
          boxShadow: hover ? "0 14px 28px rgba(99,102,241,0.45)" : "0 10px 24px rgba(99,102,241,0.35)",
          transform: hover ? "translateY(-1px) scale(1.03)" : "scale(1)",
          transition: "all .18s ease",
          margin: "8px auto 0",
          display: "block",
          minWidth: 240
        }}
      >
        {label}
      </button>
    );
  };

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
      padding: "0 20px",
      background: dark ? "#020617" : "#ffffff",
      borderBottom: `1px solid ${theme.border}`,
      zIndex: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: theme.text, fontWeight: 800 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#2563eb,#7c3aed)" }} />
        pdfWorld
      </div>
      <button onClick={()=>setDark(!dark)} style={{
        padding: "8px 14px",
        borderRadius: 9999,
        border: `1px solid ${theme.border}`,
        background: "transparent",
        color: theme.text,
        cursor: "pointer"
      }}>{dark?"Light":"Dark"} Mode</button>
    </div>
  );

  return (
    <div style={{ 
      background: theme.bg, 
      minHeight: "100vh", 
      paddingTop: 88,
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <Navbar />
      <div style={{ 
        maxWidth: 900, 
        width: "100%", 
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <h1 style={{ textAlign: "center", marginBottom: 6, color: theme.text }}>pdfWorld</h1>
        <p style={{ textAlign: "center", color: theme.sub }}>Merge, Split, Rotate & Watermark</p>

        <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
          <TabButton id="merge" label="Merge" icon={<Icon path="M7 7h10v10H7z"/>} />
          <TabButton id="split" label="Split" icon={<Icon path="M4 4h7v7H4zM13 13h7v7h-7z"/>} />
          <TabButton id="rotate" label="Rotate" icon={<Icon path="M12 4v4l3-3-3-1zM6 20a8 8 0 1112-6"/>} />
          <TabButton id="watermark" label="Watermark" icon={<Icon path="M12 2l4 8-4 2-4-2z"/>} />
          <TabButton id="remove" label="Remove Pages" icon={<Icon path="M6 7h12M9 7v10m6-10v10"/>} />
        </div>

        {activeTab === "merge" && (
          <Card>
            <UploadBox multiple onFiles={(f)=>setFiles([...f])} />
            <PrimaryButton onClick={handleMerge} label="Merge & Download" />
          </Card>
        )}

        {activeTab === "split" && (
          <Card>
            <UploadBox onFiles={(f)=>setSplitFile(f[0])} />
            <PrimaryButton onClick={handleSplit} label="Split & Download" />
          </Card>
        )}

        {activeTab === "rotate" && (
          <Card>
            <UploadBox onFiles={(f)=>setRotateFile(f[0])} />
            <PrimaryButton onClick={handleRotate} label="Rotate 90° & Download" />
          </Card>
        )}

        {activeTab === "watermark" && (
          <Card>
            <UploadBox onFiles={(f)=>setWatermarkFile(f[0])} />
            <input
              type="text"
              placeholder="Enter watermark text"
              onChange={(e)=>setWatermarkText(e.target.value)}
              style={{ padding: 12, borderRadius: 10, width: "100%", maxWidth: 440, margin: "0 auto 16px", border: `1px solid ${theme.border}`, display: "block", background: dark?"#020617":"#fff", color: theme.text }}
            />
            <PrimaryButton onClick={handleWatermark} label="Add Watermark" />
          </Card>
        )}

        {activeTab === "remove" && (
          <Card>
            <UploadBox onFiles={(f)=>setRemoveFile(f[0])} />
            <input
              type="text"
              placeholder="Pages to remove (e.g. 1,3)"
              onChange={(e)=>setRemovePages(e.target.value)}
              style={{ padding: 12, borderRadius: 10, width: "100%", maxWidth: 440, margin: "0 auto 16px", border: `1px solid ${theme.border}`, display: "block", background: dark?"#020617":"#fff", color: theme.text }}
            />
            <PrimaryButton onClick={handleRemovePages} label="Remove & Download" />
          </Card>
        )}
      </div>
    </div>
  );
}
