import React, { useState, useRef } from 'react';
import { useApp } from '../hooks/useApp';

export default function ImagePickerModal({ currentImg, onSelect, onClose }) {
  const { IMAGES } = useApp();
  const [pending, setPending] = useState(currentImg || IMAGES[0].u);
  const [customImgs, setCustomImgs] = useState([]);
  const fileRef = useRef();

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomImgs(prev => [{ u: url, l: 'Custom' }, ...prev]);
    setPending(url);
  }

  const allImgs = [...customImgs, ...IMAGES];

  return (
    <div className="modal-overlay" style={{ zIndex: 110 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 500 }}>
        <div className="modal-head">
          <h2>Choose Cover Image</h2>
          <div className="modal-x" onClick={onClose}>✕</div>
        </div>
        <div className="modal-body">
          <div className="sec-label">Curated Photos</div>
          <div className="img-grid">
            {allImgs.map((img, i) => (
              <div key={i} className={`img-opt ${pending === img.u ? 'on' : ''}`} onClick={() => setPending(img.u)}>
                <img src={img.u} alt={img.l} loading="lazy" />
                <div className="img-opt-check">✓</div>
              </div>
            ))}
          </div>
          <div className="upload-zone" onClick={() => fileRef.current.click()}>
            <div style={{ fontSize: 26 }}>↑</div>
            <p>Click to upload your own photo</p>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={() => onSelect(pending)}>Apply Image</button>
        </div>
      </div>
    </div>
  );
}
