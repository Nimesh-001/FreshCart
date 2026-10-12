package com.freshcart.backend.service;

import com.freshcart.backend.dto.customer.*;

import java.util.List;

public interface CustomerService {

    CustomerResponse registerCustomer(RegisterCustomerRequest request);

    CustomerResponse updateCustomerProfile(Integer customerId, UpdateCustomerProfileRequest request);

    AddressResponse addCustomerAddress(Integer customerId, AddressRequest request);

    AddressResponse updateCustomerAddress(Integer customerId, Integer addressId, AddressRequest request);

    List<AddressResponse> getCustomerAddresses(Integer customerId);

    CustomerResponse getCustomerById(Integer customerId);

    List<CustomerResponse> searchCustomers(String search);

    CustomerPurchaseSummaryResponse getCustomerPurchaseSummary(Integer customerId);
}
