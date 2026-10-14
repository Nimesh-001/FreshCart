package com.freshcart.backend.repository;

import com.freshcart.backend.dto.supplier.ProductSupplierResponse;
import com.freshcart.backend.dto.supplier.SupplierResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SupplierRepository {

    Integer addSupplier(String supplierName, String contactPerson, String email, String phone, String address);

    void manageProductSupplier(String action, Integer productId, Integer supplierId, BigDecimal supplierPrice);

    Optional<SupplierResponse> findById(Integer supplierId);

    List<SupplierResponse> findAll(Boolean activeOnly);

    List<ProductSupplierResponse> findSuppliersByProductId(Integer productId);

    boolean existsById(Integer supplierId);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean productSupplierExists(Integer productId, Integer supplierId);
}
