import Brand from "../models/brand.model.js";

/**
 * CREATE BRAND
 */
export const createBrand = async (req, res, next) => {
  try {
    const { name, logo, description } = req.body;

    const existing = await Brand.findOne({
      name,
      tenantId: req.tenantId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Brand already exists with this name",
      });
    }

    const brand = await Brand.create({
      name,
      logo,
      description,
      tenantId: req.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Brand created successfully",
      brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BRANDS
 */
export const getBrands = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      tenantId: req.tenantId,
      name: { $regex: search, $options: "i" },
    };

    const skip = (page - 1) * limit;

    const brands = await Brand.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Brand.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      brands,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE BRAND
 */
export const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, logo, description, isActive } = req.body;

    const brand = await Brand.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    if (name && name !== brand.name) {
      const existing = await Brand.findOne({
        name,
        tenantId: req.tenantId,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Brand name already in use",
        });
      }
    }

    brand.name = name || brand.name;
    brand.logo = logo ?? brand.logo;
    brand.description = description ?? brand.description;
    brand.isActive = isActive ?? brand.isActive;

    await brand.save();

    res.status(200).json({
      success: true,
      message: "Brand updated successfully",
      brand,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE BRAND
 */
export const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: "Brand not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Brand deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
