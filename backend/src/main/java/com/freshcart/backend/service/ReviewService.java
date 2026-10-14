package com.freshcart.backend.service;

import com.freshcart.backend.dto.review.AddReviewRequest;
import com.freshcart.backend.dto.review.ProductReviewAnalysisResponse;
import com.freshcart.backend.dto.review.ReviewResponse;
import com.freshcart.backend.dto.review.UpdateReviewRequest;

import java.util.List;

public interface ReviewService {

    ReviewResponse addReview(AddReviewRequest request);

    ReviewResponse updateReview(Integer reviewId, UpdateReviewRequest request);

    List<ProductReviewAnalysisResponse> getReviewAnalysis(Integer productId);

    ReviewResponse getReviewById(Integer reviewId);

    List<ReviewResponse> getReviewsByProductId(Integer productId);
}
