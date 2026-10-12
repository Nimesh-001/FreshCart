package com.freshcart.backend.dto.supplier;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class UpdateProductSupplierRequest {

    @NotNull(message = "Supplier price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Supplier price must be non-negative")
    private BigDecimal supplierPrice;

    public UpdateProductSupplierRequest() {}

    public UpdateProductSupplierRequest(BigDecimal supplierPrice) {
        this.supplierPrice = supplierPrice;
    }

    public BigDecimal getSupplierPrice() {
        return supplierPrice;
    }

    public void setSupplierPrice(BigDecimal supplierPrice) {
        this.supplierPrice = supplierPrice;
    }
}
