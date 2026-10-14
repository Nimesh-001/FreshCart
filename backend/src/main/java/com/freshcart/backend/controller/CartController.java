package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.cart.AddToCartRequest;
import com.freshcart.backend.dto.cart.CartResponse;
import com.freshcart.backend.dto.cart.UpdateCartItemRequest;
import com.freshcart.backend.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(@Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addItemToCart(request);
        return ResponseEntity.ok(ApiResponse.success("Product added to cart successfully", response));
    }

    @PutMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(@Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse response = cartService.updateCartItem(request);
        return ResponseEntity.ok(ApiResponse.success("Cart item updated successfully", response));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @PathVariable Integer productId,
            @RequestParam Integer customerId
    ) {
        CartResponse response = cartService.removeCartItem(customerId, productId);
        return ResponseEntity.ok(ApiResponse.success("Cart item removed successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getActiveCart(@RequestParam Integer customerId) {
        CartResponse response = cartService.getActiveCart(customerId);
        return ResponseEntity.ok(ApiResponse.success("Cart retrieved successfully", response));
    }
}
