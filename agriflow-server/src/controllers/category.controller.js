import Category from "../models/category.model.js";

/**
 * CREATE CATEGORY
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, slug, image, description } = req.validatedBody;

    const existing = await Category.findOne({
      slug,
      tenantId: req.tenantId,
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Category already exists with this slug",
      });
    }

    const category = await Category.create({
      name,
      slug,
      image,
      description,
      tenantId: req.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET CATEGORIES
 */
export const getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      tenantId: req.tenantId,
      name: { $regex: search, $options: "i" },
    };

    const skip = (page - 1) * limit;

    const categories = await Category.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      page,
      limit,
      total,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE CATEGORY
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, image, description, isActive } = req.validatedBody;

    const category = await Category.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (slug && slug !== category.slug) {
      const existing = await Category.findOne({
        slug,
        tenantId: req.tenantId,
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "Slug already in use",
        });
      }
    }

    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.image = image ?? category.image;
    category.description = description ?? category.description;
    category.isActive = isActive ?? category.isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE CATEGORY
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
