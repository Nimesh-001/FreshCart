package com.freshcart.backend.dto.payment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class RefundPaymentRequest {

    @NotNull(message = "Order ID is required")
    @Positive(message = "Order ID must be positive")
    private Integer orderId;

    private Integer customerId;

    @Size(max = 255, message = "Refund reason must not exceed 255 characters")
    private String reason;

    public RefundPaymentRequest() {}

    public RefundPaymentRequest(Integer orderId) {
        this.orderId = orderId;
    }

    public RefundPaymentRequest(Integer orderId, Integer customerId, String reason) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.reason = reason;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
