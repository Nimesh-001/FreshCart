package com.freshcart.backend.dto.payment;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class RefundResponse {

    private Integer orderId;
    private Integer paymentId;
    private BigDecimal refundAmount;
    private String paymentStatus;
    private String orderStatus;
    private Timestamp refundDate;
    private String message;

    public RefundResponse() {}

    public RefundResponse(Integer orderId, Integer paymentId, BigDecimal refundAmount, String paymentStatus, String orderStatus, Timestamp refundDate, String message) {
        this.orderId = orderId;
        this.paymentId = paymentId;
        this.refundAmount = refundAmount;
        this.paymentStatus = paymentStatus;
        this.orderStatus = orderStatus;
        this.refundDate = refundDate;
        this.message = message;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public BigDecimal getRefundAmount() {
        return refundAmount;
    }

    public void setRefundAmount(BigDecimal refundAmount) {
        this.refundAmount = refundAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public Timestamp getRefundDate() {
        return refundDate;
    }

    public void setRefundDate(Timestamp refundDate) {
        this.refundDate = refundDate;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
