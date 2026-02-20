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
          padding: 36,
          textAlign: "center",
          marginBottom: 16,
          background: drag ? "rgba(79,70,229,0.08)" : (dark ? "#020617" : "#fafbff"),
          width: "100%",
          color: theme.sub
        }}
      >
        <div style={{ marginBottom: 8, fontWeight: 600 }}>Drag & Drop PDF here</div>
        <input
          type="file"
          accept="application/pdf"
          multiple={multiple}
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
        borderRadius: 9999,
        cursor: "pointer",
        fontWeight: 700,
        boxShadow: "0 12px 28px rgba(79,70,229,0.35)",
        minWidth: 260
      }}
    >
      {label}
    </button>
  );

  const Navbar = () => (
    <div style={{
      position: "sticky",
      top: 0,
      height: 64,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      background: theme.card,
      borderBottom: `1px solid ${theme.border}`,
      zIndex: 10
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: theme.text, fontWeight: 800 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg,#4f46e5,#7c3aed)" }} />
        pdfWorld
      </div>
      <button
        onClick={() => setDark(!dark)}
        style={{
          padding: "8px 14px",
          borderRadius: 9999,
          border: `1px solid ${theme.border}`,
          background: "transparent",
          color: theme.text,
          cursor: "pointer"
        }}
      >
        {dark ? "Light" : "Dark"} Mode
      </button>
    </div>
  );

  const Tool = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "14px 16px",
        borderRadius: 12,
        border: "none",
        marginBottom: 8,
        background: activeTab === id ? theme.brand : theme.idle,
        color: activeTab === id ? "#fff" : theme.text,
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      {label}
    </button>
  );

  const Workspace = () => (
    <div style={{
      background: theme.card,
      borderRadius: 20,
      padding: 28,
      border: `1px solid ${theme.border}`,
      width: "100%",
      minHeight: 420,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 16,
      color: theme.text
    }}>
      {activeTab === "merge" && (
        <>
          <UploadBox multiple onFiles={(f) => setFiles([...f])} />
          <PrimaryButton onClick={handleMerge} label="Merge & Download" />
        </>
      )}
      {activeTab === "split" && (
        <>
          <UploadBox onFiles={(f) => setSplitFile(f[0])} />
          <PrimaryButton onClick={handleSplit} label="Split & Download" />
        </>
      )}
      {activeTab === "rotate" && (
        <>
          <UploadBox onFiles={(f) => setRotateFile(f[0])} />
          <PrimaryButton onClick={handleRotate} label="Rotate 90° & Download" />
        </>
      )}
      {activeTab === "watermark" && (
        <>
          <UploadBox onFiles={(f) => setWatermarkFile(f[0])} />
          <input
            type="text"
            placeholder="Enter watermark text"
            onChange={(e) => setWatermarkText(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              width: "100%",
              maxWidth: 420,
              border: `1px solid ${theme.border}`,
              background: dark ? "#020617" : "#fff",
              color: theme.text
            }}
          />
          <PrimaryButton onClick={handleWatermark} label="Add Watermark" />
        </>
      )}
      {activeTab === "remove" && (
        <>
          <UploadBox onFiles={(f) => setRemoveFile(f[0])} />
          <input
            type="text"
            placeholder="Pages to remove (e.g. 1,3)"
            onChange={(e) => setRemovePages(e.target.value)}
            style={{
              padding: 12,
              borderRadius: 10,
              width: "100%",
              maxWidth: 420,
              border: `1px solid ${theme.border}`,
              background: dark ? "#020617" : "#fff",
              color: theme.text
            }}
          />
          <PrimaryButton onClick={handleRemovePages} label="Remove & Download" />
        </>
      )}
    </div>
  );

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
      <Navbar />
      <div
        style={{
          maxWidth: 1200,
          margin: "24px auto",
          padding: "0 20px",
          display: "grid",
          gridTemplateColumns: "260px 1fr",
          gap: 20
        }}
      >
        <div
          style={{
            background: theme.card,
            borderRadius: 20,
            padding: 16,
            border: `1px solid ${theme.border}`,
            height: "fit-content"
          }}
        >
          <Tool id="merge" label="Merge PDFs" />
          <Tool id="split" label="Split PDF" />
          <Tool id="rotate" label="Rotate Pages" />
          <Tool id="watermark" label="Add Watermark" />
          <Tool id="remove" label="Remove Pages" />
        </div>
        <Workspace />
      </div>
    </div>
  );
}
