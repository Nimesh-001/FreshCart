package com.freshcart.backend.dto.report;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class CustomerPurchaseSummaryResponse {

    private Integer customerId;
    private String fullName;
    private String email;
    private Long totalOrders;
    private BigDecimal completedOrPaidOrderValue;
    private Timestamp latestOrderDate;

    public CustomerPurchaseSummaryResponse() {}

    public CustomerPurchaseSummaryResponse(Integer customerId, String fullName, String email, Long totalOrders,
                                           BigDecimal completedOrPaidOrderValue, Timestamp latestOrderDate) {
        this.customerId = customerId;
        this.fullName = fullName;
        this.email = email;
        this.totalOrders = totalOrders;
        this.completedOrPaidOrderValue = completedOrPaidOrderValue;
        this.latestOrderDate = latestOrderDate;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public BigDecimal getCompletedOrPaidOrderValue() {
        return completedOrPaidOrderValue;
    }

    public void setCompletedOrPaidOrderValue(BigDecimal completedOrPaidOrderValue) {
        this.completedOrPaidOrderValue = completedOrPaidOrderValue;
    }

    public Timestamp getLatestOrderDate() {
        return latestOrderDate;
    }

    public void setLatestOrderDate(Timestamp latestOrderDate) {
        this.latestOrderDate = latestOrderDate;
    }
}
