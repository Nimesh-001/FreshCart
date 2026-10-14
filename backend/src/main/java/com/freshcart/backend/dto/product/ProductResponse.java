package com.freshcart.backend.dto.product;

import java.math.BigDecimal;
import java.sql.Timestamp;

public class ProductResponse {

    private Integer productId;
    private Integer categoryId;
    private String categoryName;
    private String productName;
    private String description;
    private BigDecimal price;
    private Integer reorderLevel;
    private Integer stockQuantity;
    private String stockStatus;
    private Boolean isActive;
    private Timestamp createdAt;

    public ProductResponse() {}

    public ProductResponse(Integer productId, Integer categoryId, String categoryName, String productName, String description, BigDecimal price, Integer reorderLevel, Integer stockQuantity, String stockStatus, Boolean isActive, Timestamp createdAt) {
        this.productId = productId;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.productName = productName;
        this.description = description;
        this.price = price;
        this.reorderLevel = reorderLevel;
        this.stockQuantity = stockQuantity;
        this.stockStatus = stockStatus;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
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

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
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

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
