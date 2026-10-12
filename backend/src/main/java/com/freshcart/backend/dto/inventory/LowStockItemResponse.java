package com.freshcart.backend.dto.inventory;

public class LowStockItemResponse {

    private Integer productId;
    private String productName;
    private Integer quantity;
    private Integer reorderLevel;
    private String stockStatus;

    public LowStockItemResponse() {
    }

    public LowStockItemResponse(Integer productId, String productName, Integer quantity, Integer reorderLevel, String stockStatus) {
        this.productId = productId;
        this.productName = productName;
        this.quantity = quantity;
        this.reorderLevel = reorderLevel;
        this.stockStatus = stockStatus;
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

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getReorderLevel() {
        return reorderLevel;
    }

    public void setReorderLevel(Integer reorderLevel) {
        this.reorderLevel = reorderLevel;
    }

    public String getStockStatus() {
        return stockStatus;
    }

    public void setStockStatus(String stockStatus) {
        this.stockStatus = stockStatus;
    }
}
