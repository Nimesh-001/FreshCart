package com.freshcart.backend.dto.delivery;

import java.sql.Timestamp;

public class DeliveryResponse {

    private Integer deliveryId;
    private Integer orderId;
    private String deliveryPerson;
    private String deliveryPhone;
    private String deliveryStatus;
    private Timestamp assignedAt;
    private Timestamp deliveredAt;
    private String orderStatus;
    private String message;

    public DeliveryResponse() {}

    public DeliveryResponse(Integer deliveryId, Integer orderId, String deliveryPerson, String deliveryPhone,
                            String deliveryStatus, Timestamp assignedAt, Timestamp deliveredAt,
                            String orderStatus, String message) {
        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.deliveryPerson = deliveryPerson;
        this.deliveryPhone = deliveryPhone;
        this.deliveryStatus = deliveryStatus;
        this.assignedAt = assignedAt;
        this.deliveredAt = deliveredAt;
        this.orderStatus = orderStatus;
        this.message = message;
    }

    public Integer getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Integer deliveryId) {
        this.deliveryId = deliveryId;
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

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public Timestamp getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Timestamp assignedAt) {
        this.assignedAt = assignedAt;
    }

    public Timestamp getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(Timestamp deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
