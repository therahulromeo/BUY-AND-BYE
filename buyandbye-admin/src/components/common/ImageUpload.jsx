import { useState, useRef } from 'react';
import { Upload, Trash2, RefreshCw, CheckCircle2, Image as ImageIcon, Loader2 } from 'lucide-react';
import Button from './Button';
import Badge from './Badge';

/**
 * Format bytes into human-readable size
 */
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Compress and read image from device via Canvas
 * Downscales large images to max 1200px while preserving quality and aspect ratio,
 * ensuring fast loading and safe storage without payload limits.
 */
const compressAndReadImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.86) => {
  return new Promise((resolve, reject) => {
    // For SVGs, read as data URL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error('Failed to read SVG file'));
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(event.target.result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, format === 'image/jpeg' ? quality : undefined);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(event.target.result);
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file from device'));
    reader.readAsDataURL(file);
  });
};

const ImageUpload = ({
  value = '',
  onChange,
  label = 'Product Photo',
  hint = 'Add an image directly from your device (PNG, JPG, WEBP, GIF)',
  required = false,
  error = null,
  maxSizeMB = 10,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileDetails, setFileDetails] = useState(null);
  const [localError, setLocalError] = useState(null);

  const fileInputRef = useRef(null);

  // Process selected file from device
  const processFile = async (file) => {
    if (!file) return;

    setLocalError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file (PNG, JPG, WEBP, GIF)');
      return;
    }

    // Validate size limit (before optimization)
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setLocalError(`File size exceeds ${maxSizeMB}MB limit. Please choose a smaller file.`);
      return;
    }

    setIsProcessing(true);
    try {
      const dataUrl = await compressAndReadImage(file);
      setFileDetails({
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
      });
      if (onChange) {
        onChange(dataUrl);
      }
    } catch (err) {
      console.error('Image processing failed:', err);
      setLocalError('Failed to load image from device. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input so re-selecting the same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setFileDetails(null);
    setLocalError(null);
    if (onChange) {
      onChange('');
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayError = error || localError;

  return (
    <div className="image-upload-wrapper form-group">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--spacing-1)' }}>
        <label className="form-label" style={{ margin: 0 }}>
          {label} {required && <span className="required">*</span>}
        </label>
        {value && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-success)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={13} /> Ready
          </span>
        )}
      </div>

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        id="product-photo-device-input"
      />

      {isProcessing ? (
        <div className="image-dropzone" style={{ padding: 'var(--spacing-8)' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-2)' }} />
          <div className="image-dropzone-title">Processing device photo...</div>
          <div className="image-dropzone-subtitle">Optimizing photo for fast catalog loading</div>
        </div>
      ) : value ? (
        /* Image Preview Card when an image is loaded */
        <div className="image-preview-card">
          <div style={{ position: 'relative' }}>
            <img
              src={value}
              alt="Product Preview"
              className="image-preview-thumb"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>

          <div className="image-preview-info">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
              <Badge variant="success" dot={true}>
                Device Photo Loaded
              </Badge>
              {fileDetails?.size && (
                <span className="image-preview-meta">
                  {fileDetails.size}
                </span>
              )}
            </div>

            <div className="image-preview-filename" title={fileDetails?.name || 'Selected Image'}>
              {fileDetails?.name || 'Device Image Preview'}
            </div>

            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)' }}>
              This photo will be displayed in store catalog and customer orders.
            </div>

            <div className="image-preview-actions">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={openFileDialog}
                title="Select another image from device"
              >
                Change Photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={handleRemove}
                title="Remove photo"
                style={{ color: 'var(--color-danger)' }}
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty Dropzone for picking from device */
        <div
          className={`image-dropzone ${isDragging ? 'is-dragging' : ''} ${displayError ? 'is-invalid' : ''}`}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileDialog}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openFileDialog();
            }
          }}
        >
          <div className="image-dropzone-icon-circle">
            <Upload size={24} />
          </div>

          <div className="image-dropzone-title">
            Choose a photo from your Device
          </div>

          <div className="image-dropzone-subtitle">
            Click anywhere to browse files, or drag and drop your photo here
          </div>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={Upload}
            onClick={(e) => {
              e.stopPropagation();
              openFileDialog();
            }}
          >
            Browse Device
          </Button>

          <span className="image-dropzone-formats">
            Supports PNG, JPG, JPEG, WEBP up to {maxSizeMB}MB
          </span>
        </div>
      )}

      {hint && !displayError && (
        <span className="form-hint" style={{ marginTop: 'var(--spacing-1)' }}>
          {hint}
        </span>
      )}

      {displayError && (
        <span className="form-error">
          {displayError}
        </span>
      )}
    </div>
  );
};

export default ImageUpload;
