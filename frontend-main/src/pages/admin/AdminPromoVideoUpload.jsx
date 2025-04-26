import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

const AdminPromoVideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    if (!videoFile || !title) {
      setMessage('Please provide a title and select a video file.');
      setSuccess(false);
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('title', title);
    formData.append('description', description);

    try {
      setUploading(true);
      setMessage('');

      const token = localStorage.getItem('adminToken') || localStorage.getItem('token'); // Use admin token if required
      const response = await axios.post(`${API_BASE_URL}/api/promotions/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      setMessage('✅ Video uploaded successfully!');
      setTitle('');
      setDescription('');
      setVideoFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      setSuccess(false);
      setMessage(error.response?.data?.message || '❌ Failed to upload video.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: 600, margin: "0 auto", border: "1px solid #ccc", borderRadius: 8 }}>
      <h2 style={{ textAlign: 'center' }}>Upload Promotional Video</h2>

      {message && (
        <p style={{ color: success ? "green" : "red", textAlign: "center" }}>{message}</p>
      )}

      <div style={{ marginBottom: 12 }}>
        <label>Video Title:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter video title"
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Description (optional):</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
          rows={3}
          style={{ width: "100%", padding: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>Select Video File:</label><br />
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />
      </div>

      {videoFile && (
        <div style={{ margin: "15px 0" }}>
          <video controls width="100%" style={{ borderRadius: 6 }}>
            <source src={URL.createObjectURL(videoFile)} type="video/mp4" />
          </video>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{
          padding: "10px 20px",
          background: uploading ? "#ccc" : "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: 4,
          cursor: uploading ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>
    </div>
  );
};

export default AdminPromoVideoUpload;
