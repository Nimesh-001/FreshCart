package com.freshcart.backend.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class ProcessPaymentRequest {

    @NotNull(message = "Order ID is required")
    @Positive(message = "Order ID must be positive")
    private Integer orderId;

    private Integer customerId;

    @NotBlank(message = "Payment method is required")
    @Pattern(regexp = "^(?i)(CASH_ON_DELIVERY|CARD|ONLINE)$", message = "Payment method must be CASH_ON_DELIVERY, CARD, or ONLINE")
    private String paymentMethod;

    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.00", message = "Payment amount must be non-negative")
    private BigDecimal amount;

    private String transactionReference;

    public ProcessPaymentRequest() {}

    public ProcessPaymentRequest(Integer orderId, Integer customerId, String paymentMethod, BigDecimal amount, String transactionReference) {
        this.orderId = orderId;
        this.customerId = customerId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.transactionReference = transactionReference;
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

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }
}
