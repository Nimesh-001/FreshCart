package com.freshcart.backend.service;

import com.freshcart.backend.dto.cart.AddToCartRequest;
import com.freshcart.backend.dto.cart.CartResponse;
import com.freshcart.backend.dto.cart.UpdateCartItemRequest;

public interface CartService {

    CartResponse addItemToCart(AddToCartRequest request);

    CartResponse updateCartItem(UpdateCartItemRequest request);

    CartResponse removeCartItem(Integer customerId, Integer productId);

    CartResponse getActiveCart(Integer customerId);
}
