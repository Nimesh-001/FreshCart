package com.freshcart.backend.repository;

import com.freshcart.backend.dto.review.ProductReviewAnalysisResponse;
import com.freshcart.backend.dto.review.ReviewResponse;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository {

    void addReview(Integer customerId, Integer productId, Integer orderId, Integer rating, String comment);

    void updateReview(Integer reviewId, Integer customerId, Integer rating, String comment);

    List<ProductReviewAnalysisResponse> getReviewAnalysis(Integer productId);

    Optional<ReviewResponse> findReviewById(Integer reviewId);

    List<ReviewResponse> findReviewsByProductId(Integer productId);

    Optional<ReviewResponse> findReviewByCustomerProductOrder(Integer customerId, Integer productId, Integer orderId);

    String getRatingLabel(Integer rating);
}
