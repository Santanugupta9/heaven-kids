const request = require('supertest');
const express = require('express');
const Gallery = require('../models/Gallery');
const cloudinary = require('../cloudinary');

// Mock dependencies
jest.mock('../models/Gallery');
jest.mock('../cloudinary', () => ({
  uploader: {
    destroy: jest.fn()
  }
}));

// Mock Auth Middleware to allow all requests
jest.mock('../routes/authMiddleware', () => (req, res, next) => next());

// Mock Multer to simulate file upload without parsing actual files
jest.mock('multer', () => {
  const multer = () => ({
    single: () => (req, res, next) => {
      // Simulate a file being present on the request
      req.file = {
        path: 'https://res.cloudinary.com/mock/image.jpg',
        filename: 'mock-public-id'
      };
      next();
    }
  });
  return multer;
});

jest.mock('multer-storage-cloudinary', () => ({
  CloudinaryStorage: jest.fn()
}));

const galleryRoutes = require('../routes/galleryRoutes');

const app = express();
app.use(express.json());
app.use('/api/gallery', galleryRoutes);

describe('Gallery Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/gallery', () => {
    it('should return all images sorted by createdAt', async () => {
      const mockImages = [
        { _id: '1', imageUrl: 'url1', category: 'General' },
        { _id: '2', imageUrl: 'url2', category: 'Events' }
      ];
      
      // Mock chainable sort
      Gallery.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockImages)
      });

      const res = await request(app).get('/api/gallery');
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].imageUrl).toBe('url1');
      expect(Gallery.find).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      Gallery.find.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error'))
      });

      const res = await request(app).get('/api/gallery');
      
      expect(res.statusCode).toBe(500);
      expect(res.body.error).toBe('Database error');
    });
  });

  describe('POST /api/gallery/upload', () => {
    it('should upload image and create database entry', async () => {
      const mockImage = {
        _id: 'new-id',
        imageUrl: 'https://res.cloudinary.com/mock/image.jpg',
        publicId: 'mock-public-id',
        category: 'General'
      };

      Gallery.create.mockResolvedValue(mockImage);

      const res = await request(app)
        .post('/api/gallery/upload')
        .send({ category: 'General' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.image).toEqual(mockImage);
      expect(Gallery.create).toHaveBeenCalledWith({
        imageUrl: 'https://res.cloudinary.com/mock/image.jpg',
        publicId: 'mock-public-id',
        category: 'General'
      });
    });
  });

  describe('DELETE /api/gallery/:id', () => {
    it('should delete image from db and cloudinary', async () => {
      const mockImage = { _id: '1', publicId: 'pid-1' };
      Gallery.findByIdAndDelete.mockResolvedValue(mockImage);
      cloudinary.uploader.destroy.mockResolvedValue({ result: 'ok' });

      const res = await request(app).delete('/api/gallery/1');

      expect(res.statusCode).toBe(200);
      expect(Gallery.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith('pid-1');
    });
  });

  describe('DELETE /api/gallery/cleanup/facebook-cdn', () => {
    it('should cleanup facebook cdn images', async () => {
      const invalidImages = [
        { _id: '1', imageUrl: 'https://fbcdn.net/img1.jpg', publicId: 'pid1' },
        { _id: '2', imageUrl: 'https://facebook.com/img2.jpg', publicId: 'pid2' }
      ];

      Gallery.find.mockResolvedValue(invalidImages);
      Gallery.findByIdAndDelete.mockResolvedValue(true);
      cloudinary.uploader.destroy.mockResolvedValue({});

      const res = await request(app).delete('/api/gallery/cleanup/facebook-cdn');

      expect(res.statusCode).toBe(200);
      expect(res.body.deletedCount).toBe(2);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledTimes(2);
      expect(Gallery.findByIdAndDelete).toHaveBeenCalledTimes(2);
    });
  });
});