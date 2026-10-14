package com.freshcart.backend.dto.inventory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class AdjustInventoryRequest {

    @NotNull(message = "Product ID is required")
    @Positive(message = "Product ID must be positive")
    private Integer productId;

    @NotNull(message = "Quantity change is required")
    private Integer quantityChange;

    @NotBlank(message = "Adjustment reason is required")
    @Size(max = 255, message = "Adjustment reason must not exceed 255 characters")
    private String reason;

    public AdjustInventoryRequest() {}

    public AdjustInventoryRequest(Integer productId, Integer quantityChange, String reason) {
        this.productId = productId;
        this.quantityChange = quantityChange;
        this.reason = reason;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getQuantityChange() {
        return quantityChange;
    }

    public void setQuantityChange(Integer quantityChange) {
        this.quantityChange = quantityChange;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
