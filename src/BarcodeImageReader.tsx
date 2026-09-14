import React, { useState, type ChangeEvent } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

export const BarcodeImageReader: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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
    setError(null);
    setCopied(false);
    setLoading(true);

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    let textResult: string | null = null;

    try {
      const codeReader = new BrowserMultiFormatReader();
      const result: Result = await codeReader.decodeFromImageUrl(imageUrl);
      
      textResult = result.getText();
      setScanResult(textResult);
    } catch (err) {
      setError("No visible barcode could be detected. Try a clearer image.");
      console.error("Barcode decoding failed:", err);
    } finally {
      setLoading(false);
    }

    if (textResult) {
      await copyToClipboard(textResult);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '500px', width: '100%', boxSizing: 'border-box' }}>
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
          flexDirection: 'column', 
          alignItems: 'center', // Keskittää sisällön pystysuunnassa/vaakasuunnassa
          gap: '15px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, wordBreak: 'break-all' }}>
            <strong>Result:</strong> {scanResult}
          </p>
          
          {/* Painike siirretty tuloksen alle keskelle */}
          <button 
            onClick={() => copyToClipboard(scanResult)}
            style={{
              backgroundColor: copied ? '#137333' : '#fff',
              color: copied ? '#fff' : '#137333',
              border: '1px solid #137333',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              width: 'fit-content',
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
