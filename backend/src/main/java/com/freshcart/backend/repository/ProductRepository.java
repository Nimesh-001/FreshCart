package com.freshcart.backend.repository;

import com.freshcart.backend.dto.product.ProductPerformanceResponse;
import com.freshcart.backend.dto.product.ProductResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ProductRepository {

    Integer addProduct(Integer categoryId, String productName, String description, BigDecimal price, Integer reorderLevel, Integer initialQuantity);

    void updateProduct(Integer productId, Integer categoryId, String productName, String description, BigDecimal price, Integer reorderLevel, Boolean isActive);

    Optional<ProductResponse> findById(Integer productId);

    List<ProductResponse> searchProducts(String search, Integer categoryId, Boolean activeOnly);

    List<ProductPerformanceResponse> findProductPerformance(Integer productId);

    boolean existsById(Integer productId);

    boolean existsByName(String productName);

    boolean existsByNameAndNotId(String productName, Integer productId);
}
