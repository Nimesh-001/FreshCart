package com.freshcart.backend.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateReviewRequest {

    private Integer customerId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    @Size(max = 500, message = "Review comment must not exceed 500 characters")
    private String comment;

    public UpdateReviewRequest() {}

    public UpdateReviewRequest(Integer rating, String comment) {
        this.rating = rating;
        this.comment = comment;
    }

    public UpdateReviewRequest(Integer customerId, Integer rating, String comment) {
        this.customerId = customerId;
        this.rating = rating;
        this.comment = comment;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}
