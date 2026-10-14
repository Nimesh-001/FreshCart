package com.freshcart.backend.service;

import com.freshcart.backend.dto.customer.*;
import com.freshcart.backend.exception.DuplicateResourceException;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CustomerRepository;
import com.freshcart.backend.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public CustomerResponse registerCustomer(RegisterCustomerRequest request) {
        if (customerRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already in use: " + request.getUsername());
        }
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already in use: " + request.getEmail());
        }
        if (customerRepository.existsByPhone(request.getPhone())) {
            throw new DuplicateResourceException("Phone number already in use: " + request.getPhone());
        }

        String passwordHash = PasswordUtil.hashPassword(request.getPassword());

        Integer customerId = customerRepository.registerCustomer(
                request.getUsername(),
                passwordHash,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone()
        );

        return customerRepository.findCustomerById(customerId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve registered customer details"));
    }

    @Override
    @Transactional
    public CustomerResponse updateCustomerProfile(Integer customerId, UpdateCustomerProfileRequest request) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        if (customerRepository.existsByEmailAndNotCustomerId(request.getEmail(), customerId)) {
            throw new DuplicateResourceException("Email already in use by another account: " + request.getEmail());
        }
        if (customerRepository.existsByPhoneAndNotCustomerId(request.getPhone(), customerId)) {
            throw new DuplicateResourceException("Phone number already in use by another account: " + request.getPhone());
        }

        customerRepository.updateCustomerProfile(
                customerId,
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getPhone()
        );

        return customerRepository.findCustomerById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));
    }

    @Override
    @Transactional
    public AddressResponse addCustomerAddress(Integer customerId, AddressRequest request) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        Integer addressId = customerRepository.manageAddress(
                "ADD",
                customerId,
                null,
                request.getAddressLine(),
                request.getCity(),
                request.getProvince(),
                request.getPostalCode(),
                request.getIsDefault()
        );

        return customerRepository.findAddressByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created address details"));
    }

    @Override
    @Transactional
    public AddressResponse updateCustomerAddress(Integer customerId, Integer addressId, AddressRequest request) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        if (customerRepository.findAddressByIdAndCustomerId(addressId, customerId).isEmpty()) {
            throw new ResourceNotFoundException("Address with id " + addressId + " does not belong to customer " + customerId);
        }

        customerRepository.manageAddress(
                "UPDATE",
                customerId,
                addressId,
                request.getAddressLine(),
                request.getCity(),
                request.getProvince(),
                request.getPostalCode(),
                request.getIsDefault()
        );

        return customerRepository.findAddressByIdAndCustomerId(addressId, customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AddressResponse> getCustomerAddresses(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }
        return customerRepository.findAddressesByCustomerId(customerId);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerResponse getCustomerById(Integer customerId) {
        CustomerResponse customer = customerRepository.findCustomerById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + customerId));

        List<AddressResponse> addresses = customerRepository.findAddressesByCustomerId(customerId);
        customer.setAddresses(addresses);
        return customer;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CustomerResponse> searchCustomers(String search) {
        String query = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        return customerRepository.searchCustomers(query);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerPurchaseSummaryResponse getCustomerPurchaseSummary(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return customerRepository.findPurchaseSummaryByCustomerId(customerId)
                .orElseGet(() -> {
                    CustomerResponse c = customerRepository.findCustomerById(customerId).orElse(null);
                    return new CustomerPurchaseSummaryResponse(
                            customerId,
                            c != null ? c.getFullName() : "",
                            c != null ? c.getEmail() : "",
                            0L,
                            BigDecimal.ZERO,
                            null
                    );
                });
    }
}
