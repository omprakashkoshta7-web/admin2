# Backend Image Upload Setup Guide

## 📋 Overview
This guide explains how to set up the image upload endpoint for the Categories page canvas and image upload features.

## 🔧 Required Dependencies

```bash
npm install multer
npm install @google-cloud/storage  # For Google Cloud Storage
# OR
npm install aws-sdk  # For AWS S3
# OR
npm install cloudinary  # For Cloudinary
```

## 📁 File Structure

```
backend/
├── routes/
│   └── upload.routes.js
├── controllers/
│   └── upload.controller.js
├── middleware/
│   └── multer.middleware.js
├── config/
│   └── storage.config.js
└── uploads/  # Local storage folder (if using local storage)
```

## 🚀 Implementation

### 1. Multer Middleware (`middleware/multer.middleware.js`)

```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const folderPath = path.join(uploadDir, folder);
    
    // Create folder if it doesn't exist
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

### 2. Upload Controller (`controllers/upload.controller.js`)

```javascript
const path = require('path');

/**
 * Upload single image
 */
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Generate URL for the uploaded file
    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const folder = req.body.folder || 'general';
    const imageUrl = `${baseUrl}/uploads/${folder}/${req.file.filename}`;

    res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        folder: folder
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image',
      error: error.message
    });
  }
};

/**
 * Upload multiple images
 */
exports.uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const folder = req.body.folder || 'general';

    const uploadedFiles = req.files.map(file => ({
      url: `${baseUrl}/uploads/${folder}/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        files: uploadedFiles,
        count: uploadedFiles.length,
        folder: folder
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload images',
      error: error.message
    });
  }
};

/**
 * Delete uploaded image
 */
exports.deleteImage = async (req, res) => {
  try {
    const { filename, folder } = req.body;

    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }

    const fs = require('fs');
    const filePath = path.join(__dirname, '../uploads', folder || 'general', filename);

    // Check if file exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image',
      error: error.message
    });
  }
};
```

### 3. Upload Routes (`routes/upload.routes.js`)

```javascript
const express = require('express');
const router = express.Router();
const upload = require('../middleware/multer.middleware');
const uploadController = require('../controllers/upload.controller');

// Upload single image
router.post('/image', upload.single('image'), uploadController.uploadImage);

// Upload multiple images
router.post('/images', upload.array('images', 10), uploadController.uploadMultipleImages);

// Delete image
router.delete('/image', uploadController.deleteImage);

module.exports = router;
```

### 4. Main App Configuration (`app.js` or `server.js`)

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size is too large. Maximum size is 5MB'
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Something went wrong'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 5. Environment Variables (`.env`)

```env
PORT=4000
BASE_URL=http://localhost:4000
NODE_ENV=development

# For production
# BASE_URL=https://your-domain.com
```

## 🌐 Cloud Storage Integration (Optional)

### Google Cloud Storage

```javascript
// config/storage.config.js
const { Storage } = require('@google-cloud/storage');
const multer = require('multer');

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE
});

const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);

const multerGCS = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const uploadToGCS = async (file, folder = 'general') => {
  const blob = bucket.file(`${folder}/${Date.now()}-${file.originalname}`);
  const blobStream = blob.createWriteStream({
    resumable: false,
    metadata: {
      contentType: file.mimetype
    }
  });

  return new Promise((resolve, reject) => {
    blobStream.on('error', (err) => reject(err));
    blobStream.on('finish', () => {
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
      resolve(publicUrl);
    });
    blobStream.end(file.buffer);
  });
};

module.exports = { multerGCS, uploadToGCS };
```

### AWS S3

```javascript
// config/storage.config.js
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const folder = req.body.folder || 'general';
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
```

## 🧪 Testing the Endpoint

### Using cURL

```bash
# Upload single image
curl -X POST http://localhost:4000/api/upload/image \
  -F "image=@/path/to/image.jpg" \
  -F "folder=categories"

# Upload multiple images
curl -X POST http://localhost:4000/api/upload/images \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg" \
  -F "folder=categories"

# Delete image
curl -X DELETE http://localhost:4000/api/upload/image \
  -H "Content-Type: application/json" \
  -d '{"filename":"image-123456.jpg","folder":"categories"}'
```

### Using Postman

1. **POST** `http://localhost:4000/api/upload/image`
2. Body → form-data
3. Add key `image` (type: File)
4. Add key `folder` (type: Text, value: `categories`)
5. Send request

## 📝 Response Format

### Success Response

```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "http://localhost:4000/uploads/categories/image-1234567890.jpg",
    "filename": "image-1234567890.jpg",
    "originalName": "category-image.jpg",
    "size": 245678,
    "mimetype": "image/jpeg",
    "folder": "categories"
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Only image files are allowed!",
  "error": "Invalid file type"
}
```

## 🔒 Security Considerations

1. **File Type Validation**: Only allow image files
2. **File Size Limit**: Maximum 5MB per file
3. **Authentication**: Add auth middleware for protected routes
4. **Rate Limiting**: Prevent abuse
5. **Virus Scanning**: Scan uploaded files for malware
6. **CORS Configuration**: Restrict allowed origins

### Example Auth Middleware

```javascript
// middleware/auth.middleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = authMiddleware;
```

### Protected Route Example

```javascript
// routes/upload.routes.js
const authMiddleware = require('../middleware/auth.middleware');

router.post('/image', 
  authMiddleware,  // Add authentication
  upload.single('image'), 
  uploadController.uploadImage
);
```

## 🚀 Deployment Checklist

- [ ] Set up cloud storage (GCS, S3, or Cloudinary)
- [ ] Configure environment variables
- [ ] Set up CDN for faster image delivery
- [ ] Enable HTTPS
- [ ] Add authentication middleware
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Add image optimization (resize, compress)
- [ ] Set up backup strategy
- [ ] Monitor storage usage

## 📚 Additional Resources

- [Multer Documentation](https://github.com/expressjs/multer)
- [Google Cloud Storage](https://cloud.google.com/storage/docs)
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## ✅ Frontend Integration

The frontend Categories page is already configured to use this endpoint:
- Endpoint: `POST /api/upload/image`
- Field name: `image`
- Additional field: `folder` (set to 'categories')

Make sure your backend is running on the URL specified in `.env`:
```
VITE_API_BASE_URL=http://localhost:4000/api
```
