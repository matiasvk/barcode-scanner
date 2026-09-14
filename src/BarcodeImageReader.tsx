import React, { useState, type ChangeEvent } from 'react';
import { BrowserMultiFormatReader, Result } from '@zxing/library';

export const BarcodeImageReader: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [barcodeFormat, setBarcodeFormat] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

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

    // 1. Vaihe: Yritetään lukea viivakoodi kuvasta
    let textResult: string | null = null;
    let formatResult: string | null = null;

    try {
      const codeReader = new BrowserMultiFormatReader();
      const result: Result = await codeReader.decodeFromImageUrl(imageUrl);
      
      textResult = result.getText();
      formatResult = result.getBarcodeFormat().toString();
      
      // Päivitetään onnistunut tulos heti näkyviin ruudulle
      setScanResult(textResult);
      setBarcodeFormat(formatResult);
    } catch (err) {
      // Virhe näytetään VAIN jos viivakoodia ei pystytty lukemaan laisinkaan
      setError("No visible barcode could be detected. Try a clearer image.");
      console.error("Barcode decoding failed:", err);
    } finally {
      setLoading(false);
    }

    // 2. Vaihe: Yritetään kopioida leikepöydälle VASTA kun lukeminen on varmasti onnistunut
    // Tämä on kokonaan ensimmäisen try-catchin ulkopuolella, joten se ei voi aiheuttaa virheilmoitusta
    if (textResult && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(textResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (clipboardError) {
        // Vaimennetaan hiljaa, jos selain tai suojaus estää automaattisen kopioinnin
        console.warn("Clipboard access denied, skipped auto-copy.", clipboardError);
      }
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
              Copied!
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
