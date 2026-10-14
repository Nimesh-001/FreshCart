package com.freshcart.backend.service;

import com.freshcart.backend.dto.cart.AddToCartRequest;
import com.freshcart.backend.dto.cart.CartItemResponse;
import com.freshcart.backend.dto.cart.CartResponse;
import com.freshcart.backend.dto.cart.UpdateCartItemRequest;
import com.freshcart.backend.dto.product.ProductResponse;
import com.freshcart.backend.exception.ResourceNotFoundException;
import com.freshcart.backend.repository.CartRepository;
import com.freshcart.backend.repository.CustomerRepository;
import com.freshcart.backend.repository.InventoryRepository;
import com.freshcart.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    // Concurrency guard: Prevents two simultaneous requests for the same customer
    // from racing to create duplicate active carts before row-level locking can engage.
    private final ConcurrentHashMap<Integer, Object> customerLocks = new ConcurrentHashMap<>();

    public CartServiceImpl(CartRepository cartRepository,
                           CustomerRepository customerRepository,
                           ProductRepository productRepository,
                           InventoryRepository inventoryRepository) {
        this.cartRepository = cartRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.inventoryRepository = inventoryRepository;
    }

    private Object getCustomerLock(Integer customerId) {
        return customerLocks.computeIfAbsent(customerId, k -> new Object());
    }

    @Override
    public CartResponse addItemToCart(AddToCartRequest request) {
        if (!customerRepository.existsById(request.getCustomerId())) {
            throw new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId());
        }

        ProductResponse product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!Boolean.TRUE.equals(product.getIsActive())) {
            throw new IllegalArgumentException("Cannot add inactive product to cart: " + product.getProductName());
        }

        Integer currentStock = inventoryRepository.getCurrentStock(request.getProductId());
        if (currentStock <= 0) {
            throw new IllegalArgumentException("Product is out of stock: " + product.getProductName());
        }

        synchronized (getCustomerLock(request.getCustomerId())) {
            cartRepository.addItem(request.getCustomerId(), request.getProductId(), request.getQuantity());
        }

        return getActiveCart(request.getCustomerId());
    }

    @Override
    public CartResponse updateCartItem(UpdateCartItemRequest request) {
        if (!customerRepository.existsById(request.getCustomerId())) {
            throw new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId());
        }

        if (!productRepository.existsById(request.getProductId())) {
            throw new ResourceNotFoundException("Product not found with id: " + request.getProductId());
        }

        CartResponse activeCart = cartRepository.findActiveCartByCustomerId(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Active cart not found for customer: " + request.getCustomerId()));

        boolean itemInCart = activeCart.getItems().stream()
                .anyMatch(item -> item.getProductId().equals(request.getProductId()));
        if (!itemInCart) {
            throw new ResourceNotFoundException("Product is not in the cart");
        }

        if (request.getQuantity() > 0) {
            Integer availableStock = inventoryRepository.getCurrentStock(request.getProductId());
            if (request.getQuantity() > availableStock) {
                throw new IllegalArgumentException("Requested quantity (" + request.getQuantity() +
                        ") exceeds available stock (" + availableStock + ")");
            }
        }

        synchronized (getCustomerLock(request.getCustomerId())) {
            cartRepository.updateItem(request.getCustomerId(), request.getProductId(), request.getQuantity());
        }

        return getActiveCart(request.getCustomerId());
    }

    @Override
    public CartResponse removeCartItem(Integer customerId, Integer productId) {
        return updateCartItem(new UpdateCartItemRequest(customerId, productId, 0));
    }

    @Override
    public CartResponse getActiveCart(Integer customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with id: " + customerId);
        }

        return cartRepository.findActiveCartByCustomerId(customerId)
                .orElseGet(() -> createEmptyCartResponse(customerId));
    }

    private CartResponse createEmptyCartResponse(Integer customerId) {
        return new CartResponse(
                null,
                customerId,
                "ACTIVE",
                new ArrayList<>(),
                0,
                0,
                BigDecimal.ZERO,
                null
        );
    }
}
