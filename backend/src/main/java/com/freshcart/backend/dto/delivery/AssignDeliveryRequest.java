package com.freshcart.backend.dto.delivery;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class AssignDeliveryRequest {

    @NotNull(message = "Order ID is required")
    @Positive(message = "Order ID must be positive")
    private Integer orderId;

    @NotBlank(message = "Delivery person name is required")
    @Size(max = 100, message = "Delivery person name must not exceed 100 characters")
    private String deliveryPerson;

    @NotBlank(message = "Delivery phone is required")
    @Size(max = 20, message = "Delivery phone must not exceed 20 characters")
    private String deliveryPhone;

    public AssignDeliveryRequest() {}

    public AssignDeliveryRequest(Integer orderId, String deliveryPerson, String deliveryPhone) {
        this.orderId = orderId;
        this.deliveryPerson = deliveryPerson;
        this.deliveryPhone = deliveryPhone;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public String getDeliveryPerson() {
        return deliveryPerson;
    }

    public void setDeliveryPerson(String deliveryPerson) {
        this.deliveryPerson = deliveryPerson;
    }

    public String getDeliveryPhone() {
        return deliveryPhone;
    }

    public void setDeliveryPhone(String deliveryPhone) {
        this.deliveryPhone = deliveryPhone;
    }
}
