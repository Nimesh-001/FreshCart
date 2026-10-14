package com.freshcart.backend.dto.delivery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateDeliveryStatusRequest {

    private Integer orderId;

    @NotBlank(message = "Delivery status is required")
    @Pattern(regexp = "^(?i)(PENDING|ASSIGNED|OUT_FOR_DELIVERY|DELIVERED|FAILED)$", message = "Delivery status must be PENDING, ASSIGNED, OUT_FOR_DELIVERY, DELIVERED, or FAILED")
    private String status;

    public UpdateDeliveryStatusRequest() {}

    public UpdateDeliveryStatusRequest(String status) {
        this.status = status;
    }

    public UpdateDeliveryStatusRequest(Integer orderId, String status) {
        this.orderId = orderId;
        this.status = status;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
