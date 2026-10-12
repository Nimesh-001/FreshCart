package com.freshcart.backend.dto.order;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class CheckoutRequest {

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be positive")
    private Integer customerId;

    @NotNull(message = "Address ID is required")
    @Positive(message = "Address ID must be positive")
    private Integer addressId;

    private String paymentMethod;

    public CheckoutRequest() {}

    public CheckoutRequest(Integer customerId, Integer addressId) {
        this.customerId = customerId;
        this.addressId = addressId;
    }

    public CheckoutRequest(Integer customerId, Integer addressId, String paymentMethod) {
        this.customerId = customerId;
        this.addressId = addressId;
        this.paymentMethod = paymentMethod;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public Integer getAddressId() {
        return addressId;
    }

    public void setAddressId(Integer addressId) {
        this.addressId = addressId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
