package com.freshcart.backend.dto.product;

import java.math.BigDecimal;

public class ProductPerformanceResponse {

    private Integer productId;
    private String productName;
    private Integer categoryId;
    private String categoryName;
    private BigDecimal price;
    private Boolean isActive;
    private Integer stockQuantity;
    private String stockStatus;
    private Long unitsSold;
    private BigDecimal salesRevenue;

    public ProductPerformanceResponse() {}

    public ProductPerformanceResponse(Integer productId, String productName, Integer categoryId, String categoryName, BigDecimal price, Boolean isActive, Integer stockQuantity, String stockStatus, Long unitsSold, BigDecimal salesRevenue) {
        this.productId = productId;
        this.productName = productName;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.price = price;
        this.isActive = isActive;
        this.stockQuantity = stockQuantity;
        this.stockStatus = stockStatus;
        this.unitsSold = unitsSold;
        this.salesRevenue = salesRevenue;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public Integer getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Integer categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Integer getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(Integer stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }

    public Long getUnitsSold() {
        return unitsSold;
    }

    public void setUnitsSold(Long unitsSold) {
        this.unitsSold = unitsSold;
    }

    public BigDecimal getSalesRevenue() {
        return salesRevenue;
    }

    public void setSalesRevenue(BigDecimal salesRevenue) {
        this.salesRevenue = salesRevenue;
    }
}
