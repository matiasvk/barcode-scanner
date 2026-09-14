import React, { useState, type ChangeEvent } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

export const BarcodeImageReader: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [barcodeFormat, setBarcodeFormat] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Erillinen funktio manuaalista ja automaattista kopiointia varten
  const copyToClipboard = async (text: string) => {
    if (!navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (clipboardError) {
      console.warn("Clipboard access denied or failed.", clipboardError);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setScanResult(null);
    setBarcodeFormat(null);
    setError(null);
    setCopied(false);
    setLoading(true);

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    let textResult: string | null = null;
    let formatResult: string | null = null;

    try {
      const codeReader = new BrowserMultiFormatReader();
      const result: Result = await codeReader.decodeFromImageUrl(imageUrl);
      
      textResult = result.getText();
      formatResult = result.getBarcodeFormat().toString();
      
      setScanResult(textResult);
      setBarcodeFormat(formatResult);
    } catch (err) {
      setError("No visible barcode could be detected. Try a clearer image.");
      console.error("Barcode decoding failed:", err);
    } finally {
      setLoading(false);
    }

    // Yritetään automaattista kopiointia taustalla
    if (textResult) {
      await copyToClipboard(textResult);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px' }}>
      <h2>Barcode Image Scanner</h2>
      
      <div style={{ marginBottom: '15px' }}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageUpload} 
          style={{ display: 'block', marginBottom: '10px' }}
        />
      </div>

      {loading && <p>Processing image...</p>}

      {imagePreview && (
        <div style={{ margin: '15px 0' }}>
          <h4>Uploaded Image:</h4>
          <img 
            src={imagePreview} 
            alt="Barcode source" 
            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '4px' }} 
          />
        </div>
      )}

      {scanResult && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#e6f4ea', 
          border: '1px solid #137333', 
          borderRadius: '4px', 
          display: 'flex', 
          justifyContent: 'between', 
          alignItems: 'center',
          gap: '15px'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 5px 0', wordBreak: 'break-all' }}><strong>Result:</strong> {scanResult}</p>
            <p style={{ margin: 0, fontSize: '0.85em', color: '#137333' }}><strong>Format:</strong> {barcodeFormat}</p>
          </div>
          
          {/* Manuaalinen kopiointinappi */}
          <button 
            onClick={() => copyToClipboard(scanResult)}
            style={{
              backgroundColor: copied ? '#137333' : '#fff',
              color: copied ? '#fff' : '#137333',
              border: '1px solid #137333',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#fce8e6', border: '1px solid #c5221f', borderRadius: '4px', color: '#c5221f' }}>
          {error}
        </div>
      )}
    </div>
  );
};
