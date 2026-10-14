package com.freshcart.backend.dto.inventory;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class ReceiveStockRequest {

    @NotNull(message = "Product ID is required")
    @Positive(message = "Product ID must be positive")
    private Integer productId;

    @NotNull(message = "Supplier ID is required")
    @Positive(message = "Supplier ID must be positive")
    private Integer supplierId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Received quantity must be greater than zero")
    private Integer quantity;

    @NotNull(message = "Supplier price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Supplier price must be non-negative")
    private BigDecimal supplierPrice;

    public ReceiveStockRequest() {}

    public ReceiveStockRequest(Integer productId, Integer supplierId, Integer quantity, BigDecimal supplierPrice) {
        this.productId = productId;
        this.supplierId = supplierId;
        this.quantity = quantity;
        this.supplierPrice = supplierPrice;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
        this.supplierId = supplierId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getSupplierPrice() {
        return supplierPrice;
    }

    public void setSupplierPrice(BigDecimal supplierPrice) {
        this.supplierPrice = supplierPrice;
    }
}
