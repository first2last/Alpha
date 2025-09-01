import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  Image,
  VideoFile,
  AudioFile,
  Cancel
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const FileUpload = ({ 
  onFilesSelect, 
  maxFiles = 5, 
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'video/*': ['.mp4', '.avi', '.mov'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt']
  }
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        const errorTypes = errors.map(e => e.code);
        if (errorTypes.includes('file-too-large')) {
          return `${file.name} is too large (max ${maxFileSize / (1024 * 1024)}MB)`;
        }
        if (errorTypes.includes('file-invalid-type')) {
          return `${file.name} is not a supported file type`;
        }
        return `${file.name} was rejected`;
      });
      
      setError(errorMessages.join(', '));
      toast.error('Some files were rejected');
      return;
    }

    // Check total file count
    if (selectedFiles.length + acceptedFiles.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Add preview URLs and metadata
    const filesWithPreview = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setSelectedFiles(prev => [...prev, ...filesWithPreview]);
    toast.success(`${acceptedFiles.length} file(s) added`);
  }, [selectedFiles, maxFiles, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple: true
  });

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      // Revoke preview URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updatedFiles;
    });
    toast.success('File removed');
  };

  const clearAllFiles = () => {
    selectedFiles.forEach(fileObj => {
      if (fileObj.preview) {
        URL.revokeObjectURL(fileObj.preview);
      }
    });
    setSelectedFiles([]);
    setUploadProgress({});
    setError('');
    toast.success('All files cleared');
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      toast.error('No files selected');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      const uploadPromises = selectedFiles.map(async (fileObj) => {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        
        return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          
          // Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(prev => ({
                ...prev,
                [fileObj.id]: progress
              }));
            }
          };
          
          xhr.onload = () => {
            if (xhr.status === 200) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              reject(new Error(`Upload failed for ${fileObj.name}`));
            }
          };
          
          xhr.onerror = () => reject(new Error(`Upload failed for ${fileObj.name}`));
          
          xhr.open('POST', '/api/upload');
          xhr.send(formData);
        });
      });

      const results = await Promise.all(uploadPromises);
      onFilesSelect(results);
      
      toast.success('All files uploaded successfully!');
      clearAllFiles();
    } catch (err) {
      setError(err.message || 'Upload failed');
      toast.error('Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image color="primary" />;
    if (type.startsWith('video/')) return <VideoFile color="secondary" />;
    if (type.startsWith('audio/')) return <AudioFile color="success" />;
    return <InsertDriveFile color="action" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box>
      {/* Dropzone Area */}
      <Card
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'primary.light' : 'grey.50',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'primary.light'
          }
        }}
      >
        <input {...getInputProps()} />
        <CardContent>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            py={4}
          >
            <CloudUpload 
              sx={{ 
                fontSize: 48, 
                color: isDragActive ? 'primary.main' : 'grey.400',
                mb: 2 
              }} 
            />
            <Typography variant="h6" gutterBottom>
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              or click to select files
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Supported: Images, Videos, PDFs, Documents (Max {maxFileSize / (1024 * 1024)}MB each, {maxFiles} files max)
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          action={
            <IconButton size="small" onClick={() => setError('')}>
              <Cancel />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">
                Selected Files ({selectedFiles.length}/{maxFiles})
              </Typography>
              <Button
                size="small"
                color="error"
                onClick={clearAllFiles}
                disabled={uploading}
              >
                Clear All
              </Button>
            </Box>

            <List dense>
              {selectedFiles.map((fileObj) => (
                <ListItem key={fileObj.id} divider>
                  <ListItemIcon>
                    {getFileIcon(fileObj.type)}
                  </ListItemIcon>
                  
                  <ListItemText
                    primary={fileObj.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(fileObj.size)}
                        </Typography>
                        {uploadProgress[fileObj.id] !== undefined && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress 
                              variant="determinate" 
                              value={uploadProgress[fileObj.id]} 
                            />
                            <Typography variant="caption">
                              {uploadProgress[fileObj.id]}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  
                  <ListItemSecondaryAction>
                    <Chip
                      label={fileObj.type.split('/')[0]}
                      size="small"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      edge="end" 
                      onClick={() => removeFile(fileObj.id)}
                      disabled={uploading}
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      {selectedFiles.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={uploadFiles}
            disabled={uploading}
            startIcon={<CloudUpload />}
          >
            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default FileUpload;
