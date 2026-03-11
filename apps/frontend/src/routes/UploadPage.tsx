import React, { useState } from 'react';
import { Container, Typography, Button, Box, Alert, LinearProgress } from '@mui/material';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError('');
    setUploading(true);

    // INTENTIONAL: no auth required, no file type validation, original filename preserved
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Upload Prescription</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Upload your prescription file. Any file type accepted.
      </Typography>
      <Typography variant="body2" color="warning.main" mb={2}>
        INTENTIONAL: No auth required, no MIME validation, original filename preserved, stored in web-accessible directory.
      </Typography>

      <Box component="form" onSubmit={handleUpload}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          style={{ marginBottom: 16, display: 'block' }}
        />
        {uploading && <LinearProgress sx={{ mb: 2 }} />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" disabled={!file || uploading}>
          Upload
        </Button>
      </Box>

      {result && (
        <Box mt={3}>
          <Alert severity="success">File uploaded successfully!</Alert>
          <Typography mt={1}>
            Path: <a href={result.path} target="_blank" rel="noopener noreferrer">{result.path}</a>
          </Typography>
        </Box>
      )}
    </Container>
  );
}
