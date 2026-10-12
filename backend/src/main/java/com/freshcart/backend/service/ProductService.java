package com.freshcart.backend.service;

import com.freshcart.backend.dto.product.CreateProductRequest;
import com.freshcart.backend.dto.product.ProductPerformanceResponse;
import com.freshcart.backend.dto.product.ProductResponse;
import com.freshcart.backend.dto.product.UpdateProductRequest;

import java.util.List;

public interface ProductService {

    ProductResponse addProduct(CreateProductRequest request);

    ProductResponse updateProduct(Integer productId, UpdateProductRequest request);

    ProductResponse getProductById(Integer productId);

    List<ProductResponse> searchProducts(String search, Integer categoryId, Boolean activeOnly);

    List<ProductPerformanceResponse> getProductPerformance(Integer productId);
}
