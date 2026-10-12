package com.freshcart.backend.dto.supplier;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public class ProductSupplierRequest {

    @NotNull(message = "Supplier ID is required")
    @Positive(message = "Supplier ID must be positive")
    private Integer supplierId;

    @NotNull(message = "Supplier price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Supplier price must be non-negative")
    private BigDecimal supplierPrice;

    public ProductSupplierRequest() {}

    public ProductSupplierRequest(Integer supplierId, BigDecimal supplierPrice) {
        this.supplierId = supplierId;
        this.supplierPrice = supplierPrice;
    }

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
        this.supplierId = supplierId;
    }

    public BigDecimal getSupplierPrice() {
        return supplierPrice;
    }

    public void setSupplierPrice(BigDecimal supplierPrice) {
        this.supplierPrice = supplierPrice;
    }
}
