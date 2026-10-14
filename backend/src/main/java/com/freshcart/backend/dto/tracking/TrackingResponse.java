package com.freshcart.backend.dto.tracking;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class TrackingResponse {

    private Integer orderId;
    private Integer customerId;
    private Timestamp orderDate;
    private String orderStatus;
    private BigDecimal totalAmount;

    private Integer paymentId;
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal paymentAmount;
    private String transactionReference;
    private Timestamp paymentDate;
    private Boolean isSimulatedPayment;

    private Integer deliveryId;
    private String deliveryPerson;
    private String deliveryPhone;
    private String deliveryStatus;
    private Timestamp assignedAt;
    private Timestamp deliveredAt;

    public TrackingResponse() {}

    public TrackingResponse(Integer orderId, Integer customerId, Timestamp orderDate, String orderStatus, BigDecimal totalAmount,
                            Integer paymentId, String paymentMethod, String paymentStatus, BigDecimal paymentAmount,
                            String transactionReference, Timestamp paymentDate, Boolean isSimulatedPayment,
                            Integer deliveryId, String deliveryPerson, String deliveryPhone, String deliveryStatus,
                            Timestamp assignedAt, Timestamp deliveredAt) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.orderDate = orderDate;
        this.orderStatus = orderStatus;
        this.totalAmount = totalAmount;
        this.paymentId = paymentId;
        this.paymentMethod = paymentMethod;
        this.paymentStatus = paymentStatus;
        this.paymentAmount = paymentAmount;
        this.transactionReference = transactionReference;
        this.paymentDate = paymentDate;
        this.isSimulatedPayment = isSimulatedPayment;
        this.deliveryId = deliveryId;
        this.deliveryPerson = deliveryPerson;
        this.deliveryPhone = deliveryPhone;
        this.deliveryStatus = deliveryStatus;
        this.assignedAt = assignedAt;
        this.deliveredAt = deliveredAt;
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

    public Timestamp getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Timestamp orderDate) {
        this.orderDate = orderDate;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public BigDecimal getPaymentAmount() {
        return paymentAmount;
    }

    public void setPaymentAmount(BigDecimal paymentAmount) {
        this.paymentAmount = paymentAmount;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public Timestamp getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(Timestamp paymentDate) {
        this.paymentDate = paymentDate;
    }

    public Boolean getIsSimulatedPayment() {
        return isSimulatedPayment;
    }

    public void setIsSimulatedPayment(Boolean simulatedPayment) {
        isSimulatedPayment = simulatedPayment;
    }

    public Integer getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Integer deliveryId) {
        this.deliveryId = deliveryId;
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
}
