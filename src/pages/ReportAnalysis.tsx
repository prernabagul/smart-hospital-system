import React, { useState } from 'react';

interface AnalysisResult {
  fileName: string;
  summary: string;
  keyMetrics: { metric: string; value: string; status: 'normal' | 'attention' }[];
  recommendation: string;
}

export const ReportAnalysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysis(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setAnalysis(null);

    // Simulate AI medical report analysis
    setTimeout(() => {
      setAnalysis({
        fileName: selectedFile.name,
        summary: 'Complete Blood Count (CBC) and Metabolic Panel analysis complete.',
        keyMetrics: [
          { metric: 'Hemoglobin', value: '14.2 g/dL', status: 'normal' },
          { metric: 'WBC Count', value: '11.5 x10^3/µL', status: 'attention' },
          { metric: 'Fasting Blood Sugar', value: '95 mg/dL', status: 'normal' },
          { metric: 'Platelet Count', value: '250 x10^3/µL', status: 'normal' },
        ],
        recommendation: 'Slightly elevated White Blood Cell (WBC) count detected. This may indicate a mild immune response or localized inflammation. Routine follow-up recommended.'
      });
      setAnalyzing(false);
    }, 1200);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px' }}>📄 AI Medical Report Analyzer</h1>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>Upload your laboratory report or diagnostic scan for AI-assisted insights.</p>

        {/* Upload Box */}
        <div style={{ border: '2px dashed #0d9488', borderRadius: '12px', padding: '32px', textAlign: 'center', backgroundColor: '#f0fdfa', marginBottom: '20px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>📤</div>
          <p style={{ fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>Select Blood Test or Diagnostic Report (PDF / PNG / JPG)</p>
          
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            style={{ marginTop: '12px', display: 'inline-block' }}
          />

          {selectedFile && (
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#0d9488', fontWeight: 'bold' }}>
              Selected File: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || analyzing}
          style={{
            backgroundColor: selectedFile && !analyzing ? '#0d9488' : '#94a3b8',
            color: '#ffffff',
            fontWeight: 'bold',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '8px',
            cursor: selectedFile && !analyzing ? 'pointer' : 'not-allowed',
            width: '100%'
          }}
        >
          {analyzing ? 'Analyzing Report with AI...' : 'Analyze Report Now'}
        </button>

        {/* Analysis Results Display */}
        {analysis && (
          <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>Analysis Results: {analysis.fileName}</h3>
            <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>{analysis.summary}</p>

            <h4 style={{ fontWeight: 'bold', fontSize: '15px', color: '#334155', marginBottom: '8px' }}>Key Metrics Extracted:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {analysis.keyMetrics.map((item, idx) => (
                <div key={idx} style={{ padding: '10px', borderRadius: '8px', backgroundColor: item.status === 'attention' ? '#fef2f2' : '#ffffff', border: `1px solid ${item.status === 'attention' ? '#fca5a5' : '#e2e8f0'}` }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>{item.metric}</div>
                  <div style={{ fontWeight: 'bold', color: item.status === 'attention' ? '#dc2626' : '#0f172a' }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: '12px', backgroundColor: '#e0f2fe', borderRadius: '8px', border: '1px solid #bae6fd', color: '#0369a1', fontSize: '14px' }}>
              💡 <strong>AI Insights:</strong> {analysis.recommendation}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
