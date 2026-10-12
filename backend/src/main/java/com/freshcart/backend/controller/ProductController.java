package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.product.CreateProductRequest;
import com.freshcart.backend.dto.product.ProductPerformanceResponse;
import com.freshcart.backend.dto.product.ProductResponse;
import com.freshcart.backend.dto.product.UpdateProductRequest;
import com.freshcart.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> addProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.addProduct(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Product added successfully", response));
    }

    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Integer productId,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductResponse response = productService.updateProduct(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @GetMapping("/performance")
    public ResponseEntity<ApiResponse<List<ProductPerformanceResponse>>> getAllProductPerformance() {
        List<ProductPerformanceResponse> performance = productService.getProductPerformance(null);
        return ResponseEntity.ok(ApiResponse.success("Product performance retrieved successfully", performance));
    }

    @GetMapping("/{productId}/performance")
    public ResponseEntity<ApiResponse<List<ProductPerformanceResponse>>> getSingleProductPerformance(@PathVariable Integer productId) {
        List<ProductPerformanceResponse> performance = productService.getProductPerformance(productId);
        return ResponseEntity.ok(ApiResponse.success("Product performance retrieved successfully", performance));
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Integer productId) {
        ProductResponse response = productService.getProductById(productId);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Boolean activeOnly
    ) {
        List<ProductResponse> products = productService.searchProducts(search, categoryId, activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products));
    }
}
