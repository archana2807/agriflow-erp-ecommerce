import Banner from "../models/banner.model.js";

/**
 * CREATE BANNER
 */
export const createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, image, buttonText, buttonLink, displayOrder } =
      req.validatedBody;

    const banner = await Banner.create({
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      displayOrder,
      tenantId: req.tenantId,
    });

    res.status(201).json({
      success: true,
      message: "Banner created successfully",
      banner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET BANNERS
 */
export const getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ tenantId: req.tenantId }).sort({
      displayOrder: 1,
    });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE BANNER
 */
export const updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, image, buttonText, buttonLink, displayOrder, isActive } =
      req.validatedBody;

    const banner = await Banner.findOne({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    banner.title = title || banner.title;
    banner.subtitle = subtitle ?? banner.subtitle;
    banner.image = image || banner.image;
    banner.buttonText = buttonText ?? banner.buttonText;
    banner.buttonLink = buttonLink ?? banner.buttonLink;
    banner.displayOrder = displayOrder ?? banner.displayOrder;
    banner.isActive = isActive ?? banner.isActive;

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully",
      banner,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE BANNER
 */
export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findOneAndDelete({
      _id: id,
      tenantId: req.tenantId,
    });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET ACTIVE BANNERS (Public)
 */
export const getActiveBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({
      isActive: true,
    }).sort({ displayOrder: 1 });

    res.status(200).json({
      success: true,
      banners,
    });
  } catch (error) {
    next(error);
  }
};
