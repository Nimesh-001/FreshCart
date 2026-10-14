package com.freshcart.backend.service;

import com.freshcart.backend.dto.category.CategoryResponse;
import com.freshcart.backend.dto.product.CreateProductRequest;
import com.freshcart.backend.dto.product.ProductPerformanceResponse;
import com.freshcart.backend.dto.product.ProductResponse;
import com.freshcart.backend.dto.product.UpdateProductRequest;
import com.freshcart.backend.exception.DuplicateResourceException;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CategoryRepository;
import com.freshcart.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductServiceImpl(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    @Transactional
    public ProductResponse addProduct(CreateProductRequest request) {
        CategoryResponse category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new IllegalArgumentException("Cannot add product to inactive category: " + category.getCategoryName());
        }

        if (productRepository.existsByName(request.getProductName())) {
            throw new DuplicateResourceException("Product with name '" + request.getProductName() + "' already exists");
        }

        Integer productId = productRepository.addProduct(
                request.getCategoryId(),
                request.getProductName(),
                request.getDescription(),
                request.getPrice(),
                request.getReorderLevel(),
                request.getInitialQuantity()
        );

        return productRepository.findById(productId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created product"));
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Integer productId, UpdateProductRequest request) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        CategoryResponse category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new IllegalArgumentException("Cannot assign product to inactive category: " + category.getCategoryName());
        }

        if (productRepository.existsByNameAndNotId(request.getProductName(), productId)) {
            throw new DuplicateResourceException("Product name '" + request.getProductName() + "' already in use by another product");
        }

        productRepository.updateProduct(
                productId,
                request.getCategoryId(),
                request.getProductName(),
                request.getDescription(),
                request.getPrice(),
                request.getReorderLevel(),
                request.getIsActive()
        );

        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductResponse> searchProducts(String search, Integer categoryId, Boolean activeOnly) {
        return productRepository.searchProducts(search, categoryId, activeOnly);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProductPerformanceResponse> getProductPerformance(Integer productId) {
        if (productId != null && !productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        return productRepository.findProductPerformance(productId);
    }
}
