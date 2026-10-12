package com.freshcart.backend.repository;

import com.freshcart.backend.dto.cart.CartItemResponse;
import com.freshcart.backend.dto.cart.CartResponse;

import java.util.List;
import java.util.Optional;

public interface CartRepository {

    void addItem(Integer customerId, Integer productId, Integer quantity);

    void updateItem(Integer customerId, Integer productId, Integer quantity);

    Optional<CartResponse> findActiveCartByCustomerId(Integer customerId);

    Optional<Integer> findActiveCartIdByCustomerId(Integer customerId);

    List<CartItemResponse> findCartItems(Integer cartId);
}
