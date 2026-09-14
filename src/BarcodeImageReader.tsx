import React, { useState, type ChangeEvent } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

export const BarcodeImageReader: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [barcodeFormat, setBarcodeFormat] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false); // Uusi tila kopiointi-ilmoitukselle

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Nollataan vanhat tilat uutta skannausta varten
    setScanResult(null);
    setBarcodeFormat(null);
    setError(null);
    setCopied(false);
    setLoading(true);

    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);

    try {
      const codeReader = new BrowserMultiFormatReader();
      const result: Result = await codeReader.decodeFromImageUrl(imageUrl);
      
      const textResult = result.getText();
      setScanResult(textResult);
      setBarcodeFormat(result.getBarcodeFormat().toString());

      // Automaattinen kopiointi leikepöydälle
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(textResult);
        setCopied(true);
        // Piilotetaan "Copied!"-teksti 3 sekunnin kuluttua
        setTimeout(() => setCopied(false), 3000);
      }
    } catch (err) {
      setError("No visible barcode could be detected. Try a clearer image.");
      console.error(err);
    } finally {
      setLoading(false);
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
        <div style={{ padding: '10px', backgroundColor: '#e6f4ea', border: '1px solid #137333', borderRadius: '4px', position: 'relative' }}>
          <p style={{ margin: '0 0 5px 0' }}><strong>Result:</strong> {scanResult}</p>
          <p style={{ margin: 0, fontSize: '0.85em', color: '#137333' }}><strong>Format:</strong> {barcodeFormat}</p>
          
          {/* Visuaalinen kuittaus kopioinnista */}
          {copied && (
            <span style={{ 
              position: 'absolute', 
              top: '10px', 
              right: '10px', 
              backgroundColor: '#137333', 
              color: 'white', 
              fontSize: '0.75em', 
              padding: '2px 6px', 
              borderRadius: '3px',
              fontWeight: 'bold'
            }}>
              Copied to clipboard!
            </span>
          )}
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
