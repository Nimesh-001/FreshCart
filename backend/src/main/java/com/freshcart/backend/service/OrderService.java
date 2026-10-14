package com.freshcart.backend.service;

import com.freshcart.backend.dto.order.CheckoutRequest;
import com.freshcart.backend.dto.order.OrderResponse;

import java.util.List;

public interface OrderService {

    OrderResponse checkout(CheckoutRequest request);

    OrderResponse cancelOrder(Integer customerId, Integer orderId);

    List<OrderResponse> getOrderHistory(Integer customerId);

    OrderResponse getOrderById(Integer customerId, Integer orderId);
}
