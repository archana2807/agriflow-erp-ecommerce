import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

export class CartService {
  static async getCart(customerId, tenantId) {
    let cart = await Cart.findOne({
      customerId,
      tenantId,
    }).populate("items.productId", "name slug images sellingPrice stock gstPercent");

    if (!cart) {
      cart = {
        items: [],
        subtotal: 0,
        gstAmount: 0,
        discount: 0,
        grandTotal: 0,
      };
    }

    return cart;
  }

  static async addItem(customerId, tenantId, productId, quantity = 1) {
    const product = await Product.findOne({
      _id: productId,
      tenantId,
      isDeleted: false,
      isActive: true,
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    let cart = await Cart.findOne({ customerId, tenantId });

    if (!cart) {
      cart = new Cart({
        customerId,
        tenantId,
        items: [],
      });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total =
        cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
    } else {
      const price = product.sellingPrice || product.price;
      cart.items.push({
        productId,
        quantity,
        price,
        total: price * quantity,
      });
    }

    await CartService.calculateCartTotals(cart);
    await cart.save();

    return Cart.findById(cart._id).populate(
      "items.productId",
      "name slug images sellingPrice stock gstPercent"
    );
  }

  static async updateItem(customerId, tenantId, productId, quantity) {
    if (quantity < 1) {
      throw new Error("Quantity must be at least 1");
    }

    const cart = await Cart.findOne({ customerId, tenantId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      throw new Error("Item not found in cart");
    }

    const product = await Product.findById(productId);
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].total = cart.items[itemIndex].quantity * cart.items[itemIndex].price;

    await CartService.calculateCartTotals(cart);
    await cart.save();

    return Cart.findById(cart._id).populate(
      "items.productId",
      "name slug images sellingPrice stock gstPercent"
    );
  }

  static async removeItem(customerId, tenantId, productId) {
    const cart = await Cart.findOne({ customerId, tenantId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await CartService.calculateCartTotals(cart);
    await cart.save();

    return Cart.findById(cart._id).populate(
      "items.productId",
      "name slug images sellingPrice stock gstPercent"
    );
  }

  static async clearCart(customerId, tenantId) {
    const cart = await Cart.findOne({ customerId, tenantId });

    if (cart) {
      cart.items = [];
      cart.subtotal = 0;
      cart.gstAmount = 0;
      cart.discount = 0;
      cart.grandTotal = 0;
      await cart.save();
    }

    return {
      items: [],
      subtotal: 0,
      gstAmount: 0,
      discount: 0,
      grandTotal: 0,
    };
  }

  static async applyCoupon(customerId, tenantId, couponCode, couponDiscount) {
    const cart = await Cart.findOne({ customerId, tenantId });
    if (!cart) {
      throw new Error("Cart not found");
    }

    cart.discount = couponDiscount;
    await CartService.calculateCartTotals(cart);
    await cart.save();

    return Cart.findById(cart._id).populate(
      "items.productId",
      "name slug images sellingPrice stock gstPercent"
    );
  }

  static async calculateCartTotals(cart) {
    let subtotal = 0;
    let gstAmount = 0;

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        const itemSubtotal = item.total;
        subtotal += itemSubtotal;
        gstAmount += (itemSubtotal * (product.gstPercent || 0)) / 100;
      }
    }

    cart.subtotal = subtotal;
    cart.gstAmount = gstAmount;
    cart.grandTotal = subtotal + gstAmount - cart.discount;
  }
}
