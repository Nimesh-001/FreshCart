package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.supplier.ProductSupplierRequest;
import com.freshcart.backend.dto.supplier.ProductSupplierResponse;
import com.freshcart.backend.dto.supplier.UpdateProductSupplierRequest;
import com.freshcart.backend.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/suppliers")
public class ProductSupplierController {

    private final SupplierService supplierService;

    public ProductSupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductSupplierResponse>>> getSuppliersByProductId(@PathVariable Integer productId) {
        List<ProductSupplierResponse> response = supplierService.getSuppliersByProductId(productId);
        return ResponseEntity.ok(ApiResponse.success("Product suppliers retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProductSupplierResponse>> assignSupplier(
            @PathVariable Integer productId,
            @Valid @RequestBody ProductSupplierRequest request
    ) {
        ProductSupplierResponse response = supplierService.assignSupplierToProduct(productId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supplier assigned to product successfully", response));
    }

    @PutMapping("/{supplierId}")
    public ResponseEntity<ApiResponse<ProductSupplierResponse>> updateSupplierPrice(
            @PathVariable Integer productId,
            @PathVariable Integer supplierId,
            @Valid @RequestBody UpdateProductSupplierRequest request
    ) {
        ProductSupplierResponse response = supplierService.updateProductSupplier(productId, supplierId, request.getSupplierPrice());
        return ResponseEntity.ok(ApiResponse.success("Product supplier price updated successfully", response));
    }

    @DeleteMapping("/{supplierId}")
    public ResponseEntity<ApiResponse<Void>> removeSupplier(
            @PathVariable Integer productId,
            @PathVariable Integer supplierId
    ) {
        supplierService.removeSupplierFromProduct(productId, supplierId);
        return ResponseEntity.ok(ApiResponse.success("Supplier removed from product successfully", null));
    }
}
