package com.freshcart.backend.service;

import com.freshcart.backend.dto.supplier.CreateSupplierRequest;
import com.freshcart.backend.dto.supplier.ProductSupplierRequest;
import com.freshcart.backend.dto.supplier.ProductSupplierResponse;
import com.freshcart.backend.dto.supplier.SupplierResponse;

import java.math.BigDecimal;
import java.util.List;

public interface SupplierService {

    SupplierResponse addSupplier(CreateSupplierRequest request);

    SupplierResponse getSupplierById(Integer supplierId);

    List<SupplierResponse> getAllSuppliers(Boolean activeOnly);

    ProductSupplierResponse assignSupplierToProduct(Integer productId, ProductSupplierRequest request);

    ProductSupplierResponse updateProductSupplier(Integer productId, Integer supplierId, BigDecimal supplierPrice);

    void removeSupplierFromProduct(Integer productId, Integer supplierId);

    List<ProductSupplierResponse> getSuppliersByProductId(Integer productId);
}
