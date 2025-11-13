// ============================================
// Product Routes
// Endpoints for product catalog management
// ============================================

const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getCollection } = require('../config/database');
const logger = require('../config/logger');

// ============================================
// BRANDS
// ============================================

// GET all brands
router.get('/brands', async (req, res) => {
  try {
    const brands = getCollection('brands');
    const result = await brands.find({ isActive: true }).toArray();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch brands',
      message: error.message
    });
  }
});

// POST create brand
router.post('/brands', async (req, res) => {
  try {
    const brands = getCollection('brands');
    const { name, description, logoUrl, websiteUrl } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Brand name is required'
      });
    }

    const newBrand = {
      name,
      description: description || null,
      logoUrl: logoUrl || null,
      websiteUrl: websiteUrl || null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await brands.insertOne(newBrand);

    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...newBrand }
    });
  } catch (error) {
    logger.error('Error creating brand:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create brand',
      message: error.message
    });
  }
});

// PUT update brand
router.put('/brands/:id', async (req, res) => {
  try {
    const brands = getCollection('brands');
    const { name, description, logoUrl, websiteUrl, isActive } = req.body;

    const updateData = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(websiteUrl !== undefined && { websiteUrl }),
      ...(isActive !== undefined && { isActive }),
      updatedAt: new Date()
    };

    const result = await brands.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand updated successfully'
    });
  } catch (error) {
    logger.error('Error updating brand:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update brand',
      message: error.message
    });
  }
});

// DELETE brand
router.delete('/brands/:id', async (req, res) => {
  try {
    const brands = getCollection('brands');

    // Soft delete
    const result = await brands.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting brand:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete brand',
      message: error.message
    });
  }
});

// ============================================
// PRODUCT CATEGORIES
// ============================================

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = getCollection('product_categories');
    const result = await categories.find({ isActive: true }).toArray();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

// POST create category
router.post('/categories', async (req, res) => {
  try {
    const categories = getCollection('product_categories');
    const { name, description, parentCategoryId } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Category name is required'
      });
    }

    const newCategory = {
      name,
      description: description || null,
      parentCategoryId: parentCategoryId ? new ObjectId(parentCategoryId) : null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await categories.insertOne(newCategory);

    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...newCategory }
    });
  } catch (error) {
    logger.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create category',
      message: error.message
    });
  }
});

// ============================================
// PRODUCTS
// ============================================

// GET all products with filtering
router.get('/', async (req, res) => {
  try {
    const products = getCollection('products');
    const { brandId, categoryId, search, page = 1, limit = 20 } = req.query;

    // Build query
    const query = { isActive: true };
    if (brandId) query.brandId = new ObjectId(brandId);
    if (categoryId) query.categoryId = new ObjectId(categoryId);
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [result, total] = await Promise.all([
      products.find(query).skip(skip).limit(parseInt(limit)).toArray(),
      products.countDocuments(query)
    ]);

    // Populate brand and category names
    const brands = getCollection('brands');
    const categories = getCollection('product_categories');

    for (let product of result) {
      const brand = await brands.findOne({ _id: product.brandId });
      const category = await categories.findOne({ _id: product.categoryId });
      product.brandName = brand?.name;
      product.categoryName = category?.name;
    }

    res.json({
      success: true,
      data: result,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

// GET product by ID
router.get('/:id', async (req, res) => {
  try {
    const products = getCollection('products');
    const product = await products.findOne({ _id: new ObjectId(req.params.id) });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get related data
    const brands = getCollection('brands');
    const categories = getCollection('product_categories');
    const specs = getCollection('technical_specifications');

    const [brand, category, specifications] = await Promise.all([
      brands.findOne({ _id: product.brandId }),
      categories.findOne({ _id: product.categoryId }),
      specs.find({ productId: product._id }).toArray()
    ]);

    res.json({
      success: true,
      data: {
        ...product,
        brandName: brand?.name,
        categoryName: category?.name,
        specifications
      }
    });
  } catch (error) {
    logger.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const products = getCollection('products');
    const {
      brandId,
      categoryId,
      modelCode,
      name,
      description,
      productType,
      powerWatt,
      imageUrl,
      price,
      currency
    } = req.body;

    if (!brandId || !categoryId || !modelCode || !name) {
      return res.status(400).json({
        success: false,
        error: 'brandId, categoryId, modelCode, and name are required'
      });
    }

    const newProduct = {
      brandId: new ObjectId(brandId),
      categoryId: new ObjectId(categoryId),
      modelCode,
      name,
      description: description || null,
      productType: productType || null,
      powerWatt: powerWatt ? parseInt(powerWatt) : null,
      imageUrl: imageUrl || null,
      price: price || null,
      currency: currency || 'TRY',
      isActive: true,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await products.insertOne(newProduct);

    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...newProduct }
    });
  } catch (error) {
    logger.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product',
      message: error.message
    });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const products = getCollection('products');
    const updateData = { ...req.body };

    // Convert ObjectId fields
    if (updateData.brandId) updateData.brandId = new ObjectId(updateData.brandId);
    if (updateData.categoryId) updateData.categoryId = new ObjectId(updateData.categoryId);
    if (updateData.powerWatt) updateData.powerWatt = parseInt(updateData.powerWatt);

    updateData.updatedAt = new Date();

    const result = await products.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    logger.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product',
      message: error.message
    });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const products = getCollection('products');

    // Soft delete
    const result = await products.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

// ============================================
// ERROR CODES
// ============================================

// GET all error codes
router.get('/errors/codes', async (req, res) => {
  try {
    const errorCodes = getCollection('error_codes');
    const result = await errorCodes.find({ isActive: true }).toArray();

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error fetching error codes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch error codes',
      message: error.message
    });
  }
});

// POST create error code
router.post('/errors/codes', async (req, res) => {
  try {
    const errorCodes = getCollection('error_codes');
    const {
      productId,
      errorCode,
      errorName,
      description,
      errorType,
      severity
    } = req.body;

    if (!errorCode || !errorName || !description || !severity) {
      return res.status(400).json({
        success: false,
        error: 'errorCode, errorName, description, and severity are required'
      });
    }

    const newErrorCode = {
      productId: productId ? new ObjectId(productId) : null,
      errorCode,
      errorName,
      description,
      errorType: errorType || null,
      severity,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await errorCodes.insertOne(newErrorCode);

    res.status(201).json({
      success: true,
      data: { _id: result.insertedId, ...newErrorCode }
    });
  } catch (error) {
    logger.error('Error creating error code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create error code',
      message: error.message
    });
  }
});

module.exports = router;
