package com.freshcart.backend.service;

import com.freshcart.backend.dto.supplier.CreateSupplierRequest;
import com.freshcart.backend.dto.supplier.ProductSupplierRequest;
import com.freshcart.backend.dto.supplier.ProductSupplierResponse;
import com.freshcart.backend.dto.supplier.SupplierResponse;
import com.freshcart.backend.exception.DuplicateResourceException;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.ProductRepository;
import com.freshcart.backend.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository, ProductRepository productRepository) {
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public SupplierResponse addSupplier(CreateSupplierRequest request) {
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && supplierRepository.existsByEmail(request.getEmail().trim())) {
            throw new DuplicateResourceException("Supplier with email '" + request.getEmail().trim() + "' already exists");
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()
                && supplierRepository.existsByPhone(request.getPhone().trim())) {
            throw new DuplicateResourceException("Supplier with phone '" + request.getPhone().trim() + "' already exists");
        }

        Integer supplierId = supplierRepository.addSupplier(
                request.getSupplierName() != null ? request.getSupplierName().trim() : null,
                request.getContactPerson() != null ? request.getContactPerson().trim() : null,
                request.getEmail() != null ? request.getEmail().trim() : null,
                request.getPhone() != null ? request.getPhone().trim() : null,
                request.getAddress() != null ? request.getAddress().trim() : null
        );

        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve created supplier"));
    }

    @Override
    public SupplierResponse getSupplierById(Integer supplierId) {
        return supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + supplierId));
    }

    @Override
    public List<SupplierResponse> getAllSuppliers(Boolean activeOnly) {
        return supplierRepository.findAll(activeOnly);
    }

    @Override
    @Transactional
    public ProductSupplierResponse assignSupplierToProduct(Integer productId, ProductSupplierRequest request) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        if (!supplierRepository.existsById(request.getSupplierId())) {
            throw new ResourceNotFoundException("Supplier not found with id: " + request.getSupplierId());
        }

        if (supplierRepository.productSupplierExists(productId, request.getSupplierId())) {
            throw new DuplicateResourceException("Product is already assigned to supplier ID: " + request.getSupplierId());
        }

        supplierRepository.manageProductSupplier("ADD", productId, request.getSupplierId(), request.getSupplierPrice());

        return getProductSupplier(productId, request.getSupplierId());
    }

    @Override
    @Transactional
    public ProductSupplierResponse updateProductSupplier(Integer productId, Integer supplierId, BigDecimal supplierPrice) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + supplierId);
        }

        if (!supplierRepository.productSupplierExists(productId, supplierId)) {
            throw new ResourceNotFoundException("Product-supplier link not found for product ID " + productId + " and supplier ID " + supplierId);
        }

        supplierRepository.manageProductSupplier("UPDATE", productId, supplierId, supplierPrice);

        return getProductSupplier(productId, supplierId);
    }

    @Override
    @Transactional
    public void removeSupplierFromProduct(Integer productId, Integer supplierId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        if (!supplierRepository.existsById(supplierId)) {
            throw new ResourceNotFoundException("Supplier not found with id: " + supplierId);
        }

        if (!supplierRepository.productSupplierExists(productId, supplierId)) {
            throw new ResourceNotFoundException("Product-supplier link not found for product ID " + productId + " and supplier ID " + supplierId);
        }

        supplierRepository.manageProductSupplier("REMOVE", productId, supplierId, BigDecimal.ZERO);
    }

    @Override
    public List<ProductSupplierResponse> getSuppliersByProductId(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found with id: " + productId);
        }

        return supplierRepository.findSuppliersByProductId(productId);
    }

    private ProductSupplierResponse getProductSupplier(Integer productId, Integer supplierId) {
        return supplierRepository.findSuppliersByProductId(productId).stream()
                .filter(ps -> ps.getSupplierId().equals(supplierId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("Failed to retrieve product-supplier association"));
    }
}
