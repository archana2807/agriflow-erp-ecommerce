import Review from "../models/review.model.js";

export class ReviewService {
  static async getReviewsByProduct(productId, { page = 1, limit = 10, approvedOnly = true }) {
    const query = { productId };
    if (approvedOnly) query.isApproved = true;

    const skip = (page - 1) * limit;

    const [reviews, total, avgResult] = await Promise.all([
      Review.find(query)
        .populate("customerId", "name")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Review.countDocuments(query),
      Review.aggregate([
        { $match: { productId, isApproved: true } },
        { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]),
    ]);

    return {
      reviews,
      total,
      page,
      limit,
      avgRating: avgResult[0] ? Math.round(avgResult[0].avgRating * 10) / 10 : 0,
      reviewCount: avgResult[0] ? avgResult[0].count : 0,
    };
  }

  static async getAverageRating(productId) {
    const result = await Review.aggregate([
      { $match: { productId, isApproved: true } },
      { $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    return {
      avgRating: result[0] ? Math.round(result[0].avgRating * 10) / 10 : 0,
      count: result[0] ? result[0].count : 0,
    };
  }

  static async createReview({ tenantId, customerId, productId, rating, review }) {
    const existing = await Review.findOne({ customerId, productId, tenantId });
    if (existing) {
      throw new Error("You have already reviewed this product");
    }

    return Review.create({
      tenantId,
      customerId,
      productId,
      rating,
      review,
    });
  }

  static async updateReview(reviewId, customerId, updates) {
    const review = await Review.findOne({ _id: reviewId, customerId });
    if (!review) {
      throw new Error("Review not found");
    }

    Object.assign(review, updates);
    await review.save();
    return review;
  }

  static async deleteReview(reviewId, customerId) {
    const review = await Review.findOneAndDelete({ _id: reviewId, customerId });
    if (!review) {
      throw new Error("Review not found");
    }
    return review;
  }

  static async approveReview(tenantId, reviewId) {
    const review = await Review.findOne({ _id: reviewId, tenantId });
    if (!review) {
      throw new Error("Review not found");
    }

    review.isApproved = true;
    await review.save();
    return review;
  }
}
