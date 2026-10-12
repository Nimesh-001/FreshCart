package com.freshcart.backend.repository;

import com.freshcart.backend.dto.customer.AddressResponse;
import com.freshcart.backend.dto.customer.CustomerPurchaseSummaryResponse;
import com.freshcart.backend.dto.customer.CustomerResponse;

import java.util.List;
import java.util.Optional;

public interface CustomerRepository {

    Integer registerCustomer(String username, String passwordHash, String firstName, String lastName, String email, String phone);

    void updateCustomerProfile(Integer customerId, String firstName, String lastName, String email, String phone);

    Integer manageAddress(String action, Integer customerId, Integer addressId, String addressLine, String city, String province, String postalCode, Boolean isDefault);

    List<AddressResponse> findAddressesByCustomerId(Integer customerId);

    Optional<AddressResponse> findAddressByIdAndCustomerId(Integer addressId, Integer customerId);

    Optional<CustomerResponse> findCustomerById(Integer customerId);

    List<CustomerResponse> searchCustomers(String search);

    Optional<CustomerPurchaseSummaryResponse> findPurchaseSummaryByCustomerId(Integer customerId);

    boolean existsById(Integer customerId);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByEmailAndNotCustomerId(String email, Integer customerId);

    boolean existsByPhoneAndNotCustomerId(String phone, Integer customerId);
}
