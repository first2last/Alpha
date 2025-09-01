const cloudinary = require('../config/cloudinary');

class FileUploadUtil {
  // Upload single file to cloudinary
  static async uploadToCloudinary(file, options = {}) {
    try {
      const { folder = 'alpha-chat-files', resourceType = 'auto' } = options;
      
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'avi', 'mov'],
            max_file_size: 10 * 1024 * 1024, // 10MB
            transformation: resourceType === 'image' ? [
              { width: 1000, height: 1000, crop: 'limit', quality: 'auto' }
            ] : undefined
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(file.buffer);
      });
    } catch (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  // Delete file from cloudinary
  static async deleteFromCloudinary(publicId, resourceType = 'image') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });
      return result;
    } catch (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  // Get file type based on mimetype
  static getFileType(mimetype) {
    if (mimetype.startsWith('image/')) {
      return 'image';
    } else if (mimetype.startsWith('video/')) {
      return 'video';
    } else if (mimetype.startsWith('audio/')) {
      return 'audio';
    } else {
      return 'file';
    }
  }

  // Validate file size
  static validateFileSize(fileSize, maxSize = 10 * 1024 * 1024) {
    if (fileSize > maxSize) {
      throw new Error(`File size exceeds maximum limit of ${maxSize / (1024 * 1024)}MB`);
    }
    return true;
  }

  // Validate file type
  static validateFileType(mimetype, allowedTypes = []) {
    if (allowedTypes.length === 0) {
      // Default allowed types
      allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
        'video/mp4', 'video/avi', 'video/mov',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
    }

    if (!allowedTypes.includes(mimetype)) {
      throw new Error(`File type ${mimetype} is not allowed`);
    }
    return true;
  }

  // Generate unique filename
  static generateUniqueFileName(originalName) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${random}.${extension}`;
  }

  // Format file size for display
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension
  static getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
  }

  // Check if file is image
  static isImageFile(mimetype) {
    return mimetype.startsWith('image/');
  }

  // Check if file is video
  static isVideoFile(mimetype) {
    return mimetype.startsWith('video/');
  }

  // Check if file is audio
  static isAudioFile(mimetype) {
    return mimetype.startsWith('audio/');
  }

  // Process multiple files upload
  static async uploadMultipleFiles(files, options = {}) {
    try {
      const uploadPromises = files.map(file => 
        this.uploadToCloudinary(file, options)
      );
      
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      throw new Error(`Multiple file upload failed: ${error.message}`);
    }
  }
}

module.exports = FileUploadUtil;
