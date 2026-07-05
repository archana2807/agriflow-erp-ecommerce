import Customer from "../models/customer.model.js";

/**
 * CREATE CUSTOMER
 */
export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, email, isWalkIn } = req.validatedBody;

    const existingCustomer = await Customer.findOne({
      phone,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (existingCustomer) {
      return res.status(409).json({
        message: "Customer already exists with this phone number",
      });
    }

    const customerData = {
      name,
      phone,
      tenantId: req.tenantId,
      createdBy: req.user.id,
      isWalkIn: isWalkIn || false,
    };

    if (isWalkIn) {
      const walkInEmail = email || `walkin-${phone}@placeholder.local`;
      const walkInPassword = `Walk${phone.slice(-4)}!${Date.now().toString(36)}`;
      customerData.email = walkInEmail;
      customerData.password = walkInPassword;
    } else if (email) {
      customerData.email = email;
    }

    const customer = await Customer.create(customerData);

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET CUSTOMERS (Pagination + Search)
 */
export const getCustomers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const query = {
      tenantId: req.tenantId,
      isDeleted: false,
      name: { $regex: search, $options: "i" },
    };

    const skip = (page - 1) * limit;

    const customers = await Customer.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Customer.countDocuments(query);

    res.status(200).json({
      page,
      limit,
      total,
      customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET CUSTOMER BY ID
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

/**
 * UPDATE CUSTOMER
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.validatedBody;

    const customer = await Customer.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    if (phone && phone !== customer.phone) {
      const exists = await Customer.findOne({
        phone,
        tenantId: req.tenantId,
        isDeleted: false,
      });

      if (exists) {
        return res.status(409).json({
          message: "Phone number already in use",
        });
      }
    }

    customer.name = name || customer.name;
    customer.phone = phone || customer.phone;

    await customer.save();

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE CUSTOMER (Soft Delete)
 */
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      _id: id,
      tenantId: req.tenantId,
      isDeleted: false,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    customer.isDeleted = true;
    await customer.save();

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
