package com.freshcart.backend.controller;

import com.freshcart.backend.common.ApiResponse;
import com.freshcart.backend.dto.order.CancelOrderRequest;
import com.freshcart.backend.dto.order.CheckoutRequest;
import com.freshcart.backend.dto.order.OrderResponse;
import com.freshcart.backend.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<OrderResponse>> checkout(@Valid @RequestBody CheckoutRequest request) {
        OrderResponse response = orderService.checkout(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Order placed successfully", response));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(
            @PathVariable Integer orderId,
            @RequestParam(required = false) Integer customerId,
            @RequestBody(required = false) CancelOrderRequest request
    ) {
        Integer effectiveCustomerId = request != null && request.getCustomerId() != null
                ? request.getCustomerId()
                : customerId;

        if (effectiveCustomerId == null) {
            throw new IllegalArgumentException("Customer ID is required to cancel an order");
        }

        OrderResponse response = orderService.cancelOrder(effectiveCustomerId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrderHistory(@RequestParam Integer customerId) {
        List<OrderResponse> response = orderService.getOrderHistory(customerId);
        return ResponseEntity.ok(ApiResponse.success("Order history retrieved successfully", response));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(
            @PathVariable Integer orderId,
            @RequestParam Integer customerId
    ) {
        OrderResponse response = orderService.getOrderById(customerId, orderId);
        return ResponseEntity.ok(ApiResponse.success("Order details retrieved successfully", response));
    }
}
