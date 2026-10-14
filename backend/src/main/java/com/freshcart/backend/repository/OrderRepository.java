package com.freshcart.backend.repository;

import com.freshcart.backend.dto.order.OrderItemResponse;
import com.freshcart.backend.dto.order.OrderResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface OrderRepository {

    Integer checkout(Integer customerId, Integer addressId);

    void cancelOrder(Integer customerId, Integer orderId);

    void processPayment(Integer orderId, String paymentMethod, BigDecimal amount, String transactionReference);

    List<OrderResponse> findOrderHistoryByCustomerId(Integer customerId);

    Optional<OrderResponse> findOrderById(Integer orderId);

    List<OrderItemResponse> findOrderItemsByOrderId(Integer orderId);

    boolean existsById(Integer orderId);
}
