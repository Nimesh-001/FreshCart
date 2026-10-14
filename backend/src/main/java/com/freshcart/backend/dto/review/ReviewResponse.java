package com.freshcart.backend.dto.review;

import java.sql.Timestamp;

public class ReviewResponse {

    private Integer reviewId;
    private Integer customerId;
    private String customerName;
    private Integer productId;
    private String productName;
    private Integer orderId;
    private Integer rating;
    private String ratingLabel;
    private String comment;
    private Timestamp createdAt;

    public ReviewResponse() {}

    public ReviewResponse(Integer reviewId, Integer customerId, String customerName, Integer productId,
                          String productName, Integer orderId, Integer rating, String ratingLabel,
                          String comment, Timestamp createdAt) {
        this.reviewId = reviewId;
        this.customerId = customerId;
        this.customerName = customerName;
        this.productId = productId;
        this.productName = productName;
        this.orderId = orderId;
        this.rating = rating;
        this.ratingLabel = ratingLabel;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Integer getReviewId() {
        return reviewId;
    }

    public void setReviewId(Integer reviewId) {
        this.reviewId = reviewId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
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

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getRatingLabel() {
        return ratingLabel;
    }

    public void setRatingLabel(String ratingLabel) {
        this.ratingLabel = ratingLabel;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
