import Address from "../models/address.model.js";

/**
 * GET ADDRESSES
 */
export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
    }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * CREATE ADDRESS
 */
export const createAddress = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      landmark,
      isDefault,
    } = req.body;

    if (isDefault) {
      await Address.updateMany(
        {
          customerId: req.customer.id,
          tenantId: req.customer.tenantId,
        },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      landmark,
      isDefault,
    });

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE ADDRESS
 */
export const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      country,
      pincode,
      landmark,
      isDefault,
    } = req.body;

    const address = await Address.findOne({
      _id: id,
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    if (isDefault) {
      await Address.updateMany(
        {
          customerId: req.customer.id,
          tenantId: req.customer.tenantId,
          _id: { $ne: id },
        },
        { isDefault: false }
      );
    }

    address.fullName = fullName || address.fullName;
    address.phone = phone || address.phone;
    address.addressLine1 = addressLine1 || address.addressLine1;
    address.addressLine2 = addressLine2 ?? address.addressLine2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.country = country || address.country;
    address.pincode = pincode || address.pincode;
    address.landmark = landmark ?? address.landmark;
    address.isDefault = isDefault ?? address.isDefault;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE ADDRESS
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const address = await Address.findOneAndDelete({
      _id: id,
      customerId: req.customer.id,
      tenantId: req.customer.tenantId,
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
