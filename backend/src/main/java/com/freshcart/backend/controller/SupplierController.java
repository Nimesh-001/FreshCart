package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.supplier.CreateSupplierRequest;
import com.freshcart.backend.dto.supplier.SupplierResponse;
import com.freshcart.backend.service.SupplierService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierResponse>> addSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        SupplierResponse response = supplierService.addSupplier(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Supplier added successfully", response));
    }

    @GetMapping("/{supplierId}")
    public ResponseEntity<ApiResponse<SupplierResponse>> getSupplierById(@PathVariable Integer supplierId) {
        SupplierResponse response = supplierService.getSupplierById(supplierId);
        return ResponseEntity.ok(ApiResponse.success("Supplier retrieved successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> getAllSuppliers(
            @RequestParam(required = false) Boolean activeOnly
    ) {
        List<SupplierResponse> response = supplierService.getAllSuppliers(activeOnly);
        return ResponseEntity.ok(ApiResponse.success("Suppliers retrieved successfully", response));
    }
}
