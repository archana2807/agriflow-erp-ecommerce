import { ProductService } from "../services/product.service.js";

function mapProductData(body) {
  const { category, brand, ...rest } = body;
  if (category) rest.categoryId = category;
  if (brand) rest.brandId = brand;
  return rest;
}

/**
 * CREATE PRODUCT (Admin only)
 */
export const createProduct = async (req, res, next) => {
  try {
    const data = mapProductData(req.validatedBody);
    const product = await ProductService.createProduct(req.tenantId, data);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    if (error.message === "Product already exists with this SKU") {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * GET PRODUCTS (Protected - Admin panel)
 */
export const getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const result = await ProductService.getProducts(req.tenantId, {
      page: Number(page),
      limit: Number(limit),
      search,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET PRODUCT BY ID (Admin)
 */
export const getProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(req.tenantId, req.params.id);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * UPDATE PRODUCT (Admin only)
 */
export const updateProduct = async (req, res, next) => {
  try {
    const data = mapProductData(req.validatedBody || req.body);
    const product = await ProductService.updateProduct(
      req.tenantId,
      req.params.id,
      data
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === "SKU already in use") {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * DELETE PRODUCT (Admin only - soft delete)
 */
export const deleteProduct = async (req, res, next) => {
  try {
    await ProductService.deleteProduct(req.tenantId, req.params.id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * GET PUBLIC PRODUCTS (No auth required - storefront)
 */
export const getPublicProducts = async (req, res, next) => {
  try {
    const result = await ProductService.getPublicProducts(req.query);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET SINGLE PUBLIC PRODUCT
 */
export const getPublicProductById = async (req, res, next) => {
  try {
    const product = await ProductService.getProductById(null, req.params.id);

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};
