package com.freshcart.backend.dto.payment;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class PaymentResponse {

    private Integer paymentId;
    private Integer orderId;
    private String paymentMethod;
    private BigDecimal amount;
    private String paymentStatus;
    private String transactionReference;
    private Timestamp paymentDate;
    private String orderStatus;
    private Boolean isSimulated;
    private String message;

    public PaymentResponse() {}

    public PaymentResponse(Integer paymentId, Integer orderId, String paymentMethod, BigDecimal amount,
                           String paymentStatus, String transactionReference, Timestamp paymentDate,
                           String orderStatus, Boolean isSimulated, String message) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.paymentStatus = paymentStatus;
        this.transactionReference = transactionReference;
        this.paymentDate = paymentDate;
        this.orderStatus = orderStatus;
        this.isSimulated = isSimulated;
        this.message = message;
    }

    public Integer getPaymentId() {
        return paymentId;
    }

    public void setPaymentId(Integer paymentId) {
        this.paymentId = paymentId;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
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

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public Boolean getIsSimulated() {
        return isSimulated;
    }

    public void setIsSimulated(Boolean simulated) {
        isSimulated = simulated;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
