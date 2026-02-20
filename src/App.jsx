import React, { useState } from "react";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

export default function App() {
  const [activeTab, setActiveTab] = useState("merge");
  const [files, setFiles] = useState([]);
  const [splitFile, setSplitFile] = useState(null);
  const [rotateFile, setRotateFile] = useState(null);
  const [watermarkFile, setWatermarkFile] = useState(null);
  const [removeFile, setRemoveFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState("");
  const [removePages, setRemovePages] = useState("");

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

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      style={{ padding: 10, marginRight: 8, borderRadius: 8, border: "1px solid #ccc", background: activeTab === id ? "#eee" : "#fff" }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "Arial" }}>
      <h2 style={{ textAlign: "center" }}>Vikash PDF Toolkit</h2>

      <div style={{ marginBottom: 16 }}>
        <TabButton id="merge" label="Merge" />
        <TabButton id="split" label="Split" />
        <TabButton id="rotate" label="Rotate" />
        <TabButton id="watermark" label="Watermark" />
        <TabButton id="remove" label="Remove Pages" />
      </div>

      {activeTab === "merge" && (
        <div>
          <input type="file" accept="application/pdf" multiple onChange={(e) => setFiles([...e.target.files])} />
          <br /><br />
          <button onClick={handleMerge}>Merge & Download</button>
        </div>
      )}

      {activeTab === "split" && (
        <div>
          <input type="file" accept="application/pdf" onChange={(e) => setSplitFile(e.target.files[0])} />
          <br /><br />
          <button onClick={handleSplit}>Split & Download</button>
        </div>
      )}

      {activeTab === "rotate" && (
        <div>
          <input type="file" accept="application/pdf" onChange={(e) => setRotateFile(e.target.files[0])} />
          <br /><br />
          <button onClick={handleRotate}>Rotate 90° & Download</button>
        </div>
      )}

      {activeTab === "watermark" && (
        <div>
          <input type="file" accept="application/pdf" onChange={(e) => setWatermarkFile(e.target.files[0])} />
          <br /><br />
          <input type="text" placeholder="Enter watermark text" onChange={(e) => setWatermarkText(e.target.value)} />
          <br /><br />
          <button onClick={handleWatermark}>Add Watermark</button>
        </div>
      )}

      {activeTab === "remove" && (
        <div>
          <input type="file" accept="application/pdf" onChange={(e) => setRemoveFile(e.target.files[0])} />
          <br /><br />
          <input type="text" placeholder="Pages to remove (e.g. 1,3)" onChange={(e) => setRemovePages(e.target.value)} />
          <br /><br />
          <button onClick={handleRemovePages}>Remove & Download</button>
        </div>
      )}
    </div>
  );
}