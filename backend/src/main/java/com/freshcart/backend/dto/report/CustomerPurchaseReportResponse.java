package com.freshcart.backend.dto.report;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;

public class CustomerPurchaseReportResponse {

    private Integer customerId;
    private String firstName;
    private String lastName;
    private String email;
    private Long totalOrders;
    private BigDecimal totalPurchaseAmount;
    private Timestamp lastOrderDate;
    private BigDecimal averageOrderValue;

    public CustomerPurchaseReportResponse() {}

    public CustomerPurchaseReportResponse(Integer customerId, String firstName, String lastName, String email,
                                          Long totalOrders, BigDecimal totalPurchaseAmount, Timestamp lastOrderDate) {
        this.customerId = customerId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.totalOrders = totalOrders;
        this.totalPurchaseAmount = totalPurchaseAmount;
        this.lastOrderDate = lastOrderDate;
        if (totalOrders != null && totalOrders > 0 && totalPurchaseAmount != null) {
            this.averageOrderValue = totalPurchaseAmount.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        } else {
            this.averageOrderValue = BigDecimal.ZERO;
        }
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
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
        calculateAverageOrderValue();
    }

    public BigDecimal getTotalPurchaseAmount() {
        return totalPurchaseAmount;
    }

    public void setTotalPurchaseAmount(BigDecimal totalPurchaseAmount) {
        this.totalPurchaseAmount = totalPurchaseAmount;
        calculateAverageOrderValue();
    }

    public Timestamp getLastOrderDate() {
        return lastOrderDate;
    }

    public void setLastOrderDate(Timestamp lastOrderDate) {
        this.lastOrderDate = lastOrderDate;
    }

    public BigDecimal getAverageOrderValue() {
        return averageOrderValue;
    }

    public void setAverageOrderValue(BigDecimal averageOrderValue) {
        this.averageOrderValue = averageOrderValue;
    }

    private void calculateAverageOrderValue() {
        if (this.totalOrders != null && this.totalOrders > 0 && this.totalPurchaseAmount != null) {
            this.averageOrderValue = this.totalPurchaseAmount.divide(BigDecimal.valueOf(this.totalOrders), 2, RoundingMode.HALF_UP);
        } else {
            this.averageOrderValue = BigDecimal.ZERO;
        }
    }
}
