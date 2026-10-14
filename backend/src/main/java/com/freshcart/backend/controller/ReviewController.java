package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.review.AddReviewRequest;
import com.freshcart.backend.dto.review.ProductReviewAnalysisResponse;
import com.freshcart.backend.dto.review.ReviewResponse;
import com.freshcart.backend.dto.review.UpdateReviewRequest;
import com.freshcart.backend.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(@Valid @RequestBody AddReviewRequest request) {
        ReviewResponse response = reviewService.addReview(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Review added successfully", response));
    }

    @RequestMapping(value = "/{reviewId}", method = {RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Integer reviewId,
            @Valid @RequestBody UpdateReviewRequest request
    ) {
        ReviewResponse response = reviewService.updateReview(reviewId, request);
        return ResponseEntity.ok(ApiResponse.success("Review updated successfully", response));
    }

    @GetMapping("/analysis")
    public ResponseEntity<ApiResponse<List<ProductReviewAnalysisResponse>>> getReviewAnalysis(
            @RequestParam(required = false) Integer productId
    ) {
        List<ProductReviewAnalysisResponse> response = reviewService.getReviewAnalysis(productId);
        return ResponseEntity.ok(ApiResponse.success("Review analysis retrieved successfully", response));
    }

    @GetMapping("/analysis/{productId}")
    public ResponseEntity<ApiResponse<List<ProductReviewAnalysisResponse>>> getReviewAnalysisByPath(
            @PathVariable Integer productId
    ) {
        List<ProductReviewAnalysisResponse> response = reviewService.getReviewAnalysis(productId);
        return ResponseEntity.ok(ApiResponse.success("Review analysis retrieved successfully", response));
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Integer reviewId) {
        ReviewResponse response = reviewService.getReviewById(reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review retrieved successfully", response));
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByProductId(@PathVariable Integer productId) {
        List<ReviewResponse> response = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Product reviews retrieved successfully", response));
    }
}
