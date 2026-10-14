package com.freshcart.backend.dto.review;

import java.math.BigDecimal;

public class ProductReviewAnalysisResponse {

    private Integer productId;
    private String productName;
    private String categoryName;
    private Long totalReviews;
    private BigDecimal averageRating;
    private Long positiveReviews;
    private Long averageReviews;
    private Long negativeReviews;
    private String overallRatingLabel;

    public ProductReviewAnalysisResponse() {}

    public ProductReviewAnalysisResponse(Integer productId, String productName, String categoryName,
                                         Long totalReviews, BigDecimal averageRating, Long positiveReviews,
                                         Long averageReviews, Long negativeReviews, String overallRatingLabel) {
        this.productId = productId;
        this.productName = productName;
        this.categoryName = categoryName;
        this.totalReviews = totalReviews;
        this.averageRating = averageRating;
        this.positiveReviews = positiveReviews;
        this.averageReviews = averageReviews;
        this.negativeReviews = negativeReviews;
        this.overallRatingLabel = overallRatingLabel;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Long getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Long totalReviews) {
        this.totalReviews = totalReviews;
    }

    public BigDecimal getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(BigDecimal averageRating) {
        this.averageRating = averageRating;
    }

    public Long getPositiveReviews() {
        return positiveReviews;
    }

    public void setPositiveReviews(Long positiveReviews) {
        this.positiveReviews = positiveReviews;
    }

    public Long getAverageReviews() {
        return averageReviews;
    }

    public void setAverageReviews(Long averageReviews) {
        this.averageReviews = averageReviews;
    }

    public Long getNegativeReviews() {
        return negativeReviews;
    }

    public void setNegativeReviews(Long negativeReviews) {
        this.negativeReviews = negativeReviews;
    }

    public String getOverallRatingLabel() {
        return overallRatingLabel;
    }

    public void setOverallRatingLabel(String overallRatingLabel) {
        this.overallRatingLabel = overallRatingLabel;
    }
}
