import { CartService } from "../services/cart.service.js";

/**
 * GET CART
 */
export const getCart = async (req, res, next) => {
  try {
    const cart = await CartService.getCart(req.customer.id, req.customer.tenantId);

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ADD TO CART
 */
export const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const cart = await CartService.addItem(
      req.customer.id,
      req.customer.tenantId,
      productId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === "Insufficient stock") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * UPDATE CART ITEM
 */
export const updateCartItem = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const cart = await CartService.updateItem(
      req.customer.id,
      req.customer.tenantId,
      productId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Cart updated",
      cart,
    });
  } catch (error) {
    if (error.message === "Cart not found" || error.message === "Item not found in cart") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message === "Quantity must be at least 1" || error.message === "Insufficient stock") {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * REMOVE FROM CART
 */
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const cart = await CartService.removeItem(
      req.customer.id,
      req.customer.tenantId,
      productId
    );

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    if (error.message === "Cart not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * CLEAR CART
 */
export const clearCart = async (req, res, next) => {
  try {
    const cart = await CartService.clearCart(req.customer.id, req.customer.tenantId);

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    next(error);
  }
};
