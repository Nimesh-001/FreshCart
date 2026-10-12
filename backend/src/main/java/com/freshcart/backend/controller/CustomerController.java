package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.customer.*;
import com.freshcart.backend.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<CustomerResponse>> registerCustomer(@Valid @RequestBody RegisterCustomerRequest request) {
        CustomerResponse response = customerService.registerCustomer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Customer registered successfully", response));
    }

    @PutMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomerProfile(
            @PathVariable Integer customerId,
            @Valid @RequestBody UpdateCustomerProfileRequest request
    ) {
        CustomerResponse response = customerService.updateCustomerProfile(customerId, request);
        return ResponseEntity.ok(ApiResponse.success("Customer profile updated successfully", response));
    }

    @PostMapping("/{customerId}/addresses")
    public ResponseEntity<ApiResponse<AddressResponse>> addCustomerAddress(
            @PathVariable Integer customerId,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse response = customerService.addCustomerAddress(customerId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Address added successfully", response));
    }

    @PutMapping("/{customerId}/addresses/{addressId}")
    public ResponseEntity<ApiResponse<AddressResponse>> updateCustomerAddress(
            @PathVariable Integer customerId,
            @PathVariable Integer addressId,
            @Valid @RequestBody AddressRequest request
    ) {
        AddressResponse response = customerService.updateCustomerAddress(customerId, addressId, request);
        return ResponseEntity.ok(ApiResponse.success("Address updated successfully", response));
    }

    @GetMapping("/{customerId}/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getCustomerAddresses(@PathVariable Integer customerId) {
        List<AddressResponse> addresses = customerService.getCustomerAddresses(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer addresses retrieved successfully", addresses));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CustomerResponse>>> searchCustomers(
            @RequestParam(required = false) String search
    ) {
        List<CustomerResponse> customers = customerService.searchCustomers(search);
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved successfully", customers));
    }

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomerById(@PathVariable Integer customerId) {
        CustomerResponse customer = customerService.getCustomerById(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer retrieved successfully", customer));
    }

    @GetMapping("/{customerId}/purchase-summary")
    public ResponseEntity<ApiResponse<CustomerPurchaseSummaryResponse>> getCustomerPurchaseSummary(@PathVariable Integer customerId) {
        CustomerPurchaseSummaryResponse summary = customerService.getCustomerPurchaseSummary(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer purchase summary retrieved successfully", summary));
    }
}
